import { env, isProduction } from "../config/env";

const devOrigins = new Set([
  "http://localhost:5000",
  "http://127.0.0.1:5000",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
]);

export const isTrustedOrigin = (origin: string): boolean => {
  if (env.allowedOrigins.length > 0) return env.allowedOrigins.includes(origin);
  if (!isProduction) return devOrigins.has(origin);
  return false;
};
