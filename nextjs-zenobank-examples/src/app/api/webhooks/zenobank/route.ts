import { zenobank } from "@/lib/zenobank";
import { env } from "@/lib/env";
import { Database } from "@/lib/database";
import { WebhookEvent } from "@zenobank/sdk";

export async function POST(request: Request) {
  console.log("[webhooks/zenobank] POST received");
  const rawBody = await request.text();

  try {
    zenobank.webhooks.verifyWebhook({
      secret: env.ZENOBANK_WEBHOOK_SECRET,
      rawBody,
      headers: Object.fromEntries(request.headers),
    });
  } catch (err) {
    console.warn("[webhooks/zenobank] invalid signature", err);
    return Response.json(
      { error: "Invalid webhook signature" },
      { status: 401 }
    );
  }

  const event: WebhookEvent = JSON.parse(rawBody);
  console.log("[webhooks/zenobank] event verified", {
    type: event.type,
    orderId: event.data.orderId,
  });

  const order = Database.getOrder(event.data.orderId);

  if (!order) {
    console.warn("[webhooks/zenobank] order not found", {
      orderId: event.data.orderId,
    });
    return Response.json({ error: "Order not found" }, { status: 404 });
  }

  if (event.type === "checkout.completed") {
    Database.updateOrder(order.id, {
      status: "PAID",
      paidAt: new Date().toISOString(),
    });
    console.log("[webhooks/zenobank] order marked PAID", { orderId: order.id });
  } else if (event.type === "checkout.expired") {
    Database.updateOrder(order.id, { status: "CANCELLED" });
    console.log("[webhooks/zenobank] order marked CANCELLED", {
      orderId: order.id,
    });
  } else {
    console.log("[webhooks/zenobank] unhandled event type", { type: event.type });
  }

  return Response.json({ received: true });
}
