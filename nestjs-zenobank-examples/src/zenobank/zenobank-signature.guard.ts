import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
  RawBodyRequest,
} from '@nestjs/common';
import { ZenobankClient } from '@zenobank/sdk';
import { ZENOBANK_CLIENT } from './zenobank.module';
import { env } from '../lib/env';
import { Request } from 'express';

@Injectable()
export class ZenoBankSignatureGuard implements CanActivate {
  constructor(
    @Inject(ZENOBANK_CLIENT) private readonly zenoBank: ZenobankClient,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<RawBodyRequest<Request>>();

    if (!req.rawBody) {
      throw new UnauthorizedException('Missing raw body');
    }

    const isValid = this.zenoBank.webhooks.isValid({
      secret: env.ZENOBANK_WEBHOOK_SECRET,
      rawBody: req.rawBody,
      headers: req.headers,
    });

    if (!isValid) {
      throw new UnauthorizedException('Invalid webhook signature');
    }

    return true;
  }
}
