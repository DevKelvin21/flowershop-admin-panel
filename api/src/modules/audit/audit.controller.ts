import { Controller, Get, Query, Param, Post, Body, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { AuditService } from './audit.service';
import { CreateAuditEventDto } from './dto/create-audit-event.dto';
import {
  CurrentUser,
  type FirebaseUser,
} from '../../common/decorators/current-user.decorator';
import type { Request } from 'express';
import { Prisma } from '@prisma/client';

@ApiTags('Audit')
@Controller({ path: 'audit', version: '1' })
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Post('event')
  @ApiOperation({
    summary: 'Create audit event',
    description:
      'Create an audit event from frontend or custom clients. User is derived from the auth token.',
  })
  @ApiResponse({
    status: 201,
    description: 'Audit event stored',
    schema: {
      example: {
        success: true,
      },
    },
  })
  async createEvent(
    @Body() dto: CreateAuditEventDto,
    @CurrentUser() user: FirebaseUser,
    @Req() request: Request,
  ) {
    await this.auditService.log({
      userId: user.email || user.uid,
      action: dto.action,
      entityType: dto.entityType || 'Frontend',
      entityId: dto.entityId,
      changes: this.toJsonValue({
        source: 'frontend',
        message: dto.message,
        metadata: dto.metadata,
      }),
      ipAddress: this.getClientIp(request),
      userAgent: request.headers['user-agent'],
    });

    return { success: true };
  }

  @Get()
  @ApiOperation({
    summary: 'Get audit logs',
    description: 'Retrieve paginated audit logs with optional filters',
  })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 50 })
  @ApiQuery({ name: 'userId', required: false })
  @ApiQuery({ name: 'action', required: false })
  @ApiQuery({ name: 'entityType', required: false })
  @ApiResponse({
    status: 200,
    description: 'Paginated audit logs',
    schema: {
      example: {
        data: [
          {
            id: 'clx123...',
            userId: 'user@example.com',
            action: 'CREATE_INVENTORY',
            entityType: 'Inventory',
            entityId: 'clx456...',
            changes: {},
            ipAddress: '127.0.0.1',
            userAgent: 'Mozilla/5.0...',
            timestamp: '2025-12-03T12:00:00.000Z',
          },
        ],
        total: 100,
        page: 1,
        limit: 50,
        totalPages: 2,
      },
    },
  })
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('userId') userId?: string,
    @Query('action') action?: string,
    @Query('entityType') entityType?: string,
  ) {
    return this.auditService.findAll(
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 50,
      { userId, action, entityType },
    );
  }

  @Get('entity/:type/:id')
  @ApiOperation({
    summary: 'Get audit logs for specific entity',
    description: 'Retrieve all audit logs for a specific entity',
  })
  @ApiResponse({
    status: 200,
    description: 'Audit logs for the entity',
    schema: {
      example: [
        {
          id: 'clx123...',
          userId: 'user@example.com',
          action: 'UPDATE_INVENTORY',
          entityType: 'Inventory',
          entityId: 'clx456...',
          changes: { quantity: { from: 10, to: 15 } },
          timestamp: '2025-12-03T12:00:00.000Z',
        },
      ],
    },
  })
  async findByEntity(
    @Param('type') entityType: string,
    @Param('id') entityId: string,
  ) {
    return this.auditService.findByEntity(entityType, entityId);
  }

  private getClientIp(request: Request): string {
    const forwarded = request.headers['x-forwarded-for'];
    if (typeof forwarded === 'string') {
      return forwarded.split(',')[0];
    }
    return request.ip || request.socket.remoteAddress || 'unknown';
  }

  private toJsonValue(value: unknown): Prisma.InputJsonValue | undefined {
    if (value === undefined) return undefined;
    return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
  }
}
