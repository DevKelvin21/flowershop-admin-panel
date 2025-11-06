import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';


@Injectable()
export class AppService {
  constructor(private prisma: PrismaService) {}

  async getHealth(): Promise<string> {
    const userCount = await this.prisma.user.count();
    return `OK from API - Users: ${userCount}`;
  }
}
