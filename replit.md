# LINE Bot 系統全局藍圖 (System Blueprint)

## Overview
Enterprise-grade dashboard for the 駿斯 LINE Bot system. Multi-page SaaS application with 6 views: main dashboard with live API data, analytics, cross-venue operations, HR audit, system health monitoring, and anomaly report management.

## Tech Stack
- **Frontend**: React, Vite, TypeScript
- **Styling**: Tailwind CSS, Shadcn UI
- **Animation**: Framer Motion
- **Charts**: Recharts (used in Analytics page)
- **Icons**: Lucide React
- **Routing**: Wouter (6 routes)
- **Backend**: Express + PostgreSQL (Drizzle ORM)
- **Email**: Nodemailer (Gmail SMTP with app password)
- **File Upload**: Multer (for anomaly report images)

## Project Structure
- `client/src/App.tsx` - App root with sidebar layout, routing (6 routes), dynamic header title
- `client/src/components/app-sidebar.tsx` - Enterprise sidebar with active state via `useLocation`
- `client/src/pages/dashboard.tsx` - Main dashboard with 4 blueprint sections (live API data)
- `client/src/pages/analytics.tsx` - Analytics with KPIs, venue task ranking (live API); interaction chart shows empty state until API connected
- `client/src/pages/operations.tsx` - Cross-venue resource monitoring with alerts and data grid
- `client/src/pages/hr-audit.tsx` - HR audit with search bar, calls POST /api/hr-audit (returns 503 until API connected)
- `client/src/pages/system-health.tsx` - Microservice health grid and terminal audit logs
- `client/src/pages/anomaly-reports.tsx` - Anomaly report management with expandable cards (live DB data)
- `server/routes.ts` - API routes for anomaly reports (POST, GET, GET/:id) + Gmail notification
- `server/storage.ts` - DatabaseStorage using Drizzle ORM with PostgreSQL
- `server/db.ts` - Drizzle database connection (Neon serverless)
- `shared/schema.ts` - Drizzle schema (users, anomalyReports tables)

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
- **STRICT RULE**: No mock/fake/hardcoded data anywhere. All data must come from real APIs or show empty state.
- Feature keys from API are **Chinese**: "📋 任務管理", "🌤️ 竹科天氣預報" etc.
- `VENUE_FEATURES` array: 10 feature specs with label, instruction, apiKeys mapping, icon, colors
  - `API_FEATURE_KEYWORDS` maps API feature names (with emoji) to frontend spec labels via keyword matching
  - 10 features: 交辦任務, 處理事項查詢, 任務完成, 排程提醒, 水質監控, 天氣預報, 風力預報, 合併報告推送, 滿意度調查, GPT小助理
- Venue names: prefer `group.venue` from API, fallback to `VENUE_NAME_MAP` for groupId→display name
- `completionRate` from tasks API is a string like "64.9%" — parsed via `parseRate()`
- Non-feature keys excluded via `EXCLUDED_KEYS`: name, groupId, totalEnabled
- Emojis are explicitly requested by user — intentional, not a bug

## Anomaly Report System
- **POST /api/anomaly-report** — Receives anomaly reports from external clock-in system (JSON or multipart/form-data with images)
  - Stores report in PostgreSQL
  - Sends Gmail notification via nodemailer (GMAIL_USER + GMAIL_APP_PASSWORD env vars)
  - Supports up to 5 image attachments (10MB each), stored in `/uploads/anomaly-reports/`
  - Returns: { id, reportText, createdAt, imageUrls, lineUrl }
- **GET /api/anomaly-reports** — Returns all reports sorted by createdAt desc
- **GET /api/anomaly-reports/:id** — Returns single report or 404
- **Frontend page** (`/anomaly-reports`): Expandable card list with KPI summary, auto-refresh every 30s
  - KPIs: 總異常數, 今日異常, 最常見場館, 最常見原因
  - Each card expands to show: employee info, clock details, distance, fail reason, error msg, user note, images, full report text

## Routing (6 Pages)
| Route | Page | Data Source |
|-------|------|-------------|
| `/` | 營運戰情總覽 (Dashboard) | Live API (7 endpoints) |
| `/analytics` | 決策與數據洞察 | Live API (tasks/stats) + mock chart data |
| `/operations` | 跨館資源監控 | Mock alerts + data grid |
| `/hr-audit` | HR 與權限稽核 | Mock search results (Ragic + 體育署) |
| `/system-health` | 微服務健康監控 | Mock service status + audit logs |
| `/anomaly-reports` | 打卡異常管理 | Live PostgreSQL data + Gmail notification |

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
- 🚨 打卡異常管理 → /anomaly-reports

## Anomaly Reports API
- `POST /api/anomaly-report` — JSON or multipart/form-data (data + images fields)
- `GET /api/anomaly-reports` — all reports descending by time
- `GET /api/anomaly-reports/:id` — single report
- `PATCH /api/anomaly-reports/:id/resolution` — update single resolution
- `PATCH /api/anomaly-reports/batch/resolution` — batch update resolution (ids[], resolution, resolvedNote)
- Frontend: search by name/code/venue, filter by venue dropdown, filter by status (pending/resolved), batch select + batch resolve/unresolve

## Notification Recipients System
- **Table**: `notification_recipients` (id, email, label, enabled, notifyNewReport, notifyResolution, createdAt)
- **API Routes**:
  - `GET /api/notification-recipients` — list all recipients
  - `POST /api/notification-recipients` — add recipient (email required)
  - `PATCH /api/notification-recipients/:id` — toggle fields (enabled, notifyNewReport, notifyResolution)
  - `DELETE /api/notification-recipients/:id` — remove recipient
- **Frontend**: Collapsible "郵件通知設定" panel in anomaly reports page
  - Add/remove recipients with email + optional label
  - Toggle per-recipient: enabled, notify on new anomaly, notify on resolution change
  - Gmail sends to all enabled recipients matching event type (newReport or resolution)
- **Email fallback**: When no recipients are configured, system auto-sends to GMAIL_USER as default recipient
- **Test email**: `POST /api/test-email` — sends a test email to verify Gmail configuration works
- **Test button**: "發送測試信" button in notification settings panel for manual verification
- **Email logic**: `getRecipientEmails(type)` queries DB for enabled recipients with matching notification flag; falls back to GMAIL_USER
- **Image serving**: `/uploads` served via express.static in both dev (routes.ts) and production (static.ts)

## Environment Variables
- `GMAIL_USER` — Gmail address for anomaly notifications (daos.ragic.system@gmail.com)
- `GMAIL_APP_PASSWORD` — Gmail app password for SMTP auth
- `DATABASE_URL` — PostgreSQL connection string (Neon serverless)
