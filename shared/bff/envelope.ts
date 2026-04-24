export type BffSectionStatus = "ok" | "stale" | "unavailable" | "degraded";

export interface BffSectionMeta {
  lastSyncAt?: string;
  errorCode?: string;
  fallbackReason?: string;
}

export interface BffSection<T> {
  status: BffSectionStatus;
  data: T | null;
  meta: BffSectionMeta;
}
