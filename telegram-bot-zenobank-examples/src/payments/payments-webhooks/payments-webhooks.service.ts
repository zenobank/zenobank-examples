import { Injectable, Logger } from "@nestjs/common";
import { WebhookEvent as ZenobankWebhookEvent } from "@zenobank/sdk";
import { Payment, PaymentStatus } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import { SubscriptionsService } from "../../subscriptions/subscriptions.service";
import { BotService } from "../../bot/bot.service";
import { env } from "../../lib/env";
import { isCheckoutCompleted } from "./payments.utils";

@Injectable()
export class PaymentsWebhooksService {
  private readonly logger = new Logger(PaymentsWebhooksService.name);

  constructor(
    private readonly db: PrismaService,
    private readonly subscriptionsService: SubscriptionsService,
    private readonly botService: BotService
  ) {}

  async handleWebhook(webhook: ZenobankWebhookEvent) {
    const payment = await this.subscriptionsService.findPaymentByCheckoutId(
      webhook.data.id
    );

    if (!payment) {
      this.logger.warn(`No payment found for checkout ${webhook.data.id}`);
      return;
    }

    if (isCheckoutCompleted(payment)) {
      this.logger.log(`Payment ${webhook.data.id} already completed, skipping`);
      return;
    }

    if (webhook.type === "checkout.expired") {
      await this.handleCheckoutExpired(payment);
      return;
    }

    if (webhook.type === "checkout.completed") {
      await this.handleCheckoutCompleted(payment);
      return;
    }
  }

  private async handleCheckoutExpired(payment: Payment) {
    await this.db.payment.update({
      where: { id: payment.id },
      data: { status: PaymentStatus.CANCELLED },
    });
  }

  private async handleCheckoutCompleted(payment: Payment) {
    await this.db.payment.update({
      where: { id: payment.id },
      data: { status: PaymentStatus.COMPLETED },
    });

    const extended = await this.subscriptionsService.extendSubscription(
      payment.subscriptionId,
      payment.plan
    );
    const telegramId = Number(extended.user.telegramId);

    try {
      const isMember = await this.botService.isGroupMember({
        groupChatId: env.GROUP_CHAT_ID,
        userId: telegramId,
      });

      const expiresOn = extended.endDate.toISOString().split("T")[0];

      if (isMember) {
        await this.botService.sendMessage({
          chatId: telegramId,
          text: `🎉 <b>Payment received!</b>\n\n✅ Your access has been extended.\n📅 Expires: <b>${expiresOn}</b>\n\n👥 You're already in the group — enjoy! 🚀`,
        });
      } else {
        const inviteLink = await this.botService.createInviteLink({
          groupChatId: env.GROUP_CHAT_ID,
        });
        await this.botService.sendMessage({
          chatId: telegramId,
          text: `🎉 <b>Payment received!</b>\n\n🔗 Here's your exclusive invite link:\n${inviteLink.invite_link}\n\n📅 Expires: <b>${expiresOn}</b>\n⚠️ This link can only be used once.\n\nWelcome aboard! 🚀`,
        });
      }
    } catch (error: unknown) {
      this.logger.error(
        `Failed to send invite link to user ${telegramId}: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }
}
