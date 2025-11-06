# 🌸 Flowershop Admin Panel - Frontend

A modern, production-ready admin panel for managing flower shop inventory, losses, and financial operations. Built with React, TypeScript, and Firebase, following clean architecture principles and industry best practices.

## 📋 Table of Contents

- [Overview](#overview)
- [Technology Stack](#technology-stack)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Design Patterns](#design-patterns)
- [Getting Started](#getting-started)
- [Development Guide](#development-guide)
- [Key Features](#key-features)
- [Testing Strategy](#testing-strategy)
- [Code Style & Conventions](#code-style--conventions)

---

## 🎯 Overview

This application is the frontend client for a flower shop management system. It provides authenticated users with capabilities to:

- **Inventory Management**: Track flower stock levels, qualities, and updates
- **Loss Tracking**: Record and manage inventory losses with automatic inventory adjustment
- **Financial Reports**: View sales, expenses, and financial summaries
- **Dashboard**: Get a quick overview of business metrics

The application follows **clean architecture** principles with clear separation between presentation, business logic, and data access layers.

---

## 🛠 Technology Stack

### Core Framework
- **React 19** - UI library with latest features
- **TypeScript 5.8** - Type-safe development
- **Vite 6** - Fast build tool and dev server

### State Management & Routing
- **React Router 7** - Client-side routing
- **Custom Hooks** - State management with React hooks pattern

### Styling
- **TailwindCSS 4** - Utility-first CSS framework
- **FontAwesome** - Icon library

### Backend & Authentication
- **Firebase 11** - Backend-as-a-Service
  - **Firebase Authentication** - User authentication
  - **Firestore** - NoSQL database
- **NestJS API** (in `/api` directory) - Backend API (will replace Firebase Backend-as-a-Service)

### Development Tools
- **ESLint 9** - Code linting
- **TypeScript ESLint** - TypeScript-specific linting rules
- **Vite Dev Server** - Hot Module Replacement (HMR)

---

## 🏗 Architecture

### Layered Architecture

```
┌─────────────────────────────────────────────────┐
│           Presentation Layer                    │
│  (Pages, Components, Hooks)                     │
└─────────────────┬───────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────┐
│           Application Layer                     │
│  (Custom Hooks, State Management)               │
└─────────────────┬───────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────┐
│           Business Logic Layer                  │
│  (Services, Domain Logic)                       │
└─────────────────┬───────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────┐
│           Data Access Layer                     │
│  (Repositories, Firebase Integration)           │
└─────────────────────────────────────────────────┘
```

### Key Architectural Decisions

#### 1. **Container/Presentational Component Pattern**

Components are split into:
- **Containers** (`*Container.tsx`): Handle logic, state, and data fetching
- **Views** (`*View.tsx`): Pure presentational components receiving props

**Example:**
```typescript
// InventoryContainer.tsx - handles all logic
export function InventoryContainer() {
  const { user } = useAuth(authService);
  const { inventory, loading, error } = useInventory(inventoryService);
  // ... business logic
  return <InventoryView {...props} />
}

// InventoryView.tsx - pure presentation
export function InventoryView({ loading, error, filters, table, modals }) {
  // ... just renders UI
}
```

#### 2. **Dependency Injection for Hooks**

All hooks accept service dependencies as parameters, making them testable and flexible:

```typescript
// Hook accepts service as parameter (testable)
export function useInventory(inventoryService: InventoryService) {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  // ... implementation
}

// Usage in components
const { inventory } = useInventory(inventoryService);
```

#### 3. **Repository Pattern**

Data access is abstracted through repository interfaces:

```typescript
// Interface defines contract
interface IInventoryRepository {
  getAll(): Promise<InventoryItem[]>;
  add(item: InventoryItem): Promise<void>;
  // ...
}

// Firebase implementation
class FirebaseInventoryRepository implements IInventoryRepository {
  // Firebase-specific implementation
}

// Factory creates instances
export function createInventoryRepository(): IInventoryRepository {
  return new FirebaseInventoryRepository();
}
```

**Benefits:**
- Easy to swap implementations (Firebase → REST API → GraphQL)
- Testable with mock repositories
- Clear separation of concerns

#### 4. **Service Layer for Business Logic**

Domain services contain business rules and coordinate between repositories:

```typescript
export class InventoryService {
  constructor(
    private inventoryRepository: IInventoryRepository,
    private lossRepository: ILossRepository,
    private loggingService?: LoggingService
  ) {}

  async addInventoryLoss(loss: InventoryLoss, userEmail?: string) {
    // Business validation
    const inventory = await this.inventoryRepository.getAll();
    if (!hasEnoughStock(inventory, loss)) {
      throw new Error('Insufficient inventory');
    }

    // Multi-repository transaction
    await this.inventoryRepository.update(adjustedInventory);
    await this.lossRepository.add(loss);
    await this.loggingService?.logOperation({...});
  }
}
```

#### 5. **Centralized Service Registry**

All singleton instances are created and managed in one place:

```typescript
// services/registry.ts - Single source of truth
// 1. Infrastructure services (no dependencies)
export const loggingService = createHttpLoggingService();

// 2. Authentication service (depends on logging)
export const authService = createFirebaseAuthService(loggingService);

// 3. Data repositories (no dependencies)
export const inventoryRepository = createInventoryRepository();
export const lossRepository = createLossRepository();

// 4. Domain services (depend on repositories and logging)
export const inventoryService = new InventoryService(
  inventoryRepository,
  lossRepository,
  loggingService
);
```

**Benefits:**
- Clear dependency initialization order
- Easy to understand service relationships
- Single import point: `import { authService, inventoryService } from '../services'`

---

## 📁 Project Structure

```
web/
├── src/
│   ├── main.tsx                 # Application entry point
│   ├── App.tsx                  # Root component
│   │
│   ├── pages/                   # Page-level components
│   │   ├── Dashboard/
│   │   │   ├── DashboardContainer.tsx
│   │   │   └── DashboardView.tsx
│   │   ├── Inventory/
│   │   │   ├── InventoryContainer.tsx
│   │   │   └── InventoryView.tsx
│   │   ├── LossInventory/
│   │   │   ├── LossInventoryContainer.tsx
│   │   │   └── LossInventoryView.tsx
│   │   ├── Financial/
│   │   │   ├── FinancialContainer.tsx
│   │   │   ├── SalesView.tsx
│   │   │   ├── ExpensesView.tsx
│   │   │   └── SummaryView.tsx
│   │   └── Login/
│   │       ├── LoginContainer.tsx
│   │       └── LoginView.tsx
│   │
│   ├── components/              # Reusable UI components
│   │   ├── EditableTable.tsx    # Generic editable table with TypeScript generics
│   │   ├── ErrorMessage.tsx
│   │   ├── LoadingSpinner.tsx
│   │   ├── Navbar.tsx
│   │   ├── Filters.tsx
│   │   └── modals/
│   │       ├── AddInventoryModal.tsx
│   │       ├── AddInventoryLossModal.tsx
│   │       └── ConfirmActionModal.tsx
│   │
│   ├── hooks/                   # Custom React hooks
│   │   ├── useAuth.ts           # Authentication state
│   │   ├── useInventory.ts      # Inventory data fetching
│   │   ├── useInventoryCommands.ts  # Inventory CRUD operations
│   │   ├── useInventoryFilters.ts   # Inventory filtering logic
│   │   ├── useLossFilters.ts    # Loss filtering logic
│   │   ├── useLoginForm.ts      # Login form state
│   │   └── useModal.ts          # Modal state management
│   │
│   ├── routes/                  # Routing configuration
│   │   ├── index.tsx            # Route definitions
│   │   ├── Layout.tsx           # App layout wrapper
│   │   └── ProtectedRoute.tsx   # Auth guard component
│   │
│   ├── services/                # Service layer
│   │   ├── registry.ts          # ⭐ Centralized service instances
│   │   ├── index.ts             # Re-exports from registry
│   │   ├── logging.service.ts   # Logging abstraction
│   │   └── http.logging.service.ts  # HTTP logging implementation
│   │
│   ├── repositories/            # Data access layer
│   │   ├── factory.ts           # ⭐ Repository factories
│   │   ├── index.ts             # Repository exports
│   │   │
│   │   ├── interfaces/          # Repository contracts
│   │   │   ├── inventory.repository.ts
│   │   │   └── loss.repository.ts
│   │   │
│   │   ├── firebase/            # Firebase implementations
│   │   │   ├── firebase-inventory.repository.ts
│   │   │   └── firebase-loss.repository.ts
│   │   │
│   │   ├── services/            # Domain services
│   │   │   └── inventory.service.ts
│   │   │
│   │   └── utils/
│   │       └── date-formatter.ts
│   │
│   ├── auth/                    # Authentication
│   │   ├── auth.service.ts      # Auth service interface
│   │   └── firebase.auth.service.ts  # Firebase implementation
│   │
│   ├── db/                      # Database configuration
│   │   └── firestore.ts         # Firebase/Firestore initialization
│   │
│   ├── shared/                  # Shared utilities and types
│   │   ├── models/              # TypeScript type definitions
│   │   │   ├── auth.ts
│   │   │   └── inventory.ts
│   │   ├── constants/
│   │   │   └── inventory.ts
│   │   └── utils/
│   │
│   └── assets/                  # Static assets
│
├── public/                      # Public static files
├── dist/                        # Production build output
├── node_modules/
│
├── package.json
├── vite.config.ts               # Vite configuration
├── tailwind.config.js           # Tailwind configuration
├── tsconfig.json                # TypeScript configuration
└── eslint.config.js             # ESLint configuration
```

### Key Directories Explained

| Directory | Purpose | Key Files |
|-----------|---------|-----------|
| `/pages` | Page-level components with Container/View split | All route components |
| `/components` | Reusable UI components | EditableTable, Modals |
| `/hooks` | Custom React hooks for state and logic | useInventory, useAuth |
| `/services` | Business logic and service instances | **registry.ts** ⭐ |
| `/repositories` | Data access abstraction | **factory.ts** ⭐, interfaces, implementations |
| `/auth` | Authentication logic | Firebase auth service |
| `/routes` | Routing and navigation | ProtectedRoute |
| `/shared` | Types, models, constants | TypeScript definitions |

---

## 🎨 Design Patterns

### 1. **Repository Pattern**
Abstracts data access behind interfaces, allowing easy swapping of data sources.

**Use Case:** Switch from Firebase to REST API without changing business logic.

### 2. **Factory Pattern**
Creates repository and service instances through factory functions.

**Use Case:** Centralized object creation with flexibility for testing or configuration.

### 3. **Dependency Injection**
Services and hooks accept dependencies as parameters instead of hard-coding them.

**Use Case:** Makes testing easier and components more flexible.

### 4. **Service Layer Pattern**
Encapsulates business logic in service classes separate from UI and data layers.

**Use Case:** Complex operations like "add loss" that affect multiple repositories.

### 5. **Container/Presentational Pattern**
Separates stateful logic (containers) from pure UI (views).

**Use Case:** Easier testing and component reusability.

### 6. **Singleton Pattern**
Ensures single instances of services across the application via centralized registry.

**Use Case:** Shared state and consistent service behavior throughout the app.

### 7. **Custom Hooks Pattern**
Encapsulates reusable stateful logic in custom React hooks.

**Use Case:** Share logic like `useAuth`, `useModal` across multiple components.

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ and **npm** 9+
- **Firebase Project** with Firestore and Authentication enabled
- Firebase configuration credentials

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd flowershop-admin-panel/web
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   
   Create a `.env` file in the `web/` directory:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
   ```

4. **Run development server:**
   ```bash
   npm run dev
   ```

   Application will be available at `http://localhost:5173`

### Build for Production

```bash
npm run build      # Compiles TypeScript and builds for production
npm run preview    # Preview production build locally
```

---

## 👨‍💻 Development Guide

### Project Commands

```bash
npm run dev        # Start development server with HMR
npm run build      # Build for production
npm run preview    # Preview production build
npm run lint       # Run ESLint
```

### Adding a New Feature

Follow this pattern when adding features:

#### 1. **Define Types** (in `/shared/models`)
```typescript
// shared/models/product.ts
export type Product = {
  id: string;
  name: string;
  price: number;
}
```

#### 2. **Create Repository Interface** (in `/repositories/interfaces`)
```typescript
// repositories/interfaces/product.repository.ts
export interface IProductRepository {
  getAll(): Promise<Product[]>;
  add(product: Product): Promise<void>;
}
```

#### 3. **Implement Repository** (in `/repositories/firebase`)
```typescript
// repositories/firebase/firebase-product.repository.ts
export class FirebaseProductRepository implements IProductRepository {
  async getAll(): Promise<Product[]> {
    const snapshot = await getDocs(collection(db, 'products'));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }
}
```

#### 4. **Create Factory** (in `/repositories/factory.ts`)
```typescript
export function createProductRepository(): IProductRepository {
  return new FirebaseProductRepository();
}
```

#### 5. **Register in Service Registry** (in `/services/registry.ts`)
```typescript
export const productRepository = createProductRepository();
export const productService = new ProductService(productRepository, loggingService);
```

#### 6. **Create Custom Hook** (in `/hooks`)
```typescript
// hooks/useProducts.ts
export function useProducts(productService: ProductService) {
  const [products, setProducts] = useState<Product[]>([]);
  // ... fetch logic
  return { products, loading, error };
}
```

#### 7. **Build Container Component** (in `/pages`)
```typescript
// pages/Products/ProductsContainer.tsx
export function ProductsContainer() {
  const { products } = useProducts(productService);
  return <ProductsView products={products} />;
}
```

#### 8. **Build View Component**
```typescript
// pages/Products/ProductsView.tsx
export function ProductsView({ products }: { products: Product[] }) {
  return <div>{/* UI */}</div>;
}
```

### Code Quality Guidelines

#### TypeScript
- ✅ Use strict TypeScript (`strict: true`)
- ✅ Define explicit types for props and return values
- ✅ Use interfaces for objects, types for unions/primitives
- ✅ Leverage TypeScript generics for reusable components (see `EditableTable<T>`)

#### React Patterns
- ✅ Use functional components with hooks
- ✅ Separate containers from presentational components
- ✅ Extract reusable logic into custom hooks
- ✅ Use `useCallback` and `useMemo` for performance when needed

#### File Organization
- ✅ One component per file
- ✅ Co-locate related files (Container + View in same directory)
- ✅ Group by feature, not by type
- ✅ Use index files for clean imports

#### Naming Conventions
- **Files:** `PascalCase` for components, `camelCase` for utilities
- **Components:** `PascalCase` (e.g., `InventoryContainer`)
- **Hooks:** `use` prefix (e.g., `useInventory`)
- **Interfaces:** `I` prefix for repositories (e.g., `IInventoryRepository`)
- **Types:** `PascalCase` (e.g., `InventoryItem`)

---

## 🎯 Key Features

### 1. **Authentication System**
- Firebase Authentication integration
- Protected routes with auth guards
- Automatic user session management
- Login/logout functionality

### 2. **Inventory Management**
- Real-time inventory tracking
- Add, edit, delete inventory items
- Quality-based categorization
- Last updated timestamps
- Inline editing with confirmation modals

### 3. **Loss Tracking**
- Record inventory losses
- Automatic inventory quantity adjustment
- Loss history with timestamps
- Business validation (can't record more loss than available stock)

### 4. **Advanced Filtering**
- Text search across inventory
- Quality-based filtering
- Real-time filter updates
- Derived filtered state (no redundant data)

### 5. **Audit Logging**
- All operations logged with user and timestamp
- HTTP-based logging service (extensible to different backends)
- Operation types: add, update, delete inventory/losses

### 6. **Responsive UI**
- TailwindCSS for modern, responsive design
- Rose color theme for flower shop branding
- Loading states and error handling
- Accessible, user-friendly interface

---

## 🧪 Testing Strategy

### Current Implementation

The application is built with **testability in mind** through dependency injection, even though tests are not yet written.

### Architecture Supports Testing

#### ✅ Testable Hooks
```typescript
// Easy to test with mock services
const mockInventoryService = {
  getAllInventory: jest.fn().mockResolvedValue([]),
  addInventoryItem: jest.fn()
};

const { result } = renderHook(() => 
  useInventory(mockInventoryService)
);
```

#### ✅ Testable Components
```typescript
// Container logic can be tested separately
const mockAuth = { user: { email: 'test@example.com' } };
<InventoryContainer authService={mockAuth} />
```

#### ✅ Testable Services
```typescript
// Service layer isolated from data layer
const mockRepo = { getAll: jest.fn() };
const service = new InventoryService(mockRepo);
```

### Recommended Testing Tools

- **Vitest** - Fast unit test runner (Vite-native)
- **React Testing Library** - Component testing
- **Jest** - Alternative test runner
- **MSW** (Mock Service Worker) - API mocking for Firebase

### Future Testing Implementation

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom
```

**Test structure:**
```
src/
  __tests__/
    components/
    hooks/
    services/
```

---

## 📝 Code Style & Conventions

### Import Order
```typescript
// 1. External libraries
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// 2. Services and hooks
import { useAuth } from '../../hooks/useAuth';
import { authService } from '../../services';

// 3. Types
import type { InventoryItem } from '../../shared/models/inventory';

// 4. Components
import { LoadingSpinner } from '../../components/LoadingSpinner';
```

### Component Structure
```typescript
// 1. Imports
import { ... } from '...';

// 2. Types/Interfaces
type MyComponentProps = { ... };

// 3. Component Definition
export function MyComponent({ prop1, prop2 }: MyComponentProps) {
  // 4. Hooks (in order: state, effects, callbacks)
  const [state, setState] = useState();
  useEffect(() => { ... }, []);
  const handleClick = useCallback(() => { ... }, []);
  
  // 5. Render
  return <div>...</div>;
}
```

### Error Handling
```typescript
try {
  await service.operation();
} catch (error: unknown) {
  const errorMessage = error instanceof Error 
    ? error.message 
    : 'Unknown error';
  setError(errorMessage);
}
```

---

## 🔗 Related Projects

This frontend connects to:
- **NestJS API** (in `/api` directory) - Optional backend API with Prisma ORM
- **Firebase Backend** - Current primary backend (Firestore + Auth)

---

## 📚 Additional Resources

### Learn More
- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Vite Guide](https://vitejs.dev/guide/)
- [TailwindCSS Docs](https://tailwindcss.com/docs)
- [Firebase Documentation](https://firebase.google.com/docs)

### Architecture Patterns
- [Repository Pattern](https://martinfowler.com/eaaCatalog/repository.html)
- [Service Layer Pattern](https://martinfowler.com/eaaCatalog/serviceLayer.html)
- [Dependency Injection in React](https://medium.com/@matthill8286/dependency-injection-in-react-a-good-guide-with-code-examples-4afc8adc6cdb)

---

## 🤝 Contributing

When contributing to this codebase:

1. Follow the established architecture patterns
2. Maintain separation of concerns (Container/View, Repository/Service)
3. Use dependency injection for all hooks and services
4. Add TypeScript types for all new code
5. Update this README if adding new patterns or major features

---

**Built with ❤️ for modern web development**
