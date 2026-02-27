# LINE Bot 系統全局藍圖 (System Blueprint)

## Overview
Enterprise-grade dashboard for the 駿斯 LINE Bot system. Multi-page SaaS application with 5 views: main dashboard with live API data, analytics, cross-venue operations, HR audit, and system health monitoring.

## Tech Stack
- **Frontend**: React, Vite, TypeScript
- **Styling**: Tailwind CSS, Shadcn UI
- **Animation**: Framer Motion
- **Charts**: Recharts (used in Analytics page)
- **Icons**: Lucide React
- **Routing**: Wouter (5 routes)
- **Backend**: Express (minimal, serves frontend only)

## Project Structure
- `client/src/App.tsx` - App root with sidebar layout, routing (5 routes), dynamic header title
- `client/src/components/app-sidebar.tsx` - Enterprise sidebar with active state via `useLocation`
- `client/src/pages/dashboard.tsx` - Main dashboard with 4 blueprint sections (live API data)
- `client/src/pages/analytics.tsx` - Analytics with KPIs, Recharts trend chart, venue task ranking (live API)
- `client/src/pages/operations.tsx` - Cross-venue resource monitoring with alerts and data grid (mock data)
- `client/src/pages/hr-audit.tsx` - HR audit with search bar, Ragic/lifeguard verification (mock data)
- `client/src/pages/system-health.tsx` - Microservice health grid and terminal audit logs (mock data)

## External APIs (Base: `https://line-bot-assistant-ronchen2.replit.app`)
### Core (required — `strictFetch`, errors shown to user):
1. `GET /api/admin/dashboard/feature-stats` → groups[], featurePenetration[], totalGroups
2. `GET /api/admin/tasks/stats` → total, completed, pending, completionRate (string "64.9%"), byGroup
3. `GET /api/admin/attendance/stats` → todayCheckins, successful, failed, uniqueCheckers

### Extended (optional — `safeFetch`, graceful null fallback):
4. `GET /api/admin/dashboard/global-apps` → tasks, gps, coach, survey status/stats
5. `GET /api/admin/dashboard/private-services` → general, management data
6. `GET /api/admin/dashboard/venue-automations` → venues[] with features/schedules
7. `GET /api/admin/dashboard/services-health` → service health statuses
8. `GET /api/admin/tasks/history/${groupId}` → HistoryTask[] (taskId, description, status, createdAt, completedAt, reporter) — falls back to filtering recentTasks from tasks/stats API if not deployed

## Data Model
- Feature keys from API are **Chinese**: "任務交辦", "天氣預報", "GPS打卡" (not English)
- `VENUE_FEATURES` array: 10 feature specs with label, instruction, apiKeys mapping, icon, colors
  - Each feature has `apiKeys[]` to map display names to API-returned Chinese keys
  - 10 features: 交辦任務, 處理事項查詢, 任務完成, 排程提醒, 水質監控, 天氣預報, 風力預報, 合併報告推送, 滿意度調查, GPT小助理
- `VENUE_NAME_MAP` maps groupId to display names (e.g., "DAOS-新北高中（工作群）")
- `completionRate` from tasks API is a string like "64.9%" — parsed via `parseRate()`
- Non-feature keys excluded via `EXCLUDED_KEYS`: name, groupId, totalEnabled
- Emojis are explicitly requested by user — intentional, not a bug

## Routing (5 Pages)
| Route | Page | Data Source |
|-------|------|-------------|
| `/` | 營運戰情總覽 (Dashboard) | Live API (7 endpoints) |
| `/analytics` | 決策與數據洞察 | Live API (tasks/stats) + mock chart data |
| `/operations` | 跨館資源監控 | Mock alerts + data grid |
| `/hr-audit` | HR 與權限稽核 | Mock search results (Ragic + 體育署) |
| `/system-health` | 微服務健康監控 | Mock service status + audit logs |

## Dashboard Layout (4 Sections)
1. **🌐 全域通用與網頁應用**: 4 cards with live stats, LIFF badges on GPS/教練/客戶調查, usage guide text blocks
2. **👤 私人專屬與權限對話**: Split panels (general/admin) with trigger command guides
3. **🏢 實體場館自動化矩陣**: Only enabled features shown (filtered), 10-feature CSS Grid, instruction line per badge. Each feature badge is clickable and opens a **FeatureDetailDrawer** with content based on the feature type:
   - 交辦任務/處理事項查詢/任務完成 → TaskSwimlaneContent (dual-column Kanban with real API data)
   - 天氣預報/風力預報 → WeatherPanel (Apple-style weather dashboard with hourly forecast)
   - 水質監控 → WaterQualityPanel (4-metric dashboard: PH, chlorine, temp, turbidity + AI suggestions)
   - GPT小助理 → GptChatPanel (ChatGPT-style conversation mockup)
   - Others → GenericFeaturePanel ("建置中" placeholder)
4. **⚙️ 架構與依賴關係**: Microservices with health status from API or defaults

## Sidebar Navigation
- 📊 營運戰情總覽 → /
- 📈 決策與數據洞察 → /analytics
- 🏢 跨館資源監控 → /operations
- 🛡️ HR 與權限稽核 → /hr-audit
- ⚙️ 微服務健康監控 → /system-health
