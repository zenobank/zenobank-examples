import { z } from "zod";

const envSchema = z.object({
  ZENOBANK_API_KEY: z.string(),
  ZENOBANK_WEBHOOK_SECRET: z.string(),
});

export const env = envSchema.parse(process.env);
