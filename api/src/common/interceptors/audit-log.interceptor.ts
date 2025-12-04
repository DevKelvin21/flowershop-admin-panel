import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request } from 'express';
import { AuditService } from '../../modules/audit/audit.service';

export const AUDIT_LOG_KEY = 'auditLog';

export interface AuditLogMetadata {
  action: string;
  entityType: string;
}

/**
 * Interceptor that automatically logs operations to the audit log
 * Use with @AuditLog() decorator
 */
@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  constructor(
    private readonly auditService: AuditService,
    private readonly reflector: Reflector,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const metadata = this.reflector.get<AuditLogMetadata>(
      AUDIT_LOG_KEY,
      context.getHandler(),
    );

    if (!metadata) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest<Request>();
    const user = (request as any).user;

    // Skip if no authenticated user
    if (!user) {
      return next.handle();
    }

    return next.handle().pipe(
      tap((response) => {
        // Extract entity ID from response if available
        const entityId = response?.id || response?.data?.id;

        // Log the operation asynchronously
        void this.auditService.log({
          userId: user.email || user.uid,
          action: metadata.action,
          entityType: metadata.entityType,
          entityId,
          changes: this.extractChanges(request, response),
          ipAddress: this.getClientIp(request),
          userAgent: request.headers['user-agent'],
        });
      }),
    );
  }

  private extractChanges(request: Request, response: any): any {
    // For POST/PUT/PATCH, include request body
    if (['POST', 'PUT', 'PATCH'].includes(request.method)) {
      return {
        request: request.body,
        response: response?.data || response,
      };
    }

    // For DELETE, just log the deletion
    if (request.method === 'DELETE') {
      return { deleted: true };
    }

    return null;
  }

  private getClientIp(request: Request): string {
    const forwarded = request.headers['x-forwarded-for'];
    if (typeof forwarded === 'string') {
      return forwarded.split(',')[0];
    }
    return request.ip || request.socket.remoteAddress || 'unknown';
  }
}
