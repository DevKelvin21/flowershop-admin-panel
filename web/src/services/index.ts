/**
 * Service Module Exports
 *
 * This file re-exports all singleton service instances from the centralized registry.
 * All services are initialized in registry.ts to ensure proper dependency order.
 *
 * Usage:
 *   import { authService, loggingService } from '../services';
 *
 * Note: Inventory data is now managed via TanStack Query hooks in /hooks/queries/inventory.ts
 *
 * For type definitions and classes, import from specific files:
 *   import type { LoggingService } from '../services/logging.service';
 */

// Re-export all singleton instances from registry
export { loggingService, authService, services } from './registry';

// Export types and interfaces for type definitions
export type { LoggingService } from './logging.service';

// Export factory functions (if needed for testing or custom instances)
export { createHttpLoggingService } from './http.logging.service';

