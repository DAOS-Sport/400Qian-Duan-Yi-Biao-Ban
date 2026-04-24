import type { SystemOverviewDto } from "@shared/domain/workbench";
import { apiGet } from "@/shared/api/client";

export interface IntegrationAdapterSummary {
  name: string;
  mode: string;
  configured: boolean;
}

export interface IntegrationOverviewDto {
  checkedAt: string;
  adapters: IntegrationAdapterSummary[];
}

export const fetchIntegrationOverview = () =>
  apiGet<IntegrationOverviewDto>("/api/bff/system/integration-overview");

export const fetchSystemOverviewForIntegrations = () =>
  apiGet<SystemOverviewDto>("/api/bff/system/overview");
