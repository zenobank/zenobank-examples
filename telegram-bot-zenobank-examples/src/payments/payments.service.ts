import { Injectable, Logger } from "@nestjs/common";
import { CheckoutResponseDto, ZenoBankClient } from "@zenobank/sdk";
import { SubscriptionPlan } from "@prisma/client";
import { PLANS } from "../lib/plans";
import { env } from "../lib/env";

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);
  private readonly zenobank: ZenoBankClient;

  constructor() {
    this.zenobank = new ZenoBankClient({
      apiKey: env.ZENOBANK_API_KEY,
    });
  }

  async createCheckout(
    plan: SubscriptionPlan,
    orderId: string
  ): Promise<CheckoutResponseDto> {
    const checkout = await this.zenobank.checkouts.create({
      orderId,
      priceAmount: PLANS[plan].price,
      priceCurrency: PLANS[plan].currency,
      successRedirectUrl: null,
    });
    return checkout;
  }
}
