import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { ZenoBankModule } from '../zenobank/zenobank.module';

@Module({
  imports: [ZenoBankModule],
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrdersModule {}
