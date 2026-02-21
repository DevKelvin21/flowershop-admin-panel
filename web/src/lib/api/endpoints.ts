import { apiClient } from './client';
import type {
  Inventory,
  InventoryLoss,
  CreateInventoryDto,
  UpdateInventoryDto,
  AddLossDto,
  Transaction,
  CreateTransactionDto,
  UpdateTransactionDto,
  TransactionSummary,
  TransactionAnalytics,
  PaginatedResponse,
  InventoryQueryParams,
  TransactionQueryParams,
  AuditLog,
  AuditQueryParams,
  AppUser,
  UsersQueryParams,
  UserRole,
  ParseTransactionRequest,
  ParseTransactionResponse,
} from './types';

interface RawTransactionAnalytics {
  salesByDay: Array<{ date: string; total?: number; amount?: number }>;
  topItems: Array<{ item: string; quantity: number; revenue: number }>;
}

function buildQueryString(params: Record<string, string | number | boolean | undefined | null>): string {
  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, String(value));
    }
  }
  const query = searchParams.toString();
  return query ? `?${query}` : '';
}

// Inventory API
export const inventoryApi = {
  list: (params?: InventoryQueryParams) =>
    apiClient.get<PaginatedResponse<Inventory>>(`/inventory${buildQueryString(params as Record<string, string | number | boolean | undefined | null> || {})}`),

  get: (id: string) =>
    apiClient.get<Inventory & { recentLosses?: InventoryLoss[] }>(`/inventory/${id}`),

  create: (data: CreateInventoryDto) =>
    apiClient.post<Inventory>('/inventory', data),

  update: (id: string, data: UpdateInventoryDto) =>
    apiClient.put<Inventory>(`/inventory/${id}`, data),

  archive: (id: string) =>
    apiClient.patch<Inventory>(`/inventory/${id}/archive`),

  delete: (id: string) =>
    apiClient.delete<{ success: boolean }>(`/inventory/${id}`),

  getLosses: (id: string) =>
    apiClient.get<InventoryLoss[]>(`/inventory/${id}/losses`),

  addLoss: (id: string, data: AddLossDto) =>
    apiClient.post<InventoryLoss>(`/inventory/${id}/loss`, data),

  getHistory: (params?: { page?: number; limit?: number }) =>
    apiClient.get<PaginatedResponse<InventoryLoss>>(`/inventory/history${buildQueryString(params || {})}`),
};

// Transactions API
export const transactionsApi = {
  list: (params?: TransactionQueryParams) =>
    apiClient.get<PaginatedResponse<Transaction>>(`/transactions${buildQueryString(params as Record<string, string | number | boolean | undefined | null> || {})}`),

  get: (id: string) =>
    apiClient.get<Transaction>(`/transactions/${id}`),

  create: (data: CreateTransactionDto) =>
    apiClient.post<Transaction>('/transactions', data),

  update: (id: string, data: UpdateTransactionDto) =>
    apiClient.put<Transaction>(`/transactions/${id}`, data),

  delete: (id: string) =>
    apiClient.delete<{ success: boolean }>(`/transactions/${id}`),

  getSummary: (params?: { startDate?: string; endDate?: string }) =>
    apiClient.get<TransactionSummary>(`/transactions/summary${buildQueryString(params || {})}`),

  getAnalytics: (period: 'week' | 'month' | 'year' = 'month') =>
    apiClient
      .get<RawTransactionAnalytics>(`/transactions/analytics?period=${period}`)
      .then((response) => ({
        ...response,
        salesByDay: response.salesByDay.map((item) => ({
          date: item.date,
          total: item.total ?? item.amount ?? 0,
        })),
      }) as TransactionAnalytics),
};

// Health check
export const healthApi = {
  check: () => apiClient.get<{ status: string; timestamp: string }>('/health'),
};

// AI API
export const aiApi = {
  parseTransaction: (data: ParseTransactionRequest) =>
    apiClient.post<ParseTransactionResponse>('/ai/parse-transaction', data),
};

// Audit API
export const auditApi = {
  list: (params?: AuditQueryParams) =>
    apiClient.get<PaginatedResponse<AuditLog>>(
      `/audit${buildQueryString(
        (params as Record<
          string,
          string | number | boolean | undefined | null
        >) || {},
      )}`,
    ),
};

// Users API
export const usersApi = {
  me: () => apiClient.get<AppUser>('/users/me'),

  list: (params?: UsersQueryParams) =>
    apiClient.get<PaginatedResponse<AppUser>>(
      `/users${buildQueryString(
        (params as Record<
          string,
          string | number | boolean | undefined | null
        >) || {},
      )}`,
    ),

  updateRole: (id: string, role: UserRole) =>
    apiClient.patch<AppUser>(`/users/${id}/role`, { role }),
};
