import { SetMetadata } from '@nestjs/common';
import type { UserRole } from '@prisma/client';

export const ROLES_KEY = 'roles';

/**
 * Restrict route access to specific application roles.
 */
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
