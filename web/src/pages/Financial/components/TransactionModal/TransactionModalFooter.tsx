import { Button } from '@/components/ui/button';
import { useTransactionModal } from './useTransactionModal';

export function TransactionModalFooter() {
  const { state, actions } = useTransactionModal();

  if (state.mode.type === 'add') {
    return (
      <div className="mt-6 flex justify-end gap-2">
        <Button variant="outline" onClick={actions.close}>
          Cancelar
        </Button>
        <Button onClick={() => void actions.submit()} disabled={state.isSubmitting}>
          {state.isSubmitting ? 'Guardando...' : 'Guardar'}
        </Button>
      </div>
    );
  }

  if (state.mode.type === 'view' && state.selectedTransaction) {
    const transaction = state.selectedTransaction;

    return (
      <div className="mt-6 flex justify-end gap-2">
        <Button
          variant="destructive"
          onClick={() => actions.requestDelete(transaction)}
          disabled={state.isDeleting}
        >
          {state.isDeleting ? 'Eliminando...' : 'Eliminar'}
        </Button>
        <Button variant="outline" onClick={() => actions.openEdit(transaction)}>
          Editar
        </Button>
        <Button onClick={actions.close}>Cerrar</Button>
      </div>
    );
  }

  if (state.mode.type === 'edit') {
    return (
      <div className="mt-6 flex justify-end gap-2">
        <Button variant="outline" onClick={actions.close}>
          Cerrar
        </Button>
      </div>
    );
  }

  return null;
}
