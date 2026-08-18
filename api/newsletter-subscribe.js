import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';
import { createHandler } from './_adapter.js';
import { buildEmailHtml } from './_email_template.js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

function getSupabase() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) return null;
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
}

function getTransporter() {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.SMTP_PORT || '465', 10);
  const user = process.env.SMTP_EMAIL;
  const pass = process.env.SMTP_PASSWORD;
  if (!user || !pass) return null;
  return nodemailer.createTransport({ host, port, secure: port === 465, auth: { user, pass } });
}

export const handler = createHandler(async (req, res) => {
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

    if (supabase) {
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

        couponCode = 'RH' + randomPercent + 'OFF-' + Math.random().toString(36).substring(2, 7).toUpperCase();
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
    } else {
      couponCode = 'RH' + randomPercent + 'OFF-' + Math.random().toString(36).substring(2, 7).toUpperCase();
    }

    const transporter = getTransporter();
    const siteUrl = process.env.PUBLIC_SITE_URL || 'https://rustic-heritage.netlify.app';
    const subscriberName = name || 'Heritage Fan';

    const mainContentHtml = `
      <p style="font-size: 14.5px; line-height: 1.8; color: #D4C3AC; margin-bottom: 20px;">
        Thank you for subscribing. Here is your exclusive <strong>${randomPercent}% off</strong> discount code:
      </p>

      <div style="background: #1C130B; border: 1px dashed #855320; border-radius: 4px; padding: 24px; text-align: center; margin: 24px 0;">
        <span style="font-size: 9px; letter-spacing: 2px; text-transform: uppercase; color: #C49A6C; font-weight: bold; display: block;">
          YOUR EXCLUSIVE DISCOUNT CODE
        </span>
        <div style="font-size: 26px; font-weight: bold; color: #F5ECD7; letter-spacing: 4px; font-family: monospace; margin: 10px 0;">
          ${couponCode}
        </div>
        <div style="font-size: 11.5px; color: #9E836A;">
          ${randomPercent}% off &middot; One-time use &middot; Valid 30 days
        </div>
      </div>

      <div style="text-align: left; margin-top: 28px;">
        <a href="${siteUrl}" class="btn-gold">VISIT WEBSITE &rarr;</a>
      </div>
    `;

    const htmlContent = buildEmailHtml({
      headerTitle: 'Rustic Heritage',
      headerSub: 'WELCOME TO THE CIRCLE',
      greeting: `Hello, ${subscriberName}! 🏺`,
      mainContentHtml,
      siteUrl,
      recipientEmail: email,
    });

    let emailSent = false;
    if (transporter) {
      try {
        await transporter.sendMail({
          from: `Rustic Heritage Kitchenware <${process.env.SMTP_EMAIL}>`,
          to: email,
          subject: `🏺 Welcome to the Circle — Your ${randomPercent}% Discount Inside!`,
          html: htmlContent,
        });
        emailSent = true;
      } catch (err) {
        console.error('Newsletter SMTP Error:', err);
      }
    }

    if (emailSent && supabase) {
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
});

export default handler;
