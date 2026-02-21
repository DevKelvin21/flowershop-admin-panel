import { useEffect, useRef, useState } from 'react';
import type { PaymentMethod, ParseTransactionResponse, TransactionType } from '@/lib/api/types';

export interface TransactionDraft {
  type: TransactionType;
  paymentMethod: PaymentMethod;
  salesAgent: string;
  customerName: string;
  notes: string;
  manualTotalAmount: string;
  items: { inventoryId: string; quantity: number }[];
}

interface UseAiTransactionOptions {
  defaultSalesAgent?: string;
}

function createEmptyDraft(
  type: TransactionType,
  defaultSalesAgent: string,
): TransactionDraft {
  return {
    type,
    paymentMethod: 'CASH',
    salesAgent: defaultSalesAgent,
    customerName: '',
    notes: '',
    manualTotalAmount: '',
    items: [],
  };
}

const DRAFT_STORAGE_KEY = 'financial:transaction-draft:v1';
const DRAFT_MAX_AGE_MS = 24 * 60 * 60 * 1000;

interface PersistedDraftState {
  version: 1;
  savedAt: number;
  draft: TransactionDraft;
}

function isDraftEmpty(
  draft: TransactionDraft,
  defaultSalesAgent: string,
): boolean {
  return (
    draft.salesAgent.trim() === defaultSalesAgent &&
    draft.customerName.trim() === '' &&
    draft.notes.trim() === '' &&
    draft.manualTotalAmount.trim() === '' &&
    draft.items.length === 0
  );
}

function hasWindow(): boolean {
  return typeof window !== 'undefined';
}

function loadPersistedDraft(
  initialType: TransactionType,
  defaultSalesAgent: string,
): TransactionDraft | null {
  if (!hasWindow()) return null;

  try {
    const raw = window.localStorage.getItem(DRAFT_STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as PersistedDraftState;
    if (
      parsed.version !== 1 ||
      typeof parsed.savedAt !== 'number' ||
      Date.now() - parsed.savedAt > DRAFT_MAX_AGE_MS
    ) {
      window.localStorage.removeItem(DRAFT_STORAGE_KEY);
      return null;
    }

    const draft = parsed.draft;
    if (!draft || !Array.isArray(draft.items)) {
      window.localStorage.removeItem(DRAFT_STORAGE_KEY);
      return null;
    }

    return {
      type: draft.type || initialType,
      paymentMethod: draft.paymentMethod || 'CASH',
      salesAgent: draft.salesAgent || defaultSalesAgent,
      customerName: draft.customerName || '',
      notes: draft.notes || '',
      manualTotalAmount:
        typeof draft.manualTotalAmount === 'string'
          ? draft.manualTotalAmount
          : '',
      items: draft.items
        .filter((item) => item && typeof item.inventoryId === 'string')
        .map((item) => ({
          inventoryId: item.inventoryId,
          quantity: Number.isFinite(item.quantity) && item.quantity > 0 ? item.quantity : 1,
        })),
    };
  } catch {
    window.localStorage.removeItem(DRAFT_STORAGE_KEY);
    return null;
  }
}

export function useAiTransaction(
  initialType: TransactionType,
  options: UseAiTransactionOptions = {},
) {
  const defaultSalesAgent = options.defaultSalesAgent?.trim() ?? '';
  const [aiResult, setAiResult] = useState<ParseTransactionResponse | null>(null);
  const [draft, setDraft] = useState<TransactionDraft>(
    createEmptyDraft(initialType, defaultSalesAgent),
  );
  const [hydrated, setHydrated] = useState(false);
  const initialTypeRef = useRef(initialType);
  const initialDefaultSalesAgentRef = useRef(defaultSalesAgent);

  useEffect(() => {
    const persisted = loadPersistedDraft(
      initialTypeRef.current,
      initialDefaultSalesAgentRef.current,
    );
    if (persisted) {
      setDraft(persisted);
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated || !hasWindow()) return;

    if (isDraftEmpty(draft, defaultSalesAgent) && !aiResult) {
      window.localStorage.removeItem(DRAFT_STORAGE_KEY);
      return;
    }

    const payload: PersistedDraftState = {
      version: 1,
      savedAt: Date.now(),
      draft,
    };
    window.localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(payload));
  }, [hydrated, draft, aiResult, defaultSalesAgent]);

  useEffect(() => {
    if (!hydrated || draft.salesAgent.trim().length > 0 || aiResult) return;

    setDraft((prev) => ({
      ...prev,
      salesAgent: defaultSalesAgent,
    }));
  }, [hydrated, draft.salesAgent, aiResult, defaultSalesAgent]);

  const resetDraft = (nextType?: TransactionType) => {
    setDraft(createEmptyDraft(nextType ?? initialType, defaultSalesAgent));
    setAiResult(null);
  };

  const applyAiResult = (result: ParseTransactionResponse) => {
    setAiResult(result);
    setDraft({
      type: result.type,
      paymentMethod: result.paymentMethod ?? 'CASH',
      salesAgent: result.salesAgent || defaultSalesAgent,
      customerName: '',
      notes: result.notes || '',
      manualTotalAmount: String(result.totalAmount || ''),
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
