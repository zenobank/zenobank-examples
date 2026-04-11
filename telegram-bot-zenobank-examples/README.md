# Telegram Bot for Paid Group Subscriptions with Crypto Payments

Turn a private Telegram group into a paid subscription community. Users pay in crypto (USDT, USDC, BTC, ETH, and more) via [Zeno Bank](https://zenobank.io), and the bot sends them a single-use invite link once the payment is confirmed.

<p align="center">
  <img alt="Telegram bot /start — plan selection and payment prompt" src="./assets/bot-start.png" width="560">
</p>

## Resources

- [Zeno Bank Documentation](https://docs.zenobank.io): API reference and integration guides
- [Zeno Bank Dashboard](https://dashboard.zenobank.io): get your API key, webhook secret, and manage payments
- [`@zenobank/sdk` on npm](https://www.npmjs.com/package/@zenobank/sdk): official TypeScript SDK used in this example

## How it works

1. User runs `/start` → picks a plan → bot creates a Zeno Bank checkout and replies with a **Complete Payment** button.

   <p align="center">
     <img alt="Bot /start response with plans and payment button" src="./assets/bot-start.png" width="560">
   </p>

2. User pays with crypto on the Zeno Bank hosted checkout.

   <p align="center">
     <img alt="Zeno Bank hosted crypto checkout" src="./assets/checkout.png" width="360">
   </p>

3. Zeno Bank webhook → signature verified by `ZenobankSignatureGuard` → subscription extended → bot DMs a **single-use invite link**.

   <p align="center">
     <img alt="Bot payment received with single-use invite link" src="./assets/bot-payment-completed.png" width="560">
   </p>

4. Daily cron kicks users whose subscription expired and DMs a renewal prompt.

## Telegram setup

1. **Create the bot** with [@BotFather](https://t.me/BotFather) → `/newbot` → copy the token into `BOT_TOKEN`.
2. **Make your group a supergroup.** Basic groups can't generate invite links. Convert: group → Edit → Group Type → set **Public** (any temp username), save, then switch back to **Private**. ([Telegram FAQ](https://telegram.org/faq#q-what-39s-the-difference-between-groups-channels-and-supergroups))
3. **Add the bot you just created in step 1 to the group as an admin**, with **Invite Users via Link** + **Ban Users** permissions enabled.
4. **Get the chat id**:
   - Send any message in your group (e.g. "hello").
   - Open this URL in your browser, replacing `<BOT_TOKEN>` with your bot token from BotFather:
     ```
     https://api.telegram.org/bot<BOT_TOKEN>/getUpdates
     ```
   - You'll see a JSON response. Copy the whole thing, paste it into ChatGPT, and ask: **"what is the chat id of the group?"** — it'll pull out the number for you (looks like `-1001234567890`). That's your `GROUP_CHAT_ID`.

## Setup

```bash
pnpm install
docker compose up -d
cp .env.example .env
pnpm prisma migrate dev
pnpm run start:dev
```

Fill in `.env`:

```env
BOT_TOKEN=123456789:ABC...              # Token you got from BotFather when you ran /newbot
GROUP_CHAT_ID=-1001234567890            # Your supergroup's chat id (from the getUpdates step above)
ADMIN_TELEGRAM_IDS=123456789            # Your personal Telegram user id
ZENOBANK_API_KEY=your-api-key           # From https://dashboard.zenobank.io/developer
ZENOBANK_WEBHOOK_SECRET=whsec_...       # From https://dashboard.zenobank.io/developer
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/telegram_bot
PORT=3000
```

## Subscriptions

Plans in [`src/lib/plans.ts`](./src/lib/plans.ts):

| Plan      | Duration | Price |
| --------- | -------- | ----- |
| `MONTHLY` | 30 days  | $69   |
| `YEARLY`  | 365 days | $197  |

Renewals stack on top of the current `endDate`. A daily cron ([`subscriptions.cron.ts`](./src/subscriptions/subscriptions.cron.ts)) kicks expired users (ban + unban) so they can rejoin by paying again.

## Webhook

Zeno Bank → `POST /webhooks/payments/zenobank`. Handles `checkout.completed` and `checkout.expired`.

**Local dev:** Zeno Bank can't reach `localhost`, so expose your server with ngrok:

```bash
ngrok http 3000
```

Copy the `https://...ngrok-free.app` URL ngrok prints, then go to the [Zeno Bank Dashboard → Developer](https://dashboard.zenobank.io/developer) and add it as your webhook endpoint, appending the path:

```
https://<your-ngrok-id>.ngrok-free.app/webhooks/payments/zenobank
```

## Bot commands

- `/start` — show plans
- `/status` — check subscription
- `/help` — help
