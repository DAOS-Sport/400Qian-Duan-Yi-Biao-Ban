import { useMutation } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import PortalShell from "@/components/portal/PortalShell";
import BentoCard from "@/components/portal/BentoCard";
import { useFacilityAnnouncementDetail } from "@/hooks/usePortalHome";
import { ackAnnouncement } from "@/lib/portalApi";
import { getFacilityConfig } from "@/config/facility-configs";
import { useToast } from "@/hooks/use-toast";

function MaterialIcon({ name, className = "" }: { name: string; className?: string }) {
  return <span className={`material-symbols-outlined ${className}`} aria-hidden>{name}</span>;
}

function formatFull(iso?: string) {
  if (!iso) return "-";
  try {
    return new Date(iso).toLocaleString("zh-TW");
  } catch {
    return iso;
  }
}

export default function PortalAnnouncementDetail({
  facilityKey,
  announcementId,
}: {
  facilityKey: string;
  announcementId: string;
}) {
  const config = getFacilityConfig(facilityKey);
  const groupId = config?.facilityLineGroupId || "";
  const q = useFacilityAnnouncementDetail(groupId, announcementId);
  const { toast } = useToast();
  const [, navigate] = useLocation();

  const ackMut = useMutation({
    mutationFn: async () => {
      const ok = await ackAnnouncement(groupId, announcementId);
      if (!ok) throw new Error("回報失敗，請稍後再試");
      return true;
    },
    onSuccess: () => {
      toast({ title: "已標記為已讀" });
      navigate(`/portal/${facilityKey}/announcements`);
    },
    onError: (e: Error) => toast({ title: "失敗", description: e.message, variant: "destructive" }),
  });

  return (
    <PortalShell facilityKey={facilityKey}>
      {() => {
        if (q.isLoading) {
          return (
            <BentoCard testId="state-loading" variant="white">
              <div className="h-8 w-2/3 bg-stitch-surface-low animate-pulse rounded mb-4" />
              <div className="h-4 w-full bg-stitch-surface-low animate-pulse rounded mb-2" />
              <div className="h-4 w-3/4 bg-stitch-surface-low animate-pulse rounded" />
            </BentoCard>
          );
        }
        const item = q.data;
        if (!item) {
          return (
            <BentoCard testId="state-not-found" variant="white">
              <div className="py-12 text-center">
                <MaterialIcon name="search_off" className="text-5xl text-slate-300" />
                <p className="font-headline text-xl font-bold text-stitch-primary mt-3">找不到公告</p>
                <Link href={`/portal/${facilityKey}/announcements`}>
                  <span className="portal-pill-cta mt-4 inline-flex" data-testid="link-back">返回公告列表</span>
                </Link>
              </div>
            </BentoCard>
          );
        }

        return (
          <BentoCard testId="section-announcement-detail" variant="white">
            <Link href={`/portal/${facilityKey}/announcements`}>
              <span className="text-sm text-stitch-secondary hover:underline cursor-pointer inline-flex items-center gap-1 mb-4" data-testid="link-back-to-list">
                <MaterialIcon name="arrow_back" className="text-[16px]" /> 返回公告列表
              </span>
            </Link>

            <div className="flex items-center gap-2 mb-3">
              {item.candidateType && (
                <span className="px-3 py-1 rounded-full text-[10px] font-bold tracking-widest bg-stitch-secondary/10 text-stitch-secondary">
                  {item.candidateType.toUpperCase()}
                </span>
              )}
              {item.needsAck && (
                <span className="px-3 py-1 rounded-full text-[10px] font-bold tracking-widest bg-red-100 text-red-700">必讀</span>
              )}
            </div>

            <h1 className="font-headline text-3xl md:text-4xl font-black text-stitch-primary tracking-tight" data-testid="text-detail-title">
              {item.title}
            </h1>

            <div className="text-xs text-slate-500 mt-3 flex flex-wrap gap-4">
              {item.groupName && <span><MaterialIcon name="groups" className="text-[14px] mr-1 align-middle" />{item.groupName}</span>}
              <span>偵測時間 {formatFull(item.detectedAt)}</span>
              {item.effectiveStartAt && <span>生效 {formatFull(item.effectiveStartAt)}</span>}
              {item.effectiveEndAt && <span>截止 {formatFull(item.effectiveEndAt)}</span>}
            </div>

            <div className="mt-8 space-y-6">
              {item.summary && (
                <section>
                  <h3 className="portal-label text-stitch-secondary mb-2">摘要</h3>
                  <p className="text-sm text-stitch-on-surface leading-relaxed" data-testid="text-detail-summary">{item.summary}</p>
                </section>
              )}
              {item.recommendedAction && (
                <section>
                  <h3 className="portal-label text-stitch-secondary mb-2">建議動作</h3>
                  <p className="text-sm text-stitch-on-surface leading-relaxed">{item.recommendedAction}</p>
                </section>
              )}
              {item.recommendedReply && (
                <section>
                  <h3 className="portal-label text-stitch-secondary mb-2">建議回覆</h3>
                  <div className="p-4 rounded-xl text-sm leading-relaxed border border-stitch-tertiary/30 bg-stitch-tertiary/10 text-stitch-on-surface">
                    {item.recommendedReply}
                  </div>
                </section>
              )}
              {item.badExample && (
                <section>
                  <h3 className="portal-label text-stitch-secondary mb-2">不當示例</h3>
                  <div className="p-4 rounded-xl text-sm leading-relaxed border border-amber-300/40 bg-amber-50 text-amber-900">
                    {item.badExample}
                  </div>
                </section>
              )}
              {item.originalText && (
                <section>
                  <h3 className="portal-label text-stitch-secondary mb-2">原文</h3>
                  <pre className="p-4 rounded-xl text-xs whitespace-pre-wrap font-mono text-stitch-on-surface bg-stitch-surface-low">
                    {item.originalText}
                  </pre>
                </section>
              )}
            </div>

            {item.needsAck && groupId && (
              <div className="mt-8 flex justify-end">
                <button
                  type="button"
                  onClick={() => ackMut.mutate()}
                  disabled={ackMut.isPending}
                  className="portal-pill-cta disabled:opacity-50"
                  data-testid="button-ack"
                >
                  <MaterialIcon name={ackMut.isPending ? "hourglass_empty" : "check"} className="text-[16px]" />
                  {ackMut.isPending ? "送出中..." : "我已讀"}
                </button>
              </div>
            )}
          </BentoCard>
        );
      }}
    </PortalShell>
  );
}
