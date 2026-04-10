import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { SubscriptionsService } from "./subscriptions.service";
import { BotService } from "../bot/bot.service";
import { env } from "../lib/env";
import { sleep } from "src/lib/sleep";
import { ms } from "src/lib/ms";

@Injectable()
export class SubscriptionsCron {
  private readonly logger = new Logger(SubscriptionsCron.name);

  constructor(
    private readonly subscriptionsService: SubscriptionsService,
    private readonly botService: BotService
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleExpiredSubscriptions() {
    this.logger.log("Running expired subscriptions check...");

    const expired = await this.subscriptionsService.getExpiredSubscriptions();

    if (expired.length === 0) {
      this.logger.log("No expired subscriptions found");
      return;
    }

    this.logger.log(`Found ${expired.length} expired subscriptions`);

    for (const subscription of expired) {
      const telegramId = Number(subscription.user.telegramId);

      await this.botService.kickMember({
        groupChatId: env.GROUP_CHAT_ID,
        userId: telegramId,
      });

      await this.subscriptionsService.markExpired(subscription.id);

      await this.botService.sendMessage({
        chatId: telegramId,
        text: "Your subscription has expired and you have been removed from the group.\n\nUse /start to renew your subscription.",
      });

      await sleep(ms("0.1s")); // avoid telegram rate limiting
    }
  }

}
