import { env } from "../../shared/config/env";
import type { ReplitDataAdapter } from "./adapter";
import { mockReplitDataAdapter } from "./mock-adapter";
import { realReplitDataAdapter } from "./real-adapter";

export const createReplitDataAdapter = (): ReplitDataAdapter =>
  env.replitDataAdapterMode === "real" ? realReplitDataAdapter : mockReplitDataAdapter;
