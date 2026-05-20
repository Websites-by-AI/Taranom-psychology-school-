import { Router, type IRouter } from "express";
import { eq, and } from "drizzle-orm";
import { db, studentsTable, dailyRecordsTable, aiCacheTable } from "@workspace/db";
import {
  GetAnalysisParams,
  GetAnalysisResponse,
  RunAnalysisBody,
  RunAnalysisResponse,
} from "@workspace/api-zod";
import { analyzeRecord } from "../lib/ai";

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

function mapCache(c: typeof aiCacheTable.$inferSelect) {
  return {
    id: c.id,
    recordId: c.recordId,
    ruleEngineOutput: c.ruleEngineOutput,
    interventionOutput: c.interventionOutput,
    reportOutput: c.reportOutput,
    nlpOutput: c.nlpOutput,
    riskLevel: c.riskLevel,
    createdAt: c.createdAt.toISOString(),
  };
}

router.get("/analysis/:recordId", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.recordId) ? req.params.recordId[0] : req.params.recordId;
  const recordId = parseInt(raw, 10);

  const params = GetAnalysisParams.safeParse({ recordId });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const cached = await db
    .select()
    .from(aiCacheTable)
    .where(eq(aiCacheTable.recordId, recordId))
    .then((r) => r[0]);

  if (!cached) {
    res.status(404).json({ error: "Analysis not found" });
    return;
  }

  res.json(GetAnalysisResponse.parse(mapCache(cached)));
});

router.post("/analysis/run", async (req, res): Promise<void> => {
  const studentId = await getStudentIdFromReq(req);
  if (!studentId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const parsed = RunAnalysisBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { recordId } = parsed.data;

  const record = await db
    .select()
    .from(dailyRecordsTable)
    .where(and(eq(dailyRecordsTable.id, recordId), eq(dailyRecordsTable.studentId, studentId)))
    .then((r) => r[0]);

  if (!record) {
    res.status(404).json({ error: "Record not found" });
    return;
  }

  const existing = await db
    .select()
    .from(aiCacheTable)
    .where(eq(aiCacheTable.recordId, recordId))
    .then((r) => r[0]);

  if (existing) {
    res.json(RunAnalysisResponse.parse(mapCache(existing)));
    return;
  }

  const result = await analyzeRecord({
    mathScore: record.mathScore,
    physicsScore: record.physicsScore,
    chemistryScore: record.chemistryScore,
    biologyScore: record.biologyScore,
    anxietyLevel: record.anxietyLevel,
    sleepHours: record.sleepHours,
    focusDrop: record.focusDrop,
    socialInteraction: record.socialInteraction,
    examDaysLeft: record.examDaysLeft,
    freeText: record.freeText,
  });

  await db
    .update(dailyRecordsTable)
    .set({ riskLevel: result.riskLevel })
    .where(eq(dailyRecordsTable.id, recordId));

  const [cache] = await db
    .insert(aiCacheTable)
    .values({
      recordId,
      ruleEngineOutput: result.ruleEngineOutput,
      interventionOutput: result.interventionOutput,
      reportOutput: result.reportOutput,
      nlpOutput: result.nlpOutput,
      riskLevel: result.riskLevel,
    })
    .returning();

  res.json(RunAnalysisResponse.parse(mapCache(cache)));
});

export default router;
