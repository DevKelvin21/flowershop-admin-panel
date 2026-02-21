import { Module } from '@nestjs/common';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { FirebaseAuthGuard } from './common/guards/firebase-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { AuditLogInterceptor } from './common/interceptors/audit-log.interceptor';
import { AuditModule } from './modules/audit/audit.module';
import { InventoryModule } from './modules/inventory/inventory.module';
import { TransactionsModule } from './modules/transactions/transactions.module';
import { AiModule } from './modules/ai/ai.module';
import { UsersModule } from './modules/users/users.module';
import { initializeFirebase } from './config/firebase.config';

// Initialize Firebase on module load
initializeFirebase();

@Module({
  imports: [
    PrismaModule,
    AuditModule,
    InventoryModule,
    TransactionsModule,
    AiModule,
    UsersModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: FirebaseAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditLogInterceptor,
    },
  ],
})
export class AppModule {}
