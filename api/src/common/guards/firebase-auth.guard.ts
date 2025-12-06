import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { getFirebaseAuth, isFirebaseInitialized } from '../../config/firebase.config';

export const IS_PUBLIC_KEY = 'isPublic';

@Injectable()
export class FirebaseAuthGuard implements CanActivate {
  private readonly logger = new Logger(FirebaseAuthGuard.name);

  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Check if route is marked as public
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    // If Firebase is not initialized, bypass auth (development mode)
    if (!isFirebaseInitialized()) {
      this.logger.warn(
        'Firebase not initialized - BYPASSING AUTH (development mode only!)',
      );
      // Attach mock user for development
      const request = context.switchToHttp().getRequest<Request>();
      (request as any).user = {
        uid: 'dev-user',
        email: 'dev@localhost',
        emailVerified: true,
        name: 'Development User',
        picture: null,
      };
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('No authentication token provided');
    }

    try {
      const auth = getFirebaseAuth();
      if (!auth) {
        throw new UnauthorizedException('Firebase Auth not available');
      }
      const decodedToken = await auth.verifyIdToken(token);

      // Attach user info to request object
      (request as any).user = {
        uid: decodedToken.uid,
        email: decodedToken.email,
        emailVerified: decodedToken.email_verified,
        name: decodedToken.name,
        picture: decodedToken.picture,
      };

      return true;
    } catch (error) {
      this.logger.error('Token verification failed:', error);

      if (error.code === 'auth/id-token-expired') {
        throw new UnauthorizedException('Authentication token has expired');
      }

      if (error.code === 'auth/argument-error') {
        throw new UnauthorizedException('Invalid authentication token format');
      }

      throw new UnauthorizedException('Invalid authentication token');
    }
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      return undefined;
    }

    const [type, token] = authHeader.split(' ');

    return type === 'Bearer' ? token : undefined;
  }
}
