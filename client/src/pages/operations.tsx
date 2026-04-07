import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Activity,
  Gauge,
  ShieldAlert,
  RefreshCw,
  Inbox,
  Loader2,
  AlertTriangle,
  Building2,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const BASE_URL = "https://line-bot-assistant-ronchen2.replit.app";

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

interface VenueData {
  venue: string;
  groupId: string;
  features: string[];
  schedules: { time: string; label: string }[];
}

export default function OperationsPage() {
  const [venues, setVenues] = useState<VenueData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`${BASE_URL}/api/admin/dashboard/venue-automations`, {
        headers: { Accept: "application/json" },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const ct = res.headers.get("content-type") || "";
      if (!ct.includes("application/json")) throw new Error("回傳非 JSON 格式");
      const data = await res.json();
      const venueList = Array.isArray(data) ? data : data.venues || [];
      setVenues(venueList);
    } catch (err: any) {
      setError(err.message || "無法載入場館資料");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const totalSchedules = venues.reduce((sum, v) => sum + (v.schedules?.length || 0), 0);
  const totalFeatures = venues.reduce((sum, v) => sum + (v.features?.length || 0), 0);

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="p-6 space-y-6 max-w-7xl mx-auto"
      data-testid="page-operations"
    >
      <motion.div variants={fadeIn} className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Activity className="h-5 w-5 text-indigo-500" />
            <h1 className="text-lg font-semibold text-foreground" data-testid="text-page-title">
              跨館資源監控
            </h1>
          </div>
          <p className="text-sm text-muted-foreground ml-7" data-testid="text-page-subtitle">
            即時監控所有場館自動化排程與功能模組
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchData} disabled={isLoading} data-testid="button-refresh">
          <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${isLoading ? "animate-spin" : ""}`} />
          重新整理
        </Button>
      </motion.div>

      {isLoading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 text-gray-400 animate-spin" />
          <span className="ml-2 text-sm text-muted-foreground">載入場館資料中...</span>
        </div>
      )}

      {error && !isLoading && (
        <motion.div variants={fadeIn} className="vercel-card border-red-200 dark:border-red-800/50 p-8 text-center">
          <AlertTriangle className="h-8 w-8 text-red-400 mx-auto mb-3" />
          <p className="text-sm font-semibold text-foreground mb-1">無法載入場館資料</p>
          <p className="text-xs text-muted-foreground">{error}</p>
        </motion.div>
      )}

      {!isLoading && !error && venues.length === 0 && (
        <motion.div variants={fadeIn} className="vercel-card p-12 text-center">
          <Inbox className="h-12 w-12 text-muted-foreground/60 mx-auto mb-3" />
          <p className="text-sm font-semibold text-muted-foreground mb-1">尚無場館資料</p>
          <p className="text-xs text-muted-foreground">場館自動化排程資料將於 API 接入後自動顯示</p>
        </motion.div>
      )}

      {!isLoading && !error && venues.length > 0 && (
        <>
          <motion.div variants={fadeIn} className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="vercel-card p-4 text-center">
              <p className="text-2xl font-semibold text-indigo-600 dark:text-indigo-400" data-testid="text-kpi-venues">{venues.length}</p>
              <p className="text-xs text-muted-foreground mt-0.5">場館數</p>
            </div>
            <div className="vercel-card p-4 text-center">
              <p className="text-2xl font-semibold text-blue-600 dark:text-blue-400" data-testid="text-kpi-features">{totalFeatures}</p>
              <p className="text-xs text-muted-foreground mt-0.5">啟用功能</p>
            </div>
            <div className="vercel-card p-4 text-center">
              <p className="text-2xl font-semibold text-amber-600 dark:text-amber-400" data-testid="text-kpi-schedules">{totalSchedules}</p>
              <p className="text-xs text-muted-foreground mt-0.5">排程數</p>
            </div>
            <div className="vercel-card p-4 text-center">
              <p className="text-2xl font-semibold text-emerald-600 dark:text-emerald-400" data-testid="text-kpi-avg-features">{venues.length > 0 ? (totalFeatures / venues.length).toFixed(1) : "0"}</p>
              <p className="text-xs text-muted-foreground mt-0.5">平均功能/館</p>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {venues.map((venue, idx) => (
              <motion.div key={venue.groupId || idx} variants={cardVariants}>
                <div className="vercel-card p-5" data-testid={`card-venue-${idx}`}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-900/50">
                      <Building2 className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate" data-testid={`text-venue-name-${idx}`}>
                        {venue.venue}
                      </p>
                      <p className="text-[10px] text-muted-foreground font-mono">{venue.groupId?.slice(0, 12)}...</p>
                    </div>
                    <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 rounded-full px-2 py-0.5">
                      {venue.features?.length || 0} 功能
                    </span>
                  </div>

                  {venue.features && venue.features.length > 0 && (
                    <div className="mb-3">
                      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-2">啟用功能</p>
                      <div className="flex flex-wrap gap-1.5">
                        {venue.features.map((f, fi) => (
                          <span key={fi} className="text-[10px] font-medium text-gray-600 dark:text-zinc-300 bg-muted rounded-lg px-2 py-1 border border" data-testid={`badge-feature-${idx}-${fi}`}>
                            {f}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {venue.schedules && venue.schedules.length > 0 && (
                    <div>
                      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-2">排程表</p>
                      <div className="grid grid-cols-1 gap-1">
                        {venue.schedules.map((s, si) => (
                          <div key={si} className="flex items-center gap-2 text-[11px] text-muted-foreground py-0.5" data-testid={`schedule-${idx}-${si}`}>
                            <span className="font-mono font-semibold text-foreground w-20 shrink-0">{s.time}</span>
                            <span className="truncate">{s.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </>
      )}
    </motion.div>
  );
}
