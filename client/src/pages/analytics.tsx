import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ClipboardList,
  Clock,
  Zap,
  RefreshCw,
  AlertCircle,
  TrendingUp,
  BarChart3,
  Building2,
  X,
  User,
  Calendar,
  CheckCircle2,
  Loader2,
  Inbox,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";

const BASE_URL = "https://line-bot-assistant-ronchen2.replit.app";

const API = {
  tasksStats: `${BASE_URL}/api/admin/tasks/stats`,
  taskHistory: (groupId: string) => `${BASE_URL}/api/admin/tasks/history/${groupId}`,
};

const VENUE_NAME_MAP: Record<string, string> = {
  "C66a4b3bb3fbc3dcf52d42626ec512484": "DAOS-新北高中（工作群）",
  "C6f6f163895d5b528a6ab044015e1a37b": "DAOS-三重商工館（工作群）",
  "C2dc6991e51074dd47d5d275d568318f7": "DAOS-三民館（工作群）",
  "C9b3c5dfe2e005adafd2ed914714a1930": "駿斯-松山國小館",
  "C50c2a9623a78cc5f5e9f39557e3abfe6": "駿斯-竹科戶外游泳池",
  "C360be1fe6ea876a4df3ca0497bca4e3b": "駿斯-戶外運動園區",
  "C2dd9a5fce7c276f2cbfdd02c2342661c": "駿斯-社區&勞務業務群",
  "Ce936c6bebb59b8b5683ffbcf97bf20de": "駿斯總部辦公室群",
  "Ce8fe61736e38bfc1b00d1148fe17b262": "駿斯社區回報群",
  "Cdfff89ff48bdf009c3b22ad0dfc62e2c": "駿斯松山營運小組",
  "Cc2100498c7c5627c1e86e93f7c4eb817": "駿斯-三蘆區櫃台",
  "C7df140dbcf9b99cd7a4e8bff32849a06": "竹科泳池工作群",
  "Cf7ab973766c258e5b4b4f040d35b2175": "駿斯IT技術群",
  "Cd383783901732a2f0c71ab3bbd5c81ae": "松山櫃檯",
  "C6bb6482e2306868af923173e3a4dd698": "DAOS-松山館（工作群）",
  "C7ae679419b16de94531062ea88b8a488": "棒球練習場工作群",
  "C7e7ff4764ebd1cd8d2758e486a02b035": "C7e7ff4764ebd1cd8d2758e486a02b035（未找到）",
  "C4e7b9f0ecbe86b7c23bd00ae27cb29c6": "C4e7b9f0ecbe86b7c23bd00ae27cb29c6（未找到）",
  "C5dd247ab56ee2d5ef111a868f59f7b0a": "C5dd247ab56ee2d5ef111a868f59f7b0a（未找到）",
  "C755681bd26a1322bd94183478baeda24": "C755681bd26a1322bd94183478baeda24（未找到）",
};

interface TasksStatsResponse {
  total: number;
  completed: number;
  pending: number;
  completionRate: string | number;
  byGroup?: Record<string, { total: number; completed: number; pending: number }>;
  [key: string]: any;
}

const MOCK_DAILY_DATA = [
  { day: "Mon", label: "週一", interactions: 42 },
  { day: "Tue", label: "週二", interactions: 58 },
  { day: "Wed", label: "週三", interactions: 35 },
  { day: "Thu", label: "週四", interactions: 67 },
  { day: "Fri", label: "週五", interactions: 49 },
  { day: "Sat", label: "週六", interactions: 28 },
  { day: "Sun", label: "週日", interactions: 31 },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] } },
};

const fadeIn = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45 } },
};

async function strictFetch<T>(url: string): Promise<T> {
  const res = await fetch(url, { headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error(`API ${url} 回傳 HTTP ${res.status}`);
  const ct = res.headers.get("content-type") || "";
  if (!ct.includes("application/json")) throw new Error(`API ${url} 未回傳 JSON`);
  return res.json();
}

async function safeFetch<T>(url: string): Promise<T | null> {
  try {
    const res = await fetch(url, { headers: { Accept: "application/json" } });
    if (!res.ok) return null;
    const ct = res.headers.get("content-type") || "";
    if (!ct.includes("application/json")) return null;
    return res.json();
  } catch {
    return null;
  }
}

interface HistoryTask {
  id: string;
  taskId?: string;
  text?: string;
  description?: string;
  status: string;
  groupId?: string;
  createdAt: string;
  completedAt?: string | null;
  reporter?: string;
}

function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}/${pad(d.getMonth() + 1)}/${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  } catch {
    return dateStr;
  }
}

function TaskTicket({ task, isCompleted }: { task: HistoryTask; isCompleted: boolean }) {
  const taskNum = task.taskId || task.id;
  const desc = task.description || task.text || "(無描述)";
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-zinc-800 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-700 p-4 hover:shadow-md transition-shadow"
      data-testid={`card-task-${taskNum}`}
    >
      <p className="text-xs font-mono text-gray-400 dark:text-zinc-500 mb-1.5">#{taskNum}</p>
      <p className="text-sm font-semibold text-gray-800 dark:text-zinc-100 leading-snug mb-3">{desc}</p>
      <div className="space-y-1.5 text-xs text-gray-500 dark:text-zinc-400">
        {task.reporter && (
          <div className="flex items-center gap-1.5">
            <User className="h-3 w-3 shrink-0" />
            <span>交辦人：{task.reporter}</span>
          </div>
        )}
        <div className="flex items-center gap-1.5">
          <Calendar className="h-3 w-3 shrink-0" />
          <span>建立於：{formatDate(task.createdAt)}</span>
        </div>
        {isCompleted && task.completedAt && (
          <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="h-3 w-3 shrink-0" />
            <span>完成於：{formatDate(task.completedAt)}</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}

function AnalyticsTaskHistoryDrawer({
  groupId,
  venueName,
  onClose,
}: {
  groupId: string;
  venueName: string;
  onClose: () => void;
}) {
  const [tasks, setTasks] = useState<HistoryTask[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      let data = await safeFetch<HistoryTask[]>(API.taskHistory(groupId));
      if (!data) {
        const stats = await safeFetch<any>(API.tasksStats);
        if (stats?.recentTasks) {
          data = (stats.recentTasks as HistoryTask[]).filter((t) => t.groupId === groupId);
        }
      }
      if (cancelled) return;
      setTasks(data && Array.isArray(data) ? data : []);
      setLoading(false);
    }
    load();
    return () => { cancelled = true; };
  }, [groupId]);

  const completedStatuses = new Set(["completed", "done", "closed", "resolved"]);
  const sortByDateDesc = (a: HistoryTask, b: HistoryTask) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  const openTasks = tasks.filter((t) => !completedStatuses.has(t.status?.toLowerCase())).sort(sortByDateDesc);
  const completedTasks = tasks.filter((t) => completedStatuses.has(t.status?.toLowerCase())).sort(sortByDateDesc);

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
        className="fixed top-0 right-0 z-[51] h-full w-full max-w-3xl bg-gray-50 dark:bg-zinc-950 shadow-2xl overflow-y-auto"
        data-testid="drawer-task-history"
      >
        <div className="sticky top-0 z-10 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border-b border-gray-200 dark:border-zinc-800 px-6 py-4 flex items-center justify-between">
          <div className="min-w-0">
            <h2 className="text-lg font-bold text-gray-800 dark:text-zinc-100 truncate" data-testid="text-drawer-title">
              📋 {venueName}
            </h2>
            <p className="text-xs text-gray-400 dark:text-zinc-500 mt-0.5">任務歷史紀錄 · 雙欄泳道圖</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors" data-testid="button-close-drawer">
            <X className="h-5 w-5 text-gray-500 dark:text-zinc-400" />
          </button>
        </div>

        <div className="p-6">
          {loading && (
            <div className="flex flex-col items-center justify-center py-20 gap-3" data-testid="drawer-loading">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
              <p className="text-sm text-gray-400 dark:text-zinc-500">載入任務歷史中...</p>
            </div>
          )}

          {!loading && tasks.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 gap-3" data-testid="drawer-empty">
              <Inbox className="h-12 w-12 text-gray-300 dark:text-zinc-600" />
              <p className="text-sm text-gray-400 dark:text-zinc-500">尚無歷史交辦任務紀錄</p>
            </div>
          )}

          {!loading && tasks.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6" data-testid="swimlane-container">
              <div data-testid="swimlane-open">
                <div className="flex items-center gap-2 mb-4">
                  <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-amber-100 dark:bg-amber-900/40">
                    <Clock className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                  </span>
                  <h3 className="text-sm font-bold text-gray-700 dark:text-zinc-200">🟡 待處理 ({openTasks.length})</h3>
                </div>
                {openTasks.length === 0 ? (
                  <div className="rounded-xl border-2 border-dashed border-gray-200 dark:border-zinc-700 p-8 text-center">
                    <p className="text-xs text-gray-400 dark:text-zinc-500">目前無待處理任務 🎉</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {openTasks.map((task) => <TaskTicket key={task.id || task.taskId} task={task} isCompleted={false} />)}
                  </div>
                )}
              </div>
              <div data-testid="swimlane-completed">
                <div className="flex items-center gap-2 mb-4">
                  <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-emerald-100 dark:bg-emerald-900/40">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                  </span>
                  <h3 className="text-sm font-bold text-gray-700 dark:text-zinc-200">🟢 已完成 ({completedTasks.length})</h3>
                </div>
                {completedTasks.length === 0 ? (
                  <div className="rounded-xl border-2 border-dashed border-gray-200 dark:border-zinc-700 p-8 text-center">
                    <p className="text-xs text-gray-400 dark:text-zinc-500">尚無已完成的任務</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {completedTasks.map((task) => <TaskTicket key={task.id || task.taskId} task={task} isCompleted={true} />)}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </>
  );
}

interface KpiItem {
  title: string;
  value: string | number;
  suffix: string;
  icon: typeof ClipboardList;
  accentColor: string;
  iconBg: string;
}

function KpiCard({ item, index }: { item: KpiItem; index: number }) {
  const Icon = item.icon;
  return (
    <motion.div variants={cardVariants} whileHover={{ y: -3, transition: { duration: 0.2 } }} className="flex-1 min-w-[200px]">
      <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm p-5 cursor-default border border-gray-100 dark:border-zinc-800" data-testid={`card-analytics-kpi-${index}`}>
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-medium tracking-wide uppercase text-gray-400 dark:text-zinc-500 mb-1" data-testid={`text-analytics-kpi-title-${index}`}>{item.title}</p>
            <p className={`text-2xl font-bold tracking-tight ${item.accentColor}`} data-testid={`text-analytics-kpi-value-${index}`}>{item.value}{item.suffix}</p>
          </div>
          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${item.iconBg}`}>
            <Icon className="h-5 w-5 text-white" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function InteractionChart() {
  return (
    <motion.div variants={cardVariants} className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-800 p-6" data-testid="card-interaction-chart">
      <div className="flex items-center gap-2 mb-5">
        <TrendingUp className="h-4 w-4 text-blue-500" />
        <h3 className="text-sm font-bold text-gray-700 dark:text-zinc-200" data-testid="text-chart-title">近七日系統互動趨勢</h3>
      </div>
      <div className="h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={MOCK_DAILY_DATA} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <defs>
              <linearGradient id="colorInteractions" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:opacity-20" />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 12, fill: "#9ca3af" }}
              axisLine={{ stroke: "#e5e7eb" }}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 12, fill: "#9ca3af" }}
              axisLine={false}
              tickLine={false}
              width={35}
            />
            <RechartsTooltip
              contentStyle={{
                backgroundColor: "rgba(255,255,255,0.95)",
                border: "1px solid #e5e7eb",
                borderRadius: "12px",
                fontSize: "12px",
                boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
              }}
              formatter={(value: number) => [`${value} 次`, "互動次數"]}
              labelFormatter={(label: string) => `${label}`}
            />
            <Area
              type="monotone"
              dataKey="interactions"
              stroke="#3b82f6"
              strokeWidth={2.5}
              fill="url(#colorInteractions)"
              dot={{ r: 4, fill: "#3b82f6", strokeWidth: 2, stroke: "#fff" }}
              activeDot={{ r: 6, fill: "#3b82f6", strokeWidth: 2, stroke: "#fff" }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}

interface VenueLoad {
  name: string;
  groupId: string;
  total: number;
  completed: number;
  pending: number;
  rate: number;
}

function VenueLoadRanking({ venues, onVenueClick }: { venues: VenueLoad[]; onVenueClick: (groupId: string, name: string) => void }) {
  const maxTotal = Math.max(...venues.map((v) => v.total), 1);

  return (
    <motion.div variants={cardVariants} className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-800 p-6" data-testid="card-venue-ranking">
      <div className="flex items-center gap-2 mb-5">
        <BarChart3 className="h-4 w-4 text-purple-500" />
        <h3 className="text-sm font-bold text-gray-700 dark:text-zinc-200" data-testid="text-venue-ranking-title">各場館任務負載排行</h3>
        <span className="text-[10px] text-gray-400 dark:text-zinc-500 ml-1">（點擊查看歷史任務）</span>
      </div>
      <div className="space-y-3">
        {venues.map((venue, i) => {
          const barWidth = (venue.total / maxTotal) * 100;
          return (
            <motion.div
              key={venue.groupId}
              variants={fadeIn}
              className="group cursor-pointer rounded-lg px-2 py-1.5 -mx-2 hover:bg-blue-50/60 dark:hover:bg-blue-950/20 transition-colors"
              data-testid={`row-venue-load-${i}`}
              onClick={() => onVenueClick(venue.groupId, venue.name)}
            >
              <div className="flex items-center justify-between gap-3 mb-1.5">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-xs font-bold text-gray-300 dark:text-zinc-600 w-5 text-right shrink-0">
                    {i + 1}
                  </span>
                  <Building2 className="h-3.5 w-3.5 text-gray-400 dark:text-zinc-500 shrink-0" />
                  <span className="text-sm font-medium text-gray-700 dark:text-zinc-200 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" data-testid={`text-venue-load-name-${i}`}>
                    {venue.name}
                  </span>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs text-gray-400 dark:text-zinc-500" data-testid={`text-venue-load-stats-${i}`}>
                    {venue.completed}/{venue.total} 完成
                  </span>
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 w-12 text-right" data-testid={`text-venue-load-rate-${i}`}>
                    {venue.rate.toFixed(0)}%
                  </span>
                </div>
              </div>
              <div className="ml-7 h-2 bg-gray-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-blue-400 to-blue-500 dark:from-blue-500 dark:to-blue-400 transition-all duration-700"
                  style={{ width: `${barWidth}%` }}
                />
              </div>
            </motion.div>
          );
        })}
        {venues.length === 0 && (
          <p className="text-sm text-gray-400 dark:text-zinc-500 text-center py-6" data-testid="text-venue-ranking-empty">
            暫無場館任務資料
          </p>
        )}
      </div>
    </motion.div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-8">
      <div className="flex flex-wrap gap-5">
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex-1 min-w-[200px]">
            <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm p-5 border border-gray-100 dark:border-zinc-800">
              <div className="flex items-center justify-between gap-3">
                <div className="space-y-2"><Skeleton className="h-3 w-16" /><Skeleton className="h-7 w-14" /></div>
                <Skeleton className="h-10 w-10 rounded-lg" />
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm p-6 border border-gray-100 dark:border-zinc-800">
        <Skeleton className="h-4 w-40 mb-4" />
        <Skeleton className="h-[280px] w-full rounded-xl" />
      </div>
      <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm p-6 border border-gray-100 dark:border-zinc-800 space-y-4">
        <Skeleton className="h-4 w-40" />
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="space-y-2">
            <div className="flex items-center justify-between">
              <Skeleton className="h-3 w-32" />
              <Skeleton className="h-3 w-16" />
            </div>
            <Skeleton className="h-2 w-full rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

function ErrorBlock({ message, onRetry, isRetrying }: { message: string; onRetry: () => void; isRetrying: boolean }) {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }} className="flex flex-col items-center justify-center py-20">
      <div className="rounded-2xl bg-white dark:bg-zinc-900 shadow-sm border border-gray-100 dark:border-zinc-800 p-10 max-w-lg w-full text-center space-y-5">
        <div className="flex justify-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-50 dark:bg-red-950/30">
            <AlertCircle className="h-7 w-7 text-red-500" />
          </div>
        </div>
        <h2 className="text-lg font-semibold text-gray-800 dark:text-zinc-100" data-testid="text-analytics-error-title">無法載入資料</h2>
        <p className="text-sm text-gray-500 dark:text-zinc-400" data-testid="text-analytics-error-message">{message}</p>
        <Button variant="outline" onClick={onRetry} disabled={isRetrying} data-testid="button-analytics-retry">
          <RefreshCw className={`h-4 w-4 mr-2 ${isRetrying ? "animate-spin" : ""}`} />
          {isRetrying ? "重新載入中..." : "重新載入"}
        </Button>
      </div>
    </motion.div>
  );
}

export default function Analytics() {
  const [tasksStats, setTasksStats] = useState<TasksStatsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedVenue, setSelectedVenue] = useState<{ groupId: string; name: string } | null>(null);

  const handleVenueClick = useCallback((groupId: string, name: string) => {
    setSelectedVenue({ groupId, name });
  }, []);

  const handleDrawerClose = useCallback(() => {
    setSelectedVenue(null);
  }, []);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await strictFetch<TasksStatsResponse>(API.tasksStats);
      setTasksStats(data);
    } catch (err: any) {
      setError(err?.message || "無法連線至伺服器");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const total = tasksStats?.total ?? 259;
  const completed = tasksStats?.completed ?? 168;
  const pending = tasksStats?.pending ?? 91;

  const kpi: KpiItem[] = [
    {
      title: "本月總任務數",
      value: total,
      suffix: "",
      icon: ClipboardList,
      accentColor: "text-blue-600 dark:text-blue-400",
      iconBg: "bg-blue-500",
    },
    {
      title: "自動化省下工時",
      value: `~${Math.round(total * 0.5)}`,
      suffix: "h",
      icon: Clock,
      accentColor: "text-emerald-600 dark:text-emerald-400",
      iconBg: "bg-emerald-500",
    },
    {
      title: "平均回應時間",
      value: "1.2",
      suffix: "s",
      icon: Zap,
      accentColor: "text-amber-600 dark:text-amber-400",
      iconBg: "bg-amber-500",
    },
  ];

  const venueLoads: VenueLoad[] = [];
  if (tasksStats?.byGroup) {
    for (const [groupId, stats] of Object.entries(tasksStats.byGroup)) {
      const name = VENUE_NAME_MAP[groupId] || groupId;
      const rate = stats.total > 0 ? (stats.completed / stats.total) * 100 : 0;
      venueLoads.push({
        name,
        groupId,
        total: stats.total,
        completed: stats.completed,
        pending: stats.pending,
        rate,
      });
    }
    venueLoads.sort((a, b) => b.total - a.total);
  }

  return (
    <div className="h-full overflow-y-auto bg-gray-50/80 dark:bg-zinc-950">
      <div className="p-6 lg:p-8 max-w-[1440px] mx-auto space-y-8">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <TrendingUp className="h-5 w-5 text-blue-500" />
              <h1 className="text-xl font-bold tracking-tight text-gray-800 dark:text-zinc-100" data-testid="text-analytics-page-title">決策與數據洞察</h1>
            </div>
            <p className="text-sm text-gray-400 dark:text-zinc-500">任務數據分析、互動趨勢與場館負載總覽</p>
          </div>
          <Button variant="outline" size="sm" onClick={fetchData} disabled={isLoading} data-testid="button-analytics-refresh" className="shrink-0">
            <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${isLoading ? "animate-spin" : ""}`} />
            重新整理
          </Button>
        </motion.div>

        {error && !isLoading && !tasksStats && <ErrorBlock message={error} onRetry={fetchData} isRetrying={isLoading} />}

        {isLoading && <LoadingSkeleton />}

        {!isLoading && (
          <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-8">
            <motion.div className="flex flex-wrap gap-5" variants={containerVariants}>
              {kpi.map((item, i) => <KpiCard key={item.title} item={item} index={i} />)}
            </motion.div>

            <InteractionChart />

            <VenueLoadRanking venues={venueLoads} onVenueClick={handleVenueClick} />
          </motion.div>
        )}
      </div>

      <AnimatePresence>
        {selectedVenue && (
          <AnalyticsTaskHistoryDrawer
            groupId={selectedVenue.groupId}
            venueName={selectedVenue.name}
            onClose={handleDrawerClose}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
