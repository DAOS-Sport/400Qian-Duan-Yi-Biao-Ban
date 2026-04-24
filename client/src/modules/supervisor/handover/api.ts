import { apiGet, apiPost } from "@/shared/api/client";
import type { HandoverEntryDTO } from "@/types/portal";

export const fetchSupervisorHandovers = (facilityKey: string) =>
  apiGet<{ items: HandoverEntryDTO[] }>(`/api/portal/handovers?facilityKey=${encodeURIComponent(facilityKey)}&limit=100`);

export const createSupervisorHandover = (facilityKey: string, content: string) =>
  apiPost<HandoverEntryDTO>("/api/portal/handovers", { facilityKey, content, shiftLabel: "主管工作台" });
