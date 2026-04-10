import "server-only";
import type { Order } from "@/lib/types";

const orders = new Map<string, Order>();

export const Database = {
  createOrder(data: { amount: string; currency: string }): Order {
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
  },

  getOrder(id: string): Order | undefined {
    return orders.get(id);
  },

  updateOrder(
    id: string,
    data: Partial<Pick<Order, "status" | "checkoutUrl" | "paidAt">>
  ): Order {
    const order = orders.get(id);
    if (!order) throw new Error(`Order ${id} not found`);
    const updated = { ...order, ...data };
    orders.set(id, updated);
    return updated;
  },
};
