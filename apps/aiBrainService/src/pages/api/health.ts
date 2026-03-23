// AI Brain Service health endpoint.
// GET /api/health
// curl example: curl -sS "http://localhost:3001/api/health"
// Success 200 {"ok":true,"service":"ai-brain-service"}

import type { NextApiRequest, NextApiResponse } from "next";
import { sendError, sendJson } from "@/lib/api";
import { withCors } from "@/lib/apiWrapper";
import { MethodNotAllowedError } from "@/lib/http-errors";
import type { BrainHealthResponse } from "@/message/message";

async function handler(req: NextApiRequest, res: NextApiResponse<BrainHealthResponse | { error: string }>) {
  try {
    if (req.method !== "GET") {
      throw new MethodNotAllowedError();
    }

    return sendJson(res, 200, {
      ok: true,
      service: "ai-brain-service"
    });
  } catch (error) {
    return sendError(res, error);
  }
}

export default withCors(handler);
