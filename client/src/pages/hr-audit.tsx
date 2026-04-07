import { useState } from "react";
import { motion } from "framer-motion";
import {
  Search,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Lock,
  FileSearch,
  UserX,
  Award,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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

interface AuditResult {
  blacklist: {
    found: boolean;
    name: string;
    idMasked: string;
    reason: string;
  };
  lifeguard: {
    valid: boolean;
    qualification: string;
    expiry: string;
    status: string;
  };
}

export default function HrAuditPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [auditResult, setAuditResult] = useState<AuditResult | null>(null);
  const [auditError, setAuditError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    setAuditError(null);
    setAuditResult(null);
    try {
      const res = await fetch(`/api/hr-audit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: searchQuery.trim() }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: "查詢失敗" }));
        setAuditError(err.message || `HTTP ${res.status}`);
      } else {
        const data = await res.json();
        setAuditResult(data);
      }
    } catch {
      setAuditError("無法連線至稽核 API，請確認後端是否已接入");
    } finally {
      setIsSearching(false);
      setHasSearched(true);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch();
  };

  return (
    <div className="h-full overflow-y-auto">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-4xl mx-auto px-6 py-8 space-y-8"
      >
        <motion.div variants={fadeIn}>
          <div className="flex items-center gap-3 mb-1">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600">
              <FileSearch className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-foreground" data-testid="text-page-title">
                HR 與權限稽核
              </h1>
              <p className="text-sm text-muted-foreground">
                人事查核系統 — 介接體育署 API + Ragic 慎用名單
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div variants={cardVariants}>
          <div
            className="vercel-card p-6"
            data-testid="card-search"
          >
            <div className="flex items-center gap-2 mb-4">
              <Lock className="h-4 w-4 text-amber-500" />
              <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wide">
                授權查詢介面
              </span>
              <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300">
                僅限 7 位高管授權
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="輸入 [面試+身分證字號] 進行全網稽核 (僅限 7 位高管授權)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="pl-10 bg-muted/60 border text-sm"
                  data-testid="input-search"
                />
              </div>
              <Button
                onClick={handleSearch}
                disabled={!searchQuery.trim() || isSearching}
                data-testid="button-search"
              >
                {isSearching ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    查詢中
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Search className="h-4 w-4" />
                    執行稽核
                  </span>
                )}
              </Button>
            </div>

            <div className="mt-3 flex items-center gap-2 text-[11px] text-muted-foreground">
              <AlertTriangle className="h-3 w-3" />
              <span>嚴格格式：「面試」+「身分證字號」（不含括號且無空格）</span>
            </div>
          </div>
        </motion.div>

        {hasSearched && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-5"
          >
            <motion.div variants={fadeIn}>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-semibold text-muted-foreground" data-testid="text-results-label">
                  稽核結果
                </span>
                <span className="text-xs text-muted-foreground">
                  — 查詢指令：{searchQuery}
                </span>
              </div>
            </motion.div>

            {auditError && (
              <motion.div variants={cardVariants}>
                <div className="bg-amber-50 dark:bg-amber-950/20 rounded-lg border-2 border-amber-200 dark:border-amber-800/50 p-6 text-center" data-testid="card-audit-error">
                  <div className="flex justify-center mb-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/50">
                      <AlertTriangle className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                    </div>
                  </div>
                  <p className="text-sm font-semibold text-amber-700 dark:text-amber-300 mb-1">稽核 API 尚未接入</p>
                  <p className="text-xs text-amber-500 dark:text-amber-400/70">{auditError}</p>
                  <p className="text-xs text-muted-foreground mt-2">待體育署 API 與 Ragic 慎用名單介接完成後即可使用</p>
                </div>
              </motion.div>
            )}

            {auditResult && (
              <>
                <motion.div variants={cardVariants}>
                  <div
                    className={`${auditResult.blacklist.found ? "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800/50" : "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/50"} rounded-lg border-2 p-6`}
                    data-testid="card-blacklist-result"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${auditResult.blacklist.found ? "bg-red-100 dark:bg-red-900/50" : "bg-emerald-100 dark:bg-emerald-900/50"}`}>
                        <ShieldAlert className={`h-5 w-5 ${auditResult.blacklist.found ? "text-red-600 dark:text-red-400" : "text-emerald-600 dark:text-emerald-400"}`} />
                      </div>
                      <div>
                        <h3 className={`text-sm font-semibold ${auditResult.blacklist.found ? "text-red-700 dark:text-red-300" : "text-emerald-700 dark:text-emerald-300"}`} data-testid="text-blacklist-title">
                          慎用名單檢核結果
                        </h3>
                        <p className={`text-xs ${auditResult.blacklist.found ? "text-red-500/80 dark:text-red-400/60" : "text-emerald-500/80 dark:text-emerald-400/60"}`}>Ragic 慎用名單資料庫比對</p>
                      </div>
                      <div className="ml-auto">
                        <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold border ${auditResult.blacklist.found ? "bg-red-100 text-red-700 dark:bg-red-900/60 dark:text-red-300 border-red-200 dark:border-red-800/50" : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/50"}`}>
                          {auditResult.blacklist.found ? <UserX className="h-3.5 w-3.5" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                          {auditResult.blacklist.found ? "命中" : "未命中"}
                        </span>
                      </div>
                    </div>
                    {auditResult.blacklist.found && (
                      <div className="bg-card/80 rounded-xl p-5 border border-red-200/60 dark:border-red-800/30 space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div>
                            <p className="text-[11px] font-medium text-red-400 dark:text-red-500 uppercase tracking-wide mb-1">姓名</p>
                            <p className="text-sm font-semibold text-foreground" data-testid="text-blacklist-name">{auditResult.blacklist.name}</p>
                          </div>
                          <div>
                            <p className="text-[11px] font-medium text-red-400 dark:text-red-500 uppercase tracking-wide mb-1">身分證</p>
                            <p className="text-sm font-semibold text-foreground font-mono" data-testid="text-blacklist-id">{auditResult.blacklist.idMasked}</p>
                          </div>
                          <div>
                            <p className="text-[11px] font-medium text-red-400 dark:text-red-500 uppercase tracking-wide mb-1">緣由</p>
                            <p className="text-sm font-semibold text-red-700 dark:text-red-300" data-testid="text-blacklist-reason">{auditResult.blacklist.reason}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>

                <motion.div variants={cardVariants}>
                  <div
                    className={`${auditResult.lifeguard.valid ? "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/50" : "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800/50"} rounded-lg border-2 p-6`}
                    data-testid="card-lifeguard-result"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${auditResult.lifeguard.valid ? "bg-emerald-100 dark:bg-emerald-900/50" : "bg-red-100 dark:bg-red-900/50"}`}>
                        <ShieldCheck className={`h-5 w-5 ${auditResult.lifeguard.valid ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`} />
                      </div>
                      <div>
                        <h3 className={`text-sm font-semibold ${auditResult.lifeguard.valid ? "text-emerald-700 dark:text-emerald-300" : "text-red-700 dark:text-red-300"}`} data-testid="text-lifeguard-title">
                          體育署救生員證照查核
                        </h3>
                        <p className={`text-xs ${auditResult.lifeguard.valid ? "text-emerald-500/80 dark:text-emerald-400/60" : "text-red-500/80 dark:text-red-400/60"}`}>體育署 API 即時驗證</p>
                      </div>
                      <div className="ml-auto">
                        <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold border ${auditResult.lifeguard.valid ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/50" : "bg-red-100 text-red-700 dark:bg-red-900/60 dark:text-red-300 border-red-200 dark:border-red-800/50"}`}>
                          {auditResult.lifeguard.valid ? <CheckCircle2 className="h-3.5 w-3.5" /> : <AlertTriangle className="h-3.5 w-3.5" />}
                          {auditResult.lifeguard.valid ? "通過" : "未通過"}
                        </span>
                      </div>
                    </div>
                    <div className={`bg-card/80 rounded-xl p-5 border ${auditResult.lifeguard.valid ? "border-emerald-200/60 dark:border-emerald-800/30" : "border-red-200/60 dark:border-red-800/30"} space-y-3`}>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <p className="text-[11px] font-medium text-emerald-400 dark:text-emerald-500 uppercase tracking-wide mb-1">資格</p>
                          <p className="text-sm font-semibold text-foreground flex items-center gap-1.5" data-testid="text-lifeguard-qualification">
                            <Award className="h-4 w-4 text-emerald-500" />
                            {auditResult.lifeguard.qualification}
                          </p>
                        </div>
                        <div>
                          <p className="text-[11px] font-medium text-emerald-400 dark:text-emerald-500 uppercase tracking-wide mb-1">效期</p>
                          <p className="text-sm font-semibold text-foreground" data-testid="text-lifeguard-expiry">{auditResult.lifeguard.expiry}</p>
                        </div>
                        <div>
                          <p className="text-[11px] font-medium text-emerald-400 dark:text-emerald-500 uppercase tracking-wide mb-1">狀態</p>
                          <p className={`text-sm font-semibold flex items-center gap-1.5 ${auditResult.lifeguard.valid ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`} data-testid="text-lifeguard-status">
                            {auditResult.lifeguard.valid ? <CheckCircle2 className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
                            {auditResult.lifeguard.status}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </>
            )}
          </motion.div>
        )}

        {!hasSearched && (
          <motion.div variants={fadeIn} className="text-center py-16">
            <div className="flex justify-center mb-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-muted">
                <FileSearch className="h-8 w-8 text-muted-foreground/60" />
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-1" data-testid="text-empty-state">
              輸入查詢指令以開始稽核
            </p>
            <p className="text-xs text-muted-foreground/60">
              系統將同時比對慎用名單與救生員證照資料庫
            </p>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
