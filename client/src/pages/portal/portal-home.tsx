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
} from "lucide-react";
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
      className={`bg-white rounded-xl p-6 relative overflow-hidden group ${className}`}
      style={{ boxShadow: "0 30px 40px -20px rgba(25,28,30,0.06)" }}
      data-testid={testId}
    >
      <div
        className="absolute top-0 right-0 w-24 h-24 rounded-bl-full -mr-6 -mt-6 transition-transform group-hover:scale-110"
        style={{ background: `${accentColor}08` }}
      />
      <div className="flex items-center gap-2.5 mb-4">
        <Icon className="h-5 w-5" style={{ color: accentColor }} />
        <h2
          className="text-lg font-bold tracking-tight"
          style={{ fontFamily: "'Manrope', sans-serif", color: "#001d42" }}
        >
          {title}
        </h2>
      </div>
      {children}
    </div>
  );
}

function AnnouncementItem({ item }: { item: AnnouncementCandidate }) {
  const priority = derivePriority(item);
  const ps = PRIORITY_STYLES[priority];
  return (
    <div
      className={`${ps.bg} border ${ps.border} rounded-lg p-3 transition-all hover:shadow-sm cursor-pointer`}
      data-testid={`portal-announcement-${item.id}`}
    >
      <div className="flex items-start gap-2.5">
        <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${ps.dot}`} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <p className="text-sm font-semibold truncate" style={{ color: "#001d42" }}>
              {item.title || "(無標題)"}
            </p>
            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-white/60" style={{ color: "#006b60" }}>
              {TYPE_LABELS[item.candidateType] || item.candidateType}
            </span>
          </div>
          {item.summary && (
            <p className="text-xs text-gray-600 line-clamp-2 mb-1">{item.summary}</p>
          )}
          <div className="flex items-center gap-3 text-[10px] text-gray-400">
            <span className="flex items-center gap-0.5">
              <Calendar className="h-3 w-3" />
              {formatDate(item.detectedAt)}
            </span>
            {item.displayName && (
              <span className="flex items-center gap-0.5">
                {priority === "critical" ? (
                  <Star className="h-3 w-3 fill-amber-400 text-amber-500" />
                ) : (
                  <Users className="h-3 w-3" />
                )}
                {item.displayName}
              </span>
            )}
          </div>
        </div>
        <ChevronRight className="h-4 w-4 text-gray-300 shrink-0 mt-1" />
      </div>
    </div>
  );
}

function MustReadSection({ facilityName }: { facilityName: string }) {
  const { data, isLoading, isError } = useQuery<AnnouncementCandidatesResponse>({
    queryKey: ["/api/announcement-candidates", { status: "approved", facilityName, candidateType: "rule", pageSize: 5 }],
    queryFn: async () => {
      const params = new URLSearchParams({
        status: "approved",
        facilityName,
        candidateType: "rule",
        pageSize: "5",
      });
      const res = await fetch(`/api/announcement-candidates?${params}`);
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
  });

  const items = data?.candidates || data?.items || [];

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
      {!isLoading && !isError && items.length === 0 && (
        <p className="text-sm text-gray-400 py-4">目前沒有待讀公告</p>
      )}
      <div className="space-y-2">
        {items.map((item) => (
          <AnnouncementItem key={item.id} item={item} />
        ))}
      </div>
    </SectionCard>
  );
}

function GroupAnnouncementsSection({ facilityName }: { facilityName: string }) {
  const { data, isLoading, isError } = useQuery<AnnouncementCandidatesResponse>({
    queryKey: ["/api/announcement-candidates", { status: "approved", facilityName, pageSize: 6 }],
    queryFn: async () => {
      const params = new URLSearchParams({
        status: "approved",
        facilityName,
        pageSize: "6",
      });
      const res = await fetch(`/api/announcement-candidates?${params}`);
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
  });

  const items = data?.candidates || data?.items || [];

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
        {items.map((item) => (
          <AnnouncementItem key={item.id} item={item} />
        ))}
      </div>
    </SectionCard>
  );
}

function CampaignsSection({ facilityName }: { facilityName: string }) {
  const { data, isLoading, isError } = useQuery<AnnouncementCandidatesResponse>({
    queryKey: ["/api/announcement-candidates", { status: "approved", facilityName, candidateType: "campaign", pageSize: 4 }],
    queryFn: async () => {
      const params = new URLSearchParams({
        status: "approved",
        facilityName,
        candidateType: "campaign",
        pageSize: "4",
      });
      const res = await fetch(`/api/announcement-candidates?${params}`);
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
  });

  const items = data?.candidates || data?.items || [];

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
        {items.map((item) => (
          <AnnouncementItem key={item.id} item={item} />
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
                className="text-xs font-mono text-[#006b60] hover:underline"
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

interface PortalHomeProps {
  facilityKey: string;
}

export default function PortalHome({ facilityKey }: PortalHomeProps) {
  const config = getFacilityConfig(facilityKey);
  const { auth } = usePortalAuth();

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

  return (
    <div className="px-4 md:px-8 py-6 pb-20 md:pb-8">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <MapPin className="h-4 w-4" style={{ color: "#1CB4A3" }} />
          <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#1CB4A3", fontFamily: "'Inter', sans-serif" }}>
            {config.shortName}
          </span>
        </div>
        <h1
          className="text-2xl md:text-3xl font-black leading-tight mb-1"
          style={{ fontFamily: "'Manrope', sans-serif", color: "#001d42" }}
          data-testid="text-portal-home-title"
        >
          {auth ? `${auth.name}，你好` : "歡迎"}
        </h1>
        <p className="text-sm text-gray-500" style={{ fontFamily: "'Inter', sans-serif" }}>
          {config.facilityName} — 值班資訊總覽
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-6">
          {config.sections.mustRead && (
            <MustReadSection facilityName={config.facilityName} />
          )}
          {config.sections.groupAnnouncements && (
            <GroupAnnouncementsSection facilityName={config.facilityName} />
          )}
          {config.sections.handover && <HandoverSection />}
        </div>

        <div className="lg:col-span-4 space-y-6">
          {config.sections.campaigns && (
            <CampaignsSection facilityName={config.facilityName} />
          )}
          {config.sections.onDutyStaff && <OnDutySection />}
          {config.sections.contacts && <ContactsSection config={config} />}
        </div>
      </div>
    </div>
  );
}
