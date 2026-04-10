import { ZenoBankClient } from "@zenobank/sdk";
import { env } from "./env.ts";

export const zenoBank = new ZenoBankClient({ apiKey: env.ZENOBANK_API_KEY });
