import type { FastifyPluginAsync } from 'fastify';
import type { WebhookEvent } from '@zenobank/sdk';
import { env } from '../env.js';
import { zenoBank } from './zenobank.client.js';
import { getOrder, updateOrder } from '../orders/orders.store.js';

declare module 'fastify' {
  interface FastifyRequest {
    rawBody?: Buffer;
  }
}

export const zenoBankWebhookRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.addContentTypeParser(
    'application/json',
    { parseAs: 'buffer' },
    (request, body, done) => {
      const buf = body as Buffer;
      request.rawBody = buf;
      try {
        const json = buf.length ? JSON.parse(buf.toString('utf8')) : {};
        done(null, json);
      } catch (err) {
        done(err as Error, undefined);
      }
    },
  );

  fastify.post('/webhooks/zenobank', async (request, reply) => {
    request.log.info('Received ZenoBank webhook');

    if (!request.rawBody) {
      request.log.warn('Webhook request missing raw body');
      return reply.status(401).send({ message: 'Missing raw body' });
    }

    try {
      zenoBank.webhooks.verify({
        secret: env.ZENOBANK_WEBHOOK_SECRET,
        rawBody: request.rawBody,
        headers: request.headers,
      });
      request.log.info('Webhook signature verified');
    } catch (err) {
      request.log.warn(`Webhook signature verification failed: ${err}`);
      return reply.status(401).send({ message: 'Invalid webhook signature' });
    }

    const event = request.body as WebhookEvent;
    request.log.info(
      { eventType: event.type, orderId: event.data.orderId },
      'Processing webhook event',
    );

    const order = getOrder(event.data.orderId);
    if (!order) {
      request.log.warn(
        { orderId: event.data.orderId },
        'Order not found for webhook',
      );
      return reply.status(404).send({ message: 'Order not found' });
    }

    if (event.type === 'checkout.completed') {
      updateOrder(order.id, { status: 'PAID', paidAt: new Date() });
      request.log.info({ orderId: order.id }, 'Order marked as PAID');
    } else if (event.type === 'checkout.expired') {
      updateOrder(order.id, { status: 'CANCELLED' });
      request.log.info({ orderId: order.id }, 'Order marked as CANCELLED');
    } else {
      request.log.info(
        { eventType: event.type },
        'Unhandled webhook event type',
      );
    }

    return { received: true };
  });
};
