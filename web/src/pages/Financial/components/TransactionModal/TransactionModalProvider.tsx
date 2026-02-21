import { useState, type ReactNode } from 'react';
import { toast } from 'sonner';
import type {
  CreateTransactionDto,
  Transaction,
  TransactionType,
} from '@/lib/api/types';
import { useAiTransaction } from '../../hooks/useAiTransaction';
import { useFinancialCommands } from '../../hooks/useFinancialCommands';
import { TransactionModalContext } from './TransactionModalContext';
import type {
  InventoryOption,
  ModalMode,
  TransactionModalContextValue,
} from './types';

interface TransactionModalProviderProps {
  children: ReactNode;
  defaultType: TransactionType;
  inventoryOptions: InventoryOption[];
  defaultSalesAgent: string;
}

export function TransactionModalProvider({
  children,
  defaultType,
  inventoryOptions,
  defaultSalesAgent,
}: TransactionModalProviderProps) {
  const [mode, setMode] = useState<ModalMode>({ type: 'closed' });
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [transactionToDelete, setTransactionToDelete] =
    useState<Transaction | null>(null);

  const ai = useAiTransaction(defaultType, { defaultSalesAgent });
  const commands = useFinancialCommands();

  const selectedTransaction =
    mode.type === 'view' || mode.type === 'edit' ? mode.transaction : null;

  const close = () => {
    setMode({ type: 'closed' });
    ai.resetDraft(defaultType);
  };

  const openAdd = (type: TransactionType) => {
    ai.resetDraft(type);
    setMode({ type: 'add', transactionType: type });
  };

  const openView = (transaction: Transaction) => {
    setMode({ type: 'view', transaction });
  };

  const openEdit = (transaction: Transaction) => {
    setMode({ type: 'edit', transaction });
  };

  const submit = async () => {
    if (ai.draft.items.length === 0) {
      toast.error('Debe agregar al menos un articulo');
      return;
    }

    const normalizedTotal = ai.draft.manualTotalAmount.trim();
    let manualTotalAmount: number | undefined;

    if (normalizedTotal.length > 0) {
      const parsedTotal = Number(normalizedTotal);
      if (!Number.isFinite(parsedTotal) || parsedTotal < 0) {
        toast.error('El total manual debe ser un numero mayor o igual a 0');
        return;
      }
      manualTotalAmount = parsedTotal;
    }

    const dto: CreateTransactionDto = {
      type: ai.draft.type,
      paymentMethod: ai.draft.paymentMethod,
      salesAgent: ai.draft.salesAgent || undefined,
      customerName: ai.draft.customerName || undefined,
      notes: ai.draft.notes || undefined,
      totalAmount: manualTotalAmount,
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
    close();
  };

  const requestDelete = (transaction: Transaction) => {
    setTransactionToDelete(transaction);
    setConfirmDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (!transactionToDelete) return;

    const deletingId = transactionToDelete.id;
    await commands.deleteTransaction(transactionToDelete);

    setConfirmDeleteOpen(false);
    setTransactionToDelete(null);

    if (
      (mode.type === 'view' || mode.type === 'edit') &&
      mode.transaction.id === deletingId
    ) {
      close();
    }
  };

  const cancelDelete = () => {
    setConfirmDeleteOpen(false);
    setTransactionToDelete(null);
  };

  const value: TransactionModalContextValue = {
    state: {
      mode,
      isOpen: mode.type !== 'closed',
      draft: ai.draft,
      aiResult: ai.aiResult,
      inventoryOptions,
      selectedTransaction,
      confirmDeleteOpen,
      transactionToDelete,
      isSubmitting: commands.isCreating,
      isDeleting: commands.isDeleting,
    },
    actions: {
      openAdd,
      openView,
      openEdit,
      close,
      updateDraft: ai.updateDraft,
      resetDraft: ai.resetDraft,
      applyAiResult: ai.applyAiResult,
      acceptAiResult: ai.acceptAiResult,
      rejectAiResult: ai.rejectAiResult,
      submit,
      requestDelete,
      confirmDelete,
      cancelDelete,
    },
    meta: {
      defaultType,
    },
  };

  return (
    <TransactionModalContext.Provider value={value}>
      {children}
    </TransactionModalContext.Provider>
  );
}
