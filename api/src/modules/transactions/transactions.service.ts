import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { TransactionQueryDto } from './dto/transaction-query.dto';
import { TransactionSummaryDto } from './dto/transaction-summary.dto';
import { Prisma, TransactionType } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class TransactionsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateTransactionDto, userId: string) {
    // Validate all inventory items exist and have sufficient quantity
    const inventoryItems = await this.prisma.inventory.findMany({
      where: {
        id: { in: dto.items.map((item) => item.inventoryId) },
        isActive: true,
      },
    });

    if (inventoryItems.length !== dto.items.length) {
      throw new BadRequestException(
        'One or more inventory items not found or inactive',
      );
    }

    // Check inventory availability and calculate amounts
    const transactionItems: any[] = [];
    let totalAmount = new Decimal(0);

    for (const item of dto.items) {
      const inventory = inventoryItems.find(
        (inv) => inv.id === item.inventoryId,
      );

      if (!inventory) {
        throw new BadRequestException(
          `Inventory item ${item.inventoryId} not found`,
        );
      }

      // For sales, check if we have enough inventory
      if (dto.type === TransactionType.SALE) {
        if (inventory.quantity < item.quantity) {
          throw new BadRequestException(
            `Insufficient inventory for ${inventory.item} (${inventory.quality}). ` +
              `Available: ${inventory.quantity}, Requested: ${item.quantity}`,
          );
        }
      }

      const unitPrice = inventory.unitPrice;
      const subtotal = unitPrice.mul(item.quantity);
      totalAmount = totalAmount.add(subtotal);

      transactionItems.push({
        inventoryId: item.inventoryId,
        quantity: item.quantity,
        unitPrice,
        subtotal,
      });
    }

    // Create transaction with items and update inventory in a database transaction
    const result = await this.prisma.$transaction(async (tx) => {
      // Create the transaction
      const transaction = await tx.transaction.create({
        data: {
          type: dto.type,
          totalAmount,
          paymentMethod: dto.paymentMethod || 'CASH',
          salesAgent: dto.salesAgent,
          customerName: dto.customerName,
          notes: dto.notes,
          createdBy: userId,
          items: {
            create: transactionItems,
          },
        },
        include: {
          items: {
            include: {
              inventory: {
                select: {
                  item: true,
                  quality: true,
                  unitPrice: true,
                },
              },
            },
          },
        },
      });

      // Store AI metadata if provided
      if (dto.aiMetadata) {
        await tx.aiTransactionMetadata.create({
          data: {
            transactionId: transaction.id,
            userPrompt: dto.aiMetadata.userPrompt,
            aiResponse: dto.aiMetadata.aiResponse,
            confidence: dto.aiMetadata.confidence,
            processingTime: dto.aiMetadata.processingTime,
          },
        });
      }

      // Update inventory quantities
      for (const item of dto.items) {
        if (dto.type === TransactionType.SALE) {
          // Decrement for sales
          await tx.inventory.update({
            where: { id: item.inventoryId },
            data: {
              quantity: {
                decrement: item.quantity,
              },
            },
          });
        } else {
          // Increment for expenses (purchases)
          await tx.inventory.update({
            where: { id: item.inventoryId },
            data: {
              quantity: {
                increment: item.quantity,
              },
            },
          });
        }
      }

      return transaction;
    });

    return result;
  }

  async findAll(query: TransactionQueryDto) {
    const { page = 1, limit = 20, type, startDate, endDate } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.TransactionWhereInput = {};

    if (type) {
      where.type = type;
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const [data, total] = await Promise.all([
      this.prisma.transaction.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          items: {
            include: {
              inventory: {
                select: {
                  item: true,
                  quality: true,
                },
              },
            },
          },
        },
      }),
      this.prisma.transaction.count({ where }),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string) {
    const transaction = await this.prisma.transaction.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            inventory: {
              select: {
                item: true,
                quality: true,
                unitPrice: true,
              },
            },
          },
        },
      },
    });

    if (!transaction) {
      throw new NotFoundException(`Transaction with ID "${id}" not found`);
    }

    return transaction;
  }

  async update(id: string, dto: UpdateTransactionDto) {
    // Check if transaction exists
    await this.findOne(id);

    return this.prisma.transaction.update({
      where: { id },
      data: {
        paymentMethod: dto.paymentMethod,
        salesAgent: dto.salesAgent,
        customerName: dto.customerName,
        notes: dto.notes,
        messageSent: dto.messageSent,
      },
      include: {
        items: {
          include: {
            inventory: {
              select: {
                item: true,
                quality: true,
              },
            },
          },
        },
      },
    });
  }

  async remove(id: string) {
    const transaction = await this.findOne(id);

    // Reverse inventory changes in a database transaction
    await this.prisma.$transaction(async (tx) => {
      // Reverse inventory updates
      for (const item of transaction.items) {
        if (transaction.type === TransactionType.SALE) {
          // Restore inventory for deleted sales
          await tx.inventory.update({
            where: { id: item.inventoryId },
            data: {
              quantity: {
                increment: item.quantity,
              },
            },
          });
        } else {
          // Remove inventory for deleted expenses
          await tx.inventory.update({
            where: { id: item.inventoryId },
            data: {
              quantity: {
                decrement: item.quantity,
              },
            },
          });
        }
      }

      // Delete transaction (cascade will delete items)
      await tx.transaction.delete({
        where: { id },
      });
    });

    return { success: true, message: 'Transaction deleted successfully' };
  }

  async getSummary(dto: TransactionSummaryDto) {
    const where: Prisma.TransactionWhereInput = {};

    if (dto.startDate || dto.endDate) {
      where.createdAt = {};
      if (dto.startDate) where.createdAt.gte = new Date(dto.startDate);
      if (dto.endDate) where.createdAt.lte = new Date(dto.endDate);
    }

    const [salesData, expensesData, transactionCount] = await Promise.all([
      this.prisma.transaction.aggregate({
        where: { ...where, type: TransactionType.SALE },
        _sum: { totalAmount: true },
        _count: true,
      }),
      this.prisma.transaction.aggregate({
        where: { ...where, type: TransactionType.EXPENSE },
        _sum: { totalAmount: true },
        _count: true,
      }),
      this.prisma.transaction.count({ where }),
    ]);

    const totalSales = salesData._sum.totalAmount
      ? new Decimal(salesData._sum.totalAmount.toString())
      : new Decimal(0);
    const totalExpenses = expensesData._sum.totalAmount
      ? new Decimal(expensesData._sum.totalAmount.toString())
      : new Decimal(0);
    const profit = totalSales.minus(totalExpenses);

    return {
      totalSales: totalSales.toNumber(),
      totalExpenses: totalExpenses.toNumber(),
      profit: profit.toNumber(),
      salesCount: salesData._count,
      expensesCount: expensesData._count,
      transactionCount,
    };
  }

  async getAnalytics(period: 'week' | 'month' | 'year' = 'month') {
    // Calculate date range
    const now = new Date();
    const startDate = new Date(now);

    switch (period) {
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
    }

    // Get transactions in period
    const transactions = await this.prisma.transaction.findMany({
      where: {
        createdAt: {
          gte: startDate,
        },
      },
      include: {
        items: {
          include: {
            inventory: {
              select: {
                item: true,
                quality: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    // Group sales by day
    const salesByDay: Record<string, number> = {};
    const itemSales: Record<string, { quantity: number; revenue: number }> = {};

    transactions.forEach((transaction) => {
      const date = transaction.createdAt.toISOString().split('T')[0];

      if (transaction.type === TransactionType.SALE) {
        if (!salesByDay[date]) {
          salesByDay[date] = 0;
        }
        salesByDay[date] += Number(transaction.totalAmount);

        // Track item sales
        transaction.items.forEach((item) => {
          const itemKey = `${item.inventory.item} (${item.inventory.quality})`;
          if (!itemSales[itemKey]) {
            itemSales[itemKey] = { quantity: 0, revenue: 0 };
          }
          itemSales[itemKey].quantity += item.quantity;
          itemSales[itemKey].revenue += Number(item.subtotal);
        });
      }
    });

    // Get top selling items
    const topItems = Object.entries(itemSales)
      .map(([item, data]) => ({
        item,
        quantity: data.quantity,
        revenue: data.revenue,
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    return {
      period,
      startDate,
      endDate: now,
      salesByDay: Object.entries(salesByDay).map(([date, total]) => ({
        date,
        total,
      })),
      topItems,
    };
  }
}
