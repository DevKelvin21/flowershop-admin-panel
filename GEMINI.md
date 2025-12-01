# GEMINI.md

## Project Overview

This is a monorepo for a "Flowershop Admin Panel", a full-stack application for managing a flower shop. It consists of a React frontend and a NestJS backend.

**Frontend (`web`):**

*   **Technologies:** React 19, TypeScript, Vite, TailwindCSS 4, shadcn/ui, Radix UI, Firebase for authentication and database.
*   **Architecture:** The frontend follows a clean architecture with a repository pattern. It uses a container/view pattern for pages and a service layer for business logic. UI components follow shadcn/ui patterns with Radix UI primitives.
*   **Features:**
    *   Inventory management
    *   Loss tracking
    *   Financial reports
    *   Real-time data updates
    *   Dark mode theming
    *   Type-safe reusable filter components

**Backend (`api`):**

*   **Technologies:** NestJS, TypeScript, Prisma ORM, SQLite (for development).
*   **Architecture:** The backend is a standard NestJS application. It is currently in development and the project is transitioning from a Firebase backend to this NestJS API.
*   **Features:**
    *   REST API
    *   Database migrations
    *   Unit and E2E testing setup

## Building and Running

### Frontend

1.  Navigate to the `web` directory: `cd web`
2.  Install dependencies: `npm install`
3.  Create a `.env` file with your Firebase credentials.
4.  Run the development server: `npm run dev`
5.  Build for production: `npm run build`
6.  Lint the code: `npm run lint`

### Backend

1.  Navigate to the `api` directory: `cd api`
2.  Install dependencies: `npm install`
3.  Generate Prisma Client: `npm run prisma:generate`
4.  Run database migrations: `npm run prisma:migrate`
5.  Run the development server: `npm run start:dev`
6.  Build for production: `npm run build`
7.  Run tests: `npm run test`

## UI Component System

The project uses **shadcn/ui** components configured via `/web/components.json`:

*   **Style:** "new-york" variant
*   **Base Color:** neutral
*   **Icon Library:** Lucide React (primary), Font Awesome (legacy)
*   **Available Components:** Button, Badge, Input, Select, Popover, Calendar, Navigation Menu, Switch

**Component Location:** `/web/src/components/ui/`

**Theming:**
*   TailwindCSS 4 with CSS variables in OKLCH color space
*   Dark mode support via `.dark` class on root element
*   Theme toggle in Navbar component with localStorage persistence
*   Custom shadow system with brand colors

**Utility Functions:**
*   `cn()` in `/web/src/lib/utils.ts` - Merges class names using clsx + tailwind-merge
*   Path alias `@` maps to `./src` for clean imports

**Enhanced Filters Component** (`/web/src/components/Filters.tsx`):
*   Reusable filter component with search, multi-select, and date range picker
*   Type-safe with TypeScript generics
*   Props grouped by concern (search, selects, dateRange)
*   Uses Radix UI Select and Popover primitives

## Development Conventions

*   **Branching:**
    *   `main`: Production-ready code
    *   `develop`: Development branch
    *   `feature/*`: Feature branches
    *   `bugfix/*`: Bug fix branches
*   **Commit Messages:** The project follows the Conventional Commits specification.
*   **Code Style:** ESLint for linting (no Prettier currently).
*   **Architecture:**
    *   Frontend: Repository pattern + Container/View pattern for pages
    *   UI Components: shadcn/ui patterns with Radix UI primitives
    *   Props: Explicit TypeScript interfaces with grouped concerns
*   **Imports:** Use named exports only, no default exports
*   **Path Aliases:** Use `@/` prefix for imports (e.g., `@/components/ui/button`)
