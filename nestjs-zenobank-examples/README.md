# NestJS Crypto Payment Gateway

NestJS example for accepting crypto payments with [Zeno Bank](https://zenobank.io) and the [`@zenobank/sdk`](https://www.npmjs.com/package/@zenobank/sdk).

<p align="center">
  <img alt="Zenobank hosted checkout page" src="../assets/checkout.png" width="360">
</p>

## How it works

1. `POST /v1/orders` — creates an order and a Zeno Bank checkout
2. Returns a `checkoutUrl` — redirect the customer there from your frontend
3. Customer pays with crypto on the Zeno Bank hosted page
4. Zeno Bank sends a webhook — signature is verified by a guard using the SDK
5. Order status is updated in the database

## Setup

### 1. Install dependencies

```bash
pnpm install
```

### 2. Start the database

```bash
docker compose up -d
```

### 3. Configure environment variables

```bash
cp .env.example .env
```

Edit `.env` with your credentials:

```env
PORT=3000
DATABASE_URL="postgresql://postgres:postgres@localhost:5436/postgres?schema=public"
ZENOBANK_API_KEY=your-api-key           # From https://dashboard.zenobank.io/developer
ZENOBANK_WEBHOOK_SECRET=whsec_...       # From https://dashboard.zenobank.io/developer
```

> Get your API key and webhook secret from the [Zeno Bank Dashboard](https://dashboard.zenobank.io/developer).

### 4. Run database migrations

```bash
pnpm prisma migrate dev
```

### 5. Start the server

```bash
pnpm run start:dev
```

The server runs at `http://localhost:3000`.

## API

### Create an order

```bash
curl -X POST http://localhost:3000/v1/orders \
  -H "Content-Type: application/json" \
  -d '{"amount": "50", "currency": "USD"}'
```

Response:

```json
{
  "id": "cm5x9kq3a0001uy6wg7h2m4r8",
  "status": "PENDING",
  "amount": "50",
  "currency": "USD",
  "checkoutUrl": "https://pay.zenobank.io/ch_..."
}
```

Redirect the customer to `checkoutUrl` to complete the payment.

### Webhook

Zeno Bank sends a `POST` to `/v1/webhooks/zenobank` when a checkout status changes. The `ZenoBankSignatureGuard` verifies the signature before the handler runs.

Handled events:
- `checkout.completed` — marks the order as `PAID`
- `checkout.expired` — marks the order as `CANCELLED`

To receive webhooks, go to the [Zeno Bank Dashboard](https://dashboard.zenobank.io/developer) and add your webhook URL. For local development, use [ngrok](https://ngrok.com) to expose your local server:

```bash
ngrok http 3000
```

Then add the ngrok URL as your webhook endpoint in the dashboard, e.g. `https://a1b2c3d4.ngrok-free.app/v1/webhooks/zenobank`.

## Resources

- [Zeno Bank Documentation](https://docs.zenobank.io)
- [Zeno Bank Dashboard](https://dashboard.zenobank.io)
- [Checkout Demo](https://pay.zenobank.io/demo)
- [SDK on npm](https://www.npmjs.com/package/@zenobank/sdk)

