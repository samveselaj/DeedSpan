# v0 frontend integration

Design source: `deedspan_v0_frontend` (actual directory name).

## Findings

- Production web: Next.js 15, Tailwind 3, React 19, Radix primitives, next-themes. Server pages fetch real data; client components handle mutations, optimistic rollback, validation, and refresh.
- Reference: one client page with local demo state and CSS; Next.js 16/Tailwind 4. Reuse its visual patterns, not its application architecture.
- Tokens: parchment #f2f0eb, card #faf9f6, ink #1b1c1a, terracotta #c96b4b; dark #161816, card #20231f, accent #d98562; sage accents. Geist typography, 240px sidebar, compact navigation, 72px desktop topbar, small rounded cards, bottom mobile navigation.
- Reusable presentation: brand/navigation, panels, task/habit rows, goal progress, journal split layout, modal styling. Keep existing accessible Radix primitives.
- Exclude demo tasks/habits/goals, hardcoded date/profile, fabricated charts/scores, local-only save, inert reminder/week-start controls. No analytics, Base UI, shadcn CLI, or framework upgrades required.
- Existing web has no Settings route. Account/logout and persistent appearance controls exist. A later Settings page should expose supported preferences only.

## Batches and validation gates

1. Theme + shell: tokens mapped to existing HSL names, Geist, radii, sidebar/topbar, mobile links. Retain existing sidebar scrolling fixes, drawer accessibility, command bar and role-gated Admin. Fix resolved system-theme toggle.
2. Today then Tasks: real weekly goal focus panel, task/habit cards, row presentation and API-backed filters. Do not invent daily-score or historical activity metrics.
3. Goals: preserve goal-plans, all periods, limits, custom dates, task linkage and progress/status semantics.
4. Habits: preserve cadence, completion, streak, deletion and rollback.
5. Journal: preserve date navigation and structured reflection fields, validation and persistence.
6. Settings, auth, polish: supported settings, current auth forms, dialogs, Admin and responsive checks.

For each batch: production build/types, inspect desktop/mobile in light/dark, and exercise affected existing behavior with a running API/session. Do not advance past an unresolved gate.

## First batch scope

Theme and shell only. No backend, models, migrations, auth/session/CSRF helpers, API contracts or feature mutation handlers changed. No dependencies added. Page-specific composition is deferred to the next batch.

## Validation results

- `npm run typecheck` in apps/web: passed.
- `git diff --check`: passed.
- Production compilation and type checking: passed; build then fails during error-page prerender with null `useRef`.
- An untouched HEAD copy using the same installed dependencies reproduces the null `useRef` failure on `/500` (changed app reports `/404`). This blocker predates this batch. Root React is 19.1.0 while web/Next React and root react-dom are 19.2.6; dependency resolution is a suspected cause, not yet confirmed.
- Development server starts, but browser `/login` returns a server exception because the API connection is refused. No authenticated desktop/mobile or theme visual verification completed.
- Next step: resolve the existing build environment and start the real API, then validate this shell in both themes and viewport sizes before page-specific migration.

## Build blocker resolved (2026-09-10)

The earlier production prerender failure is resolved. Root React/React DOM pins make the hoisted web renderer and Next.js share one React instance; mobile retains React 19.1.0 through its app-local Metro resolution. Reinstalled with the declared pnpm 9.12.0. Production build now passes all 13 generation steps, including the built-in error pages. Moved typedRoutes to its supported top-level Next configuration. Authenticated visual checks remain a separate integration gate.
