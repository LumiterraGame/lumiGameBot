import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import type { AIBotRunStatus, AIBotTemplate } from "@/message/data";

export const aibots = pgTable("aibots", {
  walletAddress: text("wallet_address").primaryKey(),
  botName: text("bot_name").notNull(),
  decisionType: text("decision_type").$type<AIBotTemplate>().notNull(),
  runStatus: text("run_status").$type<AIBotRunStatus>().notNull(),
  description: text("description").notNull().default(""),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
});
