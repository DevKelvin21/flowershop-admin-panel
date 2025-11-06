/**
 * Service Registry - Single Source of Truth for All Singletons
 * 
 * This file centralizes all singleton service instances used across the application.
 * Import services from here to ensure you're using the same instance throughout the application.
 * 
 * Usage:
 *   import { authService, inventoryService, loggingService } from '../services/registry';
 */

import { createHttpLoggingService } from './http.logging.service';
import { createFirebaseAuthService } from '../auth/firebase.auth.service';
import { InventoryService } from '../repositories/services/inventory.service';
import { createInventoryRepository, createLossRepository } from '../repositories/factory';

// ========================================
// Service Initialization
// ========================================
// Services are initialized in dependency order:
// 1. Infrastructure services (no dependencies)
// 2. Authentication service (depends on logging)
// 3. Data repositories (no dependencies)
// 4. Domain services (depend on repositories and logging)

// 1. Infrastructure services (no dependencies)
export const loggingService = createHttpLoggingService();

// 2. Authentication service (depends on logging)
export const authService = createFirebaseAuthService(loggingService);

// 3. Data repositories (no dependencies)
export const inventoryRepository = createInventoryRepository();
export const lossRepository = createLossRepository();

// 4. Domain services (depend on repositories and logging)
export const inventoryService = new InventoryService(
  inventoryRepository,
  lossRepository,
  loggingService
);

// ========================================
// Service Registry Object
// ========================================

/**
 * Export as an object for easier mocking in tests
 * Example usage in tests:
 *   jest.mock('../services/registry', () => ({
 *     services: {
 *       auth: mockAuthService,
 *       inventory: mockInventoryService,
 *     }
 *   }));
 */
export const services = {
  logging: loggingService,
  auth: authService,
  inventory: inventoryService,
  repositories: {
    inventory: inventoryRepository,
    loss: lossRepository,
  },
} as const;

