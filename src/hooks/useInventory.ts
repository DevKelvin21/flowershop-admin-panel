import { useEffect, useState, useCallback } from "react";
import { getInventory, getInventoryLoss } from "../db/utils";
import type { InventoryItem, InventoryLoss } from "../shared/models/inventory";

export function useInventory() {
    const [inventory, setInventory] = useState<InventoryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [losses, setLosses] = useState<InventoryLoss[]>([]);

    const fetchLosses = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getInventoryLoss();
            setLosses(data);
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchInventory = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getInventory();
            setInventory(data);
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void fetchInventory();
        void fetchLosses();
    }, [fetchInventory, fetchLosses]);

    return { inventory, losses, loading, error, refreshInventory: fetchInventory, refreshLosses: fetchLosses };
};