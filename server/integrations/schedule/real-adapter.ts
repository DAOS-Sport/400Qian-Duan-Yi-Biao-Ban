import type { ScheduleAdapter } from "./adapter";
import { env } from "../../shared/config/env";
import { sourceOk, sourceUnavailable } from "../../shared/integrations/source-status";

export const realScheduleAdapter: ScheduleAdapter = {
  async listTodayShifts(facilityKey) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), env.externalApiTimeoutMs);

    try {
      const url = new URL("/api/admin/overview", env.smartScheduleBaseUrl);
      const response = await fetch(url, {
        headers: { Accept: "application/json" },
        signal: controller.signal,
      });

      if (!response.ok) {
        return sourceUnavailable("smart-schedule", `Smart Schedule returned ${response.status}`, "SMART_SCHEDULE_HTTP_ERROR");
      }

      const payload = await response.json() as Record<string, unknown>;
      const rows = Array.isArray(payload.shifts)
        ? payload.shifts
        : Array.isArray(payload.items)
          ? payload.items
          : [];

      return sourceOk(
        "smart-schedule",
        rows
          .filter((row): row is Record<string, unknown> => Boolean(row && typeof row === "object"))
          .filter((row) => !row.facilityKey || row.facilityKey === facilityKey)
          .map((row, index) => ({
            id: String(row.id ?? row._id ?? `smart-schedule-${index}`),
            facilityKey: String(row.facilityKey ?? facilityKey),
            label: String(row.label ?? row.shiftLabel ?? row.name ?? "班別"),
            startsAt: String(row.startsAt ?? row.startAt ?? ""),
            endsAt: String(row.endsAt ?? row.endAt ?? ""),
          })),
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown Smart Schedule error";
      return sourceUnavailable("smart-schedule", message, "SMART_SCHEDULE_REQUEST_FAILED");
    } finally {
      clearTimeout(timeout);
    }
  },
};
