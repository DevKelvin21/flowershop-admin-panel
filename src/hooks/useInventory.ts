import { useEffect, useState, useCallback } from "react";
import { getInventory } from "../db/utils";
import type { InventoryItem } from "../shared/models/inventory";

export function useInventory() {
    const [inventory, setInventory] = useState<InventoryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

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
        fetchInventory();
    }, [fetchInventory]);

    return { inventory, loading, error, refreshInventory: fetchInventory };
};