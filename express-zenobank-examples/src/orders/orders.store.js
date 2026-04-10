const { randomUUID } = require('crypto');

const OrderStatus = Object.freeze({
  PENDING: 'PENDING',
  PAID: 'PAID',
  CANCELLED: 'CANCELLED',
});

const orders = new Map();

function insert({ amount, currency }) {
  const now = new Date();
  const order = {
    id: randomUUID(),
    status: OrderStatus.PENDING,
    amount,
    currency,
    checkoutUrl: null,
    paidAt: null,
    createdAt: now,
    updatedAt: now,
  };
  orders.set(order.id, order);
  return order;
}

function update(id, patch) {
  const order = orders.get(id);
  if (!order) return null;
  Object.assign(order, patch, { updatedAt: new Date() });
  return order;
}

function findById(id) {
  return orders.get(id) ?? null;
}

module.exports = { OrderStatus, insert, update, findById };
