# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development commands

### Backend (`cd backend`)
```bash
npm run dev          # nodemon, port 3001
npm run db:migrate:dev --name <name>  # create and apply a migration
npm run db:migrate   # deploy migrations (production)
npm run db:seed      # seed admin user, default roles, and Bliss project
npx prisma studio    # visual DB browser
```

### Frontend (`cd frontend`)
```bash
npm run dev          # Vite dev server, port 5173
npm run build        # production build
```

### Environment variables

**backend/.env**
```
DATABASE_URL=postgresql://user:pass@localhost:5432/team_tracker
JWT_SECRET=<long random string>
RESEND_API_KEY=re_xxxx
FRONTEND_URL=http://localhost:5173
GOOGLE_CLIENT_ID=xxxx.apps.googleusercontent.com
ANTHROPIC_API_KEY=sk-ant-...
```

**frontend/.env.development**
```
VITE_API_URL=http://localhost:3001
VITE_GOOGLE_CLIENT_ID=xxxx.apps.googleusercontent.com
```

Default admin credentials after seed: `admin@blissmkt.ar` / `admin123`

## Architecture

### Overview
Full-stack task tracker for a marketing agency. Backend is a REST API; frontend is a React SPA. No shared code between them — they communicate only via HTTP.

### Backend (`backend/src/`)
- **Express + Prisma + PostgreSQL.** Single entry point: `index.js` mounts all routers under `/api/<resource>`.
- **Auth:** JWT (12h expiry) stored in `localStorage`. Google OAuth 2 via `google-auth-library` (ID token verification, no secret needed). The `auth` middleware attaches `req.user` (decoded JWT payload). `adminOnly` middleware gates admin routes.
- **No tests.** No test framework is configured.
- All dates for workday logic use `America/Argentina/Buenos_Aires` (UTC-3). Task timestamps are stored in UTC.
- **Email** is sent via Resend HTTP API (`src/services/email.service.js`) — not SMTP. Railway blocks outbound SMTP ports.
- **Prisma singleton** at `src/lib/prisma.js` — all controllers import from here to avoid connection pool exhaustion.
- **Shared utilities:** `src/utils/dates.js` exports `todayString()` (Buenos Aires timezone).
- **Weekly AI report** at `src/services/weeklyReport.service.js` — generates productivity analysis with Claude Haiku, sent every Friday at 14:00 ART via `node-cron`.

### Frontend (`frontend/src/`)
- **React 18 + Vite + Tailwind CSS + React Router v6.**
- `api/client.js` — Axios instance that reads `VITE_API_URL`, injects the JWT from `localStorage`, and redirects to `/login` on 401.
- `context/AuthContext.jsx` — global auth state; validates token on mount via `GET /auth/me` (hits DB, returns fresh `avatar`). Exposes `updateUser()` for local state updates without re-login.
- `context/ThemeContext.jsx` — dark mode toggle persisted to `localStorage`.
- `hooks/useRoles.js` — fetches `UserRole` list for label lookups (role names are internal strings like `"DESIGNER"`; labels are display strings like `"Diseñador"`).
- `hooks/useInactivity.js` — tracks mouse/keyboard activity; after 60 min idle on an IN_PROGRESS task shows a warning modal + Chrome notification; auto-pauses after a further 10 min.
- `utils/format.js` — shared `fmtMins()`, `activeMinutes()`, `completedDuration()`.
- `utils/linkify.js` — converts plain URLs in text to clickable `<a>` tags.

### Key domain concepts

**WorkDay:** Created automatically when a user visits the Dashboard. One per user per calendar day (keyed on `YYYY-MM-DD` in Buenos Aires time). Closing a workday (`/workdays/finish`) logs out the user. Tasks from previous days that are still PENDING/PAUSED/BLOCKED are carried over and shown in a separate section.

**Task status machine:**
```
PENDING → IN_PROGRESS → PAUSED / BLOCKED / COMPLETED
BLOCKED → IN_PROGRESS (unblock)
PAUSED  → IN_PROGRESS (resume)
```
Only one task can be `IN_PROGRESS` per user at a time (enforced on the backend via `assertNoActiveTask()`). Blocking requires a reason and notifies all project members. Completing also notifies all project members. Auto-pause on inactivity stores the task ID in `localStorage` key `autoPaused` to restore the modal after page reload.

**Starred tasks:** Up to 3 tasks can be starred simultaneously. `starred` is an Int 0–3 (0=none, 1=yellow, 2=orange, 3=red). Starred tasks appear in a dedicated "Destacadas" section above other statuses but below "En curso". A starred IN_PROGRESS task appears only in "En curso".

**Notifications:** Typed with `NotificationType` enum (`COMPLETED` / `BLOCKED`). BLOCKED notifications render with red background in the bell dropdown.

**Roles:** Dynamic — stored in the `UserRole` table, created/deleted from the Admin panel. The role string on `User.role` is the internal name (e.g. `"ADMIN"`). `ADMIN` cannot be deleted if any user holds it. Admin access unlocks Actividad, Reports, and Admin pages.

**Task assignment:** A task's `userId` is the assignee; `createdById` is set only when someone else creates the task (so `createdBy` appears in the card as "Asignada por X").

**Avatars:** Stored as filenames (e.g. `bee.png`) in `User.avatar`. Images live in `frontend/public/perfiles/`. Validated against `ALLOWED_AVATARS` list in `profile.controller.js` before saving. Referenced as `/perfiles/<filename>` in all components.

**Weekly email preference:** `User.weeklyEmailEnabled Boolean @default(true)`. Updated via `PATCH /api/profile/preferences`. The cron in `index.js` only sends to users where `active: true AND weeklyEmailEnabled: true`.

### Prisma schema notes
- `User.role` is a plain `String` (not an enum) — it references `UserRole.name`.
- When a model has two relations to the same model, named relations are required (see `Task.createdBy` / `Task.user` both pointing to `User`).
- Migrations live in `backend/prisma/migrations/`. Always use `migrate dev` locally and `migrate deploy` in production.
- Current migrations (in order): `add_missing_indexes`, `add_task_starred`, `add_user_avatar`, `add_notification_type`, `add_weekly_email_preference`.

### API routes summary
```
POST   /api/auth/login                   # email/password login
POST   /api/auth/google                  # Google OAuth (ID token)
GET    /api/auth/me                      # returns fresh user from DB (includes avatar)
POST   /api/auth/forgot-password
POST   /api/auth/reset-password

GET    /api/profile                      # full profile incl. weeklyEmailEnabled
PATCH  /api/profile                      # update personal data fields
PATCH  /api/profile/avatar               # update avatar (validated against ALLOWED_AVATARS)
PATCH  /api/profile/preferences          # update weeklyEmailEnabled
POST   /api/profile/weekly-email/send    # trigger test weekly email immediately
POST   /api/profile/change-password

GET    /api/workdays/today
POST   /api/workdays/finish

POST   /api/tasks
PATCH  /api/tasks/:id/start
PATCH  /api/tasks/:id/pause
PATCH  /api/tasks/:id/resume
PATCH  /api/tasks/:id/complete
PATCH  /api/tasks/:id/block
PATCH  /api/tasks/:id/unblock
PATCH  /api/tasks/:id/star
PATCH  /api/tasks/:id/duration           # admin only
DELETE /api/tasks/:id

GET    /api/projects                     # user's projects (or all if admin)
GET    /api/projects/:id/tasks           # project tasks grouped by user
GET    /api/realtime                     # team snapshot for today
GET    /api/reports/by-project
GET    /api/reports/by-user
GET    /api/reports/by-user-summary
GET    /api/reports/mine

GET    /api/notifications
POST   /api/notifications/read-all
```

### Frontend routes
```
/login            → Login2.jsx
/forgot-password  → ForgotPassword.jsx
/reset-password   → ResetPassword.jsx
/                 → Dashboard.jsx        (PrivateRoute)
/my-reports       → MyReports.jsx        (PrivateRoute)
/my-projects      → MyProjects.jsx       (PrivateRoute)
/my-projects/:id  → ProjectDetail.jsx    (PrivateRoute)
/profile          → MyProfile.jsx        (PrivateRoute)
/preferences      → Preferences.jsx      (PrivateRoute)
/realtime         → RealTime.jsx         (PrivateRoute)
/reports          → Reports.jsx          (AdminRoute)
/admin            → Admin.jsx            (AdminRoute)
```

### Deploy
- **Backend:** Railway (auto-runs `npm run db:migrate` on deploy; seed must be run manually once via Railway Shell). Add `GOOGLE_CLIENT_ID` and `ANTHROPIC_API_KEY` to Railway env vars.
- **Frontend:** Vercel (root: `/frontend`; `vercel.json` rewrites all paths to `index.html` for SPA routing). Add `VITE_GOOGLE_CLIENT_ID` to Vercel env vars.
