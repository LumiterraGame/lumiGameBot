import { describe, expect, it, vi } from "vitest";
import { createMocks } from "node-mocks-http";
import healthHandler from "@/pages/api/health";
import decisionHandler from "@/pages/api/brain/decision";
import respondHandler from "@/pages/api/brain/respond";

const openaiState = vi.hoisted(() => ({
  generateBrainText: vi.fn()
}));

vi.mock("@/lib/openai", () => ({
  generateBrainText: openaiState.generateBrainText
}));

describe("aiBrainService api", () => {
  it("returns health status for GET /api/health", async () => {
    const reqRes = createMocks({
      method: "GET"
    });

    await healthHandler(reqRes.req, reqRes.res);

    expect(reqRes.res.statusCode).toBe(200);
    expect(reqRes.res._getJSONData()).toEqual({
      ok: true,
      service: "ai-brain-service"
    });
  });

  it("rejects cross-origin preflight requests", async () => {
    const reqRes = createMocks({
      method: "OPTIONS",
      headers: {
        origin: "https://example.com",
        host: "localhost:8000"
      }
    });

    await respondHandler(reqRes.req, reqRes.res);

    expect(reqRes.res.statusCode).toBe(403);
  });

  it("allows same-origin preflight requests", async () => {
    const reqRes = createMocks({
      method: "OPTIONS",
      headers: {
        origin: "http://localhost:8000",
        host: "localhost:8000"
      }
    });

    await respondHandler(reqRes.req, reqRes.res);

    expect(reqRes.res.statusCode).toBe(204);
    expect(reqRes.res.getHeader("access-control-allow-origin")).toBe("http://localhost:8000");
  });

  it("validates request body for POST /api/brain/respond", async () => {
    const reqRes = createMocks({
      method: "POST",
      body: {
        input: ""
      }
    });

    await respondHandler(reqRes.req, reqRes.res);

    expect(reqRes.res.statusCode).toBe(400);
    expect(reqRes.res._getJSONData()).toEqual({
      error: "input is required"
    });
  });

  it("returns model output for valid requests", async () => {
    openaiState.generateBrainText.mockResolvedValueOnce({
      requestModel: "gpt-5.4",
      responseId: "resp_123",
      outputText: "structured output placeholder"
    });

    const reqRes = createMocks({
      method: "POST",
      body: {
        input: "Summarize the next move",
        systemPrompt: "You are an AI brain for a game bot."
      }
    });

    await respondHandler(reqRes.req, reqRes.res);

    expect(openaiState.generateBrainText).toHaveBeenCalledWith({
      input: "Summarize the next move",
      systemPrompt: "You are an AI brain for a game bot."
    });
    expect(reqRes.res.statusCode).toBe(200);
    expect(reqRes.res._getJSONData()).toEqual({
      data: {
        model: "gpt-5.4",
        responseId: "resp_123",
        outputText: "structured output placeholder"
      }
    });
  });

  it("returns a structured ranking for POST /api/brain/decision", async () => {
    const reqRes = createMocks({
      method: "POST",
      body: {
        wallet_address: "0x0000000000000000000000000000000000000001",
        snapshot: {
          fields: [
            { key: "task_pool_reward", source: "public_api", value: 42 },
            { key: "harvest_ready_count", source: "client_local", value: 2 },
            { key: "recovery_reward_estimate", source: "onchain", value: 19 },
            { key: "expected_gas_cost", source: "onchain", value: 6 },
            { key: "combat_risk", source: "client_response", value: 0.1 },
            { key: "network_health", source: "public_api", value: 0.95 }
          ]
        },
        entitlement: {
          entitlement_status: "active",
          enabled_money_loops: ["token_task_pool", "farming_harvest", "equipment_recovery"]
        }
      }
    });

    await decisionHandler(reqRes.req, reqRes.res);

    expect(reqRes.res.statusCode).toBe(200);
    expect(reqRes.res._getJSONData()).toMatchObject({
      data: {
        top_opportunity: {
          opportunity_key: "token_task_pool"
        },
        top_3_ranked_opportunities: [
          { opportunity_key: "token_task_pool" },
          { opportunity_key: "farming_harvest" },
          { opportunity_key: "equipment_recovery" }
        ],
        risk_level: "low"
      }
    });
  });

  it("returns a disabled decision when entitlement is expired", async () => {
    const reqRes = createMocks({
      method: "POST",
      body: {
        wallet_address: "0x0000000000000000000000000000000000000001",
        snapshot: {
          fields: []
        },
        entitlement: {
          entitlement_status: "expired"
        }
      }
    });

    await decisionHandler(reqRes.req, reqRes.res);

    expect(reqRes.res.statusCode).toBe(200);
    expect(reqRes.res._getJSONData()).toEqual({
      data: {
        top_opportunity: null,
        top_3_ranked_opportunities: [],
        why_chosen: "Automation is blocked because entitlement status is expired.",
        why_not_others: [],
        expected_profit: 0,
        expected_duration: 0,
        risk_level: "low",
        required_budget: 0,
        fallback_plan: "Pause automation and wait for a valid entitlement or enabled money loop."
      }
    });
  });
});
