import "server-only";

export type OrderStatus = "PENDING" | "PAID" | "CANCELLED";

export interface Order {
  id: string;
  status: OrderStatus;
  amount: string;
  currency: string;
  checkoutUrl: string | null;
  paidAt: string | null;
  createdAt: string;
}

const orders = new Map<string, Order>();

export function createOrder(data: {
  amount: string;
  currency: string;
}): Order {
  const order: Order = {
    id: crypto.randomUUID(),
    status: "PENDING",
    amount: data.amount,
    currency: data.currency,
    checkoutUrl: null,
    paidAt: null,
    createdAt: new Date().toISOString(),
  };
  orders.set(order.id, order);
  return order;
}

export function getOrder(id: string): Order | undefined {
  return orders.get(id);
}

export function updateOrder(
  id: string,
  data: Partial<Pick<Order, "status" | "checkoutUrl" | "paidAt">>
): Order {
  const order = orders.get(id);
  if (!order) throw new Error(`Order ${id} not found`);
  const updated = { ...order, ...data };
  orders.set(id, updated);
  return updated;
}
