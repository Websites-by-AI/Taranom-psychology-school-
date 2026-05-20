import { Router, type IRouter } from "express";
import { eq, desc, sql } from "drizzle-orm";
import {
  db,
  studentsTable,
  dailyRecordsTable,
  questionsBankTable,
  settingsTable,
} from "@workspace/db";
import {
  AdminLoginBody,
  AdminLoginResponse,
  ListStudentsResponse,
  ListQuestionsResponse,
  CreateQuestionBody,
  DeleteQuestionParams,
  GetSettingsResponse,
  UpdateSettingsBody,
  UpdateSettingsResponse,
  GetAdminOverviewResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

const ADMIN_TOKEN = "taranom-admin-token";

async function getSetting(key: string, defaultValue: string): Promise<string> {
  const row = await db
    .select()
    .from(settingsTable)
    .where(eq(settingsTable.settingKey, key))
    .then((r) => r[0]);
  return row?.settingValue ?? defaultValue;
}

async function setSetting(key: string, value: string): Promise<void> {
  await db
    .insert(settingsTable)
    .values({ settingKey: key, settingValue: value, updatedAt: new Date() })
    .onConflictDoUpdate({
      target: settingsTable.settingKey,
      set: { settingValue: value, updatedAt: new Date() },
    });
}

function isAdmin(req: { headers: Record<string, string | string[] | undefined> }): boolean {
  const token = req.headers["x-admin-token"] as string | undefined;
  return token === ADMIN_TOKEN;
}

router.post("/admin/login", async (req, res): Promise<void> => {
  const parsed = AdminLoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const storedPassword = await getSetting("admin_password", "TaranomAdmin123");

  if (parsed.data.password !== storedPassword) {
    res.status(401).json({ error: "Invalid password" });
    return;
  }

  res.json(AdminLoginResponse.parse({ success: true, token: ADMIN_TOKEN }));
});

router.get("/admin/students", async (req, res): Promise<void> => {
  if (!isAdmin(req)) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const students = await db
    .select()
    .from(studentsTable)
    .orderBy(desc(studentsTable.createdAt));

  res.json(
    ListStudentsResponse.parse(
      students.map((s) => ({
        id: s.id,
        nationalCode: s.nationalCode,
        fullName: s.fullName,
        grade: s.grade,
        schoolName: s.schoolName,
        createdAt: s.createdAt.toISOString(),
        lastLogin: s.lastLogin?.toISOString() ?? null,
      }))
    )
  );
});

router.get("/admin/questions", async (req, res): Promise<void> => {
  if (!isAdmin(req)) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const questions = await db.select().from(questionsBankTable);

  res.json(
    ListQuestionsResponse.parse(
      questions.map((q) => ({
        id: q.id,
        subject: q.subject,
        topic: q.topic,
        difficulty: q.difficulty,
        text: q.text,
        optionA: q.optionA,
        optionB: q.optionB,
        optionC: q.optionC,
        optionD: q.optionD,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
      }))
    )
  );
});

router.post("/admin/questions", async (req, res): Promise<void> => {
  if (!isAdmin(req)) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const parsed = CreateQuestionBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [q] = await db.insert(questionsBankTable).values(parsed.data).returning();

  res.status(201).json({
    id: q.id,
    subject: q.subject,
    topic: q.topic,
    difficulty: q.difficulty,
    text: q.text,
    optionA: q.optionA,
    optionB: q.optionB,
    optionC: q.optionC,
    optionD: q.optionD,
    correctAnswer: q.correctAnswer,
    explanation: q.explanation,
  });
});

router.delete("/admin/questions/:id", async (req, res): Promise<void> => {
  if (!isAdmin(req)) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);

  const params = DeleteQuestionParams.safeParse({ id });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [deleted] = await db
    .delete(questionsBankTable)
    .where(eq(questionsBankTable.id, id))
    .returning();

  if (!deleted) {
    res.status(404).json({ error: "Question not found" });
    return;
  }

  res.sendStatus(204);
});

router.get("/admin/settings", async (req, res): Promise<void> => {
  if (!isAdmin(req)) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const aiModel = await getSetting("ai_model", "gemini-2.5-flash");
  const minResponseLength = await getSetting("min_response_length", "1200");

  res.json(
    GetSettingsResponse.parse({
      aiModel,
      minResponseLength: parseInt(minResponseLength, 10),
      adminPassword: null,
    })
  );
});

router.patch("/admin/settings", async (req, res): Promise<void> => {
  if (!isAdmin(req)) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const parsed = UpdateSettingsBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { aiModel, minResponseLength, adminPassword } = parsed.data;

  if (aiModel != null) await setSetting("ai_model", aiModel);
  if (minResponseLength != null) await setSetting("min_response_length", String(minResponseLength));
  if (adminPassword != null) await setSetting("admin_password", adminPassword);

  const updatedModel = await getSetting("ai_model", "gemini-2.5-flash");
  const updatedMinLen = await getSetting("min_response_length", "1200");

  res.json(
    UpdateSettingsResponse.parse({
      aiModel: updatedModel,
      minResponseLength: parseInt(updatedMinLen, 10),
      adminPassword: null,
    })
  );
});

router.get("/admin/overview", async (req, res): Promise<void> => {
  if (!isAdmin(req)) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const [{ count: totalStudents }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(studentsTable);

  const [{ count: totalRecords }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(dailyRecordsTable);

  const riskRows = await db
    .select({
      riskLevel: dailyRecordsTable.riskLevel,
      count: sql<number>`count(*)::int`,
    })
    .from(dailyRecordsTable)
    .groupBy(dailyRecordsTable.riskLevel);

  const riskBreakdown = { green: 0, yellow: 0, orange: 0, red: 0 };
  for (const row of riskRows) {
    if (row.riskLevel === "green") riskBreakdown.green = row.count;
    else if (row.riskLevel === "yellow") riskBreakdown.yellow = row.count;
    else if (row.riskLevel === "orange") riskBreakdown.orange = row.count;
    else if (row.riskLevel === "red") riskBreakdown.red = row.count;
  }

  const recentStudents = await db
    .select()
    .from(studentsTable)
    .orderBy(desc(studentsTable.createdAt))
    .limit(5);

  res.json(
    GetAdminOverviewResponse.parse({
      totalStudents,
      totalRecords,
      riskBreakdown,
      recentStudents: recentStudents.map((s) => ({
        id: s.id,
        nationalCode: s.nationalCode,
        fullName: s.fullName,
        grade: s.grade,
        schoolName: s.schoolName,
        createdAt: s.createdAt.toISOString(),
        lastLogin: s.lastLogin?.toISOString() ?? null,
      })),
    })
  );
});

export default router;
