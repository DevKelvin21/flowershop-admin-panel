import type { LoggingService } from './logging.service';
import { apiClient } from '@/lib/api/client';

/**
 * HTTP implementation of LoggingService
 * Sends logs to backend audit endpoint
 */
export class HttpLoggingService implements LoggingService {
  async logOperation({
    operation_type,
    user_name,
    message,
  }: {
    operation_type: string;
    user_name: string;
    message: string;
  }): Promise<void> {
    try {
      await apiClient.post<{ success: boolean }>('/audit/event', {
        action: `FE_${operation_type.toUpperCase()}`,
        entityType: 'FrontendAuth',
        message,
        metadata: {
          operationType: operation_type,
          userName: user_name,
          source: 'web',
        },
      });
    } catch (err) {
      // Optionally handle logging error - fail silently for logging
      console.error('Error logging operation', err);
    }
  }
}

/**
 * Factory function to create HTTP logging service
 */
export function createHttpLoggingService(): LoggingService {
  return new HttpLoggingService();
}
