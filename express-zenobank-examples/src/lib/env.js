require('dotenv/config');
const { z } = require('zod');

const envSchema = z.object({
  PORT: z.string().default('3000'),
  ZENOBANK_API_KEY: z.string(),
  ZENOBANK_WEBHOOK_SECRET: z.string(),
});

const env = envSchema.parse(process.env);

module.exports = { env };
