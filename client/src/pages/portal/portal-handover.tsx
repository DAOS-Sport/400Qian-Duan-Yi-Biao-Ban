import PortalShell from "@/components/portal/PortalShell";
import BentoCard from "@/components/portal/BentoCard";
import { useHandover } from "@/hooks/usePortalHome";
import { getFacilityConfig } from "@/config/facility-configs";

function MaterialIcon({ name, className = "" }: { name: string; className?: string }) {
  return <span className={`material-symbols-outlined ${className}`} aria-hidden>{name}</span>;
}

export default function PortalHandover({ facilityKey }: { facilityKey: string }) {
  const config = getFacilityConfig(facilityKey);
  const groupId = config?.facilityLineGroupId || "";
  const supervisor = config?.contactPoints.find((c) => c.type === "supervisor")?.name;
  const q = useHandover(groupId);
  const allItems = q.data || [];

  return (
    <PortalShell facilityKey={facilityKey} pageTitle="櫃台交接">
      {({ searchTerm }) => {
        const kw = searchTerm.toLowerCase();
        const items = kw
          ? allItems.filter((it) => it.title.toLowerCase().includes(kw) || (it.description || "").toLowerCase().includes(kw))
          : allItems;

        return (
          <BentoCard testId="section-handover-page" variant="white">
            {q.isLoading && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" data-testid="state-loading">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="h-28 rounded-2xl bg-stitch-surface-low animate-pulse" />
                ))}
              </div>
            )}

            {!q.isLoading && items.length === 0 && (
              <div className="py-16 text-center" data-testid="state-empty">
                <MaterialIcon name="folder_off" className="text-5xl text-slate-300" />
                <p className="font-headline text-xl font-bold text-stitch-primary mt-3">尚未設定交接事項</p>
                <p className="text-sm text-slate-500 mt-1">
                  {supervisor ? `請聯絡 ${supervisor} 設定` : "請聯絡您的場館主管設定"}
                </p>
              </div>
            )}

            {!q.isLoading && items.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" data-testid="state-list">
                {items.map((it) => (
                  <div
                    key={it.id}
                    className="bg-stitch-surface-low rounded-2xl p-5 hover:bg-white hover:shadow-ambient transition-all"
                    data-testid={`handover-card-${it.id}`}
                  >
                    <div className="flex items-start gap-3 mb-2">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-stitch-secondary shrink-0"
                        style={{ background: "rgba(0,107,96,0.08)" }}
                      >
                        <MaterialIcon name={it.type === "task" ? "task_alt" : it.type === "note" ? "sticky_note_2" : "description"} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-stitch-primary">{it.title}</p>
                        {it.fileName && <p className="text-xs text-slate-500 truncate">{it.fileName}</p>}
                      </div>
                    </div>
                    {it.description && (
                      <p className="text-xs text-slate-600 line-clamp-3 mt-2">{it.description}</p>
                    )}
                    <div className="flex items-center justify-between mt-3 text-[10px] text-slate-400">
                      <span>{it.sharedWith}</span>
                      {it.url && (
                        <a
                          href={it.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-stitch-secondary font-semibold inline-flex items-center gap-1 hover:underline"
                          data-testid={`link-handover-${it.id}`}
                        >
                          開啟 <MaterialIcon name="open_in_new" className="text-[12px]" />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </BentoCard>
        );
      }}
    </PortalShell>
  );
}
