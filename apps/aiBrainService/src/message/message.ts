export interface BrainHealthResponse {
  ok: true;
  service: "ai-brain-service";
}

export type DecisionSnapshotSource = "client_local" | "client_response" | "public_api" | "onchain";

export type DecisionRiskLevel = "low" | "medium" | "high";

export type OpportunityKey = "token_task_pool" | "farming_harvest" | "equipment_recovery" | (string & {});

export interface DecisionSnapshotField {
  key: string;
  source: DecisionSnapshotSource;
  value: unknown;
}

export interface BotDecisionSnapshot {
  fields: DecisionSnapshotField[];
}

export interface BotDecisionEntitlement {
  plan_id?: string;
  plan_name?: string;
  entitlement_status?: "active" | "grace" | "expired" | "disabled";
  enabled_money_loops?: string[];
  enabled_ai_features?: string[];
}

export interface RankedOpportunity {
  opportunity_key: OpportunityKey;
  title: string;
  score: number;
  expected_profit: number;
  expected_duration: number;
  risk_level: DecisionRiskLevel;
  required_budget: number;
}

export interface BotDecisionRequest {
  wallet_address: string;
  snapshot: BotDecisionSnapshot;
  entitlement?: BotDecisionEntitlement;
  candidate_money_loops?: string[];
}

export interface BotDecisionResponseData {
  top_opportunity: RankedOpportunity | null;
  top_3_ranked_opportunities: RankedOpportunity[];
  why_chosen: string;
  why_not_others: string[];
  expected_profit: number;
  expected_duration: number;
  risk_level: DecisionRiskLevel;
  required_budget: number;
  fallback_plan: string;
}

export interface BotDecisionResponse {
  data: BotDecisionResponseData;
}

// Temporary free-text route used only for local experimentation.
export interface GenerateBrainResponseRequest {
  model?: string;
  input: string;
  systemPrompt?: string;
  maxOutputTokens?: number;
}

export interface GenerateBrainResponseData {
  model: string;
  responseId: string;
  outputText: string;
}

export interface GenerateBrainResponse {
  data: GenerateBrainResponseData;
}
