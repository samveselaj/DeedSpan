# DeedSpan

DeedSpan is a personal productivity app for tasks, goals, habits, and daily reflection. It brings the plan and the follow-through into one place: decide what matters, track the work, and review what actually happened.

The repository contains a Next.js web app, an Expo mobile app, and a shared Python API backed by PostgreSQL.

## What you can do

The web app includes:

- **Today:** see open tasks, check off habits, and review a weekly goal.
- **Tasks and goals:** keep standalone tasks or attach them to goals with weekly, monthly, yearly, decade, or custom timelines.
- **Habits:** track daily, weekly, or monthly routines and their streaks.
- **Journal:** record what you did, what you missed, what you learned, and what to do tomorrow. Revisit entries by date.
- **Accounts and admin:** register, sign in, and sign out. Admins can manage user roles, disable accounts, and view basic activity counts.

The web interface adapts to smaller screens and supports light, dark, and system appearance.

## How it works

Both apps send requests to FastAPI, which validates input, checks who is signed in, and reads or writes their records in PostgreSQL. Next.js loads initial page data on the server; browser components handle edits and refresh the displayed data.

Passwords are hashed with Argon2. Login sessions are stored in the database: the web app uses an HTTP-only cookie with CSRF protection for changes, while mobile sends a session token stored through Expo SecureStore. The API checks record ownership and restricts admin endpoints by role.

| Part | Technologies | Location |
| --- | --- | --- |
| Web | Next.js 15, React 19, TypeScript, Tailwind CSS 3, Radix UI | `apps/web` |
| Mobile | Expo SDK 54, React Native 0.81, Expo Router | `apps/mobile` |
| API | Python 3.12, FastAPI, Pydantic, async SQLAlchemy | `apps/api` |
| Database | PostgreSQL; Alembic migrations track schema changes | `apps/api/alembic` |

## Getting started

Use macOS, Linux, or Windows PowerShell. Install Node.js with npm, the `uv` Python package manager, and PostgreSQL, then start PostgreSQL. Make sure `node`, `npm`, `uv`, and `createdb` are available in your terminal. Run the following from the repository root.

### 1. Install dependencies and create configuration files

```bash
npx pnpm@9.12.0 install
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local
```

The repository uses pnpm for dependency installation; `npx` runs the pinned version without a global pnpm installation. Once installed, the development commands below use npm.

In `apps/api/.env`, set `DATABASE_URL` to your PostgreSQL username, password, host, port, and database name. Replace the `SECRET_KEY` placeholder with a long random value. Keep `FRONTEND_URL=http://localhost:3000` for the default web port.

In `apps/web/.env.local`, keep `NEXT_PUBLIC_API_URL=http://localhost:8000` and set `API_INTERNAL_URL=http://127.0.0.1:8000`. Both must point to the running API.

### 2. Create the database and apply migrations

Create the database using your PostgreSQL user; this example uses `postgres`:

```bash
createdb -h localhost -U postgres deedspan
cd apps/api
uv sync
uv run alembic upgrade head
cd ../..
```

`uv sync` creates the backend's virtual environment using the pinned Python 3.12 version. Migrations create the database tables.

### 3. Start the app

```bash
npm run project
```

This uses `concurrently` to start the web app and API together, with labeled logs. The commands are defined in the root `package.json`; `uv run` selects the backend's virtual environment on each operating system. Open [localhost:3000](http://localhost:3000) and register an account. Interactive API documentation is available at [localhost:8000/docs](http://localhost:8000/docs). Press **Ctrl+C** to stop both services; PostgreSQL runs separately.

Keep port 3000 free. If you use another web port, update `FRONTEND_URL` in the API configuration to match and restart the API so browser requests are allowed.

To run either service separately, use `npm run dev:web` or `npm run dev:api` from the root. To check the web app:

```bash
npm --prefix apps/web run typecheck
npm --prefix apps/web run build
```

### Optional: mobile

Copy `apps/mobile/.env.example` to `apps/mobile/.env`, set `EXPO_PUBLIC_API_URL` for your simulator or device, then run:

```bash
npm --prefix apps/mobile start
```

For a physical phone, use your computer's LAN IP and the same network. Start the API separately with `uv run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000` from `apps/api` so the phone can reach it.

## Current status

The web and mobile apps are not yet at feature parity. Mobile uses the older `/goals` API and a free-text reflection screen; web uses `/goal-plans`, linked tasks, and structured journal entries. Goals created through the two APIs are separate records.

`deedspan_v0_frontend` is a standalone design prototype with demo data. The API-connected web application lives in `apps/web`.
