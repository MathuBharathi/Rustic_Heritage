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
    const { name, email } = req.body || {};
    if (!email) return res.status(400).json({ error: 'Email is required' });

    const transporter = getTransporter();
    if (!transporter) {
      return res.status(500).json({ error: 'SMTP environment variables missing.' });
    }

    const recipientName = name || 'Friend';
    const siteUrl = process.env.PUBLIC_SITE_URL || 'https://rustic-heritage.netlify.app';

    const mainContentHtml = `
      <div style="font-size: 9px; letter-spacing: 2px; color: #C49A6C; text-transform: uppercase; margin-bottom: 6px; font-weight: bold;">WELCOME TO THE CIRCLE</div>
      <p style="font-size: 14.5px; line-height: 1.8; color: #D4C3AC; margin-bottom: 24px;">
        We're thrilled to welcome you to the <em>Rustic Heritage Circle</em>. You now have access to over <strong>25 handcrafted Indian kitchenware pieces</strong> &mdash; made with love, tradition, and meticulous attention to detail.
      </p>

      <table width="100%" cellpadding="0" cellspacing="0" style="margin: 24px 0;">
        <tr>
          <td width="31%" align="center" style="background: #1C130B; border: 1px solid #2B1D12; border-radius: 4px; padding: 16px 8px;">
            <div style="font-size: 22px; margin-bottom: 6px;">🏺</div>
            <div style="font-size: 9px; letter-spacing: 1px; text-transform: uppercase; color: #E2B674; font-weight: bold;">HANDCRAFTED</div>
            <div style="font-size: 11px; color: #9E836A; margin-top: 4px;">25+ artisan pieces</div>
          </td>
          <td width="3.5%"></td>
          <td width="31%" align="center" style="background: #1C130B; border: 1px solid #2B1D12; border-radius: 4px; padding: 16px 8px;">
            <div style="font-size: 22px; margin-bottom: 6px;">🚚</div>
            <div style="font-size: 9px; letter-spacing: 1px; text-transform: uppercase; color: #E2B674; font-weight: bold;">DELIVERED</div>
            <div style="font-size: 11px; color: #9E836A; margin-top: 4px;">Straight to your door</div>
          </td>
          <td width="3.5%"></td>
          <td width="31%" align="center" style="background: #1C130B; border: 1px solid #2B1D12; border-radius: 4px; padding: 16px 8px;">
            <div style="font-size: 22px; margin-bottom: 6px;">✨</div>
            <div style="font-size: 9px; letter-spacing: 1px; text-transform: uppercase; color: #E2B674; font-weight: bold;">QUALITY</div>
            <div style="font-size: 11px; color: #9E836A; margin-top: 4px;">Est. since 2008</div>
          </td>
        </tr>
      </table>

      <div style="text-align: left; margin-top: 28px; margin-bottom: 24px;">
        <a href="${siteUrl}" class="btn-gold">VISIT WEBSITE &rarr;</a>
      </div>

      <div style="font-size: 12px; font-style: italic; color: #8C735C; margin-top: 24px; border-top: 1px solid #23170E; padding-top: 16px;">
        If you have any questions, just reply to this email &mdash; we'd love to hear from you.
      </div>
    `;

    const htmlContent = buildEmailHtml({
      headerTitle: 'Rustic Heritage',
      headerSub: 'HANDCRAFTED INDIAN KITCHENWARE',
      greeting: `Hello, ${recipientName}! 🏺`,
      mainContentHtml,
      siteUrl,
      recipientEmail: email,
    });

    const mailOptions = {
      from: `Rustic Heritage Kitchenware <${process.env.SMTP_EMAIL}>`,
      to: email,
      subject: `🏺 Welcome to Rustic Heritage, ${recipientName}!`,
      html: htmlContent,
    };

    await transporter.sendMail(mailOptions);
    return res.status(200).json({ success: true, message: `Welcome email sent to ${email}` });
  } catch (err) {
    console.error('Send Welcome Email Error:', err);
    return res.status(500).json({ error: err.message || 'Failed to send welcome email' });
  }
});

export default handler;
