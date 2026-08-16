// ═══════════════════════════════════════════════════════════
//  RUSTIC HERITAGE KITCHENWARE — Welcome Email (Signup)
//  Sends a beautiful welcome email after a new user registers.
//
//  HOW TO USE:
//  1. This is called automatically from auth-modal.js / server.py when a user signs up.
//  2. The server.py handles actual sending via Gmail SMTP.
//  3. To test standalone: node resend-welcome-email.js
//
//  EMAIL is sent via Gmail SMTP in server.py
//  (mathubharathi15@gmail.com)
// ═══════════════════════════════════════════════════════════

/**
 * Build and send a welcome email to a newly registered user.
 * Called from auth-modal.js → POST /api/send-welcome-email
 * @param {string} name  - User's full name
 * @param {string} email - User's email address
 */
async function sendWelcomeEmail(name, email) {
  if (!name || !email) {
    console.error('sendWelcomeEmail: name and email are required');
    return;
  }

  const html = buildWelcomeEmailHTML(name, email);

  try {
    const res = await fetch('/api/send-welcome-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, html }),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error('❌ Server error:', data);
      return null;
    }

    console.log(`✅ Welcome email sent to ${email}`);
    return data;
  } catch (err) {
    console.error('❌ Network error sending welcome email:', err.message);
    return null;
  }
}

// ─────────────────────────────────────────────────────────
//  EMAIL HTML TEMPLATE — Welcome
// ─────────────────────────────────────────────────────────
function buildWelcomeEmailHTML(name, email) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Welcome to Rustic Heritage Kitchenware</title>
</head>
<body style="margin:0;padding:0;background:#F5ECD7;font-family:'Georgia',serif">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr><td align="center" style="padding:48px 20px">

      <table width="600" cellpadding="0" cellspacing="0"
             style="background:#FDF6EC;border:1px solid #E8D5B7;border-top:4px solid #C49A6C;max-width:600px">

        <!-- Header -->
        <tr><td style="background:linear-gradient(135deg,#3B2A1A 0%,#5C3D1E 60%,#3B2A1A 100%);padding:32px 36px">
          <h1 style="margin:0;color:#FDF6EC;font-size:26px;font-family:'Georgia',serif;letter-spacing:1px">
            🏺 Rustic Heritage <span style="color:#C49A6C;font-style:italic">Kitchenware</span>
          </h1>
          <p style="margin:6px 0 0;color:rgba(196,154,108,0.75);font-size:11px;letter-spacing:4px;text-transform:uppercase">
            ✦ &nbsp; Rooted in Tradition &nbsp; ✦
          </p>
        </td></tr>

        <!-- Gold bar -->
        <tr><td style="height:3px;background:linear-gradient(90deg,#C49A6C,#8B5E3C,#C49A6C)"></td></tr>

        <!-- Body -->
        <tr><td style="padding:40px 36px">
          <p style="margin:0 0 6px;font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#C49A6C">
            Welcome to the Family
          </p>
          <h2 style="margin:0 0 18px;color:#3B2A1A;font-size:26px;font-family:'Georgia',serif">
            Hello, ${name}! 🏺
          </h2>
          <p style="color:#5C3D1E;font-size:16px;line-height:1.9;font-style:italic;margin:0 0 28px">
            We're thrilled to welcome you to <strong style="color:#3B2A1A">Rustic Heritage Kitchenware</strong>.
            You now have access to over <strong style="color:#3B2A1A">15 authentic handcrafted pieces</strong> —
            each one carrying centuries of Indian culinary tradition.
          </p>

          <!-- Highlight boxes -->
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px">
            <tr>
              <td width="32%" style="padding:16px;background:#F5ECD7;border:1px solid #E8D5B7;text-align:center;vertical-align:top">
                <div style="font-size:24px;margin-bottom:6px">🌿</div>
                <div style="font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#C49A6C;margin-bottom:4px">100% Natural</div>
                <div style="font-size:13px;color:#3B2A1A">No harmful coatings</div>
              </td>
              <td width="2%" style="padding:0"></td>
              <td width="32%" style="padding:16px;background:#F5ECD7;border:1px solid #E8D5B7;text-align:center;vertical-align:top">
                <div style="font-size:24px;margin-bottom:6px">🚚</div>
                <div style="font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#C49A6C;margin-bottom:4px">Free Shipping</div>
                <div style="font-size:13px;color:#3B2A1A">On orders above ₹999</div>
              </td>
              <td width="2%" style="padding:0"></td>
              <td width="32%" style="padding:16px;background:#F5ECD7;border:1px solid #E8D5B7;text-align:center;vertical-align:top">
                <div style="font-size:24px;margin-bottom:6px">↩️</div>
                <div style="font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#C49A6C;margin-bottom:4px">Easy Returns</div>
                <div style="font-size:13px;color:#3B2A1A">7-day return policy</div>
              </td>
            </tr>
          </table>

          <a href="products.html"
             style="display:inline-block;background:#3B2A1A;color:#FDF6EC;padding:16px 36px;
                    text-decoration:none;font-size:14px;letter-spacing:2px;text-transform:uppercase;
                    border:1px solid #C49A6C;font-family:'Georgia',serif;border-radius:4px">
            Explore Our Collection →
          </a>

          <p style="margin:28px 0 0;font-size:13px;color:#8B5E3C;font-style:italic;line-height:1.8">
            Questions? Just reply to this email or call us — we'd love to hear from you.
          </p>
        </td></tr>

        <!-- Footer -->
        <tr><td style="padding:20px 36px 28px;border-top:1px solid #E8D5B7;background:#F5ECD7;text-align:center">
          <p style="margin:0;font-size:11px;color:#8B5E3C;letter-spacing:2px;text-transform:uppercase">
            ✦ &nbsp; Rustic Heritage Kitchenware &nbsp;·&nbsp; Coimbatore, Tamil Nadu &nbsp; ✦
          </p>
          <p style="margin:6px 0 0;font-size:11px;color:#C49A6C;font-style:italic">
            Crafted with love for traditional kitchens everywhere
          </p>
          <p style="margin:10px 0 0;font-size:11px;color:#8B5E3C">
            📧 mathubharathi15@gmail.com &nbsp;·&nbsp; 📞 +91 8072505342
          </p>
          <p style="margin:8px 0 0;font-size:10px;color:#C0A882">
            You're receiving this because you signed up at Rustic Heritage Kitchenware with ${email}
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

// ─────────────────────────────────────────────────────────
//  STANDALONE TEST — run: node resend-welcome-email.js
// ─────────────────────────────────────────────────────────
if (typeof module !== 'undefined' && require.main === module) {
  // Change these to test:
  const TEST_NAME  = 'Test User';
  const TEST_EMAIL = 'your@email.com'; // ← put your email here to test

  // For standalone test, print the HTML to console
  const html = buildWelcomeEmailHTML(TEST_NAME, TEST_EMAIL);
  console.log('📧 Welcome email HTML built successfully.');
  console.log('   To send, run server.py and POST to /api/send-welcome-email');
  console.log('   Body: { "name": "Test User", "email": "your@email.com" }');
}

// Export for use in other modules
if (typeof module !== 'undefined') {
  module.exports = { sendWelcomeEmail, buildWelcomeEmailHTML };
}
