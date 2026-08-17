import nodemailer from 'nodemailer';

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
      total_amount,
      subtotal,
      discount_amount,
      tax_amount,
      delivery_fee,
      payment_method,
      items = [],
    } = req.body || {};

    const transporter = getTransporter();
    const emailTo = to || customer_email || 'customer@example.com';
    const displayNum = order_number || (order_id ? `#RH-${String(order_id).slice(0, 8).toUpperCase()}` : '#RH-ORDER');
    const name = customer_name || 'Valued Customer';
    const siteUrl = process.env.PUBLIC_SITE_URL || 'http://localhost:3000';

    // Parse items HTML rows
    let itemsRowsHtml = '';
    if (Array.isArray(items) && items.length > 0) {
      itemsRowsHtml = items
        .map((it) => {
          const title = it.title || it.name || 'Handcrafted Kitchenware';
          const qty = it.quantity || it.qty || 1;
          const price = Number(it.price || 0).toLocaleString('en-IN');
          const total = Number(it.total_price || (it.price || 0) * qty).toLocaleString('en-IN');
          return `
            <tr>
              <td style="padding: 12px; border-bottom: 1px solid #F0E2CD; color: #3B2A1A; font-weight: bold;">${title}</td>
              <td style="padding: 12px; border-bottom: 1px solid #F0E2CD; color: #5C3D1E; text-align: center;">${qty}</td>
              <td style="padding: 12px; border-bottom: 1px solid #F0E2CD; color: #5C3D1E; text-align: right;">₹${price}</td>
              <td style="padding: 12px; border-bottom: 1px solid #F0E2CD; color: #3B2A1A; font-weight: bold; text-align: right;">₹${total}</td>
            </tr>
          `;
        })
        .join('');
    } else {
      itemsRowsHtml = `
        <tr>
          <td colSpan="4" style="padding: 14px; text-align: center; color: #5C3D1E;">Handcrafted Rustic Kitchenware Items</td>
        </tr>
      `;
    }

    const calcSubtotal = subtotal || (total_amount ? total_amount * 0.85 : 0);
    const calcTax = tax_amount || Math.round((subtotal || total_amount * 0.85) * 0.05);
    const calcDelivery = delivery_fee || 40;
    const grandTotal = total_amount ? Number(total_amount).toLocaleString('en-IN') : '0';
    const payMethodText = (payment_method || 'cod').toLowerCase() === 'cod' ? 'Cash on Delivery (COD)' : 'Online Payment';

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
          .status-banner { background: #F5ECD7; border: 1.5px dashed #C49A6C; border-radius: 8px; padding: 18px; text-align: center; margin-bottom: 24px; }
          .main-title { font-size: 21px; font-weight: bold; color: #3B2A1A; margin: 0 0 6px 0; }
          .banner-subtitle { font-size: 13.5px; color: #8B5E3C; margin: 0; }
          .info-grid { width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 13px; }
          .info-grid td { padding: 6px 0; vertical-align: top; }
          .invoice-table { width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 13.5px; }
          .invoice-table th { background: #F5ECD7; padding: 10px 12px; border-bottom: 1.5px solid #E8D5B7; color: #5C3D1E; text-align: left; font-size: 11.5px; text-transform: uppercase; font-weight: bold; }
          .summary-box { text-align: right; margin-top: 16px; font-size: 13.5px; line-height: 1.7; color: #5C3D1E; }
          .grand-total { font-size: 18px; font-weight: bold; color: #3B2A1A; border-top: 1.5px solid #C49A6C; padding-top: 8px; margin-top: 6px; }
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
            <div class="status-banner">
              <h2 class="main-title">📦 Your order has been received!</h2>
              <p class="banner-subtitle">Please wait for the update from our team while we process your order.</p>
            </div>

            <table class="info-grid">
              <tr>
                <td style="width: 50%;">
                  <strong style="color: #8B5E3C; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; display: block; margin-bottom: 4px;">Billed To:</strong>
                  <strong>${name}</strong><br>
                  ${delivery_address ? delivery_address + '<br>' : ''}
                  ${city ? city + ' ' + (pincode || '') + '<br>' : ''}
                  ${customer_phone ? 'Phone: ' + customer_phone + '<br>' : ''}
                  Email: ${emailTo}
                </td>
                <td style="width: 50%; text-align: right;">
                  <strong style="color: #8B5E3C; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; display: block; margin-bottom: 4px;">Order Details:</strong>
                  <strong>Order Ref: ${displayNum}</strong><br>
                  Date: ${new Date().toLocaleDateString('en-IN')}<br>
                  Payment: <strong>${payMethodText}</strong><br>
                  Status: <span style="background:#FFF3CD; color:#856404; padding:2px 8px; border-radius:10px; font-weight:bold; font-size:11px;">Order Received</span>
                </td>
              </tr>
            </table>

            <table class="invoice-table">
              <thead>
                <tr>
                  <th>Item Description</th>
                  <th style="text-align: center;">Qty</th>
                  <th style="text-align: right;">Unit Price</th>
                  <th style="text-align: right;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${itemsRowsHtml}
              </tbody>
            </table>

            <div class="summary-box">
              <div>Subtotal: <strong>₹${Number(calcSubtotal).toLocaleString('en-IN')}</strong></div>
              <div>GST (5%): <strong>₹${Number(calcTax).toLocaleString('en-IN')}</strong></div>
              <div>Delivery Fee: <strong>₹${Number(calcDelivery).toLocaleString('en-IN')}</strong></div>
              ${discount_amount ? `<div style="color: #2E7D32;">Discount: <strong>-₹${Number(discount_amount).toLocaleString('en-IN')}</strong></div>` : ''}
              <div class="grand-total">Grand Total: ₹${grandTotal}</div>
            </div>

            <div style="text-align: center; margin-top: 28px;">
              <a href="${siteUrl}/profile" class="btn-action">View Order History &amp; Account &rarr;</a>
            </div>
          </div>

          <div class="email-footer">
            Thank you for supporting traditional Indian artisans!<br>
            <strong>Rustic Heritage Kitchenware</strong> &middot; Coimbatore, Tamil Nadu, India<br>
            Contact: <a href="mailto:mathubharathi15@gmail.com" style="color:#5C3D1E;">mathubharathi15@gmail.com</a> | <a href="tel:8072505342" style="color:#5C3D1E;">8072505342</a>
          </div>
        </div>
      </body>
      </html>
    `;

    const mailOptions = {
      from: `Rustic Heritage Kitchenware <${process.env.SMTP_EMAIL || 'workatbuildcrew@gmail.com'}>`,
      to: emailTo,
      subject: subject || `📦 Order Received: ${displayNum} — Rustic Heritage`,
      html: htmlContent,
    };

    await transporter.sendMail(mailOptions);
    return res.status(200).json({ success: true, message: `Order placement email sent to ${emailTo}` });
  } catch (err) {
    console.error('Send Order Email Error:', err);
    return res.status(500).json({ error: err.message || 'Failed to send order email' });
  }
}
