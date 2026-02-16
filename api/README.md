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

- `DATABASE_URL` (pooled connection for API runtime)
- `DIRECT_URL` (direct connection for Prisma migrations)
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

Example local DB URLs:

```env
DATABASE_URL="postgresql://flowershop:flowershop@localhost:5432/flowershop_db?schema=public"
DIRECT_URL="postgresql://flowershop:flowershop@localhost:5432/flowershop_db?schema=public"
```

Neon mapping:
- `DATABASE_URL`: pooled URL (host includes `-pooler`).
- `DIRECT_URL`: direct URL (non-pooler host).

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

## Cloud Run Deployment (Planned)

Deployment automation plan is tracked here:
- `/docs/plans/CLOUD_RUN_DEPLOYMENT_PLAN.md`

Planned target:
- Build and deploy `/api` to Google Cloud Run from GitHub Actions on `main`.
- Use Workload Identity Federation (OIDC) instead of storing a GCP service-account JSON key in GitHub.

Core configuration that will be required in cloud runtime:
- `DATABASE_URL`
- `DIRECT_URL` (required if migrations are executed during deploy/CI jobs)
- `PORT` (Cloud Run injects this automatically)
- `FIREBASE_PROJECT_ID`
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PRIVATE_KEY`
- `OPENAI_API_KEY` (optional, fallback parser still works)

Before enabling automated deploys:
1. Complete GCP bootstrap (Artifact Registry, IAM roles, runtime/deployer service accounts).
2. Complete one manual `gcloud run deploy` dry run.
3. Add and validate `.github/workflows/deploy-api-cloud-run.yml`.

## Notes

- Keep Prisma schema and generated client in sync after schema changes (`npx prisma generate`).
- Update endpoint docs/examples when response contracts change (e.g., analytics `salesByDay.total`).
- For phase-by-phase implementation history, see `/docs/plans/CODE_IMPROVEMENT_PHASES.md`.
