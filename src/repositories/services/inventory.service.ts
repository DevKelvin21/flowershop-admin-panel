import type { InventoryItem, InventoryLoss } from '../../shared/models/inventory';
import type { IInventoryRepository } from '../interfaces/inventory.repository';
import type { ILossRepository } from '../interfaces/loss.repository';
import type { LoggingService } from '../../services/logging.service';

/**
 * Domain service for inventory operations
 * Contains business logic that coordinates between repositories
 */
export class InventoryService {
  constructor(
    private inventoryRepository: IInventoryRepository,
    private lossRepository: ILossRepository,
    private loggingService?: LoggingService
  ) {}

  /**
   * Get all inventory items
   */
  async getAllInventory(): Promise<InventoryItem[]> {
    return this.inventoryRepository.getAll();
  }

  /**
   * Add inventory item with logging
   */
  async addInventoryItem(item: InventoryItem, userEmail?: string): Promise<void> {
    await this.inventoryRepository.add(item);
    if (userEmail && this.loggingService) {
      await this.loggingService.logOperation({
        operation_type: 'add_inventory',
        user_name: userEmail,
        message: `Agregó al inventario: ${item.item} (${item.quality}), cantidad: ${item.quantity}`,
      });
    }
  }

  /**
   * Update inventory item with logging
   */
  async updateInventoryItem(item: InventoryItem, userEmail?: string): Promise<void> {
    await this.inventoryRepository.update(item);
    if (userEmail && this.loggingService) {
      await this.loggingService.logOperation({
        operation_type: 'update_inventory',
        user_name: userEmail,
        message: `Actualizó el inventario: ${item.item} (${item.quality}), cantidad: ${item.quantity}`,
      });
    }
  }

  /**
   * Remove inventory item with logging
   */
  async removeInventoryItem(item: InventoryItem, userEmail?: string): Promise<void> {
    await this.inventoryRepository.remove(item);
    if (userEmail && this.loggingService) {
      await this.loggingService.logOperation({
        operation_type: 'remove_inventory',
        user_name: userEmail,
        message: `Eliminó del inventario: ${item.item} (${item.quality})`,
      });
    }
  }

  /**
   * Get all inventory losses
   */
  async getAllLosses(): Promise<InventoryLoss[]> {
    return this.lossRepository.getAll();
  }

  /**
   * Add inventory loss with business logic validation
   */
  async addInventoryLoss(loss: InventoryLoss, userEmail?: string): Promise<void> {
    // Business logic: validate sufficient inventory exists
    const inventory = await this.inventoryRepository.getAll();
    const invItem = inventory.find(
      (i) => i.item === loss.item && i.quality === loss.quality
    );

    if (!invItem || invItem.quantity < loss.quantity) {
      throw new Error('No hay suficiente inventario para registrar la pérdida.');
    }

    // Update inventory quantity
    await this.inventoryRepository.update({
      ...invItem,
      quantity: invItem.quantity - loss.quantity,
    });

    // Add loss record
    await this.lossRepository.add(loss);

    if (userEmail && this.loggingService) {
      await this.loggingService.logOperation({
        operation_type: 'add_inventory_loss',
        user_name: userEmail,
        message: `Registró pérdida: ${loss.item} (${loss.quality}), cantidad: ${loss.quantity}`,
      });
    }
  }

  /**
   * Remove inventory loss and restore inventory
   */
  async removeInventoryLoss(loss: InventoryLoss, userEmail?: string): Promise<void> {
    // Business logic: restore inventory when loss is removed
    const inventory = await this.inventoryRepository.getAll();
    const invItem = inventory.find(
      (i) => i.item === loss.item && i.quality === loss.quality
    );

    if (!invItem) {
      throw new Error('No se encontró el artículo en inventario.');
    }

    // Restore inventory quantity
    await this.inventoryRepository.update({
      ...invItem,
      quantity: invItem.quantity + loss.quantity,
    });

    // Remove loss record
    await this.lossRepository.remove(loss);

    if (userEmail && this.loggingService) {
      await this.loggingService.logOperation({
        operation_type: 'remove_inventory_loss',
        user_name: userEmail,
        message: `Eliminó pérdida y restauró inventario: ${loss.item} (${loss.quality}), cantidad: ${loss.quantity}`,
      });
    }
  }
}

