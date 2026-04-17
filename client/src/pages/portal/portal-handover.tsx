import { useState } from "react";
import PortalShell from "@/components/portal/PortalShell";
import BentoCard from "@/components/portal/BentoCard";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { usePortalAuth } from "@/hooks/use-bound-facility";
import { useHandovers, useCreateHandover, useDeleteHandover } from "@/hooks/usePortalData";
import { getFacilityConfig } from "@/config/facility-configs";

function MaterialIcon({ name, className = "" }: { name: string; className?: string }) {
  return <span className={`material-symbols-outlined ${className}`} aria-hidden>{name}</span>;
}

function formatTime(iso: string) {
  try {
    const d = new Date(iso);
    return d.toLocaleString("zh-TW", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" });
  } catch {
    return iso;
  }
}

export default function PortalHandover({ facilityKey }: { facilityKey: string }) {
  const config = getFacilityConfig(facilityKey);
  const { auth } = usePortalAuth();
  const { toast } = useToast();
  const q = useHandovers(facilityKey);
  const createMut = useCreateHandover(facilityKey);
  const deleteMut = useDeleteHandover(facilityKey);
  const [content, setContent] = useState("");

  const items = q.data?.items || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = content.trim();
    if (!trimmed) return;
    try {
      await createMut.mutateAsync(trimmed);
      setContent("");
      toast({ title: "交接事項已新增", description: `${auth?.name || "您"} 剛剛建立了一筆交接` });
    } catch (err) {
      toast({
        title: "建立失敗",
        description: err instanceof Error ? err.message : "請稍後再試",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("確定刪除這筆交接？")) return;
    try {
      await deleteMut.mutateAsync(id);
      toast({ title: "已刪除" });
    } catch (err) {
      toast({
        title: "刪除失敗",
        description: err instanceof Error ? err.message : "請稍後再試",
        variant: "destructive",
      });
    }
  };

  return (
    <PortalShell facilityKey={facilityKey} pageTitle="櫃台交接">
      {() => (
        <div className="space-y-5">
          {/* 新增交接表單 */}
          <BentoCard testId="section-handover-form" variant="white">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-stitch-secondary shrink-0" style={{ background: "rgba(0,107,96,0.1)" }}>
                <MaterialIcon name="edit_note" />
              </div>
              <div className="flex-1">
                <p className="portal-label text-stitch-secondary">NEW ENTRY</p>
                <h2 className="font-headline text-xl font-bold text-stitch-primary mt-1">新增交接事項</h2>
                <p className="text-xs text-slate-500 mt-1">
                  以 <span className="font-semibold text-stitch-primary">{auth?.name || "未登入"}</span> 身分建立 ・ 場館：{config?.facilityName}
                </p>
              </div>
            </div>
            <form onSubmit={handleSubmit} className="space-y-3">
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="例如：14:00 客戶 A 來館報名兒童夏令營，繳費未完成，請下午班同事追蹤；游泳池 5 號水道燈管閃爍已通報維修..."
                rows={4}
                className="resize-none rounded-xl"
                maxLength={2000}
                data-testid="textarea-handover-content"
              />
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-400">{content.length} / 2000</span>
                <Button
                  type="submit"
                  disabled={createMut.isPending || !content.trim()}
                  className="rounded-full"
                  data-testid="button-submit-handover"
                >
                  {createMut.isPending ? "送出中..." : "送出交接"}
                </Button>
              </div>
            </form>
          </BentoCard>

          {/* 交接清單 */}
          <BentoCard testId="section-handover-list" variant="white">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="portal-label text-stitch-secondary">RECENT</p>
                <h2 className="font-headline text-xl font-bold text-stitch-primary mt-1">最近交接 ({items.length})</h2>
              </div>
            </div>

            {q.isLoading && (
              <div className="space-y-2" data-testid="state-loading">
                {[1, 2, 3].map((i) => (<div key={i} className="h-24 rounded-xl bg-stitch-surface-low animate-pulse" />))}
              </div>
            )}

            {!q.isLoading && items.length === 0 && (
              <div className="py-12 text-center" data-testid="state-empty">
                <MaterialIcon name="inbox" className="text-5xl text-slate-300" />
                <p className="font-headline text-lg font-bold text-stitch-primary mt-3">還沒有任何交接</p>
                <p className="text-sm text-slate-500 mt-1">在上方輸入框新增第一筆吧</p>
              </div>
            )}

            {!q.isLoading && items.length > 0 && (
              <ul className="space-y-3" data-testid="state-list">
                {items.map((it) => {
                  const canDelete = auth?.isSupervisor || auth?.employeeNumber === it.authorEmployeeNumber;
                  return (
                    <li
                      key={it.id}
                      className="bg-stitch-surface-low rounded-2xl p-4 hover:bg-white hover:shadow-ambient transition-all"
                      data-testid={`handover-${it.id}`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0" style={{ background: "linear-gradient(135deg, #006b60, #19335a)" }}>
                            {it.authorName?.charAt(0) || "?"}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 text-xs">
                              <span className="font-semibold text-stitch-primary">{it.authorName || "(匿名)"}</span>
                              {it.authorEmployeeNumber && <span className="text-slate-400">#{it.authorEmployeeNumber}</span>}
                              <span className="text-slate-400">・ {formatTime(it.createdAt)}</span>
                            </div>
                            <p className="text-sm text-stitch-on-surface mt-1.5 whitespace-pre-wrap break-words">{it.content}</p>
                          </div>
                        </div>
                        {canDelete && (
                          <button
                            type="button"
                            onClick={() => handleDelete(it.id)}
                            disabled={deleteMut.isPending}
                            className="text-slate-400 hover:text-red-500 p-1"
                            aria-label="刪除"
                            data-testid={`button-delete-handover-${it.id}`}
                          >
                            <MaterialIcon name="delete" className="text-[18px]" />
                          </button>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </BentoCard>
        </div>
      )}
    </PortalShell>
  );
}
