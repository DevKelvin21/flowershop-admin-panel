import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, UserRole } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import type { FirebaseUser } from '../../common/decorators/current-user.decorator';
import type { UsersQueryDto } from './dto/users-query.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async resolveCurrentUser(firebaseUser: FirebaseUser) {
    const normalizedEmail = this.resolveEmail(firebaseUser);
    const normalizedUid = firebaseUser.uid || null;

    const existing = await this.prisma.appUser.findFirst({
      where: {
        OR: [
          { email: normalizedEmail },
          ...(normalizedUid ? [{ firebaseUid: normalizedUid }] : []),
        ],
      },
    });

    if (existing) {
      const shouldUpdate =
        existing.email !== normalizedEmail ||
        existing.firebaseUid !== normalizedUid ||
        existing.displayName !== (firebaseUser.name ?? null);

      if (!shouldUpdate) {
        return existing;
      }

      return this.prisma.appUser.update({
        where: { id: existing.id },
        data: {
          email: normalizedEmail,
          firebaseUid: normalizedUid,
          displayName: firebaseUser.name ?? null,
        },
      });
    }

    const usersCount = await this.prisma.appUser.count();
    const role = usersCount === 0 ? UserRole.OWNER : UserRole.STAFF;

    return this.prisma.appUser.create({
      data: {
        email: normalizedEmail,
        firebaseUid: normalizedUid,
        displayName: firebaseUser.name ?? null,
        role,
      },
    });
  }

  async findAll(query: UsersQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: Prisma.AppUserWhereInput = {};
    if (query.email) {
      where.email = {
        contains: query.email,
        mode: 'insensitive',
      };
    }
    if (query.role) {
      where.role = query.role;
    }

    const [data, total] = await Promise.all([
      this.prisma.appUser.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ role: 'asc' }, { email: 'asc' }],
      }),
      this.prisma.appUser.count({ where }),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async updateRole(id: string, nextRole: UserRole) {
    const user = await this.prisma.appUser.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`User with id "${id}" not found`);
    }

    if (user.role === UserRole.OWNER && nextRole !== UserRole.OWNER) {
      const ownerCount = await this.prisma.appUser.count({
        where: { role: UserRole.OWNER, isActive: true },
      });

      if (ownerCount <= 1) {
        throw new BadRequestException(
          'Cannot change role for the last active owner',
        );
      }
    }

    return this.prisma.appUser.update({
      where: { id },
      data: {
        role: nextRole,
      },
    });
  }

  private resolveEmail(firebaseUser: FirebaseUser): string {
    const email = firebaseUser.email?.trim().toLowerCase();
    if (email) return email;
    return `${firebaseUser.uid}@local.user`;
  }
}
