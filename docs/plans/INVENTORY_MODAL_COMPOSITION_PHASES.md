# Inventory Modal Composition Plan (Living Document)

Last updated: 2026-02-16
Owner: Kelvin + Codex

## Scope
Refactor Inventory modal flows with compound components and clearer UI structure.

Skills applied for this plan:
- `vercel-composition-patterns` (compound components, explicit variants, context discipline)
- `frontend-design` (modal layout hierarchy, readable spacing, interaction polish)

## Phase Status
| Phase | Name | Status | Notes |
|---|---|---|---|
| 0 | Documentation Reorganization | Completed | Root docs decluttered and references moved to `docs/` |
| 1 | Modal Compound Shell Foundation | Completed | Shared compound modal shell extracted |
| 2 | Add Inventory Modal Refactor | Completed | Add-inventory modal migrated to compound structure |
| 3 | Add Inventory Loss Modal Refactor | Completed | Add-loss modal migrated to compound structure |
| 4 | Integration and Validation | Completed | Call sites/types updated and lint/build validated |
| 5 | Optional Price Registration UX | Completed | Unit price removed from add flow with backend `0` acceptance |
| 6 | Loss Selector Scalability UX | Completed | Quality filter + search-narrowed dropdown added to loss modal |
| 7 | Transaction Manual Total Consistency | Completed | Manual total override added across add-modal draft and API create flow |
| 8 | Modal Layering and Clipping Hardening | Completed | Inventory/loss modals now use scroll-safe frame above sticky navbar |

---

## Phase 0 - Documentation Reorganization
### Goals
- Reduce root-level markdown clutter.
- Keep roadmap/planning docs in predictable folders.

### Tasks
- [x] Create `docs/plans` and `docs/archive/migration` folders.
- [x] Move migration/refactor markdown files from repo root into archive.
- [x] Update all in-repo references to moved files.
- [x] Add `docs/README.md` index.

### Exit Criteria
- Root contains only core repo docs (`README.md`, `AGENTS.md`, `CLAUDE.md`, etc.).
- Planning and migration docs are discoverable from `docs/README.md`.

---

## Phase 1 - Modal Compound Shell Foundation
### Goals
- Define a reusable modal shell with composable building blocks.

### Tasks
- [x] Create shared compound modal primitives for `Frame`, `Header`, `Body`, `Footer`, and field wrapper.
- [x] Keep API explicit and avoid boolean-prop explosion.
- [x] Preserve current close/cancel behavior.

### Exit Criteria
- Both inventory modals can use the shared shell without copy/paste structure.

---

## Phase 2 - Add Inventory Modal Refactor
### Goals
- Migrate add-inventory modal to the compound shell with improved usability.

### Tasks
- [x] Keep existing validation rules and toasts.
- [x] Add form reset behavior on cancel and successful submit.
- [x] Add submit-pending state to avoid double submit.
- [x] Keep current public component contract used by page containers.

### Exit Criteria
- Add inventory flow works exactly as before, with cleaner implementation.

---

## Phase 3 - Add Inventory Loss Modal Refactor
### Goals
- Apply the same compound approach to add-loss modal.

### Tasks
- [x] Preserve current validation and payload shape.
- [x] Keep inventory select behavior (populate item/quality from selected option).
- [x] Align spacing, labels, and action bar with add-inventory modal.
- [x] Maintain reset on cancel/success.

### Exit Criteria
- Add loss flow matches existing behavior and visual language.

---

## Phase 4 - Integration and Validation
### Goals
- Ensure no regressions at call sites and in TypeScript contracts.

### Tasks
- [x] Update legacy/current view call-sites for refined modal prop types.
- [x] Run `npm run lint` in `/web`.
- [x] Run `npm run build` in `/web`.
- [x] Capture results and any follow-ups.

### Exit Criteria
- Frontend lint and build pass.
- Plan log updated with concrete file and validation outputs.

---

## Phase 5 - Optional Price Registration UX
### Goals
- Let staff register inventory without entering unit price.
- Preserve API compatibility and avoid blocking existing transaction flows.

### Tasks
- [x] Remove unit price field from add-inventory modal form.
- [x] Keep payload compatible by defaulting `unitPrice` to `0`.
- [x] Update backend validation to accept `unitPrice = 0`.
- [x] Keep existing add-item success/error behavior.

### Exit Criteria
- User can create inventory without unit price input.
- API accepts the request and persists item successfully.

---

## Phase 6 - Loss Selector Scalability UX
### Goals
- Improve add-loss modal usability for large inventories.

### Tasks
- [x] Add quality filter control in add-loss modal.
- [x] Add text search input to narrow inventory options.
- [x] Render filtered options in dropdown selector with empty-state handling.
- [x] Ensure selected item clears when filters exclude it.

### Exit Criteria
- Users can quickly find an item in long inventories by quality and name.
- Loss submission still preserves current payload contract.

---

## Phase 7 - Transaction Manual Total Consistency
### Goals
- Allow staff to enter transaction total manually when per-item prices vary.
- Keep backend totals, analytics, and modal behavior consistent with recent inventory changes.

### Tasks
- [x] Add manual total field to financial add-transaction modal draft.
- [x] Send optional `totalAmount` in create transaction payload.
- [x] Update backend create transaction DTO/service to accept and persist manual totals.
- [x] Keep item-level revenue internally consistent with transaction total when override is provided.

### Exit Criteria
- Users can save transactions with manual total from add modal.
- Summary totals and item-level analytics remain coherent.

---

## Phase 8 - Modal Layering and Clipping Hardening
### Goals
- Prevent inventory/loss modal clipping with sticky header and small viewports.

### Tasks
- [x] Make inventory modal frame scroll-safe for tall forms.
- [x] Ensure modal z-index reliably overlays sticky navbar.
- [x] Re-check add inventory and add loss behavior after layout update.

### Exit Criteria
- Loss modal is fully visible and scrollable on constrained heights.
- Navbar no longer clips modal content.

---

## Phase Update Protocol
Append one entry per completed phase:

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
- Risks / Follow-ups:
  - ...
```

## Phase Change Log
### Phase Plan Initialization
- Status: Completed
- Date: 2026-02-16
- Summary:
  - Created dedicated phased plan for inventory modal composition refactor.
  - Scoped documentation cleanup plus implementation/validation phases.
- Files changed:
  - /Users/kelvin/Sources/Floristeria Morales/flowershop-admin-panel/docs/plans/INVENTORY_MODAL_COMPOSITION_PHASES.md
- Validation:
  - plan file creation: done
- Risks / Follow-ups:
  - Phase statuses must be updated immediately after each implementation chunk.

### Phase 0 - Documentation Reorganization
- Status: Completed
- Date: 2026-02-16
- Summary:
  - Moved roadmap and migration markdown files into `docs/plans` and `docs/archive/migration`.
  - Added centralized docs index and fixed README/CLAUDE references to new paths.
- Files changed:
  - /Users/kelvin/Sources/Floristeria Morales/flowershop-admin-panel/docs/README.md
  - /Users/kelvin/Sources/Floristeria Morales/flowershop-admin-panel/docs/plans/CODE_IMPROVEMENT_PHASES.md
  - /Users/kelvin/Sources/Floristeria Morales/flowershop-admin-panel/README.md
  - /Users/kelvin/Sources/Floristeria Morales/flowershop-admin-panel/web/README.md
  - /Users/kelvin/Sources/Floristeria Morales/flowershop-admin-panel/api/README.md
  - /Users/kelvin/Sources/Floristeria Morales/flowershop-admin-panel/CLAUDE.md
- Validation:
  - root markdown cleanup (`ls -1`): done
- Risks / Follow-ups:
  - CLAUDE migration narrative still contains historical text and should stay treated as archive context.

### Phase 1 - Modal Compound Shell Foundation
- Status: Completed
- Date: 2026-02-16
- Summary:
  - Added shared inventory modal compound shell to centralize modal layout and action patterns.
  - Introduced reusable sections for frame/header/body/field/footer to remove duplicated structure.
- Files changed:
  - /Users/kelvin/Sources/Floristeria Morales/flowershop-admin-panel/web/src/components/modals/inventory/InventoryFormModal.tsx
- Validation:
  - `web npm run lint`: pass (warnings only)
- Risks / Follow-ups:
  - Future modal variants should prefer this shell to avoid regression into duplicated modal markup.

### Phase 2 - Add Inventory Modal Refactor
- Status: Completed
- Date: 2026-02-16
- Summary:
  - Rebuilt add-inventory modal using the compound shell and consistent field composition.
  - Added submit-pending button state and explicit form reset paths.
- Files changed:
  - /Users/kelvin/Sources/Floristeria Morales/flowershop-admin-panel/web/src/components/modals/AddInventoryModal.tsx
- Validation:
  - `web npm run build`: pass
- Risks / Follow-ups:
  - Command layer currently swallows mutation errors, so modal submit success is inferred from callback behavior.

### Phase 3 - Add Inventory Loss Modal Refactor
- Status: Completed
- Date: 2026-02-16
- Summary:
  - Rebuilt add-loss modal on the same compound shell for shared hierarchy and spacing.
  - Preserved inventory-selection mapping and payload contract while adding submit-pending state.
- Files changed:
  - /Users/kelvin/Sources/Floristeria Morales/flowershop-admin-panel/web/src/components/modals/AddInventoryLossModal.tsx
- Validation:
  - `web npm run build`: pass
- Risks / Follow-ups:
  - `reason` still allows empty string by design; backend defaults only apply when value is `null`/`undefined`.

### Phase 4 - Integration and Validation
- Status: Completed
- Date: 2026-02-16
- Summary:
  - Updated inventory page/view and command hook type contracts to align with new modal payload shapes.
  - Executed lint/build verification for frontend after refactor.
- Files changed:
  - /Users/kelvin/Sources/Floristeria Morales/flowershop-admin-panel/web/src/pages/Inventory/InventoryPageView.tsx
  - /Users/kelvin/Sources/Floristeria Morales/flowershop-admin-panel/web/src/pages/Inventory/InventoryView.tsx
  - /Users/kelvin/Sources/Floristeria Morales/flowershop-admin-panel/web/src/hooks/useInventoryData.ts
- Validation:
  - `web npm run lint`: pass (4 pre-existing fast-refresh warnings)
  - `web npm run build`: pass (chunk-size warning remains on main bundle)
- Risks / Follow-ups:
  - Existing bundle-size warning should be handled in the broader performance phase backlog.

### Phase 5 - Optional Price Registration UX
- Status: Completed
- Date: 2026-02-16
- Summary:
  - Removed unit price input from the add-inventory modal and defaulted created items to `unitPrice: 0`.
  - Updated inventory DTO validation to accept zero-value price for create/update requests.
- Files changed:
  - /Users/kelvin/Sources/Floristeria Morales/flowershop-admin-panel/web/src/components/modals/AddInventoryModal.tsx
  - /Users/kelvin/Sources/Floristeria Morales/flowershop-admin-panel/api/src/modules/inventory/dto/create-inventory.dto.ts
  - /Users/kelvin/Sources/Floristeria Morales/flowershop-admin-panel/api/src/modules/inventory/dto/update-inventory.dto.ts
  - /Users/kelvin/Sources/Floristeria Morales/flowershop-admin-panel/docs/plans/INVENTORY_MODAL_COMPOSITION_PHASES.md
- Validation:
  - `web npm run lint`: pass (warnings only)
  - `web npm run build`: pass
  - `api npm run lint`: pass
  - `api npm run build`: pass
- Risks / Follow-ups:
  - Financial totals currently derive from inventory `unitPrice`; items with `0` will produce zero-valued transaction subtotals.

### Phase 6 - Loss Selector Scalability UX
- Status: Completed
- Date: 2026-02-16
- Summary:
  - Added quality filtering and text search controls to narrow inventory options in add-loss flow.
  - Added filtered-result hinting and selection reset when active filters remove the selected item.
- Files changed:
  - /Users/kelvin/Sources/Floristeria Morales/flowershop-admin-panel/web/src/components/modals/AddInventoryLossModal.tsx
  - /Users/kelvin/Sources/Floristeria Morales/flowershop-admin-panel/docs/plans/INVENTORY_MODAL_COMPOSITION_PHASES.md
- Validation:
  - `web npm run lint`: pass (warnings only)
  - `web npm run build`: pass
- Risks / Follow-ups:
  - If inventory grows further, a virtualized combobox may still be preferable to native `<select>`.

### Phase 7 - Transaction Manual Total Consistency
- Status: Completed
- Date: 2026-02-16
- Summary:
  - Added optional manual total input in add-transaction modal draft with suggested total hint from inventory prices.
  - Extended create transaction payload and backend DTO/service to accept `totalAmount` overrides while distributing item subtotals consistently.
- Files changed:
  - /Users/kelvin/Sources/Floristeria Morales/flowershop-admin-panel/web/src/pages/Financial/hooks/useAiTransaction.ts
  - /Users/kelvin/Sources/Floristeria Morales/flowershop-admin-panel/web/src/pages/Financial/components/TransactionModal/TransactionAddForm.tsx
  - /Users/kelvin/Sources/Floristeria Morales/flowershop-admin-panel/web/src/pages/Financial/components/TransactionModal/TransactionModalProvider.tsx
  - /Users/kelvin/Sources/Floristeria Morales/flowershop-admin-panel/web/src/pages/Financial/components/TransactionModal/types.ts
  - /Users/kelvin/Sources/Floristeria Morales/flowershop-admin-panel/web/src/pages/Financial/hooks/useFinancialData.ts
  - /Users/kelvin/Sources/Floristeria Morales/flowershop-admin-panel/web/src/lib/api/types.ts
  - /Users/kelvin/Sources/Floristeria Morales/flowershop-admin-panel/api/src/modules/transactions/dto/create-transaction.dto.ts
  - /Users/kelvin/Sources/Floristeria Morales/flowershop-admin-panel/api/src/modules/transactions/transactions.service.ts
  - /Users/kelvin/Sources/Floristeria Morales/flowershop-admin-panel/docs/plans/INVENTORY_MODAL_COMPOSITION_PHASES.md
- Validation:
  - `web npm run lint`: pass (warnings only)
  - `web npm run build`: pass
  - `api npm run lint`: pass
  - `api npm run build`: pass
- Risks / Follow-ups:
  - Manual totals are optional; empty field still uses auto-calculated inventory pricing logic.

### Phase 8 - Modal Layering and Clipping Hardening
- Status: Completed
- Date: 2026-02-16
- Summary:
  - Updated shared inventory modal frame to be scroll-safe and raised modal layering above sticky header.
  - Loss modal no longer clips under navbar on constrained viewport heights.
  - Removed transform-based page-shell animation offset so fixed modals anchor to viewport instead of local content containers.
  - Portaled modal overlays to `document.body` (inventory, transaction, confirm) to fully decouple modal positioning from page-shell/layout ancestors.
- Files changed:
  - /Users/kelvin/Sources/Floristeria Morales/flowershop-admin-panel/web/src/components/modals/inventory/InventoryFormModal.tsx
  - /Users/kelvin/Sources/Floristeria Morales/flowershop-admin-panel/web/src/pages/Financial/components/TransactionModal/TransactionModal.tsx
  - /Users/kelvin/Sources/Floristeria Morales/flowershop-admin-panel/web/src/components/modals/ConfirmActionModal.tsx
  - /Users/kelvin/Sources/Floristeria Morales/flowershop-admin-panel/web/src/index.css
  - /Users/kelvin/Sources/Floristeria Morales/flowershop-admin-panel/docs/plans/INVENTORY_MODAL_COMPOSITION_PHASES.md
- Validation:
  - `web npm run lint`: pass (warnings only)
  - `web npm run build`: pass
- Risks / Follow-ups:
  - Other legacy modals not using this shared frame may still need the same layering pattern.
