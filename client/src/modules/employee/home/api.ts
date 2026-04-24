import type { EmployeeHomeDto } from "@shared/domain/workbench";
import { apiGet, apiPost } from "@/shared/api/client";
import type { HandoverEntryDTO, QuickLinkDTO } from "@/types/portal";

export const fetchEmployeeHome = () => apiGet<EmployeeHomeDto>("/api/bff/employee/home");

export const fetchEmployeeHandovers = (facilityKey: string) =>
  apiGet<{ items: HandoverEntryDTO[] }>(`/api/portal/handovers?facilityKey=${encodeURIComponent(facilityKey)}&limit=50`);

export const createEmployeeHandover = (facilityKey: string, content: string) =>
  apiPost<HandoverEntryDTO>("/api/portal/handovers", { facilityKey, content, shiftLabel: "員工工作台" });

export const fetchEmployeeQuickLinks = (facilityKey: string) =>
  apiGet<{ items: QuickLinkDTO[] }>(`/api/portal/quick-links?facilityKey=${encodeURIComponent(facilityKey)}`);
