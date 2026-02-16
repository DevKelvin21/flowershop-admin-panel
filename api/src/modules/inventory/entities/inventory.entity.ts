import { Inventory as PrismaInventory } from '@prisma/client';

export class Inventory implements PrismaInventory {
  id: string;
  item: string;
  quality: string;
  quantity: number;
  unitPrice: any; // Prisma Decimal type
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class InventoryWithLosses extends Inventory {
  losses?: InventoryLoss[];
}

export class InventoryLoss {
  id: string;
  inventoryId: string;
  quantity: number;
  reason: string;
  notes: string | null;
  recordedBy: string;
  recordedAt: Date;
}
