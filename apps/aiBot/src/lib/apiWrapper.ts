import type { NextApiRequest, NextApiResponse } from "next";

const ALLOW_METHODS = "GET,DELETE,PATCH,POST,PUT,OPTIONS";
const ALLOW_HEADERS =
  "X-CSRF-Token, X-Requested-With, Authorization, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, X-Recaptcha-Token";

function getAllowedOrigin(req: NextApiRequest) {
  const origin = req.headers.origin;
  const host = req.headers.host;

  if (!origin || !host) {
    return null;
  }

  try {
    const originUrl = new URL(origin);
    return originUrl.host === host ? origin : null;
  } catch {
    return null;
  }
}

export function withCors(
  handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void> | void
) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const allowedOrigin = getAllowedOrigin(req);

    if (allowedOrigin) {
      res.setHeader("Vary", "Origin");
      res.setHeader("Access-Control-Allow-Credentials", "true");
      res.setHeader("Access-Control-Allow-Origin", allowedOrigin);
      res.setHeader("Access-Control-Allow-Methods", ALLOW_METHODS);
      res.setHeader("Access-Control-Allow-Headers", ALLOW_HEADERS);
      res.setHeader("Access-Control-Max-Age", "86400");
    }

    if (req.method === "OPTIONS") {
      res.status(allowedOrigin ? 204 : 403).end();
      return;
    }

    await handler(req, res);
  };
}
