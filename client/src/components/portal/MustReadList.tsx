import type { FacilityMustReadItem } from "@/types/portal";
import BentoCard from "./BentoCard";

function MaterialIcon({ name, className = "" }: { name: string; className?: string }) {
  return <span className={`material-symbols-outlined ${className}`} aria-hidden>{name}</span>;
}

function statusStyle(status?: string) {
  if (status === "ALERT" || status === "CRITICAL") {
    return { bg: "rgba(239,68,68,0.18)", color: "#fca5a5", label: "ALERT" };
  }
  if (status === "DEGRADED") {
    return { bg: "rgba(245,158,11,0.18)", color: "#fcd34d", label: "DEGRADED" };
  }
  return { bg: "rgba(157,216,79,0.18)", color: "#9dd84f", label: "OPERATIONAL" };
}

function formatTimeAgo(iso?: string) {
  if (!iso) return "";
  try {
    const then = new Date(iso).getTime();
    const diff = Date.now() - then;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "剛剛";
    if (mins < 60) return `${mins} 分鐘前`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours} 小時前`;
    return `${Math.floor(hours / 24)} 天前`;
  } catch {
    return iso;
  }
}

export default function MustReadList({
  items,
  isLoading,
  isError,
  lastRefreshedAt,
  onSelect,
}: {
  items: FacilityMustReadItem[];
  isLoading: boolean;
  isError: boolean;
  lastRefreshedAt?: string;
  onSelect: (item: FacilityMustReadItem) => void;
}) {
  return (
    <BentoCard variant="glass" testId="section-must-read" className="flex flex-col">
      <div className="flex items-start justify-between mb-5">
        <div>
          <span className="portal-label text-stitch-tertiary">MUST READ</span>
          <h2 className="font-headline text-2xl font-bold text-white mt-1">群組重要公告</h2>
        </div>
        <MaterialIcon name="priority_high" className="text-stitch-tertiary text-2xl" />
      </div>

      {isLoading && (
        <div className="space-y-3 flex-1" data-testid="state-mustread-loading">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 rounded-xl bg-white/5 animate-pulse" />
          ))}
        </div>
      )}

      {!isLoading && (isError || items.length === 0) && (
        <div className="flex-1 flex flex-col items-center justify-center py-8 text-center" data-testid="state-mustread-empty">
          <MaterialIcon name="check_circle" className="text-stitch-tertiary text-5xl" />
          <p className="text-white font-semibold mt-3">目前沒有必讀公告</p>
          <p className="text-slate-400 text-xs mt-1">系統運作正常</p>
        </div>
      )}

      {!isLoading && !isError && items.length > 0 && (
        <div className="space-y-3 flex-1" data-testid="state-mustread-list">
          {items.slice(0, 4).map((it) => {
            const ss = statusStyle(it.status);
            return (
              <button
                key={it.id}
                type="button"
                onClick={() => onSelect(it)}
                className="w-full text-left flex items-start gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                data-testid={`mustread-item-${it.id}`}
              >
                <span className="pulse-lime mt-1.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-semibold text-white truncate flex-1">{it.title}</p>
                    <span
                      className="px-2 py-0.5 rounded-full text-[9px] font-bold tracking-widest shrink-0"
                      style={{ background: ss.bg, color: ss.color }}
                    >
                      {ss.label}
                    </span>
                  </div>
                  {(it.groupName || it.groupId) && (
                    <p className="text-[10px] text-stitch-tertiary/80 truncate">
                      {it.groupName || it.groupId}
                    </p>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {lastRefreshedAt && (
        <p className="text-[10px] text-slate-400 mt-4 text-right">
          Last check: {formatTimeAgo(lastRefreshedAt)}
        </p>
      )}
    </BentoCard>
  );
}
