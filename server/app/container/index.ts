import { env } from "../../shared/config/env";
import { createIntegrations } from "../../integrations";
import { createTelemetryRepository } from "../../modules/telemetry/repository";

export const createAppContainer = () => ({
  config: env,
  integrations: createIntegrations(),
  repositories: {
    telemetry: createTelemetryRepository(),
  },
});

export type AppContainer = ReturnType<typeof createAppContainer>;
