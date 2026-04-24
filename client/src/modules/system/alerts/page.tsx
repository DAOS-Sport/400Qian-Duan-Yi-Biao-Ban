import { useQuery } from "@tanstack/react-query";
import type { LucideIcon } from "lucide-react";
import { AlertTriangle, Bell, CheckCircle2, Clock3, ShieldAlert } from "lucide-react";
import { RoleShell } from "@/modules/workbench/role-shell";
import { WorkbenchCard } from "@/shared/ui-kit/workbench-card";
import { cn } from "@/lib/utils";
import { fetchSystemAlertsOverview, fetchSystemAnomalyReports } from "./api";

export default function SystemAlertsPage() {
  const overviewQuery = useQuery({ queryKey: ["/api/bff/system/overview", "alerts"], queryFn: fetchSystemAlertsOverview });
  const anomalyQuery = useQuery({ queryKey: ["/api/anomaly-reports", "system-alerts"], queryFn: fetchSystemAnomalyReports, retry: 1 });
  const incidents = overviewQuery.data?.incidents.data ?? [];
  const failures = overviewQuery.data?.integrationFailures.data ?? [];
  const anomalies = anomalyQuery.data ?? [];
  const metrics: readonly (readonly [label: string, value: number, Icon: LucideIcon, tone: string])[] = [
    ["告警事件", incidents.length, Bell, "text-[#ef7d22]"],
    ["整合失敗", failures.length, AlertTriangle, "text-[#ff4964]"],
    ["異常通報", anomalies.length, ShieldAlert, "text-[#2f6fe8]"],
    ["健康狀態", overviewQuery.data?.healthScore.data?.score ?? 0, CheckCircle2, "text-[#15935d]"],
  ];

  return (
    <RoleShell role="system" title="告警中心" subtitle="整合系統 incidents、外部接口失敗與打卡異常通報。">
      <div className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-4">
          {metrics.map(([label, value, Icon, tone]) => (
            <WorkbenchCard key={label} className="p-4">
              <p className="text-[12px] font-bold text-[#637185]">{label}</p>
              <div className="mt-2 flex items-center justify-between">
                <p className={`text-[26px] font-black ${tone}`}>{value}</p>
                <Icon className="h-5 w-5 text-[#2f6fe8]" />
              </div>
            </WorkbenchCard>
          ))}
        </div>

        <div className="grid gap-4 xl:grid-cols-2">
          <WorkbenchCard className="p-5">
            <h2 className="mb-4 text-[15px] font-black">系統告警</h2>
            <div className="space-y-3">
              {[...incidents, ...failures].map((item) => (
                <div key={item.id} className="rounded-[8px] bg-[#fbfcfd] p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[13px] font-black text-[#10233f]">{item.title}</p>
                      <p className="mt-1 text-[11px] font-bold text-[#8b9aae]">{item.time}</p>
                    </div>
                    <span className={cn("rounded-full px-2 py-1 text-[10px] font-black", item.severity === "critical" ? "bg-[#ffe8eb] text-[#ff4964]" : "bg-[#fff6e7] text-[#ef7d22]")}>{item.severity}</span>
                  </div>
                </div>
              ))}
              {incidents.length + failures.length === 0 ? <div className="rounded-[8px] bg-[#fbfcfd] p-6 text-center text-[13px] font-bold text-[#637185]">目前沒有系統告警。</div> : null}
            </div>
          </WorkbenchCard>

          <WorkbenchCard className="p-5">
            <h2 className="mb-4 text-[15px] font-black">打卡異常通報</h2>
            <div className="space-y-3">
              {anomalyQuery.isError ? <div className="rounded-[8px] bg-[#fff9ef] p-4 text-[13px] font-bold text-[#ef7d22]">異常通報資料庫尚未設定，Replit DB 接上後會顯示。</div> : null}
              {anomalies.slice(0, 8).map((item) => (
                <div key={item.id} className="flex items-center gap-3 rounded-[8px] bg-[#fbfcfd] p-3">
                  <Clock3 className="h-4 w-4 shrink-0 text-[#ef7d22]" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-black text-[#10233f]">{item.employeeName ?? "未知員工"} · {item.context ?? "打卡異常"}</p>
                    <p className="text-[11px] font-bold text-[#8b9aae]">{item.venueName ?? "未指定場館"}</p>
                  </div>
                </div>
              ))}
              {!anomalyQuery.isError && anomalies.length === 0 ? <div className="rounded-[8px] bg-[#fbfcfd] p-6 text-center text-[13px] font-bold text-[#637185]">目前沒有打卡異常。</div> : null}
            </div>
          </WorkbenchCard>
        </div>
      </div>
    </RoleShell>
  );
}
