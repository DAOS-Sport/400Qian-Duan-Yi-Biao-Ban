import type { BffSection } from "../bff/envelope";

export interface FacilitySummary {
  key: string;
  name: string;
  businessDate: string;
  statusLabel: string;
}

export interface WeatherSummary {
  temperatureC: number;
  label: string;
  humidity: number;
}

export interface TaskSummary {
  id: string;
  title: string;
  status: "pending" | "in_progress" | "reported" | "done";
  priority: "low" | "normal" | "high";
}

export interface AnnouncementSummary {
  id: string;
  title: string;
  summary: string;
  priority: "required" | "high" | "normal";
  effectiveRange: string;
}

export interface HandoverSummary {
  id: string;
  title: string;
  authorName: string;
  status: "unread" | "read" | "confirmed";
}

export interface ShortcutSummary {
  id: string;
  label: string;
  href: string;
  tone: "blue" | "green" | "amber" | "violet" | "rose" | "cyan";
}

export interface ShiftSummary {
  id: string;
  label: string;
  timeRange: string;
  status: "active" | "upcoming" | "finished";
}

export interface CampaignSummary {
  id: string;
  title: string;
  statusLabel: string;
  effectiveRange: string;
}

export interface DocumentSummary {
  id: string;
  title: string;
  updatedAt: string;
}

export interface EmployeeHomeDto {
  facility: FacilitySummary;
  weather: BffSection<WeatherSummary>;
  tasks: BffSection<TaskSummary[]>;
  announcements: BffSection<AnnouncementSummary[]>;
  handover: BffSection<HandoverSummary[]>;
  shortcuts: BffSection<ShortcutSummary[]>;
  shifts: BffSection<ShiftSummary[]>;
  campaigns: BffSection<CampaignSummary[]>;
  documents: BffSection<DocumentSummary[]>;
}

export interface SupervisorStaffingSummary {
  active: number;
  total: number;
  onShift: number;
  absent: number;
}

export interface SupervisorAnomalySummary {
  id: string;
  employeeName: string;
  issue: string;
  waitingMinutes: number;
  priority: "high" | "medium" | "low";
}

export interface SupervisorDashboardDto {
  facility: FacilitySummary;
  staffing: BffSection<SupervisorStaffingSummary>;
  pendingAnomalies: BffSection<SupervisorAnomalySummary[]>;
  incompleteTasks: BffSection<TaskSummary[]>;
  announcementAcks: BffSection<{ unconfirmed: number; totalRequired: number }>;
  handoverOverview: BffSection<{ open: number; confirmed: number }>;
  shifts: BffSection<ShiftSummary[]>;
  campaigns: BffSection<CampaignSummary[]>;
}

export interface SystemMetricSummary {
  label: string;
  value: string;
  status: "ok" | "warning" | "critical";
  helper: string;
}

export interface SystemIncidentSummary {
  id: string;
  title: string;
  time: string;
  severity: "critical" | "warning" | "info";
}

export interface SystemOverviewDto {
  checkedAt: string;
  healthScore: BffSection<{ score: number; statusLabel: string }>;
  metrics: BffSection<SystemMetricSummary[]>;
  incidents: BffSection<SystemIncidentSummary[]>;
  integrationFailures: BffSection<SystemIncidentSummary[]>;
  auditSummary: BffSection<{ todayEvents: number; rawInspectorQueries: number }>;
}
