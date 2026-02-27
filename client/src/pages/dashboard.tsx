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
  Wind,
  Timer,
  Copy,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const BASE_URL = "https://line-bot-assistant-ronchen2.replit.app";

const API = {
  featureStats: `${BASE_URL}/api/admin/dashboard/feature-stats`,
  tasksStats: `${BASE_URL}/api/admin/tasks/stats`,
  attendanceStats: `${BASE_URL}/api/admin/attendance/stats`,
  globalApps: `${BASE_URL}/api/admin/dashboard/global-apps`,
  privateServices: `${BASE_URL}/api/admin/dashboard/private-services`,
  venueAutomations: `${BASE_URL}/api/admin/dashboard/venue-automations`,
  servicesHealth: `${BASE_URL}/api/admin/dashboard/services-health`,
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
  totalGroups: number;
}

interface TasksStatsResponse {
  total: number;
  completed: number;
  pending: number;
  completionRate: string | number;
  [key: string]: any;
}

interface AttendanceStatsResponse {
  todayCheckins: number;
  successful: number;
  failed: number;
  uniqueCheckers: number;
  [key: string]: any;
}

const VENUE_NAME_MAP: Record<string, string> = {
  "C66a4b3bb3fbc3dcf52d42626ec512484": "DAOS-新北高中（工作群）",
  "C6f6f163895d5b528a6ab044015e1a37b": "DAOS-三重商工館（工作群）",
  "C2dc6991e51074dd47d5d275d568318f7": "DAOS-三民館（工作群）",
  "C9b3c5dfe2e005adafd2ed914714a1930": "駿斯-松山國小館",
  "C50c2a9623a78cc5f5e9f39557e3abfe6": "駿斯-竹科戶外游泳池",
  "C360be1fe6ea876a4df3ca0497bca4e3b": "駿斯-戶外運動園區",
  "C2dd9a5fce7c276f2cbfdd02c2342661c": "駿斯-社區&勞務業務群",
  "Ce936c6bebb59b8b5683ffbcf97bf20de": "駿斯總部辦公室群",
};

const EXCLUDED_KEYS = new Set(["name", "groupId", "totalEnabled"]);

function getDisplayName(group: GroupData): string {
  if (group.groupId && VENUE_NAME_MAP[group.groupId]) {
    return VENUE_NAME_MAP[group.groupId];
  }
  return group.name;
}

function parseRate(val: string | number): number {
  if (typeof val === "number") return val;
  return parseFloat(String(val).replace(/%$/, "")) || 0;
}

interface FeatureSpec {
  emoji: string;
  label: string;
  instruction: string;
  icon: typeof Users;
  color: string;
  enabledBg: string;
  disabledBg: string;
  apiKeys: string[];
}

const VENUE_FEATURES: FeatureSpec[] = [
  {
    emoji: "📝", label: "交辦任務", instruction: "⌨️ 輸入：交辦XXX",
    icon: ClipboardList, color: "text-blue-600 dark:text-blue-400",
    enabledBg: "bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-800/50",
    disabledBg: "bg-gray-50/50 border-gray-200/60 dark:bg-zinc-800/30 dark:border-zinc-700/40 opacity-50",
    apiKeys: ["任務交辦"],
  },
  {
    emoji: "🔍", label: "處理事項查詢", instruction: "⌨️ 輸入：處理事項",
    icon: Search, color: "text-indigo-600 dark:text-indigo-400",
    enabledBg: "bg-indigo-50 border-indigo-200 dark:bg-indigo-950/30 dark:border-indigo-800/50",
    disabledBg: "bg-gray-50/50 border-gray-200/60 dark:bg-zinc-800/30 dark:border-zinc-700/40 opacity-50",
    apiKeys: ["處理事項查詢", "處理事項"],
  },
  {
    emoji: "✅", label: "任務完成", instruction: "⌨️ 輸入：任務XX完成",
    icon: CheckCircle2, color: "text-green-600 dark:text-green-400",
    enabledBg: "bg-green-50 border-green-200 dark:bg-green-950/30 dark:border-green-800/50",
    disabledBg: "bg-gray-50/50 border-gray-200/60 dark:bg-zinc-800/30 dark:border-zinc-700/40 opacity-50",
    apiKeys: ["任務完成"],
  },
  {
    emoji: "⏰", label: "排程提醒", instruction: "⏱️ 定時推送 (回覆觸發)",
    icon: Timer, color: "text-orange-600 dark:text-orange-400",
    enabledBg: "bg-orange-50 border-orange-200 dark:bg-orange-950/30 dark:border-orange-800/50",
    disabledBg: "bg-gray-50/50 border-gray-200/60 dark:bg-zinc-800/30 dark:border-zinc-700/40 opacity-50",
    apiKeys: ["排程提醒"],
  },
  {
    emoji: "💧", label: "水質監控", instruction: "🤖 自動辨識水質數據格式",
    icon: Droplets, color: "text-cyan-600 dark:text-cyan-400",
    enabledBg: "bg-cyan-50 border-cyan-200 dark:bg-cyan-950/30 dark:border-cyan-800/50",
    disabledBg: "bg-gray-50/50 border-gray-200/60 dark:bg-zinc-800/30 dark:border-zinc-700/40 opacity-50",
    apiKeys: ["水質監控"],
  },
  {
    emoji: "🌤️", label: "天氣預報", instruction: "⏱️ 特定時間 (回覆觸發)",
    icon: Cloud, color: "text-sky-600 dark:text-sky-400",
    enabledBg: "bg-sky-50 border-sky-200 dark:bg-sky-950/30 dark:border-sky-800/50",
    disabledBg: "bg-gray-50/50 border-gray-200/60 dark:bg-zinc-800/30 dark:border-zinc-700/40 opacity-50",
    apiKeys: ["天氣預報"],
  },
  {
    emoji: "🌬️", label: "風力預報", instruction: "⏱️ 特定時間 (回覆觸發)",
    icon: Wind, color: "text-teal-600 dark:text-teal-400",
    enabledBg: "bg-teal-50 border-teal-200 dark:bg-teal-950/30 dark:border-teal-800/50",
    disabledBg: "bg-gray-50/50 border-gray-200/60 dark:bg-zinc-800/30 dark:border-zinc-700/40 opacity-50",
    apiKeys: ["風力預報"],
  },
  {
    emoji: "📊", label: "合併報告推送", instruction: "⏱️ 排程自動推送",
    icon: BarChart3, color: "text-purple-600 dark:text-purple-400",
    enabledBg: "bg-purple-50 border-purple-200 dark:bg-purple-950/30 dark:border-purple-800/50",
    disabledBg: "bg-gray-50/50 border-gray-200/60 dark:bg-zinc-800/30 dark:border-zinc-700/40 opacity-50",
    apiKeys: ["合併報告推送", "合併報告"],
  },
  {
    emoji: "🔗", label: "滿意度調查", instruction: "👆 點擊圖文選單開啟 (LIFF)",
    icon: Globe, color: "text-amber-600 dark:text-amber-400",
    enabledBg: "bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-800/50",
    disabledBg: "bg-gray-50/50 border-gray-200/60 dark:bg-zinc-800/30 dark:border-zinc-700/40 opacity-50",
    apiKeys: ["客戶調查", "滿意度調查"],
  },
  {
    emoji: "🤖", label: "GPT小助理", instruction: "💬 直接輸入長任務對話",
    icon: MessageCircle, color: "text-rose-600 dark:text-rose-400",
    enabledBg: "bg-rose-50 border-rose-200 dark:bg-rose-950/30 dark:border-rose-800/50",
    disabledBg: "bg-gray-50/50 border-gray-200/60 dark:bg-zinc-800/30 dark:border-zinc-700/40 opacity-50",
    apiKeys: ["GPT小助理", "GPT"],
  },
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

interface GlobalCardProps {
  emoji: string;
  title: string;
  description: string;
  icon: typeof Users;
  gradient: string;
  iconColor: string;
  stats?: { label: string; value: string | number }[];
  isLiff?: boolean;
  usageGuide?: string;
}

function GlobalFeatureCard({ emoji, title, description, icon: Icon, gradient, iconColor, stats, isLiff, usageGuide }: GlobalCardProps) {
  return (
    <motion.div variants={cardVariants} whileHover={{ y: -4, transition: { duration: 0.2 } }} className="flex-1 min-w-[200px]">
      <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-800 p-5 h-full flex flex-col" data-testid={`card-global-${title}`}>
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl mb-4 ${gradient}`}>
          <Icon className={`h-5 w-5 ${iconColor}`} />
        </div>
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <p className="text-sm font-bold text-gray-800 dark:text-zinc-100">{emoji} {title}</p>
          {isLiff && (
            <span className="inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[10px] font-semibold bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300 whitespace-nowrap" data-testid={`badge-liff-${title}`}>
              🔗 外接網頁 (LIFF)
            </span>
          )}
        </div>
        <p className="text-xs text-gray-400 dark:text-zinc-500 leading-relaxed flex-1">{description}</p>
        {usageGuide && (
          <div className="bg-gray-50 dark:bg-zinc-800/60 rounded-lg p-2.5 mt-2.5 border border-gray-100 dark:border-zinc-700/50" data-testid={`guide-${title}`}>
            <p className="text-[11px] text-gray-500 dark:text-zinc-400 leading-relaxed">{usageGuide}</p>
          </div>
        )}
        {stats && stats.length > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-100 dark:border-zinc-800 space-y-1">
            {stats.map((s) => (
              <div key={s.label} className="flex items-center justify-between">
                <span className="text-[11px] text-gray-400 dark:text-zinc-500">{s.label}</span>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{s.value}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

function PrivateSection({ privateData }: { privateData: any }) {
  const generalBindings = privateData?.general?.totalBindings;
  const adminCount = privateData?.management?.authorizedUsersCount ?? 7;

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
              {generalBindings != null && (
                <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 mt-1">已綁定 {generalBindings} 人</p>
              )}
              <div className="bg-blue-50/80 dark:bg-blue-950/20 rounded-md p-2 mt-2 border border-blue-100/50 dark:border-blue-900/30" data-testid="guide-employee-query">
                <p className="text-[11px] text-blue-600/80 dark:text-blue-400/80 leading-relaxed">⌨️ <span className="font-semibold">觸發方式：</span>直接輸入員工編號或 LINE ID</p>
              </div>
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
                    <p className="text-xs">僅限特定 {adminCount} 位管理員可用</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <p className="text-xs text-gray-400 dark:text-zinc-500 mt-0.5">介接體育署 API + Ragic 名單，進行資格驗證</p>
              <div className="bg-amber-50/80 dark:bg-amber-950/20 rounded-md p-2 mt-2 border border-amber-100/50 dark:border-amber-900/30" data-testid="guide-interview">
                <p className="text-[11px] text-amber-600/80 dark:text-amber-400/80 leading-relaxed">⌨️ <span className="font-semibold">嚴格觸發指令：</span>輸入「面試+身分證字號」（不含括號且無空格）</p>
              </div>
            </div>
          </div>
          <div className="mt-2 px-3 flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold bg-amber-100/80 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300">
              <Lock className="h-3 w-3" /> 權限受限
            </span>
            <span className="text-xs text-amber-600/70 dark:text-amber-400/70">{adminCount} 位授權</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function CopyableId({ id }: { id: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(id).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }, [id]);

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1 text-[10px] text-gray-300 dark:text-zinc-600 font-mono hover:text-gray-500 dark:hover:text-zinc-400 transition-colors cursor-pointer group"
      data-testid={`button-copy-${id}`}
      title="點擊複製 Group ID"
    >
      <span className="truncate max-w-[160px]">{id}</span>
      {copied ? (
        <Check className="h-2.5 w-2.5 text-emerald-500 shrink-0" />
      ) : (
        <Copy className="h-2.5 w-2.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
      )}
    </button>
  );
}

function VenueSwimlane({ groups, venueData }: { groups: GroupData[]; venueData: any }) {
  const displayGroups = venueData?.venues ?? groups;

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-3">
      {displayGroups.map((group: any, i: number) => {
        const rawKeys = Object.keys(group).filter((k) => !EXCLUDED_KEYS.has(k) && typeof group[k] === "number");
        const enabledApiKeys = rawKeys.filter((k) => Number(group[k]) > 0);
        const displayName = getDisplayName(group);

        const venueSchedules = group.schedules ?? null;

        const resolvedFeatures = VENUE_FEATURES.map((spec) => {
          const enabled = spec.apiKeys.some((ak) => enabledApiKeys.includes(ak));
          return { spec, enabled };
        });
        const enabledCount = resolvedFeatures.filter((f) => f.enabled).length;

        return (
          <motion.div
            key={group.groupId || group.name || i}
            variants={cardVariants}
            className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-800 overflow-hidden"
            data-testid={`row-venue-${i}`}
          >
            <div className="flex flex-col md:flex-row">
              <div className="md:w-60 shrink-0 p-5 flex flex-col justify-center border-b md:border-b-0 md:border-r border-gray-100 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-800/30">
                <div className="flex items-center gap-2.5">
                  <Building2 className="h-5 w-5 text-slate-500 dark:text-zinc-400 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-gray-800 dark:text-zinc-100 truncate" data-testid={`text-venue-name-${i}`}>
                      {displayName}
                    </p>
                    {group.groupId && <CopyableId id={group.groupId} />}
                  </div>
                </div>
                <div className="mt-2">
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-400 dark:text-zinc-500">
                    <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                    {enabledCount} / {VENUE_FEATURES.length} 項啟用
                  </span>
                </div>
              </div>

              <div className="flex-1 p-5">
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
                  {resolvedFeatures.map(({ spec, enabled }, fi) => {
                    const FIcon = spec.icon;
                    return (
                      <motion.div
                        key={fi}
                        whileHover={{ scale: 1.02 }}
                        className={`flex items-start gap-2.5 rounded-xl px-3.5 py-2.5 border transition-colors ${enabled ? spec.enabledBg : spec.disabledBg}`}
                        data-testid={`badge-venue-${i}-${spec.label}-${enabled ? "on" : "off"}`}
                      >
                        <FIcon className={`h-4 w-4 shrink-0 mt-0.5 ${enabled ? spec.color : "text-gray-400 dark:text-zinc-500"}`} />
                        <div className="min-w-0">
                          <p className={`text-xs font-semibold leading-tight ${enabled ? "text-gray-700 dark:text-zinc-200" : "text-gray-400 dark:text-zinc-500"}`}>
                            {enabled ? "✅" : "❌"} {spec.emoji} {spec.label}
                          </p>
                          <p className={`text-[10px] mt-1 leading-tight ${enabled ? "text-gray-500 dark:text-zinc-400" : "text-gray-400/70 dark:text-zinc-500/60"}`}>
                            {spec.instruction}
                          </p>
                        </div>
                      </motion.div>
                    );
                  })}

                  {venueSchedules && venueSchedules.map((s: any, si: number) => (
                    <motion.div
                      key={`sched-${si}`}
                      whileHover={{ scale: 1.02 }}
                      className="flex items-center gap-2.5 bg-amber-50 dark:bg-amber-950/30 rounded-xl px-4 py-2.5 border border-amber-200 dark:border-amber-800/50"
                      data-testid={`badge-venue-${i}-schedule-${si}`}
                    >
                      <Timer className="h-4 w-4 shrink-0 text-amber-500" />
                      <div>
                        <p className="text-xs font-semibold text-gray-700 dark:text-zinc-200">⏰ {s.name || s.label}</p>
                        <p className="text-[10px] text-gray-400 dark:text-zinc-500 mt-0.5">{s.time || s.cron}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
}

interface ServiceStatus {
  name: string;
  status: string;
  color: string;
}

const DEFAULT_SERVICES: ServiceStatus[] = [
  { name: "LINE Messaging API", status: "healthy", color: "bg-emerald-500" },
  { name: "Task Service", status: "healthy", color: "bg-emerald-500" },
  { name: "Message Handler", status: "healthy", color: "bg-emerald-500" },
  { name: "Scheduler", status: "healthy", color: "bg-emerald-500" },
  { name: "LLM / GPT", status: "healthy", color: "bg-emerald-500" },
  { name: "Weather Service", status: "healthy", color: "bg-emerald-500" },
  { name: "Water Quality", status: "healthy", color: "bg-emerald-500" },
];

function MicroservicesSection({ healthData }: { healthData: any }) {
  let services: ServiceStatus[] = DEFAULT_SERVICES;

  if (healthData && typeof healthData === "object") {
    const mapped: ServiceStatus[] = [];
    const nameMap: Record<string, string> = {
      lineService: "LINE Messaging API",
      taskService: "Task Service",
      messageHandler: "Message Handler",
      scheduler: "Scheduler",
      llmService: "LLM / GPT",
      weatherService: "Weather Service",
      waterQualityService: "Water Quality",
    };
    for (const [key, val] of Object.entries(healthData)) {
      if (typeof val === "object" && val !== null) {
        const v = val as any;
        const status = v.status || "unknown";
        mapped.push({
          name: nameMap[key] || key,
          status,
          color: status === "healthy" ? "bg-emerald-500" : status === "degraded" ? "bg-amber-500" : "bg-red-500",
        });
      }
    }
    if (mapped.length > 0) services = mapped;
  }

  return (
    <motion.div variants={fadeIn} className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-800 p-6" data-testid="section-microservices">
      <div className="flex items-center gap-2 mb-4">
        <Layers className="h-4 w-4 text-gray-500 dark:text-zinc-400" />
        <p className="text-sm font-bold text-gray-700 dark:text-zinc-200">系統微服務架構</p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {services.map((svc, i) => (
          <div key={svc.name} className="flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <motion.span
                  whileHover={{ scale: 1.05 }}
                  className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold bg-gray-50 dark:bg-zinc-800 text-gray-700 dark:text-zinc-200 border border-gray-100 dark:border-zinc-700 cursor-default"
                  data-testid={`badge-service-${i}`}
                >
                  <span className={`h-2 w-2 rounded-full ${svc.color}`} />
                  {svc.name}
                </motion.span>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p className="text-xs capitalize">{svc.status}</p>
              </TooltipContent>
            </Tooltip>
            {i < services.length - 1 && (
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
        {[0, 1, 2, 3].map((i) => (
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
  const [globalApps, setGlobalApps] = useState<any>(null);
  const [privateServices, setPrivateServices] = useState<any>(null);
  const [venueAutomations, setVenueAutomations] = useState<any>(null);
  const [servicesHealth, setServicesHealth] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const results = await Promise.allSettled([
      strictFetch<FeatureStatsResponse>(API.featureStats),
      strictFetch<TasksStatsResponse>(API.tasksStats),
      strictFetch<AttendanceStatsResponse>(API.attendanceStats),
      safeFetch(API.globalApps),
      safeFetch(API.privateServices),
      safeFetch(API.venueAutomations),
      safeFetch(API.servicesHealth),
    ]);

    const [fsResult, tsResult, asResult, gaResult, psResult, vaResult, shResult] = results;

    if (fsResult.status === "rejected" && tsResult.status === "rejected" && asResult.status === "rejected") {
      setError(fsResult.reason?.message || "所有核心 API 皆無法連線");
      setIsLoading(false);
      return;
    }

    if (fsResult.status === "fulfilled") setFeatureStats(fsResult.value);
    if (tsResult.status === "fulfilled") setTasksStats(tsResult.value);
    if (asResult.status === "fulfilled") setAttendanceStats(asResult.value);
    if (gaResult.status === "fulfilled" && gaResult.value) setGlobalApps(gaResult.value);
    if (psResult.status === "fulfilled" && psResult.value) setPrivateServices(psResult.value);
    if (vaResult.status === "fulfilled" && vaResult.value) setVenueAutomations(vaResult.value);
    if (shResult.status === "fulfilled" && shResult.value) setServicesHealth(shResult.value);

    if (fsResult.status === "rejected") {
      setError(fsResult.reason?.message || "功能統計 API 無法連線");
    }

    setIsLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const hasData = featureStats || tasksStats || attendanceStats;
  const groups = featureStats?.groups ?? [];
  const penetration = featureStats?.featurePenetration ?? [];

  const gpsPenetration = penetration.find(
    (p) => p.feature === "GPS打卡" || p.feature?.toLowerCase().includes("gps")
  );
  const gpsRate = gpsPenetration ? gpsPenetration.rate : null;
  const taskRate = tasksStats ? parseRate(tasksStats.completionRate) : 0;

  const kpi: KpiItem[] = [];
  if (featureStats) {
    kpi.push({ title: "活躍場館", value: featureStats.totalGroups ?? groups.length, suffix: "", icon: Users, accentColor: "text-blue-600 dark:text-blue-400", iconBg: "bg-blue-500" });
  }
  if (tasksStats) {
    kpi.push({ title: "任務完成率", value: taskRate.toFixed(1), suffix: "%", icon: CheckCircle2, accentColor: "text-emerald-600 dark:text-emerald-400", iconBg: "bg-emerald-500" });
    kpi.push({ title: "總任務數", value: tasksStats.total, suffix: "", icon: ClipboardList, accentColor: "text-blue-600 dark:text-blue-400", iconBg: "bg-blue-500" });
  }
  if (attendanceStats) {
    kpi.push({ title: "今日打卡數", value: attendanceStats.todayCheckins ?? attendanceStats.successful, suffix: "", icon: MapPin, accentColor: "text-violet-600 dark:text-violet-400", iconBg: "bg-violet-500" });
  }

  const taskPenRate = penetration.find((p) => p.feature === "任務交辦");
  const gpsPenRate = penetration.find((p) => p.feature === "GPS打卡");

  const globalTaskStats: { label: string; value: string | number }[] = [];
  if (globalApps?.tasks) {
    if (globalApps.tasks.totalToday != null) globalTaskStats.push({ label: "今日交辦", value: globalApps.tasks.totalToday });
    if (globalApps.tasks.status) globalTaskStats.push({ label: "狀態", value: globalApps.tasks.status });
  }
  if (tasksStats) {
    globalTaskStats.push({ label: "完成率", value: `${taskRate.toFixed(1)}%` });
    globalTaskStats.push({ label: "待處理", value: tasksStats.pending });
  }
  if (taskPenRate) {
    globalTaskStats.push({ label: "場館覆蓋", value: `${taskPenRate.count}/${featureStats?.totalGroups ?? groups.length} (${taskPenRate.rate}%)` });
  }

  const globalGpsStats: { label: string; value: string | number }[] = [];
  if (globalApps?.gps) {
    if (globalApps.gps.todayCheckins != null) globalGpsStats.push({ label: "今日打卡", value: globalApps.gps.todayCheckins });
    if (globalApps.gps.status) globalGpsStats.push({ label: "狀態", value: globalApps.gps.status });
  }
  if (attendanceStats) {
    globalGpsStats.push({ label: "今日打卡", value: attendanceStats.todayCheckins ?? attendanceStats.successful });
    if (attendanceStats.uniqueCheckers > 0) globalGpsStats.push({ label: "不重複人數", value: attendanceStats.uniqueCheckers });
  }
  if (gpsRate != null) {
    globalGpsStats.push({ label: "全域覆蓋率", value: `${Math.round(gpsRate)}%` });
  }

  const globalCoachStats: { label: string; value: string | number }[] = [];
  if (globalApps?.coach) {
    if (globalApps.coach.todayCheckins != null) globalCoachStats.push({ label: "今日簽到", value: globalApps.coach.todayCheckins });
  }

  const globalSurveyStats: { label: string; value: string | number }[] = [];
  if (globalApps?.survey) {
    if (globalApps.survey.totalResponses != null) globalSurveyStats.push({ label: "回覆數", value: globalApps.survey.totalResponses });
  }

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

        {error && !isLoading && !hasData && <ErrorBlock message={error} onRetry={fetchData} isRetrying={isLoading} />}

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
                  emoji="📋" title="任務管理系統"
                  description="包含任務交辦、完成標記、待辦查詢，支援群組內快速指派與追蹤"
                  icon={ClipboardList} gradient="bg-blue-50 dark:bg-blue-950/30" iconColor="text-blue-500"
                  stats={globalTaskStats}
                  usageGuide={"⌨️ 觸發指令：輸入『交辦XXX』、『任務XX完成』或『處理事項』"}
                />
                <GlobalFeatureCard
                  emoji="📍" title="GPS 打卡系統"
                  description="員工透過 LINE 進行即時 GPS 定位打卡，管理端可即時查看出勤紀錄"
                  icon={Navigation} gradient="bg-violet-50 dark:bg-violet-950/30" iconColor="text-violet-500"
                  stats={globalGpsStats}
                  isLiff
                  usageGuide={"💡 操作方式：點擊 LINE 官方帳號下方圖文選單，開啟專屬外部網頁"}
                />
                <GlobalFeatureCard
                  emoji="🏋️" title="教練簽到"
                  description="教練透過 LIFF 網頁完成簽到流程，自動記錄到班時間"
                  icon={Dumbbell} gradient="bg-emerald-50 dark:bg-emerald-950/30" iconColor="text-emerald-500"
                  stats={globalCoachStats.length > 0 ? globalCoachStats : undefined}
                  isLiff
                  usageGuide={"💡 操作方式：點擊 LINE 官方帳號下方圖文選單，開啟專屬外部網頁"}
                />
                <GlobalFeatureCard
                  emoji="📊" title="客戶調查"
                  description="透過 LIFF 問卷發送滿意度調查，自動收集並彙整回覆結果"
                  icon={BarChart3} gradient="bg-amber-50 dark:bg-amber-950/30" iconColor="text-amber-500"
                  stats={globalSurveyStats.length > 0 ? globalSurveyStats : undefined}
                  isLiff
                  usageGuide={"💡 操作方式：點擊 LINE 官方帳號下方圖文選單，開啟專屬外部網頁"}
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
              <PrivateSection privateData={privateServices} />
            </section>

            {groups.length > 0 && (
              <section data-testid="section-venue">
                <SectionHeader
                  emoji="🏢"
                  title="實體場館自動化矩陣"
                  subtitle="各實體場館群組的專屬觸發指令與定時推播"
                  color="text-slate-700 dark:text-zinc-200"
                />
                <VenueSwimlane groups={groups} venueData={venueAutomations} />
              </section>
            )}

            <section data-testid="section-architecture">
              <SectionHeader
                emoji="⚙️"
                title="架構與依賴關係"
                subtitle="核心微服務元件與資料流向"
                color="text-gray-600 dark:text-zinc-300"
              />
              <MicroservicesSection healthData={servicesHealth} />
            </section>

          </motion.div>
        )}
      </div>
    </div>
  );
}
