import { apiGet } from "@/shared/api/client";
import type { SystemOverviewDto } from "@shared/domain/workbench";
import type { AnomalyReport } from "@/modules/supervisor/anomalies/api";

export const fetchSystemAlertsOverview = () =>
  apiGet<SystemOverviewDto>("/api/bff/system/overview");

export const fetchSystemAnomalyReports = () =>
  apiGet<AnomalyReport[]>("/api/anomaly-reports");
