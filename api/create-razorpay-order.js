const Razorpay = require('razorpay');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const key_id = process.env.RAZORPAY_KEY_ID;
    const key_secret = process.env.RAZORPAY_KEY_SECRET;

    if (!key_id || !key_secret) {
      return res.status(500).json({ error: 'Razorpay keys not configured on server' });
    }

    const instance = new Razorpay({ key_id, key_secret });

    const body = req.body || {};
    const amount = body.amount; // in paise
    const currency = body.currency || 'INR';
    const receipt = body.receipt || `rh_${Date.now()}`;
    const notes = body.notes || {};

    if (!amount || isNaN(amount)) {
      return res.status(400).json({ error: 'Valid order amount is required' });
    }

    const order = await instance.orders.create({
      amount: parseInt(amount, 10),
      currency,
      receipt,
      notes
    });

    return res.status(200).json(order);

  } catch (err) {
    console.error('Razorpay Create Order Error:', err);
    return res.status(500).json({ error: err.message || 'Failed to create Razorpay order' });
  }
};
