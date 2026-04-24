import { apiGet, apiPost } from "@/shared/api/client";

export interface HrAuditResult {
  blacklist: {
    found: boolean;
    name: string;
    idMasked: string;
    reason: string;
  };
  lifeguard: {
    valid: boolean;
    qualification: string;
    expiry: string;
    status: string;
  };
}

export interface InterviewUser {
  id?: string | number;
  name?: string;
  displayName?: string;
  employeeName?: string;
  role?: string;
  status?: string;
  facilityName?: string;
  createdAt?: string;
}

export const runHrAudit = (query: string) =>
  apiPost<HrAuditResult>("/api/hr-audit", { query });

export const fetchInterviewUsers = () =>
  apiGet<InterviewUser[] | { items?: InterviewUser[]; users?: InterviewUser[] }>("/api/admin/interview-users");
