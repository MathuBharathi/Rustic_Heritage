/* ══════════════════════════════════════════════
   RUSTIC HERITAGE KITCHENWARE — payment.js
   Razorpay UPI + COD + Coupon + Invoice
   ══════════════════════════════════════════════ */

const RH_CONFIG = {
  RAZORPAY_KEY_ID: 'rzp_live_SYimvpChyTjZeQ',
  MERCHANT_NAME: 'Rustic Heritage Kitchenware',
  BUSINESS_ADDRESS: 'Coimbatore, Tamil Nadu, India',
  API_BASE: '',
};

const SUPABASE_URL = 'https://tlhhxpttifgtgnrzjrga.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRsaGh4cHR0aWZndGducnpqcmdhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMyOTQ2MDUsImV4cCI6MjA5ODg3MDYwNX0.ZYB12Ekl1EImXRdxvyGNEvXLxnNOe-36oxvo3z4gSI0';

/* ── Payment State ── */
const RH_PAY = {
  currentOrderId: null,
  currentPaymentId: null,
  processing: false,
  appliedCoupon: null,  // { code, discount_type, discount_value, free_delivery, coupon_id }
};

/* ══════════════════════════════════════════════
   LOAD RAZORPAY SDK
══════════════════════════════════════════════ */
function loadRazorpay() {
  return new Promise(resolve => {
    if (window.Razorpay) { resolve(true); return; }
    const s = document.createElement('script');
    s.src = 'https://checkout.razorpay.com/v1/checkout.js';
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.head.appendChild(s);
  });
}

/* ══════════════════════════════════════════════
   HELPER — get Supabase client
══════════════════════════════════════════════ */
function getRHPayClient() {
  if (window._rhPayClient) return window._rhPayClient;
  if (window.supabase && window.supabase.createClient) {
    window._rhPayClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON);
    return window._rhPayClient;
  }
  return null;
}

/* ══════════════════════════════════════════════
   COUPON VALIDATION
══════════════════════════════════════════════ */
async function rhApplyCoupon() {
  const input = document.getElementById('rh-coupon-input');
  const msgEl = document.getElementById('rh-coupon-msg');
  const btn = document.getElementById('rh-coupon-apply-btn');
  const code = (input?.value || '').trim().toUpperCase();

  if (!code) { rhShowCouponMsg('Enter a coupon code', 'error'); return; }

  btn.disabled = true;
  btn.textContent = '⏳';
  rhShowCouponMsg('Validating…', 'info');

  try {
    const sb = getRHPayClient();
    if (!sb) throw new Error('Service unavailable');

    const { data: coupons, error } = await sb
      .from('coupons')
      .select('*')
      .eq('code', code)
      .eq('active', true)
      .limit(1);

    if (error || !coupons || coupons.length === 0) {
      rhShowCouponMsg('❌ Invalid or expired coupon code', 'error');
      btn.disabled = false; btn.textContent = 'Apply';
      return;
    }

    const coupon = coupons[0];

    // Check expiry
    if (coupon.expiry_date && new Date(coupon.expiry_date) < new Date()) {
      rhShowCouponMsg('❌ This coupon has expired', 'error');
      btn.disabled = false; btn.textContent = 'Apply';
      return;
    }

    // Check usage limit
    if (coupon.usage_limit !== null && coupon.used_count >= coupon.usage_limit) {
      rhShowCouponMsg('❌ This coupon has reached its usage limit', 'error');
      btn.disabled = false; btn.textContent = 'Apply';
      return;
    }

    // Check minimum order
    const sub = CART.subtotal();
    if (coupon.minimum_order && sub < coupon.minimum_order) {
      rhShowCouponMsg(`❌ Minimum order ₹${coupon.minimum_order} required for this coupon`, 'error');
      btn.disabled = false; btn.textContent = 'Apply';
      return;
    }

    // Calculate discount
    let discountAmt = 0;
    if (coupon.discount_type === 'percentage') {
      discountAmt = Math.round(sub * coupon.discount_value / 100);
      if (coupon.maximum_discount) discountAmt = Math.min(discountAmt, coupon.maximum_discount);
    } else {
      discountAmt = Math.min(coupon.discount_value, sub);
    }

    RH_PAY.appliedCoupon = {
      code: coupon.code,
      coupon_id: coupon.id,
      discount_type: coupon.discount_type,
      discount_value: coupon.discount_value,
      discount_amount: discountAmt,
      free_delivery: coupon.free_delivery || false,
    };

    // Update checkout summary display
    rhUpdateCheckoutSummary();

    const freeDeliveryTxt = coupon.free_delivery ? ' + Free delivery!' : '';
    rhShowCouponMsg(`✅ Coupon applied! You save ₹${discountAmt}${freeDeliveryTxt}`, 'success');
    btn.textContent = '✓';
    if (input) { input.disabled = true; }

  } catch (e) {
    console.error('Coupon validation error:', e);
    rhShowCouponMsg('❌ Could not validate coupon. Try again.', 'error');
    btn.disabled = false; btn.textContent = 'Apply';
  }
}

function rhRemoveCoupon() {
  RH_PAY.appliedCoupon = null;
  const input = document.getElementById('rh-coupon-input');
  const btn = document.getElementById('rh-coupon-apply-btn');
  if (input) { input.value = ''; input.disabled = false; }
  if (btn) { btn.disabled = false; btn.textContent = 'Apply'; }
  rhShowCouponMsg('', '');
  rhUpdateCheckoutSummary();
}

function rhShowCouponMsg(msg, type) {
  const el = document.getElementById('rh-coupon-msg');
  if (!el) return;
  el.textContent = msg;
  el.style.color = type === 'error' ? '#a00' : type === 'success' ? '#1a5c34' : '#8B5E3C';
}

function rhUpdateCheckoutSummary() {
  const coupon = RH_PAY.appliedCoupon;
  const sub = CART.subtotal();
  const discount = coupon?.discount_amount || 0;
  const freeDeliv = coupon?.free_delivery || false;
  const del = CART.delivery(freeDeliv);
  const tax = CART.tax();
  const total = CART.total(discount, freeDeliv);
  const fmtR = n => `₹${n.toLocaleString('en-IN')}`;

  const subEl = document.getElementById('rh-co-sub-val');
  const discEl = document.getElementById('rh-co-discount-row');
  const delEl = document.getElementById('rh-co-del-val');
  const taxEl = document.getElementById('rh-co-tax-val');
  const totEl = document.getElementById('rh-co-total-val');
  const btnEl = document.getElementById('rh-co-confirm-btn');

  if (subEl) subEl.textContent = fmtR(sub);
  if (delEl) delEl.textContent = freeDeliv ? 'FREE ✓' : fmtR(del);
  if (taxEl) taxEl.textContent = fmtR(tax);
  if (totEl) totEl.textContent = fmtR(total);
  if (btnEl && !RH_PAY.processing) btnEl.textContent = `Confirm Order — ${fmtR(total)} →`;

  if (discEl) {
    if (discount > 0) {
      discEl.style.display = '';
      const discAmt = discEl.querySelector('.rh-co-disc-amt');
      if (discAmt) discAmt.textContent = `-${fmtR(discount)}`;
    } else {
      discEl.style.display = 'none';
    }
  }
}

/* ══════════════════════════════════════════════
   HELPER — reset confirm button
══════════════════════════════════════════════ */
function rhResetConfirmBtn(total) {
  const btn = document.getElementById('rh-co-confirm-btn');
  if (btn) {
    btn.disabled = false;
    btn.textContent = `Confirm Order — ₹${(total || 0).toLocaleString('en-IN')} →`;
  }
  RH_PAY.processing = false;
}

/* ══════════════════════════════════════════════
   CREATE RAZORPAY ORDER → server.py
══════════════════════════════════════════════ */
async function rhCreateRazorpayOrder(amountInRupees, customerInfo) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);
  try {
    const res = await fetch('/api/create-razorpay-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        amount: Math.round(amountInRupees * 100),
        currency: 'INR',
        receipt: `rh_${Date.now()}`,
        notes: {
          customer_name: customerInfo.name,
          customer_email: customerInfo.email,
          customer_phone: customerInfo.phone,
        },
      }),
    });
    clearTimeout(timer);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (e) {
    clearTimeout(timer);
    throw e;
  }
}

/* ══════════════════════════════════════════════
   VERIFY PAYMENT → Vercel API
══════════════════════════════════════════════ */
async function rhVerifyPayment(payload) {
  try {
    const res = await fetch('/api/verify-razorpay-payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const d = await res.json();
    return d.verified === true;
  } catch {
    return true; // Allow if server unreachable
  }
}

/* ══════════════════════════════════════════════
   SAVE ORDER DIRECTLY TO SUPABASE
   (no dependency on server.py for this)
══════════════════════════════════════════════ */
async function rhSaveOrderToSupabase(orderData) {
  const sb = getRHPayClient();
  if (!sb) {
    console.warn('RH: No Supabase client for order save');
    return null;
  }

  try {
    // 1. Get current user profile id (if logged in)
    let userProfileId = null;
    try {
      const { data: { session } } = await sb.auth.getSession();
      if (session?.user) {
        const { data: profile } = await sb
          .from('user_profiles')
          .select('id')
          .eq('auth_user_id', session.user.id)
          .single();
        if (profile) userProfileId = profile.id;
      }
    } catch (e) { /* not logged in, guest order */ }

    // 2. Insert order
    const orderRow = {
      order_number: orderData.order_id,
      user_id: userProfileId,
      customer_name: orderData.customer_name,
      customer_email: orderData.customer_email,
      customer_phone: orderData.customer_phone,
      delivery_address: orderData.delivery_address,
      delivery_city: orderData.delivery_city,
      delivery_state: orderData.delivery_state,
      delivery_pin: orderData.delivery_pin,
      payment_method: orderData.payment_method,
      payment_status: orderData.payment_status,
      payment_id: orderData.payment_id || null,
      order_status: 'confirmed',
      subtotal: orderData.subtotal,
      delivery_charge: orderData.delivery_charge,
      discount: orderData.discount || 0,
      gst: orderData.tax,
      total_amount: orderData.total,
      coupon_id: orderData.coupon_id || null,
      coupon_code: orderData.coupon_code || null,
    };

    const { data: insertedOrder, error: orderError } = await sb
      .from('orders')
      .insert(orderRow)
      .select('id')
      .single();

    if (orderError) {
      console.error('RH: Order insert error:', orderError);
      // Fallback: try server.py
      return await rhSaveOrderViaServer(orderData);
    }

    const orderId = insertedOrder.id;

    // 3. Insert order items
    const itemRows = (orderData.items || []).map(item => ({
      order_id: orderId,
      product_id: item.id || null,
      product_name: item.name,
      quantity: item.qty,
      price: item.price,
      total: item.total,
    }));

    if (itemRows.length > 0) {
      const { error: itemsError } = await sb.from('order_items').insert(itemRows);
      if (itemsError) console.warn('RH: Order items insert error:', itemsError);
    }

    // 4. Record coupon usage and increment used_count
    if (orderData.coupon_id) {
      try {
        await sb.from('coupon_usage').insert({
          coupon_id: orderData.coupon_id,
          coupon_code: orderData.coupon_code || null,
          user_id: userProfileId || null,
          user_name: orderData.customer_name || 'Customer',
          order_id: orderId,
        });

        const { data: cpData } = await sb.from('coupons').select('used_count').eq('id', orderData.coupon_id).single();
        if (cpData) {
          await sb.from('coupons').update({ used_count: (cpData.used_count || 0) + 1 }).eq('id', orderData.coupon_id);
        }
      } catch (e) { console.warn('RH: Coupon usage record failed:', e); }
    }

    console.log('✅ RH: Order saved to Supabase:', orderId);
    return { id: orderId, ok: true };

  } catch (err) {
    console.error('RH: Supabase order save error:', err);
    return await rhSaveOrderViaServer(orderData);
  }
}

/* ── Fallback: save via server.py ── */
async function rhSaveOrderViaServer(orderData) {
  try {
    const res = await fetch(`${RH_CONFIG.API_BASE}/api/save-order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData),
    });
    const d = await res.json();
    if (d && !d.error) {
      for (const item of (orderData.items || [])) {
        await fetch(`${RH_CONFIG.API_BASE}/api/save-order-item`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            order_id: orderData.order_id, product_name: item.name,
            price: item.price, quantity: item.qty, total: item.total,
          }),
        }).catch(() => { });
      }
    }
    return d;
  } catch (err) {
    console.error('RH: Server order save also failed:', err);
    return null;
  }
}

/* ══════════════════════════════════════════════
   SEND EMAIL → server.py
══════════════════════════════════════════════ */
async function rhSendEmailViaServer(payload) {
  try {
    const res = await fetch('/api/send-order-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return await res.json();
  } catch (err) {
    console.warn('RH: Email send error:', err);
    return null;
  }
}

/* ══════════════════════════════════════════════
   BUILD ORDER EMAIL HTML
══════════════════════════════════════════════ */
function rhBuildOrderEmailHTML(order) {
  const isCOD = order.payment_method === 'cod';
  const date = new Date(order.created_at || Date.now()).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'long', year: 'numeric',
  });
  const itemsHTML = (order.items || []).map(i => `
    <tr>
      <td style="padding:12px 14px;border-bottom:1px solid #E8D5B7;font-size:14px;color:#3B2A1A">${i.name}</td>
      <td style="padding:12px 14px;border-bottom:1px solid #E8D5B7;text-align:center;font-size:14px;color:#5C3D1E">×${i.qty}</td>
      <td style="padding:12px 14px;border-bottom:1px solid #E8D5B7;text-align:right;font-size:14px;color:#8B5E3C">₹${i.price.toLocaleString('en-IN')}</td>
      <td style="padding:12px 14px;border-bottom:1px solid #E8D5B7;text-align:right;font-size:14px;font-weight:700;color:#5C3D1E">₹${i.total.toLocaleString('en-IN')}</td>
    </tr>`).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"/><title>Order ${order.order_id} — Rustic Heritage</title></head>
<body style="margin:0;padding:0;background:#F5ECD7;font-family:'Georgia',serif">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr><td align="center" style="padding:48px 20px">
      <table width="640" cellpadding="0" cellspacing="0"
             style="background:#FDF6EC;border:1px solid #E8D5B7;border-top:4px solid #C49A6C;max-width:640px">
        <tr><td style="background:linear-gradient(135deg,#5C3D1E 0%,#8B5E3C 60%,#5C3D1E 100%);padding:28px 36px">
          <table width="100%" cellpadding="0" cellspacing="0"><tr>
            <td>
              <h1 style="margin:0;color:#FDF6EC;font-size:24px;font-family:'Georgia',serif">
                🏺 Rustic Heritage <span style="color:#C49A6C;font-style:italic">Kitchenware</span>
              </h1>
              <p style="margin:5px 0 0;color:rgba(196,154,108,0.7);font-size:10px;letter-spacing:4px;text-transform:uppercase">
                ${isCOD ? '✦ Cash on Delivery Order ✦' : '✦ Order Confirmed ✦'}
              </p>
            </td>
            <td align="right">
              <div style="background:rgba(196,154,108,0.2);border:1px solid rgba(196,154,108,0.4);padding:10px 16px;text-align:center">
                <div style="font-size:10px;letter-spacing:2px;color:rgba(196,154,108,0.8);text-transform:uppercase;margin-bottom:4px">Order ID</div>
                <div style="font-size:16px;color:#C49A6C;font-weight:700;letter-spacing:1px">${order.order_id}</div>
              </div>
            </td>
          </tr></table>
        </td></tr>
        <tr><td style="height:3px;background:linear-gradient(90deg,#C49A6C,#8B5E3C,#C49A6C)"></td></tr>
        ${isCOD ? `
        <tr><td style="background:#fff8e8;border-bottom:1px solid #E8D5B7;padding:14px 36px">
          <p style="margin:0;font-size:14px;color:#8B5E3C;font-style:italic">
            📦 <strong>Cash on Delivery</strong> — Please keep
            <strong style="color:#5C3D1E">₹${(order.total || 0).toLocaleString('en-IN')}</strong>
            ready when your order arrives.
          </p>
        </td></tr>` : ''}
        <tr><td style="padding:28px 36px 20px">
          <h2 style="margin:0 0 8px;color:#5C3D1E;font-size:22px">
            ${isCOD ? `Your order is placed, ${order.customer_name}!` : `Order confirmed, ${order.customer_name}! 🎉`}
          </h2>
          <p style="margin:0;font-size:13px;color:#8B5E3C;font-style:italic">Placed on ${date}</p>
        </td></tr>
        <tr><td style="padding:0 36px 8px">
          <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;border:1px solid #E8D5B7">
            <thead>
              <tr style="background:#F5ECD7">
                <th style="padding:10px 14px;text-align:left;font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#8B5E3C;font-weight:400">Item</th>
                <th style="padding:10px 14px;text-align:center;font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#8B5E3C;font-weight:400">Qty</th>
                <th style="padding:10px 14px;text-align:right;font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#8B5E3C;font-weight:400">Price</th>
                <th style="padding:10px 14px;text-align:right;font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#8B5E3C;font-weight:400">Total</th>
              </tr>
            </thead>
            <tbody>${itemsHTML}</tbody>
          </table>
        </td></tr>
        <tr><td style="padding:12px 36px 24px">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr><td align="right" style="padding:4px 0;font-size:13px;color:#8B5E3C">Subtotal: <strong>₹${(order.subtotal || 0).toLocaleString('en-IN')}</strong></td></tr>
            ${order.discount > 0 ? `<tr><td align="right" style="padding:4px 0;font-size:13px;color:#1a5c34">Discount: <strong>-₹${order.discount.toLocaleString('en-IN')}</strong></td></tr>` : ''}
            <tr><td align="right" style="padding:4px 0;font-size:13px;color:#8B5E3C">Delivery: <strong>${order.delivery_charge === 0 ? 'FREE' : '₹' + order.delivery_charge}</strong></td></tr>
            <tr><td align="right" style="padding:4px 0;font-size:13px;color:#8B5E3C">GST (5%): <strong>₹${(order.tax || 0).toLocaleString('en-IN')}</strong></td></tr>
            <tr><td align="right" style="padding:14px 0 0;font-size:20px;font-weight:700;color:#5C3D1E;border-top:2px solid #C49A6C">
              ${isCOD ? 'Amount to Pay' : 'Total Paid'}: <span style="color:#8B5E3C">₹${(order.total || 0).toLocaleString('en-IN')}</span>
            </td></tr>
          </table>
        </td></tr>
        <tr><td style="padding:20px 36px 24px;background:#F5ECD7;border-top:1px solid #E8D5B7;border-bottom:1px solid #E8D5B7">
          <p style="margin:0 0 10px;font-size:10px;letter-spacing:3px;text-transform:uppercase;color:#C49A6C">Delivery Address</p>
          <p style="margin:0;font-size:14px;color:#5C3D1E;line-height:1.8">
            <strong>${order.customer_name}</strong><br/>
            ${order.delivery_address || ''}<br/>
            ${order.delivery_city || ''}, ${order.delivery_state || ''} — ${order.delivery_pin || ''}
          </p>
        </td></tr>
        <tr><td style="padding:22px 36px 28px;text-align:center">
          <p style="margin:0 0 6px;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#C49A6C">
            ✦ &nbsp; Rustic Heritage Kitchenware &nbsp;·&nbsp; Coimbatore, Tamil Nadu &nbsp; ✦
          </p>
          <p style="margin:0;font-size:11px;color:#8B5E3C;font-style:italic">
            Crafted with love · Thank you for your order!
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

/* ══════════════════════════════════════════════
   GENERATE ORDER ID
══════════════════════════════════════════════ */
function rhGenerateOrderId() {
  return `RH${Math.floor(Math.random() * 90000 + 10000)}`;
}

/* ══════════════════════════════════════════════
   INITIATE RAZORPAY PAYMENT
══════════════════════════════════════════════ */
async function rhInitiatePayment(orderInfo) {
  if (orderInfo.payMethod === 'cod') {
    return await rhHandleCOD(orderInfo);
  }

  RH_PAY.processing = true;
  const loaded = await loadRazorpay();
  if (!loaded) {
    alert('Could not load payment gateway. Please check your internet connection and try again.');
    rhResetConfirmBtn(orderInfo.total);
    return;
  }

  let rzpOrderId = undefined;
  try {
    const rzpOrder = await rhCreateRazorpayOrder(orderInfo.total, orderInfo);
    if (rzpOrder && rzpOrder.id) rzpOrderId = rzpOrder.id;
  } catch (e) {
    console.warn('RH: Server unreachable, proceeding without order_id');
  }

  RH_PAY.currentOrderId = rhGenerateOrderId();

  const options = {
    key: RH_CONFIG.RAZORPAY_KEY_ID,
    amount: Math.round(orderInfo.total * 100),
    currency: 'INR',
    name: RH_CONFIG.MERCHANT_NAME,
    description: `Order ${RH_PAY.currentOrderId}`,
    ...(rzpOrderId ? { order_id: rzpOrderId } : {}),
    prefill: {
      name: orderInfo.name,
      email: orderInfo.email,
      contact: orderInfo.phone,
    },
    theme: { color: '#5C3D1E' },
    modal: {
      ondismiss: () => {
        rhResetConfirmBtn(orderInfo.total);
        console.log('RH: Payment cancelled by user');
      }
    },
    handler: async function (response) {
      const verified = await rhVerifyPayment({
        razorpay_order_id: response.razorpay_order_id,
        razorpay_payment_id: response.razorpay_payment_id,
        razorpay_signature: response.razorpay_signature,
      });

      if (!verified) {
        alert('Payment verification failed. Please contact support.');
        rhResetConfirmBtn(orderInfo.total);
        return;
      }

      RH_PAY.currentPaymentId = response.razorpay_payment_id;

      const orderRow = {
        order_id: RH_PAY.currentOrderId,
        customer_name: orderInfo.name,
        customer_email: orderInfo.email,
        customer_phone: orderInfo.phone,
        delivery_address: orderInfo.address,
        delivery_city: orderInfo.city,
        delivery_state: orderInfo.state,
        delivery_pin: orderInfo.pin,
        items: orderInfo.items,
        subtotal: orderInfo.subtotal,
        delivery_charge: orderInfo.delivery_charge,
        discount: orderInfo.discount || 0,
        tax: orderInfo.tax,
        total: orderInfo.total,
        payment_method: orderInfo.payMethod,
        payment_id: response.razorpay_payment_id,
        payment_status: 'paid',
        coupon_id: orderInfo.coupon_id || null,
        coupon_code: orderInfo.coupon_code || null,
        created_at: new Date().toISOString(),
      };

      await rhSaveOrderToSupabase(orderRow).catch(e => console.warn('RH: Could not save order:', e));
      await rhSendEmailViaServer({
        to: [orderInfo.email],
        subject: `✅ Order Confirmed — ${RH_PAY.currentOrderId} | Rustic Heritage Kitchenware`,
        html: rhBuildOrderEmailHTML(orderRow),
      }).catch(e => console.warn('RH: Could not send email:', e));

      RH_PAY.processing = false;
      console.log('✅ RH: Payment complete, order saved, email sent');
      document.dispatchEvent(new CustomEvent('rh-order-success', { detail: orderRow }));
    },
  };

  const rzp = new window.Razorpay(options);
  rzp.on('payment.failed', function (resp) {
    alert(`Payment failed: ${resp.error.description}`);
    rhResetConfirmBtn(orderInfo.total);
  });
  rzp.open();
}

/* ══════════════════════════════════════════════
   CASH ON DELIVERY
══════════════════════════════════════════════ */
async function rhHandleCOD(orderInfo) {
  RH_PAY.processing = true;
  RH_PAY.currentOrderId = rhGenerateOrderId();

  const orderRow = {
    order_id: RH_PAY.currentOrderId,
    customer_name: orderInfo.name,
    customer_email: orderInfo.email,
    customer_phone: orderInfo.phone,
    delivery_address: orderInfo.address,
    delivery_city: orderInfo.city,
    delivery_state: orderInfo.state,
    delivery_pin: orderInfo.pin,
    items: orderInfo.items,
    subtotal: orderInfo.subtotal,
    delivery_charge: orderInfo.delivery_charge,
    discount: orderInfo.discount || 0,
    tax: orderInfo.tax,
    total: orderInfo.total,
    payment_method: 'cod',
    payment_id: null,
    payment_status: 'pending',
    coupon_id: orderInfo.coupon_id || null,
    coupon_code: orderInfo.coupon_code || null,
    created_at: new Date().toISOString(),
  };

  await rhSaveOrderToSupabase(orderRow).catch(e => console.warn('RH: Could not save order:', e));
  await rhSendEmailViaServer({
    to: [orderInfo.email],
    subject: `📦 Order Confirmed (Pay on Delivery) — ${RH_PAY.currentOrderId} | Rustic Heritage`,
    html: rhBuildOrderEmailHTML(orderRow),
  }).catch(e => console.warn('RH: Could not send email:', e));

  RH_PAY.processing = false;
  console.log('✅ RH: COD order placed, email sent');
  document.dispatchEvent(new CustomEvent('rh-order-success', { detail: orderRow }));
  return orderRow;
}

/* ══════════════════════════════════════════════
   DOWNLOAD INVOICE
══════════════════════════════════════════════ */
function rhDownloadInvoice(order) {
  if (!order) return;

  const status = order.order_status || order.status || '';
  const isCancelled = status === 'cancelled';
  const isRejected = status === 'rejected';
  const isDelivered = status === 'delivered';

  /* Build watermark HTML */
  const watermarkConfig = {
    cancelled: { text: 'CANCELLED', color: 'rgba(220,38,38,0.18)', textColor: '#dc2626' },
    rejected: { text: 'REJECTED', color: 'rgba(153,27,27,0.18)', textColor: '#991b1b' },
  };
  const wmConf = isCancelled ? watermarkConfig.cancelled : (isRejected ? watermarkConfig.rejected : null);
  const watermarkHTML = wmConf ? `
    <div style="
      position:fixed;top:50%;left:50%;transform:translate(-50%,-50%) rotate(-35deg);
      font-size:92px;font-weight:bold;color:${wmConf.textColor};opacity:0.15;
      letter-spacing:6px;white-space:nowrap;pointer-events:none;z-index:0;
      font-family:'Georgia',serif;border:8px solid ${wmConf.textColor};
      padding:10px 24px;border-radius:8px;
    ">${wmConf.text}</div>` : '';

  const statusBanner = (isCancelled || isRejected) ? `
    <div style="background:${isCancelled ? '#fef2f2' : '#fff1f2'};border:1px solid ${isCancelled ? '#fca5a5' : '#fda4af'};
         border-radius:6px;padding:14px 18px;margin-bottom:20px;text-align:center">
      <div style="font-size:20px;margin-bottom:6px">${isCancelled ? '❌' : '🚫'}</div>
      <strong style="color:${isCancelled ? '#dc2626' : '#991b1b'};font-size:16px">
        Order ${status.toUpperCase()}
      </strong>
      ${order.rejection_reason ? `<br/><span style="font-size:13px;color:#666;margin-top:6px;display:block">
        Reason: ${order.rejection_reason}
      </span>` : ''}
    </div>` : (isDelivered ? `
    <div style="background:#f0fdf4;border:1px solid #86efac;border-radius:6px;padding:14px 18px;margin-bottom:20px;text-align:center">
      <div style="font-size:20px;margin-bottom:6px">✅</div>
      <strong style="color:#16a34a;font-size:15px">Order Delivered</strong>
      ${order.delivered_at ? `<br/><span style="font-size:12px;color:#666">on ${new Date(order.delivered_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}</span>` : ''}
    </div>` : '');

  const win = window.open('', '_blank', 'width=800,height=900');
  win.document.write(`<!DOCTYPE html><html><head>
    <title>Invoice — ${order.order_id} | Rustic Heritage</title>
    <style>
      *{box-sizing:border-box;margin:0;padding:0}
      body{font-family:'Georgia',serif;background:#fff;color:#3B2A1A;padding:40px;font-size:14px;position:relative}
      .header{background:#5C3D1E;color:#FDF6EC;padding:24px 32px}
      .header h1{font-size:26px} .header h1 span{color:#C49A6C;font-style:italic}
      .header p{font-size:11px;color:rgba(196,154,108,0.7);letter-spacing:3px;margin-top:4px}
      .gold-bar{height:4px;background:linear-gradient(90deg,#C49A6C,#8B5E3C,#C49A6C)}
      .body{padding:32px;position:relative;z-index:1}
      .invoice-title{font-size:24px;color:#5C3D1E;margin-bottom:6px}
      .invoice-sub{font-size:13px;color:#8B5E3C;font-style:italic;margin-bottom:28px}
      .meta-grid{display:grid;grid-template-columns:1fr 1fr;gap:20px;background:#F5ECD7;padding:20px;border-left:4px solid #C49A6C;margin-bottom:28px}
      .meta-label{font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#C49A6C;margin-bottom:5px}
      .meta-val{font-size:13px;color:#5C3D1E;line-height:1.6}
      table{width:100%;border-collapse:collapse;margin-bottom:24px}
      thead tr{background:#F5ECD7}
      th{padding:11px 14px;text-align:left;font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:#8B5E3C}
      td{padding:11px 14px;border-bottom:1px solid #E8D5B7;font-size:13px;color:#5C3D1E}
      .total-row{display:flex;justify-content:flex-end;gap:80px;padding:5px 0;font-size:13px;color:#8B5E3C}
      .discount-row{display:flex;justify-content:flex-end;gap:80px;padding:5px 0;font-size:13px;color:#1a5c34}
      .grand-total{display:flex;justify-content:flex-end;gap:80px;padding:12px 0;font-size:18px;font-weight:700;color:#5C3D1E;border-top:2px solid #C49A6C;margin-top:8px}
      .grand-total span:last-child{color:#8B5E3C}
      .footer{margin-top:36px;padding-top:20px;border-top:1px solid #E8D5B7;text-align:center;font-size:11px;color:#8B5E3C;font-style:italic;line-height:1.7}
      @media print{body{padding:0}.no-print{display:none}}
    </style></head><body>
    ${watermarkHTML}
    <div class="header">
      <h1>🏺 Rustic Heritage <span>Kitchenware</span></h1>
      <p>✦ ROOTED IN TRADITION ✦</p>
    </div>
    <div class="gold-bar"></div>
    <div class="body">
      <button class="no-print" onclick="window.print()" style="margin-bottom:20px;padding:9px 22px;background:#5C3D1E;color:#fff;border:none;cursor:pointer;font-size:14px;border-radius:6px;">🖨 Print / Save as PDF</button>
      ${statusBanner}
      <h2 class="invoice-title">TAX INVOICE</h2>
      <p class="invoice-sub">Order ID: ${order.order_id} &nbsp;·&nbsp; ${new Date(order.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
      <div class="meta-grid">
        <div><div class="meta-label">Bill To</div><div class="meta-val"><strong>${order.customer_name}</strong><br/>${order.customer_email}<br/>${order.customer_phone || ''}</div></div>
        <div><div class="meta-label">Delivery Address</div><div class="meta-val">${order.delivery_address}<br/>${order.delivery_city}, ${order.delivery_state}<br/>PIN: ${order.delivery_pin}</div></div>
        <div><div class="meta-label">Payment</div><div class="meta-val">${(order.payment_method || '').toUpperCase()}<br/><span style="font-size:11px;color:#8B5E3C">${order.payment_id || 'N/A'}</span></div></div>
        <div><div class="meta-label">Sold By</div><div class="meta-val">Rustic Heritage Kitchenware<br/>Coimbatore, Tamil Nadu</div></div>
      </div>
      <table>
        <thead><tr><th>Item</th><th style="text-align:center">Qty</th><th style="text-align:right">Unit Price</th><th style="text-align:right">Amount</th></tr></thead>
        <tbody>${(order.items || []).map(i => `<tr><td>${i.name}</td><td style="text-align:center">${i.qty}</td><td style="text-align:right">₹${i.price.toLocaleString('en-IN')}</td><td style="text-align:right">₹${i.total.toLocaleString('en-IN')}</td></tr>`).join('')}</tbody>
      </table>
      <div>
        <div class="total-row"><span>Subtotal</span><span>₹${(order.subtotal || 0).toLocaleString('en-IN')}</span></div>
        ${(order.discount > 0) ? `<div class="discount-row"><span>Discount (${order.coupon_code || ''})</span><span>-₹${order.discount.toLocaleString('en-IN')}</span></div>` : ''}
        <div class="total-row"><span>Delivery</span><span>${order.delivery_charge === 0 ? 'FREE' : '₹' + order.delivery_charge}</span></div>
        <div class="total-row"><span>GST (5%)</span><span>₹${(order.tax || 0).toLocaleString('en-IN')}</span></div>
        <div class="grand-total"><span>Total</span><span>₹${(order.total || 0).toLocaleString('en-IN')}</span></div>
      </div>
      <div class="footer">
        ✦ Thank you for choosing Rustic Heritage Kitchenware ✦<br/>
        This is a computer-generated invoice. No signature required.<br/>
        Coimbatore, Tamil Nadu, India
        ${(isCancelled || isRejected) ? `<br/><br/><em style="color:#dc2626">This invoice is for a ${status} order and is NOT valid for any claims.</em>` : ''}
      </div>
    </div>
  </body></html>`);
  win.document.close();
}


/* ══════════════════════════════════════════════
   CHECKOUT MODAL — rhOpenCheckout()
══════════════════════════════════════════════ */
function rhOpenCheckout() {
  if (!document.getElementById('rh-checkout-styles')) {
    const s = document.createElement('style');
    s.id = 'rh-checkout-styles';
    s.textContent = `
      #rh-checkout-overlay {
        position:fixed;inset:0;z-index:3000;background:rgba(0,0,0,0);pointer-events:none;
        transition:background 0.3s ease;font-family:'Georgia',serif;
      }
      #rh-checkout-overlay.open { background:rgba(20,10,5,0.45);pointer-events:all; }
      #rh-checkout-card {
        position:fixed;top:0;right:-480px;width:460px;max-width:92vw;height:100vh;
        background:#FDF6EC;border-radius:0;overflow-y:auto;
        box-shadow:-8px 0 40px rgba(92,61,30,0.35);
        transition:right 0.35s cubic-bezier(0.4,0,0.2,1);
      }
      #rh-checkout-overlay.open #rh-checkout-card { right:0; }
      .rh-co-header {
        background:linear-gradient(135deg,#3B2A1A 0%,#5C3D1E 60%,#3B2A1A 100%);
        padding:20px 26px 16px;display:flex;align-items:center;justify-content:space-between;
        position:sticky;top:0;z-index:10;
      }
      .rh-co-title { color:#F5ECD7;font-size:18px;font-weight:bold;letter-spacing:0.5px; }
      .rh-co-close {
        background:none;border:none;color:#C49A6C;font-size:20px;cursor:pointer;
        width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;
        transition:background 0.2s;
      }
      .rh-co-close:hover { background:rgba(196,154,108,0.2); }
      .rh-co-goldbar { height:3px;background:linear-gradient(90deg,#C49A6C,#8B5E3C,#C49A6C); }
      .rh-co-body { padding:22px 26px; }
      .rh-co-label {
        font-size:11px;letter-spacing:2px;text-transform:uppercase;
        color:#C49A6C;margin-bottom:10px;font-weight:bold;display:block;
      }
      .rh-co-row { display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px; }
      .rh-co-row.single { grid-template-columns:1fr; }
      .rh-co-field { display:flex;flex-direction:column;gap:5px; }
      .rh-co-field label { font-size:12px;color:#8B5E3C; }
      .rh-co-field input {
        padding:9px 12px;border:1.5px solid #E8D5B7;border-radius:6px;
        font-size:14px;font-family:'Georgia',serif;color:#3B2A1A;
        background:#fff;outline:none;transition:border-color 0.2s;width:100%;box-sizing:border-box;
      }
      .rh-co-field input:focus { border-color:#C49A6C; }
      .rh-co-summary {
        background:#F5ECD7;border-radius:8px;padding:14px 16px;
        margin-bottom:20px;border:1px solid #E8D5B7;
      }
      .rh-co-summary-row { display:flex;justify-content:space-between;font-size:13px;color:#8B5E3C;padding:3px 0; }
      .rh-co-summary-total {
        display:flex;justify-content:space-between;font-size:16px;
        font-weight:bold;color:#5C3D1E;padding-top:10px;
        margin-top:8px;border-top:2px solid #C49A6C;
      }
      .rh-co-pay-methods { display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;margin-bottom:18px; }
      .rh-co-pay-btn {
        padding:12px 8px;border:2px solid #E8D5B7;border-radius:8px;
        background:#fff;cursor:pointer;text-align:center;font-family:'Georgia',serif;
        font-size:13px;color:#5C3D1E;transition:all 0.2s;
      }
      .rh-co-pay-btn:hover { border-color:#C49A6C;background:#FDF6EC; }
      .rh-co-pay-btn.selected { border-color:#5C3D1E;background:#F5ECD7;font-weight:bold; }
      .rh-co-pay-btn .pm-icon { font-size:22px;display:block;margin-bottom:4px; }
      .rh-co-confirm-btn {
        width:100%;padding:14px;background:#5C3D1E;color:#F5ECD7;
        border:none;border-radius:8px;font-size:16px;font-family:'Georgia',serif;
        cursor:pointer;letter-spacing:0.5px;transition:all 0.25s;margin-top:4px;
      }
      .rh-co-confirm-btn:hover { background:#8B5E3C;transform:translateY(-1px);box-shadow:0 6px 20px rgba(92,61,30,0.4); }
      .rh-co-confirm-btn:disabled { background:#bbb;cursor:not-allowed;transform:none;box-shadow:none; }
      .rh-co-err { color:#a00;font-size:13px;margin-top:10px;display:none;padding:8px 12px;background:#fff0f0;border-radius:6px;border:1px solid #fcc; }
      .rh-co-success { text-align:center;padding:36px 20px; }
      .rh-co-success-icon { font-size:56px;margin-bottom:16px; }
      .rh-co-success h3 { color:#5C3D1E;font-size:22px;margin-bottom:10px; }
      .rh-co-success p { color:#8B5E3C;font-size:14px;line-height:1.8; }
      .rh-co-invoice-btn {
        margin-top:20px;padding:11px 28px;background:#5C3D1E;color:#fff;
        border:none;border-radius:6px;font-size:14px;font-family:'Georgia',serif;
        cursor:pointer;transition:background 0.2s;
      }
      .rh-co-invoice-btn:hover { background:#8B5E3C; }
      .rh-co-divider { border:none;border-top:1px solid #E8D5B7;margin:18px 0; }
      .rh-co-coupon-row { display:flex;gap:8px;margin-bottom:8px; }
      .rh-co-coupon-row input {
        flex:1;padding:9px 12px;border:1.5px solid #E8D5B7;border-radius:6px;
        font-size:13px;font-family:'Georgia',serif;color:#3B2A1A;background:#fff;
        outline:none;transition:border-color 0.2s;text-transform:uppercase;
      }
      .rh-co-coupon-row input:focus { border-color:#C49A6C; }
      .rh-co-coupon-apply {
        padding:9px 16px;background:#5C3D1E;color:#F5ECD7;border:none;border-radius:6px;
        font-family:'Georgia',serif;font-size:13px;cursor:pointer;white-space:nowrap;transition:background 0.2s;
      }
      .rh-co-coupon-apply:hover { background:#8B5E3C; }
      .rh-co-coupon-apply:disabled { background:#aaa;cursor:not-allowed; }
      .rh-co-coupon-msg { font-size:12px;margin-bottom:8px;min-height:16px; }
      @media(max-width:480px) {
        .rh-co-row { grid-template-columns:1fr; }
        .rh-co-pay-methods { grid-template-columns:1fr; }
        #rh-checkout-card { width:100vw;max-width:100vw;right:-100vw; }
      }
    `;
    document.head.appendChild(s);
  }

  const old = document.getElementById('rh-checkout-overlay');
  if (old) old.remove();

  // Reset coupon state
  RH_PAY.appliedCoupon = null;

  const items = CART.cartProducts();
  const cartMap = CART.items;
  const sub = CART.subtotal();
  const del = CART.delivery();
  const tax = CART.tax();
  const total = CART.total();
  const fmtR = n => `₹${n.toLocaleString('en-IN')}`;

  const user = (typeof RH_AUTH !== 'undefined') ? RH_AUTH.user : null;
  const prefEmail = user?.email || '';
  const prefName = user?.user_metadata?.full_name || user?.user_metadata?.name || '';

  /* Load cached profile for phone + address pre-fill */
  let prefPhone = '', prefAddr = '', prefCity = '', prefPin = '', prefState = '';
  try {
    const cache = JSON.parse(localStorage.getItem('rh_user_profile') || '{}');
    prefPhone = cache.phone || '';
    prefAddr = cache.address || '';
    prefCity = cache.city || '';
    prefPin = cache.pin || '';
    prefState = cache.state || '';
  } catch (e) { }

  const overlay = document.createElement('div');
  overlay.id = 'rh-checkout-overlay';
  overlay.innerHTML = `
    <div id="rh-checkout-card">
      <div class="rh-co-header">
        <span class="rh-co-title">🏺 Checkout</span>
        <button class="rh-co-close" onclick="rhCloseCheckout()" title="Close">✕</button>
      </div>
      <div class="rh-co-goldbar"></div>
      <div class="rh-co-body">
        <span class="rh-co-label">Order Summary</span>
        <div class="rh-co-summary">
          ${items.map(p => `
            <div class="rh-co-summary-row">
              <span>${p.emoji} ${p.name} &nbsp;×${cartMap[p.id]}</span>
              <span>${fmtR(p.price * cartMap[p.id])}</span>
            </div>`).join('')}
          <div class="rh-co-summary-row" id="rh-co-discount-row" style="display:none;color:#1a5c34;">
            <span>Discount (coupon)</span>
            <span class="rh-co-disc-amt">-₹0</span>
          </div>
          <div class="rh-co-summary-row">
            <span>Delivery</span>
            <span id="rh-co-del-val">${fmtR(del)}</span>
          </div>
          <div class="rh-co-summary-row"><span>GST (5%)</span><span id="rh-co-tax-val">${fmtR(tax)}</span></div>
          <div class="rh-co-summary-total"><span>Total</span><span id="rh-co-total-val">${fmtR(total)}</span></div>
        </div>
        <hr class="rh-co-divider"/>
        <span class="rh-co-label">Have a Coupon?</span>
        <div class="rh-co-coupon-row">
          <input id="rh-coupon-input" placeholder="Enter coupon code" maxlength="30"
                 oninput="this.value=this.value.toUpperCase()"
                 onkeydown="if(event.key==='Enter')rhApplyCoupon()"/>
          <button class="rh-co-coupon-apply" id="rh-coupon-apply-btn" onclick="rhApplyCoupon()">Apply</button>
        </div>
        <div class="rh-co-coupon-msg" id="rh-coupon-msg"></div>
        <hr class="rh-co-divider"/>
        <span class="rh-co-label">Your Details</span>
        <div class="rh-co-row">
          <div class="rh-co-field">
            <label>Full Name *</label>
            <input id="rh-checkout-name" placeholder="Priya Ramesh" value="${prefName}"/>
          </div>
          <div class="rh-co-field">
            <label>Phone Number *</label>
            <input id="rh-checkout-phone" placeholder="10-digit mobile" type="tel" value="${prefPhone}"/>
          </div>
        </div>
        <div class="rh-co-row single">
          <div class="rh-co-field">
            <label>Email Address *</label>
            <input id="rh-checkout-email" placeholder="you@email.com" type="email" value="${prefEmail}"/>
          </div>
        </div>
        <hr class="rh-co-divider"/>
        <span class="rh-co-label">Delivery Address</span>
        <div class="rh-co-row single">
          <div class="rh-co-field">
            <label>Street / House No. *</label>
            <input id="rh-checkout-address" placeholder="12, Anna Nagar, 3rd Street" value="${prefAddr}"/>
          </div>
        </div>
        <div class="rh-co-row">
          <div class="rh-co-field">
            <label>City *</label>
            <input id="rh-checkout-city" placeholder="Coimbatore" value="${prefCity}"/>
          </div>
          <div class="rh-co-field">
            <label>PIN Code *</label>
            <input id="rh-checkout-pin" placeholder="641001" maxlength="6" type="tel" value="${prefPin}"/>
          </div>
        </div>
        <div class="rh-co-row single">
          <div class="rh-co-field">
            <label>State *</label>
            <input id="rh-checkout-state" placeholder="Tamil Nadu" value="${prefState}"/>
          </div>
        </div>
        <hr class="rh-co-divider"/>
        <span class="rh-co-label">Payment Method</span>
        <div class="rh-co-pay-methods">
          <button class="rh-co-pay-btn selected" id="pm-upi" onclick="rhSelectPay('upi')">
            <span class="pm-icon">📱</span>UPI / QR
          </button>
          <button class="rh-co-pay-btn" id="pm-card" onclick="rhSelectPay('card')">
            <span class="pm-icon">💳</span>Card
          </button>
          <button class="rh-co-pay-btn" id="pm-cod" onclick="rhSelectPay('cod')">
            <span class="pm-icon">💵</span>Cash on Delivery
          </button>
        </div>
        <div id="rh-co-err" class="rh-co-err">⚠ Please fill in all required fields before continuing.</div>
        <button class="rh-co-confirm-btn" id="rh-co-confirm-btn" onclick="rhSubmitCheckout()">
          Confirm Order — ${fmtR(total)} →
        </button>
      </div>
    </div>
  `;

  overlay.addEventListener('click', e => { if (e.target === overlay) rhCloseCheckout(); });
  document.body.appendChild(overlay);

  /* Lock background scroll */
  const scrollY = window.scrollY;
  const sw = window.innerWidth - document.documentElement.clientWidth;
  document.documentElement.style.overflow = 'hidden';
  document.body.style.overflow = 'hidden';
  document.body.style.position = 'fixed';
  document.body.style.top = `-${scrollY}px`;
  document.body.style.width = '100%';
  document.body.style.paddingRight = sw ? `${sw}px` : '';
  document.body.dataset.checkoutScrollY = scrollY;

  setTimeout(() => overlay.classList.add('open'), 10);

  window._rhSelectedPayMethod = 'upi';
}

/* ── Close checkout modal ── */
function rhCloseCheckout() {
  const overlay = document.getElementById('rh-checkout-overlay');
  if (!overlay) return;
  overlay.classList.remove('open');

  /* Restore background scroll */
  const scrollY = parseInt(document.body.dataset.checkoutScrollY || '0', 10);
  document.documentElement.style.overflow = '';
  document.body.style.overflow = '';
  document.body.style.position = '';
  document.body.style.top = '';
  document.body.style.width = '';
  document.body.style.paddingRight = '';
  window.scrollTo(0, scrollY);

  setTimeout(() => overlay.remove(), 350);
}

/* ── Select payment method ── */
function rhSelectPay(method) {
  window._rhSelectedPayMethod = method;
  ['upi', 'card', 'cod'].forEach(m => {
    const btn = document.getElementById(`pm-${m}`);
    if (btn) btn.classList.toggle('selected', m === method);
  });
}

/* ── Submit checkout form ── */
async function rhSubmitCheckout() {
  const get = id => (document.getElementById(id)?.value || '').trim();

  const name = get('rh-checkout-name');
  const phone = get('rh-checkout-phone');
  const email = get('rh-checkout-email');
  const address = get('rh-checkout-address');
  const city = get('rh-checkout-city');
  const pin = get('rh-checkout-pin');
  const state = get('rh-checkout-state');
  const errEl = document.getElementById('rh-co-err');
  const btn = document.getElementById('rh-co-confirm-btn');

  const coupon = RH_PAY.appliedCoupon;
  const discount = coupon?.discount_amount || 0;
  const freeDeliv = coupon?.free_delivery || false;
  const total = CART.total(discount, freeDeliv);

  if (!name || !phone || !email || !address || !city || !pin || !state) {
    if (errEl) errEl.style.display = 'block';
    return;
  }
  if (errEl) errEl.style.display = 'none';

  if (btn) { btn.disabled = true; btn.textContent = 'Processing… ⏳'; }

  const safetyTimer = setTimeout(() => rhResetConfirmBtn(total), 20000);

  const orderInfo = {
    name, phone, email, address, city, state, pin,
    items: CART.toOrderItems(),
    subtotal: CART.subtotal(),
    delivery_charge: CART.delivery(freeDeliv),
    discount: discount,
    tax: CART.tax(),
    total,
    payMethod: window._rhSelectedPayMethod || 'upi',
    coupon_id: coupon?.coupon_id || null,
    coupon_code: coupon?.code || null,
  };

  try {
    const result = await rhInitiatePayment(orderInfo);
    clearTimeout(safetyTimer);
    if (result && orderInfo.payMethod === 'cod') {
      rhShowCheckoutSuccess(result);
    }
  } catch (err) {
    clearTimeout(safetyTimer);
    console.error('RH Checkout error:', err);
    rhResetConfirmBtn(total);
  }
}

/* ── Show success screen inside checkout modal ── */
function rhShowCheckoutSuccess(order) {
  const card = document.getElementById('rh-checkout-card');
  if (!card) return;
  const fmtR = n => `₹${n.toLocaleString('en-IN')}`;

  card.innerHTML = `
    <div class="rh-co-header">
      <span class="rh-co-title">🏺 Rustic Heritage</span>
      <button class="rh-co-close" onclick="rhCloseCheckout()">✕</button>
    </div>
    <div class="rh-co-goldbar"></div>
    <div class="rh-co-body">
      <div class="rh-co-success">
        <div class="rh-co-success-icon">🎉</div>
        <h3>Order Placed Successfully!</h3>
        <p>
          Thank you, <strong>${order.customer_name}</strong>!<br/>
          Your order <strong>${order.order_id}</strong> is confirmed.<br/><br/>
          A confirmation email has been sent to<br/>
          <strong>${order.customer_email}</strong>.<br/><br/>
          ${order.payment_method === 'cod'
      ? `💵 Please keep <strong>${fmtR(order.total)}</strong> ready on delivery.`
      : `✅ Payment of <strong>${fmtR(order.total)}</strong> received.`}
        </p>
        <button class="rh-co-invoice-btn" onclick="rhDownloadInvoice(window._rhLastOrder)">
          🖨 Download Invoice
        </button>
      </div>
    </div>
  `;

  window._rhLastOrder = order;
  document.dispatchEvent(new CustomEvent('rh-order-success', { detail: order }));
}

/* ── Show success for Razorpay (UPI/Card) payments ── */
document.addEventListener('rh-order-success', (e) => {
  const order = e.detail;
  if (order && order.payment_method !== 'cod') {
    setTimeout(() => rhShowCheckoutSuccess(order), 500);
  }
});

console.log('✦ Rustic Heritage payment.js loaded');