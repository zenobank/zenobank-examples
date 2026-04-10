const express = require("express");
const ordersRouter = require("./orders/orders.router");
const zenobankWebhookRouter = require("./webhooks/zenobank.router");
const { notFound, errorHandler } = require("./error-handler");

function createApp() {
  const app = express();

  // Webhook router is mounted before express.json so it can read the raw body
  // for signature verification.
  app.use("/webhooks/zenobank", zenobankWebhookRouter);

  app.use(express.json());

  app.use("/orders", ordersRouter);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}

module.exports = { createApp };
