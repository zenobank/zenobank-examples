import { zenobank } from "@/lib/zenobank";
import { createOrder, updateOrder } from "@/lib/orders";

export async function POST(request: Request) {
  const body = await request.json();

  const amount = body.amount;
  const currency = body.currency;

  if (!amount || !currency) {
    return Response.json(
      { error: "amount and currency are required" },
      { status: 400 }
    );
  }

  if (typeof amount !== "string" || Number.isNaN(Number(amount)) || Number(amount) <= 0) {
    return Response.json(
      { error: "amount must be a positive number string" },
      { status: 400 }
    );
  }

  const order = createOrder({ amount, currency });

  const checkout = await zenobank.checkouts.create({
    orderId: order.id,
    priceAmount: amount,
    priceCurrency: currency,
    successRedirectUrl: null,
  });

  const updated = updateOrder(order.id, {
    checkoutUrl: checkout.checkoutUrl,
  });

  return Response.json(updated, { status: 201 });
}
