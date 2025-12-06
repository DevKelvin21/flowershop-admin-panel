import { useQuery, useMutation, useQueryClient, queryOptions } from '@tanstack/react-query';
import { inventoryApi } from '@/lib/api';
import type {
  Inventory,
  CreateInventoryDto,
  UpdateInventoryDto,
  AddLossDto,
  InventoryQueryParams,
  PaginatedResponse,
} from '@/lib/api/types';

// Query Keys
export const inventoryKeys = {
  all: ['inventory'] as const,
  lists: () => [...inventoryKeys.all, 'list'] as const,
  list: (params?: InventoryQueryParams) => [...inventoryKeys.lists(), params] as const,
  details: () => [...inventoryKeys.all, 'detail'] as const,
  detail: (id: string) => [...inventoryKeys.details(), id] as const,
  losses: (id: string) => [...inventoryKeys.detail(id), 'losses'] as const,
  history: () => [...inventoryKeys.all, 'history'] as const,
};

// Query Options
export const inventoryListOptions = (params?: InventoryQueryParams) =>
  queryOptions({
    queryKey: inventoryKeys.list(params),
    queryFn: () => inventoryApi.list(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

export const inventoryDetailOptions = (id: string) =>
  queryOptions({
    queryKey: inventoryKeys.detail(id),
    queryFn: () => inventoryApi.get(id),
    staleTime: 5 * 60 * 1000,
    enabled: !!id,
  });

export const inventoryLossesOptions = (id: string) =>
  queryOptions({
    queryKey: inventoryKeys.losses(id),
    queryFn: () => inventoryApi.getLosses(id),
    staleTime: 5 * 60 * 1000,
    enabled: !!id,
  });

export const inventoryHistoryOptions = (params?: { page?: number; limit?: number }) =>
  queryOptions({
    queryKey: [...inventoryKeys.history(), params],
    queryFn: () => inventoryApi.getHistory(params),
    staleTime: 5 * 60 * 1000,
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.lists() });
    },
  });
}

export function useUpdateInventory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateInventoryDto }) =>
      inventoryApi.update(id, data),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: inventoryKeys.lists() });
      const previousLists = queryClient.getQueriesData({ queryKey: inventoryKeys.lists() });

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
      queryClient.invalidateQueries({ queryKey: inventoryKeys.lists() });
    },
  });
}

export function useArchiveInventory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => inventoryApi.archive(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.lists() });
    },
  });
}

export function useDeleteInventory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => inventoryApi.delete(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: inventoryKeys.lists() });
      const previousLists = queryClient.getQueriesData({ queryKey: inventoryKeys.lists() });

      // Optimistic remove from lists
      queryClient.setQueriesData<PaginatedResponse<Inventory>>(
        { queryKey: inventoryKeys.lists() },
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
      queryClient.invalidateQueries({ queryKey: inventoryKeys.lists() });
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
      queryClient.invalidateQueries({ queryKey: inventoryKeys.history() });
    },
  });
}
