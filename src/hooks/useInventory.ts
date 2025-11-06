import { useEffect, useState, useCallback } from "react";
import type { InventoryService } from "../repositories/services/inventory.service";
import type { InventoryItem, InventoryLoss } from "../shared/models/inventory";

/**
 * Hook for managing inventory state and operations
 * Accepts inventoryService as parameter for better testability
 */
export function useInventory(inventoryService: InventoryService) {
    const [inventory, setInventory] = useState<InventoryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [losses, setLosses] = useState<InventoryLoss[]>([]);

    const fetchLosses = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await inventoryService.getAllLosses();
            setLosses(data);
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    }, [inventoryService]);

    const fetchInventory = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await inventoryService.getAllInventory();
            setInventory(data);
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    }, [inventoryService]);

    useEffect(() => {
        void fetchInventory();
        void fetchLosses();
    }, [fetchInventory, fetchLosses]);

    return { inventory, losses, loading, error, refreshInventory: fetchInventory, refreshLosses: fetchLosses };
};