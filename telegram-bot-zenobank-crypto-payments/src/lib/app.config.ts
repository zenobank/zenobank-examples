import { SubscriptionPlan } from "@prisma/client";
import { PlanConfig } from "./plans";

export const PLANS: Record<SubscriptionPlan, PlanConfig> = {
  MONTHLY: {
    plan: SubscriptionPlan.MONTHLY,
    label: "30 Days - $69",
    days: 30,
    price: "69.00",
    currency: "USD",
  },
  YEARLY: {
    plan: SubscriptionPlan.YEARLY,
    label: "365 Days - $197",
    days: 365,
    price: "197.00",
    currency: "USD",
  },
};
