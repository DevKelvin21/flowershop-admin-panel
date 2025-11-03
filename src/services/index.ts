/**
 * Centralized service instances
 * This file ensures we have true singleton instances
 * shared across the entire application
 */
import { createFirebaseAuthService } from '../auth/firebase.auth.service';
import { createHttpLoggingService } from './http.logging.service';

// Create singleton instances once, export for use across the app
export const loggingService = createHttpLoggingService();
export const authService = createFirebaseAuthService(loggingService);

