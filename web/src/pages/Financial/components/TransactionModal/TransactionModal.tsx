import type { ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { TransactionModalBody } from './TransactionModalBody';
import { TransactionModalFooter } from './TransactionModalFooter';
import { TransactionModalHeader } from './TransactionModalHeader';
import { useTransactionModal } from './useTransactionModal';

interface TransactionModalFrameProps {
  children: ReactNode;
}

function TransactionModalFrame({ children }: TransactionModalFrameProps) {
  if (typeof document === 'undefined') return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/55 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-border/70 bg-card p-6 shadow-xl">
        {children}
      </div>
    </div>,
    document.body,
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
