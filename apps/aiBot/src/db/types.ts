import type { AIBotRunStatus, AIBotTemplate } from "@/message/data";

export interface AIBotRow {
  walletAddress: string;
  botName: string;
  decisionType: AIBotTemplate;
  runStatus: AIBotRunStatus;
  /** 创建/编辑时预留的说明 */
  description: string;
  createdAt: Date;
  updatedAt: Date;
}
