# Code Improvement Roadmap (Living Document)

Last updated: 2026-02-16
Owner: Kelvin + Codex

## Scope
This roadmap tracks code improvements for frontend and backend.
Deployment architecture changes are intentionally out of scope for now.

Skills applied for this roadmap:
- `vercel-composition-patterns` (compound components, context interface, explicit variants)
- `frontend-design` (intentional visual polish phase, responsive and distinctive UI direction)

## Baseline Snapshot (Before Phase Work)
- Frontend build passes.
- Frontend lint fails (`ConfirmActionModal` uses `any`).
- Backend build passes.
- Backend lint fails (multiple strict typing issues).
- Backend unit/e2e tests fail (legacy tests and e2e path resolution issue).
- AI parsing flow works but is synchronous (this is acceptable for single-user scope).

## Phase Status
| Phase | Name | Status | Notes |
|---|---|---|---|
| 0 | Guardrails and Workspace Hygiene | In Progress | Baseline captured; branch/scope conventions still to formalize |
| 1 | Quality Gate Recovery | Completed | Lint/build/tests now pass for FE+BE |
| 2 | Financial Module Composition Refactor | Completed | Compound modal + context + row-click detail shipped |
| 3 | Synchronous AI Resilience and Cost Controls | Completed | Timeout/retry/fallback + draft autosave + cost caps |
| 4 | Query and Data Layer Tightening | Completed | Query key normalization, targeted invalidation, prefetch, analytics type alignment |
| 5 | Frontend Design Polish | Pending | Distinctive, coherent UI refresh |
| 6 | Performance and Bundle Reduction | Pending | Reduce JS/CSS payload and heavy assets |
| 7 | Documentation and Phase Closure | Pending | Align docs with actual architecture |

---

## Phase 0 - Guardrails and Workspace Hygiene
### Goals
- Start from a known baseline and track changes cleanly.

### Tasks
- [ ] Create working branch with `codex/` prefix.
- [ ] Capture current validation results (`web lint/build`, `api lint/build/test/test:e2e`).
- [ ] Confirm whether existing uncommitted changes are in-scope or to be ignored.
- [ ] Add this roadmap file to version control.

### Exit Criteria
- Baseline status is documented and agreed.
- Work can proceed phase-by-phase without ambiguity.

---

## Phase 1 - Quality Gate Recovery
### Goals
- Make lint and test commands trustworthy again.

### Tasks
- [ ] Replace `any` usage in `/web/src/components/modals/ConfirmActionModal.tsx`.
- [ ] Resolve backend lint errors in common guards/interceptors/filters and DTO typings.
- [ ] Fix backend unit test expectations for current health endpoint contract.
- [ ] Fix e2e import resolution for `src/*` paths (or switch to relative imports).
- [ ] Make test suite assertions match current API behavior (`/api/v1/health` instead of legacy root route behavior).

### Exit Criteria
- `web`: `npm run lint` and `npm run build` pass.
- `api`: `npm run lint`, `npm run build`, `npm run test`, `npm run test:e2e` pass.

---

## Phase 2 - Financial Module Composition Refactor
Pattern source: `vercel-composition-patterns`

### Goals
- Eliminate modal prop bloat and TODO gaps in financial flow.

### Tasks
- [x] Add `TransactionModalProvider` with explicit context interface:
  - `state`
  - `actions`
  - `meta`
- [x] Split modal into compound subcomponents:
  - `TransactionModal.Frame`
  - `TransactionModal.Header`
  - `TransactionModal.Body`
  - `TransactionModal.Footer`
- [x] Implement explicit variants instead of mode booleans:
  - `AddTransactionModal`
  - `ViewTransactionModal`
  - `EditTransactionModal` (at least scaffold + entry point)
- [x] Wire row click in transaction table to open detail view.
- [x] Keep delete action available both in table and detail view.
- [x] Remove obsolete TODO and old monolithic modal path.

### Exit Criteria
- Financial container/view props are simplified.
- Detail view modal works on row click.
- Add/view/edit flows are explicit and type-safe.

---

## Phase 3 - Synchronous AI Resilience and Cost Controls
### Goals
- Keep sync architecture, improve behavior on unstable network, and control API spend.

### Tasks
- [x] Add backend timeout and single retry policy for transient OpenAI errors.
- [x] Add graceful fallback parser (rule-based minimal extraction) when AI fails.
- [x] Add frontend transaction draft autosave and recovery.
- [x] Keep manual transaction path fully usable when AI is unavailable.
- [x] Limit prompt/context size and response tokens to reduce cost.
- [x] Add lightweight dedupe/cache for repeated prompt submissions in short windows.

### Exit Criteria
- User can complete transaction flow even with intermittent failures.
- AI failure no longer blocks core business workflow.
- Cost controls are documented and measurable.

---

## Phase 4 - Query and Data Layer Tightening
### Goals
- Improve consistency and reduce unnecessary requests.

### Tasks
- [x] Standardize query key usage and invalidations across inventory/transactions.
- [x] Review stale times by volatility (inventory vs transaction list vs summary).
- [x] Add selective prefetching for likely next routes/views.
- [x] Fix type mismatch between analytics API response (`amount`) and frontend contract (`total`).
- [x] Ensure optimistic updates rollback cleanly on failure.

### Exit Criteria
- No stale/incorrect UI after mutations.
- Query behavior is predictable and documented in code comments where needed.

---

## Phase 5 - Frontend Design Polish
Pattern source: `frontend-design`

### Goals
- Deliver a coherent and distinctive UI polish, not generic defaults.

### Tasks
- [ ] Define visual direction (typography, palette, motion, spacing system).
- [ ] Improve information hierarchy in Inventory and Financial screens.
- [ ] Refine tables, filters, and modals for readability and mobile behavior.
- [ ] Add meaningful animation moments (load transitions, staged reveals where appropriate).
- [ ] Ensure accessibility basics (focus states, contrast, keyboard reachability).

### Exit Criteria
- Desktop and mobile views feel intentional and consistent.
- Critical workflows remain fast and clear after styling updates.

---

## Phase 6 - Performance and Bundle Reduction
### Goals
- Reduce payload and improve runtime responsiveness.

### Tasks
- [ ] Implement route/component lazy loading where it reduces main bundle.
- [ ] Remove unused dependencies and dead components.
- [ ] Optimize large static assets (notably logo size/format strategy).
- [ ] Re-check Vite output for chunk warnings and resolve largest offenders.

### Exit Criteria
- Main bundle and critical path assets are reduced.
- No regressions in route navigation and first meaningful render.

---

## Phase 7 - Documentation and Phase Closure
### Goals
- Keep docs aligned with real code after changes.

### Tasks
- [ ] Update root README, `/web/README.md`, and `/api/README.md` to current architecture.
- [ ] Remove outdated migration status text that conflicts with implementation.
- [ ] Add short developer runbook for local validation and common failures.
- [ ] Summarize completed phases with links to PRs/commits.

### Exit Criteria
- Documentation reflects actual FE/BE architecture and commands.
- New contributor can run and validate without tribal knowledge.

---

## Phase Update Protocol (Use This After Every Phase)
Copy this template and append an entry under "Phase Change Log".

```md
### Phase X - <Name>
- Status: Completed | In Progress | Blocked
- Date: YYYY-MM-DD
- Summary:
  - ...
- Files changed:
  - /absolute/path/file1
  - /absolute/path/file2
- Validation:
  - command: result
  - command: result
- Risks / Follow-ups:
  - ...
```

## Phase Change Log
### Phase Audit (Initial)
- Status: Completed
- Date: 2026-02-16
- Summary:
  - Baseline implementation and gaps reviewed.
  - This roadmap created for phased execution and updates.
- Files changed:
  - /Users/kelvin/Sources/Floristeria Morales/flowershop-admin-panel/CODE_IMPROVEMENT_PHASES.md
- Validation:
  - roadmap file creation: done
- Risks / Follow-ups:
  - Existing dirty workspace needs explicit scope agreement before broad edits.

### Phase Docs - Local PostgreSQL Runbook
- Status: Completed
- Date: 2026-02-16
- Summary:
  - Added macOS Homebrew PostgreSQL setup, service commands, and role/database bootstrap instructions.
  - Included project-specific `DATABASE_URL` format in docs.
- Files changed:
  - /Users/kelvin/Sources/Floristeria Morales/flowershop-admin-panel/README.md
  - /Users/kelvin/Sources/Floristeria Morales/flowershop-admin-panel/api/README.md
- Validation:
  - manual doc verification: done
- Risks / Follow-ups:
  - README files still contain broader outdated architecture sections to be addressed in Phase 7.

### Phase 1 - Quality Gate Recovery
- Status: Completed
- Date: 2026-02-16
- Summary:
  - Removed unsafe `any` usage from the shared confirm modal type contract.
  - Fixed backend lint errors in guard/filter/interceptors/decorators/services/DTOs.
  - Updated backend unit and e2e tests to match current `/api/v1/health` behavior.
  - Added e2e alias mapping for `src/*` imports.
- Files changed:
  - /Users/kelvin/Sources/Floristeria Morales/flowershop-admin-panel/web/src/components/modals/ConfirmActionModal.tsx
  - /Users/kelvin/Sources/Floristeria Morales/flowershop-admin-panel/api/src/common/decorators/current-user.decorator.ts
  - /Users/kelvin/Sources/Floristeria Morales/flowershop-admin-panel/api/src/common/filters/http-exception.filter.ts
  - /Users/kelvin/Sources/Floristeria Morales/flowershop-admin-panel/api/src/common/guards/firebase-auth.guard.ts
  - /Users/kelvin/Sources/Floristeria Morales/flowershop-admin-panel/api/src/common/interceptors/audit-log.interceptor.ts
  - /Users/kelvin/Sources/Floristeria Morales/flowershop-admin-panel/api/src/common/interceptors/transform.interceptor.ts
  - /Users/kelvin/Sources/Floristeria Morales/flowershop-admin-panel/api/src/modules/ai/ai.service.ts
  - /Users/kelvin/Sources/Floristeria Morales/flowershop-admin-panel/api/src/modules/audit/audit.service.ts
  - /Users/kelvin/Sources/Floristeria Morales/flowershop-admin-panel/api/src/modules/inventory/dto/create-inventory.dto.ts
  - /Users/kelvin/Sources/Floristeria Morales/flowershop-admin-panel/api/src/modules/inventory/dto/inventory-query.dto.ts
  - /Users/kelvin/Sources/Floristeria Morales/flowershop-admin-panel/api/src/main.ts
  - /Users/kelvin/Sources/Floristeria Morales/flowershop-admin-panel/api/src/app.controller.spec.ts
  - /Users/kelvin/Sources/Floristeria Morales/flowershop-admin-panel/api/test/app.e2e-spec.ts
  - /Users/kelvin/Sources/Floristeria Morales/flowershop-admin-panel/api/test/jest-e2e.json
- Validation:
  - `web npm run lint`: pass (warnings only)
  - `web npm run build`: pass
  - `api npm run lint`: pass
  - `api npm run build`: pass
  - `api npm run test`: pass
  - `api npm run test:e2e`: pass
- Risks / Follow-ups:
  - Frontend lint still has non-blocking fast-refresh warnings in shared UI files.

### Phase 2 - Financial Module Composition Refactor
- Status: Completed
- Date: 2026-02-16
- Summary:
  - Replaced the monolithic Financial transaction modal with a context-backed compound modal architecture.
  - Added explicit modal variants (`AddTransactionModal`, `ViewTransactionModal`, `EditTransactionModal`) with shared provider state/actions/meta contract.
  - Implemented transaction detail view for row-click flow and added edit-mode scaffold entry point.
  - Simplified Financial container/view wiring by removing modal prop drilling and centralizing modal actions in context.
  - Kept delete action available in both table row actions and detail modal footer.
- Files changed:
  - /Users/kelvin/Sources/Floristeria Morales/flowershop-admin-panel/web/src/pages/Financial/FinancialContainer.tsx
  - /Users/kelvin/Sources/Floristeria Morales/flowershop-admin-panel/web/src/pages/Financial/FinancialView.tsx
  - /Users/kelvin/Sources/Floristeria Morales/flowershop-admin-panel/web/src/pages/Financial/components/TransactionTable.tsx
  - /Users/kelvin/Sources/Floristeria Morales/flowershop-admin-panel/web/src/pages/Financial/components/TransactionModal/AddTransactionModal.tsx
  - /Users/kelvin/Sources/Floristeria Morales/flowershop-admin-panel/web/src/pages/Financial/components/TransactionModal/EditTransactionModal.tsx
  - /Users/kelvin/Sources/Floristeria Morales/flowershop-admin-panel/web/src/pages/Financial/components/TransactionModal/TransactionAddForm.tsx
  - /Users/kelvin/Sources/Floristeria Morales/flowershop-admin-panel/web/src/pages/Financial/components/TransactionModal/TransactionDetailView.tsx
  - /Users/kelvin/Sources/Floristeria Morales/flowershop-admin-panel/web/src/pages/Financial/components/TransactionModal/TransactionEditForm.tsx
  - /Users/kelvin/Sources/Floristeria Morales/flowershop-admin-panel/web/src/pages/Financial/components/TransactionModal/TransactionModal.tsx
  - /Users/kelvin/Sources/Floristeria Morales/flowershop-admin-panel/web/src/pages/Financial/components/TransactionModal/TransactionModalBody.tsx
  - /Users/kelvin/Sources/Floristeria Morales/flowershop-admin-panel/web/src/pages/Financial/components/TransactionModal/TransactionModalContext.ts
  - /Users/kelvin/Sources/Floristeria Morales/flowershop-admin-panel/web/src/pages/Financial/components/TransactionModal/TransactionModalFooter.tsx
  - /Users/kelvin/Sources/Floristeria Morales/flowershop-admin-panel/web/src/pages/Financial/components/TransactionModal/TransactionModalHeader.tsx
  - /Users/kelvin/Sources/Floristeria Morales/flowershop-admin-panel/web/src/pages/Financial/components/TransactionModal/TransactionModalProvider.tsx
  - /Users/kelvin/Sources/Floristeria Morales/flowershop-admin-panel/web/src/pages/Financial/components/TransactionModal/ViewTransactionModal.tsx
  - /Users/kelvin/Sources/Floristeria Morales/flowershop-admin-panel/web/src/pages/Financial/components/TransactionModal/index.ts
  - /Users/kelvin/Sources/Floristeria Morales/flowershop-admin-panel/web/src/pages/Financial/components/TransactionModal/types.ts
  - /Users/kelvin/Sources/Floristeria Morales/flowershop-admin-panel/web/src/pages/Financial/components/TransactionModal/useTransactionModal.ts
  - /Users/kelvin/Sources/Floristeria Morales/flowershop-admin-panel/web/src/pages/Financial/components/TransactionModal.tsx (deleted)
  - /Users/kelvin/Sources/Floristeria Morales/flowershop-admin-panel/CODE_IMPROVEMENT_PHASES.md
- Validation:
  - `web npm run lint`: pass (warnings only, unchanged baseline 4 warnings)
  - `web npm run build`: pass
- Risks / Follow-ups:
  - Edit mode is intentionally scaffold-only in this phase and does not persist updates yet.

### Phase 3 - Synchronous AI Resilience and Cost Controls
- Status: Completed
- Date: 2026-02-16
- Summary:
  - Added backend timeout and explicit one-retry logic for transient OpenAI failures.
  - Added a synchronous rule-based fallback parser so `/ai/parse-transaction` keeps working even when OpenAI is unavailable.
  - Added prompt/context/token cost caps and short-window in-memory dedupe/cache for repeated prompts.
  - Added frontend transaction draft autosave/recovery (localStorage, 24h TTL) to reduce data loss on flaky networks.
  - Added backend unit tests for fallback parser behavior and inventory-empty guard.
- Files changed:
  - /Users/kelvin/Sources/Floristeria Morales/flowershop-admin-panel/api/src/modules/ai/ai.service.ts
  - /Users/kelvin/Sources/Floristeria Morales/flowershop-admin-panel/api/src/modules/ai/ai.controller.ts
  - /Users/kelvin/Sources/Floristeria Morales/flowershop-admin-panel/api/src/modules/ai/dto/parse-transaction.dto.ts
  - /Users/kelvin/Sources/Floristeria Morales/flowershop-admin-panel/api/src/modules/ai/ai.service.spec.ts
  - /Users/kelvin/Sources/Floristeria Morales/flowershop-admin-panel/web/src/pages/Financial/hooks/useAiTransaction.ts
  - /Users/kelvin/Sources/Floristeria Morales/flowershop-admin-panel/CODE_IMPROVEMENT_PHASES.md
- Validation:
  - `api npm run lint`: pass
  - `api npm run build`: pass
  - `api npm run test -- --runInBand`: pass
  - `api npm run test:e2e`: pass
  - `web npm run lint`: pass (warnings only, unchanged baseline 4 warnings)
  - `web npm run build`: pass
- Risks / Follow-ups:
  - Fallback parser is intentionally conservative and may require manual adjustment for ambiguous prompts.
  - AI dedupe/cache is in-memory (single instance); persistent/shared cache is out of scope for current single-user architecture.

### Phase 4 - Query and Data Layer Tightening
- Status: Completed
- Date: 2026-02-16
- Summary:
  - Standardized inventory/transaction query keys with normalized params and explicit key roots for stable targeted invalidation.
  - Tuned stale times by data volatility (transactions/summary fresher than analytics, inventory lists/details fresher than long-lived cache).
  - Added route-level selective prefetch for Financial and Inventory using TanStack Router loaders + `ensureQueryData`.
  - Fixed analytics contract mismatch by returning `total` per day from backend and adding frontend normalization for legacy `amount`.
  - Strengthened optimistic updates with detail-query snapshots and rollback restore paths for update/delete flows.
- Files changed:
  - /Users/kelvin/Sources/Floristeria Morales/flowershop-admin-panel/web/src/hooks/queries/query-key-utils.ts
  - /Users/kelvin/Sources/Floristeria Morales/flowershop-admin-panel/web/src/hooks/queries/transactions.ts
  - /Users/kelvin/Sources/Floristeria Morales/flowershop-admin-panel/web/src/hooks/queries/inventory.ts
  - /Users/kelvin/Sources/Floristeria Morales/flowershop-admin-panel/web/src/pages/Financial/utils/dateRange.ts
  - /Users/kelvin/Sources/Floristeria Morales/flowershop-admin-panel/web/src/pages/Financial/hooks/useFinancialFilters.ts
  - /Users/kelvin/Sources/Floristeria Morales/flowershop-admin-panel/web/src/routes/_authenticated/financial.tsx
  - /Users/kelvin/Sources/Floristeria Morales/flowershop-admin-panel/web/src/routes/_authenticated/inventory.tsx
  - /Users/kelvin/Sources/Floristeria Morales/flowershop-admin-panel/web/src/lib/api/endpoints.ts
  - /Users/kelvin/Sources/Floristeria Morales/flowershop-admin-panel/api/src/modules/transactions/transactions.service.ts
  - /Users/kelvin/Sources/Floristeria Morales/flowershop-admin-panel/api/src/modules/transactions/transactions.controller.ts
  - /Users/kelvin/Sources/Floristeria Morales/flowershop-admin-panel/CODE_IMPROVEMENT_PHASES.md
- Validation:
  - `web npm run lint`: pass (warnings only, unchanged baseline 4 warnings)
  - `web npm run build`: pass
  - `api npm run lint`: pass
  - `api npm run build`: pass
  - `api npm run test -- --runInBand`: pass
  - `api npm run test:e2e`: pass
- Risks / Follow-ups:
  - Prefetch loaders use `Promise.allSettled` to avoid navigation failures; cache warm-up is best-effort under poor network conditions.
