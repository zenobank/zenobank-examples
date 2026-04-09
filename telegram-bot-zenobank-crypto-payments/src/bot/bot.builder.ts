import { Markup } from "telegraf";
import { SubscriptionPlan } from "@prisma/client";
import { PLANS } from "../lib/plans";
import { CALLBACK } from "./bot.constants";
import { InlineKeyboardMarkup } from "telegraf/typings/core/types/typegram";

export const BotBuilder = {
  planSelectionKeyboard(): Markup.Markup<InlineKeyboardMarkup> {
    return Markup.inlineKeyboard([
      [
        Markup.button.callback(
          PLANS.MONTHLY.label,
          CALLBACK.plan(SubscriptionPlan.MONTHLY)
        ),
      ],
      [
        Markup.button.callback(
          PLANS.YEARLY.label,
          CALLBACK.plan(SubscriptionPlan.YEARLY)
        ),
      ],
    ]);
  },

  paymentLinkKeyboard(url: string): Markup.Markup<InlineKeyboardMarkup> {
    return Markup.inlineKeyboard([
      [Markup.button.url("Complete Payment", url)],
    ]);
  },

  renewButtonKeyboard(
    plan: SubscriptionPlan
  ): Markup.Markup<InlineKeyboardMarkup> {
    return Markup.inlineKeyboard([
      [Markup.button.callback("Renew", CALLBACK.plan(plan))],
    ]);
  },
};
