import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Users,
  CheckCircle2,
  MapPin,
  RefreshCw,
  AlertCircle,
  Building2,
  CircleDot,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

const API = {
  featureStats: "https://line-bot-assistant-ronchen2.replit.app/api/admin/dashboard/feature-stats",
  tasksStats: "https://line-bot-assistant-ronchen2.replit.app/api/admin/tasks/stats",
  attendanceStats: "https://line-bot-assistant-ronchen2.replit.app/api/admin/attendance/stats",
};

interface GroupData {
  name: string;
  groupId?: string;
  totalEnabled?: number;
  [key: string]: string | number | undefined;
}

interface PenetrationData {
  feature: string;
  count: number;
  rate: number;
  color?: string;
}

interface FeatureStatsResponse {
  groups: GroupData[];
  featurePenetration: PenetrationData[];
}

interface TasksStatsResponse {
  completionRate: number;
  [key: string]: any;
}

interface AttendanceStatsResponse {
  successful: number;
  [key: string]: any;
}

const EXCLUDED_KEYS = new Set(["name", "groupId", "totalEnabled"]);

interface FeatureMeta {
  label: string;
  emoji: string;
  category: "group" | "web" | "private";
}

const FEATURE_MAP: Record<string, FeatureMeta> = {
  tasks:   { label: "任務交辦", emoji: "📋", category: "group" },
  weather: { label: "天氣預報", emoji: "🌤️", category: "group" },
  wind:    { label: "風力預報", emoji: "🌬️", category: "group" },
  water:   { label: "水質監控", emoji: "💧", category: "group" },
  gps:     { label: "GPS打卡",  emoji: "📍", category: "web" },
  coach:   { label: "教練簽到", emoji: "🏋️", category: "web" },
  survey:  { label: "客戶調查", emoji: "📊", category: "web" },
  employee:  { label: "員工查詢",  emoji: "🔍", category: "private" },
  interview: { label: "面試檢核",  emoji: "📝", category: "private" },
};

interface CategoryDef {
  key: "group" | "web" | "private";
  title: string;
  emoji: string;
  color: string;
  borderColor: string;
  bgColor: string;
  badgeOn: string;
  badgeOff: string;
}

const CATEGORIES: CategoryDef[] = [
  {
    key: "group",
    title: "群組自動化",
    emoji: "💬",
    color: "text-blue-700 dark:text-blue-300",
    borderColor: "border-blue-200 dark:border-blue-800/50",
    bgColor: "bg-blue-50/60 dark:bg-blue-950/20",
    badgeOn: "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300",
    badgeOff: "bg-gray-100 text-gray-400 dark:bg-zinc-800 dark:text-zinc-500",
  },
  {
    key: "web",
    title: "網頁應用",
    emoji: "🌐",
    color: "text-violet-700 dark:text-violet-300",
    borderColor: "border-violet-200 dark:border-violet-800/50",
    bgColor: "bg-violet-50/60 dark:bg-violet-950/20",
    badgeOn: "bg-violet-100 text-violet-700 dark:bg-violet-900/50 dark:text-violet-300",
    badgeOff: "bg-gray-100 text-gray-400 dark:bg-zinc-800 dark:text-zinc-500",
  },
  {
    key: "private",
    title: "私人專屬",
    emoji: "👤",
    color: "text-amber-700 dark:text-amber-300",
    borderColor: "border-amber-200 dark:border-amber-800/50",
    bgColor: "bg-amber-50/60 dark:bg-amber-950/20",
    badgeOn: "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300",
    badgeOff: "bg-gray-100 text-gray-400 dark:bg-zinc-800 dark:text-zinc-500",
  },
];

function getCategoryFeatures(categoryKey: string): string[] {
  return Object.entries(FEATURE_MAP)
    .filter(([, meta]) => meta.category === categoryKey)
    .map(([key]) => key);
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] } },
};

async function strictFetch<T>(url: string): Promise<T> {
  const res = await fetch(url, { headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error(`API ${url} 回傳 HTTP ${res.status}`);
  const ct = res.headers.get("content-type") || "";
  if (!ct.includes("application/json")) throw new Error(`API ${url} 未回傳 JSON (content-type: ${ct})`);
  return res.json();
}

interface KpiItem {
  title: string;
  value: string | number;
  suffix: string;
  icon: typeof Users;
  accentColor: string;
  iconBg: string;
}

function KpiCard({ item, index }: { item: KpiItem; index: number }) {
  const Icon = item.icon;
  return (
    <motion.div
      variants={cardVariants}
      whileHover={{ y: -3, transition: { duration: 0.2 } }}
      className="flex-1 min-w-[220px]"
    >
      <div
        className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm p-6 cursor-default border border-gray-100 dark:border-zinc-800"
        data-testid={`card-kpi-${index}`}
      >
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-medium tracking-wide uppercase text-gray-400 dark:text-zinc-500 mb-1.5" data-testid={`text-kpi-title-${index}`}>
              {item.title}
            </p>
            <p className={`text-3xl font-bold tracking-tight ${item.accentColor}`} data-testid={`text-kpi-value-${index}`}>
              {item.value}{item.suffix}
            </p>
          </div>
          <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-md ${item.iconBg}`}>
            <Icon className="h-5 w-5 text-white" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function KpiSkeleton() {
  return (
    <div className="flex flex-wrap gap-5">
      {[0, 1, 2].map((i) => (
        <div key={i} className="flex-1 min-w-[220px]">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm p-6 border border-gray-100 dark:border-zinc-800">
            <div className="flex items-center justify-between gap-3">
              <div className="space-y-2.5">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-8 w-16" />
              </div>
              <Skeleton className="h-11 w-11 rounded-md" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function VenueGridSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm p-6 border border-gray-100 dark:border-zinc-800">
          <div className="flex items-center gap-3 mb-5">
            <Skeleton className="h-11 w-11 rounded-xl" />
            <div className="space-y-1.5 flex-1">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
          <Skeleton className="h-2.5 w-full rounded-full mb-5" />
          <div className="space-y-3">
            {[0, 1, 2].map((j) => (
              <div key={j} className="rounded-lg border p-3 border-gray-100 dark:border-zinc-800">
                <Skeleton className="h-3 w-24 mb-2" />
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-20 rounded-full" />
                  <Skeleton className="h-6 w-20 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function PortfolioCard({
  group,
  index,
  gpsRate,
}: {
  group: GroupData;
  index: number;
  gpsRate: number | null;
}) {
  const featureKeys = Object.keys(group).filter(
    (k) => !EXCLUDED_KEYS.has(k) && typeof group[k] === "number"
  );

  const allMappedKeys = Object.keys(FEATURE_MAP);
  const enabledCount = allMappedKeys.filter((k) => featureKeys.includes(k) && Number(group[k]) > 0).length;
  const totalCount = allMappedKeys.length;
  const enabledRate = totalCount > 0 ? Math.round((enabledCount / totalCount) * 100) : 0;

  return (
    <motion.div variants={cardVariants} whileHover={{ y: -4, transition: { duration: 0.2 } }}>
      <div
        className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-800 h-full flex flex-col overflow-hidden"
        data-testid={`card-venue-${index}`}
      >
        <div className="p-6 pb-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-zinc-800 dark:to-zinc-700">
              <Building2 className="h-5 w-5 text-slate-600 dark:text-zinc-300" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-base font-bold truncate text-gray-800 dark:text-zinc-100" data-testid={`text-venue-name-${index}`}>
                {group.name}
              </p>
              <p className="text-xs text-gray-400 dark:text-zinc-500 mt-0.5">
                已啟用 {enabledCount} / {totalCount} 項模組
              </p>
            </div>
          </div>

          <div className="mb-1">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-medium text-gray-500 dark:text-zinc-400">系統啟用率</span>
              <span className="text-xs font-bold text-gray-700 dark:text-zinc-200" data-testid={`text-venue-rate-${index}`}>
                {enabledRate}%
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-gray-100 dark:bg-zinc-800">
              <motion.div
                className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-violet-500"
                initial={{ width: 0 }}
                animate={{ width: `${enabledRate}%` }}
                transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
              />
            </div>
          </div>

          {gpsRate !== null && Number(group["gps"] ?? 0) > 0 && (
            <div className="mt-2">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-medium text-gray-500 dark:text-zinc-400">📍 打卡率</span>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  {Math.round(gpsRate)}%
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-gray-100 dark:bg-zinc-800">
                <motion.div
                  className="h-2 rounded-full bg-emerald-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.round(gpsRate)}%` }}
                  transition={{ duration: 0.8, ease: "easeOut", delay: 0.35 }}
                />
              </div>
            </div>
          )}
        </div>

        <div className="px-6 pb-6 pt-2 space-y-3 flex-1">
          {CATEGORIES.map((cat) => {
            const catFeatureKeys = getCategoryFeatures(cat.key);
            return (
              <div
                key={cat.key}
                className={`rounded-xl border p-3 ${cat.borderColor} ${cat.bgColor}`}
                data-testid={`section-category-${cat.key}-${index}`}
              >
                <p className={`text-xs font-semibold mb-2 ${cat.color}`}>
                  {cat.emoji} {cat.title}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {catFeatureKeys.map((fk) => {
                    const meta = FEATURE_MAP[fk];
                    const enabled = featureKeys.includes(fk) && Number(group[fk]) > 0;
                    return (
                      <motion.span
                        key={fk}
                        whileHover={{ scale: 1.05 }}
                        transition={{ type: "spring", stiffness: 400, damping: 17 }}
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold cursor-default transition-colors ${
                          enabled ? cat.badgeOn : cat.badgeOff
                        } ${!enabled ? "opacity-60" : ""}`}
                        data-testid={`badge-${fk}-${enabled ? "on" : "off"}-${index}`}
                      >
                        {enabled ? "✅" : "❌"} {meta.emoji} {meta.label}
                      </motion.span>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}

function ErrorBlock({ message, onRetry, isRetrying }: { message: string; onRetry: () => void; isRetrying: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center justify-center py-20"
    >
      <div className="rounded-2xl bg-white dark:bg-zinc-900 shadow-sm border border-gray-100 dark:border-zinc-800 p-10 max-w-lg w-full text-center space-y-5">
        <div className="flex justify-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-50 dark:bg-red-950/30">
            <AlertCircle className="h-7 w-7 text-red-500" />
          </div>
        </div>
        <h2 className="text-lg font-semibold text-gray-800 dark:text-zinc-100" data-testid="text-error-title">無法連線至真實伺服器</h2>
        <p className="text-sm text-gray-500 dark:text-zinc-400" data-testid="text-error-message">{message}</p>
        <p className="text-xs text-gray-400 dark:text-zinc-500">請確認後端伺服器已啟動，並檢查網路連線狀態。</p>
        <Button variant="outline" onClick={onRetry} disabled={isRetrying} data-testid="button-retry">
          <RefreshCw className={`h-4 w-4 mr-2 ${isRetrying ? "animate-spin" : ""}`} />
          {isRetrying ? "重新連線中..." : "重新連線"}
        </Button>
      </div>
    </motion.div>
  );
}

export default function Dashboard() {
  const [featureStats, setFeatureStats] = useState<FeatureStatsResponse | null>(null);
  const [tasksStats, setTasksStats] = useState<TasksStatsResponse | null>(null);
  const [attendanceStats, setAttendanceStats] = useState<AttendanceStatsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setFeatureStats(null);
    setTasksStats(null);
    setAttendanceStats(null);

    try {
      const [fs, ts, as] = await Promise.all([
        strictFetch<FeatureStatsResponse>(API.featureStats),
        strictFetch<TasksStatsResponse>(API.tasksStats),
        strictFetch<AttendanceStatsResponse>(API.attendanceStats),
      ]);
      setFeatureStats(fs);
      setTasksStats(ts);
      setAttendanceStats(as);
    } catch (err: any) {
      setError(err.message || "未知錯誤");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const hasData = featureStats && tasksStats && attendanceStats;

  const groups = featureStats?.groups ?? [];
  const penetration = featureStats?.featurePenetration ?? [];

  const gpsPenetration = penetration.find(
    (p) => p.feature === "GPS打卡" || p.feature?.toLowerCase().includes("gps")
  );
  const gpsRate = gpsPenetration ? gpsPenetration.rate : null;

  const kpi: KpiItem[] = hasData
    ? [
        {
          title: "活躍場館",
          value: groups.length,
          suffix: "",
          icon: Users,
          accentColor: "text-blue-600 dark:text-blue-400",
          iconBg: "bg-blue-500",
        },
        {
          title: "任務完成率",
          value: typeof tasksStats!.completionRate === "number"
            ? tasksStats!.completionRate.toFixed(1)
            : String(tasksStats!.completionRate).replace(/%$/, ""),
          suffix: "%",
          icon: CheckCircle2,
          accentColor: "text-emerald-600 dark:text-emerald-400",
          iconBg: "bg-emerald-500",
        },
        {
          title: "今日打卡數",
          value: attendanceStats!.successful,
          suffix: "",
          icon: MapPin,
          accentColor: "text-violet-600 dark:text-violet-400",
          iconBg: "bg-violet-500",
        },
      ]
    : [];

  return (
    <div className="h-full overflow-y-auto bg-gray-50/80 dark:bg-zinc-950">
      <div className="p-6 lg:p-8 max-w-[1440px] mx-auto space-y-7">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex items-center justify-between gap-4 flex-wrap"
        >
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <CircleDot className="h-5 w-5 text-blue-500" />
              <h1 className="text-xl font-bold tracking-tight text-gray-800 dark:text-zinc-100" data-testid="text-page-title">
                場館指揮中心
              </h1>
            </div>
            <p className="text-sm text-gray-400 dark:text-zinc-500">
              即時監控各場館營運狀態與功能啟用情形
            </p>
          </div>
          {hasData && (
            <Button
              variant="outline"
              size="sm"
              onClick={fetchData}
              disabled={isLoading}
              data-testid="button-refresh"
              className="shrink-0"
            >
              <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${isLoading ? "animate-spin" : ""}`} />
              重新整理
            </Button>
          )}
        </motion.div>

        {error && !isLoading && (
          <ErrorBlock message={error} onRetry={fetchData} isRetrying={isLoading} />
        )}

        {isLoading && (
          <>
            <KpiSkeleton />
            <div className="space-y-4">
              <div className="space-y-1">
                <Skeleton className="h-5 w-36" />
                <Skeleton className="h-4 w-56" />
              </div>
              <VenueGridSkeleton />
            </div>
          </>
        )}

        {hasData && (
          <>
            <motion.div className="flex flex-wrap gap-5" variants={containerVariants} initial="hidden" animate="visible">
              {kpi.map((item, i) => (
                <KpiCard key={item.title} item={item} index={i} />
              ))}
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-sm text-gray-400 dark:text-zinc-500 leading-relaxed"
              data-testid="text-dashboard-description"
            >
              本儀表板展示各場館目前已啟用的 LINE 機器人自動化模組。亮色代表已啟用，灰色代表未啟用。
            </motion.p>

            <div>
              <div className="mb-4">
                <h2 className="text-base font-semibold text-gray-700 dark:text-zinc-200">各場館模組總覽</h2>
                <p className="text-sm text-gray-400 dark:text-zinc-500 mt-0.5">
                  {groups.length} 個場館 / 依功能類別分區顯示
                </p>
              </div>
              <motion.div
                className="grid grid-cols-1 lg:grid-cols-2 gap-5"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {groups.map((group, i) => (
                  <PortfolioCard key={group.name} group={group} index={i} gpsRate={gpsRate} />
                ))}
              </motion.div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
