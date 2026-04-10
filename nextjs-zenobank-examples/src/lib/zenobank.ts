import "server-only";
import { ZenoBankClient } from "@zenobank/sdk";
import { env } from "./env";

export const zenobank = new ZenoBankClient({ apiKey: env.ZENOBANK_API_KEY });
