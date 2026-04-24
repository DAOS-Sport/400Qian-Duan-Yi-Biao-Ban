import type { ScheduleAdapter } from "./adapter";
import { sourceOk } from "../../shared/integrations/source-status";

export const mockScheduleAdapter: ScheduleAdapter = {
  async listTodayShifts(facilityKey) {
    return sourceOk("mock-schedule", [
      {
        id: "shift-early",
        facilityKey,
        label: "早班",
        startsAt: "2026-04-23T08:00:00+08:00",
        endsAt: "2026-04-23T16:00:00+08:00",
      },
      {
        id: "shift-late",
        facilityKey,
        label: "晚班",
        startsAt: "2026-04-23T16:00:00+08:00",
        endsAt: "2026-04-23T22:00:00+08:00",
      },
    ]);
  },
};
