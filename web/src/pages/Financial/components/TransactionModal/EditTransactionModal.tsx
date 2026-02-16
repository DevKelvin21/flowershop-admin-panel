import { TransactionModal } from './TransactionModal';
import { useTransactionModal } from './useTransactionModal';

export function EditTransactionModal() {
  const { state } = useTransactionModal();

  if (state.mode.type !== 'edit') return null;

  return (
    <TransactionModal.Frame>
      <TransactionModal.Header />
      <TransactionModal.Body />
      <TransactionModal.Footer />
    </TransactionModal.Frame>
  );
}
