import { Logger, OnModuleInit } from "@nestjs/common";
import { Update, Start, Help, Ctx, Action, InjectBot } from "nestjs-telegraf";
import { Context, Telegraf } from "telegraf";
import { SubscriptionPlan } from "@prisma/client";
import { SubscriptionsService } from "../subscriptions/subscriptions.service";
import { PaymentsService } from "../payments/payments.service";
import { PLANS } from "../lib/plans";
import { BotBuilder } from "./bot.builder";
import { ACTION_PATTERN_REGEX } from "./bot.constants";

@Update()
export class BotUpdate implements OnModuleInit {
  private readonly logger = new Logger(BotUpdate.name);

  constructor(
    @InjectBot() private readonly bot: Telegraf,
    private readonly subscriptionsService: SubscriptionsService,
    private readonly paymentsService: PaymentsService
  ) {}

  async onModuleInit() {
    await this.bot.telegram.setMyCommands([
      { command: "start", description: "Subscribe to the group" },
      { command: "status", description: "Check your subscription" },
      { command: "help", description: "Show this message" },
    ]);
  }

  @Start()
  async onStart(@Ctx() ctx: Context) {
    await ctx.reply(
      "Welcome! Choose a subscription plan to join the group:",
      BotBuilder.planSelectionKeyboard()
    );
  }

  @Action(ACTION_PATTERN_REGEX.PLAN_SELECT)
  async onPlanSelect(@Ctx() ctx: Context) {
    const callbackData = (ctx.callbackQuery as any).data as string;
    const plan = callbackData.replace("plan_", "") as SubscriptionPlan;

    await ctx.answerCbQuery();

    try {
      const from = ctx.from!;
      const telegramId = BigInt(from.id);
      const user = await this.subscriptionsService.findOrCreateUser(
        telegramId,
        from.username,
        from.first_name
      );

      const orderId = `sub_${Date.now()}_${user.uid}`;
      const checkout = await this.paymentsService.createCheckout(plan, orderId);

      await this.subscriptionsService.createPendingPayment(
        user.uid,
        plan,
        checkout.id
      );

      await ctx.reply(
        "Pay here to get access:",
        BotBuilder.paymentLinkKeyboard(checkout.checkoutUrl)
      );
    } catch (error: any) {
      this.logger.error(`Checkout creation failed: ${error.message}`);
      await ctx.reply(
        "Something went wrong creating your checkout. Please try again with /start."
      );
    }
  }

  @Help()
  async onHelp(@Ctx() ctx: Context) {
    await ctx.reply(
      "Available commands:\n\n/start - Subscribe to the group\n/status - Check your subscription\n/help - Show this message"
    );
  }
}
