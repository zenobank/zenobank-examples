const { Router } = require('express');
const { rawJson, verifySignature } = require('../zenobank/verify-signature.middleware');
const ordersService = require('../orders/orders.service');
const logger = require('../lib/logger').create('zenobank:webhook');

const router = Router();

const handlers = {
  'checkout.completed': (event) => {
    const order = ordersService.markPaid(event.data.orderId);
    logger.info(`order ${order.id} marked PAID`);
  },
  'checkout.expired': (event) => {
    const order = ordersService.markCancelled(event.data.orderId);
    logger.info(`order ${order.id} marked CANCELLED`);
  },
};

router.post('/', rawJson, verifySignature, (req, res) => {
  const event = req.event;
  logger.info(`received event type=${event.type} orderId=${event.data?.orderId}`);

  const handler = handlers[event.type];
  if (handler) {
    handler(event);
  } else {
    logger.warn(`unhandled event type=${event.type}`);
  }

  res.json({ received: true });
});

module.exports = router;
