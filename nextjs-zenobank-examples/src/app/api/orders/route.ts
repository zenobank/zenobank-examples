import { z } from "zod";
import { ZenoBankError } from "@zenobank/sdk";
import { zenobank } from "@/lib/zenobank";
import { Database } from "@/lib/database";
import { createLogger } from "@/lib/log";

const log = createLogger("api/orders");

const CreateOrderSchema = z.object({
  amount: z
    .string()
    .refine((v) => Number(v) > 0, "amount must be a positive number"),
  currency: z.string().min(1),
});

export async function POST(request: Request) {
  log.info("POST /api/orders");
  const parsed = CreateOrderSchema.safeParse(await request.json().catch(() => null));

  if (!parsed.success) {
    log.warn("invalid request body", z.treeifyError(parsed.error));
    return Response.json(
      { error: "Invalid request", details: z.treeifyError(parsed.error) },
      { status: 400 }
    );
  }

  const { amount, currency } = parsed.data;
  const order = Database.createOrder({ amount, currency });
  log.info("order created", { id: order.id, amount, currency });

  try {
    const checkout = await zenobank.checkouts.create({
      orderId: order.id,
      priceAmount: amount,
      priceCurrency: currency,
      successRedirectUrl: null,
    });
    log.success("checkout created", {
      orderId: order.id,
      checkoutUrl: checkout.checkoutUrl,
    });

    const updated = Database.updateOrder(order.id, {
      checkoutUrl: checkout.checkoutUrl,
    });

    return Response.json(updated, { status: 201 });
  } catch (err) {
    log.error("failed to create Zenobank checkout", { orderId: order.id, err });

    if (err instanceof ZenoBankError) {
      return Response.json(
        { error: err.message, details: err.body },
        { status: err.status }
      );
    }

    return Response.json(
      {
        error:
          err instanceof Error ? err.message : "Failed to create checkout",
      },
      { status: 502 }
    );
  }
}
