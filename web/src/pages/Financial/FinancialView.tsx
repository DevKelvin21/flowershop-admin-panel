import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Filters } from '@/components/Filters';
import { ConfirmActionModal } from '@/components/modals/ConfirmActionModal';
import { Button } from '@/components/ui/button';
import type { PaginationConfig } from '@/components/ui/data-table';
import type { Transaction } from '@/lib/api/types';
import {
  AddTransactionModal,
  EditTransactionModal,
  useTransactionModal,
  ViewTransactionModal,
} from './components/TransactionModal';
import { SummaryCards } from './components/SummaryCards';
import { TransactionTable } from './components/TransactionTable';

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
}

export function FinancialView({
  tabs,
  filters,
  transactions,
  pagination,
  summary,
}: FinancialViewProps) {
  const { state: modalState, actions: modalActions } = useTransactionModal();

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
              onClick={() =>
                modalActions.openAdd(
                  tabs.activeTab === 'sales' ? 'SALE' : 'EXPENSE',
                )
              }
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
            onDelete={modalActions.requestDelete}
            formatCurrency={(amount) =>
              new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(amount)
            }
          />
        </TabsContent>

        <TabsContent value="expenses">
          <TransactionTable
            transactions={transactions}
            pagination={pagination}
            onDelete={modalActions.requestDelete}
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

      <AddTransactionModal />
      <ViewTransactionModal />
      <EditTransactionModal />

      <ConfirmActionModal
        open={modalState.confirmDeleteOpen}
        title="Confirmar eliminación"
        message="¿Estás seguro de que deseas eliminar esta transacción? Esta acción revertirá los cambios en el inventario."
        item={modalState.transactionToDelete}
        onCancel={modalActions.cancelDelete}
        onConfirm={() => void modalActions.confirmDelete()}
        confirmLabel="Eliminar"
        cancelLabel="Cancelar"
      />
    </div>
  );
}
