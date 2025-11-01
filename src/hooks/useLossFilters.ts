import { useState, useMemo } from 'react';
import type { InventoryItem, InventoryLoss } from '../shared/models/inventory';
import { getInventoryQualityTypes, filterLosses } from '../shared/utils/InventoryFilter';

export function useLossFilters(inventory: InventoryItem[], losses: InventoryLoss[]) {
  const [search, setSearch] = useState('');
  const [filterDate, setFilterDate] = useState<{ from?: string; to?: string }>({});
  const inventoryQualityTypes = useMemo(() => getInventoryQualityTypes(inventory), [inventory]);
  const filteredLosses = useMemo(() => filterLosses(losses, search, filterDate), [losses, search, filterDate]);

  return { search, filterDate, setSearch, setFilterDate, inventoryQualityTypes, filteredLosses };
}