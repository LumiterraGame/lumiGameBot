import type { AIBot, AIBotRunStatus, AIBotTemplate } from "@/message/data";

/** 创建机器人 */
export interface CreateAIBotRequest {
  /** 调用方声明的钱包地址（当前实现信任该字段，不做服务端验签） */
  walletAddress: string;
  botName: string;
  decisionType: AIBotTemplate;
  /** 预留描述，可选 */
  description?: string;
}

export interface CreateAIBotResponse {
  bot: AIBot;
}

/** 查询当前钱包绑定的机器人 */
export interface QueryAIBotResponse {
  bot: AIBot | null;
}

/** 更新机器人 */
export interface UpdateAIBotRequest {
  /** 调用方声明的钱包地址（当前实现信任该字段，不做服务端验签） */
  walletAddress: string;
  botName?: string;
  decisionType?: AIBotTemplate;
  runStatus?: AIBotRunStatus;
  description?: string;
}

export interface UpdateAIBotResponse {
  bot: AIBot;
}
