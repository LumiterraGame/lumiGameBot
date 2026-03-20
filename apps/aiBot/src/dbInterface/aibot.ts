import { eq } from "drizzle-orm";
import { getDb, getReadonlyDb } from "@/db/pgdb";
import { aibots } from "@/db/schema";
import type { AIBotRow } from "@/db/types";
import { normalizeLowercaseText } from "@/dbInterface/interface";
import type { AIBot, AIBotRunStatus, AIBotTemplate } from "@/message/data";

function mapRow(row: AIBotRow): AIBot {
  return {
    walletAddress: row.walletAddress,
    botName: row.botName,
    decisionType: row.decisionType,
    runStatus: row.runStatus,
    description: row.description,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString()
  };
}

export async function findAIBotByWallet(walletAddress: string): Promise<AIBot | null> {
  const w = normalizeLowercaseText(walletAddress);
  const rows = await getReadonlyDb()
    .select()
    .from(aibots)
    .where(eq(aibots.walletAddress, w))
    .limit(1);

  const row = rows[0] as AIBotRow | undefined;
  return row ? mapRow(row) : null;
}

export async function createAIBot(input: {
  walletAddress: string;
  botName: string;
  decisionType: AIBotTemplate;
  description?: string;
}) {
  const walletAddress = normalizeLowercaseText(input.walletAddress);
  const description = (input.description ?? "").trim();
  const rows = await getDb()
    .insert(aibots)
    .values({
      walletAddress,
      botName: input.botName.trim(),
      decisionType: input.decisionType,
      runStatus: "stopped",
      description
    })
    .returning();

  return mapRow(rows[0] as AIBotRow);
}

export async function updateAIBot(
  walletAddress: string,
  input: {
    botName?: string;
    decisionType?: AIBotTemplate;
    runStatus?: AIBotRunStatus;
    description?: string;
  }
) {
  const w = normalizeLowercaseText(walletAddress);
  const current = await findAIBotByWallet(w);
  if (!current) {
    return null;
  }

  const rows = await getDb()
    .update(aibots)
    .set({
      botName: input.botName !== undefined ? input.botName.trim() : current.botName,
      decisionType: input.decisionType ?? current.decisionType,
      runStatus: input.runStatus ?? current.runStatus,
      description: input.description !== undefined ? input.description.trim() : current.description,
      updatedAt: new Date()
    })
    .where(eq(aibots.walletAddress, w))
    .returning();

  return mapRow(rows[0] as AIBotRow);
}
