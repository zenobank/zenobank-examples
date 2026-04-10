import { zenobank } from "@/lib/zenobank";
import { env } from "@/lib/env";
import { getOrder, updateOrder } from "@/lib/orders";

export async function POST(request: Request) {
  const rawBody = await request.text();

  const headers: Record<string, string> = {};
  request.headers.forEach((value, key) => {
    headers[key] = value;
  });

  try {
    zenobank.webhooks.verifyWebhook({
      secret: env.ZENOBANK_WEBHOOK_SECRET,
      rawBody,
      headers,
    });
  } catch {
    return Response.json(
      { error: "Invalid webhook signature" },
      { status: 401 }
    );
  }

  const event = JSON.parse(rawBody);
  const order = getOrder(event.data.orderId);

  if (!order) {
    return Response.json({ error: "Order not found" }, { status: 404 });
  }

  if (event.type === "checkout.completed") {
    updateOrder(order.id, {
      status: "PAID",
      paidAt: new Date().toISOString(),
    });
  } else if (event.type === "checkout.expired") {
    updateOrder(order.id, { status: "CANCELLED" });
  }

  return Response.json({ received: true });
}
