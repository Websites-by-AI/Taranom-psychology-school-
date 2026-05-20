import { pgTable, serial, integer, real, boolean, text, timestamp, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { studentsTable } from "./students";

export const dailyRecordsTable = pgTable("daily_records", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").notNull().references(() => studentsTable.id, { onDelete: "cascade" }),
  recordDate: date("record_date").notNull(),
  mathScore: real("math_score"),
  physicsScore: real("physics_score"),
  chemistryScore: real("chemistry_score"),
  biologyScore: real("biology_score"),
  anxietyLevel: integer("anxiety_level"),
  sleepHours: real("sleep_hours"),
  focusDrop: boolean("focus_drop"),
  socialInteraction: integer("social_interaction"),
  examDaysLeft: integer("exam_days_left"),
  freeText: text("free_text"),
  riskLevel: text("risk_level"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertDailyRecordSchema = createInsertSchema(dailyRecordsTable).omit({ id: true, createdAt: true });
export type InsertDailyRecord = z.infer<typeof insertDailyRecordSchema>;
export type DailyRecord = typeof dailyRecordsTable.$inferSelect;
