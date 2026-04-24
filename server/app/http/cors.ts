import type { RequestHandler } from "express";
import { isTrustedOrigin } from "../../shared/security/origin";

export const corsMiddleware: RequestHandler = (req, res, next) => {
  const origin = req.headers.origin;

  if (origin && isTrustedOrigin(origin)) {
    res.header("Access-Control-Allow-Origin", origin);
    res.header("Vary", "Origin");
    res.header("Access-Control-Allow-Credentials", "true");
  }

  res.header("Access-Control-Allow-Methods", "GET, POST, PATCH, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, Accept, X-CSRF-Token");

  if (req.method === "OPTIONS") {
    if (!origin || isTrustedOrigin(origin)) return res.sendStatus(204);
    return res.status(403).json({ message: "Origin is not allowed" });
  }

  next();
};
