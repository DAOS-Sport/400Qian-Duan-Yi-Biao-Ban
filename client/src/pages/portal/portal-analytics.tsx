import { useMemo, useState } from "react";
import { Redirect } from "wouter";
import { Treemap, ResponsiveContainer, Tooltip } from "recharts";
import PortalShell from "@/components/portal/PortalShell";
import BentoCard from "@/components/portal/BentoCard";
import { usePortalAuth } from "@/hooks/use-bound-facility";
import { usePortalAnalytics } from "@/hooks/usePortalData";

function MaterialIcon({ name, className = "" }: { name: string; className?: string }) {
  return <span className={`material-symbols-outlined ${className}`} aria-hidden>{name}</span>;
}

const EVENT_TYPE_LABELS: Record<string, string> = {
  pageview: "頁面瀏覽",
  link_click: "連結點擊",
  announcement_open: "公告閱讀",
  handover_create: "新增交接",
};

function heatColor(value: number, max: number): string {
  if (max <= 0) return "#1a3a52";
  const ratio = value / max;
  if (ratio >= 0.75) return "#16a34a";
  if (ratio >= 0.5) return "#22c55e";
  if (ratio >= 0.3) return "#65a30d";
  if (ratio >= 0.15) return "#9dd84f";
  if (ratio >= 0.05) return "#475569";
  return "#334155";
}

interface Props { facilityKey: string }

export default function PortalAnalytics({ facilityKey }: Props) {
  const { auth } = usePortalAuth();
  const [days, setDays] = useState(7);
  const q = usePortalAnalytics({ facilityKey, sinceDays: days });

  const data = q.data;
  const totalEvents = data?.totalEvents || 0;

  const targetTreemap = useMemo(() => {
    if (!data?.topTargets?.length) return [];
    const max = Math.max(...data.topTargets.map((t) => t.count));
    return data.topTargets.map((t) => ({
      name: t.targetLabel || t.target || t.eventType || "(無)",
      size: t.count,
      fill: heatColor(t.count, max),
      count: t.count,
    }));
  }, [data]);

  const employeeTreemap = useMemo(() => {
    if (!data?.topEmployees?.length) return [];
    const max = Math.max(...data.topEmployees.map((t) => t.count));
    return data.topEmployees.map((t) => ({
      name: t.employeeName || `#${t.employeeNumber}` || "(訪客)",
      size: t.count,
      fill: heatColor(t.count, max),
      count: t.count,
    }));
  }, [data]);

  const maxDaily = Math.max(1, ...(data?.dailyCounts?.map((d) => d.count) || [0]));

  if (auth && !auth.isSupervisor) {
    return <Redirect to={`/portal/${facilityKey}`} />;
  }

  return (
    <PortalShell facilityKey={facilityKey} pageTitle="點擊熱力">
      {() => (
        <div className="space-y-5">
          {/* Header + range selector */}
          <BentoCard testId="section-analytics-header" variant="white">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div>
                <p className="portal-label text-stitch-secondary">ANALYTICS</p>
                <h2 className="font-headline text-2xl font-bold text-stitch-primary mt-1">點擊熱力圖（股市風）</h2>
                <p className="text-sm text-slate-500 mt-1">
                  總事件數：<span className="font-semibold text-stitch-primary" data-testid="text-total-events">{totalEvents.toLocaleString()}</span>
                  ・ 區間：最近 {days} 天
                </p>
              </div>
              <div className="flex gap-2">
                {[1, 7, 30, 90].map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDays(d)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${days === d ? "bg-stitch-primary text-white" : "bg-stitch-surface-low text-slate-600 hover:bg-stitch-surface"}`}
                    data-testid={`button-range-${d}`}
                  >
                    {d === 1 ? "今日" : `${d} 天`}
                  </button>
                ))}
              </div>
            </div>
          </BentoCard>

          {q.isLoading && (
            <BentoCard testId="state-analytics-loading" variant="white">
              <div className="h-96 rounded-xl bg-stitch-surface-low animate-pulse" />
            </BentoCard>
          )}

          {!q.isLoading && totalEvents === 0 && (
            <BentoCard testId="state-analytics-empty" variant="white">
              <div className="py-16 text-center">
                <MaterialIcon name="analytics" className="text-6xl text-slate-300" />
                <p className="font-headline text-lg font-bold text-stitch-primary mt-3">尚未產生任何事件</p>
                <p className="text-sm text-slate-500 mt-1">當員工開始使用入口網站，這裡就會出現熱力圖</p>
              </div>
            </BentoCard>
          )}

          {!q.isLoading && totalEvents > 0 && (
            <>
              {/* Event type bar */}
              <BentoCard testId="section-event-types" variant="white">
                <p className="portal-label text-stitch-secondary mb-3">EVENT MIX</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {(data?.byType || []).map((t) => {
                    const pct = totalEvents > 0 ? (t.count / totalEvents) * 100 : 0;
                    return (
                      <div key={t.eventType} className="bg-stitch-surface-low rounded-xl p-3" data-testid={`event-type-${t.eventType}`}>
                        <p className="text-xs text-slate-500">{EVENT_TYPE_LABELS[t.eventType] || t.eventType}</p>
                        <p className="font-headline text-2xl font-bold text-stitch-primary mt-1">{t.count.toLocaleString()}</p>
                        <div className="mt-2 h-1.5 rounded-full bg-white overflow-hidden">
                          <div className="h-full" style={{ width: `${pct}%`, background: "linear-gradient(90deg,#006b60,#9dd84f)" }} />
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1">{pct.toFixed(1)}%</p>
                      </div>
                    );
                  })}
                </div>
              </BentoCard>

              {/* Targets treemap (stock-market heatmap) */}
              <BentoCard testId="section-target-heatmap" variant="white">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="portal-label text-stitch-secondary">TARGETS HEATMAP</p>
                    <h3 className="font-headline text-lg font-bold text-stitch-primary mt-1">熱門點擊目標</h3>
                    <p className="text-[11px] text-slate-500">區塊大小 = 點擊次數 ・ 顏色越綠越熱</p>
                  </div>
                </div>
                <div className="h-80 bg-slate-900 rounded-xl p-1" data-testid="treemap-targets">
                  {targetTreemap.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <Treemap
                        data={targetTreemap}
                        dataKey="size"
                        stroke="#0f172a"
                        content={<HeatCell />}
                      >
                        <Tooltip
                          content={({ payload }) => {
                            if (!payload || !payload.length) return null;
                            const p = payload[0].payload as { name: string; count: number };
                            return (
                              <div className="bg-white rounded-lg shadow-lg px-3 py-2 text-xs">
                                <p className="font-semibold text-stitch-primary">{p.name}</p>
                                <p className="text-slate-500">{p.count.toLocaleString()} 次點擊</p>
                              </div>
                            );
                          }}
                        />
                      </Treemap>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-slate-500 text-sm">無點擊資料</div>
                  )}
                </div>
              </BentoCard>

              {/* Two-column: employees treemap + daily trend */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <BentoCard testId="section-employee-heatmap" variant="white">
                  <p className="portal-label text-stitch-secondary mb-2">TOP EMPLOYEES</p>
                  <h3 className="font-headline text-lg font-bold text-stitch-primary mb-3">活躍員工熱力</h3>
                  <div className="h-72 bg-slate-900 rounded-xl p-1" data-testid="treemap-employees">
                    {employeeTreemap.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <Treemap
                          data={employeeTreemap}
                          dataKey="size"
                          stroke="#0f172a"
                          content={<HeatCell />}
                        >
                          <Tooltip
                            content={({ payload }) => {
                              if (!payload || !payload.length) return null;
                              const p = payload[0].payload as { name: string; count: number };
                              return (
                                <div className="bg-white rounded-lg shadow-lg px-3 py-2 text-xs">
                                  <p className="font-semibold text-stitch-primary">{p.name}</p>
                                  <p className="text-slate-500">{p.count.toLocaleString()} 次事件</p>
                                </div>
                              );
                            }}
                          />
                        </Treemap>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex items-center justify-center text-slate-500 text-sm">無員工資料</div>
                    )}
                  </div>
                </BentoCard>

                <BentoCard testId="section-daily-trend" variant="white">
                  <p className="portal-label text-stitch-secondary mb-2">DAILY VOLUME</p>
                  <h3 className="font-headline text-lg font-bold text-stitch-primary mb-3">每日事件量</h3>
                  <div className="space-y-1.5" data-testid="list-daily">
                    {(data?.dailyCounts || []).map((d) => {
                      const pct = (d.count / maxDaily) * 100;
                      return (
                        <div key={d.day} className="flex items-center gap-3 text-xs" data-testid={`daily-${d.day}`}>
                          <span className="font-mono text-slate-500 w-20 shrink-0">{d.day}</span>
                          <div className="flex-1 h-6 bg-stitch-surface-low rounded overflow-hidden relative">
                            <div className="h-full" style={{ width: `${pct}%`, background: "linear-gradient(90deg,#006b60,#9dd84f)" }} />
                            <span className="absolute inset-y-0 left-2 flex items-center text-[10px] font-semibold text-stitch-primary">{d.count}</span>
                          </div>
                        </div>
                      );
                    })}
                    {(!data?.dailyCounts || data.dailyCounts.length === 0) && (
                      <p className="text-center text-sm text-slate-400 py-8" data-testid="state-daily-empty">無時間序列資料</p>
                    )}
                  </div>
                </BentoCard>
              </div>
            </>
          )}
        </div>
      )}
    </PortalShell>
  );
}

interface HeatCellProps {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  name?: string;
  count?: number;
  fill?: string;
}

function HeatCell(props: HeatCellProps) {
  const { x = 0, y = 0, width = 0, height = 0, name = "", count = 0, fill = "#334155" } = props;
  const showLabel = width > 60 && height > 30;
  const showCount = width > 80 && height > 50;
  return (
    <g>
      <rect x={x} y={y} width={width} height={height} fill={fill} stroke="#0f172a" strokeWidth={2} />
      {showLabel && (
        <text x={x + 6} y={y + 16} fill="#fff" fontSize={11} fontWeight={700} style={{ pointerEvents: "none" }}>
          {name.length > Math.floor(width / 8) ? name.slice(0, Math.floor(width / 8)) + "…" : name}
        </text>
      )}
      {showCount && (
        <text x={x + 6} y={y + 32} fill="#e2e8f0" fontSize={10} style={{ pointerEvents: "none" }}>
          {count.toLocaleString()}
        </text>
      )}
    </g>
  );
}
