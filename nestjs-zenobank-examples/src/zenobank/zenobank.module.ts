import { Module } from '@nestjs/common';
import { ZenobankClient } from '@zenobank/sdk';
import { env } from '../lib/env';
import { ZenoBankWebhookController } from './zenobank-webhook.controller';

export const ZENOBANK_CLIENT = Symbol('ZENOBANK_CLIENT');

@Module({
  controllers: [ZenoBankWebhookController],
  providers: [
    {
      provide: ZENOBANK_CLIENT,
      useFactory: () => new ZenobankClient({ apiKey: env.ZENOBANK_API_KEY }),
    },
  ],
  exports: [ZENOBANK_CLIENT],
})
export class ZenoBankModule {}
