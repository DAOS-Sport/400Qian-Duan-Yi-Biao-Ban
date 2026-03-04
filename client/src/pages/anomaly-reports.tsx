import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  Clock,
  MapPin,
  User,
  BadgeCheck,
  ShieldAlert,
  FileWarning,
  Building2,
  Inbox,
  Loader2,
  RefreshCw,
  Image as ImageIcon,
  MessageSquare,
  Hash,
  CheckCircle2,
  CircleDot,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface AnomalyReport {
  id: number;
  employeeId: number | null;
  employeeName: string | null;
  employeeCode: string | null;
  role: string | null;
  lineUserId: string | null;
  context: string;
  clockStatus: string | null;
  clockType: string | null;
  clockTime: string | null;
  venueName: string | null;
  distance: string | null;
  failReason: string | null;
  errorMsg: string | null;
  userNote: string | null;
  imageUrls: string[] | null;
  reportText: string | null;
  resolution: string | null;
  resolvedNote: string | null;
  createdAt: string;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] } },
};

const fadeIn = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45 } },
};

function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}/${pad(d.getMonth() + 1)}/${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  } catch {
    return dateStr;
  }
}

function relativeTime(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = now - then;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "剛剛";
  if (mins < 60) return `${mins} 分鐘前`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} 小時前`;
  const days = Math.floor(hrs / 24);
  return `${days} 天前`;
}

function KpiCard({ title, value, icon: Icon, color, iconBg }: { title: string; value: string | number; icon: typeof AlertTriangle; color: string; iconBg: string }) {
  return (
    <motion.div variants={cardVariants} whileHover={{ y: -2, transition: { duration: 0.2 } }} className="flex-1 min-w-[180px]">
      <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm p-5 border border-gray-100 dark:border-zinc-800">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-medium tracking-wide uppercase text-gray-400 dark:text-zinc-500 mb-1">{title}</p>
            <p className={`text-2xl font-bold tracking-tight ${color}`} data-testid={`text-kpi-${title}`}>{value}</p>
          </div>
          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${iconBg}`}>
            <Icon className="h-5 w-5 text-white" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function DetailRow({ label, value, icon: Icon }: { label: string; value: string; icon?: typeof User }) {
  return (
    <div className="flex items-start gap-2">
      {Icon && <Icon className="h-3.5 w-3.5 shrink-0 mt-0.5 text-gray-400 dark:text-zinc-500" />}
      <div className="min-w-0">
        <span className="text-[10px] font-medium text-gray-400 dark:text-zinc-500 uppercase tracking-wide">{label}</span>
        <p className="text-sm text-gray-700 dark:text-zinc-200">{value}</p>
      </div>
    </div>
  );
}

function AnomalyCard({ report }: { report: AnomalyReport }) {
  const [expanded, setExpanded] = useState(false);
  const [noteInput, setNoteInput] = useState(report.resolvedNote || "");
  const { toast } = useToast();
  const isFail = report.clockStatus === "fail";
  const isResolved = report.resolution === "resolved";

  const resolutionMutation = useMutation({
    mutationFn: async ({ resolution, resolvedNote }: { resolution: string; resolvedNote: string | null }) => {
      const res = await apiRequest("PATCH", `/api/anomaly-reports/${report.id}/resolution`, { resolution, resolvedNote });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/anomaly-reports"] });
      toast({ title: "狀態已更新", description: isResolved ? "已標記為待解決" : "已標記為已處理" });
    },
    onError: (err: Error) => {
      toast({ title: "更新失敗", description: err.message, variant: "destructive" });
    },
  });

  const borderColor = isResolved
    ? "border-green-200 dark:border-green-800/50"
    : "border-orange-200 dark:border-orange-800/50";

  const bgTint = isResolved
    ? "bg-green-50/30 dark:bg-green-950/10"
    : "bg-white dark:bg-zinc-900";

  return (
    <motion.div
      variants={cardVariants}
      className={`${bgTint} rounded-2xl shadow-sm border ${borderColor} overflow-hidden`}
      data-testid={`card-anomaly-${report.id}`}
    >
      <button
        className="w-full text-left p-5 flex items-center gap-4 hover:bg-gray-50/50 dark:hover:bg-zinc-800/30 transition-colors"
        onClick={() => setExpanded(!expanded)}
        data-testid={`button-expand-${report.id}`}
      >
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${isResolved ? "bg-green-100 dark:bg-green-900/40" : isFail ? "bg-red-100 dark:bg-red-900/40" : "bg-orange-100 dark:bg-orange-900/40"}`}>
          {isResolved ? (
            <CheckCircle2 className="h-5 w-5 text-green-500 dark:text-green-400" />
          ) : isFail ? (
            <ShieldAlert className="h-5 w-5 text-red-500 dark:text-red-400" />
          ) : (
            <FileWarning className="h-5 w-5 text-orange-500 dark:text-orange-400" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-bold text-gray-800 dark:text-zinc-100" data-testid={`text-anomaly-employee-${report.id}`}>
              {report.employeeName || "未知員工"}
            </p>
            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${isResolved ? "bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300" : "bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300"}`} data-testid={`badge-resolution-${report.id}`}>
              {isResolved ? (
                <><CheckCircle2 className="h-3 w-3" /> 已處理</>
              ) : (
                <><CircleDot className="h-3 w-3" /> 待解決</>
              )}
            </span>
            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold ${isFail ? "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300" : "bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300"}`} data-testid={`badge-status-${report.id}`}>
              {isFail ? "失敗" : report.clockStatus || report.context}
            </span>
            {report.clockType && (
              <span className="text-[10px] font-medium text-gray-400 dark:text-zinc-500 bg-gray-100 dark:bg-zinc-800 rounded-full px-2 py-0.5">
                {report.clockType === "in" ? "上班" : report.clockType === "out" ? "下班" : report.clockType}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 mt-1 flex-wrap">
            {report.venueName && (
              <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-zinc-400">
                <Building2 className="h-3 w-3" />
                {report.venueName}
              </span>
            )}
            {report.failReason && (
              <span className="text-xs text-red-500 dark:text-red-400 font-medium">
                {report.failReason}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="text-right hidden sm:block">
            <p className="text-xs text-gray-500 dark:text-zinc-400" data-testid={`text-anomaly-time-${report.id}`}>
              {formatDate(report.createdAt)}
            </p>
            <p className="text-[10px] text-gray-400 dark:text-zinc-500">
              {relativeTime(report.createdAt)}
            </p>
          </div>
          <motion.div animate={{ rotate: expanded ? 90 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronRight className="h-4 w-4 text-gray-400 dark:text-zinc-500" />
          </motion.div>
        </div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 border-t border-gray-100 dark:border-zinc-800 pt-4" data-testid={`detail-anomaly-${report.id}`}>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {report.employeeName && <DetailRow label="員工姓名" value={report.employeeName} icon={User} />}
                {report.employeeCode && <DetailRow label="員工編號" value={report.employeeCode} icon={Hash} />}
                {report.role && <DetailRow label="職位" value={report.role} icon={BadgeCheck} />}
                {report.clockTime && <DetailRow label="打卡時間" value={report.clockTime} icon={Clock} />}
                {report.venueName && <DetailRow label="場館" value={report.venueName} icon={Building2} />}
                {report.distance && <DetailRow label="距離" value={report.distance} icon={MapPin} />}
                {report.failReason && <DetailRow label="失敗原因" value={report.failReason} icon={AlertTriangle} />}
                {report.clockType && (
                  <DetailRow
                    label="打卡類型"
                    value={report.clockType === "in" ? "上班打卡" : report.clockType === "out" ? "下班打卡" : report.clockType}
                    icon={Clock}
                  />
                )}
                {report.context && <DetailRow label="異常類型" value={report.context} icon={FileWarning} />}
              </div>

              {report.errorMsg && (
                <div className="mt-4 rounded-xl bg-red-50/60 dark:bg-red-950/20 border border-red-200/60 dark:border-red-800/30 p-3">
                  <p className="text-[10px] font-medium text-red-400 uppercase tracking-wide mb-1">錯誤訊息</p>
                  <p className="text-sm text-red-700 dark:text-red-300">{report.errorMsg}</p>
                </div>
              )}

              {report.userNote && (
                <div className="mt-3 rounded-xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-800/30 p-3">
                  <div className="flex items-center gap-1.5 mb-1">
                    <MessageSquare className="h-3 w-3 text-blue-400" />
                    <p className="text-[10px] font-medium text-blue-400 uppercase tracking-wide">用戶備註</p>
                  </div>
                  <p className="text-sm text-blue-700 dark:text-blue-300">{report.userNote}</p>
                </div>
              )}

              {report.imageUrls && report.imageUrls.length > 0 && (
                <div className="mt-3">
                  <div className="flex items-center gap-1.5 mb-2">
                    <ImageIcon className="h-3 w-3 text-gray-400" />
                    <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wide">附件圖片 ({report.imageUrls.length})</p>
                  </div>
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {report.imageUrls.map((url, i) => (
                      <a
                        key={i}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="shrink-0 h-20 w-20 rounded-lg border border-gray-200 dark:border-zinc-700 overflow-hidden hover:opacity-80 transition-opacity"
                        data-testid={`img-anomaly-${report.id}-${i}`}
                      >
                        <img src={url} alt={`附件 ${i + 1}`} className="h-full w-full object-cover" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-4 rounded-xl bg-gray-50/80 dark:bg-zinc-800/30 border border-gray-200/60 dark:border-zinc-700/50 p-4">
                <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wide mb-3">處理狀態</p>
                <div className="flex flex-col sm:flex-row items-start sm:items-end gap-3">
                  <div className="flex-1 w-full">
                    <label className="text-xs text-gray-500 dark:text-zinc-400 mb-1 block">備註說明</label>
                    <input
                      type="text"
                      value={noteInput}
                      onChange={(e) => setNoteInput(e.target.value)}
                      placeholder="輸入處理備註..."
                      className="w-full rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm text-gray-700 dark:text-zinc-200 placeholder:text-gray-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                      data-testid={`input-note-${report.id}`}
                    />
                  </div>
                  <div className="flex gap-2 shrink-0">
                    {!isResolved ? (
                      <Button
                        size="sm"
                        onClick={(e) => { e.stopPropagation(); resolutionMutation.mutate({ resolution: "resolved", resolvedNote: noteInput || null }); }}
                        disabled={resolutionMutation.isPending}
                        className="bg-green-600 hover:bg-green-700 text-white"
                        data-testid={`button-resolve-${report.id}`}
                      >
                        <CheckCircle2 className="h-4 w-4 mr-1.5" />
                        {resolutionMutation.isPending ? "更新中..." : "標記已處理"}
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => { e.stopPropagation(); resolutionMutation.mutate({ resolution: "pending", resolvedNote: noteInput || null }); }}
                        disabled={resolutionMutation.isPending}
                        className="border-orange-300 text-orange-600 hover:bg-orange-50 dark:border-orange-700 dark:text-orange-400 dark:hover:bg-orange-950/30"
                        data-testid={`button-unresolve-${report.id}`}
                      >
                        <CircleDot className="h-4 w-4 mr-1.5" />
                        {resolutionMutation.isPending ? "更新中..." : "改為待解決"}
                      </Button>
                    )}
                  </div>
                </div>
                {report.resolvedNote && (
                  <p className="mt-2 text-xs text-gray-500 dark:text-zinc-400">
                    <span className="font-medium">目前備註：</span>{report.resolvedNote}
                  </p>
                )}
              </div>

              {report.reportText && (
                <details className="mt-3 group">
                  <summary className="text-[10px] font-medium text-gray-400 dark:text-zinc-500 uppercase tracking-wide cursor-pointer hover:text-gray-600 dark:hover:text-zinc-300 transition-colors" data-testid={`toggle-report-text-${report.id}`}>
                    完整報告文字 ▸
                  </summary>
                  <pre className="mt-2 text-xs text-gray-600 dark:text-zinc-400 whitespace-pre-wrap bg-gray-50 dark:bg-zinc-800/50 rounded-xl p-3 border border-gray-100 dark:border-zinc-700 font-mono leading-relaxed" data-testid={`text-report-full-${report.id}`}>
                    {report.reportText}
                  </pre>
                </details>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function AnomalyReportsPage() {
  const { data: reports, isLoading, error, refetch, isRefetching } = useQuery<AnomalyReport[]>({
    queryKey: ["/api/anomaly-reports"],
    refetchInterval: 30000,
  });

  const totalReports = reports?.length ?? 0;
  const pendingCount = reports?.filter((r) => r.resolution !== "resolved").length ?? 0;

  const todayStr = new Date().toISOString().split("T")[0];
  const todayCount = reports?.filter((r) => r.createdAt.startsWith(todayStr)).length ?? 0;

  const venueCounts: Record<string, number> = {};
  const reasonCounts: Record<string, number> = {};
  reports?.forEach((r) => {
    if (r.venueName) venueCounts[r.venueName] = (venueCounts[r.venueName] || 0) + 1;
    if (r.failReason) reasonCounts[r.failReason] = (reasonCounts[r.failReason] || 0) + 1;
  });
  const topVenue = Object.entries(venueCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "—";
  const topReason = Object.entries(reasonCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "—";

  return (
    <div className="h-full overflow-y-auto bg-gray-50/80 dark:bg-zinc-950" data-testid="page-anomaly-reports">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="p-6 lg:p-8 max-w-[1440px] mx-auto space-y-6"
      >
        <motion.div variants={fadeIn} className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-red-500 to-orange-600">
              <AlertTriangle className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-800 dark:text-zinc-100" data-testid="text-page-title">
                打卡異常管理
              </h1>
              <p className="text-sm text-gray-400 dark:text-zinc-500">
                即時監控排班系統打卡異常紀錄 · 自動 30 秒刷新
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isRefetching}
            data-testid="button-refresh"
          >
            <RefreshCw className={`h-4 w-4 mr-1.5 ${isRefetching ? "animate-spin" : ""}`} />
            {isRefetching ? "更新中..." : "手動刷新"}
          </Button>
        </motion.div>

        <motion.div variants={fadeIn} className="flex flex-wrap gap-4">
          <KpiCard title="總異常數" value={totalReports} icon={AlertTriangle} color="text-red-600 dark:text-red-400" iconBg="bg-red-500" />
          <KpiCard title="待解決" value={pendingCount} icon={CircleDot} color="text-orange-600 dark:text-orange-400" iconBg="bg-orange-500" />
          <KpiCard title="今日異常" value={todayCount} icon={Clock} color="text-amber-600 dark:text-amber-400" iconBg="bg-amber-500" />
          <KpiCard title="最常見場館" value={topVenue} icon={Building2} color="text-blue-600 dark:text-blue-400" iconBg="bg-blue-500" />
          <KpiCard title="最常見原因" value={topReason} icon={FileWarning} color="text-purple-600 dark:text-purple-400" iconBg="bg-purple-500" />
        </motion.div>

        {isLoading && (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-red-500" />
            <p className="text-sm text-gray-400 dark:text-zinc-500">載入異常紀錄中...</p>
          </div>
        )}

        {error && (
          <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-red-200 dark:border-red-800/50 p-8 text-center">
            <AlertTriangle className="h-8 w-8 text-red-400 mx-auto mb-3" />
            <p className="text-sm font-semibold text-gray-700 dark:text-zinc-200 mb-1">無法載入異常紀錄</p>
            <p className="text-xs text-gray-400 dark:text-zinc-500">{(error as Error).message}</p>
          </div>
        )}

        {!isLoading && !error && reports && reports.length === 0 && (
          <motion.div variants={fadeIn} className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-800 p-12 text-center">
            <Inbox className="h-12 w-12 text-gray-300 dark:text-zinc-600 mx-auto mb-3" />
            <p className="text-sm font-semibold text-gray-500 dark:text-zinc-400 mb-1" data-testid="text-empty-state">
              目前沒有異常紀錄
            </p>
            <p className="text-xs text-gray-400 dark:text-zinc-500">
              當排班系統偵測到打卡異常時，紀錄會自動顯示在此處
            </p>
          </motion.div>
        )}

        {!isLoading && !error && reports && reports.length > 0 && (
          <motion.div variants={containerVariants} className="space-y-3" data-testid="list-anomaly-reports">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-semibold text-gray-500 dark:text-zinc-400">
                共 {reports.length} 筆異常紀錄
              </span>
            </div>
            {reports.map((report) => (
              <AnomalyCard key={report.id} report={report} />
            ))}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
