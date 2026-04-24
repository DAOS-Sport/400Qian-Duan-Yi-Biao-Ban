import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import type { LucideIcon } from "lucide-react";
import { AlertTriangle, CheckCircle2, Database, PlugZap, RefreshCw, ServerCog, ShieldCheck } from "lucide-react";
import { RoleShell } from "@/modules/workbench/role-shell";
import { WorkbenchCard } from "@/shared/ui-kit/workbench-card";
import { cn } from "@/lib/utils";
import { fetchIntegrationOverview, fetchSystemOverviewForIntegrations } from "./api";

type IntegrationMetricKey = "total" | "configured" | "real" | "issues";
const metricCards: readonly (readonly [label: string, key: IntegrationMetricKey, Icon: LucideIcon, tone: string])[] = [
  ["接口總數", "total", PlugZap, "text-[#10233f]"],
  ["已設定", "configured", CheckCircle2, "text-[#15935d]"],
  ["正式模式", "real", Database, "text-[#2f6fe8]"],
  ["需處理", "issues", AlertTriangle, "text-[#ff4964]"],
];

export default function SystemIntegrationsPage() {
  const integrationQuery = useQuery({
    queryKey: ["/api/bff/system/integration-overview"],
    queryFn: fetchIntegrationOverview,
  });
  const systemQuery = useQuery({
    queryKey: ["/api/bff/system/overview", "integrations"],
    queryFn: fetchSystemOverviewForIntegrations,
  });

  const adapters = integrationQuery.data?.adapters ?? [];
  const failures = systemQuery.data?.integrationFailures.data ?? [];
  const metricValue: Record<IntegrationMetricKey, number> = {
    total: adapters.length,
    configured: adapters.filter((adapter) => adapter.configured).length,
    real: adapters.filter((adapter) => adapter.mode === "real").length,
    issues: adapters.filter((adapter) => !adapter.configured).length + failures.length,
  };
  const checkedAt = useMemo(() => {
    const value = integrationQuery.data?.checkedAt;
    return value ? new Date(value).toLocaleString("zh-TW", { timeZone: "Asia/Taipei" }) : "-";
  }, [integrationQuery.data?.checkedAt]);

  return (
    <RoleShell role="system" title="整合監控" subtitle="集中檢視 Ragic、Replit 外部資料、排班、儲存與 Redis adapter 狀態。">
      <div className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {metricCards.map(([label, key, Icon, tone]) => (
            <WorkbenchCard key={key} className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[12px] font-bold text-[#637185]">{label}</p>
                  <p className={cn("mt-2 text-[26px] font-black", tone)}>{metricValue[key]}</p>
                </div>
                <div className="grid h-10 w-10 place-items-center rounded-[8px] bg-[#eef5ff]">
                  <Icon className="h-5 w-5 text-[#2f6fe8]" />
                </div>
              </div>
            </WorkbenchCard>
          ))}
        </div>

        <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
          <WorkbenchCard className="p-5">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-[8px] bg-[#eef5ff] text-[#2f6fe8]">
                  <ServerCog className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-[15px] font-black">Adapter Registry</h2>
                  <p className="text-[12px] font-bold text-[#8b9aae]">最後檢查：{checkedAt}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  integrationQuery.refetch();
                  systemQuery.refetch();
                }}
                className="inline-flex min-h-9 items-center justify-center gap-2 rounded-[8px] border border-[#dfe7ef] bg-white px-3 text-[12px] font-black text-[#536175]"
              >
                <RefreshCw className={cn("h-4 w-4", (integrationQuery.isFetching || systemQuery.isFetching) && "animate-spin")} />
                重新檢查
              </button>
            </div>
            <div className="space-y-3">
              {integrationQuery.isLoading ? (
                <div className="rounded-[8px] bg-[#fbfcfd] p-4 text-[13px] font-bold text-[#637185]">載入整合狀態...</div>
              ) : integrationQuery.isError ? (
                <div className="rounded-[8px] bg-[#fff7f8] p-4 text-[13px] font-bold text-[#ff4964]">整合監控 BFF 暫時無法載入。</div>
              ) : (
                adapters.map((adapter) => (
                  <div key={adapter.name} className="flex flex-col gap-3 rounded-[8px] border border-[#e6edf4] bg-[#fbfcfd] p-3 sm:flex-row sm:items-center">
                    <div className="flex min-w-0 flex-1 items-center gap-3">
                      <div className={cn("grid h-9 w-9 shrink-0 place-items-center rounded-full", adapter.configured ? "bg-[#eaf8ef] text-[#15935d]" : "bg-[#fff6e7] text-[#ef7d22]")}>
                        {adapter.configured ? <CheckCircle2 className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-[13px] font-black text-[#10233f]">{adapter.name}</p>
                        <p className="text-[11px] font-bold text-[#8b9aae]">mode: {adapter.mode}</p>
                      </div>
                    </div>
                    <span className={cn("rounded-full px-2 py-1 text-[10px] font-black", adapter.configured ? "bg-[#eaf8ef] text-[#15935d]" : "bg-[#fff6e7] text-[#ef7d22]")}>
                      {adapter.configured ? "configured" : "reserved"}
                    </span>
                  </div>
                ))
              )}
            </div>
          </WorkbenchCard>

          <WorkbenchCard className="p-5">
            <div className="mb-4 flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-[8px] bg-[#eef5ff] text-[#2f6fe8]">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-[15px] font-black">整合失敗</h2>
                <p className="text-[12px] font-bold text-[#8b9aae]">由 system overview 投影提供。</p>
              </div>
            </div>
            <div className="space-y-3">
              {systemQuery.isLoading ? (
                <div className="rounded-[8px] bg-[#fbfcfd] p-4 text-[13px] font-bold text-[#637185]">載入失敗清單...</div>
              ) : failures.length > 0 ? (
                failures.map((failure) => (
                  <div key={failure.id} className="rounded-[8px] bg-[#fff9ef] p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-[13px] font-black text-[#10233f]">{failure.title}</p>
                        <p className="mt-1 text-[11px] font-bold text-[#8b9aae]">{failure.time}</p>
                      </div>
                      <span className={cn("rounded-full px-2 py-1 text-[10px] font-black", failure.severity === "critical" ? "bg-[#ffe8eb] text-[#ff4964]" : "bg-[#fff6e7] text-[#ef7d22]")}>{failure.severity}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="grid min-h-56 place-items-center rounded-[8px] bg-[#fbfcfd] p-6 text-center">
                  <div>
                    <CheckCircle2 className="mx-auto h-10 w-10 text-[#15935d]" />
                    <p className="mt-3 text-[14px] font-black text-[#10233f]">目前沒有整合失敗</p>
                    <p className="mt-1 text-[12px] font-bold text-[#8b9aae]">外部 API 切成 real mode 後，失敗會集中出現在這裡。</p>
                  </div>
                </div>
              )}
            </div>
          </WorkbenchCard>
        </div>
      </div>
    </RoleShell>
  );
}
