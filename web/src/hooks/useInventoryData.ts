import { useMemo } from 'react';
import {
  useInventoryList,
  useInventoryHistory,
  useCreateInventory,
  useUpdateInventory,
  useDeleteInventory,
  useAddInventoryLoss,
} from '@/hooks/queries/inventory';
import type { CreateInventoryDto, AddLossDto } from '@/lib/api/types';
import type {
  InventoryItem,
  InventoryLoss,
  NewInventoryItem,
} from '@/shared/models/inventory';

/**
 * Hook that fetches and transforms inventory data from the API.
 * Follows the service-wrapping hook pattern.
 */
export function useInventoryData() {
  // Queries
  const {
    data: inventoryData,
    isLoading: inventoryLoading,
    error: inventoryError
  } = useInventoryList();

  const {
    data: historyData,
    isLoading: historyLoading,
    error: historyError
  } = useInventoryHistory({ limit: 100 });

  // Transform API data to domain models
  const inventory: InventoryItem[] = useMemo(() => {
    if (!inventoryData?.data) return [];
    return inventoryData.data.map((item) => ({
      id: item.id,
      item: item.item,
      quantity: item.quantity,
      quality: item.quality,
      unitPrice: item.unitPrice,
      lastUpdated: new Date(item.updatedAt).toLocaleString(),
    }));
  }, [inventoryData]);

  const losses: InventoryLoss[] = useMemo(() => {
    if (!historyData?.data) return [];
    return historyData.data.map((loss) => ({
      id: loss.id,
      inventoryId: loss.inventoryId,
      item: loss.inventory?.item || '',
      quality: loss.inventory?.quality || '',
      quantity: loss.quantity,
      reason: loss.reason,
      notes: loss.notes,
      timestamp: loss.recordedAt,
    }));
  }, [historyData]);

  // Derived data
  const qualityOptions = useMemo(() => {
    const types = new Set(inventory.map((i) => i.quality));
    return Array.from(types).sort();
  }, [inventory]);

  const itemOptions = useMemo(() => {
    const items = new Set(inventory.map((i) => i.item));
    return Array.from(items).filter(Boolean).sort();
  }, [inventory]);

  return {
    // Raw API data (for lookups)
    inventoryData,
    historyData,
    // Transformed data
    inventory,
    losses,
    // Derived options
    qualityOptions,
    itemOptions,
    // Loading/error states
    isLoading: inventoryLoading || historyLoading,
    error: inventoryError || historyError,
  };
}

/**
 * Hook that provides inventory mutation commands.
 * Follows the command hook pattern - accepts dependencies, returns wrapped functions.
 */
export function useInventoryCommands(
  callbacks: {
    onAddSuccess?: () => void;
    onBulkAddSuccess?: (count: number) => void;
    onUpdateSuccess?: () => void;
    onDeleteSuccess?: () => void;
    onLossSuccess?: () => void;
    onError?: (error: unknown) => void;
  } = {}
) {
  const createMutation = useCreateInventory();
  const updateMutation = useUpdateInventory();
  const deleteMutation = useDeleteInventory();
  const addLossMutation = useAddInventoryLoss();

  const addInventory = async (item: NewInventoryItem) => {
    const dto: CreateInventoryDto = {
      item: item.item,
      quality: item.quality,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
    };
    try {
      await createMutation.mutateAsync(dto);
      callbacks.onAddSuccess?.();
    } catch (error) {
      callbacks.onError?.(error);
    }
  };

  const addInventoryBulk = async (items: NewInventoryItem[]) => {
    if (items.length === 0) {
      callbacks.onError?.(new Error('No hay articulos para agregar'));
      return;
    }

    let successCount = 0;
    let failedCount = 0;
    let firstErrorMessage = '';

    for (const item of items) {
      const dto: CreateInventoryDto = {
        item: item.item,
        quality: item.quality,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      };

      try {
        await createMutation.mutateAsync(dto);
        successCount += 1;
      } catch (error) {
        failedCount += 1;
        if (!firstErrorMessage) {
          firstErrorMessage =
            error instanceof Error ? error.message : 'Error desconocido';
        }
      }
    }

    if (successCount > 0) {
      callbacks.onBulkAddSuccess?.(successCount);
    }

    if (failedCount > 0) {
      callbacks.onError?.(
        new Error(
          `No se pudieron agregar ${failedCount} articulo(s). ${firstErrorMessage}`,
        ),
      );
    }
  };

  const updateInventory = async (id: string, data: Partial<InventoryItem>) => {
    try {
      await updateMutation.mutateAsync({ id, data });
      callbacks.onUpdateSuccess?.();
    } catch (error) {
      callbacks.onError?.(error);
    }
  };

  const deleteInventory = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      callbacks.onDeleteSuccess?.();
    } catch (error) {
      callbacks.onError?.(error);
    }
  };

  const addLoss = async (loss: { inventoryId?: string; quantity: number; reason?: string; notes?: string }) => {
    if (!loss.inventoryId) {
      callbacks.onError?.(new Error('Selecciona un artículo de inventario'));
      return;
    }
    const dto: AddLossDto = {
      quantity: loss.quantity,
      reason: loss.reason ?? 'loss',
      notes: loss.notes,
    };
    try {
      await addLossMutation.mutateAsync({ inventoryId: loss.inventoryId, data: dto });
      callbacks.onLossSuccess?.();
    } catch (error) {
      callbacks.onError?.(error);
    }
  };

  return {
    addInventory,
    addInventoryBulk,
    updateInventory,
    deleteInventory,
    addLoss,
    // Expose mutation states for UI feedback
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isAddingLoss: addLossMutation.isPending,
  };
}
