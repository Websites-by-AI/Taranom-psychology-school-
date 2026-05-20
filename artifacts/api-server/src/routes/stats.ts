import { Router, type IRouter } from "express";
import { eq, desc } from "drizzle-orm";
import { db, studentsTable, dailyRecordsTable } from "@workspace/db";
import { GetStatsSummaryResponse, GetRiskTrendResponse } from "@workspace/api-zod";

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

function avg(nums: (number | null)[]): number | null {
  const valid = nums.filter((n): n is number => n != null);
  if (valid.length === 0) return null;
  return valid.reduce((a, b) => a + b, 0) / valid.length;
}

router.get("/stats/summary", async (req, res): Promise<void> => {
  const studentId = await getStudentIdFromReq(req);
  if (!studentId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const records = await db
    .select()
    .from(dailyRecordsTable)
    .where(eq(dailyRecordsTable.studentId, studentId))
    .orderBy(desc(dailyRecordsTable.recordDate));

  const avgMath = avg(records.map((r) => r.mathScore));
  const avgPhysics = avg(records.map((r) => r.physicsScore));
  const avgChemistry = avg(records.map((r) => r.chemistryScore));
  const avgBiology = avg(records.map((r) => r.biologyScore));
  const avgAnxiety = avg(records.map((r) => r.anxietyLevel));
  const avgSleep = avg(records.map((r) => r.sleepHours));

  const lastRecord = records.find((r) => r.riskLevel != null);
  const lastRiskLevel = lastRecord?.riskLevel ?? null;

  const subjectAvgs = [
    { subject: "ریاضی", avg: avgMath },
    { subject: "فیزیک", avg: avgPhysics },
    { subject: "شیمی", avg: avgChemistry },
    { subject: "زیست", avg: avgBiology },
  ].filter((s) => s.avg != null) as { subject: string; avg: number }[];

  subjectAvgs.sort((a, b) => a.avg - b.avg);
  const weakestSubject = subjectAvgs[0]?.subject ?? null;

  res.json(
    GetStatsSummaryResponse.parse({
      avgMath,
      avgPhysics,
      avgChemistry,
      avgBiology,
      avgAnxiety,
      avgSleep,
      totalRecords: records.length,
      lastRiskLevel,
      weakestSubject,
    })
  );
});

router.get("/stats/risk-trend", async (req, res): Promise<void> => {
  const studentId = await getStudentIdFromReq(req);
  if (!studentId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const records = await db
    .select()
    .from(dailyRecordsTable)
    .where(eq(dailyRecordsTable.studentId, studentId))
    .orderBy(desc(dailyRecordsTable.recordDate))
    .limit(14);

  const trend = records.map((r) => ({
    date: r.recordDate,
    riskLevel: r.riskLevel ?? "green",
    anxietyLevel: r.anxietyLevel,
  }));

  res.json(GetRiskTrendResponse.parse(trend));
});

export default router;
