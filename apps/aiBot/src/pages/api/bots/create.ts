// 创建 AIBot（一钱包一行）。无服务端会话：请求体携带 walletAddress，仅做地址格式校验（信任前端）。
// POST /api/bots/create
// 请求体 JSON 示例：{"walletAddress":"0x...","botName":"My Bot","decisionType":"balanced","description":"可选"}
// curl 示例：curl -sS -X POST "http://localhost:3000/api/bots/create" -H "content-type: application/json" -d '{"walletAddress":"0x0000000000000000000000000000000000000001","botName":"My Bot","decisionType":"balanced"}'
// 成功 201 { bot }；钱包已有机器人 409

import type { NextApiRequest, NextApiResponse } from "next";
import { getAddress, isAddress } from "viem";
import { z } from "zod";
import { ConflictError } from "@/lib/http-errors";
import { sendError, sendJson } from "@/lib/api";
import { withCors } from "@/lib/apiWrapper";
import type { CreateAIBotRequest, CreateAIBotResponse } from "@/message/message";
import { createAIBot, findAIBotByWallet } from "@/dbInterface/aibot";

const createAIBotSchema = z.object({
  walletAddress: z.string().refine((v) => isAddress(v), { message: "Invalid wallet address" }),
  botName: z.string().min(2).max(50),
  decisionType: z.enum(["profit", "growth", "balanced"]),
  description: z.string().max(2000).optional()
});

function parseCreateBody(body: unknown): CreateAIBotRequest {
  return createAIBotSchema.parse(body) as CreateAIBotRequest;
}

async function createOwnedAIBot(req: NextApiRequest) {
  const payload = parseCreateBody(req.body);
  const walletAddress = getAddress(payload.walletAddress);

  const existing = await findAIBotByWallet(walletAddress);
  if (existing) {
    throw new ConflictError("AIBot already exists for current wallet");
  }

  return createAIBot({
    walletAddress,
    botName: payload.botName,
    decisionType: payload.decisionType,
    description: payload.description
  });
}

async function handler(req: NextApiRequest, res: NextApiResponse<CreateAIBotResponse | { error: string }>) {
  try {
    if (req.method !== "POST") {
      res.setHeader("Allow", "POST");
      return sendJson(res, 405, { error: "Method not allowed" });
    }

    const bot = await createOwnedAIBot(req);
    return sendJson(res, 201, { bot });
  } catch (error) {
    return sendError(res, error);
  }
}

export default withCors(handler);
