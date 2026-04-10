const { zenoBank } = require('../zenobank/zenobank.client');
const ordersStore = require('./orders.store');
const { HttpError } = require('../lib/http-error');
const logger = require('../lib/logger').create('orders');

async function createOrder(dto) {
  const order = ordersStore.insert(dto);
  logger.info(`created order ${order.id} amount=${dto.amount} ${dto.currency}`);

  const checkout = await zenoBank.checkouts.create({
    orderId: order.id,
    priceAmount: dto.amount,
    priceCurrency: dto.currency,
    successRedirectUrl: null,
  });
  logger.info(`checkout created for order ${order.id} url=${checkout.checkoutUrl}`);

  return ordersStore.update(order.id, { checkoutUrl: checkout.checkoutUrl });
}

function getOrder(id) {
  const order = ordersStore.findById(id);
  if (!order) throw new HttpError(404, 'Order not found');
  return order;
}

function markPaid(id) {
  const order = ordersStore.update(id, {
    status: ordersStore.OrderStatus.PAID,
    paidAt: new Date(),
  });
  if (!order) throw new HttpError(404, 'Order not found');
  return order;
}

function markCancelled(id) {
  const order = ordersStore.update(id, {
    status: ordersStore.OrderStatus.CANCELLED,
  });
  if (!order) throw new HttpError(404, 'Order not found');
  return order;
}

module.exports = { createOrder, getOrder, markPaid, markCancelled };
