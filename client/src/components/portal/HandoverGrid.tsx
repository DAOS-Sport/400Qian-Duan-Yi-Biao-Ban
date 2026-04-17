import { Link } from "wouter";
import type { FacilityHandoverItem } from "@/types/portal";
import BentoCard from "./BentoCard";

function MaterialIcon({ name, className = "" }: { name: string; className?: string }) {
  return <span className={`material-symbols-outlined ${className}`} aria-hidden>{name}</span>;
}

function formatRelativeTime(iso?: string) {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleString("zh-TW", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" });
  } catch {
    return iso;
  }
}

export default function HandoverGrid({
  items,
  isLoading,
  isError,
  viewAllHref,
  supervisorContactName,
}: {
  items: FacilityHandoverItem[];
  isLoading: boolean;
  isError: boolean;
  viewAllHref?: string;
  supervisorContactName?: string;
}) {
  return (
    <BentoCard testId="section-handover" variant="white">
      <div className="flex items-start justify-between mb-5">
        <div>
          <span className="portal-label text-stitch-secondary">HANDOVER</span>
          <h2 className="font-headline text-2xl font-bold text-stitch-primary mt-1">櫃台交接</h2>
        </div>
        {viewAllHref && (
          <Link href={viewAllHref}>
            <span className="portal-label text-stitch-secondary cursor-pointer hover:underline" data-testid="link-handover-view-all">
              查看全部 →
            </span>
          </Link>
        )}
      </div>

      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" data-testid="state-handover-loading">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 rounded-2xl bg-stitch-surface-low animate-pulse" />
          ))}
        </div>
      )}

      {!isLoading && (isError || items.length === 0) && (
        <div className="py-10 text-center" data-testid="state-handover-empty">
          <MaterialIcon name="folder_off" className="text-5xl text-slate-300" />
          <p className="font-headline text-xl font-bold text-stitch-primary mt-3">尚未設定交接事項</p>
          <p className="text-sm text-slate-500 mt-1">
            {supervisorContactName ? `請聯絡 ${supervisorContactName}` : "請聯絡您的場館主管設定"}
          </p>
        </div>
      )}

      {!isLoading && !isError && items.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" data-testid="state-handover-list">
          {items.slice(0, 4).map((it) => (
            <div
              key={it.id}
              className="group relative bg-stitch-surface-low rounded-2xl p-4 hover:bg-white hover:shadow-ambient transition-all"
              data-testid={`handover-item-${it.id}`}
            >
              <div className="flex items-start gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-stitch-secondary"
                  style={{ background: "rgba(0,107,96,0.08)" }}
                >
                  <MaterialIcon name={it.type === "task" ? "task_alt" : it.type === "note" ? "sticky_note_2" : "description"} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-stitch-primary truncate">{it.title}</p>
                  {it.fileName && (
                    <p className="text-xs text-slate-500 truncate mt-0.5">{it.fileName}</p>
                  )}
                  <div className="flex items-center gap-3 text-[10px] text-slate-400 mt-1.5">
                    {it.sharedWith && <span>{it.sharedWith}</span>}
                    {it.updatedAt && <span>{formatRelativeTime(it.updatedAt)}</span>}
                  </div>
                </div>
                {it.url && (
                  <a
                    href={it.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 text-stitch-secondary hover:bg-stitch-secondary/10 rounded-full"
                    onClick={(e) => e.stopPropagation()}
                    data-testid={`button-handover-open-${it.id}`}
                    aria-label="開啟"
                  >
                    <MaterialIcon name="open_in_new" className="text-[18px]" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </BentoCard>
  );
}
