import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Filters } from '@/components/Filters';
import { ConfirmActionModal } from '@/components/modals/ConfirmActionModal';
import { TransactionTable } from './components/TransactionTable';
import { SummaryCards } from './components/SummaryCards';
import { TransactionModal } from './components/TransactionModal';
import type { Transaction, TransactionType, ParseTransactionResponse } from '@/lib/api/types';
import type { TransactionDraft } from './hooks/useAiTransaction';
import type { PaginationConfig } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';

interface FinancialViewProps {
  tabs: {
    activeTab: 'sales' | 'expenses' | 'summary';
    onTabChange: (tab: 'sales' | 'expenses' | 'summary') => void;
  };
  filters: {
    date: { from: string; to: string };
    onDateChange: (next: { from?: string; to?: string }) => void;
  };
  transactions: Transaction[];
  pagination: PaginationConfig;
  summary: {
    totalSales: string;
    totalExpenses: string;
    profit: string;
    transactionCount: number;
  };
  inventoryOptions: { id: string; item: string; quality: string; quantity: number }[];
  ui: {
    confirmDeleteOpen: boolean;
    selectedTransaction: Transaction | null;
    onDeleteConfirm: () => void;
    onDeleteCancel: () => void;
  };
  modal: {
    isOpen: boolean;
    onOpen: () => void;
    onClose: () => void;
  };
  tableHandlers: {
    onDelete: (t: Transaction) => void;
    onRowClick?: (t: Transaction) => void;
  };
  transactionForm: {
    draft: TransactionDraft;
    aiResult: ParseTransactionResponse | null;
    isSubmitting: boolean;
    onSubmit: () => void;
    onUpdateDraft: (updater: (prev: TransactionDraft) => TransactionDraft) => void;
    onChangeType: (type: TransactionType) => void;
    onAiParseSuccess: (result: ParseTransactionResponse) => void;
    onAiParseError: (error: unknown) => void;
    onAiAccept: () => void;
    onAiReject: () => void;
  };
}

export function FinancialView({
  tabs,
  filters,
  transactions,
  pagination,
  summary,
  inventoryOptions,
  ui,
  modal,
  tableHandlers,
  transactionForm,
}: FinancialViewProps) {
  return (
    <div>
      <Tabs value={tabs.activeTab} onValueChange={(v) => tabs.onTabChange(v as 'sales' | 'expenses' | 'summary')}>
        <div className="flex justify-between items-center mb-4">
          <TabsList>
            <TabsTrigger value="sales">Ventas</TabsTrigger>
            <TabsTrigger value="expenses">Gastos</TabsTrigger>
            <TabsTrigger value="summary">Resumen</TabsTrigger>
          </TabsList>
          {tabs.activeTab !== 'summary' && (
            <Button
              className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
              onClick={modal.onOpen}
            >
              {tabs.activeTab === 'sales' ? 'Nueva Venta' : 'Nuevo Gasto'}
            </Button>
          )}
        </div>

        <Filters
          dateRange={{
            value: { from: filters.date.from, to: filters.date.to },
            onChange: (next) => filters.onDateChange({ from: next.from || '', to: next.to || '' }),
            fromPlaceholder: 'Desde',
            toPlaceholder: 'Hasta',
          }}
        />

        <TabsContent value="sales">
          <TransactionTable
            transactions={transactions}
            pagination={pagination}
            onDelete={tableHandlers.onDelete}
            onRowClick={tableHandlers.onRowClick}
            formatCurrency={(amount) =>
              new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(amount)
            }
          />
        </TabsContent>

        <TabsContent value="expenses">
          <TransactionTable
            transactions={transactions}
            pagination={pagination}
            onDelete={tableHandlers.onDelete}
            onRowClick={tableHandlers.onRowClick}
            formatCurrency={(amount) =>
              new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(amount)
            }
          />
        </TabsContent>

        <TabsContent value="summary">
          <SummaryCards
            cards={[
              { title: 'Total Ventas', value: summary.totalSales, color: 'text-green-600' },
              { title: 'Total Gastos', value: summary.totalExpenses, color: 'text-red-600' },
              {
                title: 'Ganancia Neta',
                value: summary.profit,
                color: summary.profit.startsWith('-') ? 'text-red-600' : 'text-green-600',
              },
            ]}
          />
          <div className="mt-4 text-center text-muted-foreground">
            Total de transacciones: {summary.transactionCount || 0}
          </div>
        </TabsContent>
      </Tabs>

      <TransactionModal
        open={modal.isOpen}
        draft={transactionForm.draft}
        aiResult={transactionForm.aiResult}
        inventoryOptions={inventoryOptions}
        isSubmitting={transactionForm.isSubmitting}
        onClose={modal.onClose}
        onSubmit={transactionForm.onSubmit}
        onAiParseSuccess={transactionForm.onAiParseSuccess}
        onAiParseError={transactionForm.onAiParseError}
        onAiAccept={transactionForm.onAiAccept}
        onAiReject={transactionForm.onAiReject}
        onUpdateDraft={transactionForm.onUpdateDraft}
        onChangeType={transactionForm.onChangeType}
      />

      <ConfirmActionModal
        open={ui.confirmDeleteOpen}
        title="Confirmar eliminación"
        message="¿Estás seguro de que deseas eliminar esta transacción? Esta acción revertirá los cambios en el inventario."
        item={ui.selectedTransaction}
        onCancel={ui.onDeleteCancel}
        onConfirm={ui.onDeleteConfirm}
        confirmLabel="Eliminar"
        cancelLabel="Cancelar"
      />
    </div>
  );
}
