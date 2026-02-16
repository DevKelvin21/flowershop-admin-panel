import { useQuery, useMutation, useQueryClient, queryOptions } from '@tanstack/react-query';
import { transactionsApi } from '@/lib/api';
import type {
  Transaction,
  CreateTransactionDto,
  UpdateTransactionDto,
  TransactionQueryParams,
  PaginatedResponse,
} from '@/lib/api/types';
import { inventoryKeys } from './inventory';
import { normalizeQueryParams } from './query-key-utils';

const TRANSACTION_LIST_STALE_TIME_MS = 60 * 1000;
const TRANSACTION_DETAIL_STALE_TIME_MS = 3 * 60 * 1000;
const TRANSACTION_SUMMARY_STALE_TIME_MS = 60 * 1000;
const TRANSACTION_ANALYTICS_STALE_TIME_MS = 10 * 60 * 1000;

// Query Keys
export const transactionKeys = {
  all: ['transactions'] as const,
  lists: () => [...transactionKeys.all, 'list'] as const,
  list: (params?: TransactionQueryParams) =>
    [...transactionKeys.lists(), normalizeQueryParams(params)] as const,
  details: () => [...transactionKeys.all, 'detail'] as const,
  detail: (id: string) => [...transactionKeys.details(), id] as const,
  summaries: () => [...transactionKeys.all, 'summary'] as const,
  summary: (params?: { startDate?: string; endDate?: string }) =>
    [...transactionKeys.summaries(), normalizeQueryParams(params)] as const,
  analyticsList: () => [...transactionKeys.all, 'analytics'] as const,
  analytics: (period: string) => [...transactionKeys.analyticsList(), period] as const,
};

// Query Options
export const transactionListOptions = (
  params?: TransactionQueryParams,
) =>
  queryOptions({
    queryKey: transactionKeys.list(params),
    queryFn: () => transactionsApi.list(params),
    staleTime: TRANSACTION_LIST_STALE_TIME_MS,
  });

export const transactionDetailOptions = (id: string) =>
  queryOptions({
    queryKey: transactionKeys.detail(id),
    queryFn: () => transactionsApi.get(id),
    staleTime: TRANSACTION_DETAIL_STALE_TIME_MS,
    enabled: !!id,
  });

export const transactionSummaryOptions = (
  params?: { startDate?: string; endDate?: string },
) =>
  queryOptions({
    queryKey: transactionKeys.summary(params),
    queryFn: () => transactionsApi.getSummary(params),
    staleTime: TRANSACTION_SUMMARY_STALE_TIME_MS,
  });

export const transactionAnalyticsOptions = (
  period: 'week' | 'month' | 'year' = 'month',
) =>
  queryOptions({
    queryKey: transactionKeys.analytics(period),
    queryFn: () => transactionsApi.getAnalytics(period),
    staleTime: TRANSACTION_ANALYTICS_STALE_TIME_MS,
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
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: transactionKeys.lists() }),
        queryClient.invalidateQueries({ queryKey: transactionKeys.summaries() }),
        queryClient.invalidateQueries({
          queryKey: transactionKeys.analyticsList(),
        }),
        queryClient.invalidateQueries({ queryKey: inventoryKeys.lists() }),
        queryClient.invalidateQueries({ queryKey: inventoryKeys.details() }),
      ]);
    },
  });
}

export function useUpdateTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTransactionDto }) =>
      transactionsApi.update(id, data),
    onMutate: async ({ id, data }) => {
      await Promise.all([
        queryClient.cancelQueries({ queryKey: transactionKeys.lists() }),
        queryClient.cancelQueries({ queryKey: transactionKeys.detail(id) }),
      ]);
      const previousLists = queryClient.getQueriesData<
        PaginatedResponse<Transaction>
      >({
        queryKey: transactionKeys.lists(),
      });
      const previousDetail = queryClient.getQueryData<Transaction>(
        transactionKeys.detail(id),
      );

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
        },
      );

      queryClient.setQueryData<Transaction>(transactionKeys.detail(id), (old) => {
        if (!old) return old;
        return {
          ...old,
          ...data,
        };
      });

      return { previousLists, previousDetail };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousLists) {
        context.previousLists.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      if (context?.previousDetail) {
        queryClient.setQueryData(
          transactionKeys.detail(_variables.id),
          context.previousDetail,
        );
      }
    },
    onSettled: async (_data, _error, { id }) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: transactionKeys.lists() }),
        queryClient.invalidateQueries({ queryKey: transactionKeys.detail(id) }),
      ]);
    },
  });
}

export function useDeleteTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => transactionsApi.delete(id),
    onMutate: async (id) => {
      await Promise.all([
        queryClient.cancelQueries({ queryKey: transactionKeys.lists() }),
        queryClient.cancelQueries({ queryKey: transactionKeys.detail(id) }),
      ]);
      const previousLists = queryClient.getQueriesData<
        PaginatedResponse<Transaction>
      >({
        queryKey: transactionKeys.lists(),
      });
      const previousDetail = queryClient.getQueryData<Transaction>(
        transactionKeys.detail(id),
      );

      // Optimistic remove
      queryClient.setQueriesData<PaginatedResponse<Transaction>>(
        { queryKey: transactionKeys.lists() },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            data: old.data.filter((item) => item.id !== id),
            total: Math.max(0, old.total - 1),
          };
        },
      );

      queryClient.removeQueries({
        queryKey: transactionKeys.detail(id),
        exact: true,
      });

      return { previousLists, previousDetail };
    },
    onError: (_err, id, context) => {
      if (context?.previousLists) {
        context.previousLists.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      if (context?.previousDetail) {
        queryClient.setQueryData(
          transactionKeys.detail(id),
          context.previousDetail,
        );
      }
    },
    onSettled: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: transactionKeys.lists() }),
        queryClient.invalidateQueries({ queryKey: transactionKeys.summaries() }),
        queryClient.invalidateQueries({
          queryKey: transactionKeys.analyticsList(),
        }),
        queryClient.invalidateQueries({ queryKey: inventoryKeys.lists() }),
        queryClient.invalidateQueries({ queryKey: inventoryKeys.details() }),
      ]);
    },
  });
}
