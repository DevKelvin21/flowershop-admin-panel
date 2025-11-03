// Export interfaces
export type { IInventoryRepository, ILossRepository } from './interfaces';

// Export implementations
export { FirebaseInventoryRepository } from './firebase/firebase-inventory.repository';
export { FirebaseLossRepository } from './firebase/firebase-loss.repository';

// Export services
export { InventoryService } from './services/inventory.service';

// Export singleton instances (to be created later when needed)
import { FirebaseInventoryRepository } from './firebase/firebase-inventory.repository';
import { FirebaseLossRepository } from './firebase/firebase-loss.repository';
import { InventoryService } from './services/inventory.service';
import { loggingService } from '../services/index';

// Create singleton instances
export const inventoryRepository = new FirebaseInventoryRepository();
export const lossRepository = new FirebaseLossRepository();
export const inventoryService = new InventoryService(inventoryRepository, lossRepository, loggingService);

