import { useQuery, useMutation, useQueryClient, queryOptions } from '@tanstack/react-query';
import { transactionsApi } from '@/lib/api';
import type {
  Transaction,
  CreateTransactionDto,
  UpdateTransactionDto,
  TransactionQueryParams,
  PaginatedResponse,
} from '@/lib/api/types';

// Query Keys
export const transactionKeys = {
  all: ['transactions'] as const,
  lists: () => [...transactionKeys.all, 'list'] as const,
  list: (params?: TransactionQueryParams) => [...transactionKeys.lists(), params] as const,
  details: () => [...transactionKeys.all, 'detail'] as const,
  detail: (id: string) => [...transactionKeys.details(), id] as const,
  summary: (params?: { startDate?: string; endDate?: string }) =>
    [...transactionKeys.all, 'summary', params] as const,
  analytics: (period: string) => [...transactionKeys.all, 'analytics', period] as const,
};

// Query Options
export const transactionListOptions = (params?: TransactionQueryParams) =>
  queryOptions({
    queryKey: transactionKeys.list(params),
    queryFn: () => transactionsApi.list(params),
    staleTime: 2 * 60 * 1000, // 2 minutes (transactions change more frequently)
  });

export const transactionDetailOptions = (id: string) =>
  queryOptions({
    queryKey: transactionKeys.detail(id),
    queryFn: () => transactionsApi.get(id),
    staleTime: 5 * 60 * 1000,
    enabled: !!id,
  });

export const transactionSummaryOptions = (params?: { startDate?: string; endDate?: string }) =>
  queryOptions({
    queryKey: transactionKeys.summary(params),
    queryFn: () => transactionsApi.getSummary(params),
    staleTime: 2 * 60 * 1000,
  });

export const transactionAnalyticsOptions = (period: 'week' | 'month' | 'year' = 'month') =>
  queryOptions({
    queryKey: transactionKeys.analytics(period),
    queryFn: () => transactionsApi.getAnalytics(period),
    staleTime: 5 * 60 * 1000,
  });

// Hooks
export function useTransactionList(params?: TransactionQueryParams) {
  return useQuery(transactionListOptions(params));
}

export function useTransactionDetail(id: string) {
  return useQuery(transactionDetailOptions(id));
}

export function useTransactionSummary(params?: { startDate?: string; endDate?: string }) {
  return useQuery(transactionSummaryOptions(params));
}

export function useTransactionAnalytics(period: 'week' | 'month' | 'year' = 'month') {
  return useQuery(transactionAnalyticsOptions(period));
}

// Mutations
export function useCreateTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTransactionDto) => transactionsApi.create(data),
    onSuccess: () => {
      // Invalidate transactions and inventory (transactions affect inventory)
      queryClient.invalidateQueries({ queryKey: transactionKeys.lists() });
      queryClient.invalidateQueries({ queryKey: transactionKeys.summary() });
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
    },
  });
}

export function useUpdateTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTransactionDto }) =>
      transactionsApi.update(id, data),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: transactionKeys.lists() });
      const previousLists = queryClient.getQueriesData({ queryKey: transactionKeys.lists() });

      // Optimistic update
      queryClient.setQueriesData<PaginatedResponse<Transaction>>(
        { queryKey: transactionKeys.lists() },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            data: old.data.map((item) =>
              item.id === id ? { ...item, ...data } : item
            ),
          };
        }
      );

      return { previousLists };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousLists) {
        context.previousLists.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: transactionKeys.lists() });
    },
  });
}

export function useDeleteTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => transactionsApi.delete(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: transactionKeys.lists() });
      const previousLists = queryClient.getQueriesData({ queryKey: transactionKeys.lists() });

      // Optimistic remove
      queryClient.setQueriesData<PaginatedResponse<Transaction>>(
        { queryKey: transactionKeys.lists() },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            data: old.data.filter((item) => item.id !== id),
            total: old.total - 1,
          };
        }
      );

      return { previousLists };
    },
    onError: (_err, _id, context) => {
      if (context?.previousLists) {
        context.previousLists.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: transactionKeys.lists() });
      queryClient.invalidateQueries({ queryKey: transactionKeys.summary() });
      queryClient.invalidateQueries({ queryKey: ['inventory'] }); // Transaction delete reverses inventory
    },
  });
}
