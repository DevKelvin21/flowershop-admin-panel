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

export interface Transaction {
  id: string;
  type: TransactionType;
  totalAmount: number;
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

export interface CreateTransactionDto {
  type: TransactionType;
  customerName?: string;
  notes?: string;
  items: {
    inventoryId: string;
    quantity: number;
  }[];
}

export interface UpdateTransactionDto {
  customerName?: string;
  notes?: string;
  messageSent?: boolean;
}

export interface TransactionSummary {
  totalSales: number;
  totalExpenses: number;
  profit: number;
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
