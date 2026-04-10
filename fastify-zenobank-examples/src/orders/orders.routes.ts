import type { FastifyPluginAsync } from 'fastify';
import { createOrderSchema } from './orders.schemas.js';
import {
  createOrder,
  getOrder,
  toOrderDto,
  updateOrder,
} from './orders.store.js';
import { zenoBank } from '../zenobank/zenobank.client.js';

export const ordersRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.post('/orders', async (request, reply) => {
    const parsed = createOrderSchema.safeParse(request.body);
    if (!parsed.success) {
      request.log.warn(
        { errors: parsed.error.issues },
        'Order validation failed',
      );
      return reply
        .status(400)
        .send({ message: 'Validation failed', errors: parsed.error.issues });
    }
    const dto = parsed.data;

    const order = createOrder(dto);
    request.log.info(
      { orderId: order.id, amount: dto.amount, currency: dto.currency },
      'Order created',
    );

    const checkout = await zenoBank.checkouts.create({
      orderId: order.id,
      priceAmount: dto.amount,
      priceCurrency: dto.currency,
      successRedirectUrl: null,
    });
    request.log.info(
      { orderId: order.id, checkoutUrl: checkout.checkoutUrl },
      'ZenoBank checkout created',
    );

    const updated = updateOrder(order.id, {
      checkoutUrl: checkout.checkoutUrl,
    })!;
    return reply.status(201).send(toOrderDto(updated));
  });

  fastify.get<{ Params: { id: string } }>(
    '/orders/:id',
    async (request, reply) => {
      const order = getOrder(request.params.id);
      if (!order) {
        request.log.warn({ orderId: request.params.id }, 'Order not found');
        return reply.status(404).send({ message: 'Order not found' });
      }
      return toOrderDto(order);
    },
  );
};
