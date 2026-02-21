// Inventory Types
export interface Inventory {
  id: string;
  item: string;
  quality: string;
  quantity: number;
  unitPrice: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface InventoryLoss {
  id: string;
  inventoryId: string;
  quantity: number;
  reason: string;
  notes?: string;
  recordedBy: string;
  recordedAt: string;
  inventory?: Pick<Inventory, 'item' | 'quality'>;
}

export interface CreateInventoryDto {
  item: string;
  quality: string;
  quantity: number;
  unitPrice: number;
}

export interface UpdateInventoryDto {
  item?: string;
  quality?: string;
  quantity?: number;
  unitPrice?: number;
  isActive?: boolean;
}

export interface AddLossDto {
  quantity: number;
  reason: string;
  notes?: string;
}

// Transaction Types
export type TransactionType = 'SALE' | 'EXPENSE';
export type PaymentMethod = 'CASH' | 'BANK_TRANSFER';

export interface Transaction {
  id: string;
  type: TransactionType;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  salesAgent?: string;
  customerName?: string;
  notes?: string;
  messageSent: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  items?: TransactionItem[];
}

export interface TransactionItem {
  id: string;
  transactionId: string;
  inventoryId: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  inventory?: Pick<Inventory, 'item' | 'quality'>;
}

export interface AiMetadata {
  userPrompt: string;
  aiResponse: string;
  confidence: number;
  processingTime: number;
}

export interface CreateTransactionDto {
  type: TransactionType;
  paymentMethod?: PaymentMethod;
  salesAgent?: string;
  customerName?: string;
  notes?: string;
  totalAmount?: number;
  items?: {
    inventoryId: string;
    quantity: number;
  }[];
  aiMetadata?: AiMetadata;
}

export interface UpdateTransactionDto {
  paymentMethod?: PaymentMethod;
  salesAgent?: string;
  customerName?: string;
  notes?: string;
  messageSent?: boolean;
}

export interface TransactionSummary {
  totalSales: number;
  totalExpenses: number;
  profit: number;
  salesCount: number;
  expensesCount: number;
  transactionCount: number;
}

export interface TransactionAnalytics {
  salesByDay: { date: string; total: number }[];
  topItems: { item: string; quantity: number; revenue: number }[];
}

// Paginated Response
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

// Query Parameters
export interface InventoryQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  quality?: string;
  isActive?: boolean;
}

export interface TransactionQueryParams {
  page?: number;
  limit?: number;
  type?: TransactionType;
  startDate?: string;
  endDate?: string;
}

export interface AuditQueryParams {
  page?: number;
  limit?: number;
  userId?: string;
  action?: string;
  entityType?: string;
}

// Audit Types
export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  entityType: string;
  entityId?: string;
  changes?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  timestamp: string;
}

// AI Types
export interface ParsedItem {
  inventoryId: string;
  itemName: string;
  quality: string;
  quantity: number;
  unitPrice: number;
  availableQuantity: number;
}

export interface ParseTransactionRequest {
  prompt: string;
  language?: 'es' | 'en';
}

export interface ParseTransactionResponse {
  type: TransactionType;
  salesAgent?: string;
  paymentMethod: PaymentMethod;
  notes?: string;
  items: ParsedItem[];
  totalAmount: number;
  confidence: number;
  suggestions?: string[];
  processingTimeMs: number;
  originalPrompt: string;
  rawAiResponse: string;
}
