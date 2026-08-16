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
    const { to, subject, html, orderId } = req.body || {};

    if (!to || !html) {
      return res.status(400).json({ error: 'Missing to or html field' });
    }

    const transporter = getTransporter();
    let emailSent = false;
    let errorMsg = null;

    if (transporter) {
      try {
        await transporter.sendMail({
          from: `Rustic Heritage Kitchenware <${process.env.SMTP_EMAIL || 'mathubharathi15@gmail.com'}>`,
          to: to,
          subject: subject || 'Order Confirmation — Rustic Heritage Kitchenware',
          html: html
        });
        emailSent = true;
      } catch (err) {
        console.error('Order Email SMTP error:', err);
        errorMsg = err.message;
      }
    } else {
      errorMsg = 'SMTP credentials missing';
    }

    return res.status(emailSent ? 200 : 500).json({
      success: emailSent,
      message: emailSent ? 'Order email sent successfully' : 'Failed to send order email',
      error: errorMsg
    });

  } catch (err) {
    console.error('Send Order Email Error:', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
};
