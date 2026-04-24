import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { LucideIcon } from "lucide-react";
import { AlertCircle, CheckCircle2, Clock, FileText, Megaphone, RefreshCw, Search, Sparkles, XCircle } from "lucide-react";
import type { AnnouncementCandidate, AnnouncementFilters } from "@/types/announcement";
import { STATUS_LABELS, TYPE_LABELS } from "@/types/announcement";
import { WorkbenchCard } from "@/shared/ui-kit/workbench-card";
import { cn } from "@/lib/utils";
import { RoleShell } from "@/modules/workbench/role-shell";
import { approveAnnouncementCandidate, fetchAnnouncementCandidates, fetchAnnouncementSummary, rejectAnnouncementCandidate } from "./api";

const statusTone: Record<string, string> = {
  pending_review: "bg-[#fff6e7] text-[#ef7d22]",
  approved: "bg-[#eaf8ef] text-[#15935d]",
  rejected: "bg-[#ffe8eb] text-[#ff4964]",
  ignored: "bg-[#eef2f6] text-[#637185]",
  vip_chat: "bg-[#fff8d9] text-[#9c6b00]",
};

const summaryCards: readonly (readonly [label: string, key: "totalMessagesToday" | "analyzedMessagesToday" | "pendingReviewCount" | "approvedCount" | "rejectedCount", Icon: LucideIcon, tone: string])[] = [
  ["今日訊息", "totalMessagesToday", Megaphone, "text-[#2f6fe8]"],
  ["今日分析", "analyzedMessagesToday", Search, "text-[#6947d8]"],
  ["待審核", "pendingReviewCount", Clock, "text-[#ef7d22]"],
  ["已核准", "approvedCount", CheckCircle2, "text-[#15935d]"],
  ["已退回", "rejectedCount", XCircle, "text-[#ff4964]"],
];

const confidence = (value: number | string | undefined) => {
  const parsed = typeof value === "string" ? Number.parseFloat(value) : value ?? 0;
  return Number.isFinite(parsed) ? parsed : 0;
};

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={cn("rounded-full px-2 py-1 text-[10px] font-black", statusTone[status] ?? statusTone.pending_review)}>
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}

function CandidateRow({
  candidate,
  active,
  onSelect,
}: {
  candidate: AnnouncementCandidate;
  active: boolean;
  onSelect: () => void;
}) {
  const score = confidence(candidate.confidence);
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "w-full rounded-[8px] border p-3 text-left transition hover:bg-white hover:shadow-sm",
        active ? "border-[#2f6fe8] bg-[#eef5ff]" : "border-[#e6edf4] bg-[#fbfcfd]",
      )}
    >
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <StatusBadge status={candidate.status} />
        <span className="rounded-full bg-[#eef5ff] px-2 py-1 text-[10px] font-black text-[#2f6fe8]">
          {TYPE_LABELS[candidate.candidateType] ?? candidate.candidateType}
        </span>
        {score >= 0.8 ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-[#eaf8ef] px-2 py-1 text-[10px] font-black text-[#15935d]">
            <Sparkles className="h-3 w-3" />
            高信心 {(score * 100).toFixed(0)}%
          </span>
        ) : null}
      </div>
      <p className="line-clamp-2 text-[14px] font-black text-[#10233f]">{candidate.title || "未命名公告候選"}</p>
      <p className="mt-1 line-clamp-2 text-[12px] font-medium text-[#637185]">{candidate.summary || candidate.originalText || "尚無摘要"}</p>
      <div className="mt-3 flex items-center justify-between gap-3 text-[11px] font-bold text-[#8b9aae]">
        <span className="truncate">{candidate.facilityName || candidate.groupName || candidate.groupId || "未指定場館"}</span>
        <span>{candidate.detectedAt ? new Date(candidate.detectedAt).toLocaleDateString("zh-TW") : "-"}</span>
      </div>
    </button>
  );
}

function DetailPanel({
  candidate,
  onApprove,
  onReject,
  busy,
}: {
  candidate?: AnnouncementCandidate;
  onApprove: (candidate: AnnouncementCandidate) => void;
  onReject: (candidate: AnnouncementCandidate) => void;
  busy: boolean;
}) {
  if (!candidate) {
    return (
      <WorkbenchCard className="grid min-h-[420px] place-items-center p-6 text-center">
        <div>
          <FileText className="mx-auto h-10 w-10 text-[#8b9aae]" />
          <p className="mt-3 text-[15px] font-black">選擇一筆公告候選</p>
          <p className="mt-1 text-[13px] text-[#637185]">主管可在右側檢視來源、建議回覆與處理動作。</p>
        </div>
      </WorkbenchCard>
    );
  }

  return (
    <WorkbenchCard className="p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.08em] text-[#007166]">Review Detail</p>
          <h2 className="mt-2 text-[20px] font-black leading-tight">{candidate.title}</h2>
        </div>
        <StatusBadge status={candidate.status} />
      </div>

      <div className="mt-5 space-y-4">
        <section>
          <h3 className="text-[12px] font-black text-[#536175]">AI 摘要</h3>
          <p className="mt-2 rounded-[8px] bg-[#f7f9fb] p-3 text-[14px] leading-6 text-[#263b56]">{candidate.summary || "無摘要"}</p>
        </section>
        <section>
          <h3 className="text-[12px] font-black text-[#536175]">原始訊息</h3>
          <p className="mt-2 max-h-40 overflow-auto rounded-[8px] bg-[#10233f] p-3 text-[13px] leading-6 text-white">{candidate.originalText || "無原始訊息"}</p>
        </section>
        <section className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-[8px] bg-[#fbfcfd] p-3">
            <p className="text-[11px] font-black text-[#8b9aae]">建議動作</p>
            <p className="mt-1 text-[13px] font-bold">{candidate.recommendedAction || "待主管判斷"}</p>
          </div>
          <div className="rounded-[8px] bg-[#fbfcfd] p-3">
            <p className="text-[11px] font-black text-[#8b9aae]">適用對象</p>
            <p className="mt-1 text-[13px] font-bold">{candidate.appliesToRoles?.join(", ") || "all"}</p>
          </div>
        </section>
        {candidate.recommendedReply ? (
          <section>
            <h3 className="text-[12px] font-black text-[#536175]">建議回覆</h3>
            <p className="mt-2 rounded-[8px] border border-[#dfe7ef] bg-white p-3 text-[13px] leading-6">{candidate.recommendedReply}</p>
          </section>
        ) : null}
      </div>

      <div className="mt-5 grid gap-2 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => onApprove(candidate)}
          disabled={busy}
          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-[8px] bg-[#15935d] px-4 text-[13px] font-black text-white disabled:opacity-60"
        >
          <CheckCircle2 className="h-4 w-4" />
          核准公告
        </button>
        <button
          type="button"
          onClick={() => onReject(candidate)}
          disabled={busy}
          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-[8px] bg-[#ff4964] px-4 text-[13px] font-black text-white disabled:opacity-60"
        >
          <XCircle className="h-4 w-4" />
          退回
        </button>
      </div>
    </WorkbenchCard>
  );
}

export default function SupervisorAnnouncementsPage() {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<AnnouncementFilters>({ page: 1, pageSize: 20, status: "pending_review" });
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [keyword, setKeyword] = useState("");
  const summaryQuery = useQuery({ queryKey: ["/api/announcement-dashboard/summary"], queryFn: fetchAnnouncementSummary });
  const candidatesQuery = useQuery({
    queryKey: ["/api/announcement-candidates", filters],
    queryFn: () => fetchAnnouncementCandidates(filters),
  });

  const candidates = useMemo(
    () => candidatesQuery.data?.candidates ?? candidatesQuery.data?.items ?? [],
    [candidatesQuery.data],
  );
  const selected = candidates.find((candidate) => candidate.id === selectedId) ?? candidates[0];

  const approveMutation = useMutation({
    mutationFn: (candidate: AnnouncementCandidate) => approveAnnouncementCandidate(candidate, "全端測試開發"),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/announcement-candidates"] }),
  });
  const rejectMutation = useMutation({
    mutationFn: (candidate: AnnouncementCandidate) => rejectAnnouncementCandidate(candidate, "全端測試開發", "由主管工作台退回"),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/announcement-candidates"] }),
  });

  const applyKeyword = () => setFilters((current) => ({ ...current, keyword: keyword || undefined, page: 1 }));

  return (
    <RoleShell role="supervisor" title="公告管理" subtitle="審核 LINE Bot Assistant 候選公告，保留原始來源與主管決策紀錄。">
      <div className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          {summaryCards.map(([label, key, Icon, tone]) => (
            <WorkbenchCard key={label} className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[12px] font-bold text-[#637185]">{label}</p>
                  <p className={cn("mt-2 text-[26px] font-black", tone)}>{summaryQuery.data?.[key] ?? 0}</p>
                </div>
                <div className="grid h-10 w-10 place-items-center rounded-[8px] bg-[#eef5ff]">
                  <Icon className="h-5 w-5 text-[#2f6fe8]" />
                </div>
              </div>
            </WorkbenchCard>
          ))}
        </div>

        <WorkbenchCard className="p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
            <div className="min-w-0 flex-1">
              <label className="text-[12px] font-black text-[#536175]">搜尋候選公告</label>
              <div className="mt-2 flex min-h-10 items-center gap-2 rounded-[8px] border border-[#dfe7ef] bg-white px-3">
                <Search className="h-4 w-4 text-[#8b9aae]" />
                <input
                  value={keyword}
                  onChange={(event) => setKeyword(event.target.value)}
                  onKeyDown={(event) => event.key === "Enter" && applyKeyword()}
                  className="min-w-0 flex-1 bg-transparent text-[14px] font-bold outline-none"
                  placeholder="輸入標題、摘要或原文"
                />
              </div>
            </div>
            <select
              value={filters.status || ""}
              onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value || undefined, page: 1 }))}
              className="min-h-10 rounded-[8px] border border-[#dfe7ef] bg-white px-3 text-[13px] font-black"
            >
              <option value="">全部狀態</option>
              {Object.entries(STATUS_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
            <button onClick={applyKeyword} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-[8px] bg-[#0d2a50] px-4 text-[13px] font-black text-white">
              <RefreshCw className="h-4 w-4" />
              套用
            </button>
          </div>
        </WorkbenchCard>

        {candidatesQuery.isError ? (
          <WorkbenchCard className="flex items-center gap-3 p-4 text-[#ff4964]">
            <AlertCircle className="h-5 w-5" />
            <p className="text-[13px] font-black">公告候選池暫時無法載入，請確認 LINE Bot Assistant API。</p>
          </WorkbenchCard>
        ) : null}

        <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
          <WorkbenchCard className="p-4">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-[15px] font-black">候選列表</h2>
              <span className="text-[12px] font-bold text-[#8b9aae]">{candidatesQuery.data?.total ?? candidates.length} 筆</span>
            </div>
            <div className="space-y-3">
              {candidatesQuery.isLoading ? (
                <div className="rounded-[8px] bg-[#fbfcfd] p-4 text-[13px] font-bold text-[#637185]">載入公告候選...</div>
              ) : candidates.length > 0 ? (
                candidates.map((candidate) => (
                  <CandidateRow
                    key={candidate.id}
                    candidate={candidate}
                    active={candidate.id === selected?.id}
                    onSelect={() => setSelectedId(candidate.id)}
                  />
                ))
              ) : (
                <div className="rounded-[8px] bg-[#fbfcfd] p-6 text-center text-[13px] font-bold text-[#637185]">目前沒有符合條件的候選公告。</div>
              )}
            </div>
          </WorkbenchCard>

          <DetailPanel
            candidate={selected}
            busy={approveMutation.isPending || rejectMutation.isPending}
            onApprove={(candidate) => approveMutation.mutate(candidate)}
            onReject={(candidate) => rejectMutation.mutate(candidate)}
          />
        </div>
      </div>
    </RoleShell>
  );
}
