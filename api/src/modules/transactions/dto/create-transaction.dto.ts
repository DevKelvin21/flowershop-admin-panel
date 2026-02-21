import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsPositive,
  IsEnum,
  IsOptional,
  IsArray,
  ValidateNested,
  MinLength,
  Min,
  Max,
  ValidateIf,
} from 'class-validator';
import { Type } from 'class-transformer';
import { TransactionType, PaymentMethod } from '@prisma/client';

export class TransactionItemDto {
  @ApiProperty({
    description: 'Inventory item ID',
    example: 'clx123...',
  })
  @IsString()
  @MinLength(1)
  inventoryId: string;

  @ApiProperty({
    description: 'Quantity',
    example: 10,
    minimum: 1,
  })
  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  quantity: number;
}

export class AiMetadataDto {
  @ApiProperty({
    description: 'Original user prompt',
    example: '1 ramo 12 rosas total $20.00 mila',
  })
  @IsString()
  userPrompt: string;

  @ApiProperty({
    description: 'Raw AI response',
  })
  @IsString()
  aiResponse: string;

  @ApiProperty({
    description: 'AI confidence score (0-1)',
    example: 0.95,
  })
  @IsNumber()
  @Min(0)
  @Max(1)
  @Type(() => Number)
  confidence: number;

  @ApiProperty({
    description: 'Processing time in milliseconds',
    example: 1200,
  })
  @IsNumber()
  @Type(() => Number)
  processingTime: number;
}

export class CreateTransactionDto {
  @ApiProperty({
    description: 'Transaction type',
    enum: TransactionType,
    example: 'SALE',
  })
  @IsEnum(TransactionType)
  type: TransactionType;

  @ApiPropertyOptional({
    description: 'Payment method',
    enum: PaymentMethod,
    example: 'CASH',
    default: 'CASH',
  })
  @IsOptional()
  @IsEnum(PaymentMethod)
  paymentMethod?: PaymentMethod;

  @ApiPropertyOptional({
    description: 'Sales agent name',
    example: 'mila',
  })
  @IsOptional()
  @IsString()
  salesAgent?: string;

  @ApiPropertyOptional({
    description: 'Customer name (legacy field)',
    example: 'Maria Garcia',
  })
  @IsOptional()
  @IsString()
  customerName?: string;

  @ApiPropertyOptional({
    description: 'Additional notes',
    example: 'Wedding order - deliver on Saturday',
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({
    description:
      'Optional manual total amount override for variable pricing transactions',
    example: 85000,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  totalAmount?: number;

  @ApiPropertyOptional({
    description:
      'Transaction items. Required for SALE transactions. Must be omitted for EXPENSE transactions.',
    type: [TransactionItemDto],
    example: [
      { inventoryId: 'clx123...', quantity: 12 },
      { inventoryId: 'clx456...', quantity: 5 },
    ],
  })
  @ValidateIf(
    (object: CreateTransactionDto) =>
      object.type === TransactionType.SALE || object.items !== undefined,
  )
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TransactionItemDto)
  items?: TransactionItemDto[];

  @ApiPropertyOptional({
    description: 'AI metadata if transaction was parsed by AI',
    type: AiMetadataDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => AiMetadataDto)
  aiMetadata?: AiMetadataDto;
}
