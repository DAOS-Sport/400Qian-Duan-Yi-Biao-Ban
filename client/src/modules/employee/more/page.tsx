import { useQuery } from "@tanstack/react-query";
import { ExternalLink, FileText, Link as LinkIcon, Settings } from "lucide-react";
import { EmployeeShell } from "@/modules/employee/employee-shell";
import { WorkbenchCard } from "@/shared/ui-kit/workbench-card";
import { useAuthMe } from "@/shared/auth/session";
import { fetchEmployeeHome, fetchEmployeeQuickLinks } from "../home/api";

export default function EmployeeMorePage() {
  const { data: session } = useAuthMe();
  const facilityKey = session?.activeFacility ?? "xinbei_pool";
  const homeQuery = useQuery({ queryKey: ["/api/bff/employee/home", "more"], queryFn: fetchEmployeeHome });
  const quickLinksQuery = useQuery({
    queryKey: ["/api/portal/quick-links", facilityKey, "employee"],
    queryFn: () => fetchEmployeeQuickLinks(facilityKey),
  });
  const shortcuts = homeQuery.data?.shortcuts.data ?? [];
  const documents = homeQuery.data?.documents.data ?? [];
  const quickLinks = quickLinksQuery.data?.items ?? [];

  return (
    <EmployeeShell title="更多入口" subtitle="集中常用功能、文件與場館快速連結，外部連結由 Portal quick-links 管理。">
      <div className="grid gap-4 xl:grid-cols-[1fr_1fr]">
        <WorkbenchCard className="p-5">
          <div className="mb-4 flex items-center gap-3">
            <div className="workbench-icon-tile grid h-10 w-10 place-items-center rounded-[8px] text-[#2f6fe8]">
              <Settings className="h-5 w-5" />
            </div>
            <h2 className="text-[15px] font-black text-[#10233f]">功能入口</h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {shortcuts.map((shortcut) => (
              <a key={shortcut.id} href={shortcut.href} className="workbench-focus flex min-h-14 items-center gap-3 rounded-[8px] border border-[#e6edf4] bg-[#fbfcfd] p-3 text-[#10233f]">
                <LinkIcon className="h-5 w-5 shrink-0 text-[#2f6fe8]" />
                <span className="text-[13px] font-black">{shortcut.label}</span>
              </a>
            ))}
            {!shortcuts.length ? <div className="rounded-[8px] bg-[#fbfcfd] p-6 text-center text-[13px] font-bold text-[#637185]">目前沒有功能入口。</div> : null}
          </div>
        </WorkbenchCard>

        <WorkbenchCard className="p-5">
          <div className="mb-4 flex items-center gap-3">
            <div className="workbench-icon-tile grid h-10 w-10 place-items-center rounded-[8px] text-[#2f6fe8]">
              <FileText className="h-5 w-5" />
            </div>
            <h2 className="text-[15px] font-black text-[#10233f]">常用文件</h2>
          </div>
          <div className="space-y-3">
            {documents.map((doc) => (
              <button key={doc.id} className="workbench-focus flex min-h-12 w-full items-center gap-3 rounded-[8px] bg-[#fbfcfd] px-3 text-left">
                <FileText className="h-5 w-5 text-[#1f6fd1]" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13px] font-black text-[#10233f]">{doc.title}</span>
                  <span className="block text-[11px] font-medium text-[#8b9aae]">更新：{doc.updatedAt}</span>
                </span>
              </button>
            ))}
            {!documents.length ? <div className="rounded-[8px] bg-[#fbfcfd] p-6 text-center text-[13px] font-bold text-[#637185]">目前沒有文件資料。</div> : null}
          </div>
        </WorkbenchCard>

        <WorkbenchCard className="p-5 xl:col-span-2">
          <div className="mb-4 flex items-center gap-3">
            <div className="workbench-icon-tile grid h-10 w-10 place-items-center rounded-[8px] text-[#2f6fe8]">
              <ExternalLink className="h-5 w-5" />
            </div>
            <h2 className="text-[15px] font-black text-[#10233f]">場館快速連結</h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {quickLinks.map((link) => (
              <a key={link.id} href={link.url} target="_blank" rel="noreferrer" className="workbench-focus flex min-h-14 items-center justify-between gap-3 rounded-[8px] border border-[#e6edf4] bg-[#fbfcfd] p-3">
                <span className="min-w-0 truncate text-[13px] font-black text-[#10233f]">{link.title}</span>
                <ExternalLink className="h-4 w-4 shrink-0 text-[#2f6fe8]" />
              </a>
            ))}
            {!quickLinks.length ? <div className="rounded-[8px] bg-[#fbfcfd] p-6 text-center text-[13px] font-bold text-[#637185]">Portal quick-links 尚未設定。</div> : null}
          </div>
        </WorkbenchCard>
      </div>
    </EmployeeShell>
  );
}
