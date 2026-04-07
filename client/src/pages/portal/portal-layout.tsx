import { useState } from "react";
import { useLocation } from "wouter";
import {
  Home,
  Search,
  Bell,
  LogOut,
  Menu,
  X,
  Building2,
  FileText,
  Users,
  ClipboardList,
  Megaphone,
} from "lucide-react";
import { usePortalAuth } from "@/hooks/use-bound-facility";
import { getFacilityConfig } from "@/config/facility-configs";

interface PortalLayoutProps {
  children: (searchTerm: string) => React.ReactNode;
  facilityKey?: string;
}

const sidebarNavItems = [
  { label: "首頁", icon: Home, sectionId: "" },
  { label: "公告 / SOP", icon: FileText, sectionId: "section-must-read" },
  { label: "值班人員", icon: Users, sectionId: "section-on-duty" },
  { label: "櫃台交接", icon: ClipboardList, sectionId: "section-handover" },
  { label: "活動公告", icon: Megaphone, sectionId: "section-campaigns" },
];

function scrollToSection(sectionId: string) {
  if (!sectionId) {
    window.scrollTo({ top: 0, behavior: "smooth" });
    return;
  }
  const el = document.querySelector(`[data-testid="${sectionId}"]`);
  if (el) {
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

export default function PortalLayout({ children, facilityKey }: PortalLayoutProps) {
  const { auth, logout } = usePortalAuth();
  const [, navigate] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeSection, setActiveSection] = useState("");

  const config = facilityKey ? getFacilityConfig(facilityKey) : null;

  const handleLogout = () => {
    logout();
    navigate("/portal/login");
  };

  return (
    <div className="portal min-h-screen" style={{ background: "#f7f9fb" }}>
      <header
        className="fixed top-0 z-50 w-full flex items-center justify-between px-4 md:px-8 h-16"
        style={{
          background: "rgba(0,29,66,0.92)",
          backdropFilter: "blur(20px)",
          boxShadow: "0 4px 24px rgba(0,0,0,0.15)",
        }}
        data-testid="portal-topbar"
      >
        <div className="flex items-center gap-3">
          <button
            className="md:hidden p-2 rounded-lg text-slate-300 hover:bg-white/10 transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            data-testid="button-mobile-menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #1CB4A3, #8DC63F)" }}
            >
              <Building2 className="h-4 w-4 text-white" />
            </div>
            <span
              className="text-white font-bold text-base tracking-tight hidden sm:block"
              data-testid="text-portal-brand"
            >
              {config?.shortName || "駿斯"}
            </span>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-1">
          {sidebarNavItems.slice(0, 4).map((item) => {
            const isActive = activeSection === item.sectionId;
            return (
              <button
                key={item.label}
                type="button"
                onClick={() => { setActiveSection(item.sectionId); scrollToSection(item.sectionId); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-widest uppercase transition-all cursor-pointer ${
                  isActive
                    ? "text-[#1CB4A3] border-b-2 border-[#1CB4A3]"
                    : "text-slate-300 hover:text-white"
                }`}
                data-testid={`link-portal-nav-${item.label}`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          <button
            className="p-2 rounded-full text-slate-300 hover:bg-white/10 transition-colors"
            onClick={() => setSearchOpen(!searchOpen)}
            data-testid="button-portal-search"
          >
            <Search className="h-4 w-4" />
          </button>
          <button
            className="p-2 rounded-full text-slate-300 hover:bg-white/10 transition-colors relative"
            data-testid="button-portal-notifications"
          >
            <Bell className="h-4 w-4" />
          </button>
          {auth && (
            <div className="flex items-center gap-2">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold"
                style={{ background: "linear-gradient(135deg, #1CB4A3, #006b60)" }}
                data-testid="text-portal-user-avatar"
              >
                {auth.name?.charAt(0) || "U"}
              </div>
              <button
                onClick={handleLogout}
                className="p-2 rounded-full text-slate-300 hover:text-red-400 hover:bg-white/10 transition-colors"
                data-testid="button-portal-logout"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </header>

      {searchOpen && (
        <div
          className="fixed top-16 left-0 right-0 z-40 px-4 md:px-8 py-3"
          style={{
            background: "rgba(0,29,66,0.95)",
            backdropFilter: "blur(16px)",
          }}
          data-testid="section-portal-search"
        >
          <div className="max-w-2xl mx-auto relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="搜尋公告、SOP、活動..."
              autoFocus
              className="w-full pl-10 pr-10 py-2.5 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#1CB4A3]"
              style={{
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.12)",
              }}
              data-testid="input-portal-search"
            />
            <button
              onClick={() => { setSearchOpen(false); setSearchTerm(""); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              data-testid="button-close-search"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      <aside
        className="hidden md:flex flex-col fixed left-0 top-0 w-60 h-screen pt-20 z-30"
        style={{
          background: "rgba(25,51,90,0.92)",
          backdropFilter: "blur(20px)",
          borderTopRightRadius: "1.5rem",
          borderBottomRightRadius: "1.5rem",
          boxShadow: "0 30px 40px -20px rgba(25,28,30,0.06)",
        }}
        data-testid="portal-sidebar"
      >
        <div className="px-5 mb-6 mt-4">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #1CB4A3, #8DC63F)" }}
            >
              <Building2 className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="text-white font-bold text-sm">
                {config?.facilityName || "選擇場館"}
              </div>
              <div className="text-[#8DC63F] text-[10px] font-semibold tracking-widest uppercase">
                值班中
              </div>
            </div>
          </div>
        </div>

        <nav className="flex-1 space-y-0.5 px-2">
          {sidebarNavItems.map((item) => {
            const isActive = activeSection === item.sectionId;
            return (
              <button
                key={item.label}
                type="button"
                onClick={() => { setActiveSection(item.sectionId); scrollToSection(item.sectionId); }}
                className={`flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-sm transition-all duration-200 cursor-pointer ${
                  isActive
                    ? "text-white font-semibold shadow-lg"
                    : "text-slate-300 hover:text-[#1CB4A3] hover:bg-white/10"
                }`}
                style={
                  isActive
                    ? {
                        background: "linear-gradient(135deg, #1CB4A3, #8DC63F)",
                        boxShadow: "0 4px 16px rgba(28,180,163,0.25)",
                      }
                    : {}
                }
                data-testid={`link-sidebar-${item.label}`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="px-4 mb-4">
          <div className="border-t border-white/10 pt-4 space-y-1">
            {auth && (
              <div className="flex items-center gap-2 px-3 py-2">
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold"
                  style={{ background: "#1CB4A3" }}
                >
                  {auth.name?.charAt(0) || "U"}
                </div>
                <div>
                  <p className="text-white text-xs font-medium" data-testid="text-sidebar-user-name">{auth.name}</p>
                  <p className="text-slate-400 text-[10px]">{auth.role || "員工"}</p>
                </div>
              </div>
            )}
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-4 py-2 rounded-lg text-slate-300 hover:text-red-400 hover:bg-white/5 text-sm transition-colors"
              data-testid="button-sidebar-logout"
            >
              <LogOut className="h-4 w-4" />
              登出
            </button>
          </div>
        </div>
      </aside>

      {mobileMenuOpen && (
        <>
          <div
            className="md:hidden fixed inset-0 z-30 bg-black/50"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div
            className="md:hidden fixed left-0 top-16 bottom-0 w-64 z-40 p-4 space-y-1 overflow-y-auto"
            style={{
              background: "rgba(25,51,90,0.98)",
              borderTopRightRadius: "1.5rem",
              borderBottomRightRadius: "1.5rem",
            }}
          >
            {sidebarNavItems.map((item) => {
              const isActive = activeSection === item.sectionId;
              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => { setActiveSection(item.sectionId); scrollToSection(item.sectionId); setMobileMenuOpen(false); }}
                  className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm transition-all cursor-pointer ${
                    isActive
                      ? "text-white font-semibold"
                      : "text-slate-300"
                  }`}
                  style={
                    isActive
                      ? { background: "linear-gradient(135deg, #1CB4A3, #8DC63F)" }
                      : {}
                  }
                  data-testid={`link-mobile-${item.label}`}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </button>
              );
            })}
          </div>
        </>
      )}

      <main className="md:ml-60 pt-16 min-h-screen">
        {children(searchTerm)}
      </main>

      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around h-14"
        style={{
          background: "rgba(0,29,66,0.95)",
          backdropFilter: "blur(16px)",
          borderTop: "1px solid rgba(255,255,255,0.08)",
        }}
        data-testid="portal-bottom-nav"
      >
        {sidebarNavItems.slice(0, 4).map((item) => {
          const isActive = activeSection === item.sectionId;
          return (
            <button
              key={item.label}
              type="button"
              onClick={() => { setActiveSection(item.sectionId); scrollToSection(item.sectionId); }}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 cursor-pointer ${
                isActive ? "text-[#1CB4A3]" : "text-slate-400"
              }`}
              data-testid={`link-bottom-${item.label}`}
            >
              <item.icon className="h-4 w-4" />
              <span className="text-[9px] font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
