import { TransactionModal } from './TransactionModal';
import { useTransactionModal } from './useTransactionModal';

export function AddTransactionModal() {
  const { state } = useTransactionModal();

  if (state.mode.type !== 'add') return null;

  return (
    <TransactionModal.Frame>
      <TransactionModal.Header />
      <TransactionModal.Body />
      <TransactionModal.Footer />
    </TransactionModal.Frame>
  );
}
