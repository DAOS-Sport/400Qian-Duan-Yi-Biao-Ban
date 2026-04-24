import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, Circle, Clock3, ListChecks } from "lucide-react";
import { EmployeeShell } from "@/modules/employee/employee-shell";
import { WorkbenchCard } from "@/shared/ui-kit/workbench-card";
import { cn } from "@/lib/utils";
import { fetchEmployeeHome } from "../home/api";

const statusLabel = {
  pending: "待處理",
  in_progress: "進行中",
  reported: "已回報",
  done: "已完成",
} as const;

export default function EmployeeTasksPage() {
  const { data, isLoading, isError } = useQuery({ queryKey: ["/api/bff/employee/home", "tasks"], queryFn: fetchEmployeeHome });
  const tasks = data?.tasks.data ?? [];
  const done = tasks.filter((task) => task.status === "done").length;
  const active = tasks.filter((task) => task.status !== "done").length;

  return (
    <EmployeeShell title="今日任務" subtitle="員工端只讀 BFF 任務投影，後續狀態寫入由任務模組 API 承接。">
      <div className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-3">
          <WorkbenchCard className="p-4">
            <p className="text-[12px] font-bold text-[#637185]">待處理</p>
            <p data-fluid-number className="mt-2 text-[28px] font-black text-[#ef7d22]">{active}</p>
          </WorkbenchCard>
          <WorkbenchCard className="p-4">
            <p className="text-[12px] font-bold text-[#637185]">已完成</p>
            <p data-fluid-number className="mt-2 text-[28px] font-black text-[#15935d]">{done}</p>
          </WorkbenchCard>
          <WorkbenchCard className="p-4">
            <p className="text-[12px] font-bold text-[#637185]">總任務</p>
            <p data-fluid-number className="mt-2 text-[28px] font-black text-[#10233f]">{tasks.length}</p>
          </WorkbenchCard>
        </div>

        <WorkbenchCard className="p-5">
          <div className="mb-4 flex items-center gap-3">
            <div className="workbench-icon-tile grid h-10 w-10 place-items-center rounded-[8px] text-[#2f6fe8]">
              <ListChecks className="h-5 w-5" />
            </div>
            <h2 className="text-[15px] font-black text-[#10233f]">任務清單</h2>
          </div>
          {isLoading ? (
            <div className="rounded-[8px] bg-[#fbfcfd] p-4 text-[13px] font-bold text-[#637185]">載入任務中...</div>
          ) : isError ? (
            <div className="rounded-[8px] bg-[#fff7f8] p-4 text-[13px] font-bold text-[#ff4964]">任務資料暫時無法取得。</div>
          ) : (
            <div className="grid gap-3 lg:grid-cols-2">
              {tasks.map((task) => {
                const Icon = task.status === "done" ? CheckCircle2 : task.status === "in_progress" ? Clock3 : Circle;
                return (
                  <div key={task.id} className="flex items-start gap-3 rounded-[8px] border border-[#e6edf4] bg-[#fbfcfd] p-4">
                    <Icon className={cn("mt-0.5 h-5 w-5 shrink-0", task.status === "done" ? "text-[#15935d]" : "text-[#2f6fe8]")} />
                    <div className="min-w-0 flex-1">
                      <p className="text-[14px] font-black leading-5 text-[#10233f]">{task.title}</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <span className="rounded-full bg-white px-2 py-1 text-[11px] font-black text-[#536175]">{statusLabel[task.status]}</span>
                        <span className={cn("rounded-full px-2 py-1 text-[11px] font-black", task.priority === "high" ? "bg-[#fff1e7] text-[#ef7d22]" : "bg-[#edf7f4] text-[#15935d]")}>
                          {task.priority === "high" ? "高優先" : "一般"}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
              {!tasks.length ? <div className="rounded-[8px] bg-[#fbfcfd] p-6 text-center text-[13px] font-bold text-[#637185]">目前沒有今日任務。</div> : null}
            </div>
          )}
        </WorkbenchCard>
      </div>
    </EmployeeShell>
  );
}
