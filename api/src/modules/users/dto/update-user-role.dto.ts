import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { IsEnum } from 'class-validator';

export class UpdateUserRoleDto {
  @ApiProperty({
    description: 'New role for the user',
    enum: UserRole,
    example: UserRole.STAFF,
  })
  @IsEnum(UserRole)
  role: UserRole;
}
