import { useState, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Filter,
  RefreshCw,
  Loader2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  X,
  CheckCircle2,
  XCircle,
  Clock,
  Shield,
  Eye,
  FileText,
  MessageSquare,
  Building2,
  Calendar,
  User,
  Sparkles,
  Star,
  MapPin,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type {
  AnnouncementCandidate,
  AnnouncementCandidateDetail,
  AnnouncementCandidatesResponse,
  AnnouncementFilters,
} from "@/types/announcement";
import { TYPE_LABELS, STATUS_LABELS, CANDIDATE_TYPES, CANDIDATE_STATUSES } from "@/types/announcement";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.04 } },
};
const rowVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

const TYPE_BADGE_COLORS: Record<string, string> = {
  rule: "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300",
  notice: "bg-violet-100 text-violet-700 dark:bg-violet-900/50 dark:text-violet-300",
  campaign: "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300",
  discount: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300",
  script: "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300",
  ignore: "bg-gray-100 text-gray-600 dark:bg-zinc-800 dark:text-muted-foreground",
};

const STATUS_BADGE_COLORS: Record<string, string> = {
  pending_review: "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300",
  approved: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300",
  rejected: "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300",
  ignored: "bg-gray-100 text-gray-600 dark:bg-zinc-800 dark:text-muted-foreground",
  vip_chat: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300 border border-yellow-300 dark:border-yellow-700",
};

function TypeBadge({ type }: { type: string }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${TYPE_BADGE_COLORS[type] || TYPE_BADGE_COLORS.ignore}`} data-testid={`badge-type-${type}`}>
      {TYPE_LABELS[type] || type}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const Icon = status === "approved" ? CheckCircle2 : status === "rejected" ? XCircle : status === "ignored" ? XCircle : status === "vip_chat" ? Star : Clock;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${STATUS_BADGE_COLORS[status] || STATUS_BADGE_COLORS.pending_review}`} data-testid={`badge-status-${status}`}>
      <Icon className={`h-3 w-3 ${status === "vip_chat" ? "fill-yellow-500 text-yellow-600" : ""}`} />
      {STATUS_LABELS[status] || status}
    </span>
  );
}

function isVipCandidate(candidate: AnnouncementCandidate): boolean {
  return candidate.reasoningTags?.some(t => t.includes("特別關注")) || candidate.status === "vip_chat" || false;
}

function VipTag({ candidate }: { candidate: AnnouncementCandidate }) {
  const vipTag = candidate.reasoningTags?.find(t => t.includes("特別關注"));
  if (!vipTag && candidate.status !== "vip_chat") return null;
  return (
    <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300 border border-yellow-300 dark:border-yellow-700" data-testid="badge-vip">
      <Star className="h-3 w-3 fill-yellow-500 text-yellow-600" />
      {vipTag || "\u2B50 特別關注"}
    </span>
  );
}

function GroupNameBadge({ facilityName, groupId }: { facilityName?: string; groupId?: string }) {
  const name = facilityName || groupId;
  if (!name) return null;
  return (
    <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300" data-testid="badge-group-name">
      <MapPin className="h-3 w-3" />
      {name}
    </span>
  );
}

function parseConfidence(c: number | string | undefined | null): number {
  if (c == null) return 0;
  const n = typeof c === "string" ? parseFloat(c) : c;
  return isNaN(n) ? 0 : n;
}

function ConfidenceBadge({ confidence }: { confidence: number | string }) {
  const val = parseConfidence(confidence);
  const level = val >= 0.8 ? "high" : val >= 0.6 ? "mid" : "low";
  const cls = level === "high"
    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300"
    : level === "mid"
      ? "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300"
      : "bg-gray-100 text-gray-600 dark:bg-zinc-800 dark:text-muted-foreground";
  const label = level === "high" ? "高信心" : level === "mid" ? "中等" : "低信心";
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${cls}`} data-testid="badge-confidence">
      <Sparkles className="h-3 w-3" />
      {(val * 100).toFixed(0)}% {label}
    </span>
  );
}

function formatTaipeiDate(dateStr: string | undefined) {
  if (!dateStr) return "-";
  try {
    return new Date(dateStr).toLocaleString("zh-TW", { timeZone: "Asia/Taipei", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" });
  } catch {
    return dateStr;
  }
}

function buildQueryString(filters: AnnouncementFilters): string {
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(filters)) {
    if (k === "vipFocus") continue;
    if (v != null && v !== "" && v !== undefined) params.set(k, String(v));
  }
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

function FilterBar({ filters, onChange }: { filters: AnnouncementFilters; onChange: (f: AnnouncementFilters) => void }) {
  const [keyword, setKeyword] = useState(filters.keyword || "");
  const apply = useCallback(() => onChange({ ...filters, keyword: keyword || undefined, page: 1 }), [keyword, filters, onChange]);

  return (
    <motion.div variants={rowVariants} className="bg-card rounded-xl border p-4 space-y-3" data-testid="section-filters">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold text-foreground">篩選條件</h3>
        </div>
        <Button
          variant={filters.vipFocus ? "default" : "outline"}
          size="sm"
          className={`h-8 text-xs ${filters.vipFocus ? "bg-yellow-500 hover:bg-yellow-600 text-white border-yellow-500" : "border-yellow-400 text-yellow-700 dark:text-yellow-300 hover:bg-yellow-50 dark:hover:bg-yellow-900/30"}`}
          onClick={() => onChange({ ...filters, vipFocus: filters.vipFocus ? undefined : true, page: 1 })}
          data-testid="button-vip-filter"
        >
          <Star className={`h-3.5 w-3.5 mr-1 ${filters.vipFocus ? "fill-white" : "fill-yellow-500 text-yellow-600"}`} />
          特別關注
        </Button>
      </div>
      <div className="flex flex-wrap gap-2 items-end">
        <div className="flex-1 min-w-[180px]">
          <label className="text-[10px] text-muted-foreground mb-1 block">關鍵字</label>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              className="pl-8 h-9 text-sm"
              placeholder="搜尋標題或內容..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && apply()}
              data-testid="input-keyword"
            />
          </div>
        </div>
        <div className="min-w-[120px]">
          <label className="text-[10px] text-muted-foreground mb-1 block">狀態</label>
          <select
            className="w-full h-9 rounded-lg border bg-background px-3 text-sm"
            value={filters.status || ""}
            onChange={(e) => onChange({ ...filters, status: e.target.value || undefined, page: 1 })}
            data-testid="select-status"
          >
            <option value="">全部</option>
            {CANDIDATE_STATUSES.map((s) => (
              <option key={s} value={s}>{STATUS_LABELS[s]}</option>
            ))}
          </select>
        </div>
        <div className="min-w-[120px]">
          <label className="text-[10px] text-muted-foreground mb-1 block">類型</label>
          <select
            className="w-full h-9 rounded-lg border bg-background px-3 text-sm"
            value={filters.candidateType || ""}
            onChange={(e) => onChange({ ...filters, candidateType: e.target.value || undefined, page: 1 })}
            data-testid="select-type"
          >
            <option value="">全部</option>
            {CANDIDATE_TYPES.map((t) => (
              <option key={t} value={t}>{TYPE_LABELS[t]}</option>
            ))}
          </select>
        </div>
        <div className="min-w-[140px]">
          <label className="text-[10px] text-muted-foreground mb-1 block">場館</label>
          <Input
            className="h-9 text-sm"
            placeholder="場館名稱..."
            value={filters.facilityName || ""}
            onChange={(e) => onChange({ ...filters, facilityName: e.target.value || undefined, page: 1 })}
            data-testid="input-facility"
          />
        </div>
        <div className="min-w-[140px]">
          <label className="text-[10px] text-muted-foreground mb-1 block">群組 ID</label>
          <Input
            className="h-9 text-sm"
            placeholder="群組 ID..."
            value={filters.groupId || ""}
            onChange={(e) => onChange({ ...filters, groupId: e.target.value || undefined, page: 1 })}
            data-testid="input-groupid"
          />
        </div>
        <div className="min-w-[130px]">
          <label className="text-[10px] text-muted-foreground mb-1 block">起始日</label>
          <Input
            type="date"
            className="h-9 text-sm"
            value={filters.dateFrom || ""}
            onChange={(e) => onChange({ ...filters, dateFrom: e.target.value || undefined, page: 1 })}
            data-testid="input-date-from"
          />
        </div>
        <div className="min-w-[130px]">
          <label className="text-[10px] text-muted-foreground mb-1 block">結束日</label>
          <Input
            type="date"
            className="h-9 text-sm"
            value={filters.dateTo || ""}
            onChange={(e) => onChange({ ...filters, dateTo: e.target.value || undefined, page: 1 })}
            data-testid="input-date-to"
          />
        </div>
        <div className="min-w-[80px]">
          <label className="text-[10px] text-muted-foreground mb-1 block">每頁</label>
          <select
            className="w-full h-9 rounded-lg border bg-background px-3 text-sm"
            value={filters.pageSize || 20}
            onChange={(e) => onChange({ ...filters, pageSize: Number(e.target.value), page: 1 })}
            data-testid="select-pagesize"
          >
            {[10, 20, 50, 100].map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </div>
        <Button size="sm" onClick={apply} className="h-9" data-testid="button-apply-filter">
          <Search className="h-3.5 w-3.5 mr-1" />搜尋
        </Button>
      </div>
    </motion.div>
  );
}

function CandidateRow({ candidate, onClick }: { candidate: AnnouncementCandidate; onClick: () => void }) {
  const isVip = isVipCandidate(candidate);
  return (
    <motion.div
      variants={rowVariants}
      whileHover={{ y: -2, transition: { duration: 0.15 } }}
      onClick={onClick}
      className={`bg-card rounded-xl border p-4 cursor-pointer hover:shadow-sm transition-shadow ${isVip ? "ring-1 ring-yellow-300 dark:ring-yellow-700" : ""}`}
      data-testid={`candidate-row-${candidate.id}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1.5">
            <p className="text-sm font-semibold text-foreground truncate">{candidate.title || "(無標題)"}</p>
            <TypeBadge type={candidate.candidateType} />
            <StatusBadge status={candidate.status} />
            <ConfidenceBadge confidence={candidate.confidence} />
            <VipTag candidate={candidate} />
          </div>
          {candidate.summary && (
            <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{candidate.summary}</p>
          )}
          <div className="flex items-center gap-4 text-[10px] text-muted-foreground flex-wrap">
            <GroupNameBadge facilityName={candidate.facilityName} groupId={candidate.groupId} />
            {candidate.displayName && (
              <span className="flex items-center gap-1">
                {isVip ? <Star className="h-3 w-3 fill-yellow-500 text-yellow-600" /> : <User className="h-3 w-3" />}
                {candidate.displayName}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />{formatTaipeiDate(candidate.detectedAt)}
            </span>
          </div>
        </div>
        <Eye className="h-4 w-4 text-muted-foreground/50 shrink-0 mt-1" />
      </div>
    </motion.div>
  );
}

function DetailDrawer({ candidateId, onClose }: { candidateId: number; onClose: () => void }) {
  const { toast } = useToast();

  const detailQ = useQuery<AnnouncementCandidateDetail>({
    queryKey: ["/api/announcement-candidates", candidateId],
    queryFn: async () => {
      const res = await fetch(`/api/announcement-candidates/${candidateId}`);
      if (!res.ok) throw new Error(`${res.status}: ${await res.text()}`);
      const raw = await res.json();
      const c = raw.candidate || raw;
      return { ...c, reviews: raw.reviews || c.reviews || [] } as AnnouncementCandidateDetail;
    },
  });

  const [comment, setComment] = useState("");

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: ["/api/announcement-candidates"] });
    queryClient.invalidateQueries({ queryKey: ["/api/announcement-dashboard/summary"] });
    queryClient.invalidateQueries({ queryKey: ["/api/announcement-reports/weekly"] });
  };

  const approveMut = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/announcement-candidates/${candidateId}/approve`, { comment: comment || undefined });
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "已核准此公告" });
      invalidateAll();
      onClose();
    },
    onError: (err: Error) => toast({ title: "核准失敗", description: err.message, variant: "destructive" }),
  });

  const rejectMut = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/announcement-candidates/${candidateId}/reject`, { comment: comment || undefined });
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "已退回此公告" });
      invalidateAll();
      onClose();
    },
    onError: (err: Error) => toast({ title: "退回失敗", description: err.message, variant: "destructive" }),
  });

  const d = detailQ.data;
  const isBusy = approveMut.isPending || rejectMut.isPending;

  return (
    <>
      <motion.div
        key="overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        data-testid="drawer-overlay"
      />
      <motion.div
        key="drawer"
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        className="fixed top-0 right-0 z-[51] h-full w-full max-w-2xl bg-background shadow-2xl overflow-y-auto"
        data-testid="drawer-detail"
      >
        <div className="sticky top-0 z-10 bg-background/90 backdrop-blur-md border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-foreground truncate" data-testid="text-detail-title">
            {d?.title || "公告詳情"}
          </h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-muted transition-colors" data-testid="button-close-detail">
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {detailQ.isLoading && (
            <div className="space-y-4">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-32 w-full" />
            </div>
          )}

          {detailQ.isError && (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <AlertCircle className="h-10 w-10 text-red-400" />
              <p className="text-sm text-muted-foreground">無法載入公告詳情</p>
            </div>
          )}

          {d && (
            <>
              <div className="bg-blue-50 dark:bg-blue-950/30 rounded-xl p-4 border border-blue-200 dark:border-blue-800 space-y-2" data-testid="section-source-group">
                <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                  <MapPin className="h-4 w-4" />
                  <span className="text-xs font-semibold uppercase tracking-wide">來源群組</span>
                </div>
                <p className="text-sm font-semibold text-foreground">{d.facilityName || "未知場館"}</p>
                {d.groupId && (
                  <p className="text-[10px] text-muted-foreground font-mono break-all">{d.groupId}</p>
                )}
                {d.displayName && (
                  <div className="flex items-center gap-1.5 pt-1 text-sm text-foreground">
                    {isVipCandidate(d) ? (
                      <>
                        <Star className="h-3.5 w-3.5 fill-yellow-500 text-yellow-600" />
                        <span className="font-semibold">{d.displayName}</span>
                        <span className="text-[10px] text-yellow-600 dark:text-yellow-400 font-medium">（特別關注）</span>
                      </>
                    ) : (
                      <>
                        <User className="h-3.5 w-3.5 text-muted-foreground" />
                        <span>{d.displayName}</span>
                      </>
                    )}
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                <TypeBadge type={d.candidateType} />
                <StatusBadge status={d.status} />
                <ConfidenceBadge confidence={d.confidence} />
                <VipTag candidate={d} />
                {d.scopeType && (
                  <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">
                    <Shield className="h-3 w-3" />{d.scopeType}
                  </span>
                )}
              </div>

              {d.summary && (
                <div>
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1">摘要</p>
                  <p className="text-sm text-foreground leading-relaxed">{d.summary}</p>
                </div>
              )}

              {d.recommendedAction && (
                <div className="bg-blue-50 dark:bg-blue-950/20 rounded-xl p-4 border border-blue-100 dark:border-blue-900/40">
                  <p className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wide mb-1">建議動作</p>
                  <p className="text-sm text-foreground">{d.recommendedAction}</p>
                </div>
              )}

              {d.badExample && (
                <div className="bg-red-50 dark:bg-red-950/20 rounded-xl p-4 border border-red-100 dark:border-red-900/40">
                  <p className="text-[10px] font-semibold text-red-600 dark:text-red-400 uppercase tracking-wide mb-1">不當範例</p>
                  <p className="text-sm text-foreground">{d.badExample}</p>
                </div>
              )}

              {d.recommendedReply && (
                <div className="bg-emerald-50 dark:bg-emerald-950/20 rounded-xl p-4 border border-emerald-100 dark:border-emerald-900/40">
                  <p className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide mb-1">建議回覆</p>
                  <p className="text-sm text-foreground">{d.recommendedReply}</p>
                </div>
              )}

              {d.extractedJson && (
                <div>
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1">AI 萃取結構</p>
                  <pre className="bg-muted rounded-lg p-3 text-xs font-mono overflow-x-auto max-h-48 overflow-y-auto whitespace-pre-wrap break-words" data-testid="text-extracted-json">
                    {JSON.stringify(d.extractedJson, null, 2)}
                  </pre>
                </div>
              )}

              {(d.originalText || d.sourceMessage) && (
                <div className="bg-muted/50 rounded-xl p-4 border space-y-2">
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">原始訊息</p>
                  <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{d.originalText || d.sourceMessage?.text}</p>
                  <div className="flex flex-wrap gap-3 text-[10px] text-muted-foreground pt-1">
                    {d.displayName && (
                      <span className="flex items-center gap-1"><User className="h-3 w-3" />{d.displayName}</span>
                    )}
                    {(d.sourceMessage?.groupName || d.groupId) && (
                      <span className="flex items-center gap-1"><MessageSquare className="h-3 w-3" />{d.sourceMessage?.groupName || d.groupId}</span>
                    )}
                    {(d.sourceMessage?.facilityName || d.facilityName) && (
                      <span className="flex items-center gap-1"><Building2 className="h-3 w-3" />{d.sourceMessage?.facilityName || d.facilityName}</span>
                    )}
                    {d.sourceMessage?.sentAt && (
                      <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{formatTaipeiDate(d.sourceMessage.sentAt)}</span>
                    )}
                    {(d.isFromSupervisor === true || d.isFromSupervisor === "true" || d.sourceMessage?.isFromSupervisor) && (
                      <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400"><User className="h-3 w-3" />主管發送</span>
                    )}
                  </div>
                </div>
              )}

              {d.reasoningTags && d.reasoningTags.length > 0 && (
                <div>
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">AI 推論標籤</p>
                  <div className="flex flex-wrap gap-1.5">
                    {d.reasoningTags.map((tag, i) => (
                      <span key={i} className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-medium bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {d.appliesToRoles && d.appliesToRoles.length > 0 && (
                <div>
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">適用對象</p>
                  <div className="flex flex-wrap gap-1.5">
                    {d.appliesToRoles.map((role, i) => (
                      <span key={i} className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">
                        {role}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {d.reviews && d.reviews.length > 0 && (
                <div>
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-2">審核記錄</p>
                  <div className="space-y-2">
                    {d.reviews.map((r) => (
                      <div key={r.id} className="bg-card rounded-lg border p-3 flex items-start gap-3">
                        <div className={`h-6 w-6 rounded-full flex items-center justify-center shrink-0 ${r.action === "approve" ? "bg-emerald-100 dark:bg-emerald-900/50" : "bg-red-100 dark:bg-red-900/50"}`}>
                          {r.action === "approve" ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> : <XCircle className="h-3.5 w-3.5 text-red-600" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 text-xs">
                            <span className="font-semibold text-foreground">{r.action === "approve" ? "核准" : "退回"}</span>
                            <span className="text-muted-foreground">{formatTaipeiDate(r.reviewedAt)}</span>
                            {r.reviewedBy && <span className="text-muted-foreground">{r.reviewedBy}</span>}
                          </div>
                          {r.comment && <p className="text-xs text-muted-foreground mt-1">{r.comment}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {(d.status === "pending_review" || d.status === "ignored" || d.status === "vip_chat") && (
                <div className="border-t pt-5 space-y-3">
                  <div>
                    <label className="text-[10px] text-muted-foreground mb-1 block">備註（選填）</label>
                    <textarea
                      className="w-full rounded-lg border bg-background px-3 py-2 text-sm resize-none"
                      rows={2}
                      placeholder="輸入審核備註..."
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      data-testid="input-review-comment"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                      onClick={() => approveMut.mutate()}
                      disabled={isBusy}
                      data-testid="button-approve"
                    >
                      {approveMut.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <CheckCircle2 className="h-4 w-4 mr-1" />}
                      核准
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1 border-red-300 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950/30"
                      onClick={() => rejectMut.mutate()}
                      disabled={isBusy}
                      data-testid="button-reject"
                    >
                      {rejectMut.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <XCircle className="h-4 w-4 mr-1" />}
                      退回
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </motion.div>
    </>
  );
}

export default function Announcements() {
  const [filters, setFilters] = useState<AnnouncementFilters>({ page: 1, pageSize: 20 });
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const qs = buildQueryString(filters);
  const candidatesQ = useQuery<AnnouncementCandidatesResponse>({
    queryKey: ["/api/announcement-candidates", qs],
    queryFn: async () => {
      const res = await fetch(`/api/announcement-candidates${qs}`);
      if (!res.ok) throw new Error(`${res.status}: ${await res.text()}`);
      const raw = await res.json();
      return {
        candidates: raw.items || raw.candidates || [],
        total: raw.total ?? 0,
        page: raw.page ?? 1,
        pageSize: raw.pageSize ?? 20,
        totalPages: raw.totalPages ?? (Math.ceil((raw.total ?? 0) / (raw.pageSize ?? 20)) || 1),
      } as AnnouncementCandidatesResponse;
    },
    refetchInterval: 15000,
  });

  const data = candidatesQ.data;
  const allCandidates = data?.candidates || [];
  const candidates = filters.vipFocus
    ? allCandidates.filter((c) => isVipCandidate(c))
    : allCandidates;
  const totalPages = data?.totalPages || 1;
  const currentPage = filters.page || 1;

  return (
    <div className="h-full overflow-y-auto">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto p-6 space-y-4"
      >
        <motion.div variants={rowVariants} className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-foreground" data-testid="text-announcements-title">候選公告審核</h1>
            <p className="text-sm text-muted-foreground mt-0.5">AI 自動歸納的公告候選項目，待人工審核確認</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => candidatesQ.refetch()}
            disabled={candidatesQ.isFetching}
            data-testid="button-refresh-list"
          >
            <RefreshCw className={`h-4 w-4 mr-1.5 ${candidatesQ.isFetching ? "animate-spin" : ""}`} />
            重新整理
          </Button>
        </motion.div>

        <FilterBar filters={filters} onChange={setFilters} />

        {candidatesQ.isLoading && (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-full rounded-xl" />
            ))}
          </div>
        )}

        {candidatesQ.isError && (
          <motion.div variants={rowVariants} className="flex flex-col items-center justify-center py-16 gap-4">
            <AlertCircle className="h-12 w-12 text-red-400" />
            <p className="text-sm text-muted-foreground">無法載入候選公告列表</p>
            <p className="text-xs text-muted-foreground/60">{(candidatesQ.error as Error)?.message}</p>
            <Button variant="outline" size="sm" onClick={() => candidatesQ.refetch()} data-testid="button-retry-list">
              <RefreshCw className="h-4 w-4 mr-1.5" />重試
            </Button>
          </motion.div>
        )}

        {!candidatesQ.isLoading && !candidatesQ.isError && candidates.length === 0 && (
          <motion.div variants={rowVariants} className="flex flex-col items-center justify-center py-20 gap-4">
            <FileText className="h-14 w-14 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">目前沒有符合條件的候選公告</p>
            <p className="text-xs text-muted-foreground/60">調整篩選條件或等待新的訊息分析結果</p>
          </motion.div>
        )}

        {candidates.length > 0 && (
          <>
            <motion.div variants={rowVariants} className="flex items-center justify-between text-xs text-muted-foreground">
              <span>共 {data?.total ?? candidates.length} 筆結果</span>
              <span>第 {currentPage} / {totalPages} 頁</span>
            </motion.div>

            <motion.div variants={containerVariants} className="space-y-3">
              {candidates.map((c) => (
                <CandidateRow key={c.id} candidate={c} onClick={() => setSelectedId(c.id)} />
              ))}
            </motion.div>

            {totalPages > 1 && (
              <motion.div variants={rowVariants} className="flex items-center justify-center gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage <= 1}
                  onClick={() => setFilters((f) => ({ ...f, page: Math.max(1, (f.page || 1) - 1) }))}
                  data-testid="button-prev-page"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm text-muted-foreground px-3">{currentPage} / {totalPages}</span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage >= totalPages}
                  onClick={() => setFilters((f) => ({ ...f, page: Math.min(totalPages, (f.page || 1) + 1) }))}
                  data-testid="button-next-page"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </motion.div>
            )}
          </>
        )}
      </motion.div>

      <AnimatePresence>
        {selectedId != null && (
          <DetailDrawer candidateId={selectedId} onClose={() => setSelectedId(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}
