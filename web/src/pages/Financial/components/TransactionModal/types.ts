import type {
  ParseTransactionResponse,
  Transaction,
  TransactionType,
} from '@/lib/api/types';
import type { TransactionDraft } from '../../hooks/useAiTransaction';

export interface InventoryOption {
  id: string;
  item: string;
  quality: string;
  quantity: number;
}

export type ModalMode =
  | { type: 'closed' }
  | { type: 'add'; transactionType: TransactionType }
  | { type: 'view'; transaction: Transaction }
  | { type: 'edit'; transaction: Transaction };

export interface TransactionModalState {
  mode: ModalMode;
  isOpen: boolean;
  draft: TransactionDraft;
  aiResult: ParseTransactionResponse | null;
  inventoryOptions: InventoryOption[];
  selectedTransaction: Transaction | null;
  confirmDeleteOpen: boolean;
  transactionToDelete: Transaction | null;
  isSubmitting: boolean;
  isDeleting: boolean;
}

export interface TransactionModalActions {
  openAdd: (type: TransactionType) => void;
  openView: (transaction: Transaction) => void;
  openEdit: (transaction: Transaction) => void;
  close: () => void;
  updateDraft: (
    updater: (prev: TransactionDraft) => TransactionDraft,
  ) => void;
  resetDraft: (nextType?: TransactionType) => void;
  applyAiResult: (result: ParseTransactionResponse) => void;
  acceptAiResult: () => void;
  rejectAiResult: () => void;
  submit: () => Promise<void>;
  requestDelete: (transaction: Transaction) => void;
  confirmDelete: () => Promise<void>;
  cancelDelete: () => void;
}

export interface TransactionModalMeta {
  defaultType: TransactionType;
}

export interface TransactionModalContextValue {
  state: TransactionModalState;
  actions: TransactionModalActions;
  meta: TransactionModalMeta;
}
