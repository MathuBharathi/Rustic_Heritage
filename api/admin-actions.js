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

async function verifyAdminServerSide(req) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.replace('Bearer ', '').trim();
  if (!token) return true; // Allow local dev trigger if no auth header passed

  try {
    const supabase = getSupabase();
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) return false;

    const email = (user.email || '').toLowerCase();
    if (email === 'mathubharathi15@gmail.com') return true;

    const { data: profile } = await supabase
      .from('user_profiles')
      .select('is_admin')
      .eq('auth_user_id', user.id)
      .maybeSingle();

    return profile?.is_admin === true;
  } catch (err) {
    console.warn('Server auth verification check:', err);
    return true;
  }
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const isAdmin = await verifyAdminServerSide(req);
    if (!isAdmin) {
      return res.status(403).json({ error: 'Unauthorized: Administrator access required.' });
    }

    const body = req.body || {};
    const { action } = body;

    const supabase = getSupabase();

    if (action === 'log') {
      return res.status(200).json({ success: true });
    }

    if (action === 'resend_welcome_email') {
      const { subscriber_email, coupon_code, subscriber_name } = body;
      if (!subscriber_email) return res.status(400).json({ error: 'subscriber_email required' });

      const transporter = getTransporter();
      if (!transporter) return res.status(500).json({ error: 'SMTP credentials missing' });

      const mailOptions = {
        from: `Rustic Heritage Kitchenware <${process.env.SMTP_EMAIL || 'mathubharathi15@gmail.com'}>`,
        to: subscriber_email,
        subject: '🎁 Your Rustic Heritage Welcome Gift (15% OFF)',
        html: `
          <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; background: #FDF6EC; border: 1px solid #E8D5B7; border-radius: 12px; padding: 32px; color: #3B2A1A;">
            <div style="text-align: center; margin-bottom: 24px;">
              <h1 style="color: #5C3D1E; font-size: 24px; margin: 0;">Rustic Heritage</h1>
              <p style="color: #C49A6C; letter-spacing: 2px; text-transform: uppercase; font-size: 11px; margin-top: 4px;">KITCHENWARE</p>
            </div>
            <h2 style="color: #3B2A1A; font-size: 20px;">Welcome Back, ${subscriber_name || 'Subscriber'}!</h2>
            <p style="font-size: 15px; line-height: 1.6; color: #5C3D1E;">
              Here is your requested welcome coupon for 15% OFF.
            </p>
            <div style="background: #F5ECD7; border: 2px dashed #C49A6C; border-radius: 10px; padding: 20px; text-align: center; margin: 28px 0;">
              <div style="font-size: 28px; font-weight: bold; color: #3B2A1A; letter-spacing: 4px; margin: 10px 0;">${coupon_code}</div>
              <p style="font-size: 13px; color: #5C3D1E; margin: 0;">15% OFF on orders above ₹299 (Max ₹200). Valid for 30 days.</p>
            </div>
            <div style="text-align: center; margin-top: 30px;">
              <a href="${process.env.PUBLIC_SITE_URL || 'https://rustic-heritage.vercel.app'}/products" style="background: #3B2A1A; color: #F5ECD7; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Shop the Collection &rarr;</a>
            </div>
          </div>
        `
      };

      await transporter.sendMail(mailOptions);

      await supabase.from('subscribers')
        .update({ email_sent: true })
        .eq('email', subscriber_email);

      return res.status(200).json({ success: true, message: `Resent welcome email to ${subscriber_email}` });
    }

    return res.status(400).json({ error: `Unknown action: ${action}` });

  } catch (err) {
    console.error('Admin actions error:', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
};
