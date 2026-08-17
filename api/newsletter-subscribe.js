import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://tlhhxpttifgtgnrzjrga.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

function getSupabase() {
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
}

function getTransporter() {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.SMTP_PORT || '465', 10);
  const user = process.env.SMTP_EMAIL || 'workatbuildcrew@gmail.com';
  const pass = process.env.SMTP_PASSWORD || 'bexmykoqfncghhku';
  return nodemailer.createTransport({ host, port, secure: port === 465, auth: { user, pass } });
}

export default async function handler(req, res) {
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
    const randomPercent = Math.floor(Math.random() * 11) + 10;
    let couponCode = null;
    let rpcSuccess = false;

    const { data: rpcData, error: rpcErr } = await supabase.rpc('create_newsletter_subscription', {
      p_email: email,
      p_name: name || null,
      p_coupon_code: null,
    });

    if (!rpcErr && rpcData) {
      if (rpcData.duplicate) {
        return res.status(200).json({
          success: false,
          duplicate: true,
          coupon_code: rpcData.coupon_code,
          message: `You are already subscribed! Your welcome coupon is sent to your email.`,
        });
      }
      if (rpcData.success) {
        rpcSuccess = true;
        couponCode = rpcData.coupon_code;
      }
    }

    if (!rpcSuccess) {
      const { data: existing } = await supabase.from('subscribers').select('coupon_code').eq('email', email).maybeSingle();
      if (existing) {
        return res.status(200).json({
          success: false,
          duplicate: true,
          coupon_code: existing.coupon_code,
          message: `You are already subscribed! Your welcome coupon is sent to your email.`,
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
        subscriber_email: email,
      }).select().maybeSingle();

      await supabase.from('subscribers').insert({
        email: email,
        name: name,
        coupon_id: cData?.id || null,
        coupon_code: couponCode,
        email_sent: false,
        active: true,
      });
    }

    const transporter = getTransporter();
    const siteUrl = process.env.PUBLIC_SITE_URL || 'http://localhost:3000';
    const subscriberName = name || 'Valued Member';

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Georgia', serif; background-color: #FDF6EC; margin: 0; padding: 20px; color: #3B2A1A; }
          .email-container { max-width: 600px; margin: 0 auto; background: #FFFDF9; border: 1.5px solid #E8D5B7; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(92,61,30,0.08); }
          .email-header { background: linear-gradient(135deg, #3B2A1A 0%, #5C3D1E 100%); padding: 28px 24px; text-align: center; color: #F5ECD7; border-bottom: 3px solid #C49A6C; }
          .brand-title { font-size: 22px; font-weight: bold; color: #FDF6EC; letter-spacing: 1px; }
          .brand-tagline { font-size: 9.5px; color: #C49A6C; letter-spacing: 2px; text-transform: uppercase; margin-top: 4px; }
          .email-body { padding: 32px 28px; }
          .main-title { font-size: 21px; font-weight: bold; color: #3B2A1A; margin-top: 0; margin-bottom: 12px; }
          .message-p { font-size: 15px; line-height: 1.6; color: #5C3D1E; margin-bottom: 20px; }
          .coupon-box { background: #F5ECD7; border: 2px dashed #C49A6C; border-radius: 10px; padding: 24px; text-align: center; margin: 24px 0; }
          .coupon-code { font-size: 28px; font-weight: bold; color: #3B2A1A; letter-spacing: 4px; font-family: monospace; margin: 10px 0; }
          .btn-action { display: inline-block; background: #3B2A1A; color: #F5ECD7 !important; padding: 13px 26px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 14px; }
          .email-footer { background: #FDF6EC; padding: 20px 24px; border-top: 1px dashed #E8D5B7; text-align: center; font-size: 12px; color: #8B5E3C; line-height: 1.5; }
        </style>
      </head>
      <body>
        <div class="email-container">
          <div class="email-header">
            <div style="font-size: 28px; margin-bottom: 4px;">🏺</div>
            <div class="brand-title">Rustic Heritage</div>
            <div class="brand-tagline">HANDCRAFTED INDIAN KITCHENWARE</div>
          </div>
          
          <div class="email-body">
            <h2 class="main-title">Welcome, ${subscriberName}! 🌟</h2>
            <p class="message-p">
              Now you are a member of the community! Stay tuned for exclusive offers, artisan stories, and traditional cooking secrets.
            </p>

            <div class="coupon-box">
              <span style="font-size: 11.5px; letter-spacing: 2px; text-transform: uppercase; color: #8B5E3C; font-weight: bold; display: block;">
                COMMUNITY WELCOME GIFT
              </span>
              <p style="font-size: 14px; color: #5C3D1E; margin: 8px 0 4px 0;">
                For joining the community, your offer code is:
              </p>
              <div class="coupon-code">${couponCode}</div>
              <p style="font-size: 13px; color: #5C3D1E; margin: 6px 0 0 0;">
                Enjoy <strong>${randomPercent}% OFF</strong> on your next purchase (Orders above ₹299, max discount ₹200). Valid for 30 days.
              </p>
            </div>

            <div style="text-align: center; margin-top: 28px;">
              <a href="${siteUrl}/products" class="btn-action">Shop Now with Discount &rarr;</a>
            </div>
          </div>

          <div class="email-footer">
            Thank you for being part of our community!<br>
            <strong>Rustic Heritage Kitchenware</strong> &middot; Coimbatore, Tamil Nadu, India<br>
            Contact: <a href="mailto:mathubharathi15@gmail.com" style="color:#5C3D1E;">mathubharathi15@gmail.com</a> | <a href="tel:8072505342" style="color:#5C3D1E;">8072505342</a>
          </div>
        </div>
      </body>
      </html>
    `;

    let emailSent = false;
    if (transporter) {
      try {
        await transporter.sendMail({
          from: `Rustic Heritage Kitchenware <${process.env.SMTP_EMAIL || 'workatbuildcrew@gmail.com'}>`,
          to: email,
          subject: `🎁 Community Member Welcome! Your Code: ${couponCode}`,
          html: htmlContent,
        });
        emailSent = true;
      } catch (err) {
        console.error('Newsletter SMTP Error:', err);
      }
    }

    if (emailSent) {
      await supabase.from('subscribers').update({ email_sent: true }).eq('email', email);
    }

    return res.status(200).json({
      success: true,
      duplicate: false,
      coupon_code: couponCode,
      email_sent: emailSent,
      message: `🎉 You are successfully subscribed! Now you are a member of the community. Your welcome code is ${couponCode}.`,
    });
  } catch (err) {
    console.error('Newsletter Subscribe Error:', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
}
