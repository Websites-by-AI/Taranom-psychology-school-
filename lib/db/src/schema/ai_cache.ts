import { pgTable, serial, integer, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { dailyRecordsTable } from "./daily_records";

export const aiCacheTable = pgTable("ai_cache", {
  id: serial("id").primaryKey(),
  recordId: integer("record_id").notNull().references(() => dailyRecordsTable.id, { onDelete: "cascade" }),
  ruleEngineOutput: text("rule_engine_output"),
  interventionOutput: text("intervention_output"),
  reportOutput: text("report_output"),
  nlpOutput: text("nlp_output"),
  riskLevel: text("risk_level"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertAiCacheSchema = createInsertSchema(aiCacheTable).omit({ id: true, createdAt: true });
export type InsertAiCache = z.infer<typeof insertAiCacheSchema>;
export type AiCache = typeof aiCacheTable.$inferSelect;
