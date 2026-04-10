import { Module } from "@nestjs/common";
import { ScheduleModule } from "@nestjs/schedule";
import { ThrottlerModule } from "@nestjs/throttler";
import { PrismaModule } from "./prisma/prisma.module";
import { BotModule } from "./bot/bot.module";
import { PaymentsModule } from "./payments/payments.module";
import { SubscriptionsModule } from "./subscriptions/subscriptions.module";
import { SubscriptionsCronModule } from "./subscriptions/subscriptions-cron.module";
import { PaymentsWebhooksModule } from "./payments/payments-webhooks/payments-webhooks.module";

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 30 }]),
    PrismaModule,
    BotModule,
    PaymentsModule,
    PaymentsWebhooksModule,
    SubscriptionsModule,
    SubscriptionsCronModule,
  ],
})
export class AppModule {}
