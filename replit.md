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
- `client/src/pages/dashboard.tsx` - Main dashboard: KPI spotlight cards + venue card grid
- `client/src/components/app-sidebar.tsx` - Sidebar navigation
- `client/src/App.tsx` - App root with sidebar layout and routing

## External APIs (Direct Fetch, CORS enabled)
1. `GET https://line-bot-assistant-ronchen2.replit.app/api/admin/dashboard/feature-stats`
2. `GET https://line-bot-assistant-ronchen2.replit.app/api/admin/tasks/stats`
3. `GET https://line-bot-assistant-ronchen2.replit.app/api/admin/attendance/stats`

## UI Design
- Pure white background (bg-gray-50/80), rounded-2xl cards, shadow-sm
- **KPI Cards**: Active venues, task completion rate, today's attendance — white cards with colored icon badges
- **Venue Card Grid**: Each card = one LINE group/venue
  - Status light (green pulse = GPS enabled, amber = not)
  - GPS check-in progress bar
  - Feature badges: colored for ON, gray strikethrough for OFF, hover scale animation
- Error state: centered error block with retry button, no fake data ever shown
- Loading state: skeleton screens matching card grid layout
