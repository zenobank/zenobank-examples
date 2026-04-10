import { ZenoBankClient } from '@zenobank/sdk';
import { env } from '../env.js';

export const zenoBank = new ZenoBankClient({ apiKey: env.ZENOBANK_API_KEY });
