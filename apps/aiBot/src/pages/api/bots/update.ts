// 按钱包更新已有 AIBot 字段。无服务端会话：请求体携带 walletAddress，仅做地址格式校验（信任前端）。
// PATCH /api/bots/update
// 请求体 JSON 示例：{"walletAddress":"0x...","botName":"新名称","decisionType":"profit","runStatus":"running","description":"可选"}（除 walletAddress 外均可按需省略）
// curl 示例：curl -sS -X PATCH "http://localhost:3000/api/bots/update" -H "content-type: application/json" -d '{"walletAddress":"0x0000000000000000000000000000000000000001","runStatus":"running"}'
// 成功 200 { bot }；该钱包无机器人 404

import type { NextApiRequest, NextApiResponse } from "next";
import { getAddress, isAddress } from "viem";
import { z } from "zod";
import { NotFoundError } from "@/lib/http-errors";
import { sendError, sendJson } from "@/lib/api";
import { withCors } from "@/lib/apiWrapper";
import type { UpdateAIBotRequest, UpdateAIBotResponse } from "@/message/message";
import { findAIBotByWallet, updateAIBot } from "@/dbInterface/aibot";

const updateAIBotSchema = z.object({
  walletAddress: z.string().refine((v) => isAddress(v), { message: "Invalid wallet address" }),
  botName: z.string().min(2).max(50).optional(),
  decisionType: z.enum(["profit", "growth", "balanced"]).optional(),
  runStatus: z.enum(["running", "paused", "stopped"]).optional(),
  description: z.string().max(2000).optional()
});

function parseUpdateBody(body: unknown): UpdateAIBotRequest {
  return updateAIBotSchema.parse(body) as UpdateAIBotRequest;
}

async function updateOwnedAIBot(req: NextApiRequest) {
  const payload = parseUpdateBody(req.body);
  const walletAddress = getAddress(payload.walletAddress);

  const existing = await findAIBotByWallet(walletAddress);
  if (!existing) {
    throw new NotFoundError("AIBot not found");
  }

  const updated = await updateAIBot(walletAddress, {
    botName: payload.botName,
    decisionType: payload.decisionType,
    runStatus: payload.runStatus,
    description: payload.description
  });

  if (!updated) {
    throw new NotFoundError("AIBot not found");
  }

  return updated;
}

async function handler(req: NextApiRequest, res: NextApiResponse<UpdateAIBotResponse | { error: string }>) {
  try {
    if (req.method !== "PATCH") {
      res.setHeader("Allow", "PATCH");
      return sendJson(res, 405, { error: "Method not allowed" });
    }

    const bot = await updateOwnedAIBot(req);
    return sendJson(res, 200, { bot });
  } catch (error) {
    return sendError(res, error);
  }
}

export default withCors(handler);
