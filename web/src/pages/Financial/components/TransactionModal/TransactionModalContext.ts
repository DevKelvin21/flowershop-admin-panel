import { createContext } from 'react';
import type { TransactionModalContextValue } from './types';

export const TransactionModalContext =
  createContext<TransactionModalContextValue | null>(null);
