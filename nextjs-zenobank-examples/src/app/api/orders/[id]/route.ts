import type { NextRequest } from "next/server";
import { Database } from "@/lib/database";

export async function GET(
  _req: NextRequest,
  ctx: RouteContext<"/api/orders/[id]">
) {
  const { id } = await ctx.params;
  console.log("[api/orders/:id] GET", { id });
  const order = Database.getOrder(id);

  if (!order) {
    console.warn("[api/orders/:id] order not found", { id });
    return Response.json({ error: "Order not found" }, { status: 404 });
  }

  console.log("[api/orders/:id] returning order", { id, status: order.status });
  return Response.json(order);
}
