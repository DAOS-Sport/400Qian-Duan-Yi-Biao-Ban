import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  FileText,
  AlertTriangle,
  Users,
  ClipboardList,
  Megaphone,
  Phone,
  ChevronRight,
  Loader2,
  AlertCircle,
  Star,
  Shield,
  Calendar,
  MapPin,
  X,
  User,
  Ticket,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { getFacilityConfig } from "@/config/facility-configs";
import { usePortalAuth } from "@/hooks/use-bound-facility";
import type { AnnouncementCandidate, AnnouncementCandidatesResponse } from "@/types/announcement";
import type { FacilityConfig } from "@/types/portal";

function derivePriority(c: AnnouncementCandidate): "critical" | "high" | "normal" | "low" {
  const conf = typeof c.confidence === "string" ? parseFloat(c.confidence) : c.confidence;
  const isVip = c.reasoningTags?.some((t) => t.includes("特別關注")) || c.status === "vip_chat";
  if (isVip) return "critical";
  if (c.candidateType === "rule" && conf >= 0.8) return "high";
  if (conf >= 0.8) return "high";
  if (conf >= 0.6) return "normal";
  return "low";
}

const PRIORITY_STYLES: Record<string, { bg: string; border: string; dot: string; label: string }> = {
  critical: { bg: "bg-red-50", border: "border-red-200", dot: "bg-red-500", label: "緊急" },
  high: { bg: "bg-amber-50", border: "border-amber-200", dot: "bg-amber-500", label: "重要" },
  normal: { bg: "bg-blue-50", border: "border-blue-200", dot: "bg-blue-500", label: "一般" },
  low: { bg: "bg-gray-50", border: "border-gray-200", dot: "bg-gray-400", label: "低" },
};

const TYPE_LABELS: Record<string, string> = {
  rule: "規則/SOP",
  notice: "通知公告",
  campaign: "活動",
  discount: "優惠折扣",
  script: "標準說詞",
};

function formatDate(dateStr: string | undefined) {
  if (!dateStr) return "";
  try {
    return new Date(dateStr).toLocaleDateString("zh-TW", { timeZone: "Asia/Taipei", month: "numeric", day: "numeric" });
  } catch {
    return dateStr;
  }
}

function formatFullDate(dateStr: string | undefined) {
  if (!dateStr) return "-";
  try {
    return new Date(dateStr).toLocaleString("zh-TW", { timeZone: "Asia/Taipei", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" });
  } catch {
    return dateStr;
  }
}

function SectionCard({
  icon: Icon,
  title,
  accentColor,
  children,
  className = "",
  testId,
}: {
  icon: typeof FileText;
  title: string;
  accentColor: string;
  children: React.ReactNode;
  className?: string;
  testId: string;
}) {
  return (
    <div
      className={`portal-card p-6 relative overflow-hidden group ${className}`}
      data-testid={testId}
    >
      <div
        className="absolute top-0 right-0 w-24 h-24 rounded-bl-full -mr-6 -mt-6 transition-transform group-hover:scale-110"
        style={{ background: `${accentColor}08` }}
      />
      <div className="flex items-center gap-2.5 mb-4">
        <Icon className="h-5 w-5" style={{ color: accentColor }} />
        <h2 className="text-lg font-bold tracking-tight" style={{ color: "#001d42" }}>
          {title}
        </h2>
      </div>
      {children}
    </div>
  );
}

function AnnouncementItem({
  item,
  onClick,
}: {
  item: AnnouncementCandidate;
  onClick: () => void;
}) {
  const priority = derivePriority(item);
  const ps = PRIORITY_STYLES[priority];
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left ${ps.bg} border ${ps.border} rounded-lg p-3 transition-all hover:shadow-sm cursor-pointer`}
      data-testid={`portal-announcement-${item.id}`}
    >
      <div className="flex items-start gap-2.5">
        <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${ps.dot}`} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <p className="text-sm font-semibold truncate" style={{ color: "#001d42" }}>
              {item.title || "(無標題)"}
            </p>
            <span className="portal-pill" style={{ color: "#006b60", background: "rgba(28,180,163,0.1)" }}>
              {TYPE_LABELS[item.candidateType] || item.candidateType}
            </span>
          </div>
          {item.summary && (
            <p className="text-xs text-gray-600 line-clamp-2 mb-1">{item.summary}</p>
          )}
          <div className="flex items-center gap-3 text-[10px] text-gray-400 flex-wrap">
            {(item.groupName || item.groupId) && (
              <span className="flex items-center gap-0.5 portal-pill bg-blue-50 text-blue-600">
                <MapPin className="h-3 w-3" />
                {item.groupName || item.groupId}
              </span>
            )}
            <span className="flex items-center gap-0.5">
              <Calendar className="h-3 w-3" />
              {formatDate(item.detectedAt)}
            </span>
            {item.displayName && (
              <span className="flex items-center gap-0.5">
                {priority === "critical" ? (
                  <Star className="h-3 w-3 fill-amber-400 text-amber-500" />
                ) : (
                  <User className="h-3 w-3" />
                )}
                {item.displayName}
              </span>
            )}
          </div>
        </div>
        <ChevronRight className="h-4 w-4 text-gray-300 shrink-0 mt-1" />
      </div>
    </button>
  );
}

function AnnouncementDetailSheet({
  candidate,
  open,
  onClose,
}: {
  candidate: AnnouncementCandidate | null;
  open: boolean;
  onClose: () => void;
}) {
  if (!candidate) return null;
  const priority = derivePriority(candidate);
  const ps = PRIORITY_STYLES[priority];

  return (
    <Sheet open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <SheetContent
        className="portal w-full sm:max-w-lg overflow-y-auto"
        style={{ background: "var(--portal-bg, #f7f9fb)" }}
        data-testid="sheet-announcement-detail"
      >
        <SheetHeader>
          <SheetTitle className="text-lg font-bold pr-6" style={{ color: "#001d42" }} data-testid="text-sheet-title">
            {candidate.title || "(無標題)"}
          </SheetTitle>
        </SheetHeader>

        <div className="mt-4 space-y-4">
          <div className="flex flex-wrap gap-2">
            <span className={`portal-pill ${ps.bg} ${ps.border} border`}>
              <span className={`w-1.5 h-1.5 rounded-full mr-1 ${ps.dot}`} />
              {ps.label}
            </span>
            <span className="portal-pill" style={{ color: "#006b60", background: "rgba(28,180,163,0.1)" }}>
              {TYPE_LABELS[candidate.candidateType] || candidate.candidateType}
            </span>
            {candidate.scopeType && (
              <span className="portal-pill bg-blue-50 text-blue-700">
                <Shield className="h-3 w-3 mr-0.5" />
                {candidate.scopeType}
              </span>
            )}
          </div>

          <div className="rounded-lg p-3 border" style={{ background: "#eceef0", borderColor: "#c4c6cf" }}>
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="h-4 w-4" style={{ color: "#1CB4A3" }} />
              <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#44474e" }}>來源</span>
            </div>
            <p className="text-sm font-semibold" style={{ color: "#001d42" }}>{candidate.facilityName || "未知場館"}</p>
            {candidate.displayName && (
              <p className="text-xs mt-1" style={{ color: "#44474e" }}>
                發送者: {candidate.displayName}
              </p>
            )}
            <p className="text-[10px] mt-1" style={{ color: "#74777f" }}>
              {formatFullDate(candidate.detectedAt)}
            </p>
          </div>

          {candidate.summary && (
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color: "#74777f" }}>摘要</p>
              <p className="text-sm leading-relaxed" style={{ color: "#191c1e" }}>{candidate.summary}</p>
            </div>
          )}

          {candidate.recommendedAction && (
            <div className="rounded-lg p-3 border border-blue-200 bg-blue-50">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-blue-600 mb-1">建議動作</p>
              <p className="text-sm" style={{ color: "#191c1e" }}>{candidate.recommendedAction}</p>
            </div>
          )}

          {candidate.badExample && (
            <div className="rounded-lg p-3 border border-red-200 bg-red-50">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-red-600 mb-1">不當範例</p>
              <p className="text-sm" style={{ color: "#191c1e" }}>{candidate.badExample}</p>
            </div>
          )}

          {candidate.recommendedReply && (
            <div className="rounded-lg p-3 border border-emerald-200 bg-emerald-50">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-600 mb-1">建議回覆</p>
              <p className="text-sm" style={{ color: "#191c1e" }}>{candidate.recommendedReply}</p>
            </div>
          )}

          {candidate.originalText && (
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color: "#74777f" }}>原始訊息</p>
              <div className="rounded-lg p-3 border" style={{ background: "#f2f4f6", borderColor: "#c4c6cf" }}>
                <p className="text-sm whitespace-pre-wrap leading-relaxed" style={{ color: "#191c1e" }}>{candidate.originalText}</p>
              </div>
            </div>
          )}

          {candidate.reasoningTags && candidate.reasoningTags.length > 0 && (
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color: "#74777f" }}>標籤</p>
              <div className="flex flex-wrap gap-1">
                {candidate.reasoningTags.map((tag, i) => (
                  <span key={i} className="portal-pill bg-gray-100 text-gray-600">{tag}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

function useFilteredAnnouncements(
  facilityName: string,
  candidateTypes: string[],
  pageSize: number,
  searchTerm: string,
) {
  const params: Record<string, string> = {
    status: "approved",
    facilityName,
    pageSize: String(pageSize),
  };
  if (candidateTypes.length === 1) {
    params.candidateType = candidateTypes[0];
  }

  const query = useQuery<AnnouncementCandidatesResponse>({
    queryKey: ["/api/announcement-candidates", params],
    queryFn: async () => {
      const sp = new URLSearchParams(params);
      const res = await fetch(`/api/announcement-candidates?${sp}`);
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
  });

  let items = query.data?.candidates || query.data?.items || [];

  if (candidateTypes.length > 1) {
    items = items.filter((c) => candidateTypes.includes(c.candidateType));
  }

  if (searchTerm) {
    const lower = searchTerm.toLowerCase();
    items = items.filter((c) =>
      (c.title && c.title.toLowerCase().includes(lower)) ||
      (c.summary && c.summary.toLowerCase().includes(lower)) ||
      (c.originalText && c.originalText.toLowerCase().includes(lower)) ||
      (c.displayName && c.displayName.toLowerCase().includes(lower))
    );
  }

  return { ...query, items };
}

function MustReadSection({
  facilityName,
  searchTerm,
  onSelect,
}: {
  facilityName: string;
  searchTerm: string;
  onSelect: (c: AnnouncementCandidate) => void;
}) {
  const { items, isLoading, isError } = useFilteredAnnouncements(
    facilityName, ["rule", "notice", "script"], 20, searchTerm,
  );

  const highPriorityItems = items.filter((c) => {
    const p = derivePriority(c);
    return p === "critical" || p === "high";
  });

  return (
    <SectionCard icon={Shield} title="必讀公告 / SOP" accentColor="#e53e3e" testId="section-must-read">
      {isLoading && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
        </div>
      )}
      {isError && (
        <div className="flex items-center gap-2 py-4 text-sm text-gray-500">
          <AlertCircle className="h-4 w-4" />
          <span>暫時無法載入</span>
        </div>
      )}
      {!isLoading && !isError && highPriorityItems.length === 0 && (
        <p className="text-sm text-gray-400 py-4">目前沒有待讀公告</p>
      )}
      <div className="space-y-2">
        {highPriorityItems.slice(0, 5).map((item) => (
          <AnnouncementItem key={item.id} item={item} onClick={() => onSelect(item)} />
        ))}
      </div>
    </SectionCard>
  );
}

function GroupAnnouncementsSection({
  facilityName,
  searchTerm,
  onSelect,
}: {
  facilityName: string;
  searchTerm: string;
  onSelect: (c: AnnouncementCandidate) => void;
}) {
  const { items, isLoading, isError } = useFilteredAnnouncements(
    facilityName, ["rule", "notice", "script"], 10, searchTerm,
  );

  return (
    <SectionCard icon={Megaphone} title="群組重要公告" accentColor="#1CB4A3" testId="section-group-announcements">
      {isLoading && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
        </div>
      )}
      {isError && (
        <div className="flex items-center gap-2 py-4 text-sm text-gray-500">
          <AlertCircle className="h-4 w-4" />
          <span>暫時無法載入</span>
        </div>
      )}
      {!isLoading && !isError && items.length === 0 && (
        <p className="text-sm text-gray-400 py-4">目前沒有群組公告</p>
      )}
      <div className="space-y-2">
        {items.slice(0, 6).map((item) => (
          <AnnouncementItem key={item.id} item={item} onClick={() => onSelect(item)} />
        ))}
      </div>
    </SectionCard>
  );
}

function CampaignsSection({
  facilityName,
  searchTerm,
  onSelect,
}: {
  facilityName: string;
  searchTerm: string;
  onSelect: (c: AnnouncementCandidate) => void;
}) {
  const { items, isLoading, isError } = useFilteredAnnouncements(
    facilityName, ["campaign", "discount"], 6, searchTerm,
  );

  return (
    <SectionCard icon={Megaphone} title="活動 / 優惠" accentColor="#8DC63F" testId="section-campaigns">
      {isLoading && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
        </div>
      )}
      {isError && (
        <div className="flex items-center gap-2 py-4 text-sm text-gray-500">
          <AlertCircle className="h-4 w-4" />
          <span>暫時無法載入</span>
        </div>
      )}
      {!isLoading && !isError && items.length === 0 && (
        <p className="text-sm text-gray-400 py-4">目前沒有活動或優惠</p>
      )}
      <div className="space-y-2">
        {items.slice(0, 4).map((item) => (
          <AnnouncementItem key={item.id} item={item} onClick={() => onSelect(item)} />
        ))}
      </div>
    </SectionCard>
  );
}

function ContactsSection({ config }: { config: FacilityConfig }) {
  return (
    <SectionCard icon={Phone} title="重要聯絡窗口" accentColor="#006b60" testId="section-contacts">
      <div className="space-y-2">
        {config.contactPoints.map((cp, i) => (
          <div
            key={i}
            className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
            data-testid={`contact-${cp.type}`}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold"
                style={{ background: "#19335a" }}
              >
                {cp.label.charAt(0)}
              </div>
              <div>
                <p className="text-sm font-medium" style={{ color: "#001d42" }}>{cp.label}</p>
                <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">{cp.name}</p>
              </div>
            </div>
            {cp.phone && (
              <a
                href={`tel:${cp.phone}`}
                className="text-xs font-mono hover:underline"
                style={{ color: "#006b60" }}
                data-testid={`link-phone-${cp.type}`}
              >
                {cp.phone}
              </a>
            )}
          </div>
        ))}
      </div>
    </SectionCard>
  );
}

function OnDutySection() {
  return (
    <SectionCard icon={Users} title="今日值班人員" accentColor="#1CB4A3" testId="section-on-duty">
      <p className="text-sm text-gray-400 py-4 italic">
        打卡模組串接後自動顯示值班資訊
      </p>
    </SectionCard>
  );
}

function HandoverSection() {
  return (
    <SectionCard icon={ClipboardList} title="櫃台交接事項" accentColor="#8DC63F" testId="section-handover">
      <p className="text-sm text-gray-400 py-4 italic">
        交接紀錄將從群組訊息自動歸納
      </p>
    </SectionCard>
  );
}

function RentalSection() {
  return (
    <SectionCard icon={Ticket} title="場租管理" accentColor="#006b60" testId="section-rental">
      <p className="text-sm text-gray-400 py-4 italic">
        場租資訊串接後自動顯示
      </p>
    </SectionCard>
  );
}

interface PortalHomeProps {
  facilityKey: string;
  searchTerm?: string;
}

export default function PortalHome({ facilityKey, searchTerm = "" }: PortalHomeProps) {
  const config = getFacilityConfig(facilityKey);
  const { auth } = usePortalAuth();
  const [selectedCandidate, setSelectedCandidate] = useState<AnnouncementCandidate | null>(null);

  if (!config) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <AlertTriangle className="h-10 w-10 text-amber-400 mx-auto mb-3" />
          <p className="text-lg font-semibold" style={{ color: "#001d42" }}>找不到此場館</p>
          <p className="text-sm text-gray-500">請確認場館代碼是否正確</p>
        </div>
      </div>
    );
  }

  const handleSelect = (c: AnnouncementCandidate) => setSelectedCandidate(c);
  const handleCloseSheet = () => setSelectedCandidate(null);

  return (
    <div className="px-4 md:px-8 py-6 pb-20 md:pb-8">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <MapPin className="h-4 w-4" style={{ color: "#1CB4A3" }} />
          <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#1CB4A3" }}>
            {config.shortName}
          </span>
        </div>
        <h1
          className="text-2xl md:text-3xl font-black leading-tight mb-1"
          style={{ color: "#001d42" }}
          data-testid="text-portal-home-title"
        >
          {auth ? `${auth.name}，你好` : "歡迎"}
        </h1>
        <p className="text-sm text-gray-500">
          {config.facilityName} — 值班資訊總覽
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-6">
          {config.sections.mustRead && (
            <MustReadSection facilityName={config.facilityName} searchTerm={searchTerm} onSelect={handleSelect} />
          )}
          {config.sections.groupAnnouncements && (
            <GroupAnnouncementsSection facilityName={config.facilityName} searchTerm={searchTerm} onSelect={handleSelect} />
          )}
          {config.sections.handover && <HandoverSection />}
        </div>

        <div className="lg:col-span-4 space-y-6">
          {config.sections.campaigns && (
            <CampaignsSection facilityName={config.facilityName} searchTerm={searchTerm} onSelect={handleSelect} />
          )}
          {config.sections.onDutyStaff && <OnDutySection />}
          {config.sections.contacts && <ContactsSection config={config} />}
          {config.sections.rental && <RentalSection />}
        </div>
      </div>

      <AnnouncementDetailSheet
        candidate={selectedCandidate}
        open={!!selectedCandidate}
        onClose={handleCloseSheet}
      />
    </div>
  );
}
