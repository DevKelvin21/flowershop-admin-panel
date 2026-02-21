import { Body, Controller, Get, Param, Patch, Query } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import {
  CurrentUser,
  type FirebaseUser,
} from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { AuditLog } from '../../common/decorators/audit-log.decorator';
import { UsersService } from './users.service';
import { UsersQueryDto } from './dto/users-query.dto';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';

@ApiTags('Users')
@Controller({ path: 'users', version: '1' })
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ApiOperation({
    summary: 'Get current authenticated app user',
    description:
      'Returns the app user profile resolved from Firebase token identity.',
  })
  @ApiResponse({
    status: 200,
    description: 'Resolved app user profile',
  })
  getMe(@CurrentUser() user: FirebaseUser) {
    return this.usersService.resolveCurrentUser(user);
  }

  @Get()
  @Roles(UserRole.OWNER)
  @ApiOperation({
    summary: 'List users',
    description: 'Owner-only paginated users listing with optional filters.',
  })
  @ApiResponse({
    status: 200,
    description: 'Paginated users list',
  })
  findAll(@Query() query: UsersQueryDto) {
    return this.usersService.findAll(query);
  }

  @Patch(':id/role')
  @Roles(UserRole.OWNER)
  @AuditLog('UPDATE_USER_ROLE', 'AppUser')
  @ApiOperation({
    summary: 'Update user role',
    description: 'Owner-only role update for a specific app user.',
  })
  @ApiParam({ name: 'id', description: 'App user ID' })
  @ApiResponse({
    status: 200,
    description: 'User role updated',
  })
  updateRole(@Param('id') id: string, @Body() dto: UpdateUserRoleDto) {
    return this.usersService.updateRole(id, dto.role);
  }
}
