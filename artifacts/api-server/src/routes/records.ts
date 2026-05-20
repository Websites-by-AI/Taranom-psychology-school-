import { Router, type IRouter } from "express";
import { eq, desc, and } from "drizzle-orm";
import { db, studentsTable, dailyRecordsTable } from "@workspace/db";
import {
  ListRecordsQueryParams,
  ListRecordsResponse,
  CreateRecordBody,
  GetRecordParams,
  GetRecordResponse,
  ExtractFromTextBody,
  ExtractFromTextResponse,
} from "@workspace/api-zod";
import { extractFromText } from "../lib/ai";

const router: IRouter = Router();

async function getStudentIdFromReq(req: { headers: Record<string, string | string[] | undefined> }): Promise<number | null> {
  const nationalCode = req.headers["x-national-code"] as string | undefined;
  if (!nationalCode) return null;
  const student = await db
    .select()
    .from(studentsTable)
    .where(eq(studentsTable.nationalCode, nationalCode))
    .then((r) => r[0]);
  return student?.id ?? null;
}

function mapRecord(r: typeof dailyRecordsTable.$inferSelect) {
  return {
    id: r.id,
    studentId: r.studentId,
    recordDate: r.recordDate,
    mathScore: r.mathScore,
    physicsScore: r.physicsScore,
    chemistryScore: r.chemistryScore,
    biologyScore: r.biologyScore,
    anxietyLevel: r.anxietyLevel,
    sleepHours: r.sleepHours,
    focusDrop: r.focusDrop,
    socialInteraction: r.socialInteraction,
    examDaysLeft: r.examDaysLeft,
    freeText: r.freeText,
    riskLevel: r.riskLevel,
    createdAt: r.createdAt.toISOString(),
  };
}

router.get("/records", async (req, res): Promise<void> => {
  const studentId = await getStudentIdFromReq(req);
  if (!studentId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const query = ListRecordsQueryParams.safeParse(req.query);
  const limit = query.success ? (query.data.limit ?? 30) : 30;
  const offset = query.success ? (query.data.offset ?? 0) : 0;

  const records = await db
    .select()
    .from(dailyRecordsTable)
    .where(eq(dailyRecordsTable.studentId, studentId))
    .orderBy(desc(dailyRecordsTable.recordDate))
    .limit(limit)
    .offset(offset);

  res.json(ListRecordsResponse.parse(records.map(mapRecord)));
});

router.post("/records", async (req, res): Promise<void> => {
  const studentId = await getStudentIdFromReq(req);
  if (!studentId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const parsed = CreateRecordBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [record] = await db
    .insert(dailyRecordsTable)
    .values({ ...parsed.data, studentId })
    .returning();

  res.status(201).json(GetRecordResponse.parse(mapRecord(record)));
});

router.get("/records/extract-text", async (_req, res): Promise<void> => {
  res.status(405).json({ error: "Use POST" });
});

router.post("/records/extract-text", async (req, res): Promise<void> => {
  const parsed = ExtractFromTextBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const result = await extractFromText(parsed.data.text);
  res.json(ExtractFromTextResponse.parse(result));
});

router.get("/records/:id", async (req, res): Promise<void> => {
  const studentId = await getStudentIdFromReq(req);
  if (!studentId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const params = GetRecordParams.safeParse({ id });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const record = await db
    .select()
    .from(dailyRecordsTable)
    .where(and(eq(dailyRecordsTable.id, id), eq(dailyRecordsTable.studentId, studentId)))
    .then((r) => r[0]);

  if (!record) {
    res.status(404).json({ error: "Record not found" });
    return;
  }

  res.json(GetRecordResponse.parse(mapRecord(record)));
});

export default router;
