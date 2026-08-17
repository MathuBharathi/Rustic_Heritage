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
    const { order_id, order_number, customer_name, customer_email, status, reason } = req.body || {};

    if (!customer_email) {
      return res.status(400).json({ error: 'customer_email is required' });
    }

    const transporter = getTransporter();
    const displayNum = order_number || (order_id ? `#RH-${String(order_id).slice(0, 8).toUpperCase()}` : '#RH-ORDER');
    const name = customer_name || 'Valued Customer';
    const statusLower = (status || 'confirmed').toLowerCase();
    const siteUrl = process.env.PUBLIC_SITE_URL || 'http://localhost:3000';

    let subject = '';
    let statusHeading = '';
    let statusMessage = '';
    let badgeBg = '#E8F5E9';
    let badgeColor = '#2E7D32';

    if (statusLower === 'confirmed') {
      subject = `✅ Order Confirmed: ${displayNum} — Rustic Heritage`;
      statusHeading = 'Your order has been taken!';
      statusMessage = `Great news, <strong>${name}</strong>! Your order <strong>${displayNum}</strong> has been taken and confirmed by our team. Our master artisans are preparing your handcrafted kitchenware for dispatch.`;
      badgeBg = '#E8F5E9';
      badgeColor = '#2E7D32';
    } else if (statusLower === 'cancelled') {
      subject = `❌ Order Cancelled: ${displayNum} — Rustic Heritage`;
      statusHeading = 'Your order has been cancelled';
      statusMessage = `Hello <strong>${name}</strong>, your order <strong>${displayNum}</strong> has been cancelled.${reason ? '<br><br><strong>Reason:</strong> ' + reason : ''}`;
      badgeBg = '#FFEBEE';
      badgeColor = '#C62828';
    } else if (statusLower === 'delivered') {
      subject = `🎉 Order Delivered: ${displayNum} — Rustic Heritage`;
      statusHeading = 'Your order has been delivered successfully!';
      statusMessage = `Hello <strong>${name}</strong>, your order <strong>${displayNum}</strong> has been delivered successfully to your doorstep. We hope you love your traditional Indian kitchenware!`;
      badgeBg = '#E3F2FD';
      badgeColor = '#1565C0';
    } else {
      subject = `📦 Order Status Update: ${displayNum} — Rustic Heritage`;
      statusHeading = `Order Status: ${status.toUpperCase()}`;
      statusMessage = `Hello <strong>${name}</strong>, your order <strong>${displayNum}</strong> status has been updated to <strong>${status.toUpperCase()}</strong>.`;
    }

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
          .status-badge-box { background: ${badgeBg}; color: ${badgeColor}; border: 1px solid ${badgeColor}; border-radius: 8px; padding: 18px; text-align: center; margin-bottom: 24px; }
          .main-title { font-size: 21px; font-weight: bold; margin: 0 0 6px 0; }
          .message-p { font-size: 15px; line-height: 1.6; color: #5C3D1E; margin-bottom: 24px; }
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
            <div class="status-badge-box">
              <h2 class="main-title">${statusHeading}</h2>
              <div style="font-size: 13px; font-weight: bold;">Order Reference: ${displayNum}</div>
            </div>

            <p class="message-p">
              ${statusMessage}
            </p>

            <div style="text-align: center; margin-top: 28px;">
              <a href="${siteUrl}/profile" class="btn-action">Track Order History &amp; Account &rarr;</a>
            </div>
          </div>

          <div class="email-footer">
            Thank you for shopping with us!<br>
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
          to: customer_email,
          subject: subject,
          html: htmlContent,
        });
        emailSent = true;
      } catch (err) {
        console.error('Status Email Dispatch Error:', err);
      }
    }

    return res.status(200).json({
      success: emailSent,
      message: emailSent ? `Status update email sent to ${customer_email}` : 'SMTP error during status dispatch.',
    });
  } catch (err) {
    console.error('Order Status Handler Error:', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
}
