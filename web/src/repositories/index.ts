/**
 * Repository Module Exports
 * 
 * This file exports:
 * - Interfaces (for type definitions and DI)
 * - Implementation classes (for instantiation if needed)
 * - Service classes (business logic layer)
 * - Factory functions (for creating instances)
 */

// Export interfaces (types)
export type { IInventoryRepository, ILossRepository } from './interfaces';

// Export implementation classes
export { FirebaseInventoryRepository } from './firebase/firebase-inventory.repository';
export { FirebaseLossRepository } from './firebase/firebase-loss.repository';

// Export service classes
export { InventoryService } from './services/inventory.service';

// Export factory functions
export { createInventoryRepository, createLossRepository } from './factory';

