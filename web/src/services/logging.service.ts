/**
 * Logging service interface for operation logging
 * This abstraction allows swapping logging implementations
 * (e.g., HTTP, Firestore, local storage, etc.)
 */
export interface LoggingService {
  logOperation(params: {
    operation_type: string;
    user_name: string;
    message: string;
  }): Promise<void>;
}

