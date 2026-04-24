import type { SupervisorDashboardDto } from "@shared/domain/workbench";
import { apiGet } from "@/shared/api/client";

export const fetchSupervisorTaskBoard = () =>
  apiGet<SupervisorDashboardDto>("/api/bff/supervisor/dashboard");
