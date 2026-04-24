import { apiGet } from "@/shared/api/client";
import type { QuickLinkDTO, SystemAnnouncementDTO } from "@/types/portal";

export const fetchSupervisorQuickLinks = (facilityKey: string) =>
  apiGet<{ items: QuickLinkDTO[] }>(`/api/portal/quick-links?facilityKey=${encodeURIComponent(facilityKey)}&includeInactive=true`);

export const fetchSupervisorSystemAnnouncements = (facilityKey: string) =>
  apiGet<{ items: SystemAnnouncementDTO[] }>(`/api/portal/system-announcements?facilityKey=${encodeURIComponent(facilityKey)}&includeInactive=true`);
