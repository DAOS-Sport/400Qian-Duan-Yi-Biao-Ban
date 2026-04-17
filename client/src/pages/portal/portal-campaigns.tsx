import PortalShell from "@/components/portal/PortalShell";
import BentoCard from "@/components/portal/BentoCard";
import { useFacilityAnnouncements } from "@/hooks/usePortalHome";
import { getFacilityConfig } from "@/config/facility-configs";

function MaterialIcon({ name, className = "" }: { name: string; className?: string }) {
  return <span className={`material-symbols-outlined ${className}`} aria-hidden>{name}</span>;
}

function formatRange(s?: string, e?: string) {
  const fmt = (x?: string) => x ? new Date(x).toLocaleDateString("zh-TW", { month: "numeric", day: "numeric" }) : "";
  if (!s && !e) return "";
  if (s && e) return `${fmt(s)} – ${fmt(e)}`;
  return fmt(s || e);
}

export default function PortalCampaigns({ facilityKey }: { facilityKey: string }) {
  const config = getFacilityConfig(facilityKey);
  const groupId = config?.facilityLineGroupId || "";
  const facilityName = config?.facilityName || "";

  const q = useFacilityAnnouncements(groupId, facilityName, { type: "campaign,discount" });
  const allItems = q.data || [];

  return (
    <PortalShell facilityKey={facilityKey} pageTitle="活動檔期">
      {({ searchTerm }) => {
        const kw = searchTerm.toLowerCase();
        const items = kw
          ? allItems.filter((it) => it.title.toLowerCase().includes(kw) || (it.summary || "").toLowerCase().includes(kw))
          : allItems;

        return (
          <>
            {q.isLoading && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5" data-testid="state-loading">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-64 rounded-3xl bg-stitch-surface-low animate-pulse" />
                ))}
              </div>
            )}

            {!q.isLoading && items.length === 0 && (
              <BentoCard testId="state-empty" variant="white">
                <div className="py-16 text-center">
                  <MaterialIcon name="event_busy" className="text-5xl text-slate-300" />
                  <p className="font-headline text-xl font-bold text-stitch-primary mt-3">目前沒有活動</p>
                  <p className="text-sm text-slate-500 mt-1">最新活動將即時顯示於此</p>
                </div>
              </BentoCard>
            )}

            {!q.isLoading && items.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5" data-testid="state-list">
                {items.map((it) => (
                  <BentoCard
                    key={it.id}
                    variant="navy"
                    testId={`campaign-card-${it.id}`}
                    padded={false}
                    className="min-h-[260px] relative overflow-hidden flex flex-col"
                  >
                    <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(0,29,66,0.4), rgba(0,29,66,0.95) 70%)" }} />
                    <div className="relative p-6 flex flex-col h-full">
                      <span className="portal-label text-stitch-tertiary mb-2">{it.candidateType?.toUpperCase() || "EVENT"}</span>
                      <h3 className="font-headline text-xl font-black text-white">{it.title}</h3>
                      {it.summary && <p className="text-sm text-slate-300 mt-2 line-clamp-3">{it.summary}</p>}
                      <div className="mt-auto pt-4 flex items-center gap-3 text-xs text-slate-300">
                        {(it.effectiveStartAt || it.effectiveEndAt) && (
                          <span className="flex items-center gap-1">
                            <MaterialIcon name="event" className="text-[14px]" />
                            {formatRange(it.effectiveStartAt, it.effectiveEndAt)}
                          </span>
                        )}
                      </div>
                    </div>
                  </BentoCard>
                ))}
              </div>
            )}
          </>
        );
      }}
    </PortalShell>
  );
}
