import { pgTable, serial, text, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const questionsBankTable = pgTable("questions_bank", {
  id: serial("id").primaryKey(),
  subject: text("subject").notNull(),
  topic: text("topic"),
  difficulty: integer("difficulty"),
  text: text("text").notNull(),
  optionA: text("option_a").notNull(),
  optionB: text("option_b").notNull(),
  optionC: text("option_c").notNull(),
  optionD: text("option_d").notNull(),
  correctAnswer: text("correct_answer").notNull(),
  explanation: text("explanation"),
});

export const insertQuestionSchema = createInsertSchema(questionsBankTable).omit({ id: true });
export type InsertQuestion = z.infer<typeof insertQuestionSchema>;
export type Question = typeof questionsBankTable.$inferSelect;
