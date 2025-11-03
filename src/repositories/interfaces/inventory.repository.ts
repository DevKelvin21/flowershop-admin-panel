import type { InventoryItem } from '../../shared/models/inventory';

/**
 * Repository interface for Inventory operations
 * Provides abstraction over data access layer
 */
export interface IInventoryRepository {
  /**
   * Get all inventory items
   */
  getAll(): Promise<InventoryItem[]>;

  /**
   * Get a single inventory item by ID
   */
  getById(id: string): Promise<InventoryItem | null>;

  /**
   * Add a new inventory item
   */
  add(item: InventoryItem): Promise<void>;

  /**
   * Update an existing inventory item
   */
  update(item: InventoryItem): Promise<void>;

  /**
   * Remove an inventory item
   */
  remove(item: InventoryItem): Promise<void>;

  /**
   * Update multiple inventory items in a batch
   */
  updateBatch(items: InventoryItem[]): Promise<void>;
}

