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
    const { name, email } = req.body || {};
    if (!email) return res.status(400).json({ error: 'Email is required' });

    const transporter = getTransporter();
    const recipientName = name || 'Friend';
    const siteUrl = process.env.PUBLIC_SITE_URL || 'http://localhost:3000';

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
          .main-title { font-size: 21px; font-weight: bold; color: #3B2A1A; margin-top: 0; margin-bottom: 12px; }
          .message-p { font-size: 14.5px; line-height: 1.6; color: #5C3D1E; margin-bottom: 20px; }
          .feature-box { background: #FDF6EC; border: 1px solid #E8D5B7; border-radius: 8px; padding: 18px; margin: 20px 0; }
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
            <h2 class="main-title">Welcome to Rustic Heritage, ${recipientName}! 🎉</h2>
            <p class="message-p">
              Thank you for creating your account with us. We are delighted to share authentic handcrafted Indian cookware, clay pots, pre-seasoned cast iron, and traditional kitchen utensils with you.
            </p>

            <div class="feature-box">
              <h4 style="margin: 0 0 8px 0; color: #3B2A1A; font-size: 14px;">✨ Member Privileges</h4>
              <ul style="margin: 0; padding-left: 20px; color: #5C3D1E; font-size: 13.5px; line-height: 1.6;">
                <li>Faster &amp; seamless checkout</li>
                <li>Live order tracking and profile order history</li>
                <li>Exclusive access to seasonal sales and new artisan drops</li>
              </ul>
            </div>

            <div style="text-align: center; margin-top: 28px;">
              <a href="${siteUrl}/products" class="btn-action">Explore Products Collection &rarr;</a>
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
      to: email,
      subject: '🎉 Welcome to Rustic Heritage Kitchenware!',
      html: htmlContent,
    };

    await transporter.sendMail(mailOptions);
    return res.status(200).json({ success: true, message: `Welcome email sent to ${email}` });
  } catch (err) {
    console.error('Send Welcome Email Error:', err);
    return res.status(500).json({ error: err.message || 'Failed to send welcome email' });
  }
}
