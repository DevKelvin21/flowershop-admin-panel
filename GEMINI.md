# GEMINI.md

This file provides guidance to Gemini when working with code in this repository.

## Project Overview

This is a **monorepo** for a flower shop management system with:
- **Frontend (`/web`)**: React 19 + TypeScript + TanStack Router/Query + NestJS API
- **Backend (`/api`)**: NestJS + Prisma + PostgreSQL (fully functional)

The project has **completed migration** from Firebase Backend-as-a-Service to a custom NestJS REST API. The frontend now uses TanStack Router for routing and TanStack Query for data fetching. AI-powered transaction parsing is also integrated.

### 🚧 Current Migration Status

**Phase 1, 2, 3 & 4 Complete** (2025-12-14)

✅ **Phase 1: Backend Foundation** - COMPLETE
- PostgreSQL database with 6 models (Inventory, InventoryLoss, Transaction, TransactionItem, AiTransactionMetadata, AuditLog)
- Global error handling with consistent responses
- Firebase Auth Guard protecting all routes
- Audit logging interceptor for all mutations
- Health check endpoint

✅ **Phase 2: Core API Modules** - COMPLETE
- **Inventory Module**: 9 endpoints (CRUD + loss tracking)
- **Transactions Module**: 7 endpoints (CRUD + analytics)
- Complete Swagger documentation
- DTOs with validation (class-validator)
- Automatic inventory updates on transactions
- Financial summary and analytics endpoints

✅ **Phase 3: Frontend Migration** - COMPLETE
- **TanStack Router**: File-based routing with type safety
- **TanStack Query**: Data fetching with caching & optimistic updates
- **HTTP API Client**: Automatic Firebase token injection
- **UI Consolidation**: Losses merged into Inventory page as tabs
- **Financial Module**: Connected to real API (no more mock data)

✅ **Phase 4: AI Integration** - COMPLETE
- **AI-Powered Parsing**: `AiTransactionInput.tsx` allows parsing natural language into transactions.
- **Queue-Based Processing**: Uses Redis and BullMQ for non-blocking AI jobs.
- **OpenAI Integration**: Connects to OpenAI GPT-4o-mini for parsing.
- **AI Controller**: `/api/v1/ai/parse-transaction` endpoint to trigger parsing.
- **Metadata Storage**: `AiTransactionMetadata` table stores AI parsing details.

**Current State**:
- Backend API fully functional with 20+ endpoints.
- Frontend connected to NestJS API via TanStack Query.
- AI-powered transaction parsing is live.
- Server: http://localhost:8000
- Frontend: http://localhost:5173
- Swagger docs: http://localhost:8000/api/docs
- All endpoints protected with Firebase Auth (except /health).
- Automatic audit logging on all mutations.

**Next Phase**: Phase 5 - Optimization & Polish

**Reference Documentation**:
- `/docs/archive/migration/MIGRATION_PLAN.md` - Complete modernization plan (6 phases)
- This file (GEMINI.md) - Current architecture and conventions

## Commands

### Frontend Development (`/web`)

```bash
cd web

# Development
npm install              # Install dependencies
npm run dev             # Start dev server on http://localhost:5173
npm run build           # TypeScript compile + production build
npm run preview         # Preview production build
npm run lint            # Run ESLint

# shadcn/ui Components (if shadcn CLI is installed globally)
npx shadcn-cli@latest add [component]  # Add new shadcn/ui component
```

### Backend Development (`/api`)

```bash
cd api

# Setup
npm install                    # Install dependencies
npm run prisma:generate        # Generate Prisma Client (required after schema changes)

# Development
npm run start:dev              # Start NestJS in watch mode
npm run start:prod             # Production mode
npm run build                  # Build for production

# Database (Prisma)
npm run prisma:migrate         # Run database migrations
npx prisma studio              # Open Prisma Studio GUI

# Testing
npm run test                   # Unit tests
npm run test:e2e              # End-to-end tests
npm run test:cov              # Test coverage
```

## Architecture & Patterns

### Frontend Architecture (`/web/src`)

The frontend follows **clean architecture** with strict separation of concerns:

#### 1. Repository Pattern

**Structure**:
- `/repositories/interfaces/` - Repository contracts (e.g., `IInventoryRepository`)
- `/repositories/firebase/` - Legacy Firebase implementations
- `/repositories/http/` - Current HTTP/NestJS API implementations
- `/repositories/factory.ts` - Factory functions that create repository instances

**Dependency Flow**:
```
Route (Container) → Hook → Repository (data access) → Backend
```

#### 2. TanStack Router File-Based Routing

**Route Structure** (`/web/src/routes/`):
```
routes/
├── __root.tsx              # Root layout with QueryClientProvider
├── _authenticated.tsx      # Auth layout wrapper (requires login)
├── _authenticated/
│   ├── index.tsx          # Dashboard (/) 
│   ├── inventory.tsx      # Inventory + Losses tabs (/inventory)
│   └── financial.tsx      # Financial transactions (/financial)
└── login.tsx              # Public login page (/login)
```

**Route Component Pattern**:
- Each route file exports a `Route` component created with `createFileRoute()`.
- Route components use TanStack Query hooks for data fetching.

#### 3. TanStack Query Data Fetching

**Query Hooks** (`/hooks/queries/`):
```typescript
// Use query hooks in route components
const { data, isLoading, error } = useInventoryList();
const createMutation = useCreateInventory();

// Mutations invalidate related queries automatically
await createMutation.mutateAsync(newItem);
```

**Query Keys Pattern**:
```typescript
export const inventoryKeys = {
  all: ['inventory'] as const,
  lists: () => [...inventoryKeys.all, 'list'] as const,
  list: (params) => [...inventoryKeys.lists(), params] as const,
  detail: (id) => [...inventoryKeys.all, 'detail', id] as const,
};
```

#### 4. Authentication Flow

1. Firebase SDK initialized in `/db/firestore.ts` using Vite env vars.
2. `AuthService` interface → `FirebaseAuthService` implementation.
3. `useAuth` hook wraps the auth service.
4. `_authenticated.tsx` route layout acts as a guard, redirecting if not authenticated.
5. All routes under `_authenticated/` are protected.

### Backend Architecture (`/api/src`)

**Current State**: Phase 1, 2, 3 & 4 Complete - Fully Functional API

- Standard NestJS module structure.
- Prisma integrated via **Global Module** pattern.
- API prefix: `/api/v1`.
- Swagger docs at `/api/docs`.

**Database**:
- Prisma schema at `/api/prisma/schema.prisma`.
- PostgreSQL production database (`flowershop_db`).
- **6 Models**: Inventory, InventoryLoss, Transaction, TransactionItem, AiTransactionMetadata, AuditLog.
- Proper indexes and relations.

**Authentication** (✅ Implemented):
- Firebase Admin SDK validates JWT tokens server-side.
- `FirebaseAuthGuard` protects all routes (except `@Public` endpoints).
- `@CurrentUser()` decorator extracts user info from token.
- User context attached to all requests (uid, email, name).

**Global Infrastructure**:
- ✅ `HttpExceptionFilter` - Consistent error responses.
- ✅ `AuditLogInterceptor` - Auto-logs all mutations.
- ✅ `ValidationPipe` - DTO validation with class-validator.
- ✅ Health check endpoint (`/api/v1/health`).

**Modules** (5):
1. **PrismaModule** - Database client (global).
2. **AuditModule** - Audit logging (global, 2 endpoints).
3. **InventoryModule** - Inventory management (9 endpoints).
4. **TransactionsModule** - Financial transactions (7 endpoints).
5. **AiModule** - AI-powered transaction parsing (1 endpoint + BullMQ processor).

### API Endpoints (Phase 4 Complete)

**Base URL**: `http://localhost:8000/api/v1`
**Swagger Docs**: `http://localhost:8000/api/docs`

#### Health
- `GET /health` - Health check [Public]

#### Audit
- `GET /audit` - List audit logs (paginated, filterable)
- `GET /audit/entity/:type/:id` - Get logs for specific entity

#### Inventory (9 endpoints)
- `POST /inventory` - Create inventory item
- `GET /inventory` - List inventory (paginated, search, filters)
- `GET /inventory/history` - Get loss history across all items
- `GET /inventory/:id` - Get single item with recent losses
- `PUT /inventory/:id` - Update inventory item
- `PATCH /inventory/:id/archive` - Archive item (soft delete)
- `DELETE /inventory/:id` - Delete item (only if no transactions)
- `GET /inventory/:id/losses` - Get all losses for item
- `POST /inventory/:id/loss` - Record loss + auto-decrement

#### Transactions (7 endpoints)
- `POST /transactions` - Create SALE or EXPENSE transaction
- `GET /transactions` - List transactions (paginated, filterable by type/date)
- `GET /transactions/summary` - Financial summary (sales, expenses, profit)
- `GET /transactions/analytics?period=month` - Analytics (sales by day, top items)
- `GET /transactions/:id` - Get transaction with items
- `PUT /transactions/:id` - Update metadata only
- `DELETE /transactions/:id` - Delete + reverse inventory changes

#### AI (1 endpoint)
- `POST /ai/parse-transaction` - Parse user input into transaction data via a queue.

## Environment Variables

### Frontend (`/web/.env`)

**Required** (all must have `VITE_` prefix for browser access):
```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_FIREBASE_MEASUREMENT_ID=
```

### Backend (`/api/.env`)

**Required**:
```env
# Database (PostgreSQL)
DATABASE_URL="postgresql://flowershop:flowershop@localhost:5432/flowershop_db?schema=public"

# Server
PORT=8000

# AI Integration (Phase 4)
OPENAI_API_KEY=sk-...

# Redis (for Bull queues - Phase 4)
REDIS_HOST=localhost
REDIS_PORT=6379

# Firebase Admin SDK (for Auth)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
```

## Data Models & Conventions

### PostgreSQL Database Models (Phase 4)

**6 Models** in `/api/prisma/schema.prisma`:

1. **Inventory** - Inventory items. `@@unique([item, quality])`
2. **InventoryLoss** - Loss tracking.
3. **Transaction** - Sales and expenses.
4. **TransactionItem** - Line items for transactions.
5. **AiTransactionMetadata** - AI parsing data and confidence scores.
6. **AuditLog** - Audit trail for all mutations.

## Code Style & Conventions

- **TypeScript**: Strict mode enabled.
- **React**: Functional components with hooks. No default exports. Path alias `@` for `./src`.
- **Component Props**: Explicit TypeScript interfaces, with related props grouped into objects.
- **Error Handling**: Use `error instanceof Error` for type-safe error messages.

## UI Components & Design System

### shadcn/ui Integration

The project uses **shadcn/ui** components configured via `/web/components.json`:
- **Style**: "new-york"
- **Base Color**: "neutral"
- **Icon Library**: `lucide-react`

**Available Components**: `Button`, `Badge`, `Input`, `Select`, `Popover`, `Calendar`, `Navigation Menu`, `Switch`, `Tabs`.

### Theming & Styling

- **TailwindCSS 4** with CSS variables in `/web/src/index.css`.
- Uses OKLCH color space.
- Dark mode via `.dark` class on `<html>` element, managed in `Navbar.tsx`.
- `cn()` utility in `/web/src/lib/utils.ts` for conditional classes.

### Enhanced Filters Component

**Location**: `/web/src/components/Filters.tsx`
A reusable, type-safe filter component with support for search, multiple select dropdowns, and a date range picker. Props are grouped by concern (`search`, `selects`, `dateRange`).
