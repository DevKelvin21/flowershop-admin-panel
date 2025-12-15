import {
  Transaction as PrismaTransaction,
  TransactionItem as PrismaTransactionItem,
  TransactionType,
  PaymentMethod,
} from '@prisma/client';

export class Transaction implements PrismaTransaction {
  id: string;
  type: TransactionType;
  totalAmount: any; // Prisma Decimal
  paymentMethod: PaymentMethod;
  salesAgent: string | null;
  customerName: string | null;
  notes: string | null;
  messageSent: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export class TransactionItem implements PrismaTransactionItem {
  id: string;
  transactionId: string;
  inventoryId: string;
  quantity: number;
  unitPrice: any; // Prisma Decimal
  subtotal: any; // Prisma Decimal
}

export class TransactionWithItems extends Transaction {
  items: TransactionItem[];
}
