# 99solar Frontendd

A modern Next.js application for manage solar auctions and bidder participation.

## Tech Stack

- **Next.js 15**: Core framework.
- **React 19**: Frontend UI library.
- **Tailwind CSS 4**: For styling and layout.
- **Material UI (MUI) & Radix UI**: For complex UI components and accessibility.
- **TanStack Query**: For efficient API data fetching and caching.
- **Zustand**: For lightweight client-side state management.
- **Chart.js**: For data visualization on the dashboard.

## Folder Structure

- `app/`: Next.js App Router folders and pages.
    - `dashboard/`: Main dashboard area with bidding and reporting tools.
    - `_components/`: Sharable React components.
- `context/`: React Context providers for global state.
- `utils/`: API handlers, CSV parsers, and other helpers.
- `public/`: Static assets such as images and fonts.

## Key Features

### Awarding Processor
- Process awarded bid CSVs from various sources.
- Generate individual reports for each source.
- **All Wins Report**: Aggregates all awarded bids into a single report, automatically excluding "Internal" bids for clean distribution.

### Bid Filter
- Comprehensive filtering tools for managing incoming bids.

### Dashboard Overview
- Real-time statistics including total bids, active customers, and revenue.
- Visual activity overview using Chart.js.

## API Integration

API calls are centralized in `utils/api.ts`. Ensure `NEXT_PUBLIC_API_URL` is set in your `.env.local` to point to the `solar-backend`.

## Design System

The project uses a custom design system centered around:
- **HSL-based color palettes** for theme consistency.
- **Glassmorphism** and modern UI patterns for a premium feel.
- **Custom Cards** and **Navigation Components** found in `app/dashboard/components/ui`.

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```
2. Configure `.env.local`:
   ```bash
   NEXT_PUBLIC_API_URL=http://localhost:1000
   ```
3. Run in development:
   ```bash
   npm run dev
   ```
