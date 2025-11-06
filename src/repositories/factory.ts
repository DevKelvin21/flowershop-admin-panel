/**
 * Repository Factory Functions
 * 
 * Factory functions for creating repository instances.
 * This pattern provides flexibility for:
 * - Testing (easy to mock)
 * - Runtime configuration
 * - Swapping implementations
 */

import type { IInventoryRepository } from './interfaces/inventory.repository';
import type { ILossRepository } from './interfaces/loss.repository';
import { FirebaseInventoryRepository } from './firebase/firebase-inventory.repository';
import { FirebaseLossRepository } from './firebase/firebase-loss.repository';

/**
 * Creates an inventory repository instance
 * @returns IInventoryRepository implementation
 */
export function createInventoryRepository(): IInventoryRepository {
  return new FirebaseInventoryRepository();
}

/**
 * Creates a loss repository instance
 * @returns ILossRepository implementation
 */
export function createLossRepository(): ILossRepository {
  return new FirebaseLossRepository();
}

