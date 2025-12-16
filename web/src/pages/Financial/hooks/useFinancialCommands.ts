import { toast } from 'sonner';
import {
  useCreateTransaction,
  useUpdateTransaction,
  useDeleteTransaction,
} from '@/hooks/queries/transactions';
import type { CreateTransactionDto, Transaction } from '@/lib/api/types';

interface FinancialCommandCallbacks {
  onCreateSuccess?: () => void;
  onDeleteSuccess?: () => void;
}

export function useFinancialCommands(callbacks: FinancialCommandCallbacks = {}) {
  const createMutation = useCreateTransaction();
  const updateMutation = useUpdateTransaction();
  const deleteMutation = useDeleteTransaction();

  const createTransaction = async (dto: CreateTransactionDto) => {
    try {
      await createMutation.mutateAsync(dto);
      toast.success(dto.type === 'SALE' ? 'Venta registrada' : 'Gasto registrado');
      callbacks.onCreateSuccess?.();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al guardar transaccion';
      toast.error(message);
      throw error;
    }
  };

  const deleteTransaction = async (transaction: Transaction | null) => {
    if (!transaction) return;
    try {
      await deleteMutation.mutateAsync(transaction.id);
      toast.success('Transaccion eliminada');
      callbacks.onDeleteSuccess?.();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al eliminar transaccion';
      toast.error(message);
      throw error;
    }
  };

  const toggleMessageSent = async (transaction: Transaction) => {
    try {
      await updateMutation.mutateAsync({
        id: transaction.id,
        data: { messageSent: !transaction.messageSent },
      });
      toast.success(transaction.messageSent ? 'Mensaje desmarcado' : 'Mensaje marcado como enviado');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al actualizar';
      toast.error(message);
      throw error;
    }
  };

  return {
    createTransaction,
    deleteTransaction,
    toggleMessageSent,
    isCreating: createMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isUpdating: updateMutation.isPending,
  };
}
