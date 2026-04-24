export type WorkbenchRole = "employee" | "supervisor" | "system";

export interface AuthMeDto {
  userId: string;
  displayName: string;
  grantedRoles: WorkbenchRole[];
  activeRole: WorkbenchRole;
  grantedFacilities: string[];
  activeFacility: string;
  permissionsSnapshot: string[];
}

export interface LoginRequestDto {
  username: string;
  password: string;
}

export interface SwitchRoleRequestDto {
  activeRole: WorkbenchRole;
}

export const roleHomePath: Record<WorkbenchRole, string> = {
  employee: "/employee",
  supervisor: "/supervisor",
  system: "/system",
};

export const roleLabels: Record<WorkbenchRole, string> = {
  employee: "員工",
  supervisor: "主管",
  system: "系統",
};
