import type { Express } from "express";
import type { Server } from "http";
import { createAppContainer } from "../container";
import { registerAuthRoutes } from "../../modules/auth/routes";
import { registerBffRoutes } from "../../modules/bff/routes";
import { registerBackendModules } from "../../modules/register";
import { registerSystemRoutes } from "../../modules/system/routes";
import { registerTelemetryRoutes } from "../../modules/telemetry/routes";

export const registerNewArchitectureRoutes = (_httpServer: Server, app: Express) => {
  const container = createAppContainer();
  registerBackendModules(container);
  registerAuthRoutes(app, container);
  registerTelemetryRoutes(app, container);
  registerSystemRoutes(app, container);
  registerBffRoutes(app, container);
};
