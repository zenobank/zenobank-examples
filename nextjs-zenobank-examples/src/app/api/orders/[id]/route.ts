import type { NextRequest } from "next/server";
import { Database } from "@/lib/database";
import { createLogger } from "@/lib/log";

const log = createLogger("api/orders/:id");

export async function GET(
  _req: NextRequest,
  ctx: RouteContext<"/api/orders/[id]">
) {
  const { id } = await ctx.params;
  log.info("GET", { id });
  const order = Database.getOrder(id);

  if (!order) {
    log.warn("order not found", { id });
    return Response.json({ error: "Order not found" }, { status: 404 });
  }

  log.success("returning order", { id, status: order.status });
  return Response.json(order);
}
