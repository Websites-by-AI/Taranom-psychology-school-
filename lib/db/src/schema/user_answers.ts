import { pgTable, serial, integer, boolean, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { studentsTable } from "./students";
import { questionsBankTable } from "./questions_bank";

export const userAnswersTable = pgTable("user_answers", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").notNull().references(() => studentsTable.id, { onDelete: "cascade" }),
  questionId: integer("question_id").notNull().references(() => questionsBankTable.id, { onDelete: "cascade" }),
  examSessionId: text("exam_session_id").notNull(),
  isCorrect: boolean("is_correct").notNull(),
  answerChosen: text("answer_chosen").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertUserAnswerSchema = createInsertSchema(userAnswersTable).omit({ id: true, createdAt: true });
export type InsertUserAnswer = z.infer<typeof insertUserAnswerSchema>;
export type UserAnswer = typeof userAnswersTable.$inferSelect;
