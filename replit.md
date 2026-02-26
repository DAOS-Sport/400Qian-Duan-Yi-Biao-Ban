# Venue Command Center (場館指揮中心)

## Overview
A white-background venue command center dashboard for monitoring LINE group (venue) operations. Fetches real-time data directly from external APIs — no fallback/mock data.

## Tech Stack
- **Frontend**: React, Vite, TypeScript
- **Styling**: Tailwind CSS, Shadcn UI components
- **Animation**: Framer Motion (card entrance + hover + badge interactions)
- **Icons**: Lucide React
- **Routing**: Wouter
- **Backend**: Express (minimal, serves frontend only)

## Project Structure
- `client/src/pages/dashboard.tsx` - Main dashboard: KPI cards + portfolio-style venue cards
- `client/src/components/app-sidebar.tsx` - Sidebar navigation
- `client/src/App.tsx` - App root with sidebar layout and routing

## External APIs (Direct Fetch, CORS enabled)
1. `GET https://line-bot-assistant-ronchen2.replit.app/api/admin/dashboard/feature-stats`
2. `GET https://line-bot-assistant-ronchen2.replit.app/api/admin/tasks/stats`
3. `GET https://line-bot-assistant-ronchen2.replit.app/api/admin/attendance/stats`

## Data Model
- `featurePenetration[]` uses fields: `feature`, `count`, `rate` (not `name`/`value`)
- `groups[]` contains `name`, `groupId`, `totalEnabled` (metadata, excluded from display) plus feature keys like `tasks`, `weather`, `gps`, etc.

## Feature Category Map (frontend-only)
Features are classified into 3 categories for display:
- **💬 群組自動化 (Group Commands)**: tasks, weather, wind, water
- **🌐 網頁應用 (Web/LIFF)**: gps, coach, survey
- **👤 私人專屬 (1-on-1 Chat)**: employee, interview (reserved slots)

Non-feature keys (`name`, `groupId`, `totalEnabled`) are excluded via `EXCLUDED_KEYS` set.

## UI Design
- Pure white background (bg-gray-50/80), rounded-2xl cards, shadow-sm
- **KPI Cards**: Active venues, task completion rate, today's attendance
- **Dashboard Description**: Gray text explaining enabled/disabled color coding
- **Portfolio Venue Cards** (2-column grid):
  - Large venue name + system activation rate progress bar
  - GPS check-in rate bar (shown if GPS enabled)
  - 3 category sections (group/web/private) with colored borders/backgrounds
  - Feature badges: ✅ emoji + colored for ON, ❌ + gray for OFF, hover scale animation
- Error state: centered error block with retry button, no fake data
- Loading state: skeleton screens matching portfolio card layout
