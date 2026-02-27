import { motion } from "framer-motion";
import {
  AlertTriangle,
  Droplets,
  Thermometer,
  Wind,
  ShieldAlert,
  ShieldCheck,
  Activity,
  Gauge,
  Waves,
  CloudSun,
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

type AlertSeverity = "critical" | "warning" | "resolved";

interface AlertItem {
  id: string;
  icon: typeof AlertTriangle;
  title: string;
  description: string;
  severity: AlertSeverity;
  location: string;
  time: string;
}

const ALERT_STYLES: Record<AlertSeverity, { border: string; bg: string; iconColor: string; badge: string; badgeText: string; label: string }> = {
  critical: {
    border: "border-red-200 dark:border-red-800/50",
    bg: "bg-red-50/70 dark:bg-red-950/20",
    iconColor: "text-red-500 dark:text-red-400",
    badge: "bg-red-100 dark:bg-red-900/50",
    badgeText: "text-red-700 dark:text-red-300",
    label: "Critical",
  },
  warning: {
    border: "border-orange-200 dark:border-orange-800/50",
    bg: "bg-orange-50/70 dark:bg-orange-950/20",
    iconColor: "text-orange-500 dark:text-orange-400",
    badge: "bg-orange-100 dark:bg-orange-900/50",
    badgeText: "text-orange-700 dark:text-orange-300",
    label: "Warning",
  },
  resolved: {
    border: "border-emerald-200 dark:border-emerald-800/50",
    bg: "bg-emerald-50/70 dark:bg-emerald-950/20",
    iconColor: "text-emerald-500 dark:text-emerald-400",
    badge: "bg-emerald-100 dark:bg-emerald-900/50",
    badgeText: "text-emerald-700 dark:text-emerald-300",
    label: "Resolved",
  },
};

const ALERTS: AlertItem[] = [
  {
    id: "alert-1",
    icon: Wind,
    title: "高爾夫練習場：風速達 10m/s，建議暫停營運",
    description: "戶外運動園區風速已超過安全標準 (8m/s)，建議暫時停止高爾夫練習場對外開放。",
    severity: "warning",
    location: "駿斯-戶外運動園區",
    time: "10 分鐘前",
  },
  {
    id: "alert-2",
    icon: Droplets,
    title: "竹科泳池：PH 值 7.8 偏高",
    description: "水質 pH 偏高超過標準範圍 (6.5–7.5)，建議立即投入酸劑調整並於 30 分鐘後重新檢測。",
    severity: "critical",
    location: "駿斯-竹科戶外游泳池",
    time: "25 分鐘前",
  },
  {
    id: "alert-3",
    icon: Thermometer,
    title: "竹科泳池：水溫 29°C 正常範圍",
    description: "目前水溫處於標準範圍 (26–30°C)，無需調整。",
    severity: "resolved",
    location: "駿斯-竹科戶外游泳池",
    time: "1 小時前",
  },
];

interface ReadingItem {
  id: string;
  label: string;
  value: string;
  unit: string;
  icon: typeof Droplets;
  iconColor: string;
  status: "normal" | "warning" | "critical";
  location: string;
}

const STATUS_DOT: Record<string, string> = {
  normal: "bg-emerald-500",
  warning: "bg-orange-500",
  critical: "bg-red-500",
};

const READINGS: ReadingItem[] = [
  { id: "r1", label: "pH 值", value: "7.8", unit: "", icon: Droplets, iconColor: "text-blue-500 dark:text-blue-400", status: "critical", location: "竹科泳池" },
  { id: "r2", label: "餘氯", value: "1.2", unit: "ppm", icon: Waves, iconColor: "text-cyan-500 dark:text-cyan-400", status: "normal", location: "竹科泳池" },
  { id: "r3", label: "水溫", value: "29", unit: "°C", icon: Thermometer, iconColor: "text-rose-500 dark:text-rose-400", status: "normal", location: "竹科泳池" },
  { id: "r4", label: "風速", value: "10", unit: "m/s", icon: Wind, iconColor: "text-teal-500 dark:text-teal-400", status: "warning", location: "戶外運動園區" },
  { id: "r5", label: "氣溫", value: "32", unit: "°C", icon: CloudSun, iconColor: "text-amber-500 dark:text-amber-400", status: "normal", location: "戶外運動園區" },
  { id: "r6", label: "pH 值", value: "7.2", unit: "", icon: Droplets, iconColor: "text-blue-500 dark:text-blue-400", status: "normal", location: "三民館泳池" },
  { id: "r7", label: "餘氯", value: "0.9", unit: "ppm", icon: Waves, iconColor: "text-cyan-500 dark:text-cyan-400", status: "normal", location: "三民館泳池" },
  { id: "r8", label: "水溫", value: "28", unit: "°C", icon: Thermometer, iconColor: "text-rose-500 dark:text-rose-400", status: "normal", location: "三民館泳池" },
];

export default function OperationsPage() {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="p-6 space-y-6 max-w-7xl mx-auto"
      data-testid="page-operations"
    >
      <motion.div variants={fadeIn}>
        <div className="flex items-center gap-2 mb-1">
          <Activity className="h-5 w-5 text-indigo-500" />
          <h1 className="text-lg font-bold text-gray-800 dark:text-zinc-100" data-testid="text-page-title">
            跨館資源監控
          </h1>
        </div>
        <p className="text-sm text-gray-400 dark:text-zinc-500 ml-7" data-testid="text-page-subtitle">
          即時監控所有場館環境數據與警報狀態
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div variants={cardVariants} className="space-y-4">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-800 p-5" data-testid="card-alerts-section">
            <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
              <div className="flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-red-500" />
                <h2 className="text-sm font-bold text-gray-800 dark:text-zinc-100" data-testid="text-alerts-title">
                  現場環境警報 (Active Alerts)
                </h2>
              </div>
              <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300" data-testid="badge-alert-count">
                {ALERTS.filter(a => a.severity !== "resolved").length} 則待處理
              </span>
            </div>

            <div className="space-y-3">
              {ALERTS.map((alert) => {
                const style = ALERT_STYLES[alert.severity];
                const Icon = alert.icon;
                return (
                  <div
                    key={alert.id}
                    className={`rounded-xl border p-4 ${style.border} ${style.bg}`}
                    data-testid={`card-alert-${alert.id}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${alert.severity === "resolved" ? "bg-emerald-100 dark:bg-emerald-900/50" : alert.severity === "critical" ? "bg-red-100 dark:bg-red-900/50" : "bg-orange-100 dark:bg-orange-900/50"}`}>
                        <Icon className={`h-4 w-4 ${style.iconColor}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <p className="text-sm font-semibold text-gray-800 dark:text-zinc-100" data-testid={`text-alert-title-${alert.id}`}>
                            {alert.title}
                          </p>
                          <span className={`inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${style.badge} ${style.badgeText}`} data-testid={`badge-alert-severity-${alert.id}`}>
                            {alert.severity === "resolved" ? <ShieldCheck className="h-2.5 w-2.5 mr-0.5" /> : <AlertTriangle className="h-2.5 w-2.5 mr-0.5" />}
                            {style.label}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-zinc-400 leading-relaxed" data-testid={`text-alert-desc-${alert.id}`}>
                          {alert.description}
                        </p>
                        <div className="flex items-center gap-3 mt-2 flex-wrap">
                          <span className="text-[11px] text-gray-400 dark:text-zinc-500" data-testid={`text-alert-location-${alert.id}`}>
                            {alert.location}
                          </span>
                          <span className="text-[11px] text-gray-300 dark:text-zinc-600" data-testid={`text-alert-time-${alert.id}`}>
                            {alert.time}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>

        <motion.div variants={cardVariants}>
          <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-800 p-5 h-full" data-testid="card-readings-section">
            <div className="flex items-center gap-2 mb-4">
              <Gauge className="h-4 w-4 text-indigo-500" />
              <h2 className="text-sm font-bold text-gray-800 dark:text-zinc-100" data-testid="text-readings-title">
                即時水質與氣象回報
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {READINGS.map((reading) => {
                const Icon = reading.icon;
                return (
                  <div
                    key={reading.id}
                    className="flex items-center gap-3 rounded-xl bg-gray-50/80 dark:bg-zinc-800/40 border border-gray-100 dark:border-zinc-700/50 px-4 py-3"
                    data-testid={`card-reading-${reading.id}`}
                  >
                    <Icon className={`h-5 w-5 shrink-0 ${reading.iconColor}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs font-medium text-gray-500 dark:text-zinc-400 truncate" data-testid={`text-reading-label-${reading.id}`}>
                          {reading.label}
                        </p>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className={`h-2 w-2 rounded-full ${STATUS_DOT[reading.status]}`} data-testid={`status-dot-${reading.id}`} />
                          <span className="text-base font-bold text-gray-800 dark:text-zinc-100" data-testid={`text-reading-value-${reading.id}`}>
                            {reading.value}
                            {reading.unit && <span className="text-xs font-normal text-gray-400 dark:text-zinc-500 ml-0.5">{reading.unit}</span>}
                          </span>
                        </div>
                      </div>
                      <p className="text-[10px] text-gray-400 dark:text-zinc-500 mt-0.5" data-testid={`text-reading-location-${reading.id}`}>
                        {reading.location}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
