import type { ScheduleAdapter } from "./adapter";
import { sourceUnavailable } from "../../shared/integrations/source-status";

export const realScheduleAdapter: ScheduleAdapter = {
  async listTodayShifts() {
    return sourceUnavailable(
      "schedule",
      "Real schedule adapter is reserved for Replit reconnect",
      "SCHEDULE_REAL_ADAPTER_NOT_CONNECTED",
    );
  },
};
