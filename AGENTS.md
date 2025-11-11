# Repository Guidelines

## Project Structure & Module Organization
The monorepo splits concerns into `web/` (React admin) and `api/` (NestJS service). Within `web/src` you will find feature folders such as `components/`, `pages/`, `routes/`, `repositories/`, and `services/`; co-locate Firebase-facing code under `services` and keep shared UI primitives inside `shared/`. **UI components** follow shadcn/ui patterns in `web/src/components/ui/` using Radix UI primitives. Backend code resides in `api/src` using Nest modules (`*.module.ts`, `*.service.ts`, `*.controller.ts`). Database artifacts live in `api/prisma/` (schema plus migrations), and integration tests sit under `api/test`. Static assets for Vite belong in `web/public` and `web/src/assets`.

## Build, Test, and Development Commands
- `cd web && npm run dev` starts the Vite server on port `5173` with Firebase auth driven by `.env`.
- `cd web && npm run build` compiles TypeScript and outputs `web/dist` for deployment; `npm run lint` enforces the ESLint flat config before pushing UI changes.
- `cd api && npm run start:dev` watches the Nest app on `3000`; run `npm run prisma:generate` and `npm run prisma:migrate` whenever the Prisma schema changes.
- `cd api && npm run test` executes Jest unit specs, while `npm run test:e2e` covers request/response flows end to end.

## Coding Style & Naming Conventions
Stick to strict TypeScript, prefer 2-space indentation (matches existing files), and avoid default exports for React components. Components, services, and hooks follow `PascalCase`, repositories end with `Repository`, and hooks follow the `useThing` pattern. Keep React views dumb by pushing remote calls into `repositories/` and `services/`. Frontend linting uses `web/eslint.config.js`. Always use **path alias `@/`** for imports (e.g., `@/components/ui/button`, `@/lib/utils`).

**UI Component Conventions:**
- UI primitives in `/web/src/components/ui/` follow shadcn/ui patterns using Radix UI
- Use `cn()` utility from `@/lib/utils` for conditional class merging (clsx + tailwind-merge)
- Components use `class-variance-authority` (cva) for variant management
- Props use explicit TypeScript interfaces, grouped by concern (filters, search, dateRange, etc.)
- Support Radix `asChild` prop via Slot pattern for composability
- Use Lucide React for icons (primary), Font Awesome is legacy

## Testing Guidelines
Add React specs with Vitest + React Testing Library beside the component (`Button.test.tsx`) and mock Firebase via MSW when touching networked flows. Nest already wires Jest: place unit specs next to the source (`*.spec.ts`) and e2e specs under `api/test`. Target smoke coverage for every route touched and ensure migrations include seed data for deterministic tests.

## Commit & Pull Request Guidelines
Follow Conventional Commits (`feat:`, `fix:`, `chore:`); keep subject lines under 72 characters and explain scope in the body when touching both `web` and `api`. Branches should match `feature/<ticket>` or `bugfix/<ticket>`. PRs must describe the change, list affected routes/modules, link the tracking issue, and attach before/after screenshots for UI edits. Confirm lint, tests, and Prisma migrations in the PR checklist before requesting review.
