import {
  Controller,
  Get,
  Post,
  Put,
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
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { TransactionQueryDto } from './dto/transaction-query.dto';
import { TransactionSummaryDto } from './dto/transaction-summary.dto';
import {
  CurrentUser,
  type FirebaseUser,
} from 'src/common/decorators/current-user.decorator';
import { AuditLog } from 'src/common/decorators/audit-log.decorator';

@ApiTags('Transactions')
@Controller({ path: 'transactions', version: '1' })
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post()
  @AuditLog('CREATE_TRANSACTION', 'Transaction')
  @ApiOperation({
    summary: 'Create new transaction',
    description:
      'Create a sale or expense transaction. Inventory quantities are updated only for sales.',
  })
  @ApiResponse({
    status: 201,
    description: 'Transaction created successfully',
    schema: {
      example: {
        id: 'clx123...',
        type: 'SALE',
        totalAmount: 71.88,
        customerName: 'Maria Garcia',
        notes: 'Wedding order',
        messageSent: false,
        createdBy: 'user@example.com',
        createdAt: '2025-12-03T12:00:00.000Z',
        updatedAt: '2025-12-03T12:00:00.000Z',
        items: [
          {
            id: 'clx456...',
            inventoryId: 'clx789...',
            quantity: 12,
            unitPrice: 5.99,
            subtotal: 71.88,
            inventory: {
              item: 'Roses',
              quality: 'Premium',
              unitPrice: 5.99,
            },
          },
        ],
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Insufficient inventory or validation error',
  })
  create(
    @Body() createTransactionDto: CreateTransactionDto,
    @CurrentUser() user: FirebaseUser,
  ) {
    return this.transactionsService.create(
      createTransactionDto,
      user.email || user.uid,
    );
  }

  @Get()
  @ApiOperation({
    summary: 'List transactions',
    description: 'Get paginated list of transactions with optional filters',
  })
  @ApiResponse({
    status: 200,
    description: 'Paginated transactions list',
    schema: {
      example: {
        data: [
          {
            id: 'clx123...',
            type: 'SALE',
            totalAmount: 71.88,
            customerName: 'Maria Garcia',
            createdAt: '2025-12-03T12:00:00.000Z',
            items: [
              {
                quantity: 12,
                inventory: {
                  item: 'Roses',
                  quality: 'Premium',
                },
              },
            ],
          },
        ],
        total: 50,
        page: 1,
        limit: 20,
        totalPages: 3,
      },
    },
  })
  findAll(@Query() query: TransactionQueryDto) {
    return this.transactionsService.findAll(query);
  }

  @Get('summary')
  @ApiOperation({
    summary: 'Get financial summary',
    description:
      'Calculate total sales, expenses, and profit for a given date range',
  })
  @ApiResponse({
    status: 200,
    description: 'Financial summary',
    schema: {
      example: {
        totalSales: 5000.0,
        totalExpenses: 3000.0,
        profit: 2000.0,
        salesCount: 150,
        expensesCount: 45,
        transactionCount: 195,
      },
    },
  })
  getSummary(@Query() dto: TransactionSummaryDto) {
    return this.transactionsService.getSummary(dto);
  }

  @Get('analytics')
  @ApiOperation({
    summary: 'Get analytics data',
    description:
      'Get sales by day and top selling items for dashboard visualization',
  })
  @ApiQuery({
    name: 'period',
    required: false,
    enum: ['week', 'month', 'year'],
    example: 'month',
  })
  @ApiResponse({
    status: 200,
    description: 'Analytics data',
    schema: {
      example: {
        period: 'month',
        startDate: '2025-11-03T00:00:00.000Z',
        endDate: '2025-12-03T12:00:00.000Z',
        salesByDay: [
          { date: '2025-12-01', total: 150.5 },
          { date: '2025-12-02', total: 230.75 },
        ],
        topItems: [
          {
            item: 'Roses (Premium)',
            quantity: 120,
            revenue: 718.8,
          },
          {
            item: 'Tulips (Standard)',
            quantity: 85,
            revenue: 340.0,
          },
        ],
      },
    },
  })
  getAnalytics(@Query('period') period?: 'week' | 'month' | 'year') {
    return this.transactionsService.getAnalytics(period || 'month');
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get single transaction',
    description: 'Retrieve details of a specific transaction with all items',
  })
  @ApiParam({ name: 'id', description: 'Transaction ID' })
  @ApiResponse({
    status: 200,
    description: 'Transaction details',
    schema: {
      example: {
        id: 'clx123...',
        type: 'SALE',
        totalAmount: 71.88,
        customerName: 'Maria Garcia',
        notes: 'Wedding order - deliver on Saturday',
        messageSent: false,
        createdBy: 'user@example.com',
        createdAt: '2025-12-03T12:00:00.000Z',
        updatedAt: '2025-12-03T12:00:00.000Z',
        items: [
          {
            id: 'clx456...',
            inventoryId: 'clx789...',
            quantity: 12,
            unitPrice: 5.99,
            subtotal: 71.88,
            inventory: {
              item: 'Roses',
              quality: 'Premium',
              unitPrice: 5.99,
            },
          },
        ],
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Transaction not found' })
  findOne(@Param('id') id: string) {
    return this.transactionsService.findOne(id);
  }

  @Put(':id')
  @AuditLog('UPDATE_TRANSACTION', 'Transaction')
  @ApiOperation({
    summary: 'Update transaction',
    description:
      'Update transaction metadata (customer name, notes, message status). Cannot modify items.',
  })
  @ApiParam({ name: 'id', description: 'Transaction ID' })
  @ApiResponse({ status: 200, description: 'Transaction updated' })
  @ApiResponse({ status: 404, description: 'Transaction not found' })
  update(
    @Param('id') id: string,
    @Body() updateTransactionDto: UpdateTransactionDto,
  ) {
    return this.transactionsService.update(id, updateTransactionDto);
  }

  @Delete(':id')
  @AuditLog('DELETE_TRANSACTION', 'Transaction')
  @ApiOperation({
    summary: 'Delete transaction',
    description:
      'Delete a transaction and reverse inventory changes (restores inventory quantities)',
  })
  @ApiParam({ name: 'id', description: 'Transaction ID' })
  @ApiResponse({
    status: 200,
    description: 'Transaction deleted and inventory restored',
    schema: {
      example: {
        success: true,
        message: 'Transaction deleted successfully',
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Transaction not found' })
  remove(@Param('id') id: string) {
    return this.transactionsService.remove(id);
  }
}
