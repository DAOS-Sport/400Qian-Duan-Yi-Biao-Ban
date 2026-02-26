# Group Feature Dashboard (群組功能戰情室)

## Overview
A front-end dashboard application for monitoring group feature activation status and system health. Built with React + Vite, using mock data for demonstration.

## Tech Stack
- **Frontend**: React, Vite, TypeScript
- **Styling**: Tailwind CSS, Shadcn UI components
- **Animation**: Framer Motion (card entrance + hover effects)
- **Charts**: Recharts (stacked bar chart, donut/pie charts)
- **Icons**: Lucide React
- **Routing**: Wouter
- **Backend**: Express (minimal, serving frontend)

## Project Structure
- `client/src/pages/dashboard.tsx` - Main dashboard page with KPI cards, stacked bar chart, donut charts
- `client/src/components/app-sidebar.tsx` - Dark-themed sidebar navigation
- `client/src/App.tsx` - App root with sidebar layout and routing

## Key Features
1. **KPI Cards**: 3 animated cards (active groups, total features, system health) with Framer Motion float-up entrance and hover elevation
2. **Stacked Bar Chart**: Shows feature activation per group (9 groups, 6 features) using Recharts
3. **Donut Charts**: 3 donut charts showing penetration rates for key features (任務交辦 100%, 客戶調查 67%, 水質監控 11%)

## Design
- Sidebar: uses Shadcn sidebar primitives
- Main area: light background with Card components
- Rounded corners (Card default), soft shadows
- Responsive flex layout
