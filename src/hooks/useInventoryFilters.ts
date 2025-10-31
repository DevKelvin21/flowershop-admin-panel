import { useState, useMemo } from 'react';
import type { InventoryItem } from '../shared/models/inventory';
import { filterInventory, getInventoryQualityTypes } from '../shared/utils/InventoryFilter';

export function useInventoryFilters(inventory: InventoryItem[]) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<string>('all');
  const inventoryQualityTypes = useMemo(() => getInventoryQualityTypes(inventory), [inventory]);
  const filteredInventory = useMemo(() => filterInventory(inventory, search, filter), [inventory, search, filter]);

  return { search, filter, setSearch, setFilter, filteredInventory, inventoryQualityTypes };
}
