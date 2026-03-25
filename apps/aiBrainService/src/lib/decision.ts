import type {
  BotDecisionRequest,
  BotDecisionResponse,
  BotDecisionSnapshot,
  DecisionRiskLevel,
  OpportunityKey,
  RankedOpportunity
} from "@/message/message";

type KnownOpportunityKey = "token_task_pool" | "farming_harvest" | "equipment_recovery";

type OpportunityTemplate = {
  key: KnownOpportunityKey;
  title: string;
  defaultProfit: number;
  defaultDuration: number;
  defaultBudget: number;
};

const OPPORTUNITY_TEMPLATES: OpportunityTemplate[] = [
  {
    key: "token_task_pool",
    title: "Token Task Pool",
    defaultProfit: 24,
    defaultDuration: 18,
    defaultBudget: 0
  },
  {
    key: "farming_harvest",
    title: "Farming / Harvest",
    defaultProfit: 18,
    defaultDuration: 12,
    defaultBudget: 0
  },
  {
    key: "equipment_recovery",
    title: "Equipment Recovery",
    defaultProfit: 30,
    defaultDuration: 14,
    defaultBudget: 4
  }
];

function getNumericField(snapshot: BotDecisionSnapshot, key: string, fallback: number) {
  const field = snapshot.fields.find((item) => item.key === key);
  if (!field || typeof field.value !== "number" || !Number.isFinite(field.value)) {
    return fallback;
  }

  return field.value;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function getEnabledOpportunityKeys(input: BotDecisionRequest): KnownOpportunityKey[] {
  const candidateKeys = new Set(
    (input.candidate_money_loops?.length ? input.candidate_money_loops : OPPORTUNITY_TEMPLATES.map((item) => item.key))
      .filter((value): value is KnownOpportunityKey =>
        OPPORTUNITY_TEMPLATES.some((item) => item.key === value)
      )
  );

  const entitlementKeys = new Set(
    (input.entitlement?.enabled_money_loops?.length
      ? input.entitlement.enabled_money_loops
      : OPPORTUNITY_TEMPLATES.map((item) => item.key)
    ).filter((value): value is KnownOpportunityKey =>
      OPPORTUNITY_TEMPLATES.some((item) => item.key === value)
    )
  );

  return OPPORTUNITY_TEMPLATES.map((item) => item.key).filter(
    (key) => candidateKeys.has(key) && entitlementKeys.has(key)
  );
}

function toRiskLevel(score: number, costPenalty: number, environmentPenalty: number): DecisionRiskLevel {
  if (score < 10 || costPenalty + environmentPenalty >= 18) {
    return "high";
  }

  if (score < 24 || costPenalty + environmentPenalty >= 8) {
    return "medium";
  }

  return "low";
}

function buildOpportunity(
  template: OpportunityTemplate,
  input: BotDecisionRequest,
  gasCost: number,
  combatRisk: number,
  networkPenalty: number,
  inventoryPressure: number
): RankedOpportunity {
  let expectedProfit = template.defaultProfit;
  let expectedDuration = template.defaultDuration;
  let requiredBudget = template.defaultBudget;
  let costPenalty = 0;
  let environmentPenalty = combatRisk * 12 + networkPenalty * 10;

  if (template.key === "token_task_pool") {
    expectedProfit = getNumericField(input.snapshot, "task_pool_reward", template.defaultProfit);
    expectedDuration = Math.max(10, template.defaultDuration - getNumericField(input.snapshot, "task_chain_bonus", 0));
    costPenalty = 0;
  }

  if (template.key === "farming_harvest") {
    const harvestReadyCount = getNumericField(input.snapshot, "harvest_ready_count", 3);
    expectedProfit = Math.max(template.defaultProfit, harvestReadyCount * 6);
    expectedDuration = Math.max(8, template.defaultDuration + Math.max(0, 4 - harvestReadyCount));
    costPenalty = inventoryPressure * 6;
    environmentPenalty = combatRisk * 8 + networkPenalty * 6;
  }

  if (template.key === "equipment_recovery") {
    expectedProfit = getNumericField(input.snapshot, "recovery_reward_estimate", template.defaultProfit);
    expectedDuration = template.defaultDuration;
    requiredBudget = gasCost;
    costPenalty = gasCost + inventoryPressure * 8;
    environmentPenalty = combatRisk * 10 + networkPenalty * 8;
  }

  const score = Number(
    (expectedProfit - expectedDuration * 0.55 - costPenalty - environmentPenalty).toFixed(2)
  );

  return {
    opportunity_key: template.key,
    title: template.title,
    score,
    expected_profit: Number(expectedProfit.toFixed(2)),
    expected_duration: Number(expectedDuration.toFixed(2)),
    risk_level: toRiskLevel(score, costPenalty, environmentPenalty),
    required_budget: Number(requiredBudget.toFixed(2))
  };
}

function buildWhyChosen(topOpportunity: RankedOpportunity) {
  return `${topOpportunity.title} currently has the best score because it combines expected profit ${topOpportunity.expected_profit} with ${topOpportunity.risk_level} risk and budget ${topOpportunity.required_budget}.`;
}

function buildWhyNotOthers(opportunities: RankedOpportunity[]) {
  return opportunities.slice(1).map((item) => {
    if (item.required_budget > 0) {
      return `${item.title} ranks lower because its required budget ${item.required_budget} reduces current efficiency.`;
    }

    if (item.risk_level !== "low") {
      return `${item.title} ranks lower because current environment signals push its risk to ${item.risk_level}.`;
    }

    return `${item.title} ranks lower because its expected profit ${item.expected_profit} is weaker than the current top option.`;
  });
}

function buildDisabledResponse(reason: string): BotDecisionResponse {
  return {
    data: {
      top_opportunity: null,
      top_3_ranked_opportunities: [],
      why_chosen: reason,
      why_not_others: [],
      expected_profit: 0,
      expected_duration: 0,
      risk_level: "low",
      required_budget: 0,
      fallback_plan: "Pause automation and wait for a valid entitlement or enabled money loop."
    }
  };
}

export function generateStructuredDecision(input: BotDecisionRequest): BotDecisionResponse {
  const entitlementStatus = input.entitlement?.entitlement_status;
  if (entitlementStatus === "expired" || entitlementStatus === "disabled") {
    return buildDisabledResponse(`Automation is blocked because entitlement status is ${entitlementStatus}.`);
  }

  const enabledKeys = getEnabledOpportunityKeys(input);
  if (enabledKeys.length === 0) {
    return buildDisabledResponse("No enabled money loop is currently available for this bot.");
  }

  const gasCost = Math.max(0, getNumericField(input.snapshot, "expected_gas_cost", 2));
  const combatRisk = clamp(getNumericField(input.snapshot, "combat_risk", 0.2), 0, 1);
  const networkPenalty = clamp(1 - getNumericField(input.snapshot, "network_health", 0.9), 0, 1);
  const inventoryPressure = clamp(getNumericField(input.snapshot, "inventory_pressure", 0.2), 0, 1);

  const ranked = OPPORTUNITY_TEMPLATES.filter((item) => enabledKeys.includes(item.key))
    .map((item) => buildOpportunity(item, input, gasCost, combatRisk, networkPenalty, inventoryPressure))
    .sort((left, right) => right.score - left.score)
    .slice(0, 3);

  const topOpportunity = ranked[0] ?? null;
  if (!topOpportunity) {
    return buildDisabledResponse("No ranked opportunity is available for the current snapshot.");
  }

  return {
    data: {
      top_opportunity: topOpportunity,
      top_3_ranked_opportunities: ranked,
      why_chosen: buildWhyChosen(topOpportunity),
      why_not_others: buildWhyNotOthers(ranked),
      expected_profit: topOpportunity.expected_profit,
      expected_duration: topOpportunity.expected_duration,
      risk_level: topOpportunity.risk_level,
      required_budget: topOpportunity.required_budget,
      fallback_plan:
        ranked[1]?.title
          ? `Fallback to ${ranked[1].title} if the top opportunity becomes unavailable.`
          : "Maintain observation mode until a better opportunity is visible."
    }
  };
}

export function isKnownOpportunityKey(value: OpportunityKey): value is KnownOpportunityKey {
  return OPPORTUNITY_TEMPLATES.some((item) => item.key === value);
}
