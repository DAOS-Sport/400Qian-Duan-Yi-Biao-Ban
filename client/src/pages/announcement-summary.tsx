import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  MessageSquare,
  Search,
  Clock,
  CheckCircle2,
  XCircle,
  RefreshCw,
  AlertCircle,
  Inbox,
  BarChart3,
  TrendingUp,
  Loader2,
  Building2,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import type {
  AnnouncementSummaryResponse,
  AnnouncementWeeklyReportResponse,
} from "@/types/announcement";
import { TYPE_LABELS } from "@/types/announcement";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] } },
};

const TYPE_COLORS: Record<string, string> = {
  rule: "#3b82f6",
  notice: "#8b5cf6",
  campaign: "#f59e0b",
  discount: "#10b981",
  script: "#ef4444",
  ignore: "#94a3b8",
};

interface KpiDef {
  label: string;
  key: keyof AnnouncementSummaryResponse;
  icon: typeof MessageSquare;
  accent: string;
  iconBg: string;
}

const KPI_DEFS: KpiDef[] = [
  { label: "今日總訊息數", key: "totalMessagesToday", icon: MessageSquare, accent: "text-blue-600 dark:text-blue-400", iconBg: "bg-blue-100 dark:bg-blue-900/50" },
  { label: "今日分析數", key: "analyzedMessagesToday", icon: Search, accent: "text-indigo-600 dark:text-indigo-400", iconBg: "bg-indigo-100 dark:bg-indigo-900/50" },
  { label: "待審核", key: "pendingReviewCount", icon: Clock, accent: "text-amber-600 dark:text-amber-400", iconBg: "bg-amber-100 dark:bg-amber-900/50" },
  { label: "已核准", key: "approvedCount", icon: CheckCircle2, accent: "text-emerald-600 dark:text-emerald-400", iconBg: "bg-emerald-100 dark:bg-emerald-900/50" },
  { label: "已退回", key: "rejectedCount", icon: XCircle, accent: "text-red-600 dark:text-red-400", iconBg: "bg-red-100 dark:bg-red-900/50" },
];

function formatShortDate(dateStr: string) {
  try {
    const d = new Date(dateStr);
    return `${d.getMonth() + 1}/${d.getDate()}`;
  } catch {
    return dateStr;
  }
}

export default function AnnouncementSummary() {
  const summaryQ = useQuery<AnnouncementSummaryResponse>({
    queryKey: ["/api/announcement-dashboard/summary"],
    refetchInterval: 30000,
  });

  const weeklyQ = useQuery<AnnouncementWeeklyReportResponse>({
    queryKey: ["/api/announcement-reports/weekly"],
    refetchInterval: 60000,
  });

  const summary = summaryQ.data;
  const weekly = weeklyQ.data;
  const isLoading = summaryQ.isLoading && weeklyQ.isLoading;
  const hasError = summaryQ.isError && weeklyQ.isError;

  const typeData = summary?.byType
    ? Object.entries(summary.byType)
        .filter(([k]) => k !== "ignore" || (summary.byType?.[k] ?? 0) > 0)
        .map(([key, value]) => ({
          name: TYPE_LABELS[key] || key,
          value,
          fill: TYPE_COLORS[key] || "#94a3b8",
        }))
    : [];

  const facilityData = summary?.byFacility
    ? Object.entries(summary.byFacility)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
        .map(([name, count]) => ({ name, count }))
    : [];

  const trendDays = weekly?.days
    ? weekly.days.map((d) => ({ ...d, date: formatShortDate(d.date) }))
    : [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full gap-3">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        <span className="text-sm text-muted-foreground">載入公告分析資料...</span>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <AlertCircle className="h-12 w-12 text-red-400" />
        <p className="text-sm text-muted-foreground">無法載入公告分析資料</p>
        <Button variant="outline" size="sm" onClick={() => { summaryQ.refetch(); weeklyQ.refetch(); }} data-testid="button-retry-summary">
          <RefreshCw className="h-4 w-4 mr-1.5" />重試
        </Button>
      </div>
    );
  }

  const noData = !summary && !weekly;

  return (
    <div className="h-full overflow-y-auto">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto p-6 space-y-6"
      >
        <motion.div variants={cardVariants} className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-foreground" data-testid="text-summary-title">公告分析總覽</h1>
            <p className="text-sm text-muted-foreground mt-0.5">AI 公告歸納器即時統計與趨勢分析</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => { summaryQ.refetch(); weeklyQ.refetch(); }}
            disabled={summaryQ.isFetching || weeklyQ.isFetching}
            data-testid="button-refresh-summary"
          >
            <RefreshCw className={`h-4 w-4 mr-1.5 ${summaryQ.isFetching || weeklyQ.isFetching ? "animate-spin" : ""}`} />
            重新整理
          </Button>
        </motion.div>

        {summaryQ.isError && !weeklyQ.isError && (
          <motion.div variants={cardVariants} className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl p-3 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-amber-500 shrink-0" />
            <p className="text-xs text-amber-700 dark:text-amber-300">摘要 API 暫時無法回應，部分統計數據可能不完整</p>
          </motion.div>
        )}

        {weeklyQ.isError && !summaryQ.isError && (
          <motion.div variants={cardVariants} className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl p-3 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-amber-500 shrink-0" />
            <p className="text-xs text-amber-700 dark:text-amber-300">週報 API 暫時無法回應，趨勢圖表不可用</p>
          </motion.div>
        )}

        {noData ? (
          <motion.div variants={cardVariants} className="flex flex-col items-center justify-center py-20 gap-4">
            <Inbox className="h-14 w-14 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">目前尚無公告分析資料</p>
            <p className="text-xs text-muted-foreground/60">系統偵測到群組訊息後將自動開始分析</p>
          </motion.div>
        ) : (
          <>
            {summary && (
              <motion.div variants={cardVariants} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4" data-testid="section-kpi-cards">
                {KPI_DEFS.map((kpi) => {
                  const Icon = kpi.icon;
                  const val = summary[kpi.key];
                  return (
                    <div key={kpi.key} className="bg-card rounded-xl border p-4 flex flex-col gap-2" data-testid={`kpi-${kpi.key}`}>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-muted-foreground">{kpi.label}</span>
                        <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${kpi.iconBg}`}>
                          <Icon className={`h-4 w-4 ${kpi.accent}`} />
                        </div>
                      </div>
                      <p className={`text-2xl font-semibold ${kpi.accent}`}>{val ?? "-"}</p>
                    </div>
                  );
                })}
              </motion.div>
            )}

            {trendDays.length > 0 && (
              <>
                {(() => {
                  const totalHigh = trendDays.reduce((s, d) => s + (d.highConfidenceCount || 0), 0);
                  return totalHigh > 0 ? (
                    <motion.div variants={cardVariants} className="bg-gradient-to-r from-emerald-50 to-blue-50 dark:from-emerald-950/20 dark:to-blue-950/20 rounded-xl border p-4 flex items-center gap-4" data-testid="section-high-confidence">
                      <div className="h-10 w-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center">
                        <Sparkles className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">本週高信心公告：{totalHigh} 筆</p>
                        <p className="text-xs text-muted-foreground">信心度 80% 以上，建議優先審核</p>
                      </div>
                    </motion.div>
                  ) : null;
                })()}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <motion.div variants={cardVariants} className="bg-card rounded-xl border p-5" data-testid="chart-trend-line">
                    <div className="flex items-center gap-2 mb-4">
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                      <h3 className="text-sm font-semibold text-foreground">7 天分析趨勢</h3>
                    </div>
                    <ResponsiveContainer width="100%" height={220}>
                      <LineChart data={trendDays}>
                        <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                        <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 11 }} />
                        <RechartsTooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid var(--border)" }} />
                        <Line type="monotone" dataKey="totalMessages" name="總訊息" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} />
                        <Line type="monotone" dataKey="analyzedMessages" name="分析數" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 3 }} />
                        <Line type="monotone" dataKey="candidatesCreated" name="候選公告" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} />
                        <Legend wrapperStyle={{ fontSize: 11 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </motion.div>

                  <motion.div variants={cardVariants} className="bg-card rounded-xl border p-5" data-testid="chart-approval-bar">
                    <div className="flex items-center gap-2 mb-4">
                      <BarChart3 className="h-4 w-4 text-muted-foreground" />
                      <h3 className="text-sm font-semibold text-foreground">核准 / 退回統計</h3>
                    </div>
                    <ResponsiveContainer width="100%" height={220}>
                      <BarChart data={trendDays}>
                        <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                        <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 11 }} />
                        <RechartsTooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid var(--border)" }} />
                        <Bar dataKey="approved" name="核准" fill="#10b981" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="rejected" name="退回" fill="#ef4444" radius={[4, 4, 0, 0]} />
                        <Legend wrapperStyle={{ fontSize: 11 }} />
                      </BarChart>
                    </ResponsiveContainer>
                  </motion.div>
                </div>
              </>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {typeData.length > 0 && (
                <motion.div variants={cardVariants} className="bg-card rounded-xl border p-5" data-testid="chart-type-distribution">
                  <div className="flex items-center gap-2 mb-4">
                    <BarChart3 className="h-4 w-4 text-muted-foreground" />
                    <h3 className="text-sm font-semibold text-foreground">類型分布</h3>
                  </div>
                  <ResponsiveContainer width="100%" height={240}>
                    <PieChart>
                      <Pie data={typeData} cx="50%" cy="50%" innerRadius={50} outerRadius={90} paddingAngle={2} dataKey="value" nameKey="name" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={{ strokeWidth: 1 }}>
                        {typeData.map((entry, i) => (
                          <Cell key={i} fill={entry.fill} />
                        ))}
                      </Pie>
                      <RechartsTooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                    </PieChart>
                  </ResponsiveContainer>
                </motion.div>
              )}

              {facilityData.length > 0 && (
                <motion.div variants={cardVariants} className="bg-card rounded-xl border p-5" data-testid="chart-facility-distribution">
                  <div className="flex items-center gap-2 mb-4">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <h3 className="text-sm font-semibold text-foreground">場館分布 (Top {facilityData.length})</h3>
                  </div>
                  <div className="space-y-2.5">
                    {facilityData.map((f, i) => {
                      const maxCount = facilityData[0]?.count || 1;
                      const pct = (f.count / maxCount) * 100;
                      return (
                        <div key={f.name} className="flex items-center gap-3" data-testid={`facility-row-${i}`}>
                          <span className="text-xs text-muted-foreground w-28 truncate shrink-0">{f.name}</span>
                          <div className="flex-1 h-5 bg-muted rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="text-xs font-semibold text-foreground w-8 text-right">{f.count}</span>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </div>

            {weekly?.summary && (
              <motion.div variants={cardVariants} className="bg-card rounded-xl border p-5" data-testid="section-weekly-summary">
                <div className="flex items-center gap-2 mb-3">
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                  <h3 className="text-sm font-semibold text-foreground">本週彙總</h3>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[
                    { label: "分析總數", value: weekly.summary.totalAnalyzed },
                    { label: "候選公告", value: weekly.summary.totalCandidates },
                    { label: "已核准", value: weekly.summary.totalApproved },
                    { label: "已退回", value: weekly.summary.totalRejected },
                  ].map((item) => (
                    <div key={item.label} className="text-center">
                      <p className="text-xs text-muted-foreground">{item.label}</p>
                      <p className="text-xl font-semibold text-foreground mt-1">{item.value ?? "-"}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </>
        )}
      </motion.div>
    </div>
  );
}
