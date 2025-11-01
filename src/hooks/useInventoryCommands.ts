import { addInventoryItem, updateInventoryItem, removeInventoryItem, addInventoryLoss, removeInventoryLoss } from "../db/utils";
import type { InventoryItem, InventoryLoss } from "../shared/models/inventory";

export function useInventoryCommands(userEmail: string, refreshInventory: () => void, refreshLosses?: () => void) {
    const add = async (item: InventoryItem) => { await addInventoryItem(item, userEmail); refreshInventory(); }
    const update = async (item: InventoryItem) => { await updateInventoryItem(item, userEmail); refreshInventory(); }
    const remove = async (item: InventoryItem) => { await removeInventoryItem(item, userEmail); refreshInventory(); }
    const addLoss = async (loss: InventoryLoss) => { await addInventoryLoss(loss, userEmail); refreshLosses?.(); refreshInventory(); }
    const removeLoss = async (loss: InventoryLoss) => { await removeInventoryLoss(loss, userEmail); refreshLosses?.(); refreshInventory(); }
    return { add, update, remove, addLoss, removeLoss };
}