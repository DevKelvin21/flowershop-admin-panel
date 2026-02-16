import { SetMetadata } from '@nestjs/common';
import {
  AUDIT_LOG_KEY,
  AuditLogMetadata,
} from '../interceptors/audit-log.interceptor';

/**
 * Marks a route method for audit logging
 *
 * @param action - The action being performed (e.g., 'CREATE_INVENTORY', 'UPDATE_TRANSACTION')
 * @param entityType - The type of entity being modified (e.g., 'Inventory', 'Transaction')
 *
 * @example
 * @AuditLog('CREATE_INVENTORY', 'Inventory')
 * @Post()
 * create(@Body() dto: CreateInventoryDto) {
 *   return this.inventoryService.create(dto);
 * }
 */
export const AuditLog = (action: string, entityType: string) =>
  SetMetadata(AUDIT_LOG_KEY, { action, entityType } as AuditLogMetadata);
