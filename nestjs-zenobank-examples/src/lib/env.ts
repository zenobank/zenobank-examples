import 'dotenv/config';

import { z } from 'zod';

export const envSchema = z.object({
  PORT: z.string().default('3000'),
  DATABASE_URL: z.string(),
  ZENOBANK_API_KEY: z.string(),
  ZENOBANK_WEBHOOK_SECRET: z.string(),
});

export const env = envSchema.parse(process.env);

export type Env = z.infer<typeof envSchema>;
