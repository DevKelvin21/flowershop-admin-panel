import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TransactionType, PaymentMethod } from '@prisma/client';

export class ParsedItemDto {
  @ApiProperty({ description: 'Inventory item ID', example: 'clx123abc' })
  inventoryId: string;

  @ApiProperty({ description: 'Item name (for display)', example: 'Rosas' })
  itemName: string;

  @ApiProperty({ description: 'Quality level', example: 'Premium' })
  quality: string;

  @ApiProperty({ description: 'Quantity', example: 12 })
  quantity: number;

  @ApiProperty({ description: 'Unit price from inventory', example: 5.99 })
  unitPrice: number;

  @ApiProperty({ description: 'Available quantity in inventory', example: 50 })
  availableQuantity: number;
}

export class ParseTransactionResponseDto {
  @ApiProperty({
    description: 'Parsed transaction type',
    enum: ['SALE', 'EXPENSE'],
    example: 'SALE',
  })
  type: TransactionType;

  @ApiPropertyOptional({
    description: 'Sales agent name (extracted from end of prompt)',
    example: 'mila',
  })
  salesAgent?: string;

  @ApiProperty({
    description: 'Payment method',
    enum: ['CASH', 'BANK_TRANSFER'],
    example: 'CASH',
  })
  paymentMethod: PaymentMethod;

  @ApiPropertyOptional({
    description: 'Parsed notes/context',
    example: 'Pedido de boda',
  })
  notes?: string;

  @ApiProperty({
    description: 'Parsed items with inventory details',
    type: [ParsedItemDto],
  })
  items: ParsedItemDto[];

  @ApiProperty({
    description: 'Total amount extracted from prompt',
    example: 20.0,
  })
  totalAmount: number;

  @ApiProperty({
    description: 'AI confidence score (0-1)',
    example: 0.95,
  })
  confidence: number;

  @ApiPropertyOptional({
    description: 'Suggestions if confidence is low',
    type: [String],
    example: ['Especifica la calidad de las rosas'],
  })
  suggestions?: string[];

  @ApiProperty({
    description: 'Processing time in milliseconds',
    example: 1200,
  })
  processingTimeMs: number;

  @ApiProperty({
    description: 'Original user prompt',
    example: '1 ramo 12 rosas total $20.00 mila',
  })
  originalPrompt: string;

  @ApiProperty({
    description: 'Raw AI response for debugging',
    type: String,
  })
  rawAiResponse: string;
}
