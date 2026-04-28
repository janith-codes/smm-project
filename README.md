# Ryzera SMM

Ryzera SMM is a Next.js MVP for a social media marketing service platform. The first release focuses on a professional public landing page where customers can discover SMM packages, review the ordering flow, and submit an order request for services such as YouTube views, Instagram reel views, Facebook video views, and TikTok engagement.

The project is intentionally structured to grow from a marketing MVP into a full product with authentication, wallet deposits, order management, manual fulfillment, and later supplier SMM panel API integration.

## Current Scope

- Public marketing landing page
- Service package cards
- Platform/service coverage section
- Order request form UI
- Workflow and FAQ sections
- Sign in / Sign up navbar actions
- Reusable marketing components
- Local Geist font loading for build-safe typography
- Feature-oriented source structure under `src/`

Payment processing, authentication flows, dashboard pages, admin workflows, database persistence, and SMM provider API integration are planned but not implemented yet.

## Tech Stack

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS 4
- ESLint
- pnpm

## Architecture

The project uses a feature-first structure inspired by layered architecture principles. Route files stay thin, while reusable UI and business-facing data live inside feature modules.

```text
src/
  app/
    (marketing)/
      page.tsx
      layout.tsx
    (dashboard)/
      layout.tsx
    (admin)/
      layout.tsx
    globals.css
  components/
    ui/
      button.tsx
  features/
    marketing/
      components/
      data.ts
      types.ts
    auth/
  lib/
    utils.ts
  entities/
  server/
```

### Design Principles

- Keep `app/` focused on routing and layouts.
- Keep feature-specific UI inside `features/<feature>/components`.
- Keep static feature data in `features/<feature>/data.ts`.
- Keep shared reusable UI primitives in `components/ui`.
- Keep shared utilities in `lib`.
- Avoid mixing backend logic, data access, and presentation in route files.

## Marketing Feature

The landing page is composed from:

- `MarketingPage`
- `SiteHeader`
- `HeroSection`
- `PackagesSection`
- `PlatformServicesSection`
- `OrderSection`
- `WorkflowSection`
- `FaqSection`
- `SiteFooter`

The route file at `src/app/(marketing)/page.tsx` only renders the marketing feature entry component.

## Getting Started

Install dependencies:

```bash
pnpm install
```

Run the development server:

```bash
pnpm dev
```

Open:

```text
http://localhost:3000
```

## Available Scripts

```bash
pnpm dev
pnpm build
pnpm start
pnpm lint
```

## Roadmap

- Add authentication pages and protected dashboard routes
- Add service catalog management
- Add order creation with validation
- Add admin order review and status updates
- Add wallet and transaction history
- Add payment provider integration
- Add notifications for new orders
- Add supplier SMM panel API integration
- Add database schema and repository layer
- Add automated tests for key flows

## Notes

This is an MVP-stage project. The current implementation prioritizes clean architecture, maintainable UI composition, and a realistic foundation for future product features.
