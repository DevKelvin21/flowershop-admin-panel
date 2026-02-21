import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsObject, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateAuditEventDto {
  @ApiProperty({
    description: 'Audit action identifier',
    example: 'FE_LOGIN',
  })
  @IsString()
  @MinLength(1)
  action: string;

  @ApiPropertyOptional({
    description: 'Logical entity type for grouping events',
    example: 'FrontendAuth',
    default: 'Frontend',
  })
  @IsOptional()
  @IsString()
  entityType?: string;

  @ApiPropertyOptional({
    description: 'Optional related entity ID',
    example: 'clx123...',
  })
  @IsOptional()
  @IsString()
  entityId?: string;

  @ApiPropertyOptional({
    description: 'Human-readable event message',
    example: 'Usuario inició sesión: user@example.com',
  })
  @IsOptional()
  @IsString()
  message?: string;

  @ApiPropertyOptional({
    description: 'Additional event metadata',
    example: {
      operationType: 'login',
      source: 'web',
    },
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}
