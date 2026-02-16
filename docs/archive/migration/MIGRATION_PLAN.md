# FlowerShop Admin Panel - Modernization & Migration Plan

**Last Updated**: 2025-12-03
**Status**: Planning Complete - Ready for Implementation

---

## 📋 Executive Summary

This document outlines the complete modernization plan for migrating the FlowerShop Admin Panel from Firebase BaaS to a robust NestJS REST API with PostgreSQL, while upgrading the frontend to TanStack Router/Query for better performance on resource-constrained hardware.

### Key Decisions

- **Backend**: NestJS + REST + PostgreSQL + Prisma
- **Frontend**: TanStack Router v1 + TanStack Query v5
- **AI Integration**: Queue-based microservice with OpenAI GPT-4o-mini
- **Auth**: Keep Firebase Auth, validate tokens server-side
- **Database**: PostgreSQL with optimized connection pooling
- **UI Consolidation**: Merge `/losses` route into `/inventory` as tabs

---

## 🎯 Final Tech Stack

### Backend

| Component | Technology | Rationale |
|-----------|-----------|-----------|
| Framework | NestJS (Node.js + TypeScript) | Already scaffolded, familiar ecosystem, lighter runtime |
| API Style | RESTful with versioning | Simple, predictable, lower overhead for single-user CRUD |
| Database | PostgreSQL | Full-featured, excellent for analytics/reporting |
| ORM | Prisma | Type-safe, migration management, excellent DX |
| Auth | Firebase Auth (token validation) | Keep existing auth, validate tokens server-side |
| AI Processing | BullMQ + Redis Queue | Event-driven, non-blocking for old hardware |
| Validation | class-validator + class-transformer | Built-in NestJS ecosystem |
| Documentation | Swagger/OpenAPI | Already configured |

### Frontend

| Component | Technology | Rationale |
|-----------|-----------|-----------|
| Router | TanStack Router v1 | File-based, type-safe, lighter than React Router v7 |
| Data Fetching | TanStack Query v5 | Built-in caching, perfect for old hardware optimization |
| UI Framework | React 19 + TypeScript | Current stack (no change) |
| Component Library | shadcn/ui + Radix UI | Current stack (no change) |
| Styling | TailwindCSS 4 | Current stack (no change) |
| Build Tool | Vite | Current stack (no change) |

### Infrastructure

- **AI LLM**: OpenAI GPT-4o-mini (cost-effective, fast)
- **Queue**: Redis + BullMQ
- **Logging**: Audit log interceptor → PostgreSQL

---

## 📊 Database Schema

### Prisma Schema

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ============================================
// INVENTORY MANAGEMENT
// ============================================

model Inventory {
  id          String   @id @default(cuid())
  item        String
  quality     String   // Premium, Standard, etc.
  quantity    Int
  unitPrice   Decimal  @db.Decimal(10, 2)
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  losses      InventoryLoss[]
  transactions TransactionItem[]

  @@unique([item, quality])
  @@index([isActive, item])
}

model InventoryLoss {
  id           String    @id @default(cuid())
  inventoryId  String
  inventory    Inventory @relation(fields: [inventoryId], references: [id])
  quantity     Int
  reason       String    // Expired, Damaged, Wilted, etc.
  notes        String?
  recordedBy   String    // user email
  recordedAt   DateTime  @default(now())

  @@index([inventoryId, recordedAt])
}

// ============================================
// FINANCIAL TRANSACTIONS
// ============================================

model Transaction {
  id              String            @id @default(cuid())
  type            TransactionType   // SALE or EXPENSE
  totalAmount     Decimal           @db.Decimal(10, 2)
  customerName    String?           // For sales
  notes           String?
  messageSent     Boolean           @default(false) // WhatsApp/SMS confirmation
  createdBy       String            // user email
  createdAt       DateTime          @default(now())
  updatedAt       DateTime          @updatedAt

  items           TransactionItem[]
  aiMetadata      AiTransactionMetadata?

  @@index([type, createdAt])
}

enum TransactionType {
  SALE
  EXPENSE
}

model TransactionItem {
  id             String      @id @default(cuid())
  transactionId  String
  transaction    Transaction @relation(fields: [transactionId], references: [id], onDelete: Cascade)
  inventoryId    String
  inventory      Inventory   @relation(fields: [inventoryId], references: [id])
  quantity       Int
  unitPrice      Decimal     @db.Decimal(10, 2)
  subtotal       Decimal     @db.Decimal(10, 2)

  @@index([transactionId])
}

// ============================================
// AI INTEGRATION
// ============================================

model AiTransactionMetadata {
  id              String      @id @default(cuid())
  transactionId   String      @unique
  transaction     Transaction @relation(fields: [transactionId], references: [id], onDelete: Cascade)
  userPrompt      String      // Original user input
  aiResponse      String      @db.Text // Full AI response
  confidence      Float       // 0-1 confidence score
  processingTime  Int         // milliseconds
  createdAt       DateTime    @default(now())
}

// ============================================
// AUDIT LOGGING
// ============================================

model AuditLog {
  id          String   @id @default(cuid())
  userId      String   // Firebase UID or email
  action      String   // CREATE_INVENTORY, UPDATE_SALE, etc.
  entityType  String   // Inventory, Transaction, etc.
  entityId    String?
  changes     Json?    // Before/after snapshots
  ipAddress   String?
  userAgent   String?
  timestamp   DateTime @default(now())

  @@index([userId, timestamp])
  @@index([entityType, entityId])
}
```

---

## 🔌 REST API Endpoints

### Inventory Module

**Base Path**: `/api/v1/inventory`

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| GET | `/` | List inventory (paginated, filterable) | Query: `?page=1&limit=20&quality=Premium&isActive=true` | `{ data: Inventory[], total: number, page: number }` |
| GET | `/:id` | Get single inventory item | - | `Inventory` |
| POST | `/` | Add new inventory item | `CreateInventoryDto` | `Inventory` |
| PUT | `/:id` | Update inventory item | `UpdateInventoryDto` | `Inventory` |
| PATCH | `/:id/archive` | Mark item as inactive | - | `Inventory` |
| DELETE | `/:id` | Hard delete (admin only) | - | `{ success: boolean }` |
| GET | `/history` | Get inventory change history | Query: `?page=1&limit=20` | `AuditLog[]` |
| GET | `/:id/losses` | Get losses for specific item | - | `InventoryLoss[]` |
| POST | `/:id/loss` | Record inventory loss | `AddLossDto` | `InventoryLoss` |

### Transactions Module

**Base Path**: `/api/v1/transactions`

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| GET | `/` | List transactions (paginated) | Query: `?page=1&limit=20&type=SALE&startDate=...&endDate=...` | `{ data: Transaction[], total: number }` |
| GET | `/:id` | Get transaction details with items | - | `Transaction` (with items) |
| POST | `/` | Create new transaction | `CreateTransactionDto` | `Transaction` |
| PUT | `/:id` | Update transaction | `UpdateTransactionDto` | `Transaction` |
| DELETE | `/:id` | Delete transaction (cascades items) | - | `{ success: boolean }` |
| GET | `/summary` | Financial summary | Query: `?startDate=...&endDate=...` | `{ totalSales: number, totalExpenses: number, profit: number, transactionCount: number }` |
| GET | `/analytics` | Analytics data for dashboard | Query: `?period=month` | `{ salesByDay: [], topItems: [], revenueByCategory: [] }` |

### AI Module

**Base Path**: `/api/v1/ai`

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| POST | `/parse-transaction` | Parse user input into transaction | `{ prompt: string }` | `{ type: TransactionType, items: Array<{ inventoryId, quantity, unitPrice }>, totalAmount: number, confidence: number, suggestions: string[] }` |

### Audit Module

**Base Path**: `/api/v1/audit`

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| GET | `/` | List audit logs (paginated) | Query: `?page=1&limit=50&userId=...&action=...` | `{ data: AuditLog[], total: number }` |
| GET | `/entity/:type/:id` | Get logs for specific entity | - | `AuditLog[]` |

---

## 🧠 AI Integration Architecture

### Design: Event-Driven Queue-Based System

**Why?** Decouples AI processing from main API flow, prevents blocking UI, better for resource-constrained hardware.

```
┌─────────────┐
│  Frontend   │
│   (React)   │
└──────┬──────┘
       │ POST /api/v1/ai/parse-transaction
       │ { prompt: "Sold 12 roses to Maria" }
       ▼
┌──────────────────┐
│   NestJS API     │
│  (AI Controller) │
└──────┬───────────┘
       │ Push to queue
       ▼
┌──────────────────┐
│  Redis + BullMQ  │
│   (Job Queue)    │
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│   AI Worker      │
│  (Processor)     │
│                  │
│  1. Fetch current│
│     inventory    │
│  2. Build prompt │
│  3. Call OpenAI  │
│  4. Parse result │
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│   PostgreSQL     │
│ (Store metadata) │
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│  Return to API   │
│  (Prefilled data)│
└──────────────────┘
```

### AI Prompt Engineering

**System Prompt Template**:

```typescript
const systemPrompt = `
You are a FlowerShop transaction assistant. Parse natural language input into structured transaction data.

Available Inventory:
${inventory.map(item => `- ${item.item} (${item.quality}): $${item.unitPrice}/unit, ${item.quantity} in stock`).join('\n')}

Rules:
1. Identify transaction type: SALE (revenue) or EXPENSE (cost)
2. Match items to inventory (fuzzy match allowed)
3. Extract quantities and customer name (for sales)
4. Calculate totals based on unitPrice
5. Return confidence score (0-1)

Output ONLY valid JSON matching this schema:
{
  "type": "SALE" | "EXPENSE",
  "customerName": string | null,
  "items": [{ "inventoryId": string, "quantity": number }],
  "confidence": number,
  "suggestions": string[] // if low confidence
}
`;
```

**Example Interaction**:

```
User Input: "Sold 12 premium roses and 5 tulips to Maria for her wedding"

AI Response:
{
  "type": "SALE",
  "customerName": "Maria",
  "items": [
    { "inventoryId": "clx123...", "quantity": 12 }, // Roses Premium
    { "inventoryId": "clx456...", "quantity": 5 }   // Tulips Premium
  ],
  "confidence": 0.95,
  "suggestions": []
}
```

### LLM Provider Options

| Provider | Model | Cost | Speed | Recommendation |
|----------|-------|------|-------|----------------|
| **OpenAI** | GPT-4o-mini | $0.15/1M input | Fast | ✅ **Recommended** |
| Anthropic | Claude 3 Haiku | $0.25/1M input | Fast | Alternative |
| Local Ollama | Llama 3.1 8B | Free | Slower | Budget option (requires resources) |

---

## 🚀 Frontend Migration: TanStack Router + Query

### Current Structure (React Router v7)

```
/web/src/routes/index.tsx
  - Manual route configuration
  - No type safety
  - No built-in data loading
```

### New Structure (TanStack Router)

```
/web/src/routes/
  __root.tsx                      # Root layout with Outlet
  _authenticated.tsx              # Auth layout wrapper
  _authenticated/index.tsx        # Dashboard
  _authenticated/inventory.tsx    # Inventory with tabs (items + losses)
  _authenticated/financial.tsx    # Financial/Transactions
  login.tsx                       # Login (public)
```

### Migration Examples

#### Before: React Router

```tsx
// routes/index.tsx
<Route path="/inventory" element={<InventoryContainer />} />

// InventoryContainer.tsx
function InventoryContainer() {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    inventoryService.getAll().then(data => {
      setInventory(data);
      setLoading(false);
    });
  }, []);

  return <InventoryView inventory={inventory} loading={loading} />;
}
```

#### After: TanStack Router + Query

```tsx
// routes/_authenticated/inventory.tsx
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/inventory')({
  component: InventoryContainer,
  loader: async ({ context }) => {
    // Prefetch data before rendering
    await context.queryClient.ensureQueryData(inventoryQueryOptions())
  }
})

// hooks/queries/useInventory.ts
export const inventoryQueryOptions = () => ({
  queryKey: ['inventory'],
  queryFn: async () => {
    const response = await fetch('/api/v1/inventory');
    return response.json();
  },
  staleTime: 5 * 60 * 1000, // 5 min cache (great for old hardware!)
  cacheTime: 10 * 60 * 1000,
})

export function useInventory() {
  return useQuery(inventoryQueryOptions())
}

// InventoryContainer.tsx
function InventoryContainer() {
  const { data: inventory, isLoading } = useInventory();
  const addMutation = useAddInventory();

  return <InventoryView
    inventory={inventory ?? []}
    loading={isLoading}
    onAdd={addMutation.mutate}
  />;
}
```

### Query Mutations with Optimistic Updates

```tsx
// hooks/mutations/useAddInventory.ts
export function useAddInventory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateInventoryDto) => {
      const response = await fetch('/api/v1/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return response.json();
    },

    // Optimistic update (instant UI feedback)
    onMutate: async (newItem) => {
      await queryClient.cancelQueries({ queryKey: ['inventory'] });
      const previousInventory = queryClient.getQueryData(['inventory']);

      queryClient.setQueryData(['inventory'], (old: Inventory[]) => [
        ...old,
        { ...newItem, id: 'temp-' + Date.now() }
      ]);

      return { previousInventory };
    },

    // Revert on error
    onError: (err, newItem, context) => {
      queryClient.setQueryData(['inventory'], context?.previousInventory);
    },

    // Refetch on success
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
    }
  });
}
```

---

## 📁 Backend Module Structure

```
/api/src/
  common/
    decorators/
      current-user.decorator.ts       # Extract Firebase user from request
      audit-log.decorator.ts          # Mark methods for audit logging
    guards/
      firebase-auth.guard.ts          # Validate Firebase JWT tokens
    interceptors/
      audit-log.interceptor.ts        # Auto-log operations to AuditLog table
      transform.interceptor.ts        # Serialize responses
    filters/
      http-exception.filter.ts        # Global error handling
    pipes/
      validation.pipe.ts              # Global DTO validation

  modules/
    inventory/
      inventory.module.ts
      inventory.controller.ts         # REST endpoints
      inventory.service.ts            # Business logic
      dto/
        create-inventory.dto.ts
        update-inventory.dto.ts
        add-loss.dto.ts
        inventory-query.dto.ts        # Pagination/filtering
      entities/
        inventory.entity.ts           # Export Prisma types

    transactions/
      transactions.module.ts
      transactions.controller.ts
      transactions.service.ts
      dto/
        create-transaction.dto.ts
        update-transaction.dto.ts
        transaction-query.dto.ts
        transaction-summary.dto.ts
      entities/
        transaction.entity.ts

    ai/
      ai.module.ts
      ai.controller.ts                # POST /parse-transaction
      ai.service.ts                   # OpenAI integration
      processors/
        transaction-parser.processor.ts  # BullMQ worker
      dto/
        parse-transaction.dto.ts
        parsed-transaction-response.dto.ts

    audit/
      audit.module.ts
      audit.controller.ts             # GET audit logs
      audit.service.ts                # Used by interceptor
      dto/
        audit-query.dto.ts

  prisma/
    prisma.module.ts                  # Global module
    prisma.service.ts                 # Prisma client wrapper

  config/
    firebase.config.ts                # Firebase admin SDK config

  main.ts                             # Bootstrap with global config
  app.module.ts                       # Root module
```

---

## 🏗️ Implementation Roadmap

### Phase 1: Backend Foundation (Estimated: Week 1-2)

**Goal**: Set up robust NestJS API with PostgreSQL, authentication, and core infrastructure.

- [ ] **Task 1.1**: Update Prisma schema with all models
  - Add Inventory, InventoryLoss, Transaction, TransactionItem, AiTransactionMetadata, AuditLog
  - Set up indexes and relations
  - File: `/api/prisma/schema.prisma`

- [ ] **Task 1.2**: Configure PostgreSQL connection
  - Update `DATABASE_URL` in `.env`
  - Run `npx prisma migrate dev --name initial_schema`
  - Generate Prisma Client

- [ ] **Task 1.3**: Global error handling
  - Create `HttpExceptionFilter` in `/common/filters/`
  - Register globally in `main.ts`
  - Add consistent error response format

- [ ] **Task 1.4**: Firebase Auth Guard
  - Install `firebase-admin`
  - Create `FirebaseAuthGuard` to validate JWT tokens
  - Create `@CurrentUser()` decorator to extract user info

- [ ] **Task 1.5**: Audit logging infrastructure
  - Create `AuditLogInterceptor`
  - Create `@AuditLog()` decorator
  - Auto-log all mutations (POST/PUT/PATCH/DELETE)

**Deliverables**:
- ✅ PostgreSQL connected with schema
- ✅ Global error handling
- ✅ Auth guard protecting all routes (except health check)
- ✅ Audit logging capturing all operations

---

### Phase 2: Core API Modules (Estimated: Week 2-3)

**Goal**: Implement all CRUD operations for Inventory and Transactions with DTOs and validation.

- [ ] **Task 2.1**: Inventory Module
  - Create module structure (`inventory/`)
  - Implement all endpoints (list, get, create, update, archive, delete)
  - Create DTOs with `class-validator` decorators
  - Add pagination and filtering logic
  - Swagger documentation tags

- [ ] **Task 2.2**: Inventory Loss endpoints
  - `GET /inventory/:id/losses`
  - `POST /inventory/:id/loss`
  - Validate inventory exists and has sufficient quantity
  - Auto-decrement inventory quantity on loss recording

- [ ] **Task 2.3**: Transactions Module
  - Create module structure (`transactions/`)
  - Implement CRUD endpoints
  - Handle transaction items (cascade create/update/delete)
  - Validate inventory availability before transaction
  - Auto-update inventory quantities on transaction save

- [ ] **Task 2.4**: Financial analytics endpoints
  - `GET /transactions/summary` - totals by date range
  - `GET /transactions/analytics` - dashboard metrics
  - Use Prisma aggregations for performance

- [ ] **Task 2.5**: Unit tests
  - Service layer tests for business logic
  - Mock Prisma client
  - Test edge cases (insufficient inventory, invalid dates, etc.)

**Deliverables**:
- ✅ Full CRUD for Inventory and Transactions
- ✅ DTOs with validation
- ✅ Swagger documentation complete
- ✅ Unit test coverage >80%

---

### Phase 3: Frontend Migration (Estimated: Week 3-4)

**Goal**: Migrate from React Router to TanStack Router/Query, replace Firebase with HTTP repositories.

- [ ] **Task 3.1**: Install TanStack dependencies
  ```bash
  npm install @tanstack/react-router @tanstack/react-query
  npm install -D @tanstack/router-devtools @tanstack/router-vite-plugin
  ```

- [ ] **Task 3.2**: Set up file-based routing
  - Create `/web/src/routes/` structure
  - Configure Vite plugin
  - Create `__root.tsx` with `QueryClientProvider`
  - Migrate authentication layout (`_authenticated.tsx`)

- [ ] **Task 3.3**: Create HTTP repositories
  - `/repositories/http/http-inventory.repository.ts`
  - `/repositories/http/http-transaction.repository.ts`
  - Implement `IInventoryRepository` interface
  - Use `fetch` or `axios` for API calls
  - Add auth token to headers

- [ ] **Task 3.4**: Create query hooks
  - `/hooks/queries/useInventory.ts`
  - `/hooks/queries/useTransactions.ts`
  - `/hooks/mutations/useAddInventory.ts`
  - Configure staleTime/cacheTime for old hardware

- [ ] **Task 3.5**: Migrate Inventory page
  - Convert to TanStack Router route
  - Add tabs component (Items | Losses)
  - Replace `useInventory` hook with `useQuery`
  - Test CRUD operations

- [ ] **Task 3.6**: Build Transactions/Financial page
  - Replace mock data with real API calls
  - Sales, Expenses, Summary views
  - Filters by date range and type
  - Create/Edit transaction forms

- [ ] **Task 3.7**: Update service registry
  - Swap Firebase repositories for HTTP repositories
  - Update factory functions
  - Ensure singleton pattern maintained

**Deliverables**:
- ✅ TanStack Router with type-safe routing
- ✅ TanStack Query with caching
- ✅ All pages migrated from Firebase to NestJS API
- ✅ Inventory losses merged into inventory page (tabs)

---

### Phase 4: AI Integration (Estimated: Week 4-5)

**Goal**: Implement AI-powered transaction parsing with queue-based processing.

- [ ] **Task 4.1**: Set up Redis and BullMQ
  - Install Redis (Docker or local)
  - Install `@nestjs/bull` and `bull`
  - Configure BullModule in `ai.module.ts`

- [ ] **Task 4.2**: OpenAI integration
  - Install `openai` SDK
  - Create `AiService` with `parseTransactionPrompt()` method
  - Build dynamic system prompt with current inventory
  - Handle API errors and rate limits

- [ ] **Task 4.3**: Transaction parser processor
  - Create `TransactionParserProcessor` class
  - Implement BullMQ job handler
  - Parse AI response into structured data
  - Store metadata in `AiTransactionMetadata` table

- [ ] **Task 4.4**: AI controller endpoint
  - `POST /api/v1/ai/parse-transaction`
  - Accept user prompt, push to queue
  - Return job ID or wait for result (configurable)
  - Add rate limiting (10 requests/min)

- [ ] **Task 4.5**: Frontend AI input component
  - Create `AiTransactionInput.tsx` component
  - Text area with "Parse with AI" button
  - Loading state while processing
  - Display parsed results in transaction form

- [ ] **Task 4.6**: Prefill transaction form
  - Populate form fields from AI response
  - Allow manual edits before submission
  - Show confidence score and suggestions
  - Fallback to manual input if confidence < 0.7

**Deliverables**:
- ✅ Queue-based AI processing
- ✅ OpenAI integration working
- ✅ Frontend AI input with prefill
- ✅ AI metadata stored for analytics

---

### Phase 5: Optimization & Polish (Estimated: Week 5-6)

**Goal**: Optimize for old hardware, add production features, comprehensive testing.

- [ ] **Task 5.1**: Frontend bundle optimization
  - Enable route-based code splitting
  - Lazy load heavy components (charts, modals)
  - Analyze bundle with `vite-bundle-visualizer`
  - Remove unused dependencies and shadcn components

- [ ] **Task 5.2**: Query cache tuning
  - Configure staleTime based on data volatility
  - Set up background refetching
  - Implement optimistic updates for all mutations
  - Add query prefetching on route hover

- [ ] **Task 5.3**: Database optimization
  - Add missing indexes based on query patterns
  - Set up Prisma connection pooling (max 10 connections)
  - Enable query logging to find slow queries
  - Run `EXPLAIN ANALYZE` on complex queries

- [ ] **Task 5.4**: Backend performance
  - Add response compression (gzip)
  - Implement Redis caching for inventory list
  - Add rate limiting middleware
  - Set up request timeout guards

- [ ] **Task 5.5**: E2E testing
  - Set up Playwright or Cypress
  - Test critical flows (login, create sale, add inventory)
  - Test AI transaction parsing
  - Test error scenarios

- [ ] **Task 5.6**: Production deployment
  - Docker Compose for PostgreSQL + Redis + API
  - Environment variable management
  - Database backup strategy
  - Frontend build optimization (`vite build`)
  - Health check endpoint (`/api/health`)

**Deliverables**:
- ✅ Optimized bundle size (<500KB gzipped)
- ✅ Fast load times on old hardware (<3s)
- ✅ E2E tests passing
- ✅ Production-ready deployment

---

## ⚡ Performance Optimization Strategies

### For Old Hardware

#### Backend Optimizations

1. **Database Connection Pooling**
   ```typescript
   // prisma/schema.prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
     // Connection string with pool settings
     // ?connection_limit=10&pool_timeout=20
   }
   ```

2. **Response Compression**
   ```typescript
   // main.ts
   import compression from 'compression';
   app.use(compression());
   ```

3. **Query Optimization**
   - Use `select` to fetch only needed fields
   - Implement cursor-based pagination for large datasets
   - Add indexes on frequently filtered columns

4. **Redis Caching**
   ```typescript
   @UseInterceptors(CacheInterceptor)
   @CacheTTL(300) // 5 minutes
   @Get()
   async findAll() { ... }
   ```

5. **Rate Limiting**
   ```typescript
   // Prevent abuse, protect old hardware
   app.use(rateLimit({
     windowMs: 60 * 1000, // 1 minute
     max: 100 // 100 requests per minute
   }));
   ```

#### Frontend Optimizations

1. **Aggressive Query Caching**
   ```typescript
   export const inventoryQueryOptions = () => ({
     queryKey: ['inventory'],
     queryFn: fetchInventory,
     staleTime: 10 * 60 * 1000, // 10 min - data rarely changes
     cacheTime: 30 * 60 * 1000, // 30 min - keep in memory
     refetchOnWindowFocus: false, // Don't refetch on tab switch
   })
   ```

2. **Route-based Code Splitting**
   ```typescript
   // Automatically handled by TanStack Router
   // Each route file is its own chunk
   ```

3. **Virtualized Lists** (for large datasets)
   ```typescript
   import { useVirtualizer } from '@tanstack/react-virtual'

   // Only render visible rows
   const rowVirtualizer = useVirtualizer({
     count: inventory.length,
     getScrollElement: () => parentRef.current,
     estimateSize: () => 50,
   })
   ```

4. **Debounced Search**
   ```typescript
   import { useDebouncedValue } from '@/hooks/useDebouncedValue'

   const [search, setSearch] = useState('')
   const debouncedSearch = useDebouncedValue(search, 300)

   useQuery({
     queryKey: ['inventory', debouncedSearch],
     queryFn: () => fetchInventory(debouncedSearch),
   })
   ```

5. **Image Optimization**
   - Use WebP format with fallback
   - Lazy load images with `loading="lazy"`
   - Serve properly sized images

#### Database Optimizations

1. **Indexes on Hot Paths**
   ```prisma
   model Inventory {
     @@index([isActive, item])  // Filtered lists
     @@index([quality])          // Quality filter
   }

   model Transaction {
     @@index([type, createdAt])  // Date range queries
   }
   ```

2. **Partial Indexes** (PostgreSQL-specific)
   ```sql
   CREATE INDEX idx_active_inventory
   ON "Inventory" (item)
   WHERE "isActive" = true;
   ```

3. **Regular Maintenance**
   ```sql
   -- Run weekly
   VACUUM ANALYZE;
   ```

---

## 🔒 Security Considerations

### Authentication & Authorization

1. **Firebase Token Validation**
   ```typescript
   // firebase-auth.guard.ts
   import * as admin from 'firebase-admin';

   @Injectable()
   export class FirebaseAuthGuard implements CanActivate {
     async canActivate(context: ExecutionContext): Promise<boolean> {
       const request = context.switchToHttp().getRequest();
       const token = this.extractToken(request);

       try {
         const decodedToken = await admin.auth().verifyIdToken(token);
         request.user = decodedToken;
         return true;
       } catch (error) {
         throw new UnauthorizedException('Invalid token');
       }
     }
   }
   ```

2. **CORS Configuration**
   ```typescript
   app.enableCors({
     origin: ['http://localhost:5173', 'https://flowershop.example.com'],
     credentials: true,
   });
   ```

3. **Rate Limiting**
   - Global: 100 requests/minute
   - AI endpoint: 10 requests/minute (expensive)

### Input Validation

1. **DTO Validation**
   ```typescript
   export class CreateInventoryDto {
     @IsString()
     @MinLength(1)
     item: string;

     @IsNumber()
     @Min(0)
     quantity: number;

     @IsString()
     @IsIn(['Premium', 'Standard', 'Budget'])
     quality: string;
   }
   ```

2. **SQL Injection Protection**
   - Prisma uses parameterized queries by default ✅
   - Never use raw SQL unless necessary

### Data Privacy

1. **Audit Logging**
   - Log all mutations with user context
   - Store IP address and user agent
   - Never log sensitive data (passwords, tokens)

2. **API Keys**
   - Store OpenAI API key in environment variables
   - Never commit `.env` files
   - Rotate keys periodically

---

## 📝 Naming Conventions

### Backend (NestJS)

| Element | Convention | Example |
|---------|-----------|---------|
| Files | `kebab-case.ts` | `inventory.service.ts` |
| Classes | `PascalCase` | `InventoryService` |
| Methods | `camelCase` | `createInventory()` |
| DTOs | `PascalCase` + suffix | `CreateInventoryDto` |
| Entities | `PascalCase` + suffix | `InventoryEntity` |
| Endpoints | `kebab-case` | `/inventory-losses` |
| Constants | `UPPER_SNAKE_CASE` | `MAX_PAGE_SIZE` |

### Frontend (React)

| Element | Convention | Example |
|---------|-----------|---------|
| Components | `PascalCase.tsx` | `InventoryContainer.tsx` |
| Hooks | `camelCase.ts` with `use` prefix | `useInventory.ts` |
| Utilities | `kebab-case.ts` | `date-formatter.ts` |
| Types/Interfaces | `PascalCase` | `InventoryItem` |
| Constants | `UPPER_SNAKE_CASE` | `API_BASE_URL` |
| CSS Classes | `kebab-case` | `inventory-table` |

### Database (Prisma)

| Element | Convention | Example |
|---------|-----------|---------|
| Models | `PascalCase` (singular) | `Inventory` |
| Fields | `camelCase` | `createdAt` |
| Enums | `PascalCase` | `TransactionType` |
| Relations | `camelCase` (plural for 1-many) | `losses` |

---

## 🚨 Potential Challenges & Mitigations

| Challenge | Risk Level | Mitigation |
|-----------|------------|------------|
| **Old hardware performance** | High | Aggressive caching, pagination, lazy loading, connection pooling |
| **AI API costs** | Medium | Use GPT-4o-mini ($0.15/1M tokens), cache common queries, rate limit to 10/min |
| **PostgreSQL resource usage** | Medium | Connection pooling (max 10), query optimization, proper indexing |
| **Learning curve (TanStack)** | Low | Excellent documentation, similar to React Router, gradual migration possible |
| **Data migration from Firebase** | Medium | Export Firestore data to JSON, write migration script, test thoroughly |
| **AI hallucinations** | Medium | Show confidence score, allow manual edits, require >0.7 confidence |
| **Queue system complexity** | Low | BullMQ has good defaults, start simple, add retries/dead letter queue |

---

## 📦 Dependencies to Install

### Backend (`/api`)

```bash
# Core
npm install @nestjs/bull bull redis ioredis
npm install openai
npm install firebase-admin

# Optional (if needed)
npm install @nestjs/cache-manager cache-manager
npm install compression
npm install helmet
npm install @nestjs/throttler
```

### Frontend (`/web`)

```bash
# TanStack
npm install @tanstack/react-router @tanstack/react-query
npm install -D @tanstack/router-devtools @tanstack/router-vite-plugin

# Optional
npm install @tanstack/react-virtual  # For large lists
npm install axios  # Alternative to fetch
```

---

## 🧪 Testing Strategy

### Backend Tests

1. **Unit Tests** (Jest)
   - Services: Business logic, edge cases
   - Processors: AI parsing, queue handling
   - Target: >80% coverage

2. **Integration Tests**
   - Controllers: Full request/response cycle
   - Database: Prisma queries with test DB

3. **E2E Tests** (Supertest)
   - Critical flows: Create sale → update inventory
   - Auth flows: Protected routes

### Frontend Tests

1. **Component Tests** (Vitest + React Testing Library)
   - Containers: User interactions
   - Views: Rendering with props

2. **Query Tests**
   - Mock API responses
   - Test loading/error states

3. **E2E Tests** (Playwright)
   - Full user flows
   - Cross-browser testing

---

## 📚 Documentation

### Auto-Generated

- **Swagger API Docs**: `http://localhost:8000/api/docs`
- **Prisma Studio**: `npx prisma studio`

### Manual Documentation

- **API Changelog**: Track breaking changes
- **Migration Guides**: For future developers
- **Deployment Guide**: Production setup instructions

---

## ✅ Definition of Done

A phase is complete when:

- [ ] All tasks implemented and tested
- [ ] Unit tests passing (>80% coverage)
- [ ] E2E tests passing for critical flows
- [ ] Code reviewed (self-review if solo)
- [ ] Documentation updated
- [ ] No console errors/warnings
- [ ] Performance benchmarks met (load time <3s on old hardware)
- [ ] Swagger docs accurate

---

## 🎯 Success Metrics

After migration, we should see:

| Metric | Current (Firebase) | Target (NestJS) |
|--------|-------------------|-----------------|
| **Initial Load Time** | ~2-3s | <2s (with caching) |
| **Route Transition** | ~500ms | <200ms (prefetching) |
| **Bundle Size** | ~400KB | <350KB (lighter router) |
| **API Response Time** | N/A | <100ms (95th percentile) |
| **Database Queries** | N/A | <50ms (with indexes) |
| **AI Parse Time** | N/A | <2s (GPT-4o-mini) |

---

## 📞 Next Steps

**Ready to start implementation!**

Choose a starting point:
1. **Backend-First**: Phase 1 → Database schema and API foundation
2. **Frontend-First**: Phase 3 → TanStack Router migration with mock data
3. **Feature-First**: Phase 4 → AI integration as proof of concept

Recommended: **Backend-First** (ensures solid foundation for frontend migration)

**Command to begin**:
```bash
cd api
npm install
# Update schema, then run:
npx prisma migrate dev --name initial_schema
```

---

**Document maintained by**: Claude Code
**Project**: FlowerShop Admin Panel Modernization
**Last Review**: 2025-12-03
