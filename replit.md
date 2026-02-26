# Group Feature Dashboard (群組功能戰情室)

## Overview
A front-end dashboard for monitoring group feature activation status. Fetches real-time data directly from external APIs — no fallback/mock data.

## Tech Stack
- **Frontend**: React, Vite, TypeScript
- **Styling**: Tailwind CSS, Shadcn UI components
- **Animation**: Framer Motion (card entrance + hover effects)
- **Charts**: Recharts (stacked bar chart, donut/pie charts)
- **Icons**: Lucide React
- **Routing**: Wouter
- **Backend**: Express (minimal, serves frontend only)

## Project Structure
- `client/src/pages/dashboard.tsx` - Main dashboard with KPI cards, charts, direct API fetching
- `client/src/components/app-sidebar.tsx` - Sidebar navigation
- `client/src/App.tsx` - App root with sidebar layout and routing

## External APIs (Direct Fetch, CORS enabled)
1. `GET https://line-bot-assistant-ronchen2.replit.app/api/admin/dashboard/feature-stats` - Groups & feature penetration
2. `GET https://line-bot-assistant-ronchen2.replit.app/api/admin/tasks/stats` - Task completion rate
3. `GET https://line-bot-assistant-ronchen2.replit.app/api/admin/attendance/stats` - Attendance stats

## Data Fetching Strategy
- Frontend fetches all 3 APIs directly via `Promise.all`
- No backend proxy, no fallback data
- If any API fails: error block shown with retry button, no data displayed
- Loading state: skeleton screens for all sections

## Key Features
1. **KPI Cards**: Active groups, task completion rate, today's attendance
2. **Stacked Bar Chart**: Feature activation per group (dynamic keys)
3. **Donut Charts**: Feature penetration rates
4. **Strict Error Handling**: Error screen with retry, never shows fake data
