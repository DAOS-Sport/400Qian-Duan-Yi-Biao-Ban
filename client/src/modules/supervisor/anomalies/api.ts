import { apiDelete, apiGet, apiPatch } from "@/shared/api/client";

export interface AnomalyReport {
  id: string | number;
  employeeName: string | null;
  employeeCode: string | null;
  role: string | null;
  context: string;
  clockStatus: string | null;
  clockType: string | null;
  clockTime: string | null;
  venueName: string | null;
  distance: string | null;
  failReason: string | null;
  errorMsg: string | null;
  userNote: string | null;
  imageUrls: string[] | null;
  reportText: string | null;
  resolution: "pending" | "resolved" | string | null;
  resolvedNote: string | null;
  createdAt: string;
}

export interface NotificationRecipient {
  id: number;
  email: string;
  label: string | null;
  enabled: boolean;
  notifyNewReport: boolean;
  notifyResolution: boolean;
  createdAt: string;
}

export const fetchAnomalyReports = () => apiGet<AnomalyReport[]>("/api/anomaly-reports");

export const resolveAnomalyReport = (id: string | number, resolution: "pending" | "resolved", resolvedNote?: string) =>
  apiPatch<AnomalyReport>(`/api/anomaly-reports/${id}/resolution`, { resolution, resolvedNote });

export const deleteAnomalyReport = (id: string | number) =>
  apiDelete<{ success: boolean }>(`/api/anomaly-reports/${id}`);

export const fetchNotificationRecipients = () =>
  apiGet<NotificationRecipient[]>("/api/notification-recipients");
