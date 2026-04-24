import type { RagicAuthAdapter } from "./auth-adapter";
import { sourceOk, sourceUnavailable } from "../../shared/integrations/source-status";

export const mockRagicAuthAdapter: RagicAuthAdapter = {
  async verifyCredentials(username, password) {
    if (username !== "1111" || password !== "1111") {
      return sourceUnavailable("mock-ragic-auth", "開發測試帳密為 1111 / 1111", "INVALID_CREDENTIALS");
    }

    return sourceOk("mock-ragic-auth", {
      userId: "dev-fullstack-1111",
      displayName: "全端測試開發",
      employeeNumber: "1111",
    });
  },
};
