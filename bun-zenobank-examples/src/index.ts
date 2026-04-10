import { env } from "./env.ts";
import { json } from "./http.ts";
import { handleCreateOrder, handleGetOrder } from "./orders-handler.ts";
import { handleWebhook } from "./zenobank-webhook-handler.ts";

const server = Bun.serve({
  port: Number(env.PORT),
  async fetch(req) {
    const { pathname } = new URL(req.url);

    try {
      if (req.method === "POST" && pathname === "/webhooks/zenobank") {
        return await handleWebhook(req);
      }

      if (req.method === "POST" && pathname === "/orders") {
        return await handleCreateOrder(req);
      }

      const orderMatch = pathname.match(/^\/orders\/([^/]+)$/);
      if (req.method === "GET" && orderMatch) {
        return handleGetOrder(orderMatch[1]!);
      }

      return json({ message: "Not found" }, 404);
    } catch (err) {
      console.error(err);
      return json({ message: "Internal server error" }, 500);
    }
  },
});

console.log(`Server running on port ${server.port}`);
