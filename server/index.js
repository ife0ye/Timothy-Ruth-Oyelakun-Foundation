import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import crypto from 'crypto';
import axios from 'axios';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4242;
const APP_BASE_URL = process.env.APP_BASE_URL || 'http://localhost:5173';
const FLW_SECRET_KEY = process.env.FLW_SECRET_KEY;
const FLW_SECRET_HASH = process.env.FLW_SECRET_HASH || '';

if (!FLW_SECRET_KEY) {
  console.error('Missing FLW_SECRET_KEY');
  process.exit(1);
}

app.use(
  express.json({
    verify: (req, res, buf) => {
      req.rawBody = buf.toString('utf8');
    },
  })
);

app.use(
  cors({
    origin: APP_BASE_URL,
    methods: ['GET', 'POST'],
  })
);

const pending = new Map();

const allowedCurrencies = new Set(['USD', 'EUR', 'GBP', 'NGN', 'CAD', 'AUD']);

function createTxRef() {
  return `foundation-${Date.now()}-${Math.floor(Math.random() * 1e9)}`;
}

app.post('/api/flutterwave/create-payment', async (req, res) => {
  try {
    const { amount, currency, email, name, phone } = req.body;

    const amountNumber = Number(amount);
    if (!Number.isFinite(amountNumber) || amountNumber <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }
    if (!allowedCurrencies.has(currency)) {
      return res.status(400).json({ error: 'Unsupported currency' });
    }
    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'Valid email required' });
    }

    const tx_ref = createTxRef();
    pending.set(tx_ref, {
      amount: amountNumber,
      currency,
      email,
    });

    const payload = {
      tx_ref,
      amount: amountNumber,
      currency,
      redirect_url: `${APP_BASE_URL}/?donation=1`,
      customer: {
        email,
        name,
        phonenumber: phone || undefined,
      },
      customizations: {
        title: 'Foundation Donation',
        description: 'Support our mission',
      },
    };

    const response = await axios.post(
      'https://api.flutterwave.com/v3/payments',
      payload,
      {
        headers: {
          Authorization: `Bearer ${FLW_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const link = response?.data?.data?.link;
    if (!link) {
      return res.status(502).json({ error: 'No payment link returned' });
    }

    res.json({ link, tx_ref });
  } catch (err) {
    const message =
      err?.response?.data?.message || err?.message || 'Payment init failed';
    res.status(500).json({ error: message });
  }
});

app.get('/api/flutterwave/verify', async (req, res) => {
  try {
    const { transaction_id, tx_ref } = req.query;
    if (!transaction_id) {
      return res.status(400).json({ ok: false, error: 'Missing transaction_id' });
    }

    const verifyRes = await axios.get(
      `https://api.flutterwave.com/v3/transactions/${transaction_id}/verify`,
      {
        headers: {
          Authorization: `Bearer ${FLW_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const data = verifyRes?.data?.data;
    const expected = pending.get(tx_ref);

    const ok =
      data?.status === 'successful' &&
      (!expected ||
        (data?.tx_ref === tx_ref &&
          data?.currency === expected.currency &&
          Number(data?.amount) >= Number(expected.amount)));

    if (ok && tx_ref) {
      pending.delete(tx_ref);
    }

    res.json({ ok, data });
  } catch (err) {
    const message =
      err?.response?.data?.message || err?.message || 'Verification failed';
    res.status(500).json({ ok: false, error: message });
  }
});

app.post('/api/flutterwave/webhook', (req, res) => {
  const signature = req.headers['flutterwave-signature'];
  const legacyHash = req.headers['verif-hash'];

  let valid = false;

  if (signature && FLW_SECRET_HASH) {
    const hash = crypto
      .createHmac('sha256', FLW_SECRET_HASH)
      .update(req.rawBody || '')
      .digest('base64');

    try {
      valid = crypto.timingSafeEqual(
        Buffer.from(hash),
        Buffer.from(String(signature))
      );
    } catch {
      valid = false;
    }
  } else if (legacyHash && FLW_SECRET_HASH) {
    valid = String(legacyHash) === FLW_SECRET_HASH;
  }

  if (!valid) {
    return res.status(401).send('Invalid signature');
  }

  res.sendStatus(200);
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
