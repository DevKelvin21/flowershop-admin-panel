# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **monorepo** for a flower shop management system with:
- **Frontend (`/web`)**: React 19 + TypeScript + Firebase (current backend)
- **Backend (`/api`)**: NestJS + Prisma (future backend, currently in early development)

The project is **actively migrating** from Firebase Backend-as-a-Service to a custom NestJS API. The frontend architecture is designed with abstraction layers (Repository pattern, Service layer) to support this transition.

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

**Current State**: Early development, minimal scaffold

- Standard NestJS module structure
- Prisma integrated via **Global Module** pattern
- API prefix: `/api`
- API versioning: v1 (URI-based)
- Swagger docs at `/api/docs`

**Database**:
- Prisma schema at `/api/prisma/schema.prisma`
- Currently has placeholder User/Post models
- **NOT aligned with frontend Firebase models yet** - migration work needed
- SQLite for development

**Authentication** (planned but not implemented):
- Dependencies installed: JWT, Passport, JWKS
- Intended pattern: Validate Firebase tokens OR issue own JWTs

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

```env
DATABASE_URL="file:./dev.db"
PORT=8000
```

## Data Models & Conventions

### Firebase Document IDs

Documents use composite IDs: `${item}_${quality}`
- Example: `"Rose_Premium"`, `"Tulip_Standard"`
- Creates natural uniqueness
- Document IDs are optional in TypeScript models but auto-generated on save

### Firestore Collections

- `inventory` - Inventory items
- `losses` - Inventory loss records

### Timestamp Formatting

- Custom `formatDateTime` in `/repositories/utils/date-formatter.ts`
- `lastUpdated` field auto-set on add/update

### Logging

Logs sent to external Cloud Function (not stored locally):
```
https://cf-flowershop-logs-hanlder-265978683065.us-central1.run.app/log_operation
```
- Async, fails silently
- Don't rely on logging for critical operations

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

**Current**: Frontend → Firebase (Auth + Firestore)
**In Progress**: NestJS API scaffold
**Future**: Frontend → NestJS API (with Firebase Auth validation)

The Repository pattern, Service interfaces, and factory functions are specifically designed to support this migration:
1. Swap factory functions to return HTTP-based repository implementations
2. Keep same interfaces and Service layer
3. Minimal changes to Container components

## Important Gotchas

1. **Service initialization order matters** - see comments in `registry.ts`
2. **Always use named exports** - no default exports
3. **Firebase composite IDs** - format: `${item}_${quality}`
4. **Backend models don't match frontend yet** - Prisma schema is placeholder
5. **Logging is external and fails silently**
6. **Props grouped by concern** in Views (`filters`, `table`, `modals`)
