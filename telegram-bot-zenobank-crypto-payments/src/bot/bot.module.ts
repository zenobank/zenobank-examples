import { Module } from "@nestjs/common";
import { TelegrafModule } from "nestjs-telegraf";
import { BotUpdate } from "./bot.update";
import { BotService } from "./bot.service";
import { SubscriptionsModule } from "../subscriptions/subscriptions.module";
import { PaymentsModule } from "../payments/payments.module";
import { env } from "../lib/env";

@Module({
  imports: [
    TelegrafModule.forRoot({
      token: env.BOT_TOKEN,
    }),
    SubscriptionsModule,
    PaymentsModule,
  ],
  providers: [BotUpdate, BotService],
  exports: [BotService],
})
export class BotModule {}
