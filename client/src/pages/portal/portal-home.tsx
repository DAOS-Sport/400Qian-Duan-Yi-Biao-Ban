import { useState, useMemo } from "react";
import { Link } from "wouter";
import PortalShell from "@/components/portal/PortalShell";
import BentoCard from "@/components/portal/BentoCard";
import HandoverGrid from "@/components/portal/HandoverGrid";
import MustReadList from "@/components/portal/MustReadList";
import CampaignHero from "@/components/portal/CampaignHero";
import AnnouncementDrawer from "@/components/portal/AnnouncementDrawer";
import { getFacilityConfig } from "@/config/facility-configs";
import { usePortalHome, useTodayShift } from "@/hooks/usePortalHome";
import type { FacilityMustReadItem } from "@/types/portal";

function MaterialIcon({ name, className = "" }: { name: string; className?: string }) {
  return <span className={`material-symbols-outlined ${className}`} aria-hidden>{name}</span>;
}

function todayLabel() {
  const now = new Date();
  const date = now.toLocaleDateString("zh-TW", { year: "numeric", month: "long", day: "numeric", weekday: "long" });
  return date;
}

interface PortalHomeProps {
  facilityKey: string;
}

export default function PortalHome({ facilityKey }: PortalHomeProps) {
  const config = getFacilityConfig(facilityKey);
  const groupId = config?.facilityLineGroupId || "";
  const facilityName = config?.facilityName || "";
  const basePath = `/portal/${facilityKey}`;

  const homeQ = usePortalHome(groupId, facilityName);
  const shiftQ = useTodayShift(groupId);

  const [drawerItem, setDrawerItem] = useState<FacilityMustReadItem | null>(null);

  const data = homeQ.data;
  const filterTerm = ""; // search handled inside shell, but home shows summary

  const handover = data?.handover || [];
  const mustRead = useMemo(() => data?.mustRead || [], [data]);
  const announcements = useMemo(() => data?.announcements || [], [data]);
  const campaign = data?.campaigns?.[0] || null;

  if (!config) {
    return (
      <div className="portal min-h-screen flex items-center justify-center bg-stitch-surface">
        <BentoCard testId="state-invalid-facility" className="max-w-md text-center">
          <MaterialIcon name="error" className="text-5xl text-red-400" />
          <h2 className="font-headline text-xl font-bold text-stitch-primary mt-3">場館不存在</h2>
          <p className="text-sm text-slate-500 mt-2">facilityKey 「{facilityKey}」未在系統中註冊。</p>
          <Link href="/portal/login">
            <span className="portal-pill-cta mt-4 inline-flex" data-testid="link-back-to-login">
              返回登入
            </span>
          </Link>
        </BentoCard>
      </div>
    );
  }

  return (
    <PortalShell facilityKey={facilityKey}>
      {({ searchTerm }) => {
        const kw = (searchTerm || filterTerm).toLowerCase();
        const filteredMustRead = kw
          ? mustRead.filter((m) => m.title.toLowerCase().includes(kw) || (m.summary || "").toLowerCase().includes(kw))
          : mustRead;
        const filteredAnnouncements = kw
          ? announcements.filter((m) => m.title.toLowerCase().includes(kw) || (m.summary || "").toLowerCase().includes(kw))
          : announcements;

        return (
          <>
            {/* Header */}
            <div className="mb-6 md:mb-8 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
              <div>
                <p className="portal-label text-stitch-secondary mb-2">DUTY DASHBOARD</p>
                <h1 className="font-headline text-4xl md:text-6xl font-black text-stitch-primary tracking-tight" data-testid="text-page-title">
                  {config.facilityName}
                </h1>
                <p className="text-sm text-slate-500 mt-2 flex items-center gap-3">
                  <span className="flex items-center gap-1.5">
                    <MaterialIcon name="calendar_today" className="text-[16px] text-stitch-secondary" />
                    {todayLabel()}
                  </span>
                  {(shiftQ.data && shiftQ.data.length > 0) && (
                    <span className="flex items-center gap-1.5">
                      <span className="pulse-lime" />
                      <span>當班 {shiftQ.data.length} 人</span>
                    </span>
                  )}
                </p>
              </div>
            </div>

            {/* Bento Grid */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
              {/* (1) Handover - col-span-8 */}
              <div className="md:col-span-8">
                <HandoverGrid
                  items={handover}
                  isLoading={homeQ.isLoading}
                  isError={homeQ.isError}
                  viewAllHref={`${basePath}/handover`}
                  supervisorContactName={config.contactPoints.find((c) => c.type === "supervisor")?.name}
                />
              </div>

              {/* (2) Must Read - col-span-4 */}
              <div className="md:col-span-4">
                <MustReadList
                  items={filteredMustRead}
                  isLoading={homeQ.isLoading}
                  isError={homeQ.isError}
                  lastRefreshedAt={data?.lastRefreshedAt}
                  onSelect={(it) => setDrawerItem(it)}
                />
              </div>

              {/* (3) On-Duty + Quick Actions - col-span-4 */}
              <div className="md:col-span-4 md:col-start-9">
                <BentoCard testId="section-on-duty" variant="white">
                  <div className="flex items-start justify-between mb-5">
                    <div>
                      <span className="portal-label text-stitch-secondary">SHIFT</span>
                      <h2 className="font-headline text-xl font-bold text-stitch-primary mt-1">值班 / 打卡</h2>
                    </div>
                    <Link href={`${basePath}/shift`}>
                      <span className="portal-label text-stitch-secondary cursor-pointer hover:underline" data-testid="link-shift-detail">
                        詳情 →
                      </span>
                    </Link>
                  </div>
                  <div className="space-y-2">
                    {[
                      { icon: "schedule", label: "今日班表", path: `${basePath}/shift` },
                      { icon: "how_to_reg", label: "點名 / 打卡", path: `${basePath}/shift` },
                      { icon: "report", label: "回報異常", path: "/anomaly-reports" },
                    ].map((row) => (
                      <Link key={row.label} href={row.path}>
                        <span
                          className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-stitch-surface-low transition-colors cursor-pointer"
                          data-testid={`link-shift-${row.label}`}
                        >
                          <span className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "rgba(0,107,96,0.1)" }}>
                            <MaterialIcon name={row.icon} className="text-stitch-secondary text-[18px]" />
                          </span>
                          <span className="flex-1 text-sm text-stitch-on-surface font-medium">{row.label}</span>
                          <MaterialIcon name="chevron_right" className="text-slate-400" />
                        </span>
                      </Link>
                    ))}
                  </div>
                </BentoCard>
              </div>

              {/* (4) Company / Group Announcements - col-span-8 */}
              <div className="md:col-span-8">
                <BentoCard testId="section-company-announcements" variant="white">
                  <div className="flex items-start justify-between mb-5">
                    <div>
                      <span className="portal-label text-stitch-secondary">DIRECTORY</span>
                      <h2 className="font-headline text-2xl font-bold text-stitch-primary mt-1">公司重要公告 / 聯絡窗口</h2>
                    </div>
                    <Link href={`${basePath}/announcements`}>
                      <span className="portal-label text-stitch-secondary cursor-pointer hover:underline" data-testid="link-announcements-view-all">
                        查看全部 →
                      </span>
                    </Link>
                  </div>

                  {/* Contact points (real config) */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
                    {config.contactPoints.slice(0, 3).map((c, i) => (
                      <div
                        key={i}
                        className="bg-stitch-surface-low rounded-2xl p-4 hover:bg-white hover:shadow-ambient transition-all"
                        data-testid={`contact-card-${c.type}`}
                      >
                        <div className="w-10 h-10 rounded-full grayscale hover:grayscale-0 mb-3 flex items-center justify-center" style={{ background: "linear-gradient(135deg, #006b60, #19335a)" }}>
                          <MaterialIcon name="person" className="text-white text-[20px]" />
                        </div>
                        <p className="text-sm font-semibold text-stitch-primary">{c.name}</p>
                        <p className="text-[11px] text-stitch-on-secondary-container font-medium">{c.label}</p>
                        {c.phone && (
                          <p className="text-xs font-mono text-slate-500 mt-2 flex items-center gap-1.5">
                            <MaterialIcon name="phone" className="text-[12px]" />
                            {c.phone}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Recent announcements */}
                  {filteredAnnouncements.length > 0 && (
                    <div className="pt-2" style={{ borderTop: "1px solid rgba(196,198,207,0.2)" }}>
                      <div className="space-y-2 mt-3">
                        {filteredAnnouncements.slice(0, 3).map((a) => (
                          <button
                            key={a.id}
                            type="button"
                            onClick={() => setDrawerItem(a)}
                            className="w-full text-left flex items-center gap-3 p-2.5 rounded-xl hover:bg-stitch-surface-low transition-colors"
                            data-testid={`announcement-row-${a.id}`}
                          >
                            <MaterialIcon name="campaign" className="text-stitch-secondary text-[18px]" />
                            <span className="text-sm text-stitch-primary flex-1 truncate">{a.title}</span>
                            <MaterialIcon name="chevron_right" className="text-slate-400 text-[18px]" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  {homeQ.isLoading && (
                    <div className="space-y-2 pt-2" data-testid="state-announcements-loading">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="h-10 rounded-xl bg-stitch-surface-low animate-pulse" />
                      ))}
                    </div>
                  )}
                  {!homeQ.isLoading && filteredAnnouncements.length === 0 && (
                    <p className="text-sm text-slate-400 text-center py-6" data-testid="state-announcements-empty">
                      暫無公告
                    </p>
                  )}
                </BentoCard>
              </div>

              {/* (5) Campaign Hero - col-span-4 */}
              <div className="md:col-span-4">
                <CampaignHero
                  campaign={campaign}
                  isLoading={homeQ.isLoading}
                  detailHref={campaign ? `${basePath}/campaigns` : undefined}
                />
              </div>
            </div>

            <AnnouncementDrawer
              open={!!drawerItem}
              onClose={() => setDrawerItem(null)}
              item={drawerItem}
              groupId={groupId}
            />
          </>
        );
      }}
    </PortalShell>
  );
}
