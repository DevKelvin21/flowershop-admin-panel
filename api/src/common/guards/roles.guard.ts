import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { UserRole } from '@prisma/client';
import { type AuthenticatedRequest } from '../decorators/current-user.decorator';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { UsersService } from '../../modules/users/users.service';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly usersService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const firebaseUser = request.user;

    if (!firebaseUser) {
      throw new UnauthorizedException('No authenticated user in request');
    }

    const appUser = await this.usersService.resolveCurrentUser(firebaseUser);

    if (!appUser.isActive) {
      throw new ForbiddenException('User is inactive');
    }

    if (!requiredRoles.includes(appUser.role)) {
      throw new ForbiddenException('Insufficient role permissions');
    }

    return true;
  }
}
