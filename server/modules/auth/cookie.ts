import type { Response } from "express";
import { env, isProduction } from "../../shared/config/env";

export const parseCookieHeader = (cookieHeader: string | undefined): Record<string, string> => {
  if (!cookieHeader) return {};

  return cookieHeader.split(";").reduce<Record<string, string>>((acc, part) => {
    const [rawKey, ...rest] = part.trim().split("=");
    if (!rawKey) return acc;
    acc[rawKey] = decodeURIComponent(rest.join("="));
    return acc;
  }, {});
};

export const getSessionIdFromCookie = (cookieHeader: string | undefined): string | null =>
  parseCookieHeader(cookieHeader)[env.sessionCookieName] || null;

export const setSessionCookie = (res: Response, sessionId: string) => {
  const secure = isProduction ? "; Secure" : "";
  res.setHeader(
    "Set-Cookie",
    `${env.sessionCookieName}=${encodeURIComponent(sessionId)}; HttpOnly${secure}; SameSite=Lax; Path=/; Max-Age=${env.sessionTtlSeconds}`,
  );
};

export const clearSessionCookie = (res: Response) => {
  res.setHeader(
    "Set-Cookie",
    `${env.sessionCookieName}=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0`,
  );
};
