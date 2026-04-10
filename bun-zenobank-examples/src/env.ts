import { z } from "zod";

const envSchema = z.object({
  PORT: z.string().default("3000"),
  ZENOBANK_API_KEY: z.string(),
  ZENOBANK_WEBHOOK_SECRET: z.string(),
});

export const env = envSchema.parse(Bun.env);
