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
      { command: "start", description: "🚀 Subscribe to the group" },
      { command: "status", description: "📊 Check your subscription" },
      { command: "help", description: "💡 Show help message" },
    ]);
  }

  @Start()
  async onStart(@Ctx() ctx: Context) {
    await ctx.reply(
      "👋 <b>Welcome!</b>\n\n✨ Pick a plan below to unlock access to our exclusive group:",
      {
        parse_mode: "HTML",
        ...BotBuilder.planSelectionKeyboard(),
      }
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
        "💳 <b>Almost there!</b>\n\n🔐 Tap the button below to complete your secure crypto payment:",
        {
          parse_mode: "HTML",
          ...BotBuilder.paymentLinkKeyboard(checkout.checkoutUrl),
        }
      );
    } catch (error: any) {
      this.logger.error(`Checkout creation failed: ${error.message}`);
      await ctx.reply(
        "⚠️ <b>Oops!</b> Something went wrong creating your checkout.\n\n🔄 Please try again with /start.",
        { parse_mode: "HTML" }
      );
    }
  }

  @Help()
  async onHelp(@Ctx() ctx: Context) {
    await ctx.reply(
      "💡 <b>Available commands</b>\n\n🚀 /start — Subscribe to the group\n📊 /status — Check your subscription\n❓ /help — Show this message",
      { parse_mode: "HTML" }
    );
  }
}
