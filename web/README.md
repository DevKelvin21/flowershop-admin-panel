# Frontend (`/web`)

React admin panel for Floristeria Morales operations.

## Stack

- React 19
- TypeScript
- Vite
- TanStack Router (file-based routes)
- TanStack Query
- TailwindCSS v4 + shadcn/ui
- Firebase Auth SDK (token issuance only)

## Run locally

```bash
npm install
npm run dev
```

Build and lint:

```bash
npm run lint
npm run build
npm run preview
```

Default URL: `http://localhost:5173`

## Environment

Set `/web/.env` with Firebase client credentials:

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`
- `VITE_FIREBASE_MEASUREMENT_ID`

Optional API base URL (defaults to local backend):

- `VITE_API_URL=http://localhost:8000/api/v1`

## Vercel deployment

For client-side routing (TanStack Router), keep the Vercel project root at `/web`
and use SPA rewrites so direct links like `/inventory` or `/financial` do not
return `404 NOT_FOUND`.

This repo includes `/web/vercel.json`:

```json
{
  "rewrites": [
    {
      "source": "/((?!.*\\..*).*)",
      "destination": "/index.html"
    }
  ]
}
```

## Architecture highlights

### Routing

Routes live in `src/routes`:

- `__root.tsx`
- `_authenticated.tsx`
- `_authenticated/index.tsx`
- `_authenticated/inventory.tsx`
- `_authenticated/financial.tsx`
- `login.tsx`

Inventory, Financial, and Dashboard routes use lazy route components.

### Data layer

- API client: `src/lib/api/client.ts`
- Endpoints: `src/lib/api/endpoints.ts`
- Query hooks:
  - `src/hooks/queries/inventory.ts`
  - `src/hooks/queries/transactions.ts`
  - `src/hooks/queries/ai.ts`

Query keys are normalized and grouped for targeted invalidation.

### Feature modules

- Inventory: container/view split in `src/pages/Inventory`
- Financial: container/view split in `src/pages/Financial`
  - Transaction modal uses provider + compound components (`src/pages/Financial/components/TransactionModal`)
  - AI draft autosave/recovery enabled (`useAiTransaction`)

### Services and auth

- Service registry: `src/services/registry.ts`
- Auth integration: `src/hooks/useAuth.ts`, `src/auth/firebase.auth.service.ts`
- API requests inject Firebase ID token automatically.

## UX and performance improvements in place

- Route-level selective prefetch (`ensureQueryData`) for Inventory/Financial.
- Optimistic update rollbacks cover list and detail query snapshots.
- Distinctive UI polish for layout, tables, filters, and summary cards.
- Heavy header logo asset removed from runtime path to reduce bundle weight.

## Notes

- `npm run lint` currently reports only known fast-refresh warnings from shared UI files.
- For phase-by-phase implementation history, see `/docs/plans/CODE_IMPROVEMENT_PHASES.md`.
