import { env } from "../../shared/config/env";
import type { ScheduleAdapter } from "./adapter";
import { mockScheduleAdapter } from "./mock-adapter";
import { realScheduleAdapter } from "./real-adapter";

export const createScheduleAdapter = (): ScheduleAdapter =>
  env.scheduleAdapterMode === "real" ? realScheduleAdapter : mockScheduleAdapter;
