import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Prisma } from '@prisma/client';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request } from 'express';
import { AuditService } from '../../modules/audit/audit.service';
import type { AuthenticatedRequest } from '../decorators/current-user.decorator';

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

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const metadata = this.reflector.get<AuditLogMetadata>(
      AUDIT_LOG_KEY,
      context.getHandler(),
    );

    if (!metadata) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const user = request.user;

    // Skip if no authenticated user
    if (!user) {
      return next.handle();
    }

    return next.handle().pipe(
      tap((response: unknown) => {
        // Extract entity ID from response if available
        const entityId = this.extractEntityId(response);

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

  private extractEntityId(response: unknown): string | undefined {
    if (!this.isRecord(response)) return undefined;
    if (typeof response.id === 'string') return response.id;
    if (this.isRecord(response.data) && typeof response.data.id === 'string') {
      return response.data.id;
    }
    return undefined;
  }

  private extractChanges(
    request: Request,
    response: unknown,
  ): Prisma.InputJsonValue | undefined {
    // For POST/PUT/PATCH, include request body
    if (['POST', 'PUT', 'PATCH'].includes(request.method)) {
      const responseValue =
        this.isRecord(response) && 'data' in response
          ? response.data
          : response;
      return this.toJsonValue({
        request: (request.body as Record<string, unknown>) ?? {},
        response: responseValue,
      });
    }

    // For DELETE, just log the deletion
    if (request.method === 'DELETE') {
      return this.toJsonValue({ deleted: true });
    }

    return undefined;
  }

  private isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null;
  }

  private toJsonValue(value: unknown): Prisma.InputJsonValue | undefined {
    if (value === undefined) return undefined;
    return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
  }

  private getClientIp(request: Request): string {
    const forwarded = request.headers['x-forwarded-for'];
    if (typeof forwarded === 'string') {
      return forwarded.split(',')[0];
    }
    return request.ip || request.socket.remoteAddress || 'unknown';
  }
}
