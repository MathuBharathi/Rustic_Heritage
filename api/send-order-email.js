const { createClient } = require('@supabase/supabase-js');
const nodemailer = require('nodemailer');

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://tlhhxpttifgtgnrzjrga.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

function getSupabase() {
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
}

function getTransporter() {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.SMTP_PORT || '465', 10);
  const user = process.env.SMTP_EMAIL || 'mathubharathi15@gmail.com';
  const pass = process.env.SMTP_PASSWORD || '';
  if (!pass) return null;
  return nodemailer.createTransport({ host, port, secure: port === 465, auth: { user, pass } });
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { to, subject, html, order_id, order_number, customer_name, customer_email, total_amount, payment_method, items } = req.body || {};

    const transporter = getTransporter();
    let emailSent = false;
    let errorMsg = null;

    const emailTo = to || customer_email || 'customer@example.com';
    const emailSubject = subject || `Order Confirmation - ${order_number || 'RH-ORDER'}`;

    if (transporter) {
      try {
        await transporter.sendMail({
          from: `Rustic Heritage Kitchenware <${process.env.SMTP_EMAIL || 'mathubharathi15@gmail.com'}>`,
          to: emailTo,
          subject: emailSubject,
          html: html || `
            <div style="font-family: Georgia, serif; padding: 24px; background: #FDF6EC; color: #3B2A1A;">
              <h2>Order Confirmed!</h2>
              <p>Hello ${customer_name || 'Valued Customer'},</p>
              <p>Your order <strong>#${order_number || 'RH-ORDER'}</strong> has been successfully placed.</p>
              <p>Grand Total: <strong>₹${total_amount}</strong> (Payment: ${payment_method})</p>
              <p>Thank you for supporting traditional Indian artisans!</p>
            </div>
          `
        });
        emailSent = true;
      } catch (err) {
        console.error('Order Email SMTP error:', err);
        errorMsg = err.message;
      }
    } else {
      console.log('--- ORDER CONFIRMATION EMAIL FALLBACK (NO SMTP PASSWORD) ---');
      console.log(`To: ${emailTo}`);
      console.log(`Subject: ${emailSubject}`);
      console.log(`Order Number: ${order_number}`);
      console.log(`Grand Total: ₹${total_amount}`);
      console.log('------------------------------------------------------------');
      errorMsg = 'SMTP credentials missing. Order confirmation logged to console.';
    }

    return res.status(200).json({
      success: emailSent || !transporter,
      message: emailSent ? 'Order email sent successfully' : 'Order details logged to console successfully',
      error: errorMsg
    });

  } catch (err) {
    console.error('Send Order Email Error:', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
};
