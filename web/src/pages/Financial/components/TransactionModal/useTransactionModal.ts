import { useContext } from 'react';
import { TransactionModalContext } from './TransactionModalContext';

export function useTransactionModal() {
  const context = useContext(TransactionModalContext);

  if (!context) {
    throw new Error(
      'useTransactionModal must be used within TransactionModalProvider',
    );
  }

  return context;
}
