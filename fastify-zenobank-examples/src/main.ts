import Fastify from "fastify";
import { env } from "./env.js";
import { ordersRoutes } from "./orders/orders.routes.js";
import { zenoBankWebhookRoutes } from "./zenobank/zenobank-webhook.routes.js";

const fastify = Fastify({ logger: true });

await fastify.register(zenoBankWebhookRoutes);
await fastify.register(ordersRoutes);

try {
  await fastify.listen({ port: Number(env.PORT), host: "0.0.0.0" });
} catch (err) {
  fastify.log.error(err);
  process.exit(1);
}
