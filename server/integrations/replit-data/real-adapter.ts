import { env } from "../../shared/config/env";
import { sourceOk, sourceUnavailable } from "../../shared/integrations/source-status";
import { findFacilityLineGroup } from "@shared/domain/facilities";
import type { EmployeeHomeDto, AnnouncementSummary, HandoverSummary, ShiftSummary } from "@shared/domain/workbench";
import type { ReplitDataAdapter } from "./adapter";

const asArray = <T>(value: unknown): T[] => {
  if (Array.isArray(value)) return value as T[];
  if (value && typeof value === "object" && Array.isArray((value as { items?: unknown }).items)) {
    return (value as { items: T[] }).items;
  }
  return [];
};

const readText = (value: unknown, fallback = "") => (typeof value === "string" && value.trim() ? value : fallback);

const normalizeFacilityHome = (facilityKey: string, raw: unknown): EmployeeHomeDto => {
  const facility = findFacilityLineGroup(facilityKey);
  const payload = raw && typeof raw === "object" ? raw as Record<string, unknown> : {};
  const announcementsRaw = asArray<Record<string, unknown>>(payload.announcements);
  const handoverRaw = asArray<Record<string, unknown>>(payload.handover);
  const shiftsRaw = asArray<Record<string, unknown>>(payload.shifts || payload.todayShift);

  const announcements: AnnouncementSummary[] = announcementsRaw.map((item, index) => ({
    id: String(item.id ?? item._id ?? `ann-${index}`),
    title: readText(item.title, "未命名公告"),
    summary: readText(item.summary ?? item.content ?? item.originalText, ""),
    priority: item.priority === "required" || item.priority === "high" ? item.priority : "normal",
    effectiveRange: readText(item.effectiveRange ?? item.dateRange ?? item.detectedAt, "即時"),
  }));

  const handover: HandoverSummary[] = handoverRaw.map((item, index) => ({
    id: String(item.id ?? item._id ?? `handover-${index}`),
    title: readText(item.title ?? item.content, "交接事項"),
    authorName: readText(item.authorName ?? item.employeeName, "值班人員"),
    status: "unread",
  }));

  const shifts: ShiftSummary[] = shiftsRaw.map((item, index) => ({
    id: String(item.id ?? item._id ?? `shift-${index}`),
    label: readText(item.label ?? item.shiftLabel ?? item.name, "班別"),
    timeRange: readText(item.timeRange ?? `${readText(item.startsAt)} - ${readText(item.endsAt)}`, "依排班系統"),
    status: index === 0 ? "active" : "upcoming",
  }));

  return {
    facility: {
      key: facility?.facilityKey ?? facilityKey,
      name: facility?.fullName ?? readText(payload.facilityName, facilityKey),
      businessDate: new Date().toLocaleDateString("zh-TW"),
      statusLabel: "營運中",
    },
    weather: { status: "unavailable", data: null, meta: { fallbackReason: "天氣資料未由外部來源提供" } },
    tasks: { status: "ok", data: [], meta: { lastSyncAt: new Date().toISOString() } },
    announcements: { status: "ok", data: announcements, meta: { lastSyncAt: new Date().toISOString() } },
    handover: { status: "ok", data: handover, meta: { lastSyncAt: new Date().toISOString() } },
    shortcuts: { status: "ok", data: [], meta: { lastSyncAt: new Date().toISOString() } },
    shifts: { status: "ok", data: shifts, meta: { lastSyncAt: new Date().toISOString() } },
    campaigns: { status: "ok", data: [], meta: { lastSyncAt: new Date().toISOString() } },
    documents: { status: "ok", data: [], meta: { lastSyncAt: new Date().toISOString() } },
  };
};

export const realReplitDataAdapter: ReplitDataAdapter = {
  async getEmployeeHomeProjection(facilityKey) {
    const facility = findFacilityLineGroup(facilityKey);
    if (!facility) {
      return sourceUnavailable(
        "replit-data",
        `Unknown facility or LINE group id: ${facilityKey}`,
        "FACILITY_LINE_GROUP_NOT_FOUND",
      );
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), env.externalApiTimeoutMs);

    try {
      const url = new URL(`/api/facility-home/${facility.lineGroupId}/home`, env.lineBotBaseUrl);

      const response = await fetch(url, {
        headers: {
          Accept: "application/json",
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

      return sourceOk("line-bot-facility-home", normalizeFacilityHome(facility.facilityKey, await response.json()));
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown LINE Bot facility-home error";
      return sourceUnavailable("line-bot-facility-home", message, "LINE_BOT_REQUEST_FAILED");
    } finally {
      clearTimeout(timeout);
    }
  },
};
