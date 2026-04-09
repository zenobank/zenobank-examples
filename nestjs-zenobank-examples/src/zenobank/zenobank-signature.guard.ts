import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
  RawBodyRequest,
} from '@nestjs/common';
import { ZenoBankClient } from '@zenobank/sdk';
import { ZENOBANK_CLIENT } from './zenobank.constants';
import { env } from '../lib/env';
import { Request } from 'express';

@Injectable()
export class ZenoBankSignatureGuard implements CanActivate {
  constructor(
    @Inject(ZENOBANK_CLIENT) private readonly zenoBank: ZenoBankClient,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<RawBodyRequest<Request>>();

    if (!req.rawBody) {
      throw new UnauthorizedException('Missing raw body');
    }

    try {
      this.zenoBank.webhooks.verifyWebhook({
        secret: env.ZENOBANK_WEBHOOK_SECRET,
        rawBody: req.rawBody,
        headers: req.headers,
      });
    } catch {
      throw new UnauthorizedException('Invalid webhook signature');
    }

    return true;
  }
}
