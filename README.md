# Profectus

A calm, minimal productivity & accountability platform.
Web, mobile, and one FastAPI backend.

## Features

- **Today** — quick capture of tasks, daily habits, this week's goal at a glance
- **Tasks** — open / completed / all, with optimistic toggles
- **Goals** — week / month / year / 10-year / custom timelines with checklist items
- **Habits** — daily streak tracking, one tap to mark done
- **Journal** — structured daily execution review
- **Admin** — minimal user management + 7-day activity metrics (web only)
- **Light / Dark / System** theme, persisted

## Stack

- **Web** — Next.js 15 (App Router), React 19, TypeScript strict, Tailwind v3.4, hand-rolled shadcn primitives over Radix UI
- **Mobile** — Expo SDK 54, React Native 0.81, Expo Router 6, TypeScript strict, `expo-secure-store` for session persistence
- **API** — FastAPI, Python 3.12+, SQLAlchemy 2.0 async, Pydantic v2, Alembic
- **DB** — PostgreSQL 15+
- **Auth** — opaque session IDs in Postgres
  - Web: HTTP-only `aether_sid` cookie + CSRF double-submit
  - Mobile: `Authorization: Bearer <session_id>` (no CSRF needed)
  - Same `sessions` table, same lifecycle

## Quick start

```bash
# 1. Postgres
createdb aether

# 2. Install everything (root)
pnpm install

# 3. API
cd apps/api
cp .env.example .env             # set DATABASE_URL + SECRET_KEY
python3 -m venv .venv && source .venv/bin/activate
pip install -e .
alembic upgrade head
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# 4. Web (new terminal)
cd apps/web
cp .env.example .env.local       # NEXT_PUBLIC_API_URL=http://localhost:8000
pnpm dev

# 5. Mobile (new terminal — optional)
cd apps/mobile
cp .env.example .env             # set EXPO_PUBLIC_API_URL to your Mac's LAN IP
pnpm start                       # then press `i` for iOS simulator or scan QR with Expo Go
```

Web on `:3000`, API on `:8000`, Metro on `:8081`.

> **For physical-device testing** the mobile app needs your Mac's LAN IP in
> `EXPO_PUBLIC_API_URL` (e.g. `http://192.168.1.42:8000`) — `localhost` from
> the phone points to itself. The API must also be bound to `0.0.0.0` (not
> just `127.0.0.1`) so the phone can reach it.

## Layout

```
apps/
  api/      FastAPI backend (cookie + bearer auth)
  web/      Next.js frontend
  mobile/   Expo / React Native app
```

## First admin

After registering your first user:

```sql
UPDATE users SET role = 'admin' WHERE email = 'you@example.com';
```

## Scripts

```bash
pnpm dev:web        # frontend
pnpm dev:api        # backend
pnpm dev:mobile     # Expo dev server
pnpm build:web
```

## Notes

- pnpm uses a hoisted `node_modules` layout (`.npmrc` → `node-linker=hoisted`) so React Native / Metro can resolve transitive deps.
- The mobile app currently uses the legacy `/goals` endpoints. Web uses the newer `/goal-plans` model, presented as Goals in the UI. Mobile parity is a follow-up.
- See [AIREADME.md](AIREADME.md) for the full technical brief.
