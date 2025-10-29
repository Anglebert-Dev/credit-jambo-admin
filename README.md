# Credit Jambo – Admin Application (Monorepo)

Admin-focused transformation of the Digital Credit & Savings Platform. This monorepo contains two apps:

- backend/ – Node.js + TypeScript API (Express, Prisma, PostgreSQL, Redis, BullMQ)
- client/ – React + TypeScript SPA (Vite, Tailwind, Zustand, Axios, React Router)

## Monorepo Structure

```
credit-jambo-admin/
├── backend/
│   ├── src/
│   │   ├── common/                # exceptions, middleware, utils, types
│   │   ├── config/                # jwt, redis, swagger
│   │   ├── modules/
│   │   │   ├── auth/
│   │   │   ├── users/
│   │   │   ├── savings/           # analytics only
│   │   │   ├── credit/
│   │   │   ├── notifications/
│   │   │   └── analytics/
│   │   ├── routes/                # mounts under /api/admin
│   │   ├── __tests__/             # jest tests
│   │   └── main.ts                # app entry
│   ├── prisma/                    # schema.prisma + migrations + seed.ts
│   ├── package.json
│   ├── tsconfig.json
│   ├── jest.config.js
│   └── nodemon.json
│
└── client/
    ├── src/
    │   ├── common/
    │   │   ├── components/        # Button, Input, Select, Card, Modal, Loader, ErrorBoundary
    │   │   ├── hooks/             # useAuth, useToast
    │   │   ├── types/             # auth.types, api.types, user.types
    │   │   └── utils/             # storage.util, format.util, validation.util
    │   ├── config/                # api.config (/api/admin), routes.config
    │   ├── layouts/               # AuthLayout, DashboardLayout
    │   ├── pages/
    │   │   ├── auth/              # LoginPage
    │   │   ├── dashboard/         # DashboardPage
    │   │   ├── users/             # UsersPage, UserDetailsPage
    │   │   ├── credits/           # CreditsPage, CreditDetailsPage
    │   │   ├── profile/           # ProfilePage
    │   │   └── notifications/     # NotificationsPage
    │   ├── routes/                # AppRoutes, PrivateRoute
    │   ├── services/              # api + feature services
    │   ├── store/                 # authStore, uiStore
    │   ├── App.tsx
    │   └── main.tsx
    ├── index.html
    ├── package.json
    └── vite.config.ts
```

## Tech Stack

- Backend: Node.js, TypeScript, Express, Prisma (PostgreSQL), ioredis (Redis), BullMQ, JWT, Helmet, CORS, Swagger (OpenAPI), Jest + Supertest
- Frontend: React, TypeScript, Vite, Tailwind CSS, Zustand, Axios, React Router

## Admin Scope (What this app does)

- Admin-auth only: all protected APIs require `role=admin`
- Auth: admin login/refresh/logout, session/device tracking
- Users: list, details, update status, soft delete; activity from `refresh_tokens`
- Credit: list requests, details with repayments, approve (with optional interest rate), reject
- Savings: analytics only (totals)
- Notifications: create/list/mark as read
- Analytics KPIs for dashboard
- Swagger docs under `/api/admin/...`

## Features

### Backend (API)
- JWT auth with refresh tokens and role enforcement (admin-only middleware)
- Session/device tracking stored in `refresh_tokens` (IP, device, expiry, revoked)
- Users
  - List with pagination, filtering (role, status, email), sorting
  - Details with savings snapshot, credit summary, recent logins, devices, active sessions
  - Update status (`active|suspended|pending|deleted`) and soft delete
- Credit
  - List requests with pagination/filtering/sorting
  - Request details with user + repayment history
  - Approve with optional interest rate override; Reject with reason
- Savings
  - Admin analytics only (total balance, accounts, deposits/withdrawals counts)
- Notifications
  - Create queued in-app notifications, list, mark as read
- Analytics
  - KPIs: total/active users, credit by status, total savings balance, active sessions, logins in last 24h

How it works (high level)
- All protected routes sit under `/api/admin/*` and pass through `authMiddleware` which verifies JWT and `role=admin`.
- Access tokens expire quickly (default 15m). Axios interceptor refreshes using `/api/admin/auth/refresh` and updates storage.
- Every login/refresh records a refresh token row capturing device/IP and expiry to power activity analytics.
- Prisma models: `users`, `refresh_tokens`, `savings_accounts`, `transactions`, `credit_requests`, `credit_repayments`, `notifications`.

### Frontend (Admin SPA)
- Auth: admin login, auto token refresh, logout; persisted auth state (Zustand + localStorage)
- Dashboard: KPIs from `/analytics/overview` and savings analytics card
- Users: responsive list + details views with activity, device list, status controls
- Credits: responsive list + details; approve with optional interest rate, reject with reason
- Notifications: list with unread badge and mark-as-read
- Responsive UI: mobile card views for lists; custom in-DOM Select component so dropdowns align on small screens

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- Redis 6+

### Backend (Admin API)
Seeder creates/updates an admin user. Configure via env then run migrations and seed. Admin endpoints are mounted under `/api/admin/*`.
```
cd backend
cp .env.example .env    # adjust env vars
npm install
npm run prisma:generate
npm run prisma:migrate  # or: npx prisma migrate dev
# seed admin
npm run prisma:seed
npm run dev             # http://localhost:3000 (Admin API)
```
Swagger (Admin): http://localhost:3000/api/docs

Minimal .env
```
PORT=3000
API_PREFIX=/api
DATABASE_URL=postgresql://user:password@localhost:5432/credit_jambo
REDIS_URL=redis://localhost:6379
JWT_SECRET=supersecret
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=superrefreshsecret
JWT_REFRESH_EXPIRES_IN=7d
# Seeder/admin
ADMIN_EMAIL=admin@creditjambo.com
ADMIN_PASSWORD=Admin@12345
ADMIN_PHONE=+250788000000
ADMIN_ROTATE_PASSWORD=false
```

### Frontend (Admin SPA)
```
cd client
npm install
npm run dev             # http://localhost:5001 (Admin SPA)
```
Optional client .env
```
VITE_API_BASE_URL=http://localhost:3000/api
VITE_API_TIMEOUT=30000
```

## Scripts
Backend: `dev`, `build`, `start`, `prisma:migrate`, `prisma:seed`, 

Frontend: `dev`, `build` , `test`

## Testing


Frontend (Vitest + Testing Library)
- Integration tests live in `client/src/__tests__/` (e.g., `UsersPage.int.test.tsx`).
- Run:
```
cd client && npm run test
```

## CI
GitHub Actions runs build/tests for backend and build for client on every push and PR to `main`.
Workflow: `.github/workflows/ci.yml`.

## License
MIT © Credit Jambo Ltd
