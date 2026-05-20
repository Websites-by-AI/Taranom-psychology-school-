import { Router, type IRouter } from "express";
import { eq, sql } from "drizzle-orm";
import { db, studentsTable, dailyRecordsTable, questionsBankTable, userAnswersTable } from "@workspace/db";
import {
  GenerateExamBody,
  GenerateExamResponse,
  SubmitExamBody,
  SubmitExamResponse,
  ListExamHistoryResponse,
} from "@workspace/api-zod";
import { randomUUID } from "crypto";

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

router.post("/exam/generate", async (req, res): Promise<void> => {
  const studentId = await getStudentIdFromReq(req);
  if (!studentId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const parsed = GenerateExamBody.safeParse(req.body);
  const count = parsed.success ? (parsed.data.count ?? 10) : 10;

  const records = await db
    .select()
    .from(dailyRecordsTable)
    .where(eq(dailyRecordsTable.studentId, studentId))
    .orderBy(sql`created_at DESC`)
    .limit(10);

  const subjectAvg: Record<string, number[]> = {
    ریاضی: [],
    فیزیک: [],
    شیمی: [],
    زیست: [],
  };

  for (const r of records) {
    if (r.mathScore != null) subjectAvg["ریاضی"].push(r.mathScore);
    if (r.physicsScore != null) subjectAvg["فیزیک"].push(r.physicsScore);
    if (r.chemistryScore != null) subjectAvg["شیمی"].push(r.chemistryScore);
    if (r.biologyScore != null) subjectAvg["زیست"].push(r.biologyScore);
  }

  const subjectScores = Object.entries(subjectAvg).map(([subject, scores]) => ({
    subject,
    avg: scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 10,
  }));

  subjectScores.sort((a, b) => a.avg - b.avg);

  const allQuestions = await db.select().from(questionsBankTable);

  if (allQuestions.length === 0) {
    res.json(GenerateExamResponse.parse([]));
    return;
  }

  const selected: typeof allQuestions = [];
  const weakSubjects = subjectScores.slice(0, 2).map((s) => s.subject);

  const weakQuestions = allQuestions.filter((q) => weakSubjects.includes(q.subject));
  const otherQuestions = allQuestions.filter((q) => !weakSubjects.includes(q.subject));

  const shuffled = [...weakQuestions, ...otherQuestions].sort(() => Math.random() - 0.5);
  selected.push(...shuffled.slice(0, count));

  res.json(
    GenerateExamResponse.parse(
      selected.map((q) => ({
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

router.post("/exam/submit", async (req, res): Promise<void> => {
  const studentId = await getStudentIdFromReq(req);
  if (!studentId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const parsed = SubmitExamBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { sessionId, answers } = parsed.data;

  const questionIds = answers.map((a) => a.questionId);
  const questions = await db
    .select()
    .from(questionsBankTable)
    .where(sql`id = ANY(${questionIds})`);

  const questionMap = new Map(questions.map((q) => [q.id, q]));

  let correctCount = 0;
  const subjectMap: Record<string, { total: number; correct: number }> = {};

  const inserts = answers.map((answer) => {
    const q = questionMap.get(answer.questionId);
    const isCorrect = q ? q.correctAnswer === answer.chosen : false;
    if (isCorrect) correctCount++;

    const subject = q?.subject ?? "نامشخص";
    if (!subjectMap[subject]) subjectMap[subject] = { total: 0, correct: 0 };
    subjectMap[subject].total++;
    if (isCorrect) subjectMap[subject].correct++;

    return {
      studentId,
      questionId: answer.questionId,
      examSessionId: sessionId,
      isCorrect,
      answerChosen: answer.chosen,
    };
  });

  if (inserts.length > 0) {
    await db.insert(userAnswersTable).values(inserts);
  }

  const score = answers.length > 0 ? (correctCount / answers.length) * 100 : 0;

  const subjectBreakdown = Object.entries(subjectMap).map(([subject, data]) => ({
    subject,
    total: data.total,
    correct: data.correct,
  }));

  res.json(
    SubmitExamResponse.parse({
      sessionId,
      totalQuestions: answers.length,
      correctCount,
      score,
      subjectBreakdown,
    })
  );
});

router.get("/exam/history", async (req, res): Promise<void> => {
  const studentId = await getStudentIdFromReq(req);
  if (!studentId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const rows = await db
    .select({
      examSessionId: userAnswersTable.examSessionId,
      isCorrect: userAnswersTable.isCorrect,
      createdAt: userAnswersTable.createdAt,
    })
    .from(userAnswersTable)
    .where(eq(userAnswersTable.studentId, studentId))
    .orderBy(sql`created_at DESC`);

  const sessionMap = new Map<string, { total: number; correct: number; createdAt: Date }>();
  for (const row of rows) {
    const s = sessionMap.get(row.examSessionId) ?? { total: 0, correct: 0, createdAt: row.createdAt };
    s.total++;
    if (row.isCorrect) s.correct++;
    if (row.createdAt > s.createdAt) s.createdAt = row.createdAt;
    sessionMap.set(row.examSessionId, s);
  }

  const history = Array.from(sessionMap.entries()).map(([sessionId, data]) => ({
    sessionId,
    totalQuestions: data.total,
    correctCount: data.correct,
    score: data.total > 0 ? (data.correct / data.total) * 100 : 0,
    createdAt: data.createdAt.toISOString(),
  }));

  res.json(ListExamHistoryResponse.parse(history));
});

export default router;
