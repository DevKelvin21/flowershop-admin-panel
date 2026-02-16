import { useState, useMemo } from 'react';
import type { InventoryItem, InventoryLoss } from '@/shared/models/inventory';

/**
 * Hook for managing inventory and losses filter state.
 * Follows the Filter/UI hook pattern - pure UI state, no service dependencies.
 */
export function useInventoryPageFilters(
  inventory: InventoryItem[],
  losses: InventoryLoss[]
) {
  // Inventory filters
  const [inventorySearch, setInventorySearch] = useState('');
  const [qualityFilter, setQualityFilter] = useState<string>('all');

  // Loss filters
  const [lossSearch, setLossSearch] = useState('');
  const [lossDateFilter, setLossDateFilter] = useState<{ from: string; to: string }>({
    from: '',
    to: '',
  });

  // Filtered inventory
  const filteredInventory = useMemo(() => {
    return inventory.filter((item) => {
      const matchesSearch =
        item.item.toLowerCase().includes(inventorySearch.toLowerCase()) ||
        item.quality.toLowerCase().includes(inventorySearch.toLowerCase());
      const matchesQuality =
        qualityFilter === 'all' ||
        qualityFilter === 'outofstock'
          ? qualityFilter === 'all' || item.quantity === 0
          : item.quality === qualityFilter;
      return matchesSearch && matchesQuality;
    });
  }, [inventory, inventorySearch, qualityFilter]);

  // Filtered losses
  const filteredLosses = useMemo(() => {
    return losses.filter((loss) => {
      const matchesSearch =
        loss.item.toLowerCase().includes(lossSearch.toLowerCase()) ||
        loss.quality.toLowerCase().includes(lossSearch.toLowerCase());
      const lossDate = new Date(loss.timestamp);
      const matchesFrom =
        !lossDateFilter.from || lossDate >= new Date(lossDateFilter.from);
      const matchesTo =
        !lossDateFilter.to || lossDate <= new Date(lossDateFilter.to + 'T23:59:59');
      return matchesSearch && matchesFrom && matchesTo;
    });
  }, [losses, lossSearch, lossDateFilter]);

  return {
    inventory: {
      search: inventorySearch,
      setSearch: setInventorySearch,
      qualityFilter,
      setQualityFilter,
      filteredData: filteredInventory,
    },
    losses: {
      search: lossSearch,
      setSearch: setLossSearch,
      dateFilter: lossDateFilter,
      setDateFilter: setLossDateFilter,
      filteredData: filteredLosses,
    },
  };
}
