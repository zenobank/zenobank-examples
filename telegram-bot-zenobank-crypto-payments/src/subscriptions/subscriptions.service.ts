import { Injectable, Logger } from "@nestjs/common";
import { SubscriptionPlan, SubscriptionStatus } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { PLANS } from "../lib/plans";

@Injectable()
export class SubscriptionsService {
  private readonly logger = new Logger(SubscriptionsService.name);

  constructor(private readonly db: PrismaService) {}

  async findOrCreateUser(
    telegramId: bigint,
    username?: string,
    firstName?: string
  ) {
    return this.db.user.upsert({
      where: { telegramId },
      update: { username, firstName },
      create: { telegramId, username, firstName },
    });
  }

  async createPendingPayment(
    userId: string,
    plan: SubscriptionPlan,
    checkoutId: string
  ) {
    const planConfig = PLANS[plan];

    const subscription = await this.db.subscription.upsert({
      where: { userId },
      update: {},
      create: {
        userId,
        status: SubscriptionStatus.ACTIVE,
        endDate: new Date(),
      },
    });

    return this.db.payment.create({
      data: {
        subscriptionId: subscription.id,
        plan,
        amount: parseFloat(planConfig.price),
        currency: planConfig.currency,
        checkoutId,
        status: "PENDING",
      },
    });
  }

  async findPaymentByCheckoutId(checkoutId: string) {
    return this.db.payment.findUnique({
      where: { checkoutId },
      include: { subscription: { include: { user: true } } },
    });
  }

  async extendSubscription(subscriptionId: number, plan: SubscriptionPlan) {
    const subscription = await this.db.subscription.findUniqueOrThrow({
      where: { id: subscriptionId },
      include: { user: true },
    });

    const planConfig = PLANS[plan];
    const now = new Date();
    const currentEnd = subscription.endDate;
    const baseDate = currentEnd > now ? currentEnd : now;

    const newEndDate = new Date(baseDate);
    newEndDate.setDate(newEndDate.getDate() + planConfig.days);

    return this.db.subscription.update({
      where: { id: subscriptionId },
      data: {
        status: SubscriptionStatus.ACTIVE,
        endDate: newEndDate,
      },
      include: { user: true },
    });
  }

  async getExpiredSubscriptions() {
    return this.db.subscription.findMany({
      where: {
        status: SubscriptionStatus.ACTIVE,
        endDate: { lt: new Date() },
      },
      include: { user: true },
    });
  }

  async markExpired(subscriptionId: number) {
    return this.db.subscription.update({
      where: { id: subscriptionId },
      data: { status: SubscriptionStatus.EXPIRED },
    });
  }
}
