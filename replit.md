# LINE Bot 系統全局藍圖 (System Blueprint)

## Overview
Enterprise-grade dashboard for the 駿斯 LINE Bot system. Displays operational status across venues, features, permissions, and microservices. Fetches from 7 API endpoints using `Promise.allSettled` — 3 core (required) + 4 new (graceful fallback if unavailable).

## Tech Stack
- **Frontend**: React, Vite, TypeScript
- **Styling**: Tailwind CSS, Shadcn UI
- **Animation**: Framer Motion
- **Icons**: Lucide React
- **Routing**: Wouter
- **Backend**: Express (minimal, serves frontend only)

## Project Structure
- `client/src/pages/dashboard.tsx` - Main dashboard with 4 blueprint sections
- `client/src/components/app-sidebar.tsx` - Enterprise sidebar navigation
- `client/src/App.tsx` - App root with sidebar layout and routing

## External APIs (Base: `https://line-bot-assistant-ronchen2.replit.app`)
### Core (required — `strictFetch`, errors shown to user):
1. `GET /api/admin/dashboard/feature-stats` → groups[], featurePenetration[], totalGroups
2. `GET /api/admin/tasks/stats` → total, completed, pending, completionRate (string "64.9%")
3. `GET /api/admin/attendance/stats` → todayCheckins, successful, failed, uniqueCheckers

### Extended (optional — `safeFetch`, graceful null fallback):
4. `GET /api/admin/dashboard/global-apps` → tasks, gps, coach, survey status/stats
5. `GET /api/admin/dashboard/private-services` → general, management data
6. `GET /api/admin/dashboard/venue-automations` → venues[] with features/schedules
7. `GET /api/admin/dashboard/services-health` → service health statuses

## Data Model
- Feature keys from API are **Chinese**: "任務交辦", "天氣預報", "GPS打卡" (not English)
- `FEATURE_SPEC` dict maps Chinese keys to display specs (emoji, icon, color, trigger)
- `VENUE_NAME_MAP` maps groupId to display names (e.g., "DAOS-新北高中（工作群）")
- `completionRate` from tasks API is a string like "64.9%" — parsed via `parseRate()`
- Non-feature keys excluded via `EXCLUDED_KEYS`: name, groupId, totalEnabled

## Dashboard Layout (4 Sections)
1. **🌐 全域通用與網頁應用**: 4 cards with live stats from core APIs + optional global-apps API
2. **👤 私人專屬與權限對話**: Split panels (general/admin) with optional private-services data
3. **🏢 實體場館自動化矩陣**: Swimlane rows from feature-stats groups, venue names via VENUE_NAME_MAP, copyable Group IDs, feature badges show enabled/disabled from real API data
4. **⚙️ 架構與依賴關係**: Microservices with health status from services-health API or defaults

## Sidebar Navigation
- 📊 營運戰情總覽 (active, routes to /)
- 📈 決策與數據洞察
- 🏢 跨館資源監控
- 🛡️ HR 與權限稽核
- ⚙️ 微服務健康監控
