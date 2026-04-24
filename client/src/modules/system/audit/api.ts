import { apiGet } from "@/shared/api/client";
import type { PortalEventStats } from "@/types/portal";

export interface UiEventOverview {
  totalEvents: number;
  totalClientErrors: number;
}

export const fetchUiEventOverview = () =>
  apiGet<UiEventOverview>("/api/bff/system/ui-event-overview");

export const fetchAuditPortalAnalytics = () =>
  apiGet<PortalEventStats>("/api/portal/analytics?sinceDays=30");
