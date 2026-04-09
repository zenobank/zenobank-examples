import { Controller, Post, Req, UseGuards } from '@nestjs/common';
import type { WebhookEvent as ZenoBankWebhookEvent } from '@zenobank/sdk';
import { PrismaService } from '../prisma/prisma.service';
import { OrderStatus } from '../../generated/prisma/enums.js';
import { ZenoBankSignatureGuard } from './zenobank-signature.guard';
import type { Request } from 'express';
import { Order } from 'generated/prisma/client';

@Controller('webhooks/zenobank')
export class ZenoBankWebhookController {
  constructor(private readonly db: PrismaService) {}

  @UseGuards(ZenoBankSignatureGuard)
  @Post()
  async handleWebhook(@Req() req: Request) {
    const event: ZenoBankWebhookEvent = req.body as ZenoBankWebhookEvent;

    const order = await this.db.order.findFirstOrThrow({
      where: {
        id: event.data.orderId,
      },
    });

    if (event.type === 'checkout.completed') {
      await this.handleCheckoutCompleted(order);
    } else if (event.type === 'checkout.expired') {
      await this.handleCheckoutExpired(order);
    }

    return { received: true };
  }

  private async handleCheckoutCompleted(order: Order) {
    await this.db.order.update({
      where: { id: order.id },
      data: { status: OrderStatus.PAID, paidAt: new Date() },
    });
  }

  private async handleCheckoutExpired(order: Order) {
    await this.db.order.update({
      where: { id: order.id },
      data: { status: OrderStatus.CANCELLED },
    });
  }
}
