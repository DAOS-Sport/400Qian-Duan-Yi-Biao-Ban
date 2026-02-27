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
  Terminal,
} from "lucide-react";

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

interface ServiceInfo {
  name: string;
  status: "healthy" | "degraded" | "down";
  uptime: string;
  latency: string;
  icon: typeof Server;
  iconColor: string;
  iconBg: string;
}

const services: ServiceInfo[] = [
  {
    name: "LINE Webhook",
    status: "healthy",
    uptime: "99.98%",
    latency: "45ms",
    icon: Webhook,
    iconColor: "text-emerald-600 dark:text-emerald-400",
    iconBg: "bg-emerald-100 dark:bg-emerald-900/50",
  },
  {
    name: "Task Engine",
    status: "healthy",
    uptime: "99.95%",
    latency: "62ms",
    icon: Cpu,
    iconColor: "text-blue-600 dark:text-blue-400",
    iconBg: "bg-blue-100 dark:bg-blue-900/50",
  },
  {
    name: "Ragic API",
    status: "healthy",
    uptime: "99.87%",
    latency: "210ms",
    icon: Server,
    iconColor: "text-indigo-600 dark:text-indigo-400",
    iconBg: "bg-indigo-100 dark:bg-indigo-900/50",
  },
  {
    name: "Scheduler",
    status: "healthy",
    uptime: "99.99%",
    latency: "18ms",
    icon: Clock,
    iconColor: "text-amber-600 dark:text-amber-400",
    iconBg: "bg-amber-100 dark:bg-amber-900/50",
  },
  {
    name: "Database",
    status: "healthy",
    uptime: "99.99%",
    latency: "8ms",
    icon: Database,
    iconColor: "text-purple-600 dark:text-purple-400",
    iconBg: "bg-purple-100 dark:bg-purple-900/50",
  },
];

function getStatusColor(status: string) {
  switch (status) {
    case "healthy":
      return "bg-emerald-500";
    case "degraded":
      return "bg-amber-500";
    case "down":
      return "bg-red-500";
    default:
      return "bg-gray-400";
  }
}

function getStatusLabel(status: string) {
  switch (status) {
    case "healthy":
      return "Healthy";
    case "degraded":
      return "Degraded";
    case "down":
      return "Down";
    default:
      return "Unknown";
  }
}

function getStatusIcon(status: string) {
  if (status === "healthy") return CircleCheck;
  return CircleAlert;
}

const auditLogs = [
  { time: "2025-01-22 08:00:01", level: "INFO", msg: "[Scheduler] 每日排程啟動 — 開始推送天氣預報至 8 個群組" },
  { time: "2025-01-22 08:00:03", level: "OK", msg: "[Scheduler] 天氣預報推送完成 — 成功 8/8 群組" },
  { time: "2025-01-22 08:15:00", level: "INFO", msg: "[Scheduler] 水質監控排程啟動 — 檢查竹科泳池水質數據" },
  { time: "2025-01-22 08:15:02", level: "OK", msg: "[Scheduler] 水質監控完成 — pH 7.4, 餘氯 1.2ppm, 水溫 27°C" },
  { time: "2025-01-22 09:00:00", level: "INFO", msg: "[TaskEngine] 待處理任務掃描 — 發現 12 項待辦任務" },
  { time: "2025-01-22 09:00:01", level: "OK", msg: "[TaskEngine] 逾期提醒推送完成 — 通知 3 位負責人" },
  { time: "2025-01-22 10:30:15", level: "INFO", msg: "[Webhook] LINE 訊息接收 — 處理交辦任務指令" },
  { time: "2025-01-22 10:30:16", level: "OK", msg: "[Webhook] 任務建立成功 — 任務 #260 已指派至三重商工館" },
  { time: "2025-01-22 12:00:00", level: "INFO", msg: "[Scheduler] 合併報告排程啟動 — 彙整上午營運數據" },
  { time: "2025-01-22 12:00:04", level: "OK", msg: "[Scheduler] 合併報告推送完成 — 成功推送至 5 個管理群組" },
  { time: "2025-01-22 14:00:00", level: "INFO", msg: "[Database] 自動備份啟動 — 增量備份進行中" },
  { time: "2025-01-22 14:00:08", level: "OK", msg: "[Database] 備份完成 — 大小 42MB, 耗時 8s" },
];

function LogLevelBadge({ level }: { level: string }) {
  const color = level === "OK"
    ? "text-emerald-400"
    : level === "WARN"
      ? "text-amber-400"
      : level === "ERROR"
        ? "text-red-400"
        : "text-sky-400";
  return <span className={`font-bold ${color}`}>[{level}]</span>;
}

export default function SystemHealthPage() {
  const healthyCount = services.filter((s) => s.status === "healthy").length;
  const totalCount = services.length;

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
            System Health & Microservice Status
          </p>
        </div>
        <div className="flex items-center gap-2" data-testid="text-overall-status">
          <span className={`inline-block h-2.5 w-2.5 rounded-full ${healthyCount === totalCount ? "bg-emerald-500" : "bg-amber-500"} animate-pulse`} />
          <span className="text-sm font-medium text-gray-600 dark:text-zinc-300">
            {healthyCount}/{totalCount} Services Online
          </span>
        </div>
      </motion.div>

      <motion.div variants={fadeIn}>
        <h2 className="text-sm font-bold text-gray-700 dark:text-zinc-200 mb-4 flex items-center gap-2" data-testid="text-section-server-status">
          <Gauge className="h-4 w-4 text-gray-500 dark:text-zinc-400" />
          Server Status Grid
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map((service, index) => {
            const Icon = service.icon;
            const StatusIcon = getStatusIcon(service.status);
            return (
              <motion.div
                key={service.name}
                variants={cardVariants}
                whileHover={{ y: -3, transition: { duration: 0.2 } }}
                data-testid={`card-service-${index}`}
              >
                <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-800 p-5">
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${service.iconBg}`}>
                        <Icon className={`h-5 w-5 ${service.iconColor}`} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-800 dark:text-zinc-100" data-testid={`text-service-name-${index}`}>
                          {service.name}
                        </p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className={`inline-block h-2 w-2 rounded-full ${getStatusColor(service.status)}`} />
                          <span className="text-xs text-gray-500 dark:text-zinc-400" data-testid={`text-service-status-${index}`}>
                            {getStatusLabel(service.status)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <StatusIcon
                      className={`h-5 w-5 shrink-0 ${service.status === "healthy" ? "text-emerald-500" : "text-amber-500"}`}
                      data-testid={`icon-service-status-${index}`}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gray-50 dark:bg-zinc-800/60 rounded-lg p-3 border border-gray-100 dark:border-zinc-700/50">
                      <p className="text-[10px] uppercase tracking-wide font-medium text-gray-400 dark:text-zinc-500 mb-0.5">
                        Uptime
                      </p>
                      <p className="text-sm font-bold text-gray-800 dark:text-zinc-100" data-testid={`text-service-uptime-${index}`}>
                        {service.uptime}
                      </p>
                    </div>
                    <div className="bg-gray-50 dark:bg-zinc-800/60 rounded-lg p-3 border border-gray-100 dark:border-zinc-700/50">
                      <p className="text-[10px] uppercase tracking-wide font-medium text-gray-400 dark:text-zinc-500 mb-0.5">
                        Avg Latency
                      </p>
                      <p className="text-sm font-bold text-gray-800 dark:text-zinc-100" data-testid={`text-service-latency-${index}`}>
                        {service.latency}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      <motion.div variants={fadeIn}>
        <h2 className="text-sm font-bold text-gray-700 dark:text-zinc-200 mb-4 flex items-center gap-2" data-testid="text-section-audit-logs">
          <Terminal className="h-4 w-4 text-gray-500 dark:text-zinc-400" />
          System Audit Logs
        </h2>
        <div
          className="bg-zinc-900 dark:bg-black rounded-2xl border border-zinc-700 dark:border-zinc-800 p-5 font-mono text-xs leading-relaxed overflow-x-auto"
          data-testid="block-audit-logs"
        >
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-zinc-700 dark:border-zinc-700">
            <span className="inline-block h-3 w-3 rounded-full bg-red-500" />
            <span className="inline-block h-3 w-3 rounded-full bg-amber-500" />
            <span className="inline-block h-3 w-3 rounded-full bg-emerald-500" />
            <span className="text-zinc-500 ml-2 text-[11px]">system-logs — scheduler.service</span>
          </div>
          <div className="space-y-1.5">
            {auditLogs.map((log, i) => (
              <div key={i} className="flex gap-2 flex-wrap" data-testid={`log-entry-${i}`}>
                <span className="text-zinc-500 shrink-0">{log.time}</span>
                <LogLevelBadge level={log.level} />
                <span className="text-zinc-300">{log.msg}</span>
              </div>
            ))}
            <div className="mt-3 pt-2 border-t border-zinc-700/60">
              <span className="text-emerald-400 animate-pulse">_</span>
              <span className="text-zinc-500 ml-1">awaiting next event...</span>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
