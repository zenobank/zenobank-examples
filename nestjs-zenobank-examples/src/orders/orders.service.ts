import { Inject, Injectable } from '@nestjs/common';
import { ZenoBankClient } from '@zenobank/sdk';
import { ZENOBANK_CLIENT } from '../zenobank/zenobank.constants';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderResponseDto } from './dto/create-order-response.dto';
import { toDto } from 'src/lib/to-dto';

@Injectable()
export class OrdersService {
  constructor(
    @Inject(ZENOBANK_CLIENT) private readonly zenoBank: ZenoBankClient,
    private readonly db: PrismaService,
  ) {}

  async create(dto: CreateOrderDto): Promise<OrderResponseDto> {
    const order = await this.db.order.create({
      data: {
        amount: dto.amount,
        currency: dto.currency,
      },
    });

    const checkout = await this.zenoBank.checkouts.create({
      orderId: order.id,
      priceAmount: dto.amount,
      priceCurrency: dto.currency,
      successRedirectUrl: null,
    });

    const updatedOrder = await this.db.order.update({
      where: { id: order.id },
      data: { checkoutUrl: checkout.checkoutUrl },
    });

    return toDto(OrderResponseDto, updatedOrder);
  }

  async findOne(id: string): Promise<OrderResponseDto> {
    const order = await this.db.order.findUniqueOrThrow({ where: { id } });
    return toDto(OrderResponseDto, order);
  }
}
