import { SetMetadata } from '@nestjs/common';
import { IS_PUBLIC_KEY } from '../guards/firebase-auth.guard';

/**
 * Marks a route as public (no authentication required)
 *
 * @example
 * @Public()
 * @Get('health')
 * healthCheck() {
 *   return { status: 'ok' };
 * }
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
