import type { NextApiResponse } from "next";
import { HttpError } from "@/lib/http-errors";

export function sendJson(res: NextApiResponse, statusCode: number, body: unknown) {
  res.status(statusCode).json(body);
}

export function sendError(res: NextApiResponse, error: unknown) {
  if (error instanceof HttpError) {
    return sendJson(res, error.statusCode, {
      error: error.message,
      code: error.code,
      details: error.details
    });
  }

  console.error(error);
  return sendJson(res, 500, {
    error: "Internal server error"
  });
}
