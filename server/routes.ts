import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

const BASE_URL = "https://line-bot-assistant-ronchen2.replit.app";

const PROXY_ENDPOINTS: Record<string, string> = {
  "/api/dashboard/feature-stats": "/api/admin/dashboard/feature-stats",
  "/api/dashboard/tasks-stats": "/api/admin/tasks/stats",
  "/api/dashboard/attendance-stats": "/api/admin/attendance/stats",
};

async function proxyRequest(upstreamPath: string) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(`${BASE_URL}${upstreamPath}`, {
      headers: { Accept: "application/json" },
      signal: controller.signal,
    });
    clearTimeout(timeout);

    const contentType = response.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      return { ok: false, status: 502, body: { error: "Upstream did not return JSON" } };
    }
    const data = await response.json();
    return { ok: true, status: response.status, body: data };
  } catch (err: any) {
    clearTimeout(timeout);
    const message = err.name === "AbortError" ? "Upstream timed out" : (err.message || "Fetch failed");
    return { ok: false, status: 502, body: { error: message } };
  }
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  for (const [localPath, upstreamPath] of Object.entries(PROXY_ENDPOINTS)) {
    app.get(localPath, async (_req, res) => {
      const result = await proxyRequest(upstreamPath);
      res.status(result.status).json(result.body);
    });
  }

  return httpServer;
}
