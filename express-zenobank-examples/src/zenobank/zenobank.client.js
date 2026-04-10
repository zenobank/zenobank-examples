const { ZenoBankClient } = require('@zenobank/sdk');
const { env } = require('../lib/env');

const zenoBank = new ZenoBankClient({ apiKey: env.ZENOBANK_API_KEY });

module.exports = { zenoBank };
