import { useQuery } from "@tanstack/react-query";
import { CalendarDays, Clock3, Megaphone } from "lucide-react";
import { EmployeeShell } from "@/modules/employee/employee-shell";
import { WorkbenchCard } from "@/shared/ui-kit/workbench-card";
import { cn } from "@/lib/utils";
import { fetchEmployeeHome } from "../home/api";

export default function EmployeeShiftPage() {
  const { data, isLoading, isError } = useQuery({ queryKey: ["/api/bff/employee/home", "shift"], queryFn: fetchEmployeeHome });
  const shifts = data?.shifts.data ?? [];
  const campaigns = data?.campaigns.data ?? [];

  return (
    <EmployeeShell title="今日班表" subtitle="班表與活動檔期由外部排班 / LINE 場館首頁來源進 BFF 後呈現。">
      <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        <WorkbenchCard className="p-5">
          <div className="mb-4 flex items-center gap-3">
            <div className="workbench-icon-tile grid h-10 w-10 place-items-center rounded-[8px] text-[#2f6fe8]">
              <CalendarDays className="h-5 w-5" />
            </div>
            <h2 className="text-[15px] font-black text-[#10233f]">班表狀態</h2>
          </div>
          {isLoading ? (
            <div className="rounded-[8px] bg-[#fbfcfd] p-4 text-[13px] font-bold text-[#637185]">載入班表中...</div>
          ) : isError ? (
            <div className="rounded-[8px] bg-[#fff7f8] p-4 text-[13px] font-bold text-[#ff4964]">班表資料暫時無法取得。</div>
          ) : (
            <div className="space-y-4">
              {shifts.map((shift) => (
                <div key={shift.id} className="rounded-[8px] border border-[#e6edf4] bg-[#fbfcfd] p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[14px] font-black text-[#10233f]">{shift.label}</p>
                      <p className="mt-1 text-[12px] font-bold text-[#637185]">{shift.timeRange}</p>
                    </div>
                    <span className={cn("rounded-full px-2 py-1 text-[11px] font-black", shift.status === "active" ? "bg-[#eaf8ef] text-[#15935d]" : "bg-[#eef2f6] text-[#637185]")}>
                      {shift.status === "active" ? "進行中" : shift.status === "finished" ? "已結束" : "未開始"}
                    </span>
                  </div>
                  <div className="mt-4 h-1.5 rounded-full bg-[#e9eef4]">
                    <div className={cn("h-1.5 rounded-full bg-[#32af5c]", shift.status === "active" ? "w-1/2" : shift.status === "finished" ? "w-full" : "w-0")} />
                  </div>
                </div>
              ))}
              {!shifts.length ? <div className="rounded-[8px] bg-[#fbfcfd] p-6 text-center text-[13px] font-bold text-[#637185]">目前沒有班表資料。</div> : null}
            </div>
          )}
        </WorkbenchCard>

        <WorkbenchCard className="p-5">
          <div className="mb-4 flex items-center gap-3">
            <div className="workbench-icon-tile grid h-10 w-10 place-items-center rounded-[8px] text-[#2f6fe8]">
              <Megaphone className="h-5 w-5" />
            </div>
            <h2 className="text-[15px] font-black text-[#10233f]">活動 / 課程快訊</h2>
          </div>
          <div className="space-y-3">
            {campaigns.map((campaign) => (
              <article key={campaign.id} className="flex items-center gap-3 rounded-[8px] border border-[#e6edf4] bg-[#fbfcfd] p-4">
                <Clock3 className="h-5 w-5 shrink-0 text-[#ef7d22]" />
                <div className="min-w-0 flex-1">
                  <p className="text-[14px] font-black text-[#10233f]">{campaign.title}</p>
                  <p className="mt-1 text-[12px] font-bold text-[#637185]">{campaign.effectiveRange}</p>
                </div>
                <span className="rounded-full bg-[#eaf8ef] px-2 py-1 text-[10px] font-black text-[#15935d]">{campaign.statusLabel}</span>
              </article>
            ))}
            {!campaigns.length ? <div className="rounded-[8px] bg-[#fbfcfd] p-6 text-center text-[13px] font-bold text-[#637185]">目前沒有活動快訊。</div> : null}
          </div>
        </WorkbenchCard>
      </div>
    </EmployeeShell>
  );
}
