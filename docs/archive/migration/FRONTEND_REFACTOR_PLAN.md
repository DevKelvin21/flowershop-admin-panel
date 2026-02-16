# Frontend Inventory/API Refactor Plan

Goal: stabilize the inventory flows on the new NestJS API with TanStack Router/Query. Focus areas: repository/data layer alignment and the add/remove modals for inventory items and losses.

## Recommendation
- **Refactor the existing files instead of a rewrite.** The TanStack Router/Query scaffolding, API client, and views are already in place; we mainly need to swap the remaining Firebase-era data layer, align DTOs, and fix the modals. A rewrite would duplicate effort without added value.

## Objectives
- Single source of truth for inventory data via the NestJS API (no Firebase repositories).
- Modals collect the fields the API expects (e.g., `unitPrice`, `reason`) and operate on stable identifiers.
- Confirm modals trigger the correct mutations (including loss deletion once supported) with proper optimistic updates/error handling.

## Plan
1) **Consolidate types and DTO mapping**
   - Replace legacy `shared/models/inventory` shapes with the API contract types (`Inventory`, `InventoryLoss`, DTOs) or add explicit mappers.
   - Remove/rename legacy helpers that assume Firestore IDs (`item_quality` composites).
2) **Replace Firebase repositories with HTTP**
   - Add HTTP repository implementations that wrap `inventoryApi` calls; update `factory.ts` and `services/registry.ts` to instantiate HTTP versions.
   - Delete or archive the unused Firebase implementations and legacy hooks (`useInventory`, legacy `useInventoryCommands`) to avoid dual data sources.
3) **Inventory add/edit modal alignment**
   - Extend `AddInventoryModal` to capture `unitPrice` and validate required fields; use quality options from API data instead of constants.
   - Ensure mutations pass full `Create/UpdateInventoryDto` and surface errors/loading states in the modal UI.
4) **Loss modal and mutation fixes**
   - Change loss modal inputs to choose an inventory item by ID (select from fetched inventory) and capture `reason/notes`.
   - Update `addLoss` to use inventory ID directly (no name/quality matching). If a loss delete endpoint is needed, add it to the backend and wire a delete mutation; otherwise disable/delete actions in UI.
5) **Confirm modal integration**
   - Route confirm actions to the correct mutation (inventory delete/edit, loss delete when available), disable buttons while pending, and show server errors.
   - Add optimistic updates or targeted invalidations for inventory/loss query keys.
6) **Testing & verification**
   - Add minimal Vitest/RTL coverage for the command hooks and modals (submit payloads map to DTOs, error paths surface).
   - Manual QA: add inventory with price, record loss, attempt delete (inventory and loss), verify lists refresh and API rejects invalid input.
7) **Cleanup**
   - Remove dead Firebase code, constants no longer used, and update docs/AGENTS if interfaces change.

## Open Decisions / Risks
- Backend currently lacks a loss delete endpoint; decide whether to implement it or disable the UI action.
- Ensure Firebase auth tokens are available in `apiClient` for all mutations; handle unauthenticated state gracefully in modals.
