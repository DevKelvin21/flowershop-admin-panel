import { useState } from 'react';
import type { PaymentMethod, ParseTransactionResponse, TransactionType } from '@/lib/api/types';

export interface TransactionDraft {
  type: TransactionType;
  paymentMethod: PaymentMethod;
  salesAgent: string;
  customerName: string;
  notes: string;
  items: { inventoryId: string; quantity: number }[];
}

const emptyDraft: TransactionDraft = {
  type: 'SALE',
  paymentMethod: 'CASH',
  salesAgent: '',
  customerName: '',
  notes: '',
  items: [],
};

export function useAiTransaction(initialType: TransactionType) {
  const [aiResult, setAiResult] = useState<ParseTransactionResponse | null>(null);
  const [draft, setDraft] = useState<TransactionDraft>({ ...emptyDraft, type: initialType });

  const resetDraft = (nextType?: TransactionType) => {
    setDraft({ ...emptyDraft, type: nextType ?? initialType });
    setAiResult(null);
  };

  const applyAiResult = (result: ParseTransactionResponse) => {
    setAiResult(result);
    setDraft({
      type: result.type,
      paymentMethod: result.paymentMethod ?? 'CASH',
      salesAgent: result.salesAgent || '',
      customerName: '',
      notes: result.notes || '',
      items: result.items.map((item) => ({
        inventoryId: item.inventoryId,
        quantity: item.quantity,
      })),
    });
  };

  const acceptAiResult = () => setAiResult(null);
  const rejectAiResult = () => resetDraft(draft.type);

  const updateDraft = (updater: (prev: TransactionDraft) => TransactionDraft) =>
    setDraft((prev) => updater(prev));

  return {
    aiResult,
    draft,
    setDraft,
    resetDraft,
    applyAiResult,
    acceptAiResult,
    rejectAiResult,
    updateDraft,
  };
}
