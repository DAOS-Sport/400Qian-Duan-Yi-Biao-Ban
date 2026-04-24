import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ClipboardCheck, FileText, MessageSquarePlus, RefreshCw } from "lucide-react";
import { EmployeeShell } from "@/modules/employee/employee-shell";
import { WorkbenchCard } from "@/shared/ui-kit/workbench-card";
import { useAuthMe } from "@/shared/auth/session";
import { cn } from "@/lib/utils";
import { createEmployeeHandover, fetchEmployeeHandovers, fetchEmployeeHome } from "../home/api";

export default function EmployeeHandoverPage() {
  const { data: session } = useAuthMe();
  const facilityKey = session?.activeFacility ?? "xinbei_pool";
  const [content, setContent] = useState("");
  const queryClient = useQueryClient();
  const homeQuery = useQuery({ queryKey: ["/api/bff/employee/home", "handover"], queryFn: fetchEmployeeHome });
  const portalQuery = useQuery({
    queryKey: ["/api/portal/handovers", facilityKey, "employee"],
    queryFn: () => fetchEmployeeHandovers(facilityKey),
  });
  const createMutation = useMutation({
    mutationFn: () => createEmployeeHandover(facilityKey, content.trim()),
    onSuccess: () => {
      setContent("");
      queryClient.invalidateQueries({ queryKey: ["/api/portal/handovers", facilityKey, "employee"] });
    },
  });
  const bffHandovers = homeQuery.data?.handover.data ?? [];
  const portalHandovers = portalQuery.data?.items ?? [];

  return (
    <EmployeeShell title="櫃台交接" subtitle="員工交接寫入 Portal API，作者與場館由後端 session 校正。">
      <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        <WorkbenchCard className="p-5">
          <div className="mb-4 flex items-center gap-3">
            <div className="workbench-icon-tile grid h-10 w-10 place-items-center rounded-[8px] text-[#2f6fe8]">
              <MessageSquarePlus className="h-5 w-5" />
            </div>
            <h2 className="text-[15px] font-black text-[#10233f]">新增交接</h2>
          </div>
          <label className="block text-[12px] font-black text-[#536175]" htmlFor="employee-handover-content">交接內容</label>
          <textarea
            id="employee-handover-content"
            value={content}
            onChange={(event) => setContent(event.target.value)}
            className="mt-2 min-h-40 w-full rounded-[8px] border border-[#dfe7ef] bg-white p-3 text-[16px] font-bold leading-6 outline-none focus:border-[#2f6fe8]"
            placeholder="輸入待交接事項、設備狀態或櫃台提醒"
          />
          <button
            type="button"
            onClick={() => createMutation.mutate()}
            disabled={!content.trim() || createMutation.isPending}
            className="workbench-focus mt-3 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-[8px] bg-[#0d2a50] px-4 text-[13px] font-black text-white disabled:opacity-50"
          >
            <ClipboardCheck className="h-4 w-4" />
            {createMutation.isPending ? "送出中" : "建立交接"}
          </button>
        </WorkbenchCard>

        <WorkbenchCard className="p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-[15px] font-black text-[#10233f]">交接列表</h2>
            <button onClick={() => portalQuery.refetch()} className="workbench-focus inline-flex min-h-9 items-center gap-2 rounded-[8px] border border-[#dfe7ef] bg-white px-3 text-[12px] font-black text-[#536175]">
              <RefreshCw className={cn("h-4 w-4", portalQuery.isFetching && "animate-spin")} />
              重新整理
            </button>
          </div>
          <div className="space-y-3">
            {portalQuery.isLoading ? (
              <div className="rounded-[8px] bg-[#fbfcfd] p-4 text-[13px] font-bold text-[#637185]">載入交接中...</div>
            ) : portalHandovers.length > 0 ? (
              portalHandovers.map((item) => (
                <article key={item.id} className="rounded-[8px] border border-[#e6edf4] bg-[#fbfcfd] p-4">
                  <div className="flex items-start gap-3">
                    <FileText className="mt-0.5 h-4 w-4 shrink-0 text-[#2f6fe8]" />
                    <div className="min-w-0 flex-1">
                      <p className="whitespace-pre-wrap text-[13px] font-bold leading-6 text-[#10233f]">{item.content}</p>
                      <p className="mt-2 text-[11px] font-bold text-[#8b9aae]">{item.authorName ?? "session user"} · {new Date(item.createdAt).toLocaleString("zh-TW")}</p>
                    </div>
                  </div>
                </article>
              ))
            ) : (
              bffHandovers.map((item) => (
                <article key={item.id} className="rounded-[8px] border border-[#e6edf4] bg-[#fbfcfd] p-4">
                  <p className="text-[13px] font-black text-[#10233f]">{item.title}</p>
                  <p className="mt-2 text-[11px] font-bold text-[#8b9aae]">{item.authorName} · {item.status}</p>
                </article>
              ))
            )}
            {!portalHandovers.length && !bffHandovers.length && !portalQuery.isLoading ? (
              <div className="rounded-[8px] bg-[#fbfcfd] p-6 text-center text-[13px] font-bold text-[#637185]">目前沒有交接事項。</div>
            ) : null}
          </div>
        </WorkbenchCard>
      </div>
    </EmployeeShell>
  );
}
