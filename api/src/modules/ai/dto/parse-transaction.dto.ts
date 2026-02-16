import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  MinLength,
  MaxLength,
  IsOptional,
  IsIn,
} from 'class-validator';

export class ParseTransactionDto {
  @ApiProperty({
    description: 'Natural language input describing the transaction',
    example:
      '1 ramo 12 rosas perlas y mariposas total $20.00 transferencia mila',
    minLength: 3,
    maxLength: 600,
  })
  @IsString()
  @MinLength(3, { message: 'El prompt debe tener al menos 3 caracteres' })
  @MaxLength(600, { message: 'El prompt no puede exceder 600 caracteres' })
  prompt: string;

  @ApiPropertyOptional({
    description: 'Language for AI responses (es=Spanish, en=English)',
    example: 'es',
    default: 'es',
  })
  @IsOptional()
  @IsString()
  @IsIn(['es', 'en'])
  language?: 'es' | 'en';
}
