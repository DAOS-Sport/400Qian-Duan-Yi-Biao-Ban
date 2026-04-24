import { randomUUID } from "crypto";
import type { RequestHandler } from "express";

export const createCorrelationId = () => randomUUID();

export const correlationMiddleware: RequestHandler = (req, res, next) => {
  const incoming = req.headers["x-correlation-id"];
  const correlationId = typeof incoming === "string" && incoming.length > 0 ? incoming : createCorrelationId();
  res.setHeader("X-Correlation-Id", correlationId);
  req.headers["x-correlation-id"] = correlationId;
  next();
};
