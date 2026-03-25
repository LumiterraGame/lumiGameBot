// Temporary free-text GPT bridge for local experimentation.
// POST /api/brain/respond
// Request JSON example:
// {"model":"gpt-5.4","input":"Summarize the next best action for this role.","systemPrompt":"You are an AI brain for a game bot.","maxOutputTokens":500}
// curl example: curl -sS -X POST "http://localhost:3001/api/brain/respond" -H "content-type: application/json" -d '{"model":"gpt-5.4","input":"Say hello from GPT-5.4"}'
// Success 200 {"data":{"model":"gpt-5.4","responseId":"resp_xxx","outputText":"..."}}

import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import { sendError, sendJson } from "@/lib/api";
import { withCors } from "@/lib/apiWrapper";
import { BadRequestError, MethodNotAllowedError } from "@/lib/http-errors";
import { generateBrainText } from "@/lib/openai";
import type { GenerateBrainResponse, GenerateBrainResponseRequest } from "@/message/message";

const requestSchema = z.object({
  model: z.string().trim().min(1).max(200).optional(),
  input: z.string().trim().min(1, "input is required"),
  systemPrompt: z.string().trim().min(1).optional(),
  maxOutputTokens: z.number().int().positive().max(64000).optional()
});

function parseRequest(body: unknown): GenerateBrainResponseRequest {
  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    throw new BadRequestError(parsed.error.issues[0]?.message ?? "Invalid request body");
  }

  return parsed.data;
}

async function handler(req: NextApiRequest, res: NextApiResponse<GenerateBrainResponse | { error: string }>) {
  try {
    if (req.method !== "POST") {
      throw new MethodNotAllowedError();
    }

    const payload = parseRequest(req.body);
    const result = await generateBrainText(payload);

    return sendJson(res, 200, {
      data: {
        model: result.requestModel,
        responseId: result.responseId,
        outputText: result.outputText
      }
    });
  } catch (error) {
    return sendError(res, error);
  }
}

export default withCors(handler);
