import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Users, CheckCircle2, MapPin, RefreshCw, AlertCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

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

const penetrationColors: Record<string, string> = {
  "任務交辦": "#3b82f6",
  "天氣預報": "#10b981",
  "GPS打卡": "#8b5cf6",
  "客戶調查": "#f59e0b",
  "水質監控": "#06b6d4",
  "風力監測": "#ec4899",
  "氣象觀測": "#10b981",
  "GPS 定位": "#8b5cf6",
};

const featureColors: Record<string, string> = {
  tasks: "#3b82f6",
  weather: "#10b981",
  gps: "#8b5cf6",
  survey: "#f59e0b",
  water: "#06b6d4",
  wind: "#ec4899",
};

const featureLabels: Record<string, string> = {
  tasks: "任務交辦",
  weather: "氣象觀測",
  gps: "GPS 定位",
  survey: "客戶調查",
  water: "水質監控",
  wind: "風力監測",
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] } },
};

async function strictFetch<T>(url: string): Promise<T> {
  const res = await fetch(url, {
    headers: { Accept: "application/json" },
  });
  if (!res.ok) {
    throw new Error(`API ${url} 回傳 HTTP ${res.status}`);
  }
  const ct = res.headers.get("content-type") || "";
  if (!ct.includes("application/json")) {
    throw new Error(`API ${url} 未回傳 JSON (content-type: ${ct})`);
  }
  return res.json();
}

interface KpiItem {
  title: string;
  value: string | number;
  suffix: string;
  icon: typeof Users;
  lightBg: string;
  iconColor: string;
}

function KpiCard({ item, index }: { item: KpiItem; index: number }) {
  const Icon = item.icon;
  return (
    <motion.div
      variants={cardVariants}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="flex-1 min-w-[200px]"
    >
      <Card className="p-5 cursor-default border-card-border hover-elevate" data-testid={`card-kpi-${index}`}>
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm text-muted-foreground mb-1" data-testid={`text-kpi-title-${index}`}>{item.title}</p>
            <p className="text-3xl font-bold tracking-tight" data-testid={`text-kpi-value-${index}`}>
              {item.value}{item.suffix}
            </p>
          </div>
          <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-md ${item.lightBg}`}>
            <Icon className={`h-6 w-6 ${item.iconColor}`} />
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

function KpiSkeleton() {
  return (
    <div className="flex flex-wrap gap-4">
      {[0, 1, 2].map((i) => (
        <div key={i} className="flex-1 min-w-[200px]">
          <Card className="p-5 border-card-border">
            <div className="flex items-center justify-between gap-3">
              <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-9 w-16" />
              </div>
              <Skeleton className="h-12 w-12 rounded-md" />
            </div>
          </Card>
        </div>
      ))}
    </div>
  );
}

function ChartSkeleton({ height = 340 }: { height?: number }) {
  return (
    <Card className="p-6 border-card-border">
      <div className="space-y-2 mb-5">
        <Skeleton className="h-5 w-48" />
        <Skeleton className="h-4 w-64" />
      </div>
      <Skeleton className="w-full" style={{ height }} />
    </Card>
  );
}

function DonutSkeleton() {
  return (
    <div className="flex flex-wrap gap-4">
      {[0, 1, 2].map((i) => (
        <div key={i} className="flex-1 min-w-[200px]">
          <Card className="p-5 border-card-border flex flex-col items-center">
            <Skeleton className="h-4 w-20 mb-3" />
            <Skeleton className="h-[160px] w-[160px] rounded-full" />
            <Skeleton className="h-3 w-28 mt-2" />
          </Card>
        </div>
      ))}
    </div>
  );
}

function CustomBarTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-card p-3 shadow-lg">
      <p className="text-sm font-semibold mb-2">{label}</p>
      {payload.map((entry: any) => (
        <div key={entry.dataKey} className="flex items-center gap-2 text-xs mb-1">
          <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: entry.color }} />
          <span className="text-muted-foreground">{featureLabels[entry.dataKey] || entry.dataKey}:</span>
          <span className="font-medium">{entry.value}</span>
        </div>
      ))}
    </div>
  );
}

function StackedBarChartSection({ data }: { data: GroupData[] }) {
  const allKeys = new Set<string>();
  for (const row of data) {
    for (const k of Object.keys(row)) {
      if (k !== "name" && typeof row[k] === "number") allKeys.add(k);
    }
  }
  const featureKeysInData = Object.keys(featureColors).filter((k) => allKeys.has(k));
  const extraKeys = [...allKeys].filter((k) => !featureColors[k]);
  const orderedKeys = [...featureKeysInData, ...extraKeys];
  const lastKey = orderedKeys[orderedKeys.length - 1];

  const extraColorPalette = ["#64748b", "#a855f7", "#14b8a6", "#e11d48", "#84cc16", "#6366f1"];
  let extraIdx = 0;

  return (
    <motion.div variants={cardVariants}>
      <Card className="p-6 border-card-border" data-testid="card-stacked-bar-chart">
        <div className="mb-5">
          <h2 className="text-lg font-semibold" data-testid="text-bar-chart-title">各群組功能啟用概況</h2>
          <p className="text-sm text-muted-foreground mt-1">依群組分類的功能啟用堆疊分析</p>
        </div>
        <ResponsiveContainer width="100%" height={340}>
          <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
              axisLine={{ stroke: "hsl(var(--border))" }}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
              axisLine={false}
              tickLine={false}
              allowDecimals={false}
            />
            <Tooltip content={<CustomBarTooltip />} cursor={{ fill: "hsl(var(--accent))", opacity: 0.3 }} />
            <Legend
              formatter={(value: string) => (
                <span className="text-xs text-muted-foreground">{featureLabels[value] || value}</span>
              )}
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ paddingTop: 16 }}
            />
            {orderedKeys.map((key) => {
              const color = featureColors[key] || extraColorPalette[extraIdx++ % extraColorPalette.length];
              return (
                <Bar
                  key={key}
                  dataKey={key}
                  stackId="features"
                  fill={color}
                  radius={key === lastKey ? [3, 3, 0, 0] : [0, 0, 0, 0]}
                />
              );
            })}
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </motion.div>
  );
}

function DonutChart({ item, index, totalGroups }: { item: PenetrationData; index: number; totalGroups: number }) {
  const val = Math.min(item.value, 100);
  const remaining = 100 - val;
  const data = [
    { name: item.name, value: val },
    { name: "remaining", value: remaining > 0 ? remaining : 0.01 },
  ];
  const color = item.color || penetrationColors[item.name] || "#94a3b8";
  const enabledCount = Math.round((val / 100) * totalGroups);

  return (
    <motion.div variants={cardVariants} className="flex-1 min-w-[200px]">
      <Card className="p-5 border-card-border flex flex-col items-center" data-testid={`card-donut-${index}`}>
        <p className="text-sm font-medium text-muted-foreground mb-3" data-testid={`text-donut-title-${index}`}>{item.name}</p>
        <div className="relative">
          <ResponsiveContainer width={160} height={160}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={52}
                outerRadius={72}
                startAngle={90}
                endAngle={-270}
                paddingAngle={2}
                dataKey="value"
                stroke="none"
              >
                <Cell fill={color} />
                <Cell fill="hsl(var(--muted))" />
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl font-bold" style={{ color }} data-testid={`text-donut-value-${index}`}>
              {Math.round(val)}%
            </span>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          {val >= 100 ? "全數群組已啟用" : `${enabledCount} / ${totalGroups} 群組已啟用`}
        </p>
      </Card>
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
      <div className="rounded-md border border-destructive/30 bg-destructive/5 p-8 max-w-lg w-full text-center space-y-4">
        <div className="flex justify-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10">
            <AlertCircle className="h-7 w-7 text-destructive" />
          </div>
        </div>
        <h2 className="text-lg font-semibold" data-testid="text-error-title">無法連線至真實伺服器</h2>
        <p className="text-sm text-muted-foreground" data-testid="text-error-message">{message}</p>
        <p className="text-xs text-muted-foreground">請確認後端伺服器已啟動，並檢查網路連線狀態。</p>
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
  const penetration = (featureStats?.featurePenetration ?? []).map((p) => ({
    ...p,
    color: p.color || penetrationColors[p.name] || "#94a3b8",
  }));

  const kpi: KpiItem[] = hasData
    ? [
        {
          title: "活躍群組數",
          value: groups.length,
          suffix: "",
          icon: Users,
          lightBg: "bg-blue-50 dark:bg-blue-950/30",
          iconColor: "text-blue-500",
        },
        {
          title: "任務整體完成率",
          value: typeof tasksStats!.completionRate === "number" ? tasksStats!.completionRate.toFixed(1) : tasksStats!.completionRate,
          suffix: "%",
          icon: CheckCircle2,
          lightBg: "bg-emerald-50 dark:bg-emerald-950/30",
          iconColor: "text-emerald-500",
        },
        {
          title: "今日打卡成功數",
          value: attendanceStats!.successful,
          suffix: "",
          icon: MapPin,
          lightBg: "bg-violet-50 dark:bg-violet-950/30",
          iconColor: "text-violet-500",
        },
      ]
    : [];

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-6 max-w-[1400px] mx-auto space-y-6">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <h1 className="text-2xl font-bold tracking-tight" data-testid="text-page-title">群組功能戰情室</h1>
          <p className="text-sm text-muted-foreground mt-1">即時監控各群組的功能啟用狀態與系統健康度</p>
        </motion.div>

        {error && !isLoading && (
          <ErrorBlock message={error} onRetry={fetchData} isRetrying={isLoading} />
        )}

        {isLoading && (
          <>
            <KpiSkeleton />
            <ChartSkeleton />
            <div className="space-y-4">
              <div className="space-y-1">
                <Skeleton className="h-5 w-36" />
                <Skeleton className="h-4 w-56" />
              </div>
              <DonutSkeleton />
            </div>
          </>
        )}

        {hasData && (
          <>
            <motion.div className="flex flex-wrap gap-4" variants={containerVariants} initial="hidden" animate="visible">
              {kpi.map((item, i) => (
                <KpiCard key={item.title} item={item} index={i} />
              ))}
            </motion.div>

            <motion.div variants={containerVariants} initial="hidden" animate="visible">
              <StackedBarChartSection data={groups} />
            </motion.div>

            <motion.div variants={containerVariants} initial="hidden" animate="visible">
              <div className="mb-4">
                <h2 className="text-lg font-semibold">關鍵功能滲透率</h2>
                <p className="text-sm text-muted-foreground mt-1">核心功能在各群組中的啟用比例</p>
              </div>
              <div className="flex flex-wrap gap-4">
                {penetration.map((item, i) => (
                  <DonutChart key={item.name} item={item} index={i} totalGroups={groups.length} />
                ))}
              </div>
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
}
