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
