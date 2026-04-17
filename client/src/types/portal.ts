export interface FacilityContactPoint {
  type: "general" | "course" | "maintenance" | "supervisor" | "rental";
  label: string;
  name: string;
  phone?: string;
  note?: string;
}

export interface FacilitySectionToggle {
  mustRead: boolean;
  groupAnnouncements: boolean;
  campaigns: boolean;
  handover: boolean;
  onDutyStaff: boolean;
  contacts: boolean;
  rental: boolean;
}

export interface FacilityConfig {
  facilityKey: string;
  facilityLineGroupId: string;
  facilityName: string;
  shortName: string;
  portalPath: string;
  isActive: boolean;
  sections: FacilitySectionToggle;
  contactPoints: FacilityContactPoint[];
}

export interface PortalAnnouncement {
  id: number;
  title: string;
  summary?: string;
  candidateType: string;
  priority: "critical" | "high" | "normal" | "low";
  scopeType?: string;
  facilityName: string;
  groupId?: string;
  displayName?: string;
  effectiveStartAt: string;
  effectiveEndAt?: string;
  needsAck: boolean;
  originalText?: string;
  recommendedAction?: string;
  recommendedReply?: string;
  badExample?: string;
  reasoningTags?: string[];
  confidence: number;
  status: string;
}

export interface PortalUser {
  employeeNumber: string;
  name: string;
  role?: string;
}

export interface FacilityHandoverItem {
  id: number | string;
  title: string;
  type?: "doc" | "task" | "note" | string;
  fileName?: string;
  sharedWith?: string;
  updatedAt?: string;
  url?: string;
  description?: string;
}

export interface FacilityMustReadItem {
  id: number | string;
  title: string;
  status?: "OPERATIONAL" | "DEGRADED" | "ALERT" | string;
  candidateType?: string;
  summary?: string;
  recommendedAction?: string;
  recommendedReply?: string;
  badExample?: string;
  originalText?: string;
  scopeType?: string;
  needsAck?: boolean;
  reasoningTags?: string[];
  effectiveStartAt?: string;
  effectiveEndAt?: string;
  detectedAt?: string;
  groupName?: string;
  groupId?: string;
  displayName?: string;
}

export interface FacilityCampaign {
  id: number | string;
  title: string;
  summary?: string;
  imageUrl?: string;
  startAt?: string;
  endAt?: string;
  location?: string;
  candidateType?: string;
  detectedAt?: string;
}

export interface FacilityShiftEntry {
  id: number | string;
  name: string;
  role?: string;
  startAt?: string;
  endAt?: string;
  status?: "on_duty" | "checked_in" | "absent" | string;
}

export interface FacilityHomeResponse {
  facility?: { groupId: string; name: string };
  handover?: FacilityHandoverItem[];
  mustRead?: FacilityMustReadItem[];
  announcements?: FacilityMustReadItem[];
  campaigns?: FacilityCampaign[];
  shift?: FacilityShiftEntry[];
  lastRefreshedAt?: string;
}
