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
