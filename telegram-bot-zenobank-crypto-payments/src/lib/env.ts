import { z } from "zod";
import "dotenv/config";

export const envSchema = z.object({
  BOT_TOKEN: z.string(),
  GROUP_CHAT_ID: z.string(),
  ZENOBANK_API_KEY: z.string(),
  ZENOBANK_WEBHOOK_SECRET: z.string(),
  DATABASE_URL: z.url(),
  ADMIN_TELEGRAM_IDS: z.string(),
  PORT: z.coerce.number().default(3000),
});

export const env = envSchema.parse(process.env);

export type Env = z.infer<typeof envSchema>;
