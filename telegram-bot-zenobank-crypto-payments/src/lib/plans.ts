import { SubscriptionPlan } from '@prisma/client';

export interface PlanConfig {
  plan: SubscriptionPlan;
  label: string;
  days: number;
  price: string;
  currency: string;
}

export const PLANS: Record<SubscriptionPlan, PlanConfig> = {
  MONTHLY: {
    plan: SubscriptionPlan.MONTHLY,
    label: '30 Days - $69',
    days: 30,
    price: '69.00',
    currency: 'USD',
  },
  YEARLY: {
    plan: SubscriptionPlan.YEARLY,
    label: '365 Days - $197',
    days: 365,
    price: '197.00',
    currency: 'USD',
  },
};
