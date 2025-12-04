import { Controller, Get, Query, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { AuditService } from './audit.service';

@ApiTags('Audit')
@Controller({ path: 'audit', version: '1' })
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

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
}
