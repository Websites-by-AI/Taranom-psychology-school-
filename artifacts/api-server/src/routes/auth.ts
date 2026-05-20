import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, studentsTable } from "@workspace/db";
import { LoginBody, LoginResponse, GetMeResponse } from "@workspace/api-zod";

const router: IRouter = Router();

router.post("/auth/login", async (req, res): Promise<void> => {
  const parsed = LoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { nationalCode, fullName, grade, schoolName } = parsed.data;

  let student = await db
    .select()
    .from(studentsTable)
    .where(eq(studentsTable.nationalCode, nationalCode))
    .then((r) => r[0]);

  let isNew = false;

  if (!student) {
    isNew = true;
    const name = fullName ?? nationalCode;
    const [created] = await db
      .insert(studentsTable)
      .values({
        nationalCode,
        fullName: name,
        grade: grade ?? null,
        schoolName: schoolName ?? null,
        lastLogin: new Date(),
      })
      .returning();
    student = created;
  } else {
    await db
      .update(studentsTable)
      .set({ lastLogin: new Date() })
      .where(eq(studentsTable.id, student.id));
    student = { ...student, lastLogin: new Date() };
  }

  res.json(
    LoginResponse.parse({
      student: {
        id: student.id,
        nationalCode: student.nationalCode,
        fullName: student.fullName,
        grade: student.grade,
        schoolName: student.schoolName,
        createdAt: student.createdAt.toISOString(),
        lastLogin: student.lastLogin?.toISOString() ?? null,
      },
      isNew,
    })
  );
});

router.get("/auth/me", async (req, res): Promise<void> => {
  const nationalCode = req.headers["x-national-code"] as string | undefined;

  if (!nationalCode) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const student = await db
    .select()
    .from(studentsTable)
    .where(eq(studentsTable.nationalCode, nationalCode))
    .then((r) => r[0]);

  if (!student) {
    res.status(401).json({ error: "Student not found" });
    return;
  }

  res.json(
    GetMeResponse.parse({
      id: student.id,
      nationalCode: student.nationalCode,
      fullName: student.fullName,
      grade: student.grade,
      schoolName: student.schoolName,
      createdAt: student.createdAt.toISOString(),
      lastLogin: student.lastLogin?.toISOString() ?? null,
    })
  );
});

export default router;
