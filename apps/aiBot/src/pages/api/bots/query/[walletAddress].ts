import type { NextApiRequest, NextApiResponse } from "next";
import { isAddress } from "viem";
import { sendError, sendJson } from "@/lib/api";
import { withCors } from "@/lib/apiWrapper";
import { BadRequestError } from "@/lib/http-errors";
import type { QueryAIBotResponse } from "@/message/message";
import { findAIBotByWallet } from "@/dbInterface/aibot";

// 按钱包地址查询绑定的机器人（无登录校验；信任路径中的地址）
// GET /api/bots/query/[walletAddress]
// 示例：GET http://localhost:3000/api/bots/query/0x0000000000000000000000000000000000000001
async function handler(req: NextApiRequest, res: NextApiResponse<QueryAIBotResponse | { error: string }>) {
  try {
    if (req.method !== "GET") {
      res.setHeader("Allow", "GET");
      return sendJson(res, 405, { error: "Method not allowed" });
    }

    const raw = req.query.walletAddress;
    const walletAddress = typeof raw === "string" ? raw : Array.isArray(raw) ? raw[0] : "";
    if (!walletAddress?.trim() || !isAddress(walletAddress.trim())) {
      throw new BadRequestError("Invalid wallet address");
    }

    const bot = await findAIBotByWallet(walletAddress.trim());
    return sendJson(res, 200, { bot });
  } catch (error) {
    return sendError(res, error);
  }
}

export default withCors(handler);
