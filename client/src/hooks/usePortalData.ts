import { useQuery, useMutation } from "@tanstack/react-query";
import { useEffect } from "react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { usePortalAuth } from "@/hooks/use-bound-facility";
import type {
  HandoverEntryDTO,
  QuickLinkDTO,
  SystemAnnouncementDTO,
  PortalEventInsert,
  PortalEventStats,
} from "@/types/portal";

// ---------- Handovers ----------
export function useHandovers(facilityKey: string) {
  return useQuery<{ items: HandoverEntryDTO[] }>({
    queryKey: ["/api/portal/handovers", { facilityKey }],
    queryFn: async () => {
      const r = await fetch(`/api/portal/handovers?facilityKey=${encodeURIComponent(facilityKey)}`);
      if (!r.ok) throw new Error("查詢交接失敗");
      return r.json();
    },
    enabled: !!facilityKey,
  });
}

export function useCreateHandover(facilityKey: string) {
  const { auth } = usePortalAuth();
  return useMutation({
    mutationFn: async (content: string) => {
      const res = await apiRequest("POST", "/api/portal/handovers", {
        facilityKey,
        content,
        authorEmployeeNumber: auth?.employeeNumber || null,
        authorName: auth?.name || null,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/portal/handovers", { facilityKey }] });
    },
  });
}

export function useDeleteHandover(facilityKey: string) {
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("DELETE", `/api/portal/handovers/${id}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/portal/handovers", { facilityKey }] });
    },
  });
}

// ---------- Quick Links ----------
export function useQuickLinks(facilityKey?: string, includeInactive = false) {
  const params = new URLSearchParams();
  if (facilityKey) params.set("facilityKey", facilityKey);
  if (includeInactive) params.set("includeInactive", "true");
  const qs = params.toString();
  return useQuery<{ items: QuickLinkDTO[] }>({
    queryKey: ["/api/portal/quick-links", { facilityKey, includeInactive }],
    queryFn: async () => {
      const r = await fetch(`/api/portal/quick-links${qs ? "?" + qs : ""}`);
      if (!r.ok) throw new Error("查詢失敗");
      return r.json();
    },
  });
}

export function useUpsertQuickLink() {
  return useMutation({
    mutationFn: async (data: Partial<QuickLinkDTO> & { title: string; url: string }) => {
      if (data.id) {
        const res = await apiRequest("PATCH", `/api/portal/quick-links/${data.id}`, data);
        return res.json();
      }
      const res = await apiRequest("POST", "/api/portal/quick-links", data);
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/portal/quick-links"] }),
  });
}

export function useDeleteQuickLink() {
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("DELETE", `/api/portal/quick-links/${id}`);
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/portal/quick-links"] }),
  });
}

// ---------- System Announcements ----------
export function useSystemAnnouncements(facilityKey?: string, includeInactive = false) {
  const params = new URLSearchParams();
  if (facilityKey) params.set("facilityKey", facilityKey);
  if (includeInactive) params.set("includeInactive", "true");
  const qs = params.toString();
  return useQuery<{ items: SystemAnnouncementDTO[] }>({
    queryKey: ["/api/portal/system-announcements", { facilityKey, includeInactive }],
    queryFn: async () => {
      const r = await fetch(`/api/portal/system-announcements${qs ? "?" + qs : ""}`);
      if (!r.ok) throw new Error("查詢失敗");
      return r.json();
    },
  });
}

export function useUpsertSystemAnnouncement() {
  return useMutation({
    mutationFn: async (data: Partial<SystemAnnouncementDTO> & { title: string; content: string }) => {
      if (data.id) {
        const res = await apiRequest("PATCH", `/api/portal/system-announcements/${data.id}`, data);
        return res.json();
      }
      const res = await apiRequest("POST", "/api/portal/system-announcements", data);
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/portal/system-announcements"] }),
  });
}

export function useDeleteSystemAnnouncement() {
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("DELETE", `/api/portal/system-announcements/${id}`);
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/portal/system-announcements"] }),
  });
}

// ---------- Analytics ----------
export function usePortalAnalytics(opts: { facilityKey?: string; sinceDays?: number } = {}) {
  const params = new URLSearchParams();
  if (opts.facilityKey) params.set("facilityKey", opts.facilityKey);
  if (opts.sinceDays) params.set("sinceDays", String(opts.sinceDays));
  const qs = params.toString();
  return useQuery<PortalEventStats>({
    queryKey: ["/api/portal/analytics", opts],
    queryFn: async () => {
      const r = await fetch(`/api/portal/analytics${qs ? "?" + qs : ""}`);
      if (!r.ok) throw new Error("查詢失敗");
      return r.json();
    },
  });
}

// ---------- Event Tracking ----------
export function trackPortalEvent(
  event: PortalEventInsert,
  ctx: { employeeNumber?: string; employeeName?: string; facilityKey?: string },
) {
  try {
    void fetch("/api/portal/events", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(ctx.employeeNumber ? { "X-Employee-Number": ctx.employeeNumber } : {}),
        ...(ctx.employeeName ? { "X-Employee-Name": encodeURIComponent(ctx.employeeName) } : {}),
        ...(ctx.facilityKey ? { "X-Facility-Key": ctx.facilityKey } : {}),
      },
      body: JSON.stringify(event),
      keepalive: true,
    }).catch(() => {});
  } catch {
    // fire-and-forget
  }
}

export function usePageviewTracker(facilityKey: string, pagePath: string, pageLabel?: string) {
  const { auth } = usePortalAuth();
  useEffect(() => {
    if (!auth) return;
    trackPortalEvent(
      { eventType: "pageview", target: pagePath, targetLabel: pageLabel },
      { employeeNumber: auth.employeeNumber, employeeName: auth.name, facilityKey },
    );
  }, [auth, facilityKey, pagePath, pageLabel]);
}
