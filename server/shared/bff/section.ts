import type { BffSection } from "@shared/bff/envelope";

export const ok = <T>(data: T, lastSyncAt = new Date().toISOString()): BffSection<T> => ({
  status: "ok",
  data,
  meta: { lastSyncAt },
});

export const stale = <T>(
  data: T,
  lastSyncAt: string,
  fallbackReason = "Using cached projection",
): BffSection<T> => ({
  status: "stale",
  data,
  meta: { lastSyncAt, fallbackReason },
});

export const unavailable = <T>(
  fallbackReason: string,
  errorCode = "SOURCE_UNAVAILABLE",
): BffSection<T> => ({
  status: "unavailable",
  data: null,
  meta: { errorCode, fallbackReason },
});

export const degraded = <T>(
  data: T,
  failedSources: string[],
  lastSyncAt = new Date().toISOString(),
): BffSection<T> => ({
  status: "degraded",
  data,
  meta: {
    lastSyncAt,
    errorCode: "PARTIAL_SOURCE_FAILURE",
    fallbackReason: `部分來源暫時不可用：${failedSources.join(", ")}`,
  },
});
