export function buildEmailHtml({
  headerTitle = 'Rustic Heritage',
  headerSub = 'HANDCRAFTED INDIAN KITCHENWARE',
  orderBadge = null, // e.g. { label: 'ORDER ID', value: 'RH-626452' }
  bannerNotice = null, // e.g. '📦 Cash on Delivery — Please keep ₹542 ready when your order arrives.'
  greeting = 'Hello, Friend!',
  subtitle = null,
  mainContentHtml = '',
  siteUrl = 'https://rustic-heritage.netlify.app',
  recipientEmail = '',
}) {
  const badgeHtml = orderBadge
    ? `
      <div style="background: rgba(30, 18, 9, 0.7); border: 1px solid #9E6C34; padding: 6px 14px; border-radius: 4px; display: inline-block; text-align: center;">
        <span style="font-size: 8px; letter-spacing: 2px; color: #C49A6C; text-transform: uppercase; display: block;">${orderBadge.label || 'ORDER ID'}</span>
        <span style="font-size: 13px; font-weight: bold; color: #FFF9F0; font-family: monospace;">${orderBadge.value}</span>
      </div>
    `
    : '';

  const bannerHtml = bannerNotice
    ? `
      <div style="background: #23160D; border-bottom: 1px solid #3B2616; padding: 12px 24px; font-size: 13px; color: #E2B674; text-align: center;">
        ${bannerNotice}
      </div>
    `
    : '';

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: 'Georgia', serif; background-color: #0E0A07; margin: 0; padding: 24px 12px; color: #F5ECD7; -webkit-font-smoothing: antialiased; }
    .email-wrapper { max-width: 600px; margin: 0 auto; background-color: #160F0A; border: 1px solid #3B2616; border-radius: 4px; overflow: hidden; box-shadow: 0 12px 40px rgba(0,0,0,0.6); }
    .email-header { background: linear-gradient(135deg, #4A2B11 0%, #855320 50%, #4A2B11 100%); padding: 24px 28px; border-bottom: 2px solid #9E6C34; }
    .header-table { width: 100%; border-collapse: collapse; }
    .brand-title { font-size: 24px; font-weight: bold; color: #FFF9F0; letter-spacing: 0.5px; margin: 0; }
    .brand-title span { font-style: italic; color: #E2B674; font-weight: normal; }
    .brand-subtitle { font-size: 9px; color: #E2B674; letter-spacing: 3px; text-transform: uppercase; margin-top: 4px; }
    .email-body { padding: 32px 28px; }
    .greeting-title { font-size: 22px; font-weight: bold; color: #FFF9F0; margin: 0 0 4px 0; }
    .greeting-subtitle { font-size: 12px; font-style: italic; color: #9E836A; margin: 0 0 24px 0; }
    .btn-gold { display: inline-block; background: linear-gradient(135deg, #6B3E16 0%, #8A521A 100%); color: #FFF9F0 !important; padding: 13px 32px; text-decoration: none; border-radius: 3px; font-weight: bold; font-size: 12px; letter-spacing: 2px; text-transform: uppercase; border: 1px solid #B8833E; }
    .email-footer { background: #100B07; border-top: 1px solid #23160D; padding: 24px; text-align: center; font-size: 11px; color: #8C735C; line-height: 1.6; }
    a { color: #E2B674; }
  </style>
</head>
<body>
  <div class="email-wrapper">
    <div class="email-header">
      <table class="header-table">
        <tr>
          <td>
            <h1 class="brand-title">${headerTitle} <span>Kitchenware</span></h1>
            <div class="brand-subtitle">✦ ${headerSub} ✦</div>
          </td>
          <td style="text-align: right; vertical-align: middle;">
            ${badgeHtml}
          </td>
        </tr>
      </table>
    </div>

    ${bannerHtml}

    <div class="email-body">
      <h2 class="greeting-title">${greeting}</h2>
      ${subtitle ? `<div class="greeting-subtitle">${subtitle}</div>` : ''}

      ${mainContentHtml}
    </div>

    <div class="email-footer">
      <div>✦ MELLOW CO. &middot; RUSTIC HERITAGE &middot; COIMBATORE, TAMIL NADU ✦</div>
      <div style="font-style: italic; margin-top: 4px; color: #6E5A47;">Crafted with love &middot; For questions reply to this email</div>
      ${recipientEmail ? `<div style="margin-top: 8px; font-size: 10px; color: #5C4A3A;">You're receiving this because you signed up at <a href="${siteUrl}" style="color:#8C735C;">rustic-heritage.netlify.app</a> with ${recipientEmail}</div>` : ''}
    </div>
  </div>
</body>
</html>
  `;
}
