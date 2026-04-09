import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { ZenoBankModule } from './zenobank/zenobank.module';
import { OrdersModule } from './orders/orders.module';

@Module({
  imports: [PrismaModule, ZenoBankModule, OrdersModule],
})
export class AppModule {}
