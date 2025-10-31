import { addInventoryItem, updateInventoryItem, removeInventoryItem } from "../db/utils";
import type { InventoryItem } from "../shared/models/inventory";

export function useInventoryCommands(userEmail: string, refreshInventory: () => void) {
    const add = async (item: InventoryItem) => { await addInventoryItem(item, userEmail); refreshInventory(); }
    const update = async (item: InventoryItem) => { await updateInventoryItem(item, userEmail); refreshInventory(); }
    const remove = async (item: InventoryItem) => { await removeInventoryItem(item, userEmail); refreshInventory(); }
    return { add, update, remove };
}