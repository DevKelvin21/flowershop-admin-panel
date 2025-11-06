import type { InventoryService } from "../repositories/services/inventory.service";
import type { InventoryItem, InventoryLoss } from "../shared/models/inventory";

/**
 * Hook for inventory command operations (add, update, remove, etc.)
 * Accepts inventoryService as parameter for better testability
 */
export function useInventoryCommands(
    inventoryService: InventoryService,
    userEmail: string,
    refreshInventory: () => void,
    refreshLosses?: () => void
) {
    const add = async (item: InventoryItem) => { await inventoryService.addInventoryItem(item, userEmail); refreshInventory(); }
    const update = async (item: InventoryItem) => { await inventoryService.updateInventoryItem(item, userEmail); refreshInventory(); }
    const remove = async (item: InventoryItem) => { await inventoryService.removeInventoryItem(item, userEmail); refreshInventory(); }
    const addLoss = async (loss: InventoryLoss) => { await inventoryService.addInventoryLoss(loss, userEmail); refreshLosses?.(); refreshInventory(); }
    const removeLoss = async (loss: InventoryLoss) => { await inventoryService.removeInventoryLoss(loss, userEmail); refreshLosses?.(); refreshInventory(); }
    return { add, update, remove, addLoss, removeLoss };
}