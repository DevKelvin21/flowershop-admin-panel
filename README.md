# Flowershop Admin Panel

Monorepo for Floristeria Morales admin operations.

- Frontend: `/web` (React 19 + TypeScript + TanStack Router/Query + Tailwind v4)
- Backend: `/api` (NestJS + Prisma + PostgreSQL)

## Current status

Migration away from Firebase Firestore is complete for business data.

- Firebase remains for authentication token issuance.
- Backend API is the source of truth for inventory, losses, transactions, analytics, and AI parse metadata.
- AI transaction parsing is synchronous and includes fallback parsing for poor network/OpenAI outages.

## Project structure

```text
flowershop-admin-panel/
├── web/
└── api/
```

## Prerequisites

- Node.js 18+
- npm 9+
- PostgreSQL (local recommended)
- Firebase project credentials (frontend + backend auth verification)

## Local setup

### 1. Backend (`/api`)

```bash
cd api
npm install
```

Create `/api/.env` from `/api/.env.example` and set:

- `DATABASE_URL` (pooled connection for API runtime)
- `DIRECT_URL` (direct connection for Prisma migrations)
- `PORT` (optional, default 8000)
- `FIREBASE_PROJECT_ID`
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PRIVATE_KEY`
- `OPENAI_API_KEY` (optional; fallback parser still works without it)

Generate Prisma client and run migrations:

```bash
npx prisma generate
npx prisma migrate dev
```

Run backend:

```bash
npm run start:dev
```

Backend base URL: `http://localhost:8000/api/v1`
Swagger docs: `http://localhost:8000/api/docs`

### 2. Frontend (`/web`)

```bash
cd web
npm install
```

Create `/web/.env` with `VITE_FIREBASE_*` keys and optional API URL:

```env
VITE_API_URL=http://localhost:8000/api/v1
```

Run frontend:

```bash
npm run dev
```

Frontend URL: `http://localhost:5173`

## PostgreSQL on macOS (Homebrew)

```bash
brew install postgresql@14
brew services start postgresql@14
pg_isready -h localhost -p 5432
```

Create role/database:

```bash
psql postgres
CREATE ROLE flowershop WITH LOGIN PASSWORD 'flowershop';
CREATE DATABASE flowershop_db OWNER flowershop;
\q
```

Example local DB URLs:

```env
DATABASE_URL="postgresql://flowershop:flowershop@localhost:5432/flowershop_db?schema=public"
DIRECT_URL="postgresql://flowershop:flowershop@localhost:5432/flowershop_db?schema=public"
```

For Neon:
- `DATABASE_URL`: use the pooled host (`-pooler`).
- `DIRECT_URL`: use the direct host (non-pooler) from Neon connection details.

## Validation commands

### Frontend

```bash
cd web
npm run lint
npm run build
```

### Backend

```bash
cd api
npm run lint
npm run build
npm run test
npm run test:e2e
```

## Documentation

- Documentation index: `/docs/README.md`
- Frontend details: `/web/README.md`
- Backend details: `/api/README.md`
- Incremental engineering roadmap and phase log: `/docs/plans/CODE_IMPROVEMENT_PHASES.md`
- Cloud deployment plan (API): `/docs/plans/CLOUD_RUN_DEPLOYMENT_PLAN.md`
