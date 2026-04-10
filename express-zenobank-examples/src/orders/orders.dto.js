const { z } = require('zod');

const createOrderSchema = z.object({
  amount: z
    .string()
    .refine((v) => /^\d+(\.\d+)?$/.test(v) && Number(v) > 0, {
      message: 'amount must be a positive number string',
    }),
  currency: z.string().length(3).toUpperCase(),
});

function toOrderResponse(order) {
  return {
    id: order.id,
    status: order.status,
    amount: order.amount,
    currency: order.currency,
    checkoutUrl: order.checkoutUrl,
  };
}

module.exports = { createOrderSchema, toOrderResponse };
