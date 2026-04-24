import type { RequestHandler } from "express";
import { HttpError } from "../../shared/errors/http-error";
import { getSessionIdFromCookie } from "./cookie";
import type { SessionStore } from "./session-store";

declare global {
  namespace Express {
    interface Request {
      sessionId?: string;
      workbenchSession?: Awaited<ReturnType<SessionStore["get"]>>;
    }
  }
}

export const attachSession = (sessionStore: SessionStore): RequestHandler => async (req, _res, next) => {
  const sessionId = getSessionIdFromCookie(req.headers.cookie);
  if (!sessionId) return next();

  const session = await sessionStore.get(sessionId);
  if (session) {
    req.sessionId = sessionId;
    req.workbenchSession = session;
  }

  next();
};

export const requireSession: RequestHandler = (req, _res, next) => {
  if (!req.workbenchSession) return next(new HttpError(401, "Authentication required", "AUTH_REQUIRED"));
  return next();
};
