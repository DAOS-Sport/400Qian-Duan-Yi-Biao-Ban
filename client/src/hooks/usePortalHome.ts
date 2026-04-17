import { useQuery } from "@tanstack/react-query";
import {
  fetchPortalHome,
  fetchPortalAnnouncements,
  fetchPortalAnnouncementDetail,
  fetchTodayShift,
  fetchHandover,
} from "@/lib/portalApi";
import type { FacilityHomeResponse, FacilityMustReadItem, FacilityShiftEntry, FacilityHandoverItem } from "@/types/portal";

export function usePortalHome(groupId: string, facilityName: string) {
  return useQuery<FacilityHomeResponse>({
    queryKey: ["facility-home", groupId, "home"],
    queryFn: () => fetchPortalHome(groupId, facilityName),
    enabled: !!groupId,
  });
}

export function useFacilityAnnouncements(
  groupId: string,
  facilityName: string,
  filters: { type?: string; keyword?: string } = {},
) {
  return useQuery<FacilityMustReadItem[]>({
    queryKey: ["facility-home", groupId, "announcements", filters],
    queryFn: () => fetchPortalAnnouncements(groupId, facilityName, filters),
    enabled: !!groupId,
  });
}

export function useFacilityAnnouncementDetail(groupId: string, id: string | number | null) {
  return useQuery<FacilityMustReadItem | null>({
    queryKey: ["facility-home", groupId, "announcement", id],
    queryFn: () => (id ? fetchPortalAnnouncementDetail(groupId, id) : Promise.resolve(null)),
    enabled: !!groupId && !!id,
  });
}

export function useTodayShift(groupId: string) {
  return useQuery<FacilityShiftEntry[]>({
    queryKey: ["facility-home", groupId, "today-shift"],
    queryFn: () => fetchTodayShift(groupId),
    enabled: !!groupId,
  });
}

export function useHandover(groupId: string) {
  return useQuery<FacilityHandoverItem[]>({
    queryKey: ["facility-home", groupId, "handover"],
    queryFn: () => fetchHandover(groupId),
    enabled: !!groupId,
  });
}
