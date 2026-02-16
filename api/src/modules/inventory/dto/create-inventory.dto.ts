import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsPositive,
  Min,
  MinLength,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateInventoryDto {
  @ApiProperty({
    description: 'Name of the inventory item',
    example: 'Roses',
    minLength: 1,
  })
  @IsString()
  @MinLength(1)
  item: string;

  @ApiProperty({
    description: 'Quality level of the item',
    example: 'Premium',
    enum: ['Premium', 'Standard', 'Budget'],
  })
  @IsString()
  @MinLength(1)
  quality: string;

  @ApiProperty({
    description: 'Quantity in stock',
    example: 100,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  quantity: number;

  @ApiProperty({
    description: 'Unit price (per item)',
    example: 5.99,
    minimum: 0,
  })
  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  unitPrice: number;
}
