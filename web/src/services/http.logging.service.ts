import type { LoggingService } from './logging.service';

/**
 * HTTP implementation of LoggingService
 * Sends logs to an external HTTP endpoint
 */
export class HttpLoggingService implements LoggingService {
  constructor(private endpoint: string) {}

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
      await fetch(this.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ operation_type, user_name, message }),
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
export function createHttpLoggingService(
  endpoint: string = 'https://cf-flowershop-logs-hanlder-265978683065.us-central1.run.app/log_operation'
): LoggingService {
  return new HttpLoggingService(endpoint);
}

