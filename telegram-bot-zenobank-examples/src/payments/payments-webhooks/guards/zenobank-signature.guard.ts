import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  RawBodyRequest,
} from "@nestjs/common";
import { Request } from "express";
import { ZenoBankClient, WebhookVerificationError } from "@zenobank/sdk";
import { env } from "../../../lib/env";

@Injectable()
export class ZenobankSignatureGuard implements CanActivate {
  private readonly logger = new Logger(ZenobankSignatureGuard.name);
  private readonly zenobank = new ZenoBankClient({
    apiKey: env.ZENOBANK_API_KEY,
  });

  canActivate(context: ExecutionContext): boolean {
    const request = context
      .switchToHttp()
      .getRequest<RawBodyRequest<Request>>();

    const payload = request.rawBody?.toString() ?? "";

    if (!payload) {
      this.logger.warn("Missing raw body");
      return false;
    }

    try {
      this.zenobank.webhooks.verifyWebhook({
        secret: env.ZENOBANK_WEBHOOK_SECRET,
        rawBody: payload,
        headers: request.headers,
      });
      return true;
    } catch (error) {
      if (error instanceof WebhookVerificationError) {
        this.logger.warn(`Invalid webhook signature: ${error.message}`);
        return false;
      }
      throw error;
    }
  }
}
