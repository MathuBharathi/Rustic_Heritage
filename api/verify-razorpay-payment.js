import crypto from 'crypto';
import { createHandler } from './_adapter.js';

export const handler = createHandler(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body || {};

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ error: 'Missing required Razorpay verification parameters' });
    }

    const key_secret = process.env.RAZORPAY_KEY_SECRET;
    if (!key_secret) {
      return res.status(500).json({ error: 'RAZORPAY_KEY_SECRET environment variable missing.' });
    }

    const hmac = crypto.createHmac('sha256', key_secret);
    hmac.update(razorpay_order_id + '|' + razorpay_payment_id);
    const generated_signature = hmac.digest('hex');

    if (generated_signature === razorpay_signature) {
      return res.status(200).json({ success: true, message: 'Payment signature verified' });
    } else {
      return res.status(400).json({ success: false, error: 'Invalid signature' });
    }

  } catch (err) {
    console.error('Razorpay Verify Signature Error:', err);
    return res.status(500).json({ error: err.message || 'Signature verification failed' });
  }
});

export default handler;
