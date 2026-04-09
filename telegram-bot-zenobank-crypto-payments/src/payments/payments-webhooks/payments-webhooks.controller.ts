import {
  BadRequestException,
  Controller,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";
import { Request } from "express";
import { PaymentsWebhooksService } from "./payments-webhooks.service";
import { ZenobankSignatureGuard } from "./guards/zenobank-signature.guard";

@Controller("webhooks/payments")
export class PaymentsWebhooksController {
  constructor(
    private readonly paymentsWebhooksService: PaymentsWebhooksService
  ) {}

  @Post("zenobank")
  @UseGuards(ZenobankSignatureGuard)
  async handleWebhook(@Req() req: Request) {
    if (!req.body) {
      throw new BadRequestException("No body");
    }
    await this.paymentsWebhooksService.handleWebhook(req.body);
    return { ok: true };
  }
}
