# Transaction Modal Refactor Plan

## Overview

Refactor the Financial module's modal system using **component composition** and **Context API** to support Add, View (detail), and Edit modes with shared state.

## Goals

1. Reduce prop drilling (current TransactionModal has 14+ props)
2. Enable easy row click → detail view
3. Share state between Add/View/Edit modes
4. Follow existing patterns (ThemeProvider context)

## Decisions

- **Delete action:** Keep in both table AND detail view (more accessible)
- **Edit mode:** Infrastructure only for now; implement View mode first

---

## File Structure

```
web/src/pages/Financial/
├── FinancialContainer.tsx              # Wraps with TransactionModalProvider
├── FinancialView.tsx                   # Simplified props (no modal props)
├── components/
│   ├── TransactionModal/
│   │   ├── index.ts                    # Barrel export
│   │   ├── TransactionModalProvider.tsx # Context + state
│   │   ├── TransactionModal.tsx        # Modal shell
│   │   ├── TransactionModalHeader.tsx  # Dynamic title + close
│   │   ├── TransactionModalBody.tsx    # Routes to Add/View/Edit
│   │   ├── TransactionModalFooter.tsx  # Dynamic actions
│   │   ├── TransactionAddForm.tsx      # Add mode (existing logic)
│   │   ├── TransactionDetailView.tsx   # View mode (NEW)
│   │   └── TransactionEditForm.tsx     # Edit mode (future)
│   └── TransactionTable.tsx            # Uses context for row click
```

---

## Context Interface

```typescript
// Modal mode discriminated union
type ModalMode =
  | { type: 'closed' }
  | { type: 'add'; transactionType: TransactionType }
  | { type: 'view'; transaction: Transaction }
  | { type: 'edit'; transaction: Transaction };

interface TransactionModalContextValue {
  // State
  mode: ModalMode;
  isOpen: boolean;
  draft: TransactionDraft;
  aiResult: ParseTransactionResponse | null;
  inventoryOptions: InventoryOption[];
  selectedTransaction: Transaction | null;
  isSubmitting: boolean;

  // Actions
  openAdd: (type: TransactionType) => void;
  openView: (transaction: Transaction) => void;
  openEdit: (transaction: Transaction) => void;
  close: () => void;
  updateDraft: (updater) => void;
  resetDraft: (type?) => void;
  applyAiResult: (result) => void;
  acceptAiResult: () => void;
  rejectAiResult: () => void;
  submit: () => Promise<void>;
  deleteTransaction: () => Promise<void>;
}
```

---

## Implementation Phases

### Phase 1: Create Context Infrastructure

**Create new files:**
- `TransactionModal/TransactionModalProvider.tsx` - Context + provider
- `TransactionModal/index.ts` - Barrel export

**Key implementation:**
- Follow ThemeProvider pattern
- Integrate existing `useAiTransaction` hook
- Integrate existing `useFinancialCommands` hook
- Export `useTransactionModal()` consumer hook

### Phase 2: Create Composable Components

**Create new files:**
- `TransactionModal/TransactionModal.tsx` - Shell (renders if open)
- `TransactionModal/TransactionModalHeader.tsx` - Title per mode
- `TransactionModal/TransactionModalBody.tsx` - Switches Add/View/Edit
- `TransactionModal/TransactionModalFooter.tsx` - Actions per mode
- `TransactionModal/TransactionDetailView.tsx` - Read-only view (NEW)
- `TransactionModal/TransactionAddForm.tsx` - Move existing form logic

### Phase 3: Integrate with Container

**Modify existing files:**
- `FinancialContainer.tsx`:
  - Wrap `FinancialView` with `TransactionModalProvider`
  - Remove modal-related state management
  - Render `<TransactionModal />` inside provider

- `FinancialView.tsx`:
  - Remove `modal`, `transactionForm` prop groups
  - Use `useTransactionModal()` for button clicks
  - Keep `onDelete` in tableHandlers (delete in both places)
  - Simplified props interface

- `TransactionTable.tsx`:
  - Use `useTransactionModal().openView` for row click
  - Keep delete action in table (user preference)

### Phase 4: Cleanup

**Delete:**
- Old `TransactionModal.tsx` (after migration complete)

**Remove from interfaces:**
- `transactionForm` prop group
- `modal` prop group

---

## How Modes Work

### Add Mode
- **Trigger:** Click "Nueva Venta" / "Nuevo Gasto" button
- **Action:** `openAdd('SALE')` or `openAdd('EXPENSE')`
- **Shows:** AI input + form fields + items list
- **Footer:** Cancel + Save

### View Mode (NEW)
- **Trigger:** Click table row
- **Action:** `openView(transaction)`
- **Shows:** Read-only details (type, agent, items, total, notes, date)
- **Footer:** Delete + Close

### Edit Mode (Future - Infrastructure Only)
- **Trigger:** Edit button in View mode (not implemented yet)
- **Action:** `openEdit(transaction)` method exists in context
- **Implementation:** Deferred to future phase
- **Note:** Context interface ready, just needs `TransactionEditForm.tsx`

---

## TransactionDetailView Content

Shows:
- Type badge (Venta/Gasto)
- Date/time formatted
- Sales agent (if present)
- Customer name (if present)
- Payment method
- Total amount (highlighted)
- Items list with quantities and subtotals
- Notes (if present)

---

## Files Summary

### Files to Create

| File | Purpose |
|------|---------|
| `TransactionModal/TransactionModalProvider.tsx` | Context + state |
| `TransactionModal/TransactionModal.tsx` | Modal shell |
| `TransactionModal/TransactionModalHeader.tsx` | Dynamic header |
| `TransactionModal/TransactionModalBody.tsx` | Content router |
| `TransactionModal/TransactionModalFooter.tsx` | Dynamic footer |
| `TransactionModal/TransactionDetailView.tsx` | View mode content |
| `TransactionModal/TransactionAddForm.tsx` | Add mode form |
| `TransactionModal/index.ts` | Exports |

### Files to Modify

| File | Action |
|------|--------|
| `FinancialContainer.tsx` | Wrap with provider, simplify |
| `FinancialView.tsx` | Remove modal props, use context |
| `TransactionTable.tsx` | Use context for row click |

### Files to Delete

| File | Reason |
|------|--------|
| `components/TransactionModal.tsx` | Replaced by new structure |

---

## Benefits

1. **No prop drilling** - Modal state via `useTransactionModal()`
2. **Easy row click** - Just call `openView(transaction)`
3. **Type-safe modes** - Discriminated union ensures correct data
4. **Composable** - Each component has single responsibility
5. **Extensible** - Adding Edit mode follows same pattern
6. **Testable** - Context can be mocked
