import { z } from "zod";
import { zenoBank } from "./zenobank.ts";
import { createOrder, updateOrder, findOrder, toDto } from "./orders-store.ts";
import { json } from "./http.ts";

const createOrderSchema = z.object({
  amount: z.string().refine((v) => /^\d+(\.\d+)?$/.test(v) && Number(v) > 0, {
    message: "amount must be a positive number string",
  }),
  currency: z.string().length(3),
});

export async function handleCreateOrder(req: Request): Promise<Response> {
  const parsed = createOrderSchema.safeParse(await req.json());
  if (!parsed.success) {
    return json({ message: "Validation failed", errors: parsed.error.issues }, 400);
  }

  const order = createOrder(parsed.data);

  const checkout = await zenoBank.checkouts.create({
    orderId: order.id,
    priceAmount: parsed.data.amount,
    priceCurrency: parsed.data.currency,
    successRedirectUrl: null,
  });

  const updated = updateOrder(order.id, { checkoutUrl: checkout.checkoutUrl });
  return json(toDto(updated), 201);
}

export function handleGetOrder(id: string): Response {
  const order = findOrder(id);
  if (!order) return json({ message: "Order not found" }, 404);
  return json(toDto(order));
}
