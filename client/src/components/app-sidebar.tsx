import { Link, useLocation } from "wouter";
import {
  LayoutDashboard,
  TrendingUp,
  Building2,
  ShieldCheck,
  Activity,
  AlertTriangle,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";

const navItems = [
  { title: "📊 營運戰情總覽", url: "/", icon: LayoutDashboard },
  { title: "📈 決策與數據洞察", url: "/analytics", icon: TrendingUp },
  { title: "🏢 跨館資源監控", url: "/operations", icon: Building2 },
  { title: "🛡️ HR 與權限稽核", url: "/hr-audit", icon: ShieldCheck },
  { title: "⚙️ 微服務健康監控", url: "/system-health", icon: Activity },
  { title: "🚨 打卡異常管理", url: "/anomaly-reports", icon: AlertTriangle },
];

export function AppSidebar() {
  const [location] = useLocation();

  return (
    <Sidebar>
      <SidebarHeader className="p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
            <LayoutDashboard className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-sidebar-foreground" data-testid="text-app-title">
              400後端監控儀表板
            </p>
            <p className="text-xs text-muted-foreground">Enterprise v2.0</p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>營運管理</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const isActive = location === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      data-active={isActive || undefined}
                      className={isActive ? "data-[active=true]:bg-sidebar-accent" : ""}
                    >
                      <Link href={item.url} data-testid={`link-nav-${item.title}`}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4">
        <div className="rounded-md bg-sidebar-accent/50 p-3">
          <p className="text-xs text-muted-foreground">
            駿斯運動事業 LINE Bot 管理平台
          </p>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
