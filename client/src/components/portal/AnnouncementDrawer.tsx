import { useMutation } from "@tanstack/react-query";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useToast } from "@/hooks/use-toast";
import { ackAnnouncement } from "@/lib/portalApi";
import type { FacilityMustReadItem } from "@/types/portal";

function MaterialIcon({ name, className = "" }: { name: string; className?: string }) {
  return <span className={`material-symbols-outlined ${className}`} aria-hidden>{name}</span>;
}

function formatFull(iso?: string) {
  if (!iso) return "-";
  try {
    return new Date(iso).toLocaleString("zh-TW", { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" });
  } catch {
    return iso;
  }
}

const TYPE_LABELS: Record<string, string> = {
  rule: "規則 / SOP",
  notice: "通知公告",
  campaign: "活動",
  discount: "優惠折扣",
  script: "標準說詞",
};

export default function AnnouncementDrawer({
  open,
  onClose,
  item,
  groupId,
}: {
  open: boolean;
  onClose: () => void;
  item: FacilityMustReadItem | null;
  groupId?: string;
}) {
  const { toast } = useToast();
  const ackMut = useMutation({
    mutationFn: async () => {
      if (!groupId || !item) throw new Error("missing context");
      const ok = await ackAnnouncement(groupId, item.id);
      if (!ok) throw new Error("回報失敗，請稍後再試");
      return true;
    },
    onSuccess: () => {
      toast({ title: "已標記為已讀", description: "感謝您的確認" });
      onClose();
    },
    onError: (err: Error) => {
      toast({ title: "操作失敗", description: err.message, variant: "destructive" });
    },
  });

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent
        side="right"
        className="portal w-full sm:max-w-[480px] p-0 border-0"
        style={{ background: "rgba(25,51,90,0.92)", backdropFilter: "blur(28px)", WebkitBackdropFilter: "blur(28px)", color: "#ffffff" }}
        data-testid="drawer-announcement"
      >
        {item && (
          <div className="flex flex-col h-full">
            <div className="px-7 pt-8 pb-4 border-b border-white/10">
              <div className="flex items-center gap-2 mb-3">
                <span
                  className="px-3 py-1 rounded-full text-[10px] font-bold tracking-widest"
                  style={{ background: "rgba(157,216,79,0.18)", color: "#9dd84f" }}
                  data-testid="text-drawer-type"
                >
                  {TYPE_LABELS[item.candidateType || ""] || item.candidateType || "公告"}
                </span>
                {item.needsAck && (
                  <span className="px-3 py-1 rounded-full text-[10px] font-bold tracking-widest" style={{ background: "rgba(239,68,68,0.18)", color: "#fca5a5" }}>
                    必讀
                  </span>
                )}
              </div>
              <h2 className="font-headline text-3xl font-black text-white tracking-tight leading-tight" data-testid="text-drawer-title">
                {item.title}
              </h2>
              {(item.groupName || item.groupId) && (
                <p className="text-sm text-stitch-tertiary mt-2" data-testid="text-drawer-group">
                  <MaterialIcon name="groups" className="text-[14px] mr-1 align-middle" />
                  {item.groupName || item.groupId}
                </p>
              )}
            </div>

            <div className="flex-1 overflow-y-auto px-7 py-6 space-y-6">
              {item.summary && (
                <section>
                  <h3 className="portal-label text-stitch-tertiary mb-2">摘要</h3>
                  <p className="text-sm text-slate-200 leading-relaxed" data-testid="text-drawer-summary">{item.summary}</p>
                </section>
              )}

              {item.recommendedAction && (
                <section>
                  <h3 className="portal-label text-stitch-tertiary mb-2">建議動作</h3>
                  <p className="text-sm text-slate-200 leading-relaxed" data-testid="text-drawer-action">{item.recommendedAction}</p>
                </section>
              )}

              {item.recommendedReply && (
                <section>
                  <h3 className="portal-label text-stitch-tertiary mb-2">建議回覆</h3>
                  <div
                    className="p-4 rounded-xl text-sm leading-relaxed"
                    style={{ background: "rgba(157,216,79,0.12)", color: "#e6f4d4", border: "1px solid rgba(157,216,79,0.2)" }}
                    data-testid="text-drawer-reply"
                  >
                    {item.recommendedReply}
                  </div>
                </section>
              )}

              {item.badExample && (
                <section>
                  <h3 className="portal-label text-stitch-tertiary mb-2">不當示例</h3>
                  <div
                    className="p-4 rounded-xl text-sm leading-relaxed"
                    style={{ background: "rgba(245,158,11,0.12)", color: "#fde68a", border: "1px solid rgba(245,158,11,0.25)" }}
                    data-testid="text-drawer-bad"
                  >
                    {item.badExample}
                  </div>
                </section>
              )}

              {item.originalText && (
                <section>
                  <h3 className="portal-label text-stitch-tertiary mb-2">原文</h3>
                  <pre className="p-4 rounded-xl text-xs whitespace-pre-wrap font-mono text-slate-300" style={{ background: "rgba(0,0,0,0.2)" }} data-testid="text-drawer-original">
                    {item.originalText}
                  </pre>
                </section>
              )}

              {(item.scopeType || (item.reasoningTags && item.reasoningTags.length > 0)) && (
                <section>
                  <h3 className="portal-label text-stitch-tertiary mb-2">影響範圍</h3>
                  <div className="flex flex-wrap gap-2">
                    {item.scopeType && (
                      <span className="px-2.5 py-1 rounded-full text-xs" style={{ background: "rgba(255,255,255,0.08)", color: "#ffffff" }}>
                        {item.scopeType}
                      </span>
                    )}
                    {item.reasoningTags?.map((t, i) => (
                      <span key={i} className="px-2.5 py-1 rounded-full text-xs" style={{ background: "rgba(0,107,96,0.25)", color: "#9dd84f" }}>
                        {t}
                      </span>
                    ))}
                  </div>
                </section>
              )}

              <section className="text-[11px] text-slate-400 grid grid-cols-2 gap-2 pt-4">
                <div>
                  <div className="opacity-70">生效時間</div>
                  <div className="text-slate-200">{formatFull(item.effectiveStartAt || item.detectedAt)}</div>
                </div>
                {item.effectiveEndAt && (
                  <div>
                    <div className="opacity-70">截止時間</div>
                    <div className="text-slate-200">{formatFull(item.effectiveEndAt)}</div>
                  </div>
                )}
              </section>
            </div>

            <div className="px-7 py-5 border-t border-white/10 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={onClose}
                className="text-sm text-slate-300 hover:text-white px-4 py-2 rounded-full"
                data-testid="button-drawer-close"
              >
                關閉
              </button>
              {item.needsAck && groupId && (
                <button
                  type="button"
                  onClick={() => ackMut.mutate()}
                  disabled={ackMut.isPending}
                  className="portal-pill-cta disabled:opacity-50"
                  data-testid="button-drawer-ack"
                >
                  <MaterialIcon name={ackMut.isPending ? "hourglass_empty" : "check"} className="text-[16px]" />
                  {ackMut.isPending ? "送出中..." : "我已讀"}
                </button>
              )}
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
