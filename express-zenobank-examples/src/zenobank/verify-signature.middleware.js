const express = require('express');
const { zenoBank } = require('./zenobank.client');
const { env } = require('../lib/env');
const { HttpError } = require('../lib/http-error');
const logger = require('../lib/logger').create('zenobank:webhook');

const rawJson = express.raw({ type: 'application/json' });

function verifySignature(req, _res, next) {
  try {
    zenoBank.webhooks.verify({
      secret: env.ZENOBANK_WEBHOOK_SECRET,
      rawBody: req.body,
      headers: req.headers,
    });
  } catch (err) {
    logger.warn(`signature verification failed: ${err.message}`);
    return next(new HttpError(401, `Invalid webhook signature: ${err.message}`));
  }
  logger.info('signature verified');
  req.event = JSON.parse(req.body.toString('utf8'));
  next();
}

module.exports = { verifySignature, rawJson };
