import { TransactionAddForm } from './TransactionAddForm';
import { TransactionDetailView } from './TransactionDetailView';
import { TransactionEditForm } from './TransactionEditForm';
import { useTransactionModal } from './useTransactionModal';

export function TransactionModalBody() {
  const { state } = useTransactionModal();

  if (state.mode.type === 'add') {
    return <TransactionAddForm />;
  }

  if (state.mode.type === 'view' && state.selectedTransaction) {
    return <TransactionDetailView transaction={state.selectedTransaction} />;
  }

  if (state.mode.type === 'edit' && state.selectedTransaction) {
    return <TransactionEditForm transaction={state.selectedTransaction} />;
  }

  return null;
}
