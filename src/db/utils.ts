/**
 * @deprecated This file is kept for backward compatibility.
 * New code should use the repository pattern from src/repositories/
 * 
 * Legacy functions that wrap the new repository structure.
 * These will be removed once all imports are updated.
 */

import { inventoryService } from '../repositories';
import type { InventoryItem, InventoryLoss } from '../shared/models/inventory';

/**
 * @deprecated Use inventoryService.getAllInventory() instead
 */
export async function getInventory(): Promise<InventoryItem[]> {
  return inventoryService.getAllInventory();
}

/**
 * @deprecated Use inventoryService.addInventoryItem() instead
 */
export async function addInventoryItem(item: InventoryItem, userEmail?: string): Promise<void> {
  return inventoryService.addInventoryItem(item, userEmail);
}

/**
 * @deprecated Use inventoryService.updateInventoryItem() instead
 */
export async function updateInventoryItem(item: InventoryItem, userEmail?: string): Promise<void> {
  return inventoryService.updateInventoryItem(item, userEmail);
}

/**
 * @deprecated Use inventoryService.removeInventoryItem() instead
 */
export async function removeInventoryItem(item: InventoryItem, userEmail?: string): Promise<void> {
  return inventoryService.removeInventoryItem(item, userEmail);
}

/**
 * @deprecated Use inventoryService.getAllLosses() instead
 */
export async function getInventoryLoss(): Promise<InventoryLoss[]> {
  return inventoryService.getAllLosses();
}

/**
 * @deprecated Use inventoryService.addInventoryLoss() instead
 */
export async function addInventoryLoss(loss: InventoryLoss, userEmail?: string): Promise<void> {
  return inventoryService.addInventoryLoss(loss, userEmail);
}

/**
 * @deprecated Use inventoryService.removeInventoryLoss() instead
 */
export async function removeInventoryLoss(loss: InventoryLoss, userEmail?: string): Promise<void> {
  return inventoryService.removeInventoryLoss(loss, userEmail);
}

/**
 * @deprecated This function is no longer needed.
 * Legacy function kept for compatibility - batch updates should use repository directly.
 */
export async function updateInventory(items: InventoryItem[]): Promise<void> {
  // Note: This function previously did batch updates but didn't have userEmail
  // For now, we'll update items individually without logging
  const { inventoryRepository } = await import('../repositories/index');
  // Note: We need to import the repository directly for batch operations
  // This is a temporary workaround - in the future, add batch update with logging to service
  for (const item of items) {
    await inventoryRepository.updateBatch([item]);
  }
}
