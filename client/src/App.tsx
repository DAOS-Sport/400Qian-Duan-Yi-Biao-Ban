import { Switch, Route, useLocation, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import Dashboard from "@/pages/dashboard";
import Analytics from "@/pages/analytics";
import Operations from "@/pages/operations";
import HrAudit from "@/pages/hr-audit";
import SystemHealth from "@/pages/system-health";
import AnomalyReports from "@/pages/anomaly-reports";
import Announcements from "@/pages/announcements";
import AnnouncementSummary from "@/pages/announcement-summary";
import NotFound from "@/pages/not-found";
import PortalLogin from "@/pages/portal/portal-login";
import PortalHome from "@/pages/portal/portal-home";
import PortalSetup from "@/pages/portal/portal-setup";
import PortalAnnouncements from "@/pages/portal/portal-announcements";
import PortalHandover from "@/pages/portal/portal-handover";
import PortalCampaigns from "@/pages/portal/portal-campaigns";
import PortalShift from "@/pages/portal/portal-shift";
import PortalAnnouncementDetail from "@/pages/portal/portal-announcement-detail";
import PortalManage from "@/pages/portal/portal-manage";
import PortalAnalytics from "@/pages/portal/portal-analytics";
import PortalReview from "@/pages/portal/portal-review";
import EmployeeHomePage from "@/modules/employee/home/employee-home-page";
import SupervisorDashboardPage from "@/modules/supervisor/dashboard-page";
import SystemDashboardPage from "@/modules/system/dashboard-page";
import WorkbenchLoginPage from "@/modules/workbench/login-page";
import { LegacyWorkbenchPage } from "@/modules/workbench/legacy-page";
import { useAuthMe } from "@/shared/auth/session";
import { roleHomePath } from "@shared/auth/me";
import { usePortalAuth } from "@/hooks/use-bound-facility";
import { getFacilityConfig } from "@/config/facility-configs";

const PAGE_TITLES: Record<string, string> = {
  "/": "營運戰情總覽",
  "/analytics": "決策與數據洞察",
  "/operations": "跨館資源監控",
  "/hr-audit": "HR 與權限稽核",
  "/system-health": "微服務健康監控",
  "/anomaly-reports": "打卡異常管理",
  "/announcements": "公告審核中心",
  "/announcements/summary": "公告分析總覽",
};

function AppRouter() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/analytics" component={Analytics} />
      <Route path="/operations" component={Operations} />
      <Route path="/hr-audit" component={HrAudit} />
      <Route path="/system-health" component={SystemHealth} />
      <Route path="/anomaly-reports" component={AnomalyReports} />
      <Route path="/announcements/summary" component={AnnouncementSummary} />
      <Route path="/announcements" component={Announcements} />
      <Route component={NotFound} />
    </Switch>
  );
}

function PortalAuthGuard({ children }: { children: React.ReactNode }) {
  const { isLoggedIn } = usePortalAuth();
  if (!isLoggedIn) {
    return <Redirect to="/portal/login" />;
  }
  return <>{children}</>;
}

function GuardedPortalPage({ children }: { children: React.ReactNode }) {
  return <PortalAuthGuard>{children}</PortalAuthGuard>;
}

function PortalIndexPage() {
  const { isLoggedIn } = usePortalAuth();
  const facilityKey = localStorage.getItem("facilityKey");
  const validFacility = facilityKey ? getFacilityConfig(facilityKey) : null;

  if (!isLoggedIn) {
    return <Redirect to="/portal/login" />;
  }

  if (validFacility && facilityKey) {
    return <Redirect to={`/portal/${facilityKey}`} />;
  }

  return <PortalSetup />;
}

function PortalRouter() {
  return (
    <Switch>
      <Route path="/portal/login" component={PortalLogin} />
      <Route path="/portal/:facilityKey/announcements/:id">
        {(params) => (
          <GuardedPortalPage>
            <PortalAnnouncementDetail facilityKey={params.facilityKey} announcementId={params.id} />
          </GuardedPortalPage>
        )}
      </Route>
      <Route path="/portal/:facilityKey/announcements">
        {(params) => (
          <GuardedPortalPage>
            <PortalAnnouncements facilityKey={params.facilityKey} />
          </GuardedPortalPage>
        )}
      </Route>
      <Route path="/portal/:facilityKey/handover">
        {(params) => (
          <GuardedPortalPage>
            <PortalHandover facilityKey={params.facilityKey} />
          </GuardedPortalPage>
        )}
      </Route>
      <Route path="/portal/:facilityKey/campaigns">
        {(params) => (
          <GuardedPortalPage>
            <PortalCampaigns facilityKey={params.facilityKey} />
          </GuardedPortalPage>
        )}
      </Route>
      <Route path="/portal/:facilityKey/shift">
        {(params) => (
          <GuardedPortalPage>
            <PortalShift facilityKey={params.facilityKey} />
          </GuardedPortalPage>
        )}
      </Route>
      <Route path="/portal/:facilityKey/manage">
        {(params) => (
          <GuardedPortalPage>
            <PortalManage facilityKey={params.facilityKey} />
          </GuardedPortalPage>
        )}
      </Route>
      <Route path="/portal/:facilityKey/review">
        {(params) => (
          <GuardedPortalPage>
            <PortalReview facilityKey={params.facilityKey} />
          </GuardedPortalPage>
        )}
      </Route>
      <Route path="/portal/:facilityKey/analytics">
        {(params) => (
          <GuardedPortalPage>
            <PortalAnalytics facilityKey={params.facilityKey} />
          </GuardedPortalPage>
        )}
      </Route>
      <Route path="/portal/:facilityKey">
        {(params) => (
          <GuardedPortalPage>
            <PortalHome facilityKey={params.facilityKey} />
          </GuardedPortalPage>
        )}
      </Route>
      <Route path="/portal" component={PortalIndexPage} />
    </Switch>
  );
}

function WorkbenchRouter() {
  return (
    <Switch>
      <Route path="/">
        <Redirect to="/system" />
      </Route>
      <Route path="/SYSTEM" component={SystemDashboardPage} />
      <Route path="/SUPERVISOR" component={SupervisorDashboardPage} />
      <Route path="/EMPLOYEE" component={EmployeeHomePage} />
      <Route path="/supervisor/home" component={SupervisorDashboardPage} />
      <Route path="/supervisor/tasks">
        <LegacyWorkbenchPage role="supervisor" title="任務管理" subtitle="沿用既有任務與營運資料，後續逐步拆成新 module。">
          <Operations />
        </LegacyWorkbenchPage>
      </Route>
      <Route path="/supervisor/announcements">
        <LegacyWorkbenchPage role="supervisor" title="公告管理" subtitle="公告審核與發布功能先搬入新工作台殼。">
          <Announcements />
        </LegacyWorkbenchPage>
      </Route>
      <Route path="/supervisor/anomalies">
        <LegacyWorkbenchPage role="supervisor" title="異常審核" subtitle="打卡異常管理先由既有功能承接。">
          <AnomalyReports />
        </LegacyWorkbenchPage>
      </Route>
      <Route path="/supervisor/people">
        <LegacyWorkbenchPage role="supervisor" title="人力狀態" subtitle="HR 與權限稽核先掛入主管工作台。">
          <HrAudit />
        </LegacyWorkbenchPage>
      </Route>
      <Route path="/supervisor" component={SupervisorDashboardPage} />
      <Route path="/system/health" component={SystemDashboardPage} />
      <Route path="/system/alerts">
        <LegacyWorkbenchPage role="system" title="告警中心" subtitle="先接既有異常監控頁，後續改成系統事件 module。">
          <AnomalyReports />
        </LegacyWorkbenchPage>
      </Route>
      <Route path="/system/integrations">
        <LegacyWorkbenchPage role="system" title="整合監控" subtitle="外部資料源與跨館資源先由既有頁面承接。">
          <Operations />
        </LegacyWorkbenchPage>
      </Route>
      <Route path="/system/audit">
        <LegacyWorkbenchPage role="system" title="操作稽核" subtitle="公告分析與稽核資料先搬入系統治理殼。">
          <AnnouncementSummary />
        </LegacyWorkbenchPage>
      </Route>
      <Route path="/system/raw-inspector">
        <LegacyWorkbenchPage role="system" title="Raw Inspector" subtitle="外部來源原始資料檢視入口，正式資料待 Replit 重連。">
          <Analytics />
        </LegacyWorkbenchPage>
      </Route>
      <Route path="/system/overview" component={SystemDashboardPage} />
      <Route path="/system" component={SystemDashboardPage} />
      <Route path="/employee/home" component={EmployeeHomePage} />
      <Route path="/employee" component={EmployeeHomePage} />
      <Route component={SystemDashboardPage} />
    </Switch>
  );
}

function WorkbenchAuthGate() {
  const { data: session, isLoading, isError } = useAuthMe();

  if (isLoading) {
    return (
      <div className="grid min-h-dvh place-items-center bg-[#f4f7fb] text-[14px] font-bold text-[#637185]">
        載入登入狀態...
      </div>
    );
  }

  if (isError || !session) {
    return <Redirect to="/login" />;
  }

  return <WorkbenchRouter />;
}

const sidebarStyle = {
  "--sidebar-width": "16rem",
  "--sidebar-width-icon": "3rem",
};

function HeaderTitle() {
  const [location] = useLocation();
  const title = PAGE_TITLES[location] || "DAOS 管理後台";
  return <span className="text-[13px] font-medium text-muted-foreground" data-testid="text-page-title">{title}</span>;
}

function App() {
  const [location] = useLocation();
  const normalizedLocation = location.toLowerCase();
  const isPortal = location.startsWith("/portal");
  const isLogin = normalizedLocation === "/login";
  const isWorkbench =
    normalizedLocation === "/" ||
    normalizedLocation === "/employee" ||
    normalizedLocation.startsWith("/employee/") ||
    normalizedLocation === "/supervisor" ||
    normalizedLocation.startsWith("/supervisor/") ||
    normalizedLocation === "/system" ||
    normalizedLocation.startsWith("/system/");

  if (isPortal || isWorkbench || isLogin) {
    return (
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          {isLogin ? <LoginRedirector /> : isWorkbench ? <WorkbenchAuthGate /> : <PortalRouter />}
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <SidebarProvider style={sidebarStyle as React.CSSProperties}>
          <div className="flex h-screen w-full bg-background">
            <AppSidebar />
            <div className="flex flex-col flex-1 min-w-0">
              <header className="flex items-center gap-2.5 px-4 h-12 border-b bg-background/80 backdrop-blur-md" style={{ boxShadow: "rgba(0,0,0,0.08) 0px 1px 0px" }}>
                <SidebarTrigger data-testid="button-sidebar-toggle" />
                <div className="h-4 w-px bg-border" />
                <HeaderTitle />
              </header>
              <main className="flex-1 overflow-hidden">
                <AppRouter />
              </main>
            </div>
          </div>
        </SidebarProvider>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

function LoginRedirector() {
  const { data: session, isLoading } = useAuthMe();

  if (isLoading) {
    return <WorkbenchLoginPage />;
  }

  if (session) {
    return <Redirect to={roleHomePath[session.activeRole]} />;
  }

  return <WorkbenchLoginPage />;
}

export default App;
