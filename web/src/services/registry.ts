/**
 * Service Registry - Single Source of Truth for All Singletons
 *
 * This file centralizes all singleton service instances used across the application.
 * Import services from here to ensure you're using the same instance throughout the application.
 *
 * Usage:
 *   import { authService, loggingService } from '../services/registry';
 *
 * Note: Inventory data is now managed via TanStack Query hooks in /hooks/queries/inventory.ts
 */

import { createHttpLoggingService } from './http.logging.service';
import { createFirebaseAuthService } from '../auth/firebase.auth.service';

// ========================================
// Service Initialization
// ========================================
// Services are initialized in dependency order:
// 1. Infrastructure services (no dependencies)
// 2. Authentication service (depends on logging)

// 1. Infrastructure services (no dependencies)
export const loggingService = createHttpLoggingService();

// 2. Authentication service (depends on logging)
export const authService = createFirebaseAuthService(loggingService);

// ========================================
// Service Registry Object
// ========================================

/**
 * Export as an object for easier mocking in tests
 * Example usage in tests:
 *   jest.mock('../services/registry', () => ({
 *     services: {
 *       auth: mockAuthService,
 *     }
 *   }));
 */
export const services = {
  logging: loggingService,
  auth: authService,
} as const;

