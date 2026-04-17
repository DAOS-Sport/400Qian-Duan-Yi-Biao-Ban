import PortalShell from "@/components/portal/PortalShell";
import BentoCard from "@/components/portal/BentoCard";
import { useTodayShift } from "@/hooks/usePortalHome";
import { getFacilityConfig } from "@/config/facility-configs";

function MaterialIcon({ name, className = "" }: { name: string; className?: string }) {
  return <span className={`material-symbols-outlined ${className}`} aria-hidden>{name}</span>;
}

function formatTime(iso?: string) {
  if (!iso) return "-";
  try {
    return new Date(iso).toLocaleTimeString("zh-TW", { hour: "2-digit", minute: "2-digit" });
  } catch {
    return iso;
  }
}

const SMART_SCHEDULE_URL = "https://smart-schedule-manager.replit.app";

export default function PortalShift({ facilityKey }: { facilityKey: string }) {
  const config = getFacilityConfig(facilityKey);
  const groupId = config?.facilityLineGroupId || "";
  const q = useTodayShift(groupId);
  const items = q.data || [];

  return (
    <PortalShell facilityKey={facilityKey} pageTitle="班表入口">
      {() => {
        return (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <BentoCard testId="section-today-shift" variant="white" className="lg:col-span-2">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <span className="portal-label text-stitch-secondary">TODAY</span>
                  <h2 className="font-headline text-2xl font-bold text-stitch-primary mt-1">今日值班</h2>
                </div>
                <span className="pulse-lime" />
              </div>

              {q.isLoading && (
                <div className="space-y-2" data-testid="state-loading">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-14 rounded-xl bg-stitch-surface-low animate-pulse" />
                  ))}
                </div>
              )}

              {!q.isLoading && items.length === 0 && (
                <div className="py-12 text-center" data-testid="state-empty">
                  <MaterialIcon name="event_available" className="text-5xl text-slate-300" />
                  <p className="font-headline text-lg font-bold text-stitch-primary mt-3">尚未設定今日班表</p>
                  <p className="text-sm text-slate-500 mt-1">請至智能排班管理系統建立班表</p>
                </div>
              )}

              {!q.isLoading && items.length > 0 && (
                <div className="divide-y divide-stitch-outline-variant/30" data-testid="state-list">
                  {items.map((s) => (
                    <div key={s.id} className="flex items-center gap-3 py-3" data-testid={`shift-row-${s.id}`}>
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
                        style={{ background: "linear-gradient(135deg, #006b60, #19335a)" }}
                      >
                        {s.name?.charAt(0) || "?"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-stitch-primary">{s.name}</p>
                        {s.role && <p className="text-xs text-slate-500">{s.role}</p>}
                      </div>
                      <div className="text-xs text-slate-600 font-mono">
                        {formatTime(s.startAt)} – {formatTime(s.endAt)}
                      </div>
                      {s.status === "checked_in" && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold" style={{ background: "rgba(157,216,79,0.18)", color: "#006b60" }}>
                          已打卡
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </BentoCard>

            <BentoCard testId="section-shift-actions" variant="navy" className="space-y-3">
              <span className="portal-label text-stitch-tertiary">QUICK</span>
              <h2 className="font-headline text-2xl font-black text-white mt-1">班表 / 打卡</h2>

              <a
                href={SMART_SCHEDULE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="portal-pill-cta w-full justify-center mt-4"
                data-testid="link-smart-schedule"
              >
                <MaterialIcon name="open_in_new" className="text-[16px]" />
                開啟智能排班系統
              </a>

              <a
                href="/anomaly-reports"
                className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/10 hover:bg-white/15 transition-colors text-white text-sm"
                data-testid="link-anomaly-reports"
              >
                <MaterialIcon name="report" />
                <span className="flex-1">回報打卡異常</span>
                <MaterialIcon name="chevron_right" />
              </a>
            </BentoCard>
          </div>
        );
      }}
    </PortalShell>
  );
}
