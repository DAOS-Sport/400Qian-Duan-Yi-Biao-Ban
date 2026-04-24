export type SourceStatus = "ok" | "stale" | "unavailable" | "degraded";

export interface SourceMeta {
  source: string;
  status: SourceStatus;
  lastSyncAt?: string;
  errorCode?: string;
  fallbackReason?: string;
}

export interface SourceResult<T> {
  data: T | null;
  meta: SourceMeta;
}

export const sourceOk = <T>(source: string, data: T, lastSyncAt = new Date().toISOString()): SourceResult<T> => ({
  data,
  meta: { source, status: "ok", lastSyncAt },
});

export const sourceUnavailable = <T>(
  source: string,
  fallbackReason: string,
  errorCode = "SOURCE_UNAVAILABLE",
): SourceResult<T> => ({
  data: null,
  meta: { source, status: "unavailable", errorCode, fallbackReason },
});
