import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class UpdateTransactionDto {
  @ApiPropertyOptional({
    description: 'Customer name',
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
