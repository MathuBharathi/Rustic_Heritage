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
    const { order_id, order_number, customer_name, customer_email, status, reason } = req.body || {};

    if (!customer_email) {
      return res.status(400).json({ error: 'customer_email is required' });
    }

    const transporter = getTransporter();
    if (!transporter) {
      return res.status(500).json({ error: 'SMTP environment variables missing.' });
    }

    const displayNum = order_number || (order_id ? `#RH-${String(order_id).slice(0, 8).toUpperCase()}` : '#RH-ORDER');
    const name = customer_name || 'Valued Customer';
    const statusLower = (status || 'confirmed').toLowerCase();
    const siteUrl = process.env.PUBLIC_SITE_URL || 'https://rustic-heritage.netlify.app';

    let subject = '';
    let statusHeading = '';
    let statusMessage = '';
    let bannerNotice = '';

    if (statusLower === 'confirmed') {
      subject = `✅ Order Confirmed — ${displayNum} | Rustic Heritage`;
      statusHeading = `Your order has been taken, ${name}!`;
      statusMessage = `Great news! Your order <strong>${displayNum}</strong> has been taken and confirmed by our team. Our master artisans are preparing your handcrafted kitchenware for dispatch.`;
      bannerNotice = `✅ <strong>Order Confirmed</strong> &mdash; Order is in preparation for dispatch.`;
    } else if (statusLower === 'cancelled') {
      subject = `❌ Order Cancelled — ${displayNum} | Rustic Heritage`;
      statusHeading = `Order Cancelled`;
      statusMessage = `Hello <strong>${name}</strong>, your order <strong>${displayNum}</strong> has been cancelled.${reason ? '<br><br><strong>Reason:</strong> ' + reason : ''}`;
      bannerNotice = `❌ <strong>Order Cancelled</strong> &mdash; Order has been cancelled.`;
    } else if (statusLower === 'delivered') {
      subject = `🎉 Order Delivered — ${displayNum} | Rustic Heritage`;
      statusHeading = `Order Delivered Successfully!`;
      statusMessage = `Hello <strong>${name}</strong>, your order <strong>${displayNum}</strong> has been delivered successfully to your doorstep. We hope you love your traditional Indian kitchenware!`;
      bannerNotice = `🎉 <strong>Order Delivered</strong> &mdash; Order delivered successfully.`;
    } else {
      subject = `📦 Order Update: ${status.toUpperCase()} — ${displayNum} | Rustic Heritage`;
      statusHeading = `Order Status: ${status.toUpperCase()}`;
      statusMessage = `Hello <strong>${name}</strong>, your order <strong>${displayNum}</strong> status has been updated to <strong>${status.toUpperCase()}</strong>.`;
      bannerNotice = `📦 <strong>Order Update</strong> &mdash; Status set to ${status.toUpperCase()}.`;
    }

    const mainContentHtml = `
      <p style="font-size: 14.5px; line-height: 1.8; color: #D4C3AC; margin-bottom: 24px;">
        ${statusMessage}
      </p>

      <div style="text-align: left; margin-top: 28px;">
        <a href="${siteUrl}" class="btn-gold">VISIT WEBSITE &rarr;</a>
      </div>
    `;

    const htmlContent = buildEmailHtml({
      headerTitle: 'Rustic Heritage',
      headerSub: 'ORDER STATUS UPDATE',
      orderBadge: { label: 'ORDER ID', value: displayNum },
      bannerNotice,
      greeting: statusHeading,
      subtitle: `Updated on ${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}`,
      mainContentHtml,
      siteUrl,
      recipientEmail: customer_email,
    });

    let emailSent = false;
    if (transporter) {
      try {
        await transporter.sendMail({
          from: `Rustic Heritage Kitchenware <${process.env.SMTP_EMAIL}>`,
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
});

export default handler;
