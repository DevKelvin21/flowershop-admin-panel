# Backend (`/api`)

NestJS REST API for Floristeria Morales admin panel.

## Stack

- NestJS
- TypeScript
- Prisma ORM
- PostgreSQL
- Firebase Admin SDK (auth token verification)
- OpenAI SDK (sync parser primary path)

## Run locally

```bash
npm install
```

Create `.env` from `.env.example`, then generate Prisma client and migrate:

```bash
npx prisma generate
npx prisma migrate dev
```

Start API:

```bash
npm run start:dev
```

Default base URL: `http://localhost:8000/api/v1`
Swagger: `http://localhost:8000/api/docs`

## Environment variables

Required:

- `DATABASE_URL`
- `PORT`
- `FIREBASE_PROJECT_ID`
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PRIVATE_KEY`

AI-related:

- `OPENAI_API_KEY` (optional; fallback parser keeps endpoint usable)
- `AI_TIMEOUT_MS`
- `AI_RETRY_ATTEMPTS`
- `AI_MAX_PROMPT_CHARS`
- `AI_MAX_RESPONSE_TOKENS`
- `AI_MAX_CONTEXT_ITEMS`
- `AI_CACHE_TTL_MS`

## PostgreSQL on macOS (Homebrew)

```bash
brew install postgresql@14
brew services start postgresql@14
pg_isready -h localhost -p 5432
```

Create role and database:

```bash
psql postgres
CREATE ROLE flowershop WITH LOGIN PASSWORD 'flowershop';
CREATE DATABASE flowershop_db OWNER flowershop;
\q
```

Example connection string:

```env
DATABASE_URL="postgresql://flowershop:flowershop@localhost:5432/flowershop_db?schema=public"
```

## Scripts

```bash
npm run start:dev
npm run build
npm run lint
npm run test
npm run test:e2e
npm run test:cov
```

## Modules

- `InventoryModule`
- `TransactionsModule`
- `AiModule`
- `AuditModule`
- `PrismaModule` (global)

Global infrastructure includes validation pipe, exception filter, Firebase auth guard, and audit interceptor.

## API overview

Core endpoints (prefix `/api/v1`):

- `/health`
- `/inventory` + losses/history endpoints
- `/transactions` + summary/analytics endpoints
- `/ai/parse-transaction`

### AI parse behavior

`POST /ai/parse-transaction` is synchronous:

1. Tries OpenAI with timeout + retry for transient errors.
2. Falls back to a rule-based parser if OpenAI fails/unavailable.
3. Applies cost controls (prompt/context/token caps) and short-window dedupe cache.

## Validation

```bash
npm run lint
npm run build
npm run test -- --runInBand
npm run test:e2e
```

## Notes

- Keep Prisma schema and generated client in sync after schema changes (`npx prisma generate`).
- Update endpoint docs/examples when response contracts change (e.g., analytics `salesByDay.total`).
- For phase-by-phase implementation history, see `/docs/plans/CODE_IMPROVEMENT_PHASES.md`.
