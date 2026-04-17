import type {
  FacilityHomeResponse,
  FacilityMustReadItem,
  FacilityCampaign,
  FacilityHandoverItem,
  FacilityShiftEntry,
} from "@/types/portal";
import type { AnnouncementCandidate, AnnouncementCandidatesResponse } from "@/types/announcement";

async function safeJson<T>(url: string): Promise<T | null> {
  try {
    const res = await fetch(url, { headers: { Accept: "application/json" } });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

function announcementToMustRead(c: AnnouncementCandidate): FacilityMustReadItem {
  const isRule = c.candidateType === "rule" || c.candidateType === "script";
  return {
    id: c.id,
    title: c.title || "(無標題)",
    summary: c.summary,
    candidateType: c.candidateType,
    recommendedAction: c.recommendedAction,
    recommendedReply: c.recommendedReply,
    badExample: c.badExample,
    originalText: c.originalText,
    scopeType: c.scopeType,
    needsAck: isRule,
    reasoningTags: c.reasoningTags,
    effectiveStartAt: c.startAt || undefined,
    effectiveEndAt: c.endAt || undefined,
    detectedAt: c.detectedAt,
    displayName: c.displayName,
    groupId: c.groupId,
    groupName: c.groupName,
    status: isRule ? "ALERT" : c.candidateType === "notice" ? "DEGRADED" : "OPERATIONAL",
  };
}

function announcementToCampaign(c: AnnouncementCandidate): FacilityCampaign {
  return {
    id: c.id,
    title: c.title || "(無標題)",
    summary: c.summary,
    startAt: c.startAt || undefined,
    endAt: c.endAt || undefined,
    candidateType: c.candidateType,
    detectedAt: c.detectedAt,
  };
}

async function fetchAnnouncementsByFacility(
  facilityName: string,
  candidateTypes: string[],
  pageSize = 30,
): Promise<AnnouncementCandidate[]> {
  const params = new URLSearchParams({
    status: "approved",
    facilityName,
    pageSize: String(pageSize),
  });
  if (candidateTypes.length === 1) params.set("candidateType", candidateTypes[0]);
  const data = await safeJson<AnnouncementCandidatesResponse>(`/api/announcement-candidates?${params}`);
  if (!data) return [];
  const items = data.candidates || data.items || [];
  if (candidateTypes.length > 1) {
    return items.filter((c) => candidateTypes.includes(c.candidateType));
  }
  return items;
}

export async function fetchPortalHome(
  groupId: string,
  facilityName: string,
): Promise<FacilityHomeResponse> {
  // Try dedicated endpoint first
  const upstream = await safeJson<FacilityHomeResponse>(
    `/api/facility-home/${encodeURIComponent(groupId)}/home`,
  );
  if (upstream && (upstream.handover || upstream.mustRead || upstream.announcements)) {
    return upstream;
  }

  // Fallback: derive from existing announcement-candidates by facilityName
  const [rules, notices, campaigns] = await Promise.all([
    fetchAnnouncementsByFacility(facilityName, ["rule", "notice", "script"], 30),
    fetchAnnouncementsByFacility(facilityName, ["notice"], 20),
    fetchAnnouncementsByFacility(facilityName, ["campaign", "discount"], 10),
  ]);

  return {
    facility: { groupId, name: facilityName },
    handover: [], // no fallback source — empty state
    mustRead: rules.slice(0, 5).map(announcementToMustRead),
    announcements: notices.slice(0, 6).map(announcementToMustRead),
    campaigns: campaigns.slice(0, 3).map(announcementToCampaign),
    shift: [],
    lastRefreshedAt: new Date().toISOString(),
  };
}

export async function fetchPortalAnnouncements(
  groupId: string,
  facilityName: string,
  filters: { type?: string; keyword?: string } = {},
): Promise<FacilityMustReadItem[]> {
  // Try dedicated endpoint
  const params = new URLSearchParams();
  if (filters.type) params.set("type", filters.type);
  const upstream = await safeJson<{ items?: FacilityMustReadItem[] } | FacilityMustReadItem[]>(
    `/api/facility-home/${encodeURIComponent(groupId)}/announcements${params.toString() ? "?" + params : ""}`,
  );
  if (upstream) {
    if (Array.isArray(upstream)) return upstream;
    if (upstream.items) return upstream.items;
  }

  // Fallback
  const types = filters.type
    ? filters.type.split(",")
    : ["rule", "notice", "script", "campaign", "discount"];
  const items = await fetchAnnouncementsByFacility(facilityName, types, 50);
  let mapped = items.map(announcementToMustRead);
  if (filters.keyword) {
    const kw = filters.keyword.toLowerCase();
    mapped = mapped.filter((m) =>
      (m.title && m.title.toLowerCase().includes(kw)) ||
      (m.summary && m.summary.toLowerCase().includes(kw)) ||
      (m.originalText && m.originalText.toLowerCase().includes(kw))
    );
  }
  return mapped;
}

export async function fetchPortalAnnouncementDetail(
  groupId: string,
  id: string | number,
): Promise<FacilityMustReadItem | null> {
  const upstream = await safeJson<FacilityMustReadItem>(
    `/api/facility-home/${encodeURIComponent(groupId)}/announcements/${encodeURIComponent(String(id))}`,
  );
  if (upstream) return upstream;

  const fallback = await safeJson<AnnouncementCandidate>(`/api/announcement-candidates/${id}`);
  if (fallback) return announcementToMustRead(fallback);
  return null;
}

export async function fetchTodayShift(groupId: string): Promise<FacilityShiftEntry[]> {
  const upstream = await safeJson<{ items?: FacilityShiftEntry[] } | FacilityShiftEntry[]>(
    `/api/facility-home/${encodeURIComponent(groupId)}/today-shift`,
  );
  if (!upstream) return [];
  if (Array.isArray(upstream)) return upstream;
  return upstream.items || [];
}

export async function fetchHandover(groupId: string): Promise<FacilityHandoverItem[]> {
  const upstream = await safeJson<{ items?: FacilityHandoverItem[] } | FacilityHandoverItem[]>(
    `/api/facility-home/${encodeURIComponent(groupId)}/handover`,
  );
  if (!upstream) return [];
  if (Array.isArray(upstream)) return upstream;
  return upstream.items || [];
}

export async function ackAnnouncement(groupId: string, id: string | number): Promise<boolean> {
  try {
    const res = await fetch(
      `/api/facility-home/${encodeURIComponent(groupId)}/announcements/${encodeURIComponent(String(id))}/ack`,
      { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" },
    );
    return res.ok;
  } catch {
    return false;
  }
}
