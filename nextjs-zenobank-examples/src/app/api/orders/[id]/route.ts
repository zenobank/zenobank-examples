import type { NextRequest } from "next/server";
import { getOrder } from "@/lib/orders";

export async function GET(
  _req: NextRequest,
  ctx: RouteContext<"/api/orders/[id]">
) {
  const { id } = await ctx.params;
  const order = getOrder(id);

  if (!order) {
    return Response.json({ error: "Order not found" }, { status: 404 });
  }

  return Response.json(order);
}
