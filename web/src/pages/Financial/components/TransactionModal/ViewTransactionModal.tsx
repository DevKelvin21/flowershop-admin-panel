import { TransactionModal } from './TransactionModal';
import { useTransactionModal } from './useTransactionModal';

export function ViewTransactionModal() {
  const { state } = useTransactionModal();

  if (state.mode.type !== 'view') return null;

  return (
    <TransactionModal.Frame>
      <TransactionModal.Header />
      <TransactionModal.Body />
      <TransactionModal.Footer />
    </TransactionModal.Frame>
  );
}
