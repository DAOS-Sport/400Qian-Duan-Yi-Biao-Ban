import { useState, useCallback } from "react";
import { getFacilityConfig } from "@/config/facility-configs";
import type { FacilityConfig } from "@/types/portal";

const STORAGE_KEY = "facilityKey";

export function useBoundFacility() {
  const [facilityKey, setFacilityKeyState] = useState<string | null>(() => {
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch {
      return null;
    }
  });

  const config: FacilityConfig | null = facilityKey
    ? getFacilityConfig(facilityKey)
    : null;

  const bind = useCallback((key: string) => {
    localStorage.setItem(STORAGE_KEY, key);
    setFacilityKeyState(key);
  }, []);

  const unbind = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setFacilityKeyState(null);
  }, []);

  return { facilityKey, config, bind, unbind };
}

const AUTH_KEY = "portalAuth";

export interface PortalAuthState {
  employeeNumber: string;
  name: string;
  role?: string;
  loggedInAt: string;
}

export function usePortalAuth() {
  const [auth, setAuthState] = useState<PortalAuthState | null>(() => {
    try {
      const raw = localStorage.getItem(AUTH_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  const login = useCallback((data: PortalAuthState) => {
    localStorage.setItem(AUTH_KEY, JSON.stringify(data));
    setAuthState(data);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(AUTH_KEY);
    setAuthState(null);
  }, []);

  return { auth, isLoggedIn: !!auth, login, logout };
}
