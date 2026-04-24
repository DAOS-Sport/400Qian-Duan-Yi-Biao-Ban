import { env } from "../../shared/config/env";
import { sourceOk, sourceUnavailable } from "../../shared/integrations/source-status";
import type { ReplitDataAdapter } from "./adapter";

export const realReplitDataAdapter: ReplitDataAdapter = {
  async getEmployeeHomeProjection(facilityKey) {
    if (!env.replitDataBaseUrl || !env.replitDataApiToken) {
      return sourceUnavailable(
        "replit-data",
        "REPLIT_DATA_BASE_URL or REPLIT_DATA_API_TOKEN is not configured",
        "REPLIT_DATA_NOT_CONFIGURED",
      );
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), env.replitDataTimeoutMs);

    try {
      const url = new URL(`/api/bff/employee/home`, env.replitDataBaseUrl);
      url.searchParams.set("facilityKey", facilityKey);

      const response = await fetch(url, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${env.replitDataApiToken}`,
        },
        signal: controller.signal,
      });

      if (!response.ok) {
        return sourceUnavailable(
          "replit-data",
          `Replit data source returned ${response.status}`,
          "REPLIT_DATA_HTTP_ERROR",
        );
      }

      return sourceOk("replit-data", await response.json());
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown Replit data source error";
      return sourceUnavailable("replit-data", message, "REPLIT_DATA_REQUEST_FAILED");
    } finally {
      clearTimeout(timeout);
    }
  },
};
