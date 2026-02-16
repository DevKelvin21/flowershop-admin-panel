import { Button } from '@/components/ui/button';
import type { ModalMode } from './types';
import { useTransactionModal } from './useTransactionModal';

function getModalTitle(mode: ModalMode) {
  if (mode.type === 'add') {
    return mode.transactionType === 'SALE' ? 'Nueva Venta' : 'Nuevo Gasto';
  }
  if (mode.type === 'view') return 'Detalle de Transacción';
  if (mode.type === 'edit') return 'Editar Transacción';
  return '';
}

export function TransactionModalHeader() {
  const { state, actions } = useTransactionModal();

  return (
    <div className="mb-4 flex items-center justify-between">
      <h3 className="text-lg font-semibold">{getModalTitle(state.mode)}</h3>
      <Button variant="ghost" size="sm" onClick={actions.close}>
        Cerrar
      </Button>
    </div>
  );
}
