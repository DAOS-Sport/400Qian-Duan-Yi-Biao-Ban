import { useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import type { LucideIcon } from "lucide-react";
import { AlertTriangle, FileSearch, Lock, RefreshCw, Search, ShieldAlert, ShieldCheck, UserCheck, Users } from "lucide-react";
import { RoleShell } from "@/modules/workbench/role-shell";
import { WorkbenchCard } from "@/shared/ui-kit/workbench-card";
import { ApiError } from "@/shared/api/client";
import { cn } from "@/lib/utils";
import type { InterviewUser } from "./api";
import { fetchInterviewUsers, runHrAudit } from "./api";

type PeopleMetricKey = "authorized" | "pending" | "sources";
const metricCards: readonly (readonly [label: string, key: PeopleMetricKey, Icon: LucideIcon, tone: string])[] = [
  ["面試授權", "authorized", UserCheck, "text-[#15935d]"],
  ["待接資料", "pending", AlertTriangle, "text-[#ef7d22]"],
  ["外部來源", "sources", ShieldCheck, "text-[#2f6fe8]"],
];

const normalizeUsers = (payload: InterviewUser[] | { items?: InterviewUser[]; users?: InterviewUser[] } | undefined) => {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  return payload.items ?? payload.users ?? [];
};

const userName = (user: InterviewUser) => user.name ?? user.displayName ?? user.employeeName ?? "未命名授權";

export default function SupervisorPeoplePage() {
  const [query, setQuery] = useState("");
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const interviewUsersQuery = useQuery({
    queryKey: ["/api/admin/interview-users"],
    queryFn: fetchInterviewUsers,
    retry: 1,
  });
  const interviewUsers = useMemo(() => normalizeUsers(interviewUsersQuery.data), [interviewUsersQuery.data]);
  const auditMutation = useMutation({
    mutationFn: (value: string) => runHrAudit(value),
    onSettled: () => setHasSubmitted(true),
  });
  const auditError = auditMutation.error instanceof ApiError ? auditMutation.error.message : auditMutation.error ? "稽核查詢失敗" : null;
  const metricValue: Record<PeopleMetricKey, number> = {
    authorized: interviewUsers.length,
    pending: interviewUsersQuery.isError ? 1 : 0,
    sources: 2,
  };

  const submit = () => {
    const value = query.trim();
    if (!value) return;
    auditMutation.mutate(value);
  };

  return (
    <RoleShell role="supervisor" title="人力狀態" subtitle="保留 Ragic 與面試授權外部來源，先以主管工作台介面承接人員稽核。">
      <div className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-3">
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

        <div className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
          <WorkbenchCard className="p-5">
            <div className="mb-4 flex items-start gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-[8px] bg-[#fff6e7] text-[#ef7d22]">
                <FileSearch className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-[15px] font-black">HR 與權限稽核</h2>
                <p className="mt-1 text-[12px] font-bold leading-5 text-[#8b9aae]">本入口只呼叫本平台 `/api/hr-audit`，體育署與 Ragic 慎用名單仍由後端 adapter 接管。</p>
              </div>
            </div>
            <label className="text-[12px] font-black text-[#536175]">查詢指令</label>
            <div className="mt-2 flex flex-col gap-2 sm:flex-row">
              <div className="flex min-h-11 min-w-0 flex-1 items-center gap-2 rounded-[8px] border border-[#dfe7ef] bg-white px-3">
                <Search className="h-4 w-4 shrink-0 text-[#8b9aae]" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  onKeyDown={(event) => event.key === "Enter" && submit()}
                  className="min-w-0 flex-1 bg-transparent text-[14px] font-bold outline-none"
                  placeholder="面試 + 身分證字號"
                />
              </div>
              <button
                type="button"
                onClick={submit}
                disabled={!query.trim() || auditMutation.isPending}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[8px] bg-[#0d2a50] px-4 text-[13px] font-black text-white disabled:opacity-50"
              >
                <Lock className="h-4 w-4" />
                {auditMutation.isPending ? "查詢中" : "執行稽核"}
              </button>
            </div>

            {hasSubmitted ? (
              <div className="mt-4">
                {auditMutation.data ? (
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className={cn("rounded-[8px] border p-4", auditMutation.data.blacklist.found ? "border-[#ffd5dc] bg-[#fff7f8]" : "border-[#bfe4ce] bg-[#eaf8ef]")}>
                      <ShieldAlert className={cn("h-5 w-5", auditMutation.data.blacklist.found ? "text-[#ff4964]" : "text-[#15935d]")} />
                      <p className="mt-2 text-[13px] font-black">慎用名單</p>
                      <p className="mt-1 text-[12px] font-bold text-[#637185]">{auditMutation.data.blacklist.found ? auditMutation.data.blacklist.reason : "未命中"}</p>
                    </div>
                    <div className={cn("rounded-[8px] border p-4", auditMutation.data.lifeguard.valid ? "border-[#bfe4ce] bg-[#eaf8ef]" : "border-[#ffd5dc] bg-[#fff7f8]")}>
                      <ShieldCheck className={cn("h-5 w-5", auditMutation.data.lifeguard.valid ? "text-[#15935d]" : "text-[#ff4964]")} />
                      <p className="mt-2 text-[13px] font-black">救生員證照</p>
                      <p className="mt-1 text-[12px] font-bold text-[#637185]">{auditMutation.data.lifeguard.status}</p>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-[8px] border border-[#ffe0b8] bg-[#fff9ef] p-4">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-[#ef7d22]" />
                      <div>
                        <p className="text-[13px] font-black text-[#10233f]">稽核 API 尚未接入</p>
                        <p className="mt-1 text-[12px] font-bold leading-5 text-[#8b9aae]">{auditError ?? "等待體育署 API 與 Ragic 慎用名單重連。"}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : null}
          </WorkbenchCard>

          <WorkbenchCard className="p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-[15px] font-black">面試授權用戶</h2>
                <p className="mt-1 text-[12px] font-bold text-[#8b9aae]">Smart Schedule Manager 代理資料。</p>
              </div>
              <button type="button" onClick={() => interviewUsersQuery.refetch()} className="inline-flex min-h-9 items-center gap-2 rounded-[8px] border border-[#dfe7ef] bg-white px-3 text-[12px] font-black text-[#536175]">
                <RefreshCw className={cn("h-4 w-4", interviewUsersQuery.isFetching && "animate-spin")} />
                刷新
              </button>
            </div>
            <div className="space-y-3">
              {interviewUsersQuery.isLoading ? (
                <div className="rounded-[8px] bg-[#fbfcfd] p-4 text-[13px] font-bold text-[#637185]">載入授權資料...</div>
              ) : interviewUsersQuery.isError ? (
                <div className="rounded-[8px] bg-[#fff9ef] p-4 text-[13px] font-bold text-[#ef7d22]">外部面試授權來源尚未可用，Replit 重連後會自動顯示。</div>
              ) : interviewUsers.length > 0 ? (
                interviewUsers.slice(0, 8).map((user, index) => (
                  <div key={String(user.id ?? index)} className="flex items-center gap-3 rounded-[8px] bg-[#fbfcfd] p-3">
                    <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#eef5ff] text-[12px] font-black text-[#2f6fe8]">
                      {userName(user).slice(0, 1)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-black text-[#10233f]">{userName(user)}</p>
                      <p className="truncate text-[11px] font-bold text-[#8b9aae]">{user.facilityName ?? user.role ?? "授權資料"}</p>
                    </div>
                    <span className="rounded-full bg-[#eaf8ef] px-2 py-1 text-[10px] font-black text-[#15935d]">{user.status ?? "active"}</span>
                  </div>
                ))
              ) : (
                <div className="grid min-h-48 place-items-center rounded-[8px] bg-[#fbfcfd] p-6 text-center">
                  <div>
                    <Users className="mx-auto h-10 w-10 text-[#8b9aae]" />
                    <p className="mt-3 text-[14px] font-black text-[#10233f]">尚無授權資料</p>
                    <p className="mt-1 text-[12px] font-bold text-[#8b9aae]">外部 API 接上後，這裡會顯示可查核的面試授權人員。</p>
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
