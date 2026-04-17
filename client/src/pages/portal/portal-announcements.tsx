import { useState } from "react";
import PortalShell from "@/components/portal/PortalShell";
import BentoCard from "@/components/portal/BentoCard";
import AnnouncementDrawer from "@/components/portal/AnnouncementDrawer";
import { useFacilityAnnouncements } from "@/hooks/usePortalHome";
import { getFacilityConfig } from "@/config/facility-configs";
import type { FacilityMustReadItem } from "@/types/portal";

const TYPE_TABS: { label: string; value: string }[] = [
  { label: "全部", value: "" },
  { label: "規則 SOP", value: "rule,script" },
  { label: "通知公告", value: "notice" },
  { label: "活動 / 折扣", value: "campaign,discount" },
];

function MaterialIcon({ name, className = "" }: { name: string; className?: string }) {
  return <span className={`material-symbols-outlined ${className}`} aria-hidden>{name}</span>;
}

export default function PortalAnnouncements({ facilityKey }: { facilityKey: string }) {
  const config = getFacilityConfig(facilityKey);
  const groupId = config?.facilityLineGroupId || "";
  const facilityName = config?.facilityName || "";
  const [type, setType] = useState("");
  const [drawerItem, setDrawerItem] = useState<FacilityMustReadItem | null>(null);
  const q = useFacilityAnnouncements(groupId, facilityName, { type });
  const allItems = q.data || [];

  return (
    <PortalShell facilityKey={facilityKey} pageTitle="群組公告">
      {({ searchTerm }) => {
        const kw = searchTerm.toLowerCase();
        const items = kw
          ? allItems.filter((it) => it.title.toLowerCase().includes(kw) || (it.summary || "").toLowerCase().includes(kw))
          : allItems;
        return (
          <>
            <BentoCard testId="section-announcements" variant="white">
              <div className="flex flex-wrap items-center gap-2 mb-5">
                {TYPE_TABS.map((t) => {
                  const active = t.value === type;
                  return (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => setType(t.value)}
                      className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                        active
                          ? "bg-stitch-primary text-white"
                          : "bg-stitch-surface-low text-stitch-on-surface hover:bg-stitch-outline-variant/40"
                      }`}
                      data-testid={`tab-type-${t.value || "all"}`}
                    >
                      {t.label}
                    </button>
                  );
                })}
                <span className="ml-auto text-xs text-slate-500">共 {items.length} 筆</span>
              </div>

              {q.isLoading && (
                <div className="space-y-2" data-testid="state-loading">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="h-16 rounded-xl bg-stitch-surface-low animate-pulse" />
                  ))}
                </div>
              )}

              {!q.isLoading && items.length === 0 && (
                <div className="py-16 text-center" data-testid="state-empty">
                  <MaterialIcon name="inbox" className="text-5xl text-slate-300" />
                  <p className="font-headline text-xl font-bold text-stitch-primary mt-3">沒有符合的公告</p>
                  <p className="text-sm text-slate-500 mt-1">嘗試切換分類或清除搜尋字</p>
                </div>
              )}

              {!q.isLoading && items.length > 0 && (
                <div className="divide-y divide-stitch-outline-variant/30">
                  {items.map((it) => (
                    <button
                      key={it.id}
                      type="button"
                      onClick={() => setDrawerItem(it)}
                      className="w-full text-left flex items-start gap-3 py-4 hover:bg-stitch-surface-low rounded-xl px-3 transition-colors"
                      data-testid={`row-announcement-${it.id}`}
                    >
                      <MaterialIcon name="campaign" className="text-stitch-secondary mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-stitch-primary">{it.title}</p>
                        {it.summary && (
                          <p className="text-xs text-slate-500 mt-1 line-clamp-2">{it.summary}</p>
                        )}
                        <div className="flex items-center gap-3 mt-1.5 text-[10px] text-slate-400">
                          {it.candidateType && <span>{it.candidateType}</span>}
                          {it.detectedAt && <span>{new Date(it.detectedAt).toLocaleString("zh-TW")}</span>}
                        </div>
                      </div>
                      <MaterialIcon name="chevron_right" className="text-slate-400" />
                    </button>
                  ))}
                </div>
              )}
            </BentoCard>

            <AnnouncementDrawer open={!!drawerItem} onClose={() => setDrawerItem(null)} item={drawerItem} groupId={groupId} />
          </>
        );
      }}
    </PortalShell>
  );
}
