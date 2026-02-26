# Group Feature Dashboard (群組功能戰情室)

## Overview
A front-end dashboard application for monitoring group feature activation status and system health. Fetches real-time data from external APIs with graceful fallback to cached data.

## Tech Stack
- **Frontend**: React, Vite, TypeScript
- **Styling**: Tailwind CSS, Shadcn UI components
- **Animation**: Framer Motion (card entrance + hover effects)
- **Charts**: Recharts (stacked bar chart, donut/pie charts)
- **Icons**: Lucide React
- **Routing**: Wouter
- **Backend**: Express (API proxy to external service)

## Project Structure
- `client/src/pages/dashboard.tsx` - Main dashboard page with KPI cards, stacked bar chart, donut charts, real API integration
- `client/src/components/app-sidebar.tsx` - Dark-themed sidebar navigation
- `client/src/App.tsx` - App root with sidebar layout and routing
- `server/routes.ts` - Backend proxy routes for external API calls

## External APIs (Base: https://line-bot-assistant-ronchen2.replit.app)
1. `GET /api/admin/dashboard/feature-stats` - Groups & feature penetration data
2. `GET /api/admin/tasks/stats` - Task completion rate
3. `GET /api/admin/attendance/stats` - Attendance success count

## Data Fetching Strategy
- Frontend tries direct external API first, falls back to backend proxy
- All 3 APIs fetched in parallel via `Promise.allSettled`
- Individual API failures don't block other data from loading
- Hardcoded fallback data displayed when APIs are unavailable
- Error banner with retry button shown on failure

## Key Features
1. **KPI Cards**: Active groups (from feature-stats), Task completion rate (from tasks/stats), Today's attendance (from attendance/stats)
2. **Stacked Bar Chart**: Dynamic feature activation per group from API `groups` array
3. **Donut Charts**: Feature penetration rates from API `featurePenetration` array
4. **Loading States**: Skeleton screens for all sections during data fetch
5. **Error Handling**: Graceful fallback with retry capability

## Design
- Sidebar: uses Shadcn sidebar primitives with Wouter Link navigation
- Main area: light background with Card components
- Hover effects: uses `hover-elevate` utility + Framer Motion y-offset
- Responsive flex layout
