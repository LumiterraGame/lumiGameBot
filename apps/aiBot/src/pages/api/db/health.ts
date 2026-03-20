import type { NextApiRequest, NextApiResponse } from "next";
import { checkDbHealth } from "@/db/db-smoke";
import { sendError, sendJson } from "@/lib/api";

export default async function handler(_req: NextApiRequest, res: NextApiResponse) {
  try {
    const result = await checkDbHealth();
    sendJson(res, 200, result);
  } catch (error) {
    sendError(res, error);
  }
}
