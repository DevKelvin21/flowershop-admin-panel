import type { InventoryItem } from "../models/inventory";

export function filterInventory(
    inventory: InventoryItem[],
    searchTerm: string,
    filterType: 'all' | 'outofstock' | string
): InventoryItem[] {
    const searchLower = searchTerm.toLowerCase();

    return inventory.filter(item => {
        const matchesSearch =
            (item.item && item.item.toLowerCase().includes(searchLower)) ||
            (item.quantity && String(item.quantity).toLowerCase().includes(searchLower)) ||
            (item.quality && String(item.quality).toLowerCase().includes(searchLower));
        let matchesFilter = true;
        if (filterType === 'outofstock') {
            matchesFilter = Number(item.quantity) === 0;
        } else if (filterType !== 'all') {
            matchesFilter = item.quality === filterType;
        }
        return matchesSearch && matchesFilter;
    });
}

export function getInventoryQualityTypes(inventory: InventoryItem[]): string[] {
    return Array.from(new Set(inventory.map(item => item.quality).filter(Boolean)));
}
