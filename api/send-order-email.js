import nodemailer from 'nodemailer';
import { createHandler } from './_adapter.js';
import { buildEmailHtml } from './_email_template.js';

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
    const {
      to,
      subject,
      order_id,
      order_number,
      customer_name,
      customer_email,
      customer_phone,
      delivery_address,
      city,
      pincode,
      state,
      total_amount,
      subtotal,
      discount_amount,
      tax_amount,
      delivery_fee,
      payment_method,
      items = [],
    } = req.body || {};

    const transporter = getTransporter();
    if (!transporter) {
      return res.status(500).json({ error: 'SMTP environment variables missing.' });
    }

    const emailTo = to || customer_email || 'customer@example.com';
    const displayNum = order_number || (order_id ? `#RH-${String(order_id).slice(0, 8).toUpperCase()}` : '#RH-ORDER');
    const name = customer_name || 'Valued Customer';
    const siteUrl = process.env.PUBLIC_SITE_URL || 'https://rustic-heritage.netlify.app';
    const isCod = (payment_method || 'cod').toLowerCase() === 'cod';
    const payText = isCod ? 'Cash on Delivery (COD)' : 'Online Payment';

    // Normalize items array
    let parsedItems = [];
    if (Array.isArray(items)) {
      parsedItems = items;
    } else if (items && typeof items === 'object') {
      parsedItems = Object.keys(items).map((k) => ({
        title: `Handcrafted Kitchenware Item #${k}`,
        quantity: items[k],
        price: 0,
        total_price: 0,
      }));
    }

    // Table rows HTML
    let tableRowsHtml = '';
    if (parsedItems.length > 0) {
      tableRowsHtml = parsedItems
        .map((it) => {
          const title = it.title || it.name || it.product_name || 'Handcrafted Kitchenware';
          const qty = it.quantity || it.qty || 1;
          const price = Number(it.price || 0).toLocaleString('en-IN');
          const total = Number(it.total_price || (it.price || 0) * qty).toLocaleString('en-IN');
          return `
            <tr>
              <td style="padding: 12px 0; border-bottom: 1px solid #23170E; font-size: 13.5px; color: #F5ECD7;">${title}</td>
              <td style="padding: 12px 0; border-bottom: 1px solid #23170E; font-size: 13.5px; color: #D4C3AC; text-align: center;">&times;${qty}</td>
              <td style="padding: 12px 0; border-bottom: 1px solid #23170E; font-size: 13.5px; color: #E2B674; text-align: right;">&#8377;${price}</td>
              <td style="padding: 12px 0; border-bottom: 1px solid #23170E; font-size: 13.5px; color: #E2B674; font-weight: bold; text-align: right;">&#8377;${total}</td>
            </tr>
          `;
        })
        .join('');
    } else {
      tableRowsHtml = `
        <tr>
          <td colSpan="4" style="padding: 14px 0; text-align: center; color: #D4C3AC; font-size: 13px;">Handcrafted Artisan Kitchenware Order</td>
        </tr>
      `;
    }

    const calcSubtotal = subtotal || (total_amount ? total_amount * 0.85 : 0);
    const calcTax = tax_amount || Math.round((subtotal || total_amount * 0.85) * 0.05);
    const calcDelivery = delivery_fee || 40;
    const grandTotalFormatted = total_amount ? Number(total_amount).toLocaleString('en-IN') : '0';

    const bannerNotice = isCod
      ? `📦 <strong>Cash on Delivery</strong> &mdash; Please keep <strong>&#8377;${grandTotalFormatted}</strong> ready when your order arrives.`
      : `✨ <strong>Online Payment Verified</strong> &mdash; Your order is being prepared by our master artisans.`;

    const mainContentHtml = `
      <table class="item-table" style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        <thead>
          <tr>
            <th style="font-size: 9px; letter-spacing: 2px; text-transform: uppercase; color: #C49A6C; text-align: left; padding: 10px 0; border-bottom: 1px solid #2D1E13;">ITEM</th>
            <th style="font-size: 9px; letter-spacing: 2px; text-transform: uppercase; color: #C49A6C; text-align: center; padding: 10px 0; border-bottom: 1px solid #2D1E13;">QTY</th>
            <th style="font-size: 9px; letter-spacing: 2px; text-transform: uppercase; color: #C49A6C; text-align: right; padding: 10px 0; border-bottom: 1px solid #2D1E13;">PRICE</th>
            <th style="font-size: 9px; letter-spacing: 2px; text-transform: uppercase; color: #C49A6C; text-align: right; padding: 10px 0; border-bottom: 1px solid #2D1E13;">TOTAL</th>
          </tr>
        </thead>
        <tbody>
          ${tableRowsHtml}
        </tbody>
      </table>

      <div style="text-align: right; font-size: 13px; color: #C49A6C; line-height: 1.8; margin-top: 16px;">
        <div>Subtotal: <strong style="color: #F5ECD7;">&#8377;${Number(calcSubtotal).toLocaleString('en-IN')}</strong></div>
        <div>Delivery: <strong style="color: #F5ECD7;">&#8377;${Number(calcDelivery).toLocaleString('en-IN')}</strong></div>
        <div>GST 5%: <strong style="color: #F5ECD7;">&#8377;${Number(calcTax).toLocaleString('en-IN')}</strong></div>
        ${discount_amount ? `<div style="color: #4CAF50;">Discount: <strong>-&#8377;${Number(discount_amount).toLocaleString('en-IN')}</strong></div>` : ''}
        <div style="font-size: 18px; font-weight: bold; color: #FFF9F0; border-top: 1px solid #3B2616; padding-top: 12px; margin-top: 10px;">
          Amount to Pay: <span style="color: #E2B674;">&#8377;${grandTotalFormatted}</span>
        </div>
      </div>

      <div style="background: #1C130B; border: 1px solid #2B1D12; border-radius: 4px; padding: 18px; margin-top: 24px;">
        <div style="font-size: 9px; letter-spacing: 2px; text-transform: uppercase; color: #C49A6C; margin-bottom: 8px; font-weight: bold;">DELIVERY ADDRESS</div>
        <div style="font-size: 14px; font-weight: bold; color: #FFF9F0; margin-bottom: 4px;">${name}</div>
        <div style="font-size: 13px; line-height: 1.6; color: #D4C3AC;">
          ${delivery_address ? delivery_address + '<br>' : ''}
          ${city ? city + (state ? ', ' + state : '') + (pincode ? ' &mdash; ' + pincode : '') + '<br>' : ''}
          📱 ${customer_phone || ''}
        </div>
      </div>

      <div style="margin-top: 16px; font-size: 12.5px; color: #9E836A; background: #1C130B; padding: 12px 16px; border-radius: 4px; border: 1px solid #2B1D12;">
        Payment Method: <strong style="color: #F5ECD7;">📦 ${payText}</strong> &middot; Status: <strong style="color: #E2B674;">⏳ Pending</strong>
      </div>

      <div style="text-align: left; margin-top: 28px;">
        <a href="${siteUrl}" class="btn-gold">VISIT WEBSITE &rarr;</a>
      </div>
    `;

    const htmlContent = buildEmailHtml({
      headerTitle: 'Rustic Heritage',
      headerSub: isCod ? 'CASH ON DELIVERY ORDER' : 'ONLINE ORDER',
      orderBadge: { label: 'ORDER ID', value: displayNum },
      bannerNotice,
      greeting: `Your order is placed, ${name}!`,
      subtitle: `Placed on ${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}`,
      mainContentHtml,
      siteUrl,
      recipientEmail: emailTo,
    });

    const recipients = [emailTo];
    if (process.env.SMTP_EMAIL && process.env.SMTP_EMAIL.toLowerCase() !== emailTo.toLowerCase()) {
      recipients.push(process.env.SMTP_EMAIL);
    }

    const mailOptions = {
      from: `Rustic Heritage Kitchenware <${process.env.SMTP_EMAIL}>`,
      to: recipients.join(', '),
      subject: `📦 Order Confirmed (${payText}) — ${displayNum} | Rustic Heritage`,
      html: htmlContent,
    };

    await transporter.sendMail(mailOptions);
    return res.status(200).json({ success: true, message: `Order placement email sent to ${recipients.join(', ')}` });
  } catch (err) {
    console.error('Send Order Email Error:', err);
    return res.status(500).json({ error: err.message || 'Failed to send order email' });
  }
});

export default handler;
