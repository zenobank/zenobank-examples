import { Module } from '@nestjs/common';
import { ZenoBankClient } from '@zenobank/sdk';
import { env } from '../lib/env';
import { ZenoBankWebhookController } from './zenobank-webhook.controller';
import { ZENOBANK_CLIENT } from './zenobank.constants';

@Module({
  controllers: [ZenoBankWebhookController],
  providers: [
    {
      provide: ZENOBANK_CLIENT,
      useFactory: () => new ZenoBankClient({ apiKey: env.ZENOBANK_API_KEY }),
    },
  ],
  exports: [ZENOBANK_CLIENT],
})
export class ZenoBankModule {}
