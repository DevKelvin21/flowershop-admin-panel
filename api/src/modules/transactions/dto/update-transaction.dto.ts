import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean, IsEnum } from 'class-validator';
import { PaymentMethod } from '@prisma/client';

export class UpdateTransactionDto {
  @ApiPropertyOptional({
    description: 'Payment method',
    enum: PaymentMethod,
    example: 'CASH',
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
    example: 'Updated delivery instructions',
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({
    description: 'Message sent status',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  messageSent?: boolean;
}
