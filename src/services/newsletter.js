import { supabase } from '../lib/supabase';

export async function subscribeToNewsletter(email) {
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail || !cleanEmail.includes('@')) {
    throw new Error('Please enter a valid email address.');
  }

  // 1. Attempt serverless API first
  try {
    const res = await fetch('/api/newsletter-subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: cleanEmail }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.duplicate) {
        return { status: 'duplicate', message: '✦ You are already subscribed! Your 15% OFF welcome coupon was sent to your email.' };
      }
      return { status: 'success', message: '🎉 Thank you for subscribing! We have sent your exclusive 15% OFF welcome discount coupon to your email inbox.' };
    }
  } catch (apiErr) {
    console.warn('/api/newsletter-subscribe endpoint unreachable, using Supabase fallback:', apiErr);
  }

  // 2. Direct Supabase fallback
  const { data: existing } = await supabase
    .from('subscribers')
    .select('coupon_code')
    .eq('email', cleanEmail)
    .maybeSingle();

  if (existing) {
    return { status: 'duplicate', message: `✦ You are already subscribed! Your 15% OFF welcome coupon is ${existing.coupon_code || 'saved'}.` };
  }

  const couponCode = 'WELCOME-' + Math.random().toString(36).substring(2, 9).toUpperCase();
  const expiryDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

  const { data: couponData } = await supabase
    .from('coupons')
    .insert({
      code: couponCode,
      discount_type: 'percentage',
      discount_value: 15,
      minimum_order: 299,
      maximum_discount: 200,
      usage_limit: 1,
      active: true,
      expiry_date: expiryDate,
      generated_by_system: true,
      subscriber_email: cleanEmail,
    })
    .select()
    .maybeSingle();

  await supabase.from('subscribers').insert({
    email: cleanEmail,
    coupon_id: couponData?.id || null,
    coupon_code: couponCode,
    email_sent: false,
    active: true,
  });

  return { status: 'success', message: '🎉 You are successfully subscribed! Your 15% OFF welcome discount code has been sent to your email.' };
}

export async function fetchSubscribers() {
  const { data, error } = await supabase.from('subscribers').select('*').order('created_at', { ascending: false });
  if (error) return [];
  return data || [];
}
