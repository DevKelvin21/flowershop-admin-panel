import { useQuery, useMutation, useQueryClient, queryOptions } from '@tanstack/react-query';
import { inventoryApi } from '@/lib/api';
import type {
  Inventory,
  InventoryLoss,
  CreateInventoryDto,
  UpdateInventoryDto,
  AddLossDto,
  InventoryQueryParams,
  PaginatedResponse,
} from '@/lib/api/types';
import { normalizeQueryParams } from './query-key-utils';

const INVENTORY_LIST_STALE_TIME_MS = 3 * 60 * 1000;
const INVENTORY_DETAIL_STALE_TIME_MS = 3 * 60 * 1000;
const INVENTORY_LOSSES_STALE_TIME_MS = 2 * 60 * 1000;
const INVENTORY_HISTORY_STALE_TIME_MS = 2 * 60 * 1000;

// Query Keys
export const inventoryKeys = {
  all: ['inventory'] as const,
  lists: () => [...inventoryKeys.all, 'list'] as const,
  list: (params?: InventoryQueryParams) =>
    [...inventoryKeys.lists(), normalizeQueryParams(params)] as const,
  details: () => [...inventoryKeys.all, 'detail'] as const,
  detail: (id: string) => [...inventoryKeys.details(), id] as const,
  losses: (id: string) => [...inventoryKeys.detail(id), 'losses'] as const,
  histories: () => [...inventoryKeys.all, 'history'] as const,
  history: (params?: { page?: number; limit?: number }) =>
    [...inventoryKeys.histories(), normalizeQueryParams(params)] as const,
};

// Query Options
export const inventoryListOptions = (
  params?: InventoryQueryParams,
) =>
  queryOptions({
    queryKey: inventoryKeys.list(params),
    queryFn: () => inventoryApi.list(params),
    staleTime: INVENTORY_LIST_STALE_TIME_MS,
  });

export const inventoryDetailOptions = (id: string) =>
  queryOptions({
    queryKey: inventoryKeys.detail(id),
    queryFn: () => inventoryApi.get(id),
    staleTime: INVENTORY_DETAIL_STALE_TIME_MS,
    enabled: !!id,
  });

export const inventoryLossesOptions = (id: string) =>
  queryOptions({
    queryKey: inventoryKeys.losses(id),
    queryFn: () => inventoryApi.getLosses(id),
    staleTime: INVENTORY_LOSSES_STALE_TIME_MS,
    enabled: !!id,
  });

export const inventoryHistoryOptions = (
  params?: { page?: number; limit?: number },
) =>
  queryOptions({
    queryKey: inventoryKeys.history(params),
    queryFn: () => inventoryApi.getHistory(params),
    staleTime: INVENTORY_HISTORY_STALE_TIME_MS,
  });

// Hooks
export function useInventoryList(params?: InventoryQueryParams) {
  return useQuery(inventoryListOptions(params));
}

export function useInventoryDetail(id: string) {
  return useQuery(inventoryDetailOptions(id));
}

export function useInventoryLosses(id: string) {
  return useQuery(inventoryLossesOptions(id));
}

export function useInventoryHistory(params?: { page?: number; limit?: number }) {
  return useQuery(inventoryHistoryOptions(params));
}

// Mutations
export function useCreateInventory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateInventoryDto) => inventoryApi.create(data),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: inventoryKeys.lists() }),
        queryClient.invalidateQueries({ queryKey: inventoryKeys.histories() }),
      ]);
    },
  });
}

export function useUpdateInventory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateInventoryDto }) =>
      inventoryApi.update(id, data),
    onMutate: async ({ id, data }) => {
      await Promise.all([
        queryClient.cancelQueries({ queryKey: inventoryKeys.lists() }),
        queryClient.cancelQueries({ queryKey: inventoryKeys.detail(id) }),
      ]);
      const previousLists = queryClient.getQueriesData<
        PaginatedResponse<Inventory>
      >({
        queryKey: inventoryKeys.lists(),
      });
      const previousDetail = queryClient.getQueryData<
        Inventory & { recentLosses?: InventoryLoss[] }
      >(inventoryKeys.detail(id));

      // Optimistic update for list queries
      queryClient.setQueriesData<PaginatedResponse<Inventory>>(
        { queryKey: inventoryKeys.lists() },
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

      queryClient.setQueryData<Inventory & { recentLosses?: InventoryLoss[] }>(
        inventoryKeys.detail(id),
        (old) => {
          if (!old) return old;
          return {
            ...old,
            ...data,
          };
        },
      );

      return { previousLists, previousDetail };
    },
    onError: (_err, variables, context) => {
      if (context?.previousLists) {
        context.previousLists.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      if (context?.previousDetail) {
        queryClient.setQueryData(
          inventoryKeys.detail(variables.id),
          context.previousDetail,
        );
      }
    },
    onSettled: async (_data, _error, { id }) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: inventoryKeys.lists() }),
        queryClient.invalidateQueries({ queryKey: inventoryKeys.detail(id) }),
      ]);
    },
  });
}

export function useArchiveInventory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => inventoryApi.archive(id),
    onSuccess: async (_data, id) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: inventoryKeys.lists() }),
        queryClient.invalidateQueries({ queryKey: inventoryKeys.detail(id) }),
      ]);
    },
  });
}

export function useDeleteInventory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => inventoryApi.delete(id),
    onMutate: async (id) => {
      await Promise.all([
        queryClient.cancelQueries({ queryKey: inventoryKeys.lists() }),
        queryClient.cancelQueries({ queryKey: inventoryKeys.detail(id) }),
      ]);
      const previousLists = queryClient.getQueriesData<
        PaginatedResponse<Inventory>
      >({
        queryKey: inventoryKeys.lists(),
      });
      const previousDetail = queryClient.getQueryData<
        Inventory & { recentLosses?: InventoryLoss[] }
      >(inventoryKeys.detail(id));

      // Optimistic remove from lists
      queryClient.setQueriesData<PaginatedResponse<Inventory>>(
        { queryKey: inventoryKeys.lists() },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            data: old.data.filter((item) => item.id !== id),
            total: Math.max(0, old.total - 1),
          };
        },
      );

      queryClient.removeQueries({ queryKey: inventoryKeys.detail(id), exact: true });

      return { previousLists, previousDetail };
    },
    onError: (_err, id, context) => {
      if (context?.previousLists) {
        context.previousLists.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      if (context?.previousDetail) {
        queryClient.setQueryData(inventoryKeys.detail(id), context.previousDetail);
      }
    },
    onSettled: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: inventoryKeys.lists() }),
        queryClient.invalidateQueries({ queryKey: inventoryKeys.details() }),
      ]);
    },
  });
}

export function useAddInventoryLoss() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ inventoryId, data }: { inventoryId: string; data: AddLossDto }) =>
      inventoryApi.addLoss(inventoryId, data),
    onSuccess: (_data, { inventoryId }) => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: inventoryKeys.detail(inventoryId) });
      queryClient.invalidateQueries({ queryKey: inventoryKeys.losses(inventoryId) });
      queryClient.invalidateQueries({ queryKey: inventoryKeys.histories() });
    },
  });
}
