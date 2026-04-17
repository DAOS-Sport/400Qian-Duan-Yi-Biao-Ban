import { Link } from "wouter";
import type { FacilityCampaign } from "@/types/portal";
import BentoCard from "./BentoCard";

function MaterialIcon({ name, className = "" }: { name: string; className?: string }) {
  return <span className={`material-symbols-outlined ${className}`} aria-hidden>{name}</span>;
}

function formatDateRange(start?: string, end?: string) {
  const fmt = (s?: string) => {
    if (!s) return "";
    try {
      return new Date(s).toLocaleDateString("zh-TW", { month: "numeric", day: "numeric" });
    } catch {
      return s;
    }
  };
  if (!start && !end) return "";
  if (start && end) return `${fmt(start)} – ${fmt(end)}`;
  return fmt(start || end);
}

export default function CampaignHero({
  campaign,
  isLoading,
  detailHref,
}: {
  campaign?: FacilityCampaign | null;
  isLoading: boolean;
  detailHref?: string;
}) {
  if (isLoading) {
    return (
      <BentoCard variant="navy" testId="section-campaigns" className="h-full min-h-[260px]" padded={false}>
        <div className="h-full p-7 flex items-center justify-center" data-testid="state-campaign-loading">
          <div className="w-32 h-3 rounded-full bg-white/10 animate-pulse" />
        </div>
      </BentoCard>
    );
  }

  if (!campaign) {
    return (
      <BentoCard variant="navy" testId="section-campaigns" className="h-full min-h-[260px]" padded={false}>
        <div className="h-full p-7 flex flex-col items-center justify-center text-center" data-testid="state-campaign-empty">
          <MaterialIcon name="event_busy" className="text-5xl text-slate-400" />
          <p className="font-headline text-xl font-bold text-white mt-3">目前沒有大型活動</p>
          <p className="text-slate-400 text-xs mt-1">最新活動將即時推送</p>
        </div>
      </BentoCard>
    );
  }

  return (
    <BentoCard
      variant="navy"
      testId="section-campaigns"
      className="h-full min-h-[260px] relative overflow-hidden"
      padded={false}
    >
      {campaign.imageUrl && (
        <div
          className="absolute inset-0 bg-center bg-cover opacity-40"
          style={{ backgroundImage: `url(${campaign.imageUrl})` }}
        />
      )}
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(180deg, rgba(0,29,66,0.4) 0%, rgba(0,29,66,0.95) 70%)",
        }}
      />
      <div className="relative h-full p-7 flex flex-col justify-end">
        <span className="portal-label text-stitch-tertiary mb-2">最近大活動</span>
        <h3 className="font-headline text-2xl md:text-3xl font-black text-white leading-tight" data-testid="text-campaign-title">
          {campaign.title}
        </h3>
        <div className="flex items-center gap-3 text-xs text-slate-300 mt-3">
          {(campaign.startAt || campaign.endAt) && (
            <span className="flex items-center gap-1">
              <MaterialIcon name="event" className="text-[14px]" />
              {formatDateRange(campaign.startAt, campaign.endAt)}
            </span>
          )}
          {campaign.location && (
            <span className="flex items-center gap-1">
              <MaterialIcon name="place" className="text-[14px]" />
              {campaign.location}
            </span>
          )}
        </div>
        {detailHref && (
          <div className="mt-5">
            <Link href={detailHref}>
              <span className="portal-pill-cta" data-testid="button-campaign-learn-more">
                LEARN MORE
                <MaterialIcon name="arrow_forward" className="text-[16px]" />
              </span>
            </Link>
          </div>
        )}
      </div>
    </BentoCard>
  );
}
