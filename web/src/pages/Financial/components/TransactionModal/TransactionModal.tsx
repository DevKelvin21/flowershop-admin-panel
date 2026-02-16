import type { ReactNode } from 'react';
import { TransactionModalBody } from './TransactionModalBody';
import { TransactionModalFooter } from './TransactionModalFooter';
import { TransactionModalHeader } from './TransactionModalHeader';
import { useTransactionModal } from './useTransactionModal';

interface TransactionModalFrameProps {
  children: ReactNode;
}

function TransactionModalFrame({ children }: TransactionModalFrameProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg border border-border bg-card p-6">
        {children}
      </div>
    </div>
  );
}

function TransactionModalRoot() {
  const { state } = useTransactionModal();

  if (!state.isOpen) return null;

  return (
    <TransactionModalFrame>
      <TransactionModalHeader />
      <TransactionModalBody />
      <TransactionModalFooter />
    </TransactionModalFrame>
  );
}

export const TransactionModal = Object.assign(TransactionModalRoot, {
  Frame: TransactionModalFrame,
  Header: TransactionModalHeader,
  Body: TransactionModalBody,
  Footer: TransactionModalFooter,
});
