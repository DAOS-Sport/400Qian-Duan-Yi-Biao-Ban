import { Switch, Route, useLocation } from "wouter";
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
import NotFound from "@/pages/not-found";

const PAGE_TITLES: Record<string, string> = {
  "/": "📊 營運戰情總覽",
  "/analytics": "📈 決策與數據洞察",
  "/operations": "🏢 跨館資源監控",
  "/hr-audit": "🛡️ HR 與權限稽核",
  "/system-health": "⚙️ 微服務健康監控",
  "/anomaly-reports": "🚨 打卡異常管理",
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
      <Route component={NotFound} />
    </Switch>
  );
}

const sidebarStyle = {
  "--sidebar-width": "16rem",
  "--sidebar-width-icon": "3rem",
};

function HeaderTitle() {
  const [location] = useLocation();
  const title = PAGE_TITLES[location] || "群組功能戰情室";
  return <span className="text-sm text-muted-foreground" data-testid="text-page-title">{title}</span>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <SidebarProvider style={sidebarStyle as React.CSSProperties}>
          <div className="flex h-screen w-full">
            <AppSidebar />
            <div className="flex flex-col flex-1 min-w-0">
              <header className="flex items-center gap-2 p-3 border-b">
                <SidebarTrigger data-testid="button-sidebar-toggle" />
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

export default App;
