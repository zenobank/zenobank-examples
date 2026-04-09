import { Module } from "@nestjs/common";
import { PaymentsWebhooksController } from "./payments-webhooks.controller";
import { PaymentsWebhooksService } from "./payments-webhooks.service";
import { SubscriptionsModule } from "../../subscriptions/subscriptions.module";
import { BotModule } from "../../bot/bot.module";

@Module({
  imports: [SubscriptionsModule, BotModule],
  controllers: [PaymentsWebhooksController],
  providers: [PaymentsWebhooksService],
})
export class PaymentsWebhooksModule {}
