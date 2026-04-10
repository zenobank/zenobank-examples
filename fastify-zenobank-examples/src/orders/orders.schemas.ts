import { z } from 'zod';

export const createOrderSchema = z.object({
  amount: z
    .string()
    .refine((v) => /^\d+(\.\d+)?$/.test(v) && Number(v) > 0, {
      message: 'amount must be a positive number string',
    }),
  currency: z.string().length(3),
});

export type CreateOrderDto = z.infer<typeof createOrderSchema>;
