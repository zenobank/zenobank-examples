const required = ['ZENOBANK_API_KEY', 'ZENOBANK_WEBHOOK_SECRET'] as const;

for (const key of required) {
  if (!Bun.env[key]) {
    throw new Error(`Missing required env var: ${key}`);
  }
}

export const env = {
  PORT: Bun.env.PORT ?? '3000',
  ZENOBANK_API_KEY: Bun.env.ZENOBANK_API_KEY!,
  ZENOBANK_WEBHOOK_SECRET: Bun.env.ZENOBANK_WEBHOOK_SECRET!,
};
