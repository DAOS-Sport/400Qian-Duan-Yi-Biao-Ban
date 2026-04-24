import { env } from "../../shared/config/env";
import type { RagicAuthAdapter } from "./auth-adapter";
import { mockRagicAuthAdapter } from "./mock-auth-adapter";
import { realRagicAuthAdapter } from "./real-auth-adapter";

export const createRagicAuthAdapter = (): RagicAuthAdapter =>
  env.ragicAdapterMode === "real" ? realRagicAuthAdapter : mockRagicAuthAdapter;
