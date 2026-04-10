import { randomUUID } from 'crypto';

export type OrderStatus = 'PENDING' | 'PAID' | 'CANCELLED';

export interface Order {
  id: string;
  status: OrderStatus;
  amount: string;
  currency: string;
  checkoutUrl: string | null;
  paidAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderDto {
  id: string;
  status: OrderStatus;
  amount: string;
  currency: string;
  checkoutUrl: string | null;
}

const orders = new Map<string, Order>();

export function createOrder(data: { amount: string; currency: string }): Order {
  const now = new Date();
  const order: Order = {
    id: randomUUID(),
    status: 'PENDING',
    amount: data.amount,
    currency: data.currency,
    checkoutUrl: null,
    paidAt: null,
    createdAt: now,
    updatedAt: now,
  };
  orders.set(order.id, order);
  return order;
}

export function updateOrder(id: string, patch: Partial<Order>): Order | null {
  const order = orders.get(id);
  if (!order) return null;
  Object.assign(order, patch, { updatedAt: new Date() });
  return order;
}

export function findOrder(id: string): Order | null {
  return orders.get(id) ?? null;
}

export function toDto(order: Order): OrderDto {
  return {
    id: order.id,
    status: order.status,
    amount: order.amount,
    currency: order.currency,
    checkoutUrl: order.checkoutUrl,
  };
}
