import { beforeEach, describe, expect, it, vi } from "vitest";
import { getAddress } from "viem";
import { createMocks } from "node-mocks-http";
import createBotHandler from "@/pages/api/bots/create";
import queryBotHandler from "@/pages/api/bots/query/[walletAddress]";
import updateBotHandler from "@/pages/api/bots/update";

const TEST_WALLET = "0x0000000000000000000000000000000000000001";
const TEST_WALLET_NORM = getAddress(TEST_WALLET);
const OWNER_WALLET = "0x0000000000000000000000000000000000000002";
const OWNER_WALLET_NORM = getAddress(OWNER_WALLET);
const OTHER_WALLET = "0x0000000000000000000000000000000000000003";

const state = vi.hoisted(() => ({
  bots: new Map<
    string,
    {
      walletAddress: string;
      botName: string;
      decisionType: "profit" | "growth" | "balanced";
      runStatus: "running" | "paused" | "stopped";
      description: string;
      createdAt: string;
      updatedAt: string;
    }
  >()
}));

vi.mock("@/dbInterface/aibot", () => ({
  findAIBotByWallet: vi.fn(async (walletAddress: string) => {
    const w = walletAddress.trim().toLowerCase();
    return state.bots.get(w) ?? null;
  }),
  createAIBot: vi.fn(
    async (input: {
      walletAddress: string;
      botName: string;
      decisionType: "profit" | "growth" | "balanced";
      description?: string;
    }) => {
      const w = input.walletAddress.trim().toLowerCase();
      const now = new Date().toISOString();
      const bot = {
        walletAddress: w,
        botName: input.botName,
        decisionType: input.decisionType,
        runStatus: "stopped" as const,
        description: (input.description ?? "").trim(),
        createdAt: now,
        updatedAt: now
      };
      state.bots.set(w, bot);
      return bot;
    }
  ),
  updateAIBot: vi.fn(
    async (
      walletAddress: string,
      input: {
        botName?: string;
        decisionType?: "profit" | "growth" | "balanced";
        runStatus?: "running" | "paused" | "stopped";
        description?: string;
      }
    ) => {
      const w = walletAddress.trim().toLowerCase();
      const current = state.bots.get(w);
      if (!current) {
        return null;
      }
      const next = {
        ...current,
        botName: input.botName ?? current.botName,
        decisionType: input.decisionType ?? current.decisionType,
        runStatus: input.runStatus ?? current.runStatus,
        description: input.description !== undefined ? input.description.trim() : current.description,
        updatedAt: new Date().toISOString()
      };
      state.bots.set(w, next);
      return next;
    }
  )
}));

describe("aibot api", () => {
  beforeEach(() => {
    state.bots.clear();
  });

  it("returns null bot without session when address is valid", async () => {
    const reqRes = createMocks({
      method: "GET",
      query: { walletAddress: TEST_WALLET }
    });
    await queryBotHandler(reqRes.req, reqRes.res);
    expect(reqRes.res.statusCode).toBe(200);
    expect(reqRes.res._getJSONData()).toEqual({ bot: null });
  });

  it("creates and returns current aibot for wallet in body", async () => {
    const createReqRes = createMocks({
      method: "POST",
      body: {
        walletAddress: TEST_WALLET,
        botName: "Alpha Bot",
        decisionType: "balanced"
      }
    });

    await createBotHandler(createReqRes.req, createReqRes.res);
    expect(createReqRes.res.statusCode).toBe(201);
    expect(createReqRes.res._getJSONData().bot).toMatchObject({
      botName: "Alpha Bot",
      walletAddress: TEST_WALLET_NORM.toLowerCase()
    });

    const currentReqRes = createMocks({
      method: "GET",
      query: { walletAddress: TEST_WALLET }
    });

    await queryBotHandler(currentReqRes.req, currentReqRes.res);
    expect(currentReqRes.res.statusCode).toBe(200);
    expect(currentReqRes.res._getJSONData().bot).toMatchObject({
      botName: "Alpha Bot",
      decisionType: "balanced"
    });
  });

  it("blocks duplicate bot creation per wallet and rejects update for wallet without bot", async () => {
    const createReqRes = createMocks({
      method: "POST",
      body: {
        walletAddress: OWNER_WALLET,
        botName: "Owner Bot",
        decisionType: "profit"
      }
    });

    await createBotHandler(createReqRes.req, createReqRes.res);
    expect(createReqRes.res.statusCode).toBe(201);

    const duplicateReqRes = createMocks({
      method: "POST",
      body: createReqRes.req.body
    });
    await createBotHandler(duplicateReqRes.req, duplicateReqRes.res);
    expect(duplicateReqRes.res.statusCode).toBe(409);

    const patchReqRes = createMocks({
      method: "PATCH",
      body: {
        walletAddress: OTHER_WALLET,
        botName: "Hacked Bot"
      }
    });

    await updateBotHandler(patchReqRes.req, patchReqRes.res);
    expect(patchReqRes.res.statusCode).toBe(404);
    expect(state.bots.get(OWNER_WALLET_NORM.toLowerCase())?.botName).toBe("Owner Bot");
  });
});
