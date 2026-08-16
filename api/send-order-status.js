const nodemailer = require('nodemailer');

function getTransporter() {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.SMTP_PORT || '465', 10);
  const user = process.env.SMTP_EMAIL || 'mathubharathi15@gmail.com';
  const pass = process.env.SMTP_PASSWORD || '';
  if (!pass) return null;
  return nodemailer.createTransport({ host, port, secure: port === 465, auth: { user, pass } });
}

module.exports = async function handler(req, res) {
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

    const displayNum = order_number || (order_id ? `#${String(order_id).slice(0, 8)}` : 'Order');
    const name = customer_name || 'Valued Customer';
    const statusUpper = (status || 'CONFIRMED').toUpperCase();

    let subject = `📦 Order Status Update: ${displayNum} is ${statusUpper} — Rustic Heritage`;
    let headerTitle = `Order Status: ${statusUpper}`;
    let icon = '📦';
    let statusMsg = `Your order <strong>${displayNum}</strong> status has been updated to <strong>${statusUpper}</strong>.`;

    if (status === 'confirmed') {
      icon = '✅';
      subject = `✅ Order ${displayNum} Confirmed — Rustic Heritage Kitchenware`;
      headerTitle = 'Order Confirmed!';
      statusMsg = `Great news! Your order <strong>${displayNum}</strong> has been confirmed by Rustic Heritage Kitchenware and is being prepared for dispatch.`;
    } else if (status === 'delivered') {
      icon = '📦';
      subject = `🎉 Order ${displayNum} Delivered — Rustic Heritage Kitchenware`;
      headerTitle = 'Order Delivered!';
      statusMsg = `Your order <strong>${displayNum}</strong> has been successfully delivered! We hope you love your handcrafted kitchenware.`;
    } else if (status === 'cancelled') {
      icon = '❌';
      subject = `❌ Order ${displayNum} Cancelled — Rustic Heritage Kitchenware`;
      headerTitle = 'Order Cancelled';
      statusMsg = `Your order <strong>${displayNum}</strong> has been cancelled.${reason ? '<br>Reason: ' + reason : ''}`;
    }

    const html = `
      <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; background: #FDF6EC; border: 1px solid #E8D5B7; border-radius: 12px; padding: 32px; color: #3B2A1A;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="color: #5C3D1E; font-size: 24px; margin: 0;">Rustic Heritage</h1>
          <p style="color: #C49A6C; letter-spacing: 2px; text-transform: uppercase; font-size: 11px; margin-top: 4px;">KITCHENWARE</p>
        </div>
        
        <div style="text-align: center; margin-bottom: 20px;">
          <div style="font-size: 48px; margin-bottom: 8px;">${icon}</div>
          <h2 style="color: #3B2A1A; font-size: 22px; margin: 0;">${headerTitle}</h2>
        </div>

        <p style="font-size: 15px; line-height: 1.6; color: #5C3D1E;">
          Hello ${name},<br/><br/>
          ${statusMsg}
        </p>

        <div style="text-align: center; margin-top: 28px;">
          <a href="${process.env.PUBLIC_SITE_URL || 'https://rustic-heritage.vercel.app'}/profile.html" style="background: #3B2A1A; color: #F5ECD7; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">View Order History &rarr;</a>
        </div>

        <hr style="border: none; border-top: 1px solid #E8D5B7; margin: 28px 0 18px;" />
        <p style="font-size: 12px; color: #8B5E3C; text-align: center;">
          Need assistance? Email <a href="mailto:mathubharathi15@gmail.com" style="color:#5C3D1E;">mathubharathi15@gmail.com</a> or call <a href="tel:8072505342" style="color:#5C3D1E;">8072505342</a>.<br>
          Coimbatore, Tamil Nadu, India
        </p>
      </div>
    `;

    const transporter = getTransporter();
    let emailSent = false;

    if (transporter) {
      try {
        await transporter.sendMail({
          from: `Rustic Heritage Kitchenware <${process.env.SMTP_EMAIL || 'mathubharathi15@gmail.com'}>`,
          to: customer_email,
          subject: subject,
          html: html
        });
        emailSent = true;
      } catch (err) {
        console.error('Status Email Error:', err);
      }
    }

    return res.status(200).json({
      success: emailSent,
      message: emailSent ? `Status update email sent to ${customer_email}` : `SMTP skipped or failed.`
    });

  } catch (err) {
    console.error('Order Status Handler Error:', err);
    return res.status(500).json({ error: err.message });
  }
};
