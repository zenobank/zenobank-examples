import { SubscriptionPlan } from "@prisma/client";

export interface PlanConfig {
  plan: SubscriptionPlan;
  label: string;
  days: number;
  price: string;
  currency: string;
}
