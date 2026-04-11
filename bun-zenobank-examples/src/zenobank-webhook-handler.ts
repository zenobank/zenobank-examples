import type { WebhookEvent } from "@zenobank/sdk";
import { env } from "./env.ts";
import { zenoBank } from "./zenobank.ts";
import { findOrder, updateOrder } from "./orders-store.ts";
import { json } from "./http.ts";

export async function handleWebhook(req: Request): Promise<Response> {
  const rawBody = await req.text();

  try {
    zenoBank.webhooks.verify({
      secret: env.ZENOBANK_WEBHOOK_SECRET,
      rawBody,
      headers: Object.fromEntries(req.headers.entries()),
    });
  } catch (err) {
    console.warn(`[webhook] signature verification failed: ${err}`);
    return json({ message: "Invalid webhook signature" }, 401);
  }

  const event: WebhookEvent = JSON.parse(rawBody);
  console.log(`[webhook] received ${event.type} for order ${event.data.orderId}`);

  const order = findOrder(event.data.orderId);
  if (!order) {
    console.warn(`[webhook] order ${event.data.orderId} not found`);
    return json({ message: "Order not found" }, 404);
  }

  if (event.type === "checkout.completed") {
    updateOrder(order.id, { status: "PAID", paidAt: new Date() });
    console.log(`[webhook] order ${order.id} marked PAID`);
  } else if (event.type === "checkout.expired") {
    updateOrder(order.id, { status: "CANCELLED" });
    console.log(`[webhook] order ${order.id} marked CANCELLED`);
  } else {
    console.log(`[webhook] unhandled event type ${event.type}`);
  }

  return json({ received: true });
}
