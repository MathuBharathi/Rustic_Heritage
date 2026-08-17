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

  if (!pass) {
    console.warn('SMTP_PASSWORD is missing in process.env. Outgoing emails will be logged to console.');
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass }
  });
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { email, name } = req.body || {};

    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'Valid email is required' });
    }

    const supabase = getSupabase();

    // Allocate random discount percentage between 10% and 20%
    const randomPercent = Math.floor(Math.random() * 11) + 10;

    let couponCode = null;
    let rpcSuccess = false;

    // Call RPC or fallback
    const { data: rpcData, error: rpcErr } = await supabase.rpc('create_newsletter_subscription', {
      p_email: email,
      p_name: name || null,
      p_coupon_code: null
    });

    if (!rpcErr && rpcData) {
      if (rpcData.duplicate) {
        return res.status(200).json({
          success: false,
          duplicate: true,
          coupon_code: rpcData.coupon_code,
          message: `You are already subscribed! Your welcome coupon is sent to your email.`
        });
      }
      if (rpcData.success) {
        rpcSuccess = true;
        couponCode = rpcData.coupon_code;
      }
    }

    // Direct fallback insertion with custom random discount
    if (!rpcSuccess) {
      const { data: existing } = await supabase.from('subscribers').select('coupon_code').eq('email', email).maybeSingle();
      if (existing) {
        return res.status(200).json({
          success: false,
          duplicate: true,
          coupon_code: existing.coupon_code,
          message: `You are already subscribed! Your welcome coupon is sent to your email.`
        });
      }

      couponCode = 'WELCOME-' + Math.random().toString(36).substring(2, 9).toUpperCase();
      const expiryDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

      const { data: cData } = await supabase.from('coupons').insert({
        code: couponCode,
        discount_type: 'percentage',
        discount_value: randomPercent,
        minimum_order: 299,
        maximum_discount: 200,
        usage_limit: 1,
        active: true,
        expiry_date: expiryDate,
        generated_by_system: true,
        subscriber_email: email
      }).select().maybeSingle();

      await supabase.from('subscribers').insert({
        email: email,
        name: name,
        coupon_id: cData?.id || null,
        coupon_code: couponCode,
        email_sent: false,
        active: true
      });
    }

    // Dispatch welcome email
    let emailSent = false;
    let emailError = null;
    const transporter = getTransporter();

    const mailOptions = {
      from: `Rustic Heritage Kitchenware <${process.env.SMTP_EMAIL || 'mathubharathi15@gmail.com'}>`,
      to: email,
      subject: `🎁 Your Rustic Heritage Welcome Gift (${randomPercent}% OFF)`,
      html: `
        <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; background: #FDF6EC; border: 1px solid #E8D5B7; border-radius: 12px; padding: 32px; color: #3B2A1A;">
          <div style="text-align: center; margin-bottom: 24px;">
            <h1 style="color: #5C3D1E; font-size: 24px; margin: 0;">Rustic Heritage</h1>
            <p style="color: #C49A6C; letter-spacing: 2px; text-transform: uppercase; font-size: 11px; margin-top: 4px;">KITCHENWARE</p>
          </div>
          
          <h2 style="color: #3B2A1A; font-size: 20px;">Welcome to the Family, ${name || 'Valued Customer'}!</h2>
          <p style="font-size: 15px; line-height: 1.6; color: #5C3D1E;">
            Thank you for subscribing to Rustic Heritage Kitchenware. We are delighted to share authentic Indian craftsmanship with you.
          </p>
          
          <div style="background: #F5ECD7; border: 2px dashed #C49A6C; border-radius: 10px; padding: 20px; text-align: center; margin: 28px 0;">
            <span style="font-size: 12px; letter-spacing: 2px; text-transform: uppercase; color: #8B5E3C; font-weight: bold;">YOUR EXCLUSIVE WELCOME COUPON</span>
            <div style="font-size: 28px; font-weight: bold; color: #3B2A1A; letter-spacing: 4px; margin: 10px 0;">${couponCode}</div>
            <p style="font-size: 13px; color: #5C3D1E; margin: 0;">
              Get <strong>${randomPercent}% OFF</strong> on orders above ₹299 (Max discount ₹200). Valid for 30 days.
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 30px;">
            <a href="${process.env.PUBLIC_SITE_URL || 'http://localhost:3000'}/products" style="background: #3B2A1A; color: #F5ECD7; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Shop the Collection &rarr;</a>
          </div>

          <hr style="border: none; border-top: 1px solid #E8D5B7; margin: 32px 0 20px;" />
          <p style="font-size: 12px; color: #8B5E3C; text-align: center;">
            Questions? Reach out to us at <a href="mailto:mathubharathi15@gmail.com" style="color:#5C3D1E;">mathubharathi15@gmail.com</a> or call <a href="tel:8072505342" style="color:#5C3D1E;">8072505342</a>.<br>
            Coimbatore, Tamil Nadu, India
          </p>
        </div>
      `
    };

    if (transporter) {
      try {
        await transporter.sendMail(mailOptions);
        emailSent = true;
      } catch (err) {
        console.error('SMTP Mail Dispatch Error:', err);
        emailError = err.message || 'SMTP dispatch failed';
      }
    } else {
      console.log('--- WELCOME EMAIL FALLBACK (NO SMTP PASSWORD) ---');
      console.log(`To: ${email}`);
      console.log(`Subject: Welcome Gift Coupon ${couponCode}`);
      console.log(`Discount Value: ${randomPercent}%`);
      console.log('--------------------------------------------------');
    }

    if (emailSent) {
      await supabase.from('subscribers')
        .update({ email_sent: true })
        .eq('email', email);
    }

    return res.status(200).json({
      success: true,
      duplicate: false,
      coupon_code: couponCode,
      email_sent: emailSent,
      message: `🎉 You are successfully subscribed! Your ${randomPercent}% OFF welcome discount code has been sent to your email.`
    });

  } catch (err) {
    console.error('Newsletter Subscribe Handler Error:', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
};
