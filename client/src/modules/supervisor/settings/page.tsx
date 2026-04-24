import { useQuery } from "@tanstack/react-query";
import type { LucideIcon } from "lucide-react";
import { Bell, Link as LinkIcon, Settings, ShieldCheck, SlidersHorizontal } from "lucide-react";
import { RoleShell } from "@/modules/workbench/role-shell";
import { WorkbenchCard } from "@/shared/ui-kit/workbench-card";
import { useAuthMe } from "@/shared/auth/session";
import { fetchSupervisorQuickLinks, fetchSupervisorSystemAnnouncements } from "./api";

export default function SupervisorSettingsPage() {
  const { data: session } = useAuthMe();
  const facilityKey = session?.activeFacility ?? "xinbei_pool";
  const quickLinksQuery = useQuery({ queryKey: ["/api/portal/quick-links", facilityKey], queryFn: () => fetchSupervisorQuickLinks(facilityKey) });
  const announcementsQuery = useQuery({ queryKey: ["/api/portal/system-announcements", facilityKey], queryFn: () => fetchSupervisorSystemAnnouncements(facilityKey) });
  const quickLinks = quickLinksQuery.data?.items ?? [];
  const announcements = announcementsQuery.data?.items ?? [];
  const governanceItems: readonly (readonly [title: string, desc: string, Icon: LucideIcon])[] = [
    ["權限邊界", "寫入操作需主管 session", ShieldCheck],
    ["版面設定", "Dashboard widget 控制已在首頁提供", SlidersHorizontal],
    ["資料接口", "Replit pull 後只需重連 API env", Settings],
  ];

  return (
    <RoleShell role="supervisor" title="系統設定" subtitle="主管可檢視場館快速入口與系統公告設定，正式寫入仍由後端權限控管。">
      <div className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-3">
          <WorkbenchCard className="p-4">
            <p className="text-[12px] font-bold text-[#637185]">快速入口</p>
            <p className="mt-2 text-[26px] font-black text-[#2f6fe8]">{quickLinks.length}</p>
          </WorkbenchCard>
          <WorkbenchCard className="p-4">
            <p className="text-[12px] font-bold text-[#637185]">系統公告</p>
            <p className="mt-2 text-[26px] font-black text-[#ef7d22]">{announcements.length}</p>
          </WorkbenchCard>
          <WorkbenchCard className="p-4">
            <p className="text-[12px] font-bold text-[#637185]">目前場館</p>
            <p className="mt-2 text-[22px] font-black text-[#15935d]">{facilityKey}</p>
          </WorkbenchCard>
        </div>

        <div className="grid gap-4 xl:grid-cols-2">
          <WorkbenchCard className="p-5">
            <div className="mb-4 flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-[8px] bg-[#eef5ff] text-[#2f6fe8]"><LinkIcon className="h-5 w-5" /></div>
              <div>
                <h2 className="text-[15px] font-black">常用網址</h2>
                <p className="text-[12px] font-bold text-[#8b9aae]">資料走 `/api/portal/quick-links`。</p>
              </div>
            </div>
            <div className="space-y-3">
              {quickLinksQuery.isLoading ? <div className="rounded-[8px] bg-[#fbfcfd] p-4 text-[13px] font-bold text-[#637185]">載入中...</div> : null}
              {quickLinks.map((item) => (
                <div key={item.id} className="rounded-[8px] bg-[#fbfcfd] p-3">
                  <p className="text-[13px] font-black text-[#10233f]">{item.title}</p>
                  <p className="mt-1 truncate text-[11px] font-bold text-[#8b9aae]">{item.url}</p>
                </div>
              ))}
              {!quickLinksQuery.isLoading && quickLinks.length === 0 ? <div className="rounded-[8px] bg-[#fbfcfd] p-6 text-center text-[13px] font-bold text-[#637185]">尚未建立常用網址。</div> : null}
            </div>
          </WorkbenchCard>

          <WorkbenchCard className="p-5">
            <div className="mb-4 flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-[8px] bg-[#fff6e7] text-[#ef7d22]"><Bell className="h-5 w-5" /></div>
              <div>
                <h2 className="text-[15px] font-black">系統公告</h2>
                <p className="text-[12px] font-bold text-[#8b9aae]">資料走 `/api/portal/system-announcements`。</p>
              </div>
            </div>
            <div className="space-y-3">
              {announcementsQuery.isLoading ? <div className="rounded-[8px] bg-[#fbfcfd] p-4 text-[13px] font-bold text-[#637185]">載入中...</div> : null}
              {announcements.map((item) => (
                <div key={item.id} className="rounded-[8px] bg-[#fbfcfd] p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-[13px] font-black text-[#10233f]">{item.title}</p>
                      <p className="mt-1 line-clamp-2 text-[12px] font-bold text-[#637185]">{item.content}</p>
                    </div>
                    <span className="rounded-full bg-[#eef2f6] px-2 py-1 text-[10px] font-black text-[#637185]">{item.severity}</span>
                  </div>
                </div>
              ))}
              {!announcementsQuery.isLoading && announcements.length === 0 ? <div className="rounded-[8px] bg-[#fbfcfd] p-6 text-center text-[13px] font-bold text-[#637185]">尚未建立系統公告。</div> : null}
            </div>
          </WorkbenchCard>
        </div>

        <WorkbenchCard className="p-5">
          <div className="grid gap-3 sm:grid-cols-3">
            {governanceItems.map(([title, desc, Icon]) => (
              <div key={title} className="rounded-[8px] bg-[#fbfcfd] p-3">
                <Icon className="h-5 w-5 text-[#2f6fe8]" />
                <p className="mt-2 text-[13px] font-black text-[#10233f]">{title}</p>
                <p className="mt-1 text-[12px] font-bold text-[#8b9aae]">{desc}</p>
              </div>
            ))}
          </div>
        </WorkbenchCard>
      </div>
    </RoleShell>
  );
}
