import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { InventoryService } from './inventory.service';
import { CreateInventoryDto } from './dto/create-inventory.dto';
import { UpdateInventoryDto } from './dto/update-inventory.dto';
import { InventoryQueryDto } from './dto/inventory-query.dto';
import { AddLossDto } from './dto/add-loss.dto';
import {
  CurrentUser,
  type FirebaseUser,
} from 'src/common/decorators/current-user.decorator';
import { AuditLog } from 'src/common/decorators/audit-log.decorator';

@ApiTags('Inventory')
@Controller({ path: 'inventory', version: '1' })
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Post()
  @AuditLog('CREATE_INVENTORY', 'Inventory')
  @ApiOperation({
    summary: 'Create new inventory item',
    description:
      'Add a new item to the inventory with specified quality and quantity',
  })
  @ApiResponse({
    status: 201,
    description: 'Inventory item created successfully',
    schema: {
      example: {
        id: 'clx123...',
        item: 'Roses',
        quality: 'Premium',
        quantity: 100,
        unitPrice: 5.99,
        isActive: true,
        createdAt: '2025-12-03T12:00:00.000Z',
        updatedAt: '2025-12-03T12:00:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 409,
    description: 'Inventory item with same name and quality already exists',
  })
  @ApiResponse({ status: 422, description: 'Validation error' })
  create(@Body() createInventoryDto: CreateInventoryDto) {
    return this.inventoryService.create(createInventoryDto);
  }

  @Get()
  @ApiOperation({
    summary: 'List inventory items',
    description: 'Get paginated list of inventory items with optional filters',
  })
  @ApiResponse({
    status: 200,
    description: 'Paginated inventory list',
    schema: {
      example: {
        data: [
          {
            id: 'clx123...',
            item: 'Roses',
            quality: 'Premium',
            quantity: 100,
            unitPrice: 5.99,
            isActive: true,
            createdAt: '2025-12-03T12:00:00.000Z',
            updatedAt: '2025-12-03T12:00:00.000Z',
          },
        ],
        total: 50,
        page: 1,
        limit: 20,
        totalPages: 3,
      },
    },
  })
  findAll(@Query() query: InventoryQueryDto) {
    return this.inventoryService.findAll(query);
  }

  @Get('history')
  @ApiOperation({
    summary: 'Get inventory loss history',
    description: 'Retrieve paginated history of all inventory losses',
  })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 20 })
  @ApiResponse({
    status: 200,
    description: 'Paginated loss history',
    schema: {
      example: {
        data: [
          {
            id: 'clx456...',
            inventoryId: 'clx123...',
            quantity: 5,
            reason: 'Expired',
            notes: 'Found wilted',
            recordedBy: 'user@example.com',
            recordedAt: '2025-12-03T12:00:00.000Z',
            inventory: {
              id: 'clx123...',
              item: 'Roses',
              quality: 'Premium',
            },
          },
        ],
        total: 100,
        page: 1,
        limit: 20,
        totalPages: 5,
      },
    },
  })
  getHistory(@Query('page') page?: string, @Query('limit') limit?: string) {
    return this.inventoryService.getHistory(
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 20,
    );
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get single inventory item',
    description:
      'Retrieve details of a specific inventory item including recent losses',
  })
  @ApiParam({ name: 'id', description: 'Inventory item ID' })
  @ApiResponse({
    status: 200,
    description: 'Inventory item with losses',
    schema: {
      example: {
        id: 'clx123...',
        item: 'Roses',
        quality: 'Premium',
        quantity: 95,
        unitPrice: 5.99,
        isActive: true,
        createdAt: '2025-12-03T12:00:00.000Z',
        updatedAt: '2025-12-03T12:00:00.000Z',
        losses: [
          {
            id: 'clx456...',
            quantity: 5,
            reason: 'Expired',
            recordedBy: 'user@example.com',
            recordedAt: '2025-12-03T10:00:00.000Z',
          },
        ],
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Inventory item not found' })
  findOne(@Param('id') id: string) {
    return this.inventoryService.findOne(id);
  }

  @Put(':id')
  @AuditLog('UPDATE_INVENTORY', 'Inventory')
  @ApiOperation({
    summary: 'Update inventory item',
    description: 'Update all fields of an inventory item',
  })
  @ApiParam({ name: 'id', description: 'Inventory item ID' })
  @ApiResponse({ status: 200, description: 'Inventory item updated' })
  @ApiResponse({ status: 404, description: 'Inventory item not found' })
  @ApiResponse({ status: 409, description: 'Conflict with existing item' })
  update(
    @Param('id') id: string,
    @Body() updateInventoryDto: UpdateInventoryDto,
  ) {
    return this.inventoryService.update(id, updateInventoryDto);
  }

  @Patch(':id/archive')
  @AuditLog('ARCHIVE_INVENTORY', 'Inventory')
  @ApiOperation({
    summary: 'Archive inventory item',
    description: 'Mark an inventory item as inactive (soft delete)',
  })
  @ApiParam({ name: 'id', description: 'Inventory item ID' })
  @ApiResponse({ status: 200, description: 'Inventory item archived' })
  @ApiResponse({ status: 404, description: 'Inventory item not found' })
  archive(@Param('id') id: string) {
    return this.inventoryService.archive(id);
  }

  @Delete(':id')
  @AuditLog('DELETE_INVENTORY', 'Inventory')
  @ApiOperation({
    summary: 'Delete inventory item',
    description:
      'Permanently delete an inventory item (only if no transaction history)',
  })
  @ApiParam({ name: 'id', description: 'Inventory item ID' })
  @ApiResponse({
    status: 200,
    description: 'Inventory item deleted',
    schema: {
      example: {
        success: true,
        message: 'Inventory item deleted successfully',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Cannot delete item with transaction history',
  })
  @ApiResponse({ status: 404, description: 'Inventory item not found' })
  remove(@Param('id') id: string) {
    return this.inventoryService.remove(id);
  }

  @Get(':id/losses')
  @ApiOperation({
    summary: 'Get losses for inventory item',
    description: 'Retrieve all loss records for a specific inventory item',
  })
  @ApiParam({ name: 'id', description: 'Inventory item ID' })
  @ApiResponse({
    status: 200,
    description: 'Loss records',
    schema: {
      example: [
        {
          id: 'clx456...',
          inventoryId: 'clx123...',
          quantity: 5,
          reason: 'Expired',
          notes: 'Found wilted',
          recordedBy: 'user@example.com',
          recordedAt: '2025-12-03T12:00:00.000Z',
        },
      ],
    },
  })
  @ApiResponse({ status: 404, description: 'Inventory item not found' })
  getLosses(@Param('id') id: string) {
    return this.inventoryService.getLosses(id);
  }

  @Post(':id/loss')
  @AuditLog('ADD_INVENTORY_LOSS', 'InventoryLoss')
  @ApiOperation({
    summary: 'Record inventory loss',
    description: 'Record a loss and automatically decrement inventory quantity',
  })
  @ApiParam({ name: 'id', description: 'Inventory item ID' })
  @ApiResponse({
    status: 201,
    description: 'Loss recorded and inventory updated',
    schema: {
      example: {
        id: 'clx456...',
        inventoryId: 'clx123...',
        quantity: 5,
        reason: 'Expired',
        notes: 'Found wilted during morning inspection',
        recordedBy: 'user@example.com',
        recordedAt: '2025-12-03T12:00:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Insufficient inventory quantity' })
  @ApiResponse({ status: 404, description: 'Inventory item not found' })
  addLoss(
    @Param('id') id: string,
    @Body() addLossDto: AddLossDto,
    @CurrentUser() user: FirebaseUser,
  ) {
    return this.inventoryService.addLoss(
      id,
      addLossDto,
      user.email || user.uid,
    );
  }
}
