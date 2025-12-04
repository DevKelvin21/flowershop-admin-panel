import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsPositive,
  IsEnum,
  IsOptional,
  IsArray,
  ValidateNested,
  ArrayMinSize,
  MinLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { TransactionType } from '@prisma/client';

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

export class CreateTransactionDto {
  @ApiProperty({
    description: 'Transaction type',
    enum: TransactionType,
    example: 'SALE',
  })
  @IsEnum(TransactionType)
  type: TransactionType;

  @ApiPropertyOptional({
    description: 'Customer name (for sales)',
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

  @ApiProperty({
    description: 'Transaction items',
    type: [TransactionItemDto],
    example: [
      { inventoryId: 'clx123...', quantity: 12 },
      { inventoryId: 'clx456...', quantity: 5 },
    ],
  })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => TransactionItemDto)
  items: TransactionItemDto[];
}
