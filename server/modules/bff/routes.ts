import type { Express } from "express";
import type { AppContainer } from "../../app/container";
import { env } from "../../shared/config/env";
import {
  getSupervisorDashboardFromSources,
  getSupervisorDashboardMock,
  getSystemOverviewFromSources,
  getSystemOverviewMock,
} from "./employee-home";

export const registerBffRoutes = (app: Express, container: AppContainer) => {
  app.get("/api/bff/employee/home", async (req, res) => {
    const facilityKey = typeof req.query.facilityKey === "string" ? req.query.facilityKey : "xinbei_pool";
    const result = await container.integrations.replitData.getEmployeeHomeProjection(facilityKey);

    if (!result.data) {
      return res.status(503).json({
        message: result.meta.fallbackReason || "Employee home projection is unavailable",
        meta: result.meta,
      });
    }

    return res.json(result.data);
  });

  app.get("/api/bff/supervisor/dashboard", async (_req, res) => {
    return res.json(env.dataSourceMode === "mock" ? getSupervisorDashboardMock() : await getSupervisorDashboardFromSources());
  });

  app.get("/api/bff/system/overview", async (_req, res) => {
    return res.json(env.dataSourceMode === "mock" ? getSystemOverviewMock() : await getSystemOverviewFromSources());
  });
};
