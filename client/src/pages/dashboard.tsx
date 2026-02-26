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
import { Badge } from "@/components/ui/badge";

const API = {
  featureStats: "https://line-bot-assistant-ronchen2.replit.app/api/admin/dashboard/feature-stats",
  tasksStats: "https://line-bot-assistant-ronchen2.replit.app/api/admin/tasks/stats",
  attendanceStats: "https://line-bot-assistant-ronchen2.replit.app/api/admin/attendance/stats",
};

interface GroupData {
  name: string;
  [key: string]: string | number;
}

interface PenetrationData {
  name: string;
  value: number;
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

const featureLabels: Record<string, string> = {
  tasks: "任務交辦",
  weather: "天氣預報",
  gps: "GPS打卡",
  survey: "客戶調查",
  water: "水質監控",
  wind: "風力監測",
};

const featureBadgeColors: Record<string, { on: string; text: string }> = {
  tasks: { on: "bg-blue-100 dark:bg-blue-900/40", text: "text-blue-700 dark:text-blue-300" },
  weather: { on: "bg-emerald-100 dark:bg-emerald-900/40", text: "text-emerald-700 dark:text-emerald-300" },
  gps: { on: "bg-violet-100 dark:bg-violet-900/40", text: "text-violet-700 dark:text-violet-300" },
  survey: { on: "bg-amber-100 dark:bg-amber-900/40", text: "text-amber-700 dark:text-amber-300" },
  water: { on: "bg-cyan-100 dark:bg-cyan-900/40", text: "text-cyan-700 dark:text-cyan-300" },
  wind: { on: "bg-pink-100 dark:bg-pink-900/40", text: "text-pink-700 dark:text-pink-300" },
};

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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm p-5 border border-gray-100 dark:border-zinc-800">
          <div className="flex items-center gap-3 mb-4">
            <Skeleton className="h-10 w-10 rounded-md" />
            <div className="space-y-1.5 flex-1">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-16" />
            </div>
            <Skeleton className="h-3 w-3 rounded-full" />
          </div>
          <div className="flex flex-wrap gap-2">
            {[0, 1, 2, 3].map((j) => (
              <Skeleton key={j} className="h-6 w-16 rounded-full" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function StatusLight({ enabled }: { enabled: boolean }) {
  return (
    <div className="relative flex items-center justify-center" data-testid={`status-light-${enabled ? "on" : "off"}`}>
      {enabled && (
        <span className="absolute inline-flex h-3 w-3 rounded-full bg-emerald-400 opacity-40 animate-ping" />
      )}
      <span
        className={`relative inline-flex h-2.5 w-2.5 rounded-full ${
          enabled ? "bg-emerald-500" : "bg-amber-400"
        }`}
      />
    </div>
  );
}

function FeatureBadge({ featureKey, enabled }: { featureKey: string; enabled: boolean }) {
  const label = featureLabels[featureKey] || featureKey;
  const colors = featureBadgeColors[featureKey];

  if (!enabled) {
    return (
      <span
        className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-gray-100 text-gray-400 dark:bg-zinc-800 dark:text-zinc-500 line-through decoration-gray-300 dark:decoration-zinc-600"
        data-testid={`badge-${featureKey}-off`}
      >
        {label}
      </span>
    );
  }

  return (
    <motion.span
      whileHover={{ scale: 1.05 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold cursor-default ${colors?.on || "bg-blue-100"} ${colors?.text || "text-blue-700"}`}
      data-testid={`badge-${featureKey}-on`}
    >
      {label}
    </motion.span>
  );
}

function VenueCard({
  group,
  index,
  gpsRate,
}: {
  group: GroupData;
  index: number;
  gpsRate: number | null;
}) {
  const featureKeys = Object.keys(group).filter((k) => k !== "name" && typeof group[k] === "number");
  const enabledCount = featureKeys.filter((k) => Number(group[k]) > 0).length;
  const totalCount = featureKeys.length;
  const gpsEnabled = Number(group["gps"] ?? 0) > 0;

  return (
    <motion.div variants={cardVariants} whileHover={{ y: -3, transition: { duration: 0.2 } }}>
      <div
        className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm p-5 border border-gray-100 dark:border-zinc-800 h-full flex flex-col"
        data-testid={`card-venue-${index}`}
      >
        <div className="flex items-start gap-3 mb-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-slate-100 dark:bg-zinc-800">
            <Building2 className="h-5 w-5 text-slate-500 dark:text-zinc-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate text-gray-800 dark:text-zinc-100" data-testid={`text-venue-name-${index}`}>
              {group.name}
            </p>
            <p className="text-xs text-gray-400 dark:text-zinc-500 mt-0.5">
              {enabledCount}/{totalCount} 功能啟用
            </p>
          </div>
          <StatusLight enabled={gpsEnabled} />
        </div>

        {gpsRate !== null && (
          <div className="mb-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-gray-400 dark:text-zinc-500">打卡率</span>
              <span className={`text-xs font-semibold ${gpsEnabled ? "text-emerald-600 dark:text-emerald-400" : "text-amber-500"}`}>
                {gpsEnabled ? `${Math.round(gpsRate)}%` : "未啟用"}
              </span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-gray-100 dark:bg-zinc-800">
              <motion.div
                className={`h-1.5 rounded-full ${gpsEnabled ? "bg-emerald-500" : "bg-amber-400"}`}
                initial={{ width: 0 }}
                animate={{ width: gpsEnabled ? `${Math.round(gpsRate)}%` : "0%" }}
                transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
              />
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-1.5 mt-auto">
          {featureKeys.map((key) => (
            <FeatureBadge key={key} featureKey={key} enabled={Number(group[key]) > 0} />
          ))}
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
    (p) => p.name === "GPS打卡" || p.name === "GPS 定位" || p.name.toLowerCase().includes("gps")
  );
  const gpsRate = gpsPenetration ? gpsPenetration.value : null;

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
          value: typeof tasksStats!.completionRate === "number" ? tasksStats!.completionRate.toFixed(1) : tasksStats!.completionRate,
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

            <div>
              <div className="mb-4">
                <h2 className="text-base font-semibold text-gray-700 dark:text-zinc-200">各場館營運狀態</h2>
                <p className="text-sm text-gray-400 dark:text-zinc-500 mt-0.5">
                  {groups.length} 個場館 / 功能開關與打卡狀態一覽
                </p>
              </div>
              <motion.div
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {groups.map((group, i) => (
                  <VenueCard key={group.name} group={group} index={i} gpsRate={gpsRate} />
                ))}
              </motion.div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
