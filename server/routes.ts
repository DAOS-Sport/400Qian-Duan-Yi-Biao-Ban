import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

const EXTERNAL_API_URL =
  "https://line-bot-assistant-ronchen2.replit.app/api/admin/dashboard/feature-stats";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  app.get("/api/dashboard/feature-stats", async (_req, res) => {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);

      const response = await fetch(EXTERNAL_API_URL, {
        headers: { Accept: "application/json" },
        signal: controller.signal,
      });
      clearTimeout(timeout);

      const contentType = response.headers.get("content-type") || "";
      if (!contentType.includes("application/json")) {
        return res
          .status(502)
          .json({ error: "Upstream API did not return JSON" });
      }

      const data = await response.json();
      res.json(data);
    } catch (err: any) {
      const message =
        err.name === "AbortError"
          ? "Upstream API timed out"
          : err.message || "Failed to fetch from upstream";
      res.status(502).json({ error: message });
    }
  });

  return httpServer;
}
