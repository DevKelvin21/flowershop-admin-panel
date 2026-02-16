import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  Min,
  MinLength,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateInventoryDto {
  @ApiPropertyOptional({
    description: 'Name of the inventory item',
    example: 'Roses',
  })
  @IsOptional()
  @IsString()
  @MinLength(1)
  item?: string;

  @ApiPropertyOptional({
    description: 'Quality level of the item',
    example: 'Premium',
  })
  @IsOptional()
  @IsString()
  @MinLength(1)
  quality?: string;

  @ApiPropertyOptional({
    description: 'Quantity in stock',
    example: 100,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  quantity?: number;

  @ApiPropertyOptional({
    description: 'Unit price (per item)',
    example: 5.99,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  unitPrice?: number;
}
