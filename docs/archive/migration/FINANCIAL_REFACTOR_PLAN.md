# Financial Route Refactor Plan

Goal: Align the financial route with the established Container/View + hook composition pattern and TanStack Router best practices. Keep route files thin, move logic into hooks and containers, and reuse presentational components.

## Current Issues
- `src/routes/_authenticated/financial.tsx` is a god component (500+ lines) mixing routing, data fetching, mutations, AI parsing, modal UI, and tables.
- Existing `pages/Financial` views are unused; presentation and logic are duplicated.
- No dedicated hooks for filters/commands/AI; hard to test and extend.

## Target Structure
- Route: `src/routes/_authenticated/financial.tsx` renders `<FinancialContainer />` and optional loader for prefetch.
- Container: `src/pages/Financial/FinancialContainer.tsx` orchestrates hooks + modal/tab state.
- View: `src/pages/Financial/FinancialView.tsx` (presentational, grouped props).
- Hooks:
  - `src/pages/Financial/hooks/useFinancialData.ts` (queries + derived sales/expenses, loading/error aggregation).
  - `src/pages/Financial/hooks/useFinancialFilters.ts` (type/date filters, filtered lists).
  - `src/pages/Financial/hooks/useFinancialCommands.ts` (create/update/delete, toggle message, toasts).
  - `src/pages/Financial/hooks/useAiTransaction.ts` (AI parse/accept/reject + draft state).
- Components:
  - `src/pages/Financial/components/TransactionTable.tsx`
  - `src/pages/Financial/components/SummaryCards.tsx`
  - `src/pages/Financial/components/TransactionModal.tsx` (controlled modal using inventory options and draft state)
- Cleanup: deprecate old `SalesView/ExpensesView/SummaryView` or rehome into `components/` if still useful.

## Steps
1) Create hooks (`useFinancialData`, `useFinancialFilters`, `useFinancialCommands`, `useAiTransaction`).
2) Build `FinancialContainer` that wires hooks, modal state, and passes organized props.
3) Build `FinancialView` + child components (`TransactionTable`, `SummaryCards`, `TransactionModal`) with grouped props.
4) Thin route file to just render the container (and add loader if desired).
5) Remove or archive unused legacy views; update exports as needed.
6) Run `npm run build` to validate.
