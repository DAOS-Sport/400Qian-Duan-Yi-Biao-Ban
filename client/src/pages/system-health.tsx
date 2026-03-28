import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Activity,
  Server,
  Database,
  Clock,
  Webhook,
  Cpu,
  Gauge,
  CircleCheck,
  CircleAlert,
  RefreshCw,
  ShieldAlert,
  Loader2,
  Inbox,
  FileText,
  BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";

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

const LINE_BOT_BASE = "https://line-bot-assistant-ronchen2.replit.app";

interface HealthEndpoint {
  name: string;
  url: string;
  icon: typeof Server;
  iconColor: string;
  iconBg: string;
}

const ENDPOINTS: HealthEndpoint[] = [
  {
    name: "LINE Bot 主服務",
    url: `${LINE_BOT_BASE}/api/admin/dashboard/feature-stats`,
    icon: Webhook,
    iconColor: "text-emerald-600 dark:text-emerald-400",
    iconBg: "bg-emerald-100 dark:bg-emerald-900/50",
  },
  {
    name: "任務引擎 API",
    url: `${LINE_BOT_BASE}/api/admin/tasks/stats`,
    icon: Cpu,
    iconColor: "text-blue-600 dark:text-blue-400",
    iconBg: "bg-blue-100 dark:bg-blue-900/50",
  },
  {
    name: "打卡出勤 API",
    url: `${LINE_BOT_BASE}/api/admin/attendance/stats`,
    icon: Clock,
    iconColor: "text-amber-600 dark:text-amber-400",
    iconBg: "bg-amber-100 dark:bg-amber-900/50",
  },
  {
    name: "場館自動化 API",
    url: `${LINE_BOT_BASE}/api/admin/dashboard/venue-automations`,
    icon: Server,
    iconColor: "text-indigo-600 dark:text-indigo-400",
    iconBg: "bg-indigo-100 dark:bg-indigo-900/50",
  },
  {
    name: "服務健康狀態 API",
    url: `${LINE_BOT_BASE}/api/admin/dashboard/services-health`,
    icon: Activity,
    iconColor: "text-teal-600 dark:text-teal-400",
    iconBg: "bg-teal-100 dark:bg-teal-900/50",
  },
  {
    name: "打卡異常報告 API",
    url: `/api/anomaly-reports`,
    icon: ShieldAlert,
    iconColor: "text-red-600 dark:text-red-400",
    iconBg: "bg-red-100 dark:bg-red-900/50",
  },
  {
    name: "通知收件人 API",
    url: `/api/notification-recipients`,
    icon: Database,
    iconColor: "text-purple-600 dark:text-purple-400",
    iconBg: "bg-purple-100 dark:bg-purple-900/50",
  },
  {
    name: "排班系統總覽 API",
    url: `/api/admin/overview`,
    icon: Gauge,
    iconColor: "text-cyan-600 dark:text-cyan-400",
    iconBg: "bg-cyan-100 dark:bg-cyan-900/50",
  },
  {
    name: "面試授權用戶 API",
    url: `/api/admin/interview-users`,
    icon: Cpu,
    iconColor: "text-rose-600 dark:text-rose-400",
    iconBg: "bg-rose-100 dark:bg-rose-900/50",
  },
  {
    name: "公告分析摘要 API",
    url: `/api/announcement-dashboard/summary`,
    icon: FileText,
    iconColor: "text-violet-600 dark:text-violet-400",
    iconBg: "bg-violet-100 dark:bg-violet-900/50",
  },
  {
    name: "公告週報 API",
    url: `/api/announcement-reports/weekly`,
    icon: BarChart3,
    iconColor: "text-orange-600 dark:text-orange-400",
    iconBg: "bg-orange-100 dark:bg-orange-900/50",
  },
];

interface HealthResult {
  name: string;
  status: "healthy" | "degraded" | "down" | "checking";
  latency: number | null;
  httpStatus: number | null;
  error: string | null;
  endpoint: HealthEndpoint;
}

function getStatusColor(status: string) {
  switch (status) {
    case "healthy": return "bg-emerald-500";
    case "degraded": return "bg-amber-500";
    case "down": return "bg-red-500";
    case "checking": return "bg-gray-400 animate-pulse";
    default: return "bg-gray-400";
  }
}

function getStatusLabel(status: string) {
  switch (status) {
    case "healthy": return "正常";
    case "degraded": return "延遲";
    case "down": return "離線";
    case "checking": return "檢測中...";
    default: return "未知";
  }
}

export default function SystemHealthPage() {
  const [results, setResults] = useState<HealthResult[]>(
    ENDPOINTS.map((ep) => ({
      name: ep.name,
      status: "checking",
      latency: null,
      httpStatus: null,
      error: null,
      endpoint: ep,
    }))
  );
  const [isChecking, setIsChecking] = useState(false);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const checkHealth = useCallback(async () => {
    setIsChecking(true);
    setResults((prev) =>
      prev.map((r) => ({ ...r, status: "checking" as const, latency: null, httpStatus: null, error: null }))
    );

    const promises = ENDPOINTS.map(async (ep, idx) => {
      const start = performance.now();
      try {
        const res = await fetch(ep.url, {
          method: "GET",
          headers: { Accept: "application/json" },
          signal: AbortSignal.timeout(10000),
        });
        const latency = Math.round(performance.now() - start);
        const status: HealthResult["status"] = res.ok
          ? latency > 3000 ? "degraded" : "healthy"
          : "down";
        return {
          name: ep.name,
          status,
          latency,
          httpStatus: res.status,
          error: res.ok ? null : `HTTP ${res.status}`,
          endpoint: ep,
        } as HealthResult;
      } catch (err: any) {
        const latency = Math.round(performance.now() - start);
        return {
          name: ep.name,
          status: "down" as const,
          latency,
          httpStatus: null,
          error: err.name === "TimeoutError" ? "逾時 (>10s)" : (err.message || "連線失敗"),
          endpoint: ep,
        } as HealthResult;
      }
    });

    const settled = await Promise.allSettled(promises);
    const newResults = settled.map((s, i) =>
      s.status === "fulfilled"
        ? s.value
        : {
            name: ENDPOINTS[i].name,
            status: "down" as const,
            latency: null,
            httpStatus: null,
            error: "檢測失敗",
            endpoint: ENDPOINTS[i],
          }
    );
    setResults(newResults);
    setIsChecking(false);
    setLastChecked(new Date());
  }, []);

  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, 60000);
    return () => clearInterval(interval);
  }, [checkHealth]);

  const healthyCount = results.filter((r) => r.status === "healthy").length;
  const totalCount = results.length;
  const allChecking = results.every((r) => r.status === "checking");

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="p-6 max-w-6xl mx-auto space-y-8"
      data-testid="page-system-health"
    >
      <motion.div variants={fadeIn} className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Activity className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            <h1 className="text-lg font-bold text-gray-800 dark:text-zinc-100" data-testid="text-page-title">
              微服務健康監控
            </h1>
          </div>
          <p className="text-sm text-gray-400 dark:text-zinc-500 ml-7" data-testid="text-page-subtitle">
            即時 API 端點健康檢測 · 每 60 秒自動刷新
          </p>
        </div>
        <div className="flex items-center gap-4">
          {lastChecked && (
            <span className="text-[11px] text-gray-400 dark:text-zinc-500">
              最後檢測：{lastChecked.toLocaleTimeString("zh-TW")}
            </span>
          )}
          {!allChecking && (
            <div className="flex items-center gap-2" data-testid="text-overall-status">
              <span className={`inline-block h-2.5 w-2.5 rounded-full ${healthyCount === totalCount ? "bg-emerald-500" : healthyCount > 0 ? "bg-amber-500" : "bg-red-500"} animate-pulse`} />
              <span className="text-sm font-medium text-gray-600 dark:text-zinc-300">
                {healthyCount}/{totalCount} 服務正常
              </span>
            </div>
          )}
          <Button variant="outline" size="sm" onClick={checkHealth} disabled={isChecking} data-testid="button-refresh">
            <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${isChecking ? "animate-spin" : ""}`} />
            重新檢測
          </Button>
        </div>
      </motion.div>

      <motion.div variants={fadeIn}>
        <h2 className="text-sm font-bold text-gray-700 dark:text-zinc-200 mb-4 flex items-center gap-2" data-testid="text-section-server-status">
          <Gauge className="h-4 w-4 text-gray-500 dark:text-zinc-400" />
          API 端點即時狀態
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {results.map((result, index) => {
            const Icon = result.endpoint.icon;
            const StatusIcon = result.status === "healthy" ? CircleCheck : result.status === "checking" ? Loader2 : CircleAlert;
            return (
              <motion.div
                key={result.name}
                variants={cardVariants}
                whileHover={{ y: -3, transition: { duration: 0.2 } }}
                data-testid={`card-service-${index}`}
              >
                <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-800 p-5">
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${result.endpoint.iconBg}`}>
                        <Icon className={`h-5 w-5 ${result.endpoint.iconColor}`} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-800 dark:text-zinc-100" data-testid={`text-service-name-${index}`}>
                          {result.name}
                        </p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className={`inline-block h-2 w-2 rounded-full ${getStatusColor(result.status)}`} />
                          <span className="text-xs text-gray-500 dark:text-zinc-400" data-testid={`text-service-status-${index}`}>
                            {getStatusLabel(result.status)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <StatusIcon
                      className={`h-5 w-5 shrink-0 ${result.status === "healthy" ? "text-emerald-500" : result.status === "checking" ? "text-gray-400 animate-spin" : result.status === "degraded" ? "text-amber-500" : "text-red-500"}`}
                      data-testid={`icon-service-status-${index}`}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gray-50 dark:bg-zinc-800/60 rounded-lg p-3 border border-gray-100 dark:border-zinc-700/50">
                      <p className="text-[10px] uppercase tracking-wide font-medium text-gray-400 dark:text-zinc-500 mb-0.5">
                        HTTP 狀態
                      </p>
                      <p className={`text-sm font-bold ${result.httpStatus && result.httpStatus < 400 ? "text-emerald-600 dark:text-emerald-400" : result.httpStatus ? "text-red-600 dark:text-red-400" : "text-gray-400 dark:text-zinc-500"}`} data-testid={`text-service-http-${index}`}>
                        {result.status === "checking" ? "..." : result.httpStatus ? `${result.httpStatus}` : "N/A"}
                      </p>
                    </div>
                    <div className="bg-gray-50 dark:bg-zinc-800/60 rounded-lg p-3 border border-gray-100 dark:border-zinc-700/50">
                      <p className="text-[10px] uppercase tracking-wide font-medium text-gray-400 dark:text-zinc-500 mb-0.5">
                        回應延遲
                      </p>
                      <p className={`text-sm font-bold ${result.latency !== null && result.latency < 1000 ? "text-gray-800 dark:text-zinc-100" : result.latency !== null ? "text-amber-600 dark:text-amber-400" : "text-gray-400 dark:text-zinc-500"}`} data-testid={`text-service-latency-${index}`}>
                        {result.status === "checking" ? "..." : result.latency !== null ? `${result.latency}ms` : "N/A"}
                      </p>
                    </div>
                  </div>
                  {result.error && (
                    <p className="mt-3 text-[11px] text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-lg px-3 py-1.5 border border-red-100 dark:border-red-800/30">
                      {result.error}
                    </p>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      <motion.div variants={fadeIn}>
        <h2 className="text-sm font-bold text-gray-700 dark:text-zinc-200 mb-4 flex items-center gap-2" data-testid="text-section-summary">
          <Inbox className="h-4 w-4 text-gray-500 dark:text-zinc-400" />
          檢測摘要
        </h2>
        <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-800 p-6">
          {allChecking ? (
            <div className="flex items-center justify-center gap-2 py-4">
              <Loader2 className="h-4 w-4 text-gray-400 animate-spin" />
              <span className="text-sm text-gray-500 dark:text-zinc-400">正在檢測所有端點...</span>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400" data-testid="text-summary-healthy">
                  {results.filter((r) => r.status === "healthy").length}
                </p>
                <p className="text-xs text-gray-400 dark:text-zinc-500 mt-0.5">正常</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-amber-600 dark:text-amber-400" data-testid="text-summary-degraded">
                  {results.filter((r) => r.status === "degraded").length}
                </p>
                <p className="text-xs text-gray-400 dark:text-zinc-500 mt-0.5">延遲</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-red-600 dark:text-red-400" data-testid="text-summary-down">
                  {results.filter((r) => r.status === "down").length}
                </p>
                <p className="text-xs text-gray-400 dark:text-zinc-500 mt-0.5">離線</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-700 dark:text-zinc-200" data-testid="text-summary-avg-latency">
                  {(() => {
                    const valid = results.filter((r) => r.latency !== null);
                    if (valid.length === 0) return "—";
                    const avg = Math.round(valid.reduce((sum, r) => sum + (r.latency || 0), 0) / valid.length);
                    return `${avg}ms`;
                  })()}
                </p>
                <p className="text-xs text-gray-400 dark:text-zinc-500 mt-0.5">平均延遲</p>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
