# Zeno Bank Examples — Accept Crypto Payments in Any Stack

Open-source example apps showing how to accept **crypto payments** (USDT, USDC, BTC, ETH, SOL and more) with [Zeno Bank](https://zenobank.io) and the official [`@zenobank/sdk`](https://www.npmjs.com/package/@zenobank/sdk). Drop-in starters for the most popular JavaScript and TypeScript frameworks — create a checkout, redirect the customer, and verify the webhook.

<p align="center">
  <a href="https://pay.zenobank.io/demo"><img alt="Zeno Bank hosted crypto checkout page" src="https://raw.githubusercontent.com/zenobank/zenobank-examples/main/assets/checkout.png" width="360"></a>
</p>

## Resources

- [Zeno Bank Documentation](https://docs.zenobank.io) — API reference and integration guides
- [Zeno Bank Dashboard](https://dashboard.zenobank.io) — get your API key, webhook secret, and manage payments
- [Checkout Demo](https://pay.zenobank.io/demo) — try the hosted checkout
- [`@zenobank/sdk` on npm](https://www.npmjs.com/package/@zenobank/sdk) — official TypeScript SDK used in every example

## Examples

| Framework | Description |
| --- | --- |
| [Next.js](./nextjs-zenobank-examples) | App Router + Route Handlers crypto payment gateway with client-side polling |
| [NestJS](./nestjs-zenobank-examples) | NestJS crypto payment API with a typed webhook guard |
| [Express](./express-zenobank-examples) | Minimal Express.js crypto checkout server |
| [Fastify](./fastify-zenobank-examples) | High-performance Fastify crypto payment server |
| [Elysia](./elysia-zenobank-examples) | Bun-native Elysia crypto checkout API |
| [Bun](./bun-zenobank-examples) | Zero-dependency `Bun.serve` crypto payment example |
| [Telegram Bot](./telegram-bot-zenobank-examples) | Paid Telegram group subscriptions with single-use invite links |

Every example follows the same flow: create an order, return a `checkoutUrl`, redirect the customer to the Zeno Bank hosted checkout, and verify the incoming webhook signature with the SDK.

## How it works

1. Your backend calls the SDK to create a Zeno Bank checkout for an order
2. Your frontend redirects the customer to the returned `checkoutUrl`
3. The customer pays with crypto on the Zeno Bank hosted page
4. Zeno Bank sends a signed webhook to your server
5. The SDK verifies the signature and your handler marks the order as paid

## Quick start

1. Pick the example that matches your stack from the table above.
2. Follow its README — install dependencies, copy `.env.example`, and start the dev server.
3. Get your API key and webhook secret from the [Zeno Bank Dashboard → Developer](https://dashboard.zenobank.io/developer).
4. Expose your local server with [ngrok](https://ngrok.com) to receive webhooks during development.

## Why Zeno Bank

- **Accept any major crypto** — USDT, USDC, BTC, ETH, SOL, and more on multiple chains
- **Hosted checkout** — no PCI scope, no wallet UX to build, mobile-ready out of the box
- **Signed webhooks** — tamper-proof events verified with one SDK call
- **TypeScript SDK** — first-class types for orders, checkouts, and webhook events

## License

MIT
