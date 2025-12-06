import { createFileRoute } from '@tanstack/react-router';
import { useState, useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useModal } from '@/hooks/useModal';
import { authService } from '@/services';
import {
  useTransactionList,
  useTransactionSummary,
  useCreateTransaction,
  useUpdateTransaction,
  useDeleteTransaction,
} from '@/hooks/queries/transactions';
import { useInventoryList } from '@/hooks/queries/inventory';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Filters } from '@/components/Filters';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { ErrorMessage } from '@/components/ErrorMessage';
import { ConfirmActionModal } from '@/components/modals/ConfirmActionModal';
import type { Transaction, TransactionType, CreateTransactionDto } from '@/lib/api/types';
import { Badge } from '@/components/ui/badge';

export const Route = createFileRoute('/_authenticated/financial')({
  component: FinancialRoute,
});

function FinancialRoute() {
  useAuth(authService); // Ensures auth context is available
  const [activeTab, setActiveTab] = useState<'sales' | 'expenses' | 'summary'>('sales');

  // Filters
  const [typeFilter] = useState<TransactionType | 'all'>('all');
  const [dateFilter, setDateFilter] = useState<{ from: string; to: string }>({ from: '', to: '' });

  // Queries
  const queryParams = useMemo(() => {
    const params: { type?: TransactionType; startDate?: string; endDate?: string } = {};
    if (typeFilter !== 'all') params.type = typeFilter;
    if (dateFilter.from) params.startDate = dateFilter.from;
    if (dateFilter.to) params.endDate = dateFilter.to;
    return params;
  }, [typeFilter, dateFilter]);

  const { data: transactionsData, isLoading: transactionsLoading, error: transactionsError } = useTransactionList(queryParams);
  const { data: summaryData, isLoading: summaryLoading, error: summaryError } = useTransactionSummary({
    startDate: dateFilter.from || undefined,
    endDate: dateFilter.to || undefined,
  });
  const { data: inventoryData } = useInventoryList();

  // Mutations
  const createMutation = useCreateTransaction();
  const updateMutation = useUpdateTransaction();
  const deleteMutation = useDeleteTransaction();

  // Modals
  const addModal = useModal();
  const confirmModal = useModal();

  // UI State
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [newTransaction, setNewTransaction] = useState<{
    type: TransactionType;
    customerName: string;
    notes: string;
    items: { inventoryId: string; quantity: number }[];
  }>({
    type: 'SALE',
    customerName: '',
    notes: '',
    items: [],
  });

  // Filtered transactions
  const sales = useMemo(
    () => transactionsData?.data.filter((t) => t.type === 'SALE') || [],
    [transactionsData]
  );

  const expenses = useMemo(
    () => transactionsData?.data.filter((t) => t.type === 'EXPENSE') || [],
    [transactionsData]
  );

  // Handlers
  const handleCreateTransaction = async () => {
    if (newTransaction.items.length === 0) {
      alert('Debe agregar al menos un artículo');
      return;
    }

    const dto: CreateTransactionDto = {
      type: newTransaction.type,
      customerName: newTransaction.customerName || undefined,
      notes: newTransaction.notes || undefined,
      items: newTransaction.items,
    };

    await createMutation.mutateAsync(dto);
    addModal.close();
    setNewTransaction({
      type: 'SALE',
      customerName: '',
      notes: '',
      items: [],
    });
  };

  const handleDeleteTransaction = async () => {
    if (selectedTransaction) {
      await deleteMutation.mutateAsync(selectedTransaction.id);
      confirmModal.close();
      setSelectedTransaction(null);
    }
  };

  const handleToggleMessageSent = async (transaction: Transaction) => {
    await updateMutation.mutateAsync({
      id: transaction.id,
      data: { messageSent: !transaction.messageSent },
    });
  };

  const isLoading = transactionsLoading || summaryLoading;
  const error = transactionsError || summaryError;

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error instanceof Error ? error.message : 'Error loading data'} />;

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(amount);

  return (
    <div>
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'sales' | 'expenses' | 'summary')}>
        <div className="flex justify-between items-center mb-4">
          <TabsList>
            <TabsTrigger value="sales">Ventas</TabsTrigger>
            <TabsTrigger value="expenses">Gastos</TabsTrigger>
            <TabsTrigger value="summary">Resumen</TabsTrigger>
          </TabsList>
          {activeTab !== 'summary' && (
            <button
              className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
              onClick={() => {
                setNewTransaction((prev) => ({
                  ...prev,
                  type: activeTab === 'sales' ? 'SALE' : 'EXPENSE',
                }));
                addModal.open();
              }}
            >
              {activeTab === 'sales' ? 'Nueva Venta' : 'Nuevo Gasto'}
            </button>
          )}
        </div>

        <Filters
          dateRange={{
            value: { from: dateFilter.from, to: dateFilter.to },
            onChange: (next) => setDateFilter({ from: next.from || '', to: next.to || '' }),
            fromPlaceholder: 'Desde',
            toPlaceholder: 'Hasta',
          }}
        />

        <TabsContent value="sales">
          <TransactionTable
            transactions={sales}
            onDelete={(t) => {
              setSelectedTransaction(t);
              confirmModal.open();
            }}
            onToggleMessage={handleToggleMessageSent}
            formatCurrency={formatCurrency}
          />
        </TabsContent>

        <TabsContent value="expenses">
          <TransactionTable
            transactions={expenses}
            onDelete={(t) => {
              setSelectedTransaction(t);
              confirmModal.open();
            }}
            onToggleMessage={handleToggleMessageSent}
            formatCurrency={formatCurrency}
          />
        </TabsContent>

        <TabsContent value="summary">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <SummaryCard
              title="Total Ventas"
              value={formatCurrency(summaryData?.totalSales || 0)}
              color="text-green-600"
            />
            <SummaryCard
              title="Total Gastos"
              value={formatCurrency(summaryData?.totalExpenses || 0)}
              color="text-red-600"
            />
            <SummaryCard
              title="Ganancia Neta"
              value={formatCurrency(summaryData?.profit || 0)}
              color={
                (summaryData?.profit || 0) >= 0 ? 'text-green-600' : 'text-red-600'
              }
            />
          </div>
          <div className="mt-4 text-center text-muted-foreground">
            Total de transacciones: {summaryData?.transactionCount || 0}
          </div>
        </TabsContent>
      </Tabs>

      {/* Add Transaction Modal */}
      {addModal.isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card rounded-lg p-6 w-full max-w-md border border-border">
            <h3 className="text-lg font-semibold mb-4">
              {newTransaction.type === 'SALE' ? 'Nueva Venta' : 'Nuevo Gasto'}
            </h3>

            <div className="space-y-4">
              {newTransaction.type === 'SALE' && (
                <div>
                  <label className="block text-sm font-medium mb-1">Nombre del Cliente</label>
                  <input
                    type="text"
                    className="w-full border border-border rounded px-3 py-2 bg-background"
                    value={newTransaction.customerName}
                    onChange={(e) =>
                      setNewTransaction((prev) => ({ ...prev, customerName: e.target.value }))
                    }
                    placeholder="Nombre del cliente"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-1">Notas</label>
                <textarea
                  className="w-full border border-border rounded px-3 py-2 bg-background"
                  value={newTransaction.notes}
                  onChange={(e) =>
                    setNewTransaction((prev) => ({ ...prev, notes: e.target.value }))
                  }
                  placeholder="Notas adicionales"
                  rows={2}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Artículos</label>
                {newTransaction.items.map((item, idx) => (
                  <div key={idx} className="flex gap-2 mb-2">
                    <select
                      className="flex-1 border border-border rounded px-3 py-2 bg-background"
                      value={item.inventoryId}
                      onChange={(e) => {
                        const newItems = [...newTransaction.items];
                        newItems[idx].inventoryId = e.target.value;
                        setNewTransaction((prev) => ({ ...prev, items: newItems }));
                      }}
                    >
                      <option value="">Seleccionar artículo</option>
                      {inventoryData?.data.map((inv) => (
                        <option key={inv.id} value={inv.id}>
                          {inv.item} ({inv.quality}) - {inv.quantity} disponibles
                        </option>
                      ))}
                    </select>
                    <input
                      type="number"
                      className="w-20 border border-border rounded px-3 py-2 bg-background"
                      value={item.quantity}
                      onChange={(e) => {
                        const newItems = [...newTransaction.items];
                        newItems[idx].quantity = parseInt(e.target.value) || 0;
                        setNewTransaction((prev) => ({ ...prev, items: newItems }));
                      }}
                      min={1}
                      placeholder="Cant."
                    />
                    <button
                      type="button"
                      className="px-2 text-destructive hover:text-destructive/80"
                      onClick={() => {
                        const newItems = newTransaction.items.filter((_, i) => i !== idx);
                        setNewTransaction((prev) => ({ ...prev, items: newItems }));
                      }}
                    >
                      ×
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  className="text-sm text-primary hover:underline"
                  onClick={() =>
                    setNewTransaction((prev) => ({
                      ...prev,
                      items: [...prev.items, { inventoryId: '', quantity: 1 }],
                    }))
                  }
                >
                  + Agregar artículo
                </button>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button
                className="px-4 py-2 border border-border rounded hover:bg-muted"
                onClick={() => {
                  addModal.close();
                  setNewTransaction({
                    type: 'SALE',
                    customerName: '',
                    notes: '',
                    items: [],
                  });
                }}
              >
                Cancelar
              </button>
              <button
                className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
                onClick={handleCreateTransaction}
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Delete Modal */}
      <ConfirmActionModal
        open={confirmModal.isOpen}
        title="Confirmar eliminación"
        message="¿Estás seguro de que deseas eliminar esta transacción? Esta acción revertirá los cambios en el inventario."
        item={selectedTransaction}
        onCancel={() => {
          confirmModal.close();
          setSelectedTransaction(null);
        }}
        onConfirm={handleDeleteTransaction}
        confirmLabel="Eliminar"
        cancelLabel="Cancelar"
      />
    </div>
  );
}

// Sub-components
interface TransactionTableProps {
  transactions: Transaction[];
  onDelete: (t: Transaction) => void;
  onToggleMessage: (t: Transaction) => void;
  formatCurrency: (amount: number) => string;
}

function TransactionTable({ transactions, onDelete, onToggleMessage, formatCurrency }: TransactionTableProps) {
  if (transactions.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No hay transacciones para mostrar
      </div>
    );
  }

  return (
    <table className="min-w-full border border-border rounded-lg overflow-hidden bg-card text-card-foreground">
      <thead className="bg-muted">
        <tr>
          <th className="px-4 py-2 text-left font-semibold text-primary">ID</th>
          <th className="px-4 py-2 text-left font-semibold text-primary">Cliente/Notas</th>
          <th className="px-4 py-2 text-left font-semibold text-primary">Total</th>
          <th className="px-4 py-2 text-left font-semibold text-primary">Mensaje</th>
          <th className="px-4 py-2 text-left font-semibold text-primary">Fecha</th>
          <th className="px-4 py-2 text-left font-semibold text-primary">Acciones</th>
        </tr>
      </thead>
      <tbody>
        {transactions.map((transaction) => (
          <tr key={transaction.id} className="even:bg-muted/50">
            <td className="px-4 py-2 font-mono text-sm">{transaction.id.slice(0, 8)}...</td>
            <td className="px-4 py-2">{transaction.customerName || transaction.notes || '-'}</td>
            <td className="px-4 py-2 font-semibold">{formatCurrency(transaction.totalAmount)}</td>
            <td className="px-4 py-2">
              <button onClick={() => onToggleMessage(transaction)}>
                <Badge variant={transaction.messageSent ? 'default' : 'secondary'}>
                  {transaction.messageSent ? 'Sí' : 'No'}
                </Badge>
              </button>
            </td>
            <td className="px-4 py-2">{new Date(transaction.createdAt).toLocaleDateString()}</td>
            <td className="px-4 py-2">
              <button
                className="bg-destructive hover:bg-destructive/90 text-destructive-foreground px-3 py-1 rounded"
                onClick={() => onDelete(transaction)}
              >
                Eliminar
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

interface SummaryCardProps {
  title: string;
  value: string;
  color: string;
}

function SummaryCard({ title, value, color }: SummaryCardProps) {
  return (
    <div className="bg-card border border-border rounded-lg p-6 text-center">
      <h3 className="text-sm text-muted-foreground mb-2">{title}</h3>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
    </div>
  );
}
