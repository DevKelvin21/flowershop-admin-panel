import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsPositive, MinLength, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class AddLossDto {
  @ApiProperty({
    description: 'Quantity lost',
    example: 5,
    minimum: 1,
  })
  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  quantity: number;

  @ApiProperty({
    description: 'Reason for loss',
    example: 'Expired',
    enum: ['Expired', 'Damaged', 'Wilted', 'Stolen', 'Other'],
  })
  @IsString()
  @MinLength(1)
  reason: string;

  @ApiPropertyOptional({
    description: 'Additional notes about the loss',
    example: 'Found wilted this morning during inspection',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
