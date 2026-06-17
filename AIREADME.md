# Profectus — Technical Brief (for AI review)

> A self-contained description of the codebase so another assistant can reason about and critique it without filesystem access. Honest about tradeoffs and gaps.

---

## 1. What it is

Profectus is a small productivity & accountability MVP shipped as three apps in one monorepo:

- **Web** (`apps/web`) — full feature surface incl. admin
- **Mobile** (`apps/mobile`) — Expo/React Native, user-facing features only
- **API** (`apps/api`) — FastAPI; serves both clients

A single user signs in, captures tasks, builds **goals** for fixed periods (this week / month / year / 10-year / custom), tracks daily habits with streaks, and writes a daily journal. There is a minimal admin section on web (user management + 7-day activity metrics). Aesthetic is calm/minimal — Linear / Apple Reminders inspired.

**Status:** end-to-end functional across web + mobile + API. Auth, goals, tasks, habits, journal, admin all working. No tests, no email flow, no AI features (deliberately scoped out).

---

## 2. Stack

**Web** — `apps/web/`
- Next.js 15.5 (App Router) on React 19
- TypeScript strict
- Tailwind CSS v3.4 with CSS-variable theming + `tailwindcss-animate`
- Hand-rolled shadcn-style primitives over Radix UI (Dialog, Dropdown, Checkbox, Label, Switch)
- `react-hook-form` + `zod` for forms
- `next-themes` for dark/light/system toggle
- `sonner` toasts, `cmdk` ⌘K command bar
- `lucide-react` icons, `date-fns` for date display
- Zustand was planned but **unused** — no global client state needed

**Mobile** — `apps/mobile/`
- Expo SDK 54, React Native 0.81, React 19.1
- Expo Router 6 (file-based routing, route groups, tabs)
- TypeScript strict (with `noUncheckedIndexedAccess`)
- `expo-secure-store` for bearer-token persistence (Keychain on iOS, encrypted SharedPreferences on Android)
- `@react-native-async-storage/async-storage` for theme preference
- `@expo/vector-icons` (Feather set), `react-native-safe-area-context`
- Token-based auth — no cookies, no CSRF
- **No** React Query, **no** Redux, **no** NativeWind — plain `useState` + `useFocusEffect`

**Backend** — `apps/api/`
- FastAPI 0.136 (Python 3.12+; tested on 3.14 in dev)
- SQLAlchemy 2.0 async with `asyncpg`
- Pydantic v2 (`pydantic-settings` for env)
- Alembic for migrations
- `argon2-cffi` for password hashing
- `slowapi` for rate limiting

**Database** — PostgreSQL 15+ (one DB; soft-delete where users need recovery; partial unique indexes used for "one per period" constraints)

**Auth** — opaque session IDs in Postgres, two presentation modes:
- **Web cookies** — HTTP-only `aether_sid` + non-HttpOnly `aether_csrf` (double-submit)
- **Mobile bearer** — `Authorization: Bearer <session_id>`, CSRF is skipped

No Docker, no Redis, no Celery, no JWTs, no microservices, no GraphQL/tRPC, no Firebase/Supabase.

---

## 3. Repository layout

```
aether/
├── apps/
│   ├── api/                            # FastAPI backend
│   │   ├── app/
│   │   │   ├── main.py                 # FastAPI app + router mounting + middleware
│   │   │   ├── config.py               # pydantic-settings (env-driven)
│   │   │   ├── db.py                   # async engine, SessionLocal, Base, get_db
│   │   │   ├── security.py             # argon2, token generation, cookie helpers
│   │   │   ├── deps.py                 # get_current_user (cookie OR bearer), require_admin, CSRF enforcement
│   │   │   ├── rate_limit.py           # slowapi Limiter
│   │   │   ├── models/                 # SQLAlchemy: user, session, goal*, goal_plan, goal_plan_item, task, habit, reflection
│   │   │   ├── schemas/                # Pydantic I/O models
│   │   │   ├── routers/                # auth, me, tasks, goals*, goal_plans, habits, reflections, admin
│   │   │   └── services/               # session_service, streak_service, plan_periods
│   │   ├── alembic/versions/           # 0001_init.py, 0002_goal_plans.py
│   │   ├── pyproject.toml
│   │   └── .env
│   │
│   ├── web/                            # Next.js frontend
│   │   ├── app/
│   │   │   ├── layout.tsx              # html shell, theme provider, Toaster
│   │   │   ├── globals.css             # Tailwind layers + CSS-variable theme tokens
│   │   │   ├── page.tsx                # landing page
│   │   │   ├── (auth)/                 # /login, /register
│   │   │   ├── (app)/                  # /dashboard, /tasks, /goals, /habits, /reflect
│   │   │   └── (admin)/                # /admin/users, /admin/metrics
│   │   ├── components/
│   │   │   ├── ui/                     # button, input, card, dialog, dropdown-menu, checkbox, label, textarea, badge, empty-state
│   │   │   ├── layout/                 # sidebar, mobile-nav, nav-content, topbar, admin-topbar, theme-*, user-menu
│   │   │   ├── app/                    # feature components incl. plan-card, plan-period-tabs, plan-item-row, plan-item-input, create-plan-dialog
│   │   │   └── auth/auth-form.tsx
│   │   ├── lib/
│   │   │   ├── api.ts                  # client-safe fetch wrapper (no next/headers)
│   │   │   ├── api-server.ts           # server-only (forwards cookies from RSC)
│   │   │   ├── auth.ts                 # getCurrentUser / requireUser / requireAdmin (server-only)
│   │   │   ├── types.ts                # shared TS types (incl. plan types)
│   │   │   └── utils.ts                # cn(), getInitials(), formatGreeting()
│   │   ├── middleware.ts               # cookie-presence gate for protected prefixes
│   │   ├── next.config.ts              # outputFileTracingRoot for monorepo
│   │   └── tailwind.config.ts
│   │
│   └── mobile/                         # Expo / React Native
│       ├── app/                        # file-based routes
│       │   ├── _layout.tsx             # providers + root Stack
│       │   ├── index.tsx               # redirect to /today or /login based on auth state
│       │   ├── (auth)/_layout.tsx      # guard: if already authed, redirect to /today
│       │   ├── (auth)/login.tsx, register.tsx
│       │   ├── (app)/_layout.tsx       # Tabs (today/tasks/habits/goals/reflect); settings is href:null
│       │   └── (app)/today.tsx, tasks.tsx, habits.tsx, goals.tsx, reflect.tsx, settings.tsx
│       ├── src/
│       │   ├── api/                    # client.ts (bearer fetch), types.ts, auth.ts, tasks.ts, goals.ts, habits.ts, reflections.ts
│       │   ├── auth/                   # auth-context.tsx (provider), session-store.ts (SecureStore wrapper)
│       │   ├── components/
│       │   │   ├── ui/                 # Button, Card, Input, Textarea, EmptyState, Screen
│       │   │   ├── TaskRow.tsx
│       │   │   └── HabitTile.tsx
│       │   ├── design/                 # tokens.ts (HSL strings), theme.tsx (ThemeProvider + useTheme)
│       │   └── utils/dates.ts
│       ├── app.json
│       ├── metro.config.js             # monorepo: watchFolders + nodeModulesPaths
│       ├── babel.config.js
│       └── tsconfig.json
│
├── package.json + pnpm-workspace.yaml
├── .npmrc                              # node-linker=hoisted (RN/Metro compatibility)
└── README.md
```

> `models/goal.py` and `routers/goals.py` (the legacy single-goal-with-tasks model) are still mounted but the **web** has migrated to the new `goal_plans` model. **Mobile** still consumes the legacy `/goals` endpoint — migrating it is a follow-up.

---

## 4. Backend architecture

### 4.1 Module boundaries

`routers/` → `services/` (only when non-trivial) → `models/`. No repository layer; SQLAlchemy is the persistence interface. Pydantic schemas live separately from ORM models. Routers depend on `deps.get_current_user` or `deps.require_admin` — those are the only auth surfaces.

### 4.2 Session auth, two presentation modes

Both modes resolve to the **same `sessions` table**. The difference is purely transport.

**Cookie mode (web):**
- `aether_sid` — HttpOnly, Secure (prod), SameSite=Lax, 256-bit random URL-safe ID; opaque
- `aether_csrf` — same flags except **not HttpOnly** (JS reads it to mirror in `X-CSRF-Token` header)
- `POST /auth/register`, `POST /auth/login` set both cookies on the response

**Bearer mode (mobile):**
- `POST /auth/mobile/register`, `POST /auth/mobile/login` return `{ session_id, expires_at, user }` in JSON
- Mobile stores `session_id` in `expo-secure-store`
- Subsequent requests send `Authorization: Bearer <session_id>`
- **CSRF is skipped** — bearer requests cannot be cross-site forged by a victim's browser

**Shared resolver (`deps.get_current_user`):**
1. Prefer `Authorization: Bearer <token>` if present, else fall back to `aether_sid` cookie
2. Join `sessions` + `users` → 401 if missing / expired / user disabled
3. **If method is unsafe AND auth was cookie-based**: enforce `X-CSRF-Token` == `aether_csrf` cookie == `sessions.csrf_token`
4. Throttled `last_seen_at` bump (writes only if > 60s stale)
5. Attaches `request.state.session` and `request.state.auth_method` for downstream use

**Logout** — `POST /auth/logout`. Reads the session ID from `request.state.session.id`, not the cookie — so it works for both auth modes. Cookie-deletion headers are set unconditionally; they're no-ops for bearer clients.

**Password hashing** — argon2id, `time_cost=3, memory_cost=64 MiB, parallelism=2`.
**Rate limiting** — `slowapi` `10/minute/IP` on every `/auth/*` endpoint (cookie and mobile).

### 4.3 Why two endpoint pairs (`/auth/login` + `/auth/mobile/login`)?

Chose **separate paths** over header-based content negotiation because:

1. **Explicit contract.** Response shapes differ (cookies vs token). Different URLs avoid conditional response logic.
2. **No cookie pollution.** A mobile client that forgot a magic header wouldn't accidentally receive `Set-Cookie` it can't use.
3. **Independent evolution.** Future per-platform rate limits / audit fields stay clean.
4. **Auditability.** Searching `/auth/mobile/` finds every mobile auth path.

Cost: ~20 lines of duplication, mitigated by sharing `session_service._create_session_row()`.

### 4.4 RBAC

Two roles: `user`, `admin`. Stored as a column on `users` with CHECK constraint.

`require_admin` returns **404** (not 403) when called by a non-admin — admin endpoints feel "non-existent" to regular users. Web mirrors this: the admin link only renders when `user.role === 'admin'`, and admin pages call `requireAdmin()` server-side. Mobile has no admin surface.

### 4.5 Streak computation

`streak_service.compute_streak(habit_id, today)`:
1. SELECT distinct completed dates for the habit (LIMIT 400 — caps unbounded growth)
2. Walk backward from `today` (or `today - 1` if today not completed) until a gap
3. Return the count

Called on every habit list response and on every `/habits/{id}/tick`. Acceptable for MVP; real fix is materializing `current_streak` on `habits`.

### 4.6 Goals — period math & status

`services/plan_periods.py` is the **only** authority for fixed-period bounds:
- Week: Monday → Sunday of the week containing `today`
- Month: 1st → last day
- Year: Jan 1 → Dec 31
- Decade: Jan 1 of `today.year` → Dec 31 of `today.year + 10`
- Custom: user-provided `period_start` / `period_end`

The router never trusts client-provided dates for fixed periods.

`progress_label()` returns `(day_index, total_days, label)`:
- Week → "Day 3 of 7"
- Month/Year/Custom → "Day N of M"
- Decade → "Year N of 10"

**Status is stored AND computed.**
- Stored `status`: written to DB; flipped to `completed` when last item is checked, back to `active` when uncheck
- `effective_status` (computed on every read): adds the third value `missed` when `today > period_end` and the plan isn't `completed`

This avoids needing a background job to mark "missed" at period boundaries. Read-time computation is cheap.

### 4.7 Soft deletes

`goals`, `tasks`, `habits`, `goal_plans`, `goal_plan_items` use `deleted_at TIMESTAMPTZ`; all read queries filter `WHERE deleted_at IS NULL`. `sessions`, `habit_entries`, `reflections` hard-delete.

### 4.8 Datetime handling

All time columns are `TIMESTAMPTZ`. SQLAlchemy model columns explicitly use `DateTime(timezone=True)` — without it asyncpg casts to `TIMESTAMP WITHOUT TIME ZONE` and crashes comparing to `datetime.now(timezone.utc)`. Caught at runtime during initial smoke testing, now permanently in.

---

## 5. Web architecture

### 5.1 Route groups (App Router)

- `(auth)` — `/login`, `/register`. Public. Each page calls `getCurrentUser()` server-side and redirects authenticated users to `/dashboard`.
- `(app)` — `/dashboard`, `/tasks`, `/goals`, `/habits`, `/reflect`. Protected. Layout calls `requireUser()` and renders the desktop `Sidebar`, `MobileNav` sheet, the page body, and the global `CommandBar`.
- `(admin)` — `/admin/users`, `/admin/metrics`. Protected + role-gated.
- Top-level `/` — landing page, redirects authenticated users to `/dashboard`.

The `/goals` route name is preserved, and the UI now says **"Goals"**. The API path `/goal-plans` remains for compatibility.

### 5.2 Server / client component split

Default to **Server Components** for data reads. Page files are async, fetch via `apiServer()` directly, render. Client Components opt in with `"use client"` and are limited to:
- Forms (`auth-form`, `task-input`, `plan-item-input`, `create-plan-dialog`, `reflection-editor`)
- Optimistic UI (`task-row`, `habit-tile`, `plan-item-row`)
- Stateful UI (`command-bar`, `mobile-nav`, `theme-toggle`, `user-menu`)
- Tables with row actions (`admin-user-row`)

This keeps the client bundle small. RSC pages forward cookies to the API automatically via `lib/api-server.ts`.

### 5.3 Two API client files (important split)

- `lib/api.ts` — **client-safe**. Exports `api()`, `ApiError`, `buildRequest`, `parseOrThrow`. No imports from `next/headers`. Safe from any Client Component. Reads CSRF from `document.cookie`, includes credentials, sets `X-CSRF-Token` on mutations.
- `lib/api-server.ts` — **server-only**. Imports `cookies` from `next/headers`. Exports `apiServer()` and `apiServerSafe()`, which forward request cookies as a `Cookie:` header to FastAPI.

History: originally one file. A Client Component (`auth-form.tsx`) transitively imported `next/headers` → build failed. Split fixed it.

### 5.4 Goals UI

`/goals` accepts `?period=week|month|year|decade|custom` (default: `week`).

- **PlanPeriodTabs** — segmented control, updates the URL query param
- **PlanCard** — title, formatted date range, progress label + bar, success/missed banner, item list with checkboxes, inline "add goal" input, dropdown for delete
- **CreatePlanDialog** — single dialog handles all 5 period types; only custom shows date pickers (start defaults to today)
- For fixed periods, the page expects 0 or 1 plan and renders single PlanCard or EmptyState
- For custom, renders a list of all custom plans (each its own PlanCard)

The dashboard now shows the **current week's goal** as a clickable summary card.

### 5.5 Layout shell & mobile (web) responsiveness

Desktop: persistent sidebar (`hidden md:flex`, width 60).
Mobile (`<768px`): sidebar is hidden. The Topbar shows a hamburger button that dispatches a `aether:nav-open` custom event. A `MobileNav` component (Radix Dialog, slide-from-left) listens for it and renders the same `NavContent` component as the desktop sidebar — single source of truth for nav items.

Admin layout has its own `AdminTopbar` with the same hamburger pattern.

### 5.6 Command bar (⌘K)

Global. Uses `cmdk` inside a Radix Dialog with an `sr-only` `DialogTitle` (a11y). Two groups: **Create** (quick-add task from input text) and **Navigate** (jumps to a route). Triggers: ⌘/Ctrl+K, the "Quick" button in Topbar, or any `window.dispatchEvent(new Event("aether:command-open"))`.

### 5.7 Theme system

`next-themes` with `attribute="class"`, `defaultTheme="system"`. Tokens are CSS variables in `app/globals.css`; Tailwind references them so every component uses `bg-surface text-fg border-border` etc.

**Accent color (refined):**
- Light: `hsl(218 90% 52%)` — calm cobalt, white text
- Dark: `hsl(213 94% 68%)` — luminous sky blue, white text
- Same white-on-blue contrast in both modes for crispness

### 5.8 Middleware

`middleware.ts` only checks for `aether_sid` cookie presence on protected prefixes; redirects to `/login?next=…` if missing. **Does not validate** the session — real validation happens server-side in `requireUser()` via `/me`. Window of trust is one request.

### 5.9 Next config

`next.config.ts` sets `outputFileTracingRoot: path.join(__dirname, "../..")`. Required for the pnpm hoisted layout so Next's internal webpack loaders (e.g. `next-flight-client-entry-loader`) resolve reliably.

---

## 6. Mobile architecture

### 6.1 Routing (Expo Router)

File-based, two route groups:
- `(auth)/login.tsx`, `(auth)/register.tsx` — `(auth)/_layout.tsx` is a Stack. If already authenticated, `<Redirect href="/today" />`.
- `(app)/_layout.tsx` is a `<Tabs>` with Today, Tasks, Habits, Goals, Reflect. Settings is in the same group but uses `options={{ href: null }}` so it doesn't show in the tab bar — pushable as a regular screen from Today's header.
- `app/index.tsx` redirects to `/today` or `/login` based on auth state.

### 6.2 Auth flow

`AuthProvider` on mount:
1. Reads token from `expo-secure-store`
2. If no token → `status: "unauthenticated"`
3. If token → calls `/me` to validate → on 200, `status: "authenticated"` + user; on 401, the API client's central 401 hook clears SecureStore and resets state

Login / register call `/auth/mobile/login|register`, store the returned `session_id`, set context state. Logout calls `/auth/logout` (bearer) and clears local state.

**Central 401 handling:** the API client's `setUnauthorizedHandler()` is wired by the AuthProvider; any 401 anywhere triggers a single `clearLocal()` → declarative `<Redirect>` in the route-group layout sends the user back to login.

### 6.3 State

No global state library. Auth context is the only context. Each screen:
- Holds its own list/form local state
- Refetches via `useFocusEffect(useCallback(load, [load]))` on focus
- Optimistic UI only on cheap-to-rollback toggles (task complete, habit tick)

### 6.4 Design parity with web

`src/design/tokens.ts` mirrors the web palette using `hsl(...)` strings (React Native accepts them since RN 0.59+). `useTheme()` returns the resolved scheme (`light` | `dark`) and tokens. Theme preference (`light` / `dark` / `system`) persists via AsyncStorage.

Bottom tab bar uses `useSafeAreaInsets()` so the iPhone home indicator doesn't overlap icons — `height = 54 + insets.bottom`, `paddingBottom = insets.bottom`.

### 6.5 Mobile config + pnpm

- `metro.config.js` — monorepo setup: `watchFolders = [workspaceRoot]`, `nodeModulesPaths` covers both app and root, `disableHierarchicalLookup: true`.
- `.npmrc` at workspace root — `node-linker=hoisted`. pnpm's strict symlinked layout fights Metro for transitive deps like `invariant` and `@babel/runtime`. Hoisted mode keeps the lockfile + workspace benefits but installs flat.

### 6.6 Mobile is still on legacy `/goals`

Mobile's Goals screen and dashboard use the **old** `/goals` endpoints (single goal title + attached tasks model). The web uses `/goal-plans` (period + checklist items) and presents it as Goals. Mirroring the web Goals UI on mobile is straightforward — same backend, same schemas, similar component tree — but is deferred.

---

## 7. Database schema

```
users
  id              uuid pk default gen_random_uuid()
  email           varchar(255) unique not null
  password_hash   text not null               -- argon2id
  role            varchar(16) not null = 'user'  CHECK (role IN ('user','admin'))
  is_disabled     boolean not null = false
  created_at, updated_at  timestamptz

sessions
  id              varchar(64) pk              -- url-safe random 256-bit
  user_id         uuid fk -> users (cascade)
  csrf_token      varchar(64) not null
  created_at, expires_at, last_seen_at  timestamptz
  user_agent      varchar(512) nullable
  ip_address      inet nullable
  idx (user_id), idx (expires_at)

goals                                          -- legacy; mobile still reads
  id              uuid pk
  user_id         uuid fk -> users (cascade)
  title           varchar(200) not null
  description     text nullable
  target_date     date nullable
  status          varchar(16) not null = 'active'   -- active|done|archived
  created_at, updated_at, deleted_at  timestamptz
  idx (user_id)

tasks
  id              uuid pk
  user_id         uuid fk -> users (cascade)
  goal_id         uuid fk -> goals (set null)       -- legacy linkage
  title           varchar(280) not null
  priority        smallint nullable
  due_date        date nullable
  completed_at    timestamptz nullable
  created_at, updated_at, deleted_at  timestamptz
  idx (user_id, completed_at), idx (goal_id)

goal_plans                                     -- web Goals UI, stable API name
  id              uuid pk
  user_id         uuid fk -> users (cascade)
  period_type     varchar(16) not null    CHECK IN ('week','month','year','decade','custom')
  title           varchar(200) not null
  period_start    date not null
  period_end      date not null           CHECK period_end >= period_start
  status          varchar(16) not null = 'active'  CHECK IN ('active','completed','missed')
  created_at, updated_at, deleted_at  timestamptz
  idx (user_id)
  UNIQUE INDEX (user_id, period_type, period_start, period_end) WHERE deleted_at IS NULL

goal_plan_items                                -- NEW
  id              uuid pk
  plan_id         uuid fk -> goal_plans (cascade)
  title           varchar(280) not null
  notes           text nullable
  completed_at    timestamptz nullable
  position        integer not null = 0
  created_at, updated_at, deleted_at  timestamptz
  idx (plan_id, position)

habits
  id              uuid pk
  user_id         uuid fk -> users (cascade)
  name            varchar(120) not null
  cadence         varchar(16) not null = 'daily'
  created_at, deleted_at  timestamptz
  idx (user_id)

habit_entries
  habit_id        uuid fk -> habits (cascade)
  date            date
  completed       boolean not null = true
  PRIMARY KEY (habit_id, date)

reflections
  user_id         uuid fk -> users (cascade)
  date            date
  body            text not null = ''
  updated_at      timestamptz
  PRIMARY KEY (user_id, date)
```

**Migrations:**
- `0001_init.py` — initial schema (everything except plans), enables `pgcrypto`
- `0002_goal_plans.py` — `goal_plans`, `goal_plan_items`, partial unique index

**Why a partial unique index on `goal_plans`?** Soft-deleted plans must not block recreation. `WHERE deleted_at IS NULL` does the job in one constraint with one B-tree index.

---

## 8. API surface

```
POST   /auth/register                    -> 201 UserOut, sets cookies
POST   /auth/login                       -> 200 UserOut, sets cookies
POST   /auth/mobile/register             -> 201 { session_id, expires_at, user }
POST   /auth/mobile/login                -> 200 { session_id, expires_at, user }
POST   /auth/logout                      -> 204, revokes current session (cookie or bearer)
GET    /me                               -> 200 UserOut | 401

GET    /tasks?filter=open|all|completed  -> [TaskOut]
POST   /tasks                            -> 201 TaskOut
PATCH  /tasks/{id}                       -> 200 TaskOut   (body may include {completed: bool})
DELETE /tasks/{id}                       -> 204           (soft)

GET    /goals                            -> [GoalOut]              # legacy
POST   /goals                            -> 201 GoalOut             # legacy
PATCH  /goals/{id}                       -> 200 GoalOut             # legacy
DELETE /goals/{id}                       -> 204                     # legacy
GET    /goals/{id}/progress              -> {total, completed, percent}   # legacy

GET    /goal-plans?period_type=week|month|year|decade|custom   -> [GoalPlanFull]
POST   /goal-plans                       -> 201 GoalPlanFull
GET    /goal-plans/{id}                  -> GoalPlanFull
PATCH  /goal-plans/{id}                  -> GoalPlanFull
DELETE /goal-plans/{id}                  -> 204
POST   /goal-plans/{id}/items            -> 201 GoalPlanItemOut

PATCH  /goal-plan-items/{item_id}        -> GoalPlanItemOut          (body may include {completed: bool})
DELETE /goal-plan-items/{item_id}        -> 204

GET    /habits                           -> [HabitWithStreak]
POST   /habits                           -> 201 HabitOut
DELETE /habits/{id}                      -> 204
POST   /habits/{id}/tick                 -> {streak}                 (body: {date, completed})
GET    /habits/{id}/streak               -> {streak}

GET    /reflections/{YYYY-MM-DD}         -> ReflectionOut            (empty stub if no row)
PUT    /reflections/{YYYY-MM-DD}         -> ReflectionOut            (upsert)

GET    /admin/users?q=                   -> [UserOut]                (admin; 404 to non-admins)
PATCH  /admin/users/{id}                 -> UserOut                  (body: {is_disabled?, role?})
GET    /admin/metrics                    -> {user_count, active_7d, tasks_created_7d, habits_total}

GET    /health                           -> {ok: true}
```

`GoalPlanFull` includes the plan, its sorted `items[]`, `effective_status` (active/completed/**missed**), and `progress` (counts + day-in-period label).

**CSRF** is enforced on mutating cookie-authenticated requests only. Bearer requests bypass CSRF.

---

## 9. Design system

### 9.1 Tokens (CSS variables, HSL channels only)

| Token         | Light                | Dark              |
|---------------|----------------------|-------------------|
| `bg`          | `0 0% 99%`           | `222 14% 7%`      |
| `surface`     | `0 0% 100%`          | `222 14% 10%`     |
| `fg`          | `220 13% 12%`        | `210 20% 96%`     |
| `muted`       | `220 9% 46%`         | `215 12% 65%`     |
| `subtle`      | `220 14% 96%`        | `222 12% 14%`     |
| `border`      | `220 13% 91%`        | `222 12% 18%`     |
| `accent`      | `218 90% 52%`        | `213 94% 68%`     |
| `accent-fg`   | `0 0% 100%`          | `0 0% 100%`       |
| `danger`      | `0 70% 55%`          | `0 70% 60%`       |
| `success`     | `152 56% 42%`        | `152 56% 50%`     |
| `shadow`      | `220 40% 10%`        | `0 0% 0%`         |

Mobile mirrors these in `apps/mobile/src/design/tokens.ts` as `hsl(...)` strings.

### 9.2 Patterns

- **Radii** — `rounded-xl` (14px) for inputs/buttons/nav; `rounded-2xl` (20px) for cards
- **Shadows** — `shadow-soft` (cards), `shadow-lift` (dialogs/dropdowns)
- **Easing** — every transition uses `cubic-bezier(0.22, 1, 0.36, 1)` (`ease-soft`); 150–300ms
- **Typography** — Inter via `next/font/google` (web); system on mobile; sizes 12/14/16/20/24/32; `tracking-tight` on titles, `tabular-nums` on stats
- **Focus** — global `ring-focus` utility: `ring-2 ring-accent/40 ring-offset-2 ring-offset-bg`
- **Animation** — `animate-fade-up` for page entrances (4px translate + opacity). Framer Motion is not used.

### 9.3 Calm copy

Success: *"Goal completed. Strong consistency this period."*
Missed:  *"Goal not completed. Review, adjust, and continue."*

No streaks-as-pressure, no badges, no points, no "better luck next time", no confetti.

---

## 10. Security posture

**Implemented:**
- Argon2id password hashing
- Opaque session IDs (no JWT)
- HttpOnly session cookie (web) — XSS-exfil-resistant
- CSRF double-submit on cookie-authenticated mutations
- Bearer auth on mobile — no CSRF needed (no implicit ambient credentials in fetch)
- Rate limiting on every `/auth/*` (10/min/IP)
- SQL injection-safe (SQLAlchemy parameterised)
- Pydantic input validation at every router boundary
- CORS allowlist (`FRONTEND_URL` only) with credentials
- RBAC via dependency injection
- 404 (not 403) for admin endpoints — avoids leaking existence
- Partial unique index on plans prevents duplicate-period attacks
- Soft delete preserves audit trail for user-owned content
- Mobile token stored in iOS Keychain / Android encrypted SharedPreferences (`expo-secure-store`)

**Not implemented (deliberately, MVP scope):**
- Email verification, password reset
- Two-factor auth
- Session fingerprinting / IP binding
- Audit log persistence (column-level only, no UI/queries)
- Account lockout after N failed logins
- Content Security Policy, HSTS, frame-ancestors
- Database-level row-level security (app-layer `user_id` filtering instead)

---

## 11. Deliberate exclusions

- Tests (no pytest, Vitest, Playwright)
- Docker / containers
- Redis / Celery / background jobs
- AI features (planned as future extension; no agent infrastructure)
- Email / SMS / push notifications
- Real-time updates (no SSE / WebSocket)
- Charts / analytics
- Teams, sharing, collaboration
- File uploads / attachments
- Internationalization
- OAuth / social login
- React Query / SWR / Redux / Zustand (all considered, none needed for MVP scale)

---

## 12. Notable decisions & tradeoffs

1. **Sessions in Postgres, not Redis.** No extra service. Lookups hit the primary DB; fine until load demands otherwise.
2. **Opportunistic session cleanup** — expired rows deleted lazily on each `create_session` call. No cron.
3. **No background jobs.** Streaks recompute per habit list; "missed" plan status computes on read. Reminders / digests will need a runner later.
4. **Middleware only checks cookie presence.** Real validation is server-side. Edge-friendly; window of trust is one request.
5. **Two API client files on web** (`api.ts` + `api-server.ts`). Forced split because Client Components can't import `next/headers`.
6. **Bearer for mobile, cookies for web** — instead of unifying. Different transports suit different threat models; one shared `sessions` table behind both.
7. **Separate `/auth/mobile/*` endpoints** — instead of `X-Aether-Client` header detection. Explicit > clever.
8. **`router.refresh()` after mutations** instead of SWR/React Query. Optimistic UI bridges the latency. RSC re-renders are cheap at this scale.
9. **Hand-rolled UI primitives (no `shadcn add`).** Faster scaffolding, smaller surface, own the code.
10. **Composite primary keys** for `habit_entries` and `reflections`. Natural keys, clean upserts via `ON CONFLICT`.
11. **Partial unique index** for "one plan per period" — soft-delete-friendly without app-level coordination.
12. **Goal timelines = new tables, not migrated legacy goals.** Old model is materially different. New tables added alongside; legacy `/goals` left in place for mobile.
13. **pnpm `node-linker=hoisted`** — RN + Metro can't resolve under pnpm's strict symlinked layout. Hoisted keeps the lockfile + workspace benefits.
14. **`outputFileTracingRoot` in `next.config.ts`** — stabilises Next 15's internal webpack loaders in a monorepo.

---

## 13. Known issues / honest gaps

- **No tests.** Verification was manual via curl + browser. Model layer has zero coverage.
- **`/me` round-trip per protected web page.** Could be wrapped in React's `cache()` for the request lifetime. Not done.
- **Mobile auth bootstrap is two requests** (read token + `/me` validate). Acceptable but noisy at app start.
- **`compute_streak` complexity.** O(N) where N = completed habit-entries (capped at 400). Real fix: materialize `current_streak` on `habits`.
- **Mobile still on legacy `/goals`** — diverges from web's Goals UI until migrated.
- **No structured logging / request IDs.** Default FastAPI logs. Hard to trace requests in prod.
- **`secure` cookie flag only in production.** Manual mistake risk if `ENVIRONMENT` is mis-set on deploy.
- **`COOKIE_DOMAIN` empty in dev.** Works for localhost (port-agnostic cookie). Production needs `.example.com` to bridge `api.` and `www.` subdomains.
- **`/auth/register` and `/auth/login` (cookie) cannot enforce CSRF** — there's no token before the session exists. Mitigated by rate limiting + SameSite=Lax.
- **Mobile bearer auth has no token rotation.** Same `session_id` is used until logout or 14-day expiry. Refresh-token flow would be nice but isn't needed at MVP scale.
- **`goal_plans.status` storage diverges from `effective_status`** at period boundaries. Stored value lags until next item write. Acceptable because UI always reads `effective_status`.
- **Goal status / plan status transitions are unconstrained beyond CHECK** — no state machine.
- **Admin "disable user" doesn't terminate active sessions.** A disabled user is rejected on the next `/me` call (because `get_current_user` checks `is_disabled`) but until then their cached UI state is fine. Should hard-revoke sessions on disable.
- **No CI / no production deployment config** — README documents manual steps but no Dockerfile / workflows / vercel.json / fly.toml.

---

## 14. Possible next steps (rough priority)

1. **Migrate mobile to Goals** — mirror the web's UI; same backend endpoints. Highest user-visible inconsistency.
2. **Email + password reset + email verification** (Resend or Postmark)
3. **Tests** — pytest for routers (real DB via testcontainers), Vitest for client utils, one Playwright happy path, basic Detox or Maestro for mobile
4. **Reminders v1** — daily-digest email at user-configured time; needs a job runner (APScheduler in-process, or Celery if scale demands)
5. **Insights page** — weekly review showing completion %, streaks, reflection prompts
6. **AI extension point** — "design my week" — server endpoint that takes goals + recent tasks and returns a Claude-proposed plan; cache aggressively
7. **Materialize streaks** — `current_streak`, `longest_streak`, `last_completed_date` on `habits`; remove per-request computation
8. **Structured logging + request IDs** — `structlog` + middleware
9. **CSP + security headers** — middleware-level on the API; `next.config.ts` headers for the web
10. **Deploy** — Vercel (web) + Fly.io (api) + Neon (DB) + EAS for mobile

---

## 15. File-count summary

- Backend Python files: ~40
- Frontend TS/TSX files: ~60 (web) + ~40 (mobile)
- Total source files: ~140
- Lines of code: ~4–5k (rough estimate, source only)
- Alembic migrations: 2

---

## 16. How to ask follow-up questions about this codebase

Useful angles for an AI reviewer:
- **Security:** is the bearer/cookie dual-mode flow correct? Is the CSRF skip on bearer requests defensible? Any race in `_create_session_row` cleanup of expired sessions?
- **Performance:** how does this scale to 10k users with daily activity? What's the first thing to break? `/me` per page? Streak recomputation?
- **Architecture:** is the dual API client (web) and the dual auth transport (web vs mobile) appropriately decoupled, or is there an even simpler pattern?
- **Schema:** is the partial unique index the right way to enforce "one plan per period with soft delete"? Should `effective_status` be persisted via a trigger?
- **UX:** are the optimistic updates correct (toggle then delete quickly, two devices ticking the same item)?
- **Mobile parity:** what's the smallest viable mobile Goals UI that matches the web mental model without forcing a redesign?
- **Code quality:** any premature abstractions? Anything obviously over-engineered for an MVP? Anything dangerously under-engineered?

The codebase is small enough to reason about end-to-end. Direct questions get direct answers.
