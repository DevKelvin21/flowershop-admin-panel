import { useState, useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useModal } from '@/hooks/useModal';
import { authService } from '@/services';
import { FinancialView } from './FinancialView';
import { useFinancialData } from './hooks/useFinancialData';
import { useFinancialFilters } from './hooks/useFinancialFilters';
import { useFinancialCommands } from './hooks/useFinancialCommands';
import { useAiTransaction } from './hooks/useAiTransaction';
import type { TransactionType, CreateTransactionDto } from '@/lib/api/types';

export function FinancialContainer() {
  useAuth(authService);
  const [activeTab, setActiveTab] = useState<'sales' | 'expenses' | 'summary'>('sales');

  // Filters & Pagination
  const {
    dateFilter,
    setDateFilter,
    queryParams,
    pagination,
    onPageChange,
    onPageSizeChange,
    resetPagination,
  } = useFinancialFilters(activeTab);

  // Data
  const { transactions, summary, inventoryOptions, paginationInfo, isLoading, error } =
    useFinancialData(queryParams);

  // Commands
  const confirmModal = useModal();
  const addModal = useModal();
  const [selectedTransactionId, setSelectedTransactionId] = useState<string | null>(null);

  const commands = useFinancialCommands({
    onCreateSuccess: () => {
      addModal.close();
      ai.resetDraft(activeTab === 'sales' ? 'SALE' : 'EXPENSE');
    },
    onDeleteSuccess: () => {
      confirmModal.close();
      setSelectedTransactionId(null);
    },
  });

  // AI + draft management
  const ai = useAiTransaction(activeTab === 'sales' ? 'SALE' : 'EXPENSE');

  const selectedTransaction = useMemo(
    () => transactions.find((t) => t.id === selectedTransactionId) ?? null,
    [transactions, selectedTransactionId]
  );

  const handleOpenModal = () => {
    ai.resetDraft(activeTab === 'sales' ? 'SALE' : 'EXPENSE');
    addModal.open();
  };

  const handleTabChange = (tab: 'sales' | 'expenses' | 'summary') => {
    setActiveTab(tab);
    ai.resetDraft(tab === 'sales' ? 'SALE' : 'EXPENSE');
    resetPagination(); // Reset pagination when switching tabs
  };

  const handleSubmit = async () => {
    if (ai.draft.items.length === 0) {
      throw new Error('Debe agregar al menos un articulo');
    }

    const dto: CreateTransactionDto = {
      type: ai.draft.type,
      paymentMethod: ai.draft.paymentMethod,
      salesAgent: ai.draft.salesAgent || undefined,
      customerName: ai.draft.customerName || undefined,
      notes: ai.draft.notes || undefined,
      items: ai.draft.items,
      aiMetadata: ai.aiResult
        ? {
          userPrompt: ai.aiResult.originalPrompt,
          aiResponse: ai.aiResult.rawAiResponse,
          confidence: ai.aiResult.confidence,
          processingTime: ai.aiResult.processingTimeMs,
        }
        : undefined,
    };

    await commands.createTransaction(dto);
  };

  if (isLoading) return null;
  if (error) throw error;

  return (
    <FinancialView
      tabs={{
        activeTab,
        onTabChange: handleTabChange,
      }}
      filters={{
        date: dateFilter,
        onDateChange: setDateFilter,
      }}
      transactions={transactions}
      pagination={{
        pageIndex: pagination.pageIndex,
        pageSize: pagination.pageSize,
        pageCount: paginationInfo.pageCount,
        total: paginationInfo.total,
        onPageChange,
        onPageSizeChange,
      }}
      summary={{
        totalSales: new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(summary?.totalSales || 0),
        totalExpenses: new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(summary?.totalExpenses || 0),
        profit: new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(summary?.profit || 0),
        transactionCount: summary?.transactionCount || 0,
      }}
      inventoryOptions={inventoryOptions}
      ui={{
        confirmDeleteOpen: confirmModal.isOpen,
        selectedTransaction,
        onDeleteConfirm: () => commands.deleteTransaction(selectedTransaction),
        onDeleteCancel: () => {
          confirmModal.close();
          setSelectedTransactionId(null);
        },
      }}
      modal={{
        isOpen: addModal.isOpen,
        onOpen: handleOpenModal,
        onClose: () => {
          addModal.close();
          ai.resetDraft(activeTab === 'sales' ? 'SALE' : 'EXPENSE');
        },
      }}
      tableHandlers={{
        onDelete: (t) => {
          setSelectedTransactionId(t.id);
          confirmModal.open();
        },
        // TODO: Implement transaction detail view modal
        // onRowClick: (t) => { openDetailModal(t) },
      }}
      transactionForm={{
        draft: ai.draft,
        aiResult: ai.aiResult,
        isSubmitting: commands.isCreating,
        onSubmit: handleSubmit,
        onUpdateDraft: ai.updateDraft,
        onChangeType: (type: TransactionType) => ai.updateDraft((prev) => ({ ...prev, type })),
        onAiParseSuccess: ai.applyAiResult,
        onAiParseError: (error) => {
          const message = error instanceof Error ? error.message : 'Error al procesar con IA';
          console.error(message);
        },
        onAiAccept: ai.acceptAiResult,
        onAiReject: ai.rejectAiResult,
      }}
    />
  );
}
