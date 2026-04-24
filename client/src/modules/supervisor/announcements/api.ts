import type {
  AnnouncementCandidate,
  AnnouncementCandidateDetail,
  AnnouncementCandidatesResponse,
  AnnouncementFilters,
  AnnouncementSummaryResponse,
} from "@/types/announcement";
import { apiGet, apiPost } from "@/shared/api/client";

const buildQueryString = (filters: AnnouncementFilters) => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") params.set(key, String(value));
  });
  const query = params.toString();
  return query ? `?${query}` : "";
};

export const fetchAnnouncementSummary = () =>
  apiGet<AnnouncementSummaryResponse>("/api/announcement-dashboard/summary");

export const fetchAnnouncementCandidates = (filters: AnnouncementFilters) =>
  apiGet<AnnouncementCandidatesResponse>(`/api/announcement-candidates${buildQueryString(filters)}`);

export const fetchAnnouncementCandidate = (id: number | string) =>
  apiGet<AnnouncementCandidateDetail>(`/api/announcement-candidates/${id}`);

export const approveAnnouncementCandidate = (candidate: AnnouncementCandidate, reviewedBy: string) =>
  apiPost(`/api/announcement-candidates/${candidate.id}/approve`, {
    reviewedBy,
    comment: "由主管工作台核准",
  });

export const rejectAnnouncementCandidate = (candidate: AnnouncementCandidate, reviewedBy: string, reason: string) =>
  apiPost(`/api/announcement-candidates/${candidate.id}/reject`, {
    reviewedBy,
    reason,
  });
