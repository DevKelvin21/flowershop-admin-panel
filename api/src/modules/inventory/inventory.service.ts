import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateInventoryDto } from './dto/create-inventory.dto';
import { UpdateInventoryDto } from './dto/update-inventory.dto';
import { InventoryQueryDto } from './dto/inventory-query.dto';
import { AddLossDto } from './dto/add-loss.dto';
import { Decimal } from '@prisma/client/runtime/library';
import { Prisma } from '@prisma/client';

@Injectable()
export class InventoryService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateInventoryDto) {
    // Check if item with same quality already exists
    const existing = await this.prisma.inventory.findUnique({
      where: {
        item_quality: {
          item: dto.item,
          quality: dto.quality,
        },
      },
    });

    if (existing) {
      throw new ConflictException(
        `Inventory item "${dto.item}" with quality "${dto.quality}" already exists`,
      );
    }

    return this.prisma.inventory.create({
      data: {
        item: dto.item,
        quality: dto.quality,
        quantity: dto.quantity,
        unitPrice: new Decimal(dto.unitPrice),
      },
    });
  }

  async findAll(query: InventoryQueryDto) {
    const { page = 1, limit = 20, search, quality, isActive } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.InventoryWhereInput = {};

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    if (search) {
      where.item = {
        contains: search,
        mode: 'insensitive',
      };
    }

    if (quality) {
      where.quality = quality;
    }

    const [data, total] = await Promise.all([
      this.prisma.inventory.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ item: 'asc' }, { quality: 'asc' }],
      }),
      this.prisma.inventory.count({ where }),
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
    const inventory = await this.prisma.inventory.findUnique({
      where: { id },
      include: {
        losses: {
          orderBy: { recordedAt: 'desc' },
          take: 10, // Last 10 losses
        },
      },
    });

    if (!inventory) {
      throw new NotFoundException(`Inventory item with ID "${id}" not found`);
    }

    return inventory;
  }

  async update(id: string, dto: UpdateInventoryDto) {
    // Check if inventory exists
    await this.findOne(id);

    // If changing item or quality, check for conflicts
    if (dto.item || dto.quality) {
      const existing = await this.prisma.inventory.findFirst({
        where: {
          id: { not: id },
          item: dto.item,
          quality: dto.quality,
        },
      });

      if (existing) {
        throw new ConflictException(
          `Inventory item "${dto.item}" with quality "${dto.quality}" already exists`,
        );
      }
    }

    const updateData: Prisma.InventoryUpdateInput = {};
    if (dto.item !== undefined) updateData.item = dto.item;
    if (dto.quality !== undefined) updateData.quality = dto.quality;
    if (dto.quantity !== undefined) updateData.quantity = dto.quantity;
    if (dto.unitPrice !== undefined)
      updateData.unitPrice = new Decimal(dto.unitPrice);

    return this.prisma.inventory.update({
      where: { id },
      data: updateData,
    });
  }

  async archive(id: string) {
    await this.findOne(id);

    return this.prisma.inventory.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    // Check if item has any transaction history
    const transactionCount = await this.prisma.transactionItem.count({
      where: { inventoryId: id },
    });

    if (transactionCount > 0) {
      throw new BadRequestException(
        `Cannot delete inventory item with transaction history. Use archive instead.`,
      );
    }

    await this.prisma.inventory.delete({
      where: { id },
    });

    return { success: true, message: 'Inventory item deleted successfully' };
  }

  async getLosses(inventoryId: string) {
    // Verify inventory exists
    await this.findOne(inventoryId);

    return this.prisma.inventoryLoss.findMany({
      where: { inventoryId },
      orderBy: { recordedAt: 'desc' },
    });
  }

  async addLoss(inventoryId: string, dto: AddLossDto, userId: string) {
    const inventory = await this.findOne(inventoryId);

    // Check if sufficient quantity available
    if (inventory.quantity < dto.quantity) {
      throw new BadRequestException(
        `Insufficient inventory. Available: ${inventory.quantity}, Requested: ${dto.quantity}`,
      );
    }

    // Create loss record and update inventory in a transaction
    const [loss] = await this.prisma.$transaction([
      this.prisma.inventoryLoss.create({
        data: {
          inventoryId,
          quantity: dto.quantity,
          reason: dto.reason,
          notes: dto.notes,
          recordedBy: userId,
        },
      }),
      this.prisma.inventory.update({
        where: { id: inventoryId },
        data: {
          quantity: {
            decrement: dto.quantity,
          },
        },
      }),
    ]);

    return loss;
  }

  async getHistory(page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.inventoryLoss.findMany({
        skip,
        take: limit,
        orderBy: { recordedAt: 'desc' },
        include: {
          inventory: {
            select: {
              id: true,
              item: true,
              quality: true,
            },
          },
        },
      }),
      this.prisma.inventoryLoss.count(),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
