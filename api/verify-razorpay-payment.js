const crypto = require('crypto');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const key_secret = process.env.RAZORPAY_KEY_SECRET;
    const body = req.body || {};

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ verified: false, error: 'Missing payment parameters' });
    }

    if (!key_secret) {
      return res.status(500).json({ verified: false, error: 'Razorpay secret key not configured' });
    }

    const text = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac('sha256', key_secret)
      .update(text)
      .digest('hex');

    const isValid = (expectedSignature === razorpay_signature);

    return res.status(200).json({ verified: isValid });

  } catch (err) {
    console.error('Razorpay Payment Verification Error:', err);
    return res.status(500).json({ verified: false, error: err.message });
  }
};
