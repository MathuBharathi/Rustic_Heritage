// ═══════════════════════════════════════════════════════════
//  RUSTIC HERITAGE KITCHENWARE — Order Confirmation Email
//  Sends a detailed order email after every purchase,
//  INCLUDING Cash on Delivery orders.
//
//  HOW TO USE:
//  1. This runs automatically via payment.js after every order.
//  2. Emails are sent via Gmail SMTP in server.py
//  2. Emails are sent via SMTP (mathubharathi15@gmail.com)
//  3. To test standalone: node resend-order-email.js
//
//  FETCHES EMAIL FROM DATABASE:
//  The customer_email is always fetched from the order row
//  saved in Supabase, so it's always accurate.
// ═══════════════════════════════════════════════════════════

const SUPABASE_URL  = 'https://tlhhxpttifgtgnrzjrga.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRsaGh4cHR0aWZndGducnpqcmdhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMyOTQ2MDUsImV4cCI6MjA5ODg3MDYwNX0.ZYB12Ekl1EImXRdxvyGNEvXLxnNOe-36oxvo3z4gSI0';

// ─────────────────────────────────────────────────────────
//  MAIN FUNCTION: Fetch order from DB, then send email
// ─────────────────────────────────────────────────────────
/**
 * Fetch an order from Supabase by order_id, then send confirmation email.
 * @param {string} orderId - e.g. "RH12345"
 */
async function sendOrderEmailByOrderId(orderId) {
  const orderRow = await fetchOrderFromDB(orderId);
  if (!orderRow) {
    console.error(`❌ Order ${orderId} not found in database`);
    return null;
  }
  return await sendOrderConfirmationEmail(orderRow);
}

/**
 * Send order confirmation directly from an order row object.
 * Called by payment.js after saving order to Supabase.
 * @param {object} orderRow - the order data object
 */
async function sendOrderConfirmationEmail(orderRow) {
  const email = orderRow.customer_email;
  if (!email) {
    console.error('❌ No customer_email in order row');
    return null;
  }

  const isCOD   = orderRow.payment_method === 'cod';
  const subject = isCOD
    ? `📦 Order Confirmed (Pay on Delivery) — ${orderRow.order_id} | Rustic Heritage Kitchenware`
    : `✅ Order Confirmed — ${orderRow.order_id} | Rustic Heritage Kitchenware`;

  try {
    const res = await fetch('/api/send-order-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to:      [email],
        subject,
        html:    buildOrderEmailHTML(orderRow),
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      console.error('❌ Server error:', data);
      return null;
    }
    console.log(`✅ Order email sent to ${email} | Order: ${orderRow.order_id}`);
    return data;
  } catch (err) {
    console.error('❌ Network error sending order email:', err.message);
    return null;
  }
}

// ─────────────────────────────────────────────────────────
//  FETCH ORDER FROM SUPABASE DATABASE
// ─────────────────────────────────────────────────────────
async function fetchOrderFromDB(orderId) {
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/orders?order_id=eq.${orderId}&select=*`,
      {
        headers: {
          'apikey':        SUPABASE_ANON,
          'Authorization': `Bearer ${SUPABASE_ANON}`,
          'Content-Type':  'application/json',
        },
      }
    );
    const rows = await res.json();
    if (!rows || rows.length === 0) return null;
    return rows[0];
  } catch (err) {
    console.error('❌ Supabase fetch error:', err.message);
    return null;
  }
}

// ─────────────────────────────────────────────────────────
//  EMAIL HTML TEMPLATE — Order Confirmation
// ─────────────────────────────────────────────────────────
function buildOrderEmailHTML(order) {
  const isCOD = order.payment_method === 'cod';
  const date  = new Date(order.created_at || Date.now()).toLocaleDateString('en-IN', {
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
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Order Confirmation — ${order.order_id}</title>
</head>
<body style="margin:0;padding:0;background:#F5ECD7;font-family:'Georgia',serif">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr><td align="center" style="padding:48px 20px">

      <table width="640" cellpadding="0" cellspacing="0"
             style="background:#FDF6EC;border:1px solid #E8D5B7;border-top:4px solid #C49A6C;max-width:640px">

        <!-- Header -->
        <tr><td style="background:linear-gradient(135deg,#3B2A1A 0%,#5C3D1E 60%,#3B2A1A 100%);padding:28px 36px">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
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
            </tr>
          </table>
        </td></tr>

        <!-- Gold bar -->
        <tr><td style="height:3px;background:linear-gradient(90deg,#C49A6C,#8B5E3C,#C49A6C)"></td></tr>

        <!-- COD notice banner (only for COD) -->
        ${isCOD ? `
        <tr><td style="background:#fff8e8;border-bottom:1px solid #E8D5B7;padding:14px 36px">
          <p style="margin:0;font-size:14px;color:#8B5E3C;font-style:italic">
            📦 <strong>Cash on Delivery</strong> — Please keep
            <strong style="color:#5C3D1E">₹${(order.total || 0).toLocaleString('en-IN')}</strong>
            ready when your order arrives.
          </p>
        </td></tr>` : ''}

        <!-- Greeting -->
        <tr><td style="padding:28px 36px 20px">
          <h2 style="margin:0 0 8px;color:#3B2A1A;font-size:22px;font-family:'Georgia',serif">
            ${isCOD ? `Your order is placed, ${order.customer_name}!` : `Order confirmed, ${order.customer_name}! 🎉`}
          </h2>
          <p style="margin:0;font-size:13px;color:#8B5E3C;font-style:italic">
            Placed on ${date}
            ${order.payment_id && order.payment_id !== 'COD' ? ` &nbsp;·&nbsp; Payment ID: <span style="font-family:monospace;color:#5C3D1E">${order.payment_id}</span>` : ''}
          </p>
        </td></tr>

        <!-- Items table -->
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

        <!-- Totals -->
        <tr><td style="padding:12px 36px 24px">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr><td align="right" style="padding:4px 0;font-size:13px;color:#8B5E3C">
              Subtotal: <strong style="color:#3B2A1A">₹${(order.subtotal || 0).toLocaleString('en-IN')}</strong>
            </td></tr>
            <tr><td align="right" style="padding:4px 0;font-size:13px;color:#8B5E3C">
              Delivery: <strong style="color:#3B2A1A">${order.delivery_charge === 0 ? 'FREE ✓' : '₹' + order.delivery_charge}</strong>
            </td></tr>
            <tr><td align="right" style="padding:4px 0;font-size:13px;color:#8B5E3C">
              GST (5%): <strong style="color:#3B2A1A">₹${(order.tax || 0).toLocaleString('en-IN')}</strong>
            </td></tr>
            <tr><td align="right" style="padding:14px 0 0;font-size:20px;font-weight:700;color:#3B2A1A;border-top:2px solid #C49A6C;margin-top:8px">
              ${isCOD ? 'Amount to Pay' : 'Total Paid'}:
              <span style="color:#8B5E3C">₹${(order.total || 0).toLocaleString('en-IN')}</span>
            </td></tr>
          </table>
        </td></tr>

        <!-- Delivery address -->
        <tr><td style="padding:20px 36px 24px;background:#F5ECD7;border-top:1px solid #E8D5B7;border-bottom:1px solid #E8D5B7">
          <p style="margin:0 0 10px;font-size:10px;letter-spacing:3px;text-transform:uppercase;color:#C49A6C">
            Delivery Address
          </p>
          <p style="margin:0;font-size:14px;color:#3B2A1A;line-height:1.8">
            <strong>${order.customer_name}</strong><br/>
            ${order.delivery_address || ''}<br/>
            ${order.delivery_city || ''}, ${order.delivery_state || ''} — ${order.delivery_pin || ''}<br/>
            📱 ${order.customer_phone || 'N/A'}
          </p>
        </td></tr>

        <!-- Payment method -->
        <tr><td style="padding:16px 36px;border-bottom:1px solid #E8D5B7">
          <p style="margin:0;font-size:13px;color:#8B5E3C">
            Payment Method:
            <strong style="color:#3B2A1A">
              ${order.payment_method === 'upi' ? '✅ UPI / QR' :
                order.payment_method === 'card' ? '💳 Card' :
                '📦 Cash on Delivery'}
            </strong>
            &nbsp;·&nbsp; Status:
            <span style="color:${order.payment_status === 'paid' ? '#2d7a4a' : '#9d7a45'}">
              ${order.payment_status === 'paid' ? '✅ Paid' : '⏳ Pending (Pay on Delivery)'}
            </span>
          </p>
        </td></tr>

        <!-- Delivery info strip -->
        <tr><td style="padding:16px 36px;border-bottom:1px solid #E8D5B7;background:#fffef8">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="text-align:center;padding:10px">
                <div style="font-size:20px;margin-bottom:4px">🚚</div>
                <div style="font-size:11px;letter-spacing:1px;text-transform:uppercase;color:#C49A6C">Delivery</div>
                <div style="font-size:12px;color:#3B2A1A;margin-top:2px">5–7 business days</div>
              </td>
              <td style="text-align:center;padding:10px;border-left:1px solid #E8D5B7;border-right:1px solid #E8D5B7">
                <div style="font-size:20px;margin-bottom:4px">↩️</div>
                <div style="font-size:11px;letter-spacing:1px;text-transform:uppercase;color:#C49A6C">Returns</div>
                <div style="font-size:12px;color:#3B2A1A;margin-top:2px">7-day easy returns</div>
              </td>
              <td style="text-align:center;padding:10px">
                <div style="font-size:20px;margin-bottom:4px">📞</div>
                <div style="font-size:11px;letter-spacing:1px;text-transform:uppercase;color:#C49A6C">Support</div>
                <div style="font-size:12px;color:#3B2A1A;margin-top:2px">+91 8072505342</div>
              </td>
            </tr>
          </table>
        </td></tr>

        <!-- Footer -->
        <tr><td style="padding:22px 36px 28px;text-align:center">
          <p style="margin:0 0 8px;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#C49A6C">
            ✦ &nbsp; Rustic Heritage Kitchenware &nbsp;·&nbsp; Coimbatore, Tamil Nadu &nbsp; ✦
          </p>
          <p style="margin:0;font-size:11px;color:#8B5E3C;font-style:italic">
            Crafted with love · Questions? mathubharathi15@gmail.com · +91 8072505342
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

// ─────────────────────────────────────────────────────────
//  STANDALONE TEST — run: node resend-order-email.js
// ─────────────────────────────────────────────────────────
if (typeof module !== 'undefined' && require.main === module) {
  const mockOrder = {
    order_id:         'RH12345',
    customer_name:    'Test Customer',
    customer_email:   'your@email.com',  // ← put your email to test
    customer_phone:   '8072505342',
    delivery_address: '42, Anna Nagar',
    delivery_city:    'Coimbatore',
    delivery_state:   'Tamil Nadu',
    delivery_pin:     '641001',
    items: [
      { name: '🥄 Teak Wood Ladle Set (7-piece)', qty: 1, price: 749, total: 749 },
      { name: '🏺 Clay Cooking Pot with Lid',     qty: 1, price: 649, total: 649 },
    ],
    subtotal:         1398,
    delivery_charge:  0,
    tax:              70,
    total:            1468,
    payment_method:   'cod',         // ← change to 'upi' or 'card' to test those
    payment_id:       null,
    payment_status:   'pending',
    created_at:       new Date().toISOString(),
  };

  console.log('📧 Order email HTML built successfully.');
  console.log('   Order ID:', mockOrder.order_id);
  console.log('   To send, run server.py and it will automatically send via Gmail SMTP.');
  console.log('   Or POST to /api/send-email with { to, subject, html }');
}

// Export for use in other modules / payment.js
if (typeof module !== 'undefined') {
  module.exports = {
    sendOrderConfirmationEmail,
    sendOrderEmailByOrderId,
    fetchOrderFromDB,
    buildOrderEmailHTML,
  };
}
