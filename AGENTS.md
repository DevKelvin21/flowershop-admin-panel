# AGENTS.md

Guidance for AI agents working in this repository. Aligns with `CLAUDE.md`. Migration plan phases **1–4 are complete**; AI integration (OpenAI + BullMQ) is in place. Next focus: Phase 5 optimization.

## Project Overview
- Monorepo with **frontend `/web`** (React 19 + TypeScript + TanStack Router/Query) and **backend `/api`** (NestJS + Prisma + PostgreSQL).
- Migration off Firebase BaaS is finished. Frontend talks to the NestJS REST API; Firebase is kept for auth token issuance.
- Current services: Backend on `http://localhost:8000` (`/api/v1` prefix), Frontend on `http://localhost:5173`, Swagger at `http://localhost:8000/api/docs`.

## Migration Status (Done)
- ✅ Phase 1: Backend foundation — PostgreSQL schema (Inventory, InventoryLoss, Transaction, TransactionItem, AiTransactionMetadata, AuditLog), global error handling, Firebase Auth guard, audit logging, health check.
- ✅ Phase 2: Core API modules — Inventory (9 endpoints), Transactions (7 endpoints), DTO validation, Swagger docs, automatic inventory updates/analytics.
- ✅ Phase 3: Frontend migration — TanStack Router (file-based), TanStack Query data layer, HTTP API client with Firebase token injection, Inventory losses merged as tabs, Financial module wired to real API.
- ✅ Phase 4: AI integration — OpenAI-backed transaction parsing with BullMQ/Redis queue, AI metadata stored, `/api/v1/ai/parse-transaction` available, frontend flow pre-fills transactions from AI results.
- ⏭️ Next: Phase 5 optimization/polish; Phase 6 deployment hardening.

## Commands
- Frontend (`/web`): `npm install`; `npm run dev`; `npm run build`; `npm run preview`; `npm run lint`.
- Backend (`/api`): `npm install`; `npm run prisma:generate`; `npm run start:dev`; `npm run start:prod`; `npm run build`; `npm run prisma:migrate`; `npm run test`; `npm run test:e2e`; `npm run test:cov`.
- Data: `npx prisma studio` for DB GUI.

## Frontend Architecture (`/web/src`)
- **Service registry (critical)**: `/web/src/services/registry.ts` centralizes singletons (logging → auth → repositories → domain services). Import services from `../services` or `../services/registry`; never instantiate directly.
- **Repository pattern**: interfaces in `repositories/interfaces/`, implementations (legacy Firebase + HTTP) created via `repositories/factory.ts`; services encapsulate business logic in `repositories/services/`.
- **Routing**: TanStack Router file-based under `routes/`:
  - `__root.tsx` (providers), `_authenticated.tsx` (auth layout), `_authenticated/index.tsx` (dashboard), `_authenticated/inventory.tsx`, `_authenticated/financial.tsx`, `login.tsx`.
- **Data fetching**: TanStack Query hooks in `hooks/queries/` and mutations; query key helpers per domain. Optimistic updates and automatic invalidation used for mutations.
- **View pattern**: Containers handle data/services; `*View.tsx` components are presentational with grouped props (`filters`, `table`, `modals`). Hooks accept services as params for DI (`useInventory(inventoryService)`).
- **Auth flow**: Firebase SDK init in `/web/src/db/firestore.ts`; `AuthService` interface + `useAuth`; protected routes wrapped under `_authenticated`. HTTP client injects Firebase ID token into API calls.

## Backend Architecture (`/api/src`)
- Modules: Prisma (global), Audit (global), Inventory, Transactions, AI (queue-backed), plus supporting common layer (filters, guards, interceptors, decorators).
- Global infra: `HttpExceptionFilter`, `AuditLogInterceptor`, `ValidationPipe`, `FirebaseAuthGuard` (all routes protected except `@Public()` health).
- AI: BullMQ processor for transaction parsing, OpenAI prompt builds from current inventory, results stored in `AiTransactionMetadata`.
- Endpoints (base `http://localhost:8000/api/v1`): 19+ endpoints covering health, audit logs, inventory CRUD/losses, transactions CRUD/analytics/summary, AI parse endpoint.
- Database: PostgreSQL schema in `/api/prisma/schema.prisma` with six models; indexes on hot paths and relations.

## Environment Variables
- Frontend (`/web/.env`): `VITE_FIREBASE_*` keys (API key, auth domain, project ID, storage bucket, messaging sender ID, app ID, measurement ID).
- Backend (`/api/.env`):
  - Required: `DATABASE_URL`, `PORT`.
  - Firebase Admin (for auth validation): `FIREBASE_PROJECT_ID`, `FIREBASE_PRIVATE_KEY`, `FIREBASE_CLIENT_EMAIL`.
  - AI/Queue: `OPENAI_API_KEY`, `REDIS_HOST`, `REDIS_PORT`.
  - See `/api/.env.example` for full template.

## UI System (web)
- shadcn/ui + Radix primitives under `web/src/components/ui/`; variants with `class-variance-authority`; `cn()` from `@/lib/utils`; supports `asChild` Slot.
- TailwindCSS 4 with CSS variables (light/dark) in `web/src/index.css`; dark mode toggled in Navbar using Radix Switch + localStorage.
- Key primitives: button, badge, input, select, popover, calendar (react-day-picker), navigation-menu, switch.
- Icons: Lucide (primary); Font Awesome is legacy.
- Filters component (`web/src/components/Filters.tsx`): search, multi-selects, date range; typed props grouped by concern.

## Coding Conventions
- Strict TypeScript, 2-space indent, no default exports for React components. Path alias `@/` everywhere.
- Components/services/hooks use PascalCase; repositories end with `Repository`; hooks prefixed with `use`.
- Views remain dumb; remote calls live in repositories/services. Group props by concern in view components.
- Error handling pattern: normalize unknown errors to messages; use `void` on floating promises when intentional.

## Testing
- Backend: Jest unit tests alongside sources; e2e under `/api/test`.
- Frontend: Vitest + React Testing Library planned; place specs beside components/hooks. Mock network via MSW when needed.

## Adding Features (frontend)
1) Define types in `shared/models/`.  
2) Add repository interface in `repositories/interfaces/`.  
3) Implement repository (HTTP) and update `repositories/factory.ts`.  
4) Register in `services/registry.ts` (respect init order).  
5) Create hooks (`hooks/`) using services as params.  
6) Build container in `routes/_authenticated/*` or feature folder; presentational view stays pure.

## Gotchas / Reminders
- Service registry ordering matters—never instantiate services manually.
- All API calls require Firebase ID token (except `/health`); backend validates via Firebase Admin.
- Audit logging auto-applies to mutations via decorator/interceptor.
- Prisma client must be regenerated after schema changes: `npm run prisma:generate`.
- AI endpoint is queue-backed; ensure Redis is running when exercising Phase 4 features.
