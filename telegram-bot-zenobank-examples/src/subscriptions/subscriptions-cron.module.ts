import { Module } from "@nestjs/common";
import { SubscriptionsCron } from "./subscriptions.cron";
import { SubscriptionsModule } from "./subscriptions.module";
import { BotModule } from "../bot/bot.module";

@Module({
  imports: [SubscriptionsModule, BotModule],
  providers: [SubscriptionsCron],
})
export class SubscriptionsCronModule {}
