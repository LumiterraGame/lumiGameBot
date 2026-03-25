// Structured decision endpoint for local Bot API integration testing.
// POST /api/brain/decision

import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import { sendError, sendJson } from "@/lib/api";
import { withCors } from "@/lib/apiWrapper";
import { BadRequestError, MethodNotAllowedError } from "@/lib/http-errors";
import { generateStructuredDecision } from "@/lib/decision";
import type { BotDecisionRequest, BotDecisionResponse } from "@/message/message";

const walletAddressSchema = z.string().regex(/^0x[a-fA-F0-9]{40}$/, "wallet_address must be a valid EVM address");

const decisionSnapshotFieldSchema = z.object({
  key: z.string().trim().min(1),
  source: z.enum(["client_local", "client_response", "public_api", "onchain"]),
  value: z.unknown()
});

const requestSchema = z.object({
  wallet_address: walletAddressSchema,
  snapshot: z.object({
    fields: z.array(decisionSnapshotFieldSchema)
  }),
  entitlement: z
    .object({
      plan_id: z.string().trim().min(1).optional(),
      plan_name: z.string().trim().min(1).optional(),
      entitlement_status: z.enum(["active", "grace", "expired", "disabled"]).optional(),
      enabled_money_loops: z.array(z.string().trim().min(1)).optional(),
      enabled_ai_features: z.array(z.string().trim().min(1)).optional()
    })
    .optional(),
  candidate_money_loops: z.array(z.string().trim().min(1)).optional()
});

function parseRequest(body: unknown): BotDecisionRequest {
  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    throw new BadRequestError(parsed.error.issues[0]?.message ?? "Invalid request body");
  }

  return parsed.data as BotDecisionRequest;
}

async function handler(req: NextApiRequest, res: NextApiResponse<BotDecisionResponse | { error: string }>) {
  try {
    if (req.method !== "POST") {
      throw new MethodNotAllowedError();
    }

    const payload = parseRequest(req.body);
    const decision = generateStructuredDecision(payload);

    console.log("payload", payload);
    console.log("decision", decision);
    return sendJson(res, 200, decision);
  } catch (error) {
    return sendError(res, error);
  }
}

export default withCors(handler);
