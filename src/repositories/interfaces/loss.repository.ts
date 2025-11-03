import type { InventoryLoss } from '../../shared/models/inventory';

/**
 * Repository interface for Inventory Loss operations
 * Provides abstraction over data access layer
 */
export interface ILossRepository {
  /**
   * Get all inventory losses
   */
  getAll(): Promise<InventoryLoss[]>;

  /**
   * Get a single loss by ID
   */
  getById(id: string): Promise<InventoryLoss | null>;

  /**
   * Add a new inventory loss
   */
  add(loss: InventoryLoss): Promise<void>;

  /**
   * Remove an inventory loss
   */
  remove(loss: InventoryLoss): Promise<void>;
}

