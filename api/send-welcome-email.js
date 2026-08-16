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
    const { name, email } = req.body || {};
    if (!email) return res.status(400).json({ error: 'Email is required' });

    const transporter = getTransporter();
    if (!transporter) {
      return res.status(200).json({ success: false, message: 'Account created, but SMTP is not configured.' });
    }

    const mailOptions = {
      from: `Rustic Heritage Kitchenware <${process.env.SMTP_EMAIL || 'mathubharathi15@gmail.com'}>`,
      to: email,
      subject: '🎉 Welcome to Rustic Heritage Kitchenware!',
      html: `
        <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; background: #FDF6EC; border: 1px solid #E8D5B7; border-radius: 12px; padding: 32px; color: #3B2A1A;">
          <div style="text-align: center; margin-bottom: 24px;">
            <h1 style="color: #5C3D1E; font-size: 24px; margin: 0;">Rustic Heritage</h1>
            <p style="color: #C49A6C; letter-spacing: 2px; text-transform: uppercase; font-size: 11px; margin-top: 4px;">KITCHENWARE</p>
          </div>
          <h2 style="color: #3B2A1A; font-size: 20px;">Welcome to Rustic Heritage, ${name || 'Friend'}!</h2>
          <p style="font-size: 15px; line-height: 1.6; color: #5C3D1E;">
            Thank you for creating an account with us. We are delighted to share authentic Indian cookware, clay pots, cast iron, and traditional utensils with you.
          </p>
          <div style="text-align: center; margin-top: 30px;">
            <a href="${process.env.PUBLIC_SITE_URL || 'https://rustic-heritage.vercel.app'}/products.html" style="background: #3B2A1A; color: #F5ECD7; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Explore Kitchenware &rarr;</a>
          </div>
          <hr style="border: none; border-top: 1px solid #E8D5B7; margin: 32px 0 20px;" />
          <p style="font-size: 12px; color: #8B5E3C; text-align: center;">
            Contact us: <a href="mailto:mathubharathi15@gmail.com" style="color:#5C3D1E;">mathubharathi15@gmail.com</a> | <a href="tel:8072505342" style="color:#5C3D1E;">8072505342</a><br>Coimbatore, Tamil Nadu, India
          </p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);

    return res.status(200).json({ success: true, message: `Welcome email sent to ${email}` });

  } catch (err) {
    console.error('Send Welcome Email Error:', err);
    return res.status(500).json({ error: err.message || 'Failed to send welcome email' });
  }
};
