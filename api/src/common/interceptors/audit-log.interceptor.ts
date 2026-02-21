import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Prisma } from '@prisma/client';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
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

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const user = request.user;

    // Skip if no authenticated user
    if (!user) {
      return next.handle();
    }

    // Prevent noise/self-referential logs for audit inspection/ingestion routes.
    if (this.shouldSkipPath(request.path)) {
      return next.handle();
    }

    const resolvedMetadata = metadata ?? this.buildDefaultMetadata(request);

    return next.handle().pipe(
      tap((response: unknown) => {
        // Extract entity ID from response if available
        const entityId = this.extractEntityId(response);

        // Log the operation asynchronously
        void this.auditService.log({
          userId: user.email || user.uid,
          action: resolvedMetadata.action,
          entityType: resolvedMetadata.entityType,
          entityId,
          changes: this.extractChanges(request, response, !!metadata),
          ipAddress: this.getClientIp(request),
          userAgent: request.headers['user-agent'],
        });
      }),
      catchError((error: unknown) => {
        void this.auditService.log({
          userId: user.email || user.uid,
          action: `${resolvedMetadata.action}_FAILED`,
          entityType: resolvedMetadata.entityType,
          changes: this.extractErrorChanges(request, error, !!metadata),
          ipAddress: this.getClientIp(request),
          userAgent: request.headers['user-agent'],
        });
        return throwError(() => error);
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
    hasExplicitMetadata: boolean,
  ): Prisma.InputJsonValue | undefined {
    // For inferred logs, capture GET query parameters for request traceability.
    if (!hasExplicitMetadata && request.method === 'GET') {
      return this.toJsonValue({
        query: request.query ?? {},
      });
    }

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

  private extractErrorChanges(
    request: Request,
    error: unknown,
    hasExplicitMetadata: boolean,
  ): Prisma.InputJsonValue | undefined {
    const serializedError = this.isRecord(error)
      ? {
          message: typeof error.message === 'string' ? error.message : 'Unknown error',
          name: typeof error.name === 'string' ? error.name : 'Error',
          status:
            typeof error.status === 'number'
              ? error.status
              : typeof error.statusCode === 'number'
                ? error.statusCode
                : undefined,
        }
      : { message: 'Unknown error', name: 'Error' };

    if (hasExplicitMetadata) {
      return this.toJsonValue({
        request:
          ['POST', 'PUT', 'PATCH'].includes(request.method)
            ? ((request.body as Record<string, unknown>) ?? {})
            : undefined,
        error: serializedError,
      });
    }

    return this.toJsonValue({
      query: request.query ?? {},
      request:
        ['POST', 'PUT', 'PATCH'].includes(request.method)
          ? ((request.body as Record<string, unknown>) ?? {})
          : undefined,
      error: serializedError,
    });
  }

  private buildDefaultMetadata(request: Request): AuditLogMetadata {
    return {
      action: this.buildActionFromRequest(request),
      entityType: this.inferEntityType(request.path),
    };
  }

  private buildActionFromRequest(request: Request): string {
    const method = request.method.toUpperCase();
    const routePattern = `${request.baseUrl || ''}${request.route?.path || request.path}`;
    const normalizedPath = routePattern
      .replace(/[^a-zA-Z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '')
      .toUpperCase();

    return `API_${method}_${normalizedPath || 'ROOT'}`;
  }

  private inferEntityType(path: string): string {
    const normalized = path.replace(/^\/+/, '');
    const segments = normalized.split('/').filter(Boolean);
    const apiIndex = segments.findIndex((segment) => segment === 'api');
    const resourceSegment =
      apiIndex >= 0 ? segments[apiIndex + 2] : segments[0];

    if (!resourceSegment) return 'Api';
    return resourceSegment.charAt(0).toUpperCase() + resourceSegment.slice(1);
  }

  private shouldSkipPath(path: string): boolean {
    return path.startsWith('/api/v1/audit');
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
