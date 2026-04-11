# Bun Crypto Payment Gateway

Bun example for accepting crypto payments with [Zeno Bank](https://zenobank.io) and the [`@zenobank/sdk`](https://www.npmjs.com/package/@zenobank/sdk).

<p align="center">
  <a href="https://pay.zenobank.io/demo"><img alt="Zenobank hosted checkout page" src="https://raw.githubusercontent.com/zenobank/zenobank-examples/main/assets/checkout.png" width="360"></a>
</p>

## Resources

- [Zeno Bank Documentation](https://docs.zenobank.io)
- [Zeno Bank Dashboard](https://dashboard.zenobank.io)
- [Checkout Demo](https://pay.zenobank.io/demo)
- [SDK on npm](https://www.npmjs.com/package/@zenobank/sdk)

## How it works

1. `POST /orders` — creates an order and a Zeno Bank checkout
2. Returns a `checkoutUrl` — redirect the customer there from your frontend
3. Customer pays with crypto on the Zeno Bank hosted page
4. Zeno Bank sends a webhook — signature is verified using the SDK
5. Order status is updated in an in-memory store

Orders are kept in a `Map` — state is lost on restart. Swap in a real database for production.

## Setup

### 1. Install dependencies

```bash
bun install
```

### 2. Configure environment variables

```bash
cp .env.example .env
```

Edit `.env` with your credentials:

```env
PORT=3000
ZENOBANK_API_KEY=your-api-key           # From https://dashboard.zenobank.io/developer
ZENOBANK_WEBHOOK_SECRET=whsec_...       # From https://dashboard.zenobank.io/developer
```

> Get your API key and webhook secret from the [Zeno Bank Dashboard](https://dashboard.zenobank.io/developer).

### 3. Start the server

```bash
bun run dev
```

The server runs at `http://localhost:3000`.

## API

### Create an order

```bash
curl -X POST http://localhost:3000/orders \
  -H "Content-Type: application/json" \
  -d '{"amount": "50", "currency": "USD"}'
```

Response:

```json
{
  "id": "b0e8f8a4-...",
  "status": "PENDING",
  "amount": "50",
  "currency": "USD",
  "checkoutUrl": "https://pay.zenobank.io/ch_..."
}
```

Redirect the customer to `checkoutUrl` to complete the payment.

### Get an order

```bash
curl http://localhost:3000/orders/<id>
```

### Webhook

Zeno Bank delivers events to `POST /webhooks/zenobank`. The raw request body is read with `req.text()` and the signature is verified by `zenoBank.webhooks.verify` before the event is processed.

Handled events:

- `checkout.completed` → order marked `PAID`
- `checkout.expired` → order marked `CANCELLED`

To receive webhooks during development, expose your local server with [ngrok](https://ngrok.com):

```bash
ngrok http 3000
```

Then register the URL in the [Zeno Bank Dashboard](https://dashboard.zenobank.io/developer), e.g. `https://a1b2c3d4.ngrok-free.app/webhooks/zenobank`.

## Project structure

```
src/
├── index.ts                        # Bun.serve entrypoint + router
├── env.ts                          # zod-validated environment
├── http.ts                         # json() response helper
├── zenobank.ts                     # singleton ZenoBankClient
├── orders-store.ts                 # in-memory Map + Order type + CRUD + toDto
├── orders-handler.ts               # POST /orders, GET /orders/:id
└── zenobank-webhook-handler.ts     # POST /webhooks/zenobank (verify + dispatch)
```
