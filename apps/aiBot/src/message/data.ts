/** 决策类型：赚钱型 | 成长型 | 平衡型（数据库存枚举键） */
export type AIBotTemplate = "profit" | "growth" | "balanced";

/**
 * 机器人运行状态（对应库字段 `run_status`）。
 * 不含「草稿」：新建机器人写入时默认为 `stopped`（已停止，含尚未启动运行）。
 *
 * - `running` — 运行中
 * - `paused` — 已暂停
 * - `stopped` — 已停止
 */
export type AIBotRunStatus = "running" | "paused" | "stopped";

export interface AIBot {
  walletAddress: string;
  botName: string;
  decisionType: AIBotTemplate;
  runStatus: AIBotRunStatus;
  /** 描述信息（创建时预留，可后续扩展） */
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface AIBotTemplateOption {
  key: AIBotTemplate;
  /** 中文：赚钱型 / 成长型 / 平衡型 */
  label: string;
  description: string;
}

export const templateOptions: AIBotTemplateOption[] = [
  {
    key: "profit",
    label: "赚钱型",
    description: "优先收益与资产周转。"
  },
  {
    key: "growth",
    label: "成长型",
    description: "优先角色成长与装备积累。"
  },
  {
    key: "balanced",
    label: "平衡型",
    description: "成长与收益兼顾。"
  }
];

/** 运行状态中文展示（与 `AIBotRunStatus` 一一对应） */
export const runStatusLabels: Record<AIBotRunStatus, string> = {
  running: "运行中",
  paused: "已暂停",
  stopped: "已停止"
};
