import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';

export interface FirebaseUser {
  uid: string;
  email?: string;
  emailVerified?: boolean;
  name?: string;
  picture?: string;
}

export interface AuthenticatedRequest extends Request {
  user?: FirebaseUser;
}

/**
 * Extracts the current authenticated user from the request
 *
 * @example
 * @Get('profile')
 * getProfile(@CurrentUser() user: FirebaseUser) {
 *   return { user };
 * }
 */
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): FirebaseUser => {
    const request = ctx.switchToHttp().getRequest<AuthenticatedRequest>();
    return request.user as FirebaseUser;
  },
);
