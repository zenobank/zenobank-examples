import { Elysia, t } from "elysia";
import { env } from "./env.ts";
import { zenoBank } from "./zenobank.ts";
import { createOrder, updateOrder, findOrder, toDto } from "./orders-store.ts";
import { WebhookEvent } from "@zenobank/sdk";

const app = new Elysia()
  .onError(({ code, error, set }) => {
    if (code === "VALIDATION") {
      set.status = 400;
      return { message: "Validation failed", errors: error.all };
    }
    console.error(error);
    set.status = 500;
    return { message: "Internal server error" };
  })
  .post(
    "/orders",
    async ({ body, set }) => {
      const order = createOrder(body);

      const checkout = await zenoBank.checkouts.create({
        orderId: order.id,
        priceAmount: body.amount,
        priceCurrency: body.currency,
        successRedirectUrl: null,
      });

      const updated = updateOrder(order.id, {
        checkoutUrl: checkout.checkoutUrl,
      });

      set.status = 201;
      return toDto(updated!);
    },
    {
      body: t.Object({
        amount: t.String({
          pattern: "^\\d+(\\.\\d+)?$",
          error: "amount must be a positive number string",
        }),
        currency: t.String({ minLength: 3, maxLength: 3 }),
      }),
    }
  )
  .get(
    "/orders/:id",
    ({ params, set }) => {
      const order = findOrder(params.id);
      if (!order) {
        set.status = 404;
        return { message: "Order not found" };
      }
      return toDto(order);
    },
    {
      params: t.Object({ id: t.String() }),
    }
  )
  .post(
    "/webhooks/zenobank",
    async ({ request, set }) => {
      const rawBody = await request.text();

      try {
        zenoBank.webhooks.verify({
          secret: env.ZENOBANK_WEBHOOK_SECRET,
          rawBody,
          headers: Object.fromEntries(request.headers.entries()),
        });
      } catch (err) {
        console.warn(`Webhook signature verification failed: ${err}`);
        set.status = 401;
        return { message: "Invalid webhook signature" };
      }

      const event: WebhookEvent = JSON.parse(rawBody);
      const order = findOrder(event.data.orderId);
      if (!order) {
        set.status = 404;
        return { message: "Order not found" };
      }

      if (event.type === "checkout.completed") {
        updateOrder(order.id, { status: "PAID", paidAt: new Date() });
      } else if (event.type === "checkout.expired") {
        updateOrder(order.id, { status: "CANCELLED" });
      }

      return { received: true };
    },
    {
      parse: "none",
    }
  )
  .listen(Number(env.PORT));

console.log(`Server running on port ${app.server?.port}`);
