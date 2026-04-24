import { getFacilityConfig } from "@/config/facility-configs";
import { useAuthMe, useLogout, useSwitchFacility } from "@/shared/auth/session";
import type { FacilityConfig } from "@/types/portal";

export function useBoundFacility() {
  const { data: session, isLoading } = useAuthMe();
  const switchFacility = useSwitchFacility();
  const facilityKey = session?.activeFacility ?? null;

  const config: FacilityConfig | null = facilityKey
    ? getFacilityConfig(facilityKey)
    : null;

  return {
    facilityKey,
    config,
    isLoading,
    bind: (key: string) => switchFacility.mutate(key),
    bindAsync: (key: string) => switchFacility.mutateAsync(key),
    unbind: () => undefined,
  };
}

export interface PortalAuthState {
  employeeNumber: string;
  name: string;
  role?: string;
  department?: string;
  isSupervisor?: boolean;
  loggedInAt: string;
}

export function usePortalAuth() {
  const { data: session, isLoading } = useAuthMe();
  const logoutMutation = useLogout();
  const auth: PortalAuthState | null = session
    ? {
        employeeNumber: session.userId,
        name: session.displayName,
        isSupervisor: session.grantedRoles.includes("supervisor") || session.grantedRoles.includes("system"),
        loggedInAt: new Date().toISOString(),
      }
    : null;

  return {
    auth,
    isLoading,
    isLoggedIn: !!auth,
    login: () => undefined,
    logout: () => logoutMutation.mutate(),
  };
}
