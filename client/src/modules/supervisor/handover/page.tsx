import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, ClipboardCheck, FileText, MessageSquarePlus, RefreshCw } from "lucide-react";
import { RoleShell } from "@/modules/workbench/role-shell";
import { WorkbenchCard } from "@/shared/ui-kit/workbench-card";
import { useAuthMe } from "@/shared/auth/session";
import { cn } from "@/lib/utils";
import { createSupervisorHandover, fetchSupervisorHandovers } from "./api";

export default function SupervisorHandoverPage() {
  const { data: session } = useAuthMe();
  const facilityKey = session?.activeFacility ?? "xinbei_pool";
  const queryClient = useQueryClient();
  const [content, setContent] = useState("");
  const handoversQuery = useQuery({
    queryKey: ["/api/portal/handovers", facilityKey],
    queryFn: () => fetchSupervisorHandovers(facilityKey),
  });
  const createMutation = useMutation({
    mutationFn: () => createSupervisorHandover(facilityKey, content.trim()),
    onSuccess: () => {
      setContent("");
      queryClient.invalidateQueries({ queryKey: ["/api/portal/handovers", facilityKey] });
    },
  });
  const handovers = handoversQuery.data?.items ?? [];

  return (
    <RoleShell role="supervisor" title="交接管理" subtitle="集中檢視與新增櫃台交接，作者身份由後端 session 強制帶入。">
      <div className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-3">
          <WorkbenchCard className="p-4">
            <p className="text-[12px] font-bold text-[#637185]">交接總數</p>
            <p className="mt-2 text-[26px] font-black text-[#10233f]">{handovers.length}</p>
          </WorkbenchCard>
          <WorkbenchCard className="p-4">
            <p className="text-[12px] font-bold text-[#637185]">目前場館</p>
            <p className="mt-2 text-[22px] font-black text-[#2f6fe8]">{facilityKey}</p>
          </WorkbenchCard>
          <WorkbenchCard className="p-4">
            <p className="text-[12px] font-bold text-[#637185]">資料來源</p>
            <p className="mt-2 text-[22px] font-black text-[#15935d]">Portal DB</p>
          </WorkbenchCard>
        </div>

        <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
          <WorkbenchCard className="p-5">
            <div className="mb-4 flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-[8px] bg-[#eef5ff] text-[#2f6fe8]">
                <MessageSquarePlus className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-[15px] font-black">新增交接</h2>
                <p className="text-[12px] font-bold text-[#8b9aae]">不信任前端作者欄位，後端使用 cookie session 覆寫作者。</p>
              </div>
            </div>
            <textarea
              value={content}
              onChange={(event) => setContent(event.target.value)}
              className="min-h-40 w-full rounded-[8px] border border-[#dfe7ef] bg-white p-3 text-[14px] font-bold leading-6 outline-none focus:border-[#2f6fe8]"
              placeholder="輸入交接內容、待處理事項或主管提醒"
            />
            <button
              type="button"
              onClick={() => createMutation.mutate()}
              disabled={!content.trim() || createMutation.isPending}
              className="mt-3 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-[8px] bg-[#0d2a50] px-4 text-[13px] font-black text-white disabled:opacity-50"
            >
              <ClipboardCheck className="h-4 w-4" />
              {createMutation.isPending ? "送出中" : "建立交接"}
            </button>
          </WorkbenchCard>

          <WorkbenchCard className="p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-[15px] font-black">交接列表</h2>
              <button onClick={() => handoversQuery.refetch()} className="inline-flex min-h-9 items-center gap-2 rounded-[8px] border border-[#dfe7ef] bg-white px-3 text-[12px] font-black text-[#536175]">
                <RefreshCw className={cn("h-4 w-4", handoversQuery.isFetching && "animate-spin")} />
                重新整理
              </button>
            </div>
            <div className="space-y-3">
              {handoversQuery.isLoading ? (
                <div className="rounded-[8px] bg-[#fbfcfd] p-4 text-[13px] font-bold text-[#637185]">載入交接資料...</div>
              ) : handovers.length > 0 ? (
                handovers.map((item) => (
                  <div key={item.id} className="rounded-[8px] border border-[#e6edf4] bg-[#fbfcfd] p-3">
                    <div className="flex items-start gap-3">
                      <FileText className="mt-0.5 h-4 w-4 shrink-0 text-[#2f6fe8]" />
                      <div className="min-w-0 flex-1">
                        <p className="whitespace-pre-wrap text-[13px] font-bold leading-6 text-[#10233f]">{item.content}</p>
                        <p className="mt-2 text-[11px] font-bold text-[#8b9aae]">{item.authorName ?? "session user"} · {new Date(item.createdAt).toLocaleString("zh-TW")}</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="grid min-h-56 place-items-center rounded-[8px] bg-[#fbfcfd] p-6 text-center">
                  <div>
                    <CheckCircle2 className="mx-auto h-10 w-10 text-[#15935d]" />
                    <p className="mt-3 text-[14px] font-black text-[#10233f]">目前沒有交接事項</p>
                    <p className="mt-1 text-[12px] font-bold text-[#8b9aae]">Replit 資料庫接上後會顯示正式交接紀錄。</p>
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
