import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Users,
  CheckCircle2,
  MapPin,
  RefreshCw,
  AlertCircle,
  CircleDot,
  Globe,
  Lock,
  Building2,
  Layers,
  ArrowRight,
  ShieldCheck,
  Info,
  ClipboardList,
  Navigation,
  Dumbbell,
  BarChart3,
  Search,
  MessageCircle,
  FileCheck,
  Cloud,
  Droplets,
  Bot,
  Wind,
  Timer,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
    <motion.div variants={cardVariants} whileHover={{ y: -3, transition: { duration: 0.2 } }} className="flex-1 min-w-[200px]">
      <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm p-5 cursor-default border border-gray-100 dark:border-zinc-800" data-testid={`card-kpi-${index}`}>
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-medium tracking-wide uppercase text-gray-400 dark:text-zinc-500 mb-1" data-testid={`text-kpi-title-${index}`}>{item.title}</p>
            <p className={`text-2xl font-bold tracking-tight ${item.accentColor}`} data-testid={`text-kpi-value-${index}`}>{item.value}{item.suffix}</p>
          </div>
          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${item.iconBg}`}>
            <Icon className="h-5 w-5 text-white" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function SectionHeader({ emoji, title, subtitle, color }: { emoji: string; title: string; subtitle: string; color: string }) {
  return (
    <motion.div variants={fadeIn} className="mb-5">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-lg">{emoji}</span>
        <h2 className={`text-base font-bold ${color}`} data-testid={`text-section-${title}`}>{title}</h2>
      </div>
      <p className="text-sm text-gray-400 dark:text-zinc-500 ml-7">{subtitle}</p>
    </motion.div>
  );
}

interface GlobalFeatureCardProps {
  emoji: string;
  title: string;
  description: string;
  icon: typeof Users;
  gradient: string;
  iconColor: string;
  stats?: string;
}

function GlobalFeatureCard({ emoji, title, description, icon: Icon, gradient, iconColor, stats }: GlobalFeatureCardProps) {
  return (
    <motion.div variants={cardVariants} whileHover={{ y: -4, transition: { duration: 0.2 } }} className="flex-1 min-w-[200px]">
      <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-800 p-5 h-full flex flex-col" data-testid={`card-global-${title}`}>
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl mb-4 ${gradient}`}>
          <Icon className={`h-5 w-5 ${iconColor}`} />
        </div>
        <p className="text-sm font-bold text-gray-800 dark:text-zinc-100 mb-1">
          {emoji} {title}
        </p>
        <p className="text-xs text-gray-400 dark:text-zinc-500 leading-relaxed flex-1">{description}</p>
        {stats && (
          <div className="mt-3 pt-3 border-t border-gray-100 dark:border-zinc-800">
            <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">{stats}</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}

function PrivateSection() {
  return (
    <motion.div variants={fadeIn} className="grid grid-cols-1 md:grid-cols-2 gap-5">
      <div className="bg-blue-50/70 dark:bg-blue-950/20 rounded-2xl border border-blue-100 dark:border-blue-900/40 p-6" data-testid="card-private-general">
        <div className="flex items-center gap-2 mb-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/50">
            <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </div>
          <p className="text-sm font-bold text-blue-700 dark:text-blue-300">一般使用者</p>
        </div>
        <div className="space-y-3">
          <div className="flex items-start gap-3 bg-white/80 dark:bg-zinc-900/60 rounded-xl p-3.5 border border-blue-100/60 dark:border-blue-900/30">
            <Search className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-gray-800 dark:text-zinc-100">🔍 員工編號 / LINE ID 綁定查詢</p>
              <p className="text-xs text-gray-400 dark:text-zinc-500 mt-0.5">透過私訊查詢員工資料與帳號綁定狀態</p>
            </div>
          </div>
          <div className="flex items-start gap-3 bg-white/80 dark:bg-zinc-900/60 rounded-xl p-3.5 border border-blue-100/60 dark:border-blue-900/30">
            <MessageCircle className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-gray-800 dark:text-zinc-100">💬 呼叫小編</p>
              <p className="text-xs text-gray-400 dark:text-zinc-500 mt-0.5">一對一私訊呼叫客服小編協助</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-amber-50/70 dark:bg-amber-950/20 rounded-2xl border border-amber-100 dark:border-amber-900/40 p-6" data-testid="card-private-admin">
        <div className="flex items-center gap-2 mb-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/50">
            <ShieldCheck className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          </div>
          <p className="text-sm font-bold text-amber-700 dark:text-amber-300">管理層專屬</p>
        </div>
        <div className="space-y-3">
          <div className="flex items-start gap-3 bg-white/80 dark:bg-zinc-900/60 rounded-xl p-3.5 border border-amber-100/60 dark:border-amber-900/30">
            <FileCheck className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
            <div>
              <div className="flex items-center gap-1.5">
                <p className="text-sm font-semibold text-gray-800 dark:text-zinc-100">📝 面試與救生員檢核</p>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-3.5 w-3.5 text-amber-400 cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-[220px] text-center">
                    <p className="text-xs">僅限特定 7 位管理員可用</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <p className="text-xs text-gray-400 dark:text-zinc-500 mt-0.5">介接體育署 API + Ragic 名單，進行資格驗證</p>
            </div>
          </div>
          <div className="mt-2 px-3">
            <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold bg-amber-100/80 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300">
              <Lock className="h-3 w-3" /> 權限受限
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

interface VenueFeatureSpec {
  key: string;
  emoji: string;
  label: string;
  trigger: string;
  icon: typeof Users;
  color: string;
  enabledColor: string;
  disabledColor: string;
}

const FEATURE_SPEC_MAP: Record<string, Omit<VenueFeatureSpec, "key">> = {
  tasks:   { emoji: "📋", label: "任務提醒",     trigger: "手動交辦 / 排程推播",  icon: ClipboardList, color: "text-blue-600 dark:text-blue-400",   enabledColor: "bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-800/50",   disabledColor: "bg-gray-50/50 border-gray-200/60 dark:bg-zinc-800/30 dark:border-zinc-700/40 opacity-50" },
  weather: { emoji: "🌤️", label: "天氣預報",     trigger: "06:30 等回覆觸發",     icon: Cloud,         color: "text-sky-600 dark:text-sky-400",     enabledColor: "bg-sky-50 border-sky-200 dark:bg-sky-950/30 dark:border-sky-800/50",       disabledColor: "bg-gray-50/50 border-gray-200/60 dark:bg-zinc-800/30 dark:border-zinc-700/40 opacity-50" },
  water:   { emoji: "💧", label: "水質監控",     trigger: "自動辨識 / 21:00 GPT", icon: Droplets,      color: "text-cyan-600 dark:text-cyan-400",   enabledColor: "bg-cyan-50 border-cyan-200 dark:bg-cyan-950/30 dark:border-cyan-800/50",   disabledColor: "bg-gray-50/50 border-gray-200/60 dark:bg-zinc-800/30 dark:border-zinc-700/40 opacity-50" },
  wind:    { emoji: "🌬️", label: "風力預報",     trigger: "06:00 等回覆觸發",     icon: Wind,          color: "text-teal-600 dark:text-teal-400",   enabledColor: "bg-teal-50 border-teal-200 dark:bg-teal-950/30 dark:border-teal-800/50",   disabledColor: "bg-gray-50/50 border-gray-200/60 dark:bg-zinc-800/30 dark:border-zinc-700/40 opacity-50" },
  gps:     { emoji: "📍", label: "GPS 打卡",     trigger: "即時觸發",             icon: Navigation,    color: "text-violet-600 dark:text-violet-400", enabledColor: "bg-violet-50 border-violet-200 dark:bg-violet-950/30 dark:border-violet-800/50", disabledColor: "bg-gray-50/50 border-gray-200/60 dark:bg-zinc-800/30 dark:border-zinc-700/40 opacity-50" },
  coach:   { emoji: "🏋️", label: "教練簽到",     trigger: "LIFF 即時觸發",        icon: Dumbbell,      color: "text-emerald-600 dark:text-emerald-400", enabledColor: "bg-emerald-50 border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-800/50", disabledColor: "bg-gray-50/50 border-gray-200/60 dark:bg-zinc-800/30 dark:border-zinc-700/40 opacity-50" },
  survey:  { emoji: "📊", label: "客戶調查",     trigger: "LIFF 問卷",            icon: BarChart3,     color: "text-amber-600 dark:text-amber-400", enabledColor: "bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-800/50", disabledColor: "bg-gray-50/50 border-gray-200/60 dark:bg-zinc-800/30 dark:border-zinc-700/40 opacity-50" },
};

function VenueSwimlane({ groups }: { groups: GroupData[] }) {
  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-3">
      {groups.map((group, i) => {
        const featureKeys = Object.keys(group).filter((k) => !EXCLUDED_KEYS.has(k) && typeof group[k] === "number");
        const enabledKeys = featureKeys.filter((k) => Number(group[k]) > 0);
        const enabledCount = enabledKeys.length;

        const allSpecKeys = Object.keys(FEATURE_SPEC_MAP);
        const relevantKeys = allSpecKeys.filter((k) => featureKeys.includes(k));
        const displayKeys = relevantKeys.length > 0 ? relevantKeys : ["tasks"];

        return (
          <motion.div
            key={group.name}
            variants={cardVariants}
            className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-800 overflow-hidden"
            data-testid={`row-venue-${i}`}
          >
            <div className="flex flex-col md:flex-row">
              <div className="md:w-56 shrink-0 p-5 flex flex-col justify-center border-b md:border-b-0 md:border-r border-gray-100 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-800/30">
                <div className="flex items-center gap-2.5">
                  <Building2 className="h-5 w-5 text-slate-500 dark:text-zinc-400 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-gray-800 dark:text-zinc-100 truncate" data-testid={`text-venue-name-${i}`}>
                      {group.name}
                    </p>
                    {group.groupId && (
                      <p className="text-[10px] text-gray-300 dark:text-zinc-600 font-mono truncate mt-0.5" data-testid={`text-venue-id-${i}`}>
                        {group.groupId}
                      </p>
                    )}
                  </div>
                </div>
                <div className="mt-2">
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-400 dark:text-zinc-500">
                    <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                    {enabledCount} 項啟用
                  </span>
                </div>
              </div>

              <div className="flex-1 p-5">
                <div className="flex flex-wrap gap-3">
                  {displayKeys.map((fk) => {
                    const spec = FEATURE_SPEC_MAP[fk];
                    if (!spec) return null;
                    const enabled = enabledKeys.includes(fk);
                    const FIcon = spec.icon;
                    return (
                      <motion.div
                        key={fk}
                        whileHover={{ scale: 1.02 }}
                        className={`flex items-center gap-2.5 rounded-xl px-4 py-2.5 border transition-colors ${enabled ? spec.enabledColor : spec.disabledColor}`}
                        data-testid={`badge-venue-${i}-${fk}-${enabled ? "on" : "off"}`}
                      >
                        <FIcon className={`h-4 w-4 shrink-0 ${enabled ? spec.color : "text-gray-400 dark:text-zinc-500"}`} />
                        <div>
                          <p className={`text-xs font-semibold ${enabled ? "text-gray-700 dark:text-zinc-200" : "text-gray-400 dark:text-zinc-500"}`}>
                            {enabled ? "✅" : "❌"} {spec.emoji} {spec.label}
                          </p>
                          <p className="text-[10px] text-gray-400 dark:text-zinc-500 mt-0.5 flex items-center gap-1">
                            <Timer className="h-2.5 w-2.5" /> {spec.trigger}
                          </p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
}

const MICROSERVICES = [
  { label: "LINE Messaging API", color: "bg-emerald-500" },
  { label: "Task Service", color: "bg-blue-500" },
  { label: "Message Handler", color: "bg-violet-500" },
  { label: "Scheduler", color: "bg-amber-500" },
  { label: "LLM / GPT", color: "bg-pink-500" },
  { label: "Weather Service", color: "bg-sky-500" },
  { label: "Water Quality", color: "bg-cyan-500" },
];

function MicroservicesSection() {
  return (
    <motion.div variants={fadeIn} className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-800 p-6" data-testid="section-microservices">
      <div className="flex items-center gap-2 mb-4">
        <Layers className="h-4 w-4 text-gray-500 dark:text-zinc-400" />
        <p className="text-sm font-bold text-gray-700 dark:text-zinc-200">系統微服務架構</p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {MICROSERVICES.map((svc, i) => (
          <div key={svc.label} className="flex items-center gap-2">
            <motion.span
              whileHover={{ scale: 1.05 }}
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold bg-gray-50 dark:bg-zinc-800 text-gray-700 dark:text-zinc-200 border border-gray-100 dark:border-zinc-700 cursor-default"
              data-testid={`badge-service-${i}`}
            >
              <span className={`h-2 w-2 rounded-full ${svc.color}`} />
              {svc.label}
            </motion.span>
            {i < MICROSERVICES.length - 1 && (
              <ArrowRight className="h-3.5 w-3.5 text-gray-300 dark:text-zinc-600 shrink-0" />
            )}
          </div>
        ))}
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
      {[0, 1, 2].map((s) => (
        <div key={s} className="space-y-4">
          <div><Skeleton className="h-5 w-40 mb-1" /><Skeleton className="h-3 w-64" /></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[0, 1].map((c) => (
              <div key={c} className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm p-5 border border-gray-100 dark:border-zinc-800 space-y-3">
                <Skeleton className="h-10 w-10 rounded-xl" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-full" />
              </div>
            ))}
          </div>
        </div>
      ))}
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

  useEffect(() => { fetchData(); }, [fetchData]);

  const hasData = featureStats && tasksStats && attendanceStats;
  const groups = featureStats?.groups ?? [];
  const penetration = featureStats?.featurePenetration ?? [];

  const gpsPenetration = penetration.find(
    (p) => p.feature === "GPS打卡" || p.feature?.toLowerCase().includes("gps")
  );
  const gpsRate = gpsPenetration ? gpsPenetration.rate : null;

  const kpi: KpiItem[] = hasData
    ? [
        { title: "活躍場館", value: groups.length, suffix: "", icon: Users, accentColor: "text-blue-600 dark:text-blue-400", iconBg: "bg-blue-500" },
        { title: "任務完成率", value: typeof tasksStats!.completionRate === "number" ? tasksStats!.completionRate.toFixed(1) : String(tasksStats!.completionRate).replace(/%$/, ""), suffix: "%", icon: CheckCircle2, accentColor: "text-emerald-600 dark:text-emerald-400", iconBg: "bg-emerald-500" },
        { title: "今日打卡數", value: attendanceStats!.successful, suffix: "", icon: MapPin, accentColor: "text-violet-600 dark:text-violet-400", iconBg: "bg-violet-500" },
      ]
    : [];

  const gpsStatsText = gpsRate !== null ? `全域打卡率 ${Math.round(gpsRate)}%` : undefined;

  return (
    <div className="h-full overflow-y-auto bg-gray-50/80 dark:bg-zinc-950">
      <div className="p-6 lg:p-8 max-w-[1440px] mx-auto space-y-10">

        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <CircleDot className="h-5 w-5 text-blue-500" />
              <h1 className="text-xl font-bold tracking-tight text-gray-800 dark:text-zinc-100" data-testid="text-page-title">LINE Bot 系統全局藍圖</h1>
            </div>
            <p className="text-sm text-gray-400 dark:text-zinc-500">三大核心模組的運作狀態與權限分佈一覽</p>
          </div>
          {hasData && (
            <Button variant="outline" size="sm" onClick={fetchData} disabled={isLoading} data-testid="button-refresh" className="shrink-0">
              <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${isLoading ? "animate-spin" : ""}`} />
              重新整理
            </Button>
          )}
        </motion.div>

        {error && !isLoading && <ErrorBlock message={error} onRetry={fetchData} isRetrying={isLoading} />}

        {isLoading && <LoadingSkeleton />}

        {hasData && (
          <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-10">

            <motion.div className="flex flex-wrap gap-5" variants={containerVariants}>
              {kpi.map((item, i) => <KpiCard key={item.title} item={item} index={i} />)}
            </motion.div>

            <section data-testid="section-global">
              <SectionHeader
                emoji="🌐"
                title="全域通用與網頁應用"
                subtitle="所有群組與使用者皆可觸發的通用模組"
                color="text-blue-700 dark:text-blue-300"
              />
              <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" variants={containerVariants}>
                <GlobalFeatureCard
                  emoji="📋"
                  title="任務管理系統"
                  description="包含任務交辦、完成標記、待辦查詢，支援群組內快速指派與追蹤"
                  icon={ClipboardList}
                  gradient="bg-blue-50 dark:bg-blue-950/30"
                  iconColor="text-blue-500"
                  stats={`完成率 ${kpi[1]?.value}%`}
                />
                <GlobalFeatureCard
                  emoji="📍"
                  title="GPS 打卡系統"
                  description="員工透過 LINE 進行即時 GPS 定位打卡，管理端可即時查看出勤紀錄"
                  icon={Navigation}
                  gradient="bg-violet-50 dark:bg-violet-950/30"
                  iconColor="text-violet-500"
                  stats={gpsStatsText}
                />
                <GlobalFeatureCard
                  emoji="🏋️"
                  title="教練簽到"
                  description="教練透過 LIFF 網頁完成簽到流程，自動記錄到班時間"
                  icon={Dumbbell}
                  gradient="bg-emerald-50 dark:bg-emerald-950/30"
                  iconColor="text-emerald-500"
                />
                <GlobalFeatureCard
                  emoji="📊"
                  title="客戶調查"
                  description="透過 LIFF 問卷發送滿意度調查，自動收集並彙整回覆結果"
                  icon={BarChart3}
                  gradient="bg-amber-50 dark:bg-amber-950/30"
                  iconColor="text-amber-500"
                />
              </motion.div>
            </section>

            <section data-testid="section-private">
              <SectionHeader
                emoji="👤"
                title="私人專屬與權限對話"
                subtitle="基於身份權限的 1 對 1 私人對話服務"
                color="text-amber-700 dark:text-amber-300"
              />
              <PrivateSection />
            </section>

            <section data-testid="section-venue">
              <SectionHeader
                emoji="🏢"
                title="實體場館自動化矩陣"
                subtitle="各實體場館群組的專屬觸發指令與定時推播"
                color="text-slate-700 dark:text-zinc-200"
              />
              <VenueSwimlane groups={groups} />
            </section>

            <section data-testid="section-architecture">
              <SectionHeader
                emoji="⚙️"
                title="架構與依賴關係"
                subtitle="核心微服務元件與資料流向"
                color="text-gray-600 dark:text-zinc-300"
              />
              <MicroservicesSection />
            </section>

          </motion.div>
        )}
      </div>
    </div>
  );
}
