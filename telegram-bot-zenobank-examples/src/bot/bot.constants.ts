import { SubscriptionPlan } from "@prisma/client";

export const CALLBACK = {
  plan: (plan: SubscriptionPlan) => `plan_${plan}`,
} as const;

const plans = Object.values(SubscriptionPlan).join("|");

export const ACTION_PATTERN_REGEX = {
  PLAN_SELECT: new RegExp(`^plan_(${plans})$`),
};
