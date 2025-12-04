# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **monorepo** for a flower shop management system with:
- **Frontend (`/web`)**: React 19 + TypeScript + Firebase (current backend)
- **Backend (`/api`)**: NestJS + Prisma (future backend, currently in early development)

The project is **actively migrating** from Firebase Backend-as-a-Service to a custom NestJS API. The frontend architecture is designed with abstraction layers (Repository pattern, Service layer) to support this transition.

### 🚧 Current Migration Status

**Phase 1 & 2 Complete** (2025-12-03)

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

**Current State**:
- Backend API fully functional with 19 endpoints
- Server: http://localhost:8000
- Swagger docs: http://localhost:8000/api/docs
- All endpoints protected with Firebase Auth (except /health)
- Automatic audit logging on all mutations

**Next Phase**: Phase 3 - Frontend Migration (TanStack Router + Query)

**Reference Documentation**:
- `/MIGRATION_PLAN.md` - Complete modernization plan (6 phases)
- `/PHASE1_COMPLETE.md` - Phase 1 implementation details
- `/PHASE2_COMPLETE.md` - Phase 2 implementation details
- This file (CLAUDE.md) - Current architecture and conventions

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
npx shadcn@latest add [component]  # Add new shadcn/ui component

# Testing (not yet implemented but architecture supports it)
# Will use Vitest + React Testing Library when added
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

#### 1. Service Registry Pattern (CRITICAL)

**Key File**: `/web/src/services/registry.ts`

- **All singleton services are centralized here** with explicit dependency ordering:
  1. Infrastructure (logging)
  2. Authentication (depends on logging)
  3. Repositories (data access)
  4. Domain services (depends on repositories + logging)

**Rule**: Always import services from `../services` or `../services/registry`, NEVER instantiate directly.

```typescript
// ✅ Correct
import { inventoryService, authService } from '../services';

// ❌ Wrong - creates duplicate instances
import { InventoryService } from '../repositories/services/inventory.service';
const inventoryService = new InventoryService(...);
```

#### 2. Repository Pattern

**Structure**:
- `/repositories/interfaces/` - Repository contracts (e.g., `IInventoryRepository`)
- `/repositories/firebase/` - Firebase implementations
- `/repositories/factory.ts` - Factory functions that create repository instances
- `/repositories/services/` - Domain services with business logic

**Dependency Flow**:
```
Container → Hook → Service (business logic) → Repository (data access) → Backend
```

**Key Insight**:
- **Repositories** = Pure data access, no business logic
- **Services** = Business logic, coordinate multiple repositories
- Example: `InventoryService.addInventoryLoss()` validates inventory, updates inventory, adds loss record, AND logs the operation

#### 3. Container/View Pattern (MANDATORY for all pages)

**Every page must follow this pattern**:

**Container** (`*Container.tsx`):
- Imports singleton services from registry
- Uses hooks for state management
- Contains all business logic and event handlers
- Passes data to View via organized props

**View** (`*View.tsx`):
- Pure presentational component
- Receives everything via props (grouped by concern: `filters`, `table`, `modals`)
- No direct service/repository access
- Only UI-related hooks allowed

```typescript
// Container
export function InventoryContainer() {
  const { user } = useAuth(authService);
  const { inventory, loading } = useInventory(inventoryService);
  const commands = useInventoryCommands(inventoryService, user?.email, refresh);

  return <InventoryView
    loading={loading}
    filters={{ search, setSearch, quality, setQuality }}
    table={{ data: inventory, handleEdit, handleDelete }}
    modals={{ isOpen, onOpen, onClose }}
  />;
}
```

#### 4. Hook Patterns

**Three types of hooks**:

a) **Service-Wrapping Hooks** (`useAuth`, `useInventory`):
   - Accept service instance as parameter (dependency injection)
   - Return state + refresh functions
   - Pattern: `useInventory(inventoryService)`

b) **Command Hooks** (`useInventoryCommands`):
   - Accept service + callback dependencies
   - Return wrapped functions that execute + refresh
   - Keep command logic DRY

c) **Filter/UI Hooks** (`useInventoryFilters`, `useModal`):
   - Pure UI state, no service dependencies
   - Derived state calculations

**Critical**: Hooks accept services as parameters, never import them directly (enables testing).

#### 5. Authentication Flow

1. Firebase SDK initialized in `/db/firestore.ts` using Vite env vars
2. `AuthService` interface → `FirebaseAuthService` implementation
3. `useAuth` hook wraps auth service
4. `ProtectedRoute` component guards authenticated routes
5. All routes except `/login` wrapped in `<ProtectedRoute>`

**Backend Migration Note**: Auth is abstracted behind an interface, so swapping to NestJS auth won't require changing hook/component code.

### Backend Architecture (`/api/src`)

**Current State**: Phase 1 & 2 Complete - Fully Functional API

- Standard NestJS module structure
- Prisma integrated via **Global Module** pattern
- API prefix: `/api`
- API versioning: v1 (URI-based)
- Swagger docs at `/api/docs`

**Database**:
- Prisma schema at `/api/prisma/schema.prisma`
- PostgreSQL production database (`flowershop_db`)
- **6 Models**: Inventory, InventoryLoss, Transaction, TransactionItem, AiTransactionMetadata, AuditLog
- Complete migration from Firebase data models
- Proper indexes and relations

**Authentication** (✅ Implemented):
- Firebase Admin SDK validates JWT tokens server-side
- `FirebaseAuthGuard` protects all routes (except @Public endpoints)
- `@CurrentUser()` decorator extracts user info from token
- User context attached to all requests (uid, email, name)

**Global Infrastructure**:
- ✅ `HttpExceptionFilter` - Consistent error responses
- ✅ `AuditLogInterceptor` - Auto-logs all mutations
- ✅ `ValidationPipe` - DTO validation with class-validator
- ✅ Health check endpoint (`/api/v1/health`)

**Modules** (4):
1. **PrismaModule** - Database client (global)
2. **AuditModule** - Audit logging (global, 2 endpoints)
3. **InventoryModule** - Inventory management (9 endpoints)
4. **TransactionsModule** - Financial transactions (7 endpoints)

**Total Endpoints**: 19 (1 public, 18 protected)

### API Endpoints (Phase 2 Complete)

**Base URL**: `http://localhost:8000/api/v1`
**Swagger Docs**: `http://localhost:8000/api/docs`

#### Health
- `GET /health` - Health check [Public]

#### Audit
- `GET /audit` - List audit logs (paginated, filterable)
- `GET /audit/entity/:type/:id` - Get logs for specific entity

#### Inventory (9 endpoints)
- `POST /inventory` - Create inventory item [@AuditLog]
- `GET /inventory` - List inventory (paginated, search, filters)
- `GET /inventory/history` - Get loss history across all items
- `GET /inventory/:id` - Get single item with recent losses
- `PUT /inventory/:id` - Update inventory item [@AuditLog]
- `PATCH /inventory/:id/archive` - Archive item (soft delete) [@AuditLog]
- `DELETE /inventory/:id` - Delete item (only if no transactions) [@AuditLog]
- `GET /inventory/:id/losses` - Get all losses for item
- `POST /inventory/:id/loss` - Record loss + auto-decrement [@AuditLog, @CurrentUser]

#### Transactions (7 endpoints)
- `POST /transactions` - Create SALE or EXPENSE transaction [@AuditLog, @CurrentUser]
  - Auto-updates inventory (SALE: decrement, EXPENSE: increment)
  - Validates inventory availability
  - Calculates totals from inventory prices
- `GET /transactions` - List transactions (paginated, filterable by type/date)
- `GET /transactions/summary` - Financial summary (sales, expenses, profit)
- `GET /transactions/analytics?period=month` - Analytics (sales by day, top items)
- `GET /transactions/:id` - Get transaction with items
- `PUT /transactions/:id` - Update metadata only [@AuditLog]
- `DELETE /transactions/:id` - Delete + reverse inventory changes [@AuditLog]

**Key Features**:
- All endpoints (except `/health`) require Firebase JWT token
- Mutations automatically logged to AuditLog table
- User context extracted from token via @CurrentUser decorator
- Complete Swagger documentation with examples
- DTO validation with class-validator

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

Access via `import.meta.env.VITE_*`

### Backend (`/api/.env`)

**Required**:
```env
# Database (PostgreSQL)
DATABASE_URL="postgresql://flowershop:flowershop@localhost:5432/flowershop_db?schema=public"

# Server
PORT=8000
```

**Optional** (for Firebase Auth validation):
```env
# Firebase Admin SDK
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
```

**Future** (Phase 4 - AI Integration):
```env
# OpenAI
OPENAI_API_KEY=sk-...

# Redis (for Bull queues)
REDIS_HOST=localhost
REDIS_PORT=6379
```

See `/api/.env.example` for complete template.

## Data Models & Conventions

### PostgreSQL Database Models (Phase 1 & 2)

**6 Models** in `/api/prisma/schema.prisma`:

1. **Inventory** - Inventory items
   - Unique constraint: `(item, quality)`
   - Fields: id, item, quality, quantity, unitPrice, isActive, timestamps
   - Relations: losses[], transactions[]

2. **InventoryLoss** - Loss tracking
   - Fields: id, inventoryId, quantity, reason, notes, recordedBy, recordedAt
   - Relation: inventory

3. **Transaction** - Sales and expenses
   - Fields: id, type (SALE/EXPENSE), totalAmount, customerName, notes, messageSent, createdBy, timestamps
   - Relations: items[], aiMetadata?

4. **TransactionItem** - Line items
   - Fields: id, transactionId, inventoryId, quantity, unitPrice, subtotal
   - Relations: transaction, inventory

5. **AiTransactionMetadata** - AI parsing data
   - Fields: id, transactionId, userPrompt, aiResponse, confidence, processingTime, createdAt
   - Relation: transaction (one-to-one)

6. **AuditLog** - Audit trail
   - Fields: id, userId, action, entityType, entityId, changes (JSON), ipAddress, userAgent, timestamp
   - Indexes: `(userId, timestamp)`, `(entityType, entityId)`

### Legacy Firebase Models (Frontend - Phase 3 Migration)

**Frontend still uses Firebase** (until Phase 3):
- `inventory` collection - Inventory items
- `losses` collection - Inventory loss records
- Document IDs: `${item}_${quality}` (e.g., "Rose_Premium")

**External Logging** (legacy, to be replaced):
- Cloud Function: `https://cf-flowershop-logs-hanlder-265978683065.us-central1.run.app/log_operation`
- Now replaced by AuditLog table in PostgreSQL

## Code Style & Conventions

### TypeScript

- Strict mode enabled (`strict: true`)
- Explicit return types preferred
- No implicit `any`
- Interfaces for object shapes, types for unions/primitives

### React Patterns

- Functional components with hooks only
- No default exports - always use named exports
- Path alias: `@` → `./src` (configured in both `vite.config.ts` and `tsconfig.json`)

### Component Prop Patterns

Components use explicit TypeScript interfaces for props with proper typing:

```typescript
// Example from Filters.tsx
interface FiltersProps {
  className?: string;
  search?: {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
  };
  selects?: SelectConfig<string>[];
  dateRange?: {
    value: DateRangeValue;
    onChange: (next: DateRangeValue) => void;
    // ... other date-specific props
  };
}
```

**Pattern**: Group related props into nested objects by concern (search, selects, dateRange, etc.)

### Error Handling

Consistent pattern across codebase:
```typescript
catch (error: unknown) {
  const errorMessage = error instanceof Error
    ? error.message
    : 'Fallback message';
  setError(errorMessage);
}
```

### Void Operator for Floating Promises

Uses `void fetchInventory()` in useEffect to explicitly acknowledge floating promises while satisfying ESLint. This is intentional.

## UI Components & Design System

### shadcn/ui Integration

The project uses **shadcn/ui** components built on Radix UI primitives. Configuration is managed via `/web/components.json`:

```json
{
  "style": "new-york",
  "tailwind": {
    "baseColor": "neutral",
    "cssVariables": true
  },
  "iconLibrary": "lucide"
}
```

**Available Components** (in `/web/src/components/ui/`):
- `button.tsx` - Button with variants (default, destructive, outline, secondary, ghost, link) and sizes
- `badge.tsx` - Badge component with variants (default, secondary, destructive, outline)
- `input.tsx` - Form input component
- `select.tsx` - Radix Select with custom styling
- `popover.tsx` - Radix Popover for tooltips and dropdowns
- `calendar.tsx` - Date picker using react-day-picker
- `navigation-menu.tsx` - Radix Navigation Menu for navbar
- `switch.tsx` - Toggle switch for theme/settings

### Theming & Styling

**TailwindCSS 4** with CSS variables defined in `/web/src/index.css`:
- Uses OKLCH color space for better color consistency
- CSS variables for light/dark themes (`--background`, `--foreground`, `--primary`, etc.)
- Custom shadow system with configurable color (`--shadow-color: #eb146e`)
- Dark mode via `.dark` class on `<html>` element

**Utilities**:
- `cn()` utility in `/web/src/lib/utils.ts` - Combines clsx + tailwind-merge for conditional classes
- Path alias `@` configured in both Vite and TypeScript configs

**Component Patterns**:
- Use `class-variance-authority` (cva) for variant management
- Radix UI Slot pattern for composable components (`asChild` prop)
- Lucide icons + Font Awesome icons (legacy, being phased out)

### Dark Mode Implementation

The `Navbar` component manages theme state:
- Reads system preference on mount
- Persists choice to localStorage
- Uses Radix Switch component for toggle
- Theme applied via `.dark` class on root element

### Enhanced Filters Component

**Location**: `/web/src/components/Filters.tsx`

A reusable, type-safe filter component with support for:
- **Search input** with customizable placeholder and props
- **Multiple select dropdowns** using Radix Select (type-safe with generics)
- **Date range picker** using Radix Popover + react-day-picker Calendar

**Usage Pattern**:
```typescript
<Filters
  search={{
    value: searchTerm,
    onChange: setSearchTerm,
    placeholder: "Search items..."
  }}
  selects={[{
    key: "quality",
    value: quality,
    onChange: setQuality,
    options: [
      { value: "all", label: "All Quality" },
      { value: "premium", label: "Premium" }
    ]
  }]}
  dateRange={{
    value: { from: startDate, to: endDate },
    onChange: ({ from, to }) => {
      setStartDate(from);
      setEndDate(to);
    }
  }}
/>
```

**Key Features**:
- Props grouped by concern (search, selects, dateRange)
- Fully typed with TypeScript generics for select values
- Extends native HTML/Radix props via spread patterns
- Date handling with automatic format conversion

## Key Dependencies

### Frontend (`/web`)

**UI Framework**:
- `react@19.1.0` + `react-dom@19.1.0` - React 19
- `react-router@7.9.5` + `react-router-dom@7.9.5` - Client-side routing

**UI Components & Styling**:
- `@radix-ui/*` - Headless UI primitives (select, popover, switch, navigation-menu, slot)
- `tailwindcss@4.1.17` + `@tailwindcss/vite@4.1.17` - TailwindCSS 4 with Vite plugin
- `tailwindcss-animate@1.0.7` - Animation utilities
- `class-variance-authority@0.7.1` - Variant management for components
- `clsx@2.1.1` + `tailwind-merge@3.3.1` - Conditional class merging
- `lucide-react@0.552.0` - Icon library (primary)
- `@fortawesome/*` - Font Awesome icons (legacy)
- `react-day-picker@9.5.0` - Calendar/date picker

**Backend/Data**:
- `firebase@11.8.1` - Firebase SDK (auth + Firestore)

**Build Tools**:
- `vite@6.3.5` - Build tool and dev server
- `typescript@5.8.3` - TypeScript compiler
- `@vitejs/plugin-react@4.4.1` - React plugin for Vite
- `eslint@9.25.0` + `typescript-eslint@8.30.1` - Linting

## Adding New Features

Follow this workflow:

1. **Define Types** in `/web/src/shared/models/`
2. **Create Repository Interface** in `/repositories/interfaces/`
3. **Implement Repository** in `/repositories/firebase/`
4. **Create Factory Function** in `/repositories/factory.ts`
5. **Register in Service Registry** in `/services/registry.ts` (mind initialization order!)
6. **Create Custom Hook** in `/hooks/`
7. **Build Container Component** in `/pages/*/`
8. **Build View Component** in `/pages/*/`

## Testing (Not Yet Implemented)

Architecture supports testing but tests not written yet.

**Testability features**:
- Services passed as hook parameters (easy to mock)
- Container/View separation (test logic and UI separately)
- Interface-based repositories (swap implementations)

**Recommended stack**:
- Vitest (unit tests)
- React Testing Library (component tests)
- MSW (API mocking)

## Migration Context

**Current State**: Frontend → Firebase (Auth + Firestore)
**Migration Target**: Frontend → NestJS REST API + PostgreSQL (with Firebase Auth validation)

**Migration Plan**: See `/MIGRATION_PLAN.md` for complete details

The Repository pattern, Service interfaces, and factory functions are specifically designed to support this migration:
1. Swap factory functions to return HTTP-based repository implementations
2. Keep same interfaces and Service layer
3. Minimal changes to Container components

**Key Migration Changes**:
- **Router**: React Router v7 → TanStack Router v1 (file-based, type-safe)
- **Data Fetching**: Custom hooks → TanStack Query v5 (caching, optimistic updates)
- **Data Source**: Firebase Firestore → PostgreSQL via NestJS REST API
- **UI Consolidation**: `/losses` route merged into `/inventory` as tabs
- **New Features**: AI-powered transaction parsing, comprehensive audit logging

## Important Gotchas

### Backend (NestJS API)
1. **PostgreSQL must be running** - Start with `brew services start postgresql@14`
2. **Environment variables required** - See `/api/.env.example`
3. **Firebase Auth optional** - API works without Firebase config (warns on startup)
4. **Prisma Client generation** - Run `npm run prisma:generate` after schema changes
5. **@AuditLog decorator** - Auto-logs mutations to AuditLog table
6. **Database transactions** - Use `prisma.$transaction()` for atomic operations

### Frontend (React)
1. **Service initialization order matters** - see comments in `registry.ts`
2. **Always use named exports** - no default exports
3. **Firebase composite IDs** - format: `${item}_${quality}` (legacy, will change in Phase 3)
4. **Frontend still uses Firebase** - Migration to NestJS API pending (Phase 3)
5. **Props grouped by concern** in Views (`filters`, `table`, `modals`)

### Migration Status
- ✅ Backend API ready (PostgreSQL + NestJS)
- ⏳ Frontend still on Firebase (Phase 3 will migrate to API)
- ⏳ Transaction financial module uses mock data (Phase 3 will connect to API)
