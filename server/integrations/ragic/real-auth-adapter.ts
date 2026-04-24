import type { RagicAuthAdapter } from "./auth-adapter";
import { sourceUnavailable } from "../../shared/integrations/source-status";

export const realRagicAuthAdapter: RagicAuthAdapter = {
  async verifyCredentials() {
    return sourceUnavailable(
      "ragic-auth",
      "Real Ragic external auth adapter is reserved for Replit reconnect",
      "RAGIC_REAL_ADAPTER_NOT_CONNECTED",
    );
  },
};
