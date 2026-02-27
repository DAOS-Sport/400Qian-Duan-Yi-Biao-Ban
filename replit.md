# LINE Bot 系統全局藍圖 (System Blueprint)

## Overview
A portfolio-matrix style dashboard for the LINE Bot system. Displays three core modules' operational status and permission distribution across venues. Fetches real-time data from external APIs — no fallback/mock data.

## Tech Stack
- **Frontend**: React, Vite, TypeScript
- **Styling**: Tailwind CSS, Shadcn UI components
- **Animation**: Framer Motion
- **Icons**: Lucide React
- **Routing**: Wouter
- **Backend**: Express (minimal, serves frontend only)

## Project Structure
- `client/src/pages/dashboard.tsx` - Main dashboard with 4 blueprint sections
- `client/src/components/app-sidebar.tsx` - Sidebar navigation
- `client/src/App.tsx` - App root with sidebar layout and routing

## External APIs (Direct Fetch, CORS enabled)
1. `GET .../api/admin/dashboard/feature-stats` → groups[], featurePenetration[]
2. `GET .../api/admin/tasks/stats` → completionRate
3. `GET .../api/admin/attendance/stats` → successful

## Data Model
- `featurePenetration[]`: fields `feature`, `count`, `rate`
- `groups[]`: `name`, `groupId`, `totalEnabled` (excluded from display) + feature keys

## Dashboard Layout (4 Sections)
1. **🌐 全域通用與網頁應用**: 4 feature cards (任務管理, GPS打卡, 教練簽到, 客戶調查)
2. **👤 私人專屬與權限對話**: Split into general users (員工查詢, 呼叫小編) and admin (面試檢核 with tooltip "僅限7位管理員")
3. **🏢 實體場館自動化矩陣**: Swimlane layout with venue names on left, feature badges with trigger times on right. Hardcoded specs for 竹科游泳池 and 高爾夫練習場, others show default 任務提醒
4. **⚙️ 架構與依賴關係**: Microservices flow: LINE API → Task → Message → Scheduler → LLM → Weather → WaterQuality

## Key Design Decisions
- Non-feature keys (`name`, `groupId`, `totalEnabled`) excluded via `EXCLUDED_KEYS`
- Venue-specific feature configs in `VENUE_SPECS` with trigger times
- Tooltip component used for admin-only permission notice
- Pure white background, micro-shadows, rounded-2xl cards throughout
