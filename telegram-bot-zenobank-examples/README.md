# Telegram Paid Group Bot

Run a private Telegram group as a paid community — users subscribe with crypto, the bot handles invites, renewals, and kicks expired members.

Built with NestJS + [Telegraf](https://telegraf.js.org), powered by [Zeno Bank](https://zenobank.io) and [`@zenobank/sdk`](https://www.npmjs.com/package/@zenobank/sdk).

<p align="center">
  <img alt="Telegram bot /start — plan selection and payment prompt" src="./assets/bot-start.png" width="560">
</p>

## Resources

- [Zeno Bank Docs](https://docs.zenobank.io)
- [Dashboard](https://dashboard.zenobank.io)
- [SDK on npm](https://www.npmjs.com/package/@zenobank/sdk)

## How it works

1. User runs `/start` → picks a plan → bot creates a Zeno Bank checkout and replies with a **Complete Payment** button.

   <p align="center">
     <img alt="Bot /start response with plans and payment button" src="./assets/bot-start.png" width="560">
   </p>

2. User pays with crypto on the hosted checkout.
3. Zeno Bank webhook → signature verified by `ZenobankSignatureGuard` → subscription extended → bot DMs a **single-use invite link**.

   <p align="center">
     <img alt="Bot payment received with single-use invite link" src="./assets/bot-payment-completed.png" width="560">
   </p>

4. Daily cron kicks users whose subscription expired and DMs a renewal prompt.

## Telegram setup

1. **Create the bot** with [@BotFather](https://t.me/BotFather) → `/newbot` → copy the token into `BOT_TOKEN`.
2. **Make your group a supergroup.** Basic groups can't generate invite links. Convert: group → Edit → Group Type → set **Public** (any temp username), save, then switch back to **Private**. ([Telegram FAQ](https://telegram.org/faq#q-what-39s-the-difference-between-groups-channels-and-supergroups))
3. **Add the bot as admin** with **Invite Users via Link** + **Ban Users** permissions.
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

Local dev: `ngrok http 3000`, then register the URL in the [dashboard](https://dashboard.zenobank.io/developer).

## Bot commands

- `/start` — show plans
- `/status` — check subscription
- `/help` — help
