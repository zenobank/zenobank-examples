import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  RawBodyRequest,
} from "@nestjs/common";
import { Request } from "express";
import { ZenoBankClient } from "@zenobank/sdk";
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

    const isValid = this.zenobank.webhooks.isValid({
      secret: env.ZENOBANK_WEBHOOK_SECRET,
      rawBody: payload,
      headers: request.headers,
    });

    if (!isValid) {
      this.logger.warn("Invalid webhook signature");
    }

    return isValid;
  }
}
