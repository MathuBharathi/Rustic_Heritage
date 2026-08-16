#!/usr/bin/env python3
"""
Rustic Heritage Kitchenware — Server
- Emails via Gmail SMTP (FREE — no domain needed)
- Orders saved to Supabase
- Razorpay payments
- Run: python server.py
"""

import http.server, socketserver, os, sys, json, base64, hmac, hashlib, time
import urllib.request, urllib.error, smtplib, ssl
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from urllib.parse import urlparse

# ══════════════════════════════════════════════════════
#   ★ ENVIRONMENT CONFIGURATION ★
# ══════════════════════════════════════════════════════
RAZORPAY_KEY_ID     = os.environ.get("RAZORPAY_KEY_ID", "rzp_live_SYimvpChyTjZeQ")
RAZORPAY_KEY_SECRET = os.environ.get("RAZORPAY_KEY_SECRET", "")

SMTP_EMAIL    = os.environ.get("SMTP_EMAIL", "mathubharathi15@gmail.com")
SMTP_PASSWORD = os.environ.get("SMTP_PASSWORD", "")

ADMIN_EMAIL   = os.environ.get("ADMIN_EMAIL", "mathubharathi15@gmail.com")

SUPABASE_URL     = os.environ.get("SUPABASE_URL", "https://tlhhxpttifgtgnrzjrga.supabase.co")
SUPABASE_ANON    = os.environ.get("SUPABASE_ANON_KEY", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRsaGh4cHR0aWZndGducnpqcmdhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMyOTQ2MDUsImV4cCI6MjA5ODg3MDYwNX0.ZYB12Ekl1EImXRdxvyGNEvXLxnNOe-36oxvo3z4gSI0")
SUPABASE_SERVICE = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "")
# ══════════════════════════════════════════════════════

PORT      = 8000
DIRECTORY = os.path.dirname(os.path.abspath(__file__))
CORS = {
    "Access-Control-Allow-Origin":  "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Cache-Control":                "no-cache, no-store, must-revalidate",
}

# ── Gmail SMTP sender ──────────────────────────────────
def send_email_smtp(to_email, subject, html):
    """Send HTML email via Gmail SMTP. Tries SSL port 465, falls back to TLS 587."""
    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"]    = f"Rustic Heritage Kitchenware <{SMTP_EMAIL}>"
    msg["To"]      = to_email
    msg.attach(MIMEText(html, "html", "utf-8"))

    try:
        ctx = ssl.create_default_context()
        with smtplib.SMTP_SSL("smtp.gmail.com", 465, context=ctx) as s:
            s.login(SMTP_EMAIL, SMTP_PASSWORD)
            s.sendmail(SMTP_EMAIL, to_email, msg.as_string())
        print(f"  ✅ Email sent (SSL:465) → {to_email} | {subject[:50]}")
        return True
    except Exception as e1:
        print(f"  ⚠  SSL failed ({e1}), trying TLS:587…")

    try:
        with smtplib.SMTP("smtp.gmail.com", 587, timeout=15) as s:
            s.ehlo()
            s.starttls(context=ssl.create_default_context())
            s.login(SMTP_EMAIL, SMTP_PASSWORD)
            s.sendmail(SMTP_EMAIL, to_email, msg.as_string())
        print(f"  ✅ Email sent (TLS:587) → {to_email} | {subject[:50]}")
        return True
    except Exception as e2:
        print(f"  ✗  Email failed: {e2}")
        return False


class RusticHeritageHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def log_message(self, fmt, *args):
        path = getattr(self, "path", "/")
        if not path.startswith("/api"):
            return
        print(f"  {self.address_string()} [{getattr(self,'command','?')}] {path} — {fmt % args}")

    def end_headers(self):
        for k, v in CORS.items():
            self.send_header(k, v)
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

    def do_POST(self):
        path = urlparse(self.path).path
        try:
            n    = int(self.headers.get("Content-Length", 0))
            body = json.loads(self.rfile.read(n)) if n else {}
        except Exception:
            body = {}

        routes = {
            "/api/create-order":           self._create_order,
            "/api/verify-payment":         self._verify_payment,
            "/api/send-email":             self._send_email,
            "/api/save-order":             self._save_order,
            "/api/save-order-item":        self._save_order_item,
            "/api/save-newsletter":        self._save_newsletter,
            "/api/feedback":               self._save_feedback,
            "/api/send-welcome-email":     self._send_welcome_email,
            "/api/send-login-notify":      self._send_login_notify,
            "/api/subscribe":              self._subscribe,
            "/api/send-delivery-email":    self._send_delivery_email,
            "/api/get-orders":             self._get_orders,
            "/api/admin/get-users":        self._admin_get_users,
            "/api/admin/get-orders":       self._admin_get_orders,
            "/api/admin/get-subscribers":  self._admin_get_subscribers,
            "/api/admin/get-coupons":      self._admin_get_coupons,
            "/api/admin/create-coupon":    self._admin_create_coupon,
            "/api/admin/delete-coupon":    self._admin_delete_coupon,
            "/api/admin/update-order":     self._admin_update_order,
            "/api/update-profile":         self._update_profile,
            # ── NEW: Newsletter coupon email
            "/api/send-newsletter-coupon": self._send_newsletter_coupon,
            # ── NEW: Order status notification email
            "/api/send-order-status":      self._send_order_status,
        }
        handler = routes.get(path)
        if handler:
            handler(body)
        else:
            self._json(404, {"error": f"Route not found: {path}"})

    # 1. CREATE RAZORPAY ORDER
    def _create_order(self, body):
        try:
            creds   = base64.b64encode(f"{RAZORPAY_KEY_ID}:{RAZORPAY_KEY_SECRET}".encode()).decode()
            payload = json.dumps({
                "amount":   body.get("amount"),
                "currency": body.get("currency", "INR"),
                "receipt":  body.get("receipt", f"rh_{int(time.time())}"),
                "notes":    body.get("notes", {}),
            }).encode()
            req = urllib.request.Request(
                "https://api.razorpay.com/v1/orders",
                data=payload,
                headers={"Content-Type": "application/json", "Authorization": f"Basic {creds}"},
                method="POST",
            )
            with urllib.request.urlopen(req, timeout=15) as r:
                data = json.loads(r.read())
            print(f"  ✅ Razorpay order: {data.get('id')} — ₹{data.get('amount',0)//100}")
            self._json(200, data)
        except urllib.error.HTTPError as e:
            err = json.loads(e.read())
            print(f"  ✗  Razorpay {e.code}: {err}")
            self._json(500, {"error": err})
        except Exception as ex:
            print(f"  ✗  Order create error: {ex}")
            self._json(500, {"error": str(ex)})

    # 2. VERIFY RAZORPAY PAYMENT
    def _verify_payment(self, body):
        order_id = body.get("razorpay_order_id", "")
        if not order_id or order_id.startswith("order_DEV_"):
            return self._json(200, {"verified": True})
        try:
            msg      = f"{order_id}|{body.get('razorpay_payment_id','')}"
            expected = hmac.new(
                RAZORPAY_KEY_SECRET.encode(), msg.encode(), hashlib.sha256
            ).hexdigest()
            ok = hmac.compare_digest(expected, body.get("razorpay_signature", ""))
            self._json(200, {"verified": ok})
        except Exception as ex:
            self._json(500, {"error": str(ex), "verified": False})

    # 3. SEND EMAIL — Gmail SMTP
    def _send_email(self, body):
        to_list = body.get("to", [])
        subject = body.get("subject", "")
        html    = body.get("html", "")
        if not to_list or not html:
            return self._json(400, {"error": "to and html are required"})
        ok = send_email_smtp(to_list[0], subject, html)
        if ok and ("Order Confirmed" in subject or "Pay on Delivery" in subject):
            try:
                send_email_smtp(ADMIN_EMAIL, f"[ADMIN COPY] {subject}", html)
            except Exception:
                pass
        self._json(200 if ok else 500, {"ok": ok})

    # 4. SAVE ORDER to Supabase
    def _save_order(self, body):
        key = SUPABASE_SERVICE
        try:
            payload = json.dumps(body).encode()
            req = urllib.request.Request(
                f"{SUPABASE_URL}/rest/v1/orders",
                data=payload,
                headers={
                    "Content-Type":  "application/json",
                    "apikey":        key,
                    "Authorization": f"Bearer {key}",
                    "Prefer":        "return=minimal",
                },
                method="POST",
            )
            urllib.request.urlopen(req, timeout=15)
            print(f"  ✅ Order saved: {body.get('order_id')} | {body.get('customer_email')}")
            self._json(200, {"ok": True, "order_id": body.get("order_id")})
        except urllib.error.HTTPError as e:
            try:    err = json.loads(e.read())
            except: err = {"http": e.code}
            print(f"  ✗  Supabase order insert {e.code}: {err}")
            self._json(500, {"error": err})
        except Exception as ex:
            print(f"  ✗  Order save error: {ex}")
            self._json(500, {"error": str(ex)})

    # 5. SAVE ORDER ITEM
    def _save_order_item(self, body):
        key = SUPABASE_SERVICE
        try:
            payload = json.dumps({
                "order_id":     body.get("order_id", ""),
                "product_name": body.get("product_name", ""),
                "price":        body.get("price", 0),
                "quantity":     body.get("quantity", 1),
                "total":        body.get("total", 0),
            }).encode()
            req = urllib.request.Request(
                f"{SUPABASE_URL}/rest/v1/order_items",
                data=payload,
                headers={
                    "Content-Type":  "application/json",
                    "apikey":        key,
                    "Authorization": f"Bearer {key}",
                    "Prefer":        "return=minimal",
                },
                method="POST",
            )
            urllib.request.urlopen(req, timeout=10)
            print(f"  ✅ Item saved: {body.get('product_name')} × {body.get('quantity')}")
            self._json(200, {"ok": True})
        except urllib.error.HTTPError as e:
            try:    err = json.loads(e.read())
            except: err = {"http": e.code}
            self._json(500, {"error": err})
        except Exception as ex:
            self._json(500, {"error": str(ex)})

    # 6. SAVE NEWSLETTER SUBSCRIBER
    def _save_newsletter(self, body):
        key = SUPABASE_SERVICE
        try:
            payload = json.dumps({"email": body.get("email",""), "name": body.get("name","")}).encode()
            req = urllib.request.Request(
                f"{SUPABASE_URL}/rest/v1/subscribers",
                data=payload,
                headers={
                    "Content-Type":  "application/json",
                    "apikey":        key,
                    "Authorization": f"Bearer {key}",
                    "Prefer":        "return=minimal",
                },
                method="POST",
            )
            urllib.request.urlopen(req, timeout=10)
            print(f"  ✅ Newsletter: {body.get('email')}")
            self._json(200, {"ok": True})
        except urllib.error.HTTPError as e:
            try:    err = json.loads(e.read())
            except: err = {"http": e.code}
            if e.code == 409 or "duplicate" in str(err).lower():
                self._json(200, {"ok": True, "already_subscribed": True})
            else:
                self._json(500, {"error": err})
        except Exception as ex:
            self._json(500, {"error": str(ex)})

    # 7. SAVE FEEDBACK (contact form)
    def _save_feedback(self, body):
        key = SUPABASE_SERVICE
        try:
            payload = json.dumps({
                "name":    body.get("name", ""),
                "email":   body.get("email", ""),
                "subject": body.get("subject", ""),
                "message": body.get("message", ""),
            }).encode()
            req = urllib.request.Request(
                f"{SUPABASE_URL}/rest/v1/feedback",
                data=payload,
                headers={
                    "Content-Type":  "application/json",
                    "apikey":        key,
                    "Authorization": f"Bearer {key}",
                    "Prefer":        "return=minimal",
                },
                method="POST",
            )
            urllib.request.urlopen(req, timeout=10)
            print(f"  ✅ Feedback saved from: {body.get('email')}")
            self._json(200, {"ok": True})
        except Exception as ex:
            print(f"  ✗  Feedback error: {ex}")
            self._json(500, {"error": str(ex)})

    # 8. SEND WELCOME EMAIL (on signup)
    def _send_welcome_email(self, body):
        name  = body.get("name", "Valued Customer")
        email = body.get("email", "")
        if not email:
            return self._json(400, {"error": "email required"})

        html = f"""<!DOCTYPE html>
<html><head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#F5ECD7;font-family:'Georgia',serif">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr><td align="center" style="padding:40px 20px">
      <table width="580" cellpadding="0" cellspacing="0"
             style="background:#FDF6EC;border:1px solid #E8D5B7;border-top:4px solid #C49A6C;max-width:580px">
        <tr><td style="background:linear-gradient(135deg,#3B2A1A 0%,#5C3D1E 50%,#3B2A1A 100%);padding:28px 32px">
          <h1 style="margin:0;color:#FDF6EC;font-size:22px">🏺 Rustic Heritage <span style="color:#C49A6C;font-style:italic">Kitchenware</span></h1>
          <p style="margin:5px 0 0;color:rgba(196,154,108,0.7);font-size:10px;letter-spacing:4px;text-transform:uppercase">✦ Welcome to the Family ✦</p>
        </td></tr>
        <tr><td style="height:3px;background:linear-gradient(90deg,#C49A6C,#8B5E3C,#C49A6C)"></td></tr>
        <tr><td style="padding:32px">
          <h2 style="margin:0 0 12px;color:#5C3D1E;font-size:22px">Welcome, {name}! 🎉</h2>
          <p style="color:#8B5E3C;font-size:15px;line-height:1.9;margin:0 0 18px">
            Thank you for joining <strong>Rustic Heritage Kitchenware</strong>. You are now part of a
            community that values authentic, handcrafted Indian kitchenware rooted in tradition.
          </p>
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px">
            <tr>
              <td align="center" style="padding:14px;background:#F5ECD7;border:1px solid #E8D5B7;border-radius:8px;width:30%">
                <div style="font-size:24px;margin-bottom:6px">🏺</div>
                <div style="font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#C49A6C">Handcrafted</div>
                <div style="font-size:12px;color:#5C3D1E;margin-top:3px">15+ artisan pieces</div>
              </td>
              <td width="10"></td>
              <td align="center" style="padding:14px;background:#F5ECD7;border:1px solid #E8D5B7;border-radius:8px;width:30%">
                <div style="font-size:24px;margin-bottom:6px">🚚</div>
                <div style="font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#C49A6C">Free Shipping</div>
                <div style="font-size:12px;color:#5C3D1E;margin-top:3px">On orders above ₹999</div>
              </td>
              <td width="10"></td>
              <td align="center" style="padding:14px;background:#F5ECD7;border:1px solid #E8D5B7;border-radius:8px;width:30%">
                <div style="font-size:24px;margin-bottom:6px">↩️</div>
                <div style="font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#C49A6C">Easy Returns</div>
                <div style="font-size:12px;color:#5C3D1E;margin-top:3px">7-day return policy</div>
              </td>
            </tr>
          </table>
          <a href="products.html"
             style="display:inline-block;background:#5C3D1E;color:#FDF6EC;padding:14px 32px;
                    text-decoration:none;font-size:13px;letter-spacing:2px;text-transform:uppercase;
                    border:1px solid #C49A6C;font-family:'Georgia',serif;border-radius:4px">
            Explore Our Collection →
          </a>
        </td></tr>
        <tr><td style="padding:16px 32px;border-top:1px solid #E8D5B7;background:#F5ECD7;text-align:center">
          <p style="margin:0;font-size:10px;color:#C49A6C;letter-spacing:2px;text-transform:uppercase">
            ✦ Rustic Heritage Kitchenware · Coimbatore, Tamil Nadu ✦
          </p>
          <p style="margin:6px 0 0;font-size:11px;color:#8B5E3C;font-style:italic">
            Questions? mathubharathi15@gmail.com · +91 8072505342
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>"""

        ok = send_email_smtp(email, f"🏺 Welcome to Rustic Heritage Kitchenware, {name}!", html)
        try:
            send_email_smtp(ADMIN_EMAIL, f"🆕 New Signup: {name} ({email})",
                f"<p>New account: <strong>{name}</strong> — {email}</p>")
        except Exception:
            pass
        self._json(200 if ok else 500, {"ok": ok})

    # 9. SEND LOGIN NOTIFICATION
    def _send_login_notify(self, body):
        from datetime import datetime, timezone
        email = body.get("email", "")
        name  = body.get("name", email.split("@")[0] if email else "Customer")
        if not email:
            return self._json(400, {"error": "email required"})
        ts = datetime.now(timezone.utc).strftime("%d %B %Y, %I:%M %p UTC")

        html = f"""<!DOCTYPE html>
<html><head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#F5ECD7;font-family:'Georgia',serif">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr><td align="center" style="padding:40px 20px">
      <table width="580" cellpadding="0" cellspacing="0"
             style="background:#FDF6EC;border:1px solid #E8D5B7;border-top:4px solid #C49A6C;max-width:580px">
        <tr><td style="background:linear-gradient(135deg,#3B2A1A 0%,#5C3D1E 50%,#3B2A1A 100%);padding:28px 32px">
          <h1 style="margin:0;color:#FDF6EC;font-size:22px">🏺 Rustic Heritage <span style="color:#C49A6C;font-style:italic">Kitchenware</span></h1>
          <p style="margin:5px 0 0;color:rgba(196,154,108,0.7);font-size:10px;letter-spacing:4px;text-transform:uppercase">✦ Sign-In Alert ✦</p>
        </td></tr>
        <tr><td style="height:3px;background:linear-gradient(90deg,#C49A6C,#8B5E3C,#C49A6C)"></td></tr>
        <tr><td style="padding:32px">
          <h2 style="margin:0 0 12px;color:#5C3D1E;font-size:20px">Hello, {name}! 👋</h2>
          <p style="color:#8B5E3C;font-size:15px;line-height:1.8;margin:0 0 20px">
            A successful sign-in was detected on your Rustic Heritage account.
          </p>
          <table width="100%" cellpadding="0" cellspacing="0"
                 style="background:#F5ECD7;border:1px solid #E8D5B7;border-left:4px solid #C49A6C;margin-bottom:24px">
            <tr><td style="padding:16px 20px">
              <table cellpadding="5" cellspacing="0">
                <tr>
                  <td style="font-size:11px;letter-spacing:1px;text-transform:uppercase;color:#C49A6C;width:90px">Account</td>
                  <td style="font-size:14px;color:#3B2A1A">{email}</td>
                </tr>
                <tr>
                  <td style="font-size:11px;letter-spacing:1px;text-transform:uppercase;color:#C49A6C">Time</td>
                  <td style="font-size:14px;color:#3B2A1A">{ts}</td>
                </tr>
              </table>
            </td></tr>
          </table>
          <p style="color:#8B5E3C;font-size:13px;line-height:1.7;margin:0 0 20px">
            If this was you, no action needed — enjoy shopping! 🛒<br/>
            If you did <strong>not</strong> sign in, please
            <a href="mailto:mathubharathi15@gmail.com" style="color:#5C3D1E">contact us immediately</a>.
          </p>
        </td></tr>
        <tr><td style="padding:16px 32px;border-top:1px solid #E8D5B7;background:#F5ECD7;text-align:center">
          <p style="margin:0;font-size:10px;color:#C49A6C;letter-spacing:2px;text-transform:uppercase">
            ✦ Rustic Heritage Kitchenware · Coimbatore, Tamil Nadu ✦
          </p>
          <p style="margin:6px 0 0;font-size:11px;color:#8B5E3C">
            mathubharathi15@gmail.com · +91 8072505342
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>"""

        ok = send_email_smtp(email, "🔐 New Sign-In to Your Rustic Heritage Account", html)
        try:
            send_email_smtp(ADMIN_EMAIL, f"👤 Login: {email} at {ts}",
                f"<p><strong>{name}</strong> ({email}) signed in at {ts}</p>")
        except Exception:
            pass
        self._json(200 if ok else 500, {"ok": ok})

    def _json(self, status, data):
        body = json.dumps(data).encode()
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    # ═══════════════════════════════════════════
    #   NEW ROUTES
    # ═══════════════════════════════════════════

    # 10. SUBSCRIBE — save subscriber + send coupon email
    def _subscribe(self, body):
        import random, string
        email = body.get("email", "").strip()
        if not email:
            return self._json(400, {"error": "email required"})

        key = SUPABASE_SERVICE
        already_subscribed = False

        # Save to subscribers
        try:
            payload = json.dumps({"email": email, "name": ""}).encode()
            req = urllib.request.Request(
                f"{SUPABASE_URL}/rest/v1/subscribers",
                data=payload,
                headers={
                    "Content-Type": "application/json",
                    "apikey": key, "Authorization": f"Bearer {key}",
                    "Prefer": "return=minimal",
                },
                method="POST",
            )
            urllib.request.urlopen(req, timeout=10)
            print(f"  ✅ Subscriber saved: {email}")
        except urllib.error.HTTPError as e:
            if e.code == 409 or "duplicate" in str(e.read()).lower():
                already_subscribed = True
            else:
                pass  # Non-fatal
        except Exception as ex:
            print(f"  ⚠  Subscribe save error: {ex}")

        # Generate coupon: random 15-20% discount
        discount = random.randint(15, 20)
        code_suffix = ''.join(random.choices(string.ascii_uppercase + string.digits, k=5))
        coupon_code = f"RH{discount}OFF-{code_suffix}"

        # Send coupon email
        html = f"""<!DOCTYPE html>
<html><head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#F5ECD7;font-family:'Georgia',serif">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr><td align="center" style="padding:40px 20px">
      <table width="580" cellpadding="0" cellspacing="0"
             style="background:#FDF6EC;border:1px solid #E8D5B7;border-top:4px solid #C49A6C;max-width:580px">
        <tr><td style="background:linear-gradient(135deg,#3B2A1A 0%,#5C3D1E 50%,#3B2A1A 100%);padding:28px 32px">
          <h1 style="margin:0;color:#FDF6EC;font-size:22px">🏺 Rustic Heritage <span style="color:#C49A6C;font-style:italic">Kitchenware</span></h1>
          <p style="margin:5px 0 0;color:rgba(196,154,108,0.7);font-size:10px;letter-spacing:4px;text-transform:uppercase">✦ Exclusive Offer Inside ✦</p>
        </td></tr>
        <tr><td style="height:3px;background:linear-gradient(90deg,#C49A6C,#8B5E3C,#C49A6C)"></td></tr>
        <tr><td style="padding:32px;text-align:center">
          <h2 style="margin:0 0 12px;color:#5C3D1E;font-size:24px">🎉 You're Subscribed!</h2>
          <p style="color:#8B5E3C;font-size:15px;line-height:1.8;margin:0 0 24px">
            Thank you for subscribing to Rustic Heritage Kitchenware!<br/>
            Here's your exclusive discount coupon:
          </p>
          <div style="background:#F5ECD7;border:2px dashed #C49A6C;padding:20px;margin:0 auto 24px;max-width:300px;border-radius:8px">
            <p style="margin:0 0 6px;font-size:10px;letter-spacing:3px;text-transform:uppercase;color:#C49A6C">Your Coupon Code</p>
            <p style="margin:0;font-size:28px;font-weight:bold;color:#5C3D1E;letter-spacing:3px">{coupon_code}</p>
            <p style="margin:8px 0 0;font-size:16px;color:#8B5E3C">{discount}% OFF your next order!</p>
          </div>
          <a href="products.html"
             style="display:inline-block;background:#5C3D1E;color:#FDF6EC;padding:14px 32px;
                    text-decoration:none;font-size:13px;letter-spacing:2px;text-transform:uppercase;
                    border:1px solid #C49A6C;font-family:'Georgia',serif;border-radius:4px">
            Shop Now →
          </a>
        </td></tr>
        <tr><td style="padding:16px 32px;border-top:1px solid #E8D5B7;background:#F5ECD7;text-align:center">
          <p style="margin:0;font-size:10px;color:#C49A6C;letter-spacing:2px;text-transform:uppercase">
            ✦ Rustic Heritage Kitchenware · Coimbatore, Tamil Nadu ✦
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>"""

        send_email_smtp(email, f"🎉 Your Exclusive {discount}% Discount Coupon — Rustic Heritage", html)
        self._json(200, {"ok": True, "already_subscribed": already_subscribed, "coupon": coupon_code})

    # 11. SEND DELIVERY CONFIRMATION EMAIL
    def _send_delivery_email(self, body):
        email = body.get("customer_email", "")
        name  = body.get("customer_name", "Valued Customer")
        order_id = body.get("order_id", "")
        total = body.get("total", 0)
        if not email:
            return self._json(400, {"error": "customer_email required"})

        html = f"""<!DOCTYPE html>
<html><head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#F5ECD7;font-family:'Georgia',serif">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr><td align="center" style="padding:40px 20px">
      <table width="580" cellpadding="0" cellspacing="0"
             style="background:#FDF6EC;border:1px solid #E8D5B7;border-top:4px solid #C49A6C;max-width:580px">
        <tr><td style="background:linear-gradient(135deg,#3B2A1A 0%,#5C3D1E 50%,#3B2A1A 100%);padding:28px 32px">
          <h1 style="margin:0;color:#FDF6EC;font-size:22px">🏺 Rustic Heritage <span style="color:#C49A6C;font-style:italic">Kitchenware</span></h1>
          <p style="margin:5px 0 0;color:rgba(196,154,108,0.7);font-size:10px;letter-spacing:4px;text-transform:uppercase">✦ Delivery Confirmation ✦</p>
        </td></tr>
        <tr><td style="height:3px;background:linear-gradient(90deg,#C49A6C,#8B5E3C,#C49A6C)"></td></tr>
        <tr><td style="padding:32px;text-align:center">
          <div style="font-size:56px;margin-bottom:16px">📦✅</div>
          <h2 style="margin:0 0 12px;color:#5C3D1E;font-size:22px">Order Delivered Successfully!</h2>
          <p style="color:#8B5E3C;font-size:15px;line-height:1.8;margin:0 0 20px">
            Dear <strong>{name}</strong>,<br/>
            Your order <strong>{order_id}</strong> has been successfully delivered!<br/>
            Total: <strong>₹{total:,.0f}</strong>
          </p>
          <p style="color:#8B5E3C;font-size:14px;line-height:1.8;margin:0 0 24px">
            Thank you for shopping with Rustic Heritage Kitchenware! 🙏<br/>
            We hope you love your traditional kitchenware.
          </p>
          <a href="products.html"
             style="display:inline-block;background:#5C3D1E;color:#FDF6EC;padding:14px 32px;
                    text-decoration:none;font-size:13px;letter-spacing:2px;text-transform:uppercase;
                    border:1px solid #C49A6C;font-family:'Georgia',serif;border-radius:4px">
            Shop Again →
          </a>
        </td></tr>
        <tr><td style="padding:16px 32px;border-top:1px solid #E8D5B7;background:#F5ECD7;text-align:center">
          <p style="margin:0;font-size:10px;color:#C49A6C;letter-spacing:2px;text-transform:uppercase">
            ✦ Rustic Heritage Kitchenware · Coimbatore, Tamil Nadu ✦
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>"""

        ok = send_email_smtp(email, f"📦 Order {order_id} Delivered — Rustic Heritage Kitchenware", html)
        self._json(200 if ok else 500, {"ok": ok})

    # 12. GET ORDERS (for user profile)
    def _get_orders(self, body):
        email = body.get("email", "")
        if not email:
            return self._json(400, {"error": "email required"})
        key = SUPABASE_SERVICE
        try:
            url = f"{SUPABASE_URL}/rest/v1/orders?customer_email=eq.{email}&order=created_at.desc"
            req = urllib.request.Request(url, headers={
                "apikey": key, "Authorization": f"Bearer {key}",
            })
            with urllib.request.urlopen(req, timeout=10) as r:
                orders = json.loads(r.read())
            self._json(200, {"orders": orders})
        except Exception as ex:
            print(f"  ✗  Get orders error: {ex}")
            self._json(500, {"error": str(ex), "orders": []})

    # 13. ADMIN: GET ALL USERS
    def _admin_get_users(self, body):
        key = SUPABASE_SERVICE
        try:
            url = f"{SUPABASE_URL}/rest/v1/users?order=created_at.desc"
            req = urllib.request.Request(url, headers={
                "apikey": key, "Authorization": f"Bearer {key}",
            })
            with urllib.request.urlopen(req, timeout=10) as r:
                users = json.loads(r.read())
            self._json(200, {"users": users})
        except Exception as ex:
            print(f"  ✗  Admin get users error: {ex}")
            self._json(500, {"error": str(ex), "users": []})

    # 14. ADMIN: GET ALL ORDERS
    def _admin_get_orders(self, body):
        key = SUPABASE_SERVICE
        try:
            url = f"{SUPABASE_URL}/rest/v1/orders?order=created_at.desc"
            req = urllib.request.Request(url, headers={
                "apikey": key, "Authorization": f"Bearer {key}",
            })
            with urllib.request.urlopen(req, timeout=10) as r:
                orders = json.loads(r.read())
            self._json(200, {"orders": orders})
        except Exception as ex:
            print(f"  ✗  Admin get orders error: {ex}")
            self._json(500, {"error": str(ex), "orders": []})

    # 15. ADMIN: GET ALL SUBSCRIBERS
    def _admin_get_subscribers(self, body):
        key = SUPABASE_SERVICE
        try:
            url = f"{SUPABASE_URL}/rest/v1/subscribers?order=created_at.desc"
            req = urllib.request.Request(url, headers={
                "apikey": key, "Authorization": f"Bearer {key}",
            })
            with urllib.request.urlopen(req, timeout=10) as r:
                subs = json.loads(r.read())
            self._json(200, {"subscribers": subs})
        except Exception as ex:
            print(f"  ✗  Admin get subscribers error: {ex}")
            self._json(500, {"error": str(ex), "subscribers": []})

    # 16. ADMIN: GET ALL COUPONS
    def _admin_get_coupons(self, body):
        key = SUPABASE_SERVICE
        try:
            url = f"{SUPABASE_URL}/rest/v1/coupons?order=created_at.desc"
            req = urllib.request.Request(url, headers={
                "apikey": key, "Authorization": f"Bearer {key}",
            })
            with urllib.request.urlopen(req, timeout=10) as r:
                coupons = json.loads(r.read())
            self._json(200, {"coupons": coupons})
        except Exception as ex:
            print(f"  ✗  Admin get coupons error: {ex}")
            self._json(200, {"coupons": []})

    # 17. ADMIN: CREATE COUPON
    def _admin_create_coupon(self, body):
        key = SUPABASE_SERVICE
        try:
            payload = json.dumps({
                "code":             body.get("code", "").upper(),
                "discount_percent": body.get("discount_percent", 10),
                "usage_type":       body.get("usage_type", "unlimited"),
                "max_uses":         body.get("max_uses"),
                "used_count":       0,
            }).encode()
            req = urllib.request.Request(
                f"{SUPABASE_URL}/rest/v1/coupons",
                data=payload,
                headers={
                    "Content-Type": "application/json",
                    "apikey": key, "Authorization": f"Bearer {key}",
                    "Prefer": "return=minimal",
                },
                method="POST",
            )
            urllib.request.urlopen(req, timeout=10)
            print(f"  ✅ Coupon created: {body.get('code')}")
            self._json(200, {"ok": True})
        except urllib.error.HTTPError as e:
            try:    err = json.loads(e.read())
            except: err = {"http": e.code}
            self._json(500, {"ok": False, "error": str(err)})
        except Exception as ex:
            self._json(500, {"ok": False, "error": str(ex)})

    # 18. ADMIN: DELETE COUPON
    def _admin_delete_coupon(self, body):
        key = SUPABASE_SERVICE
        code = body.get("code", "")
        if not code:
            return self._json(400, {"error": "code required"})
        try:
            url = f"{SUPABASE_URL}/rest/v1/coupons?code=eq.{code}"
            req = urllib.request.Request(url, headers={
                "apikey": key, "Authorization": f"Bearer {key}",
            }, method="DELETE")
            urllib.request.urlopen(req, timeout=10)
            print(f"  ✅ Coupon deleted: {code}")
            self._json(200, {"ok": True})
        except Exception as ex:
            self._json(500, {"ok": False, "error": str(ex)})

    # 19. ADMIN: UPDATE ORDER STATUS
    def _admin_update_order(self, body):
        key = SUPABASE_SERVICE
        order_id = body.get("order_id", "")
        if not order_id:
            return self._json(400, {"error": "order_id required"})

        update = {}
        if "payment_status" in body:
            update["payment_status"] = body["payment_status"]
        if "status" in body:
            update["status"] = body["status"]
        if not update:
            return self._json(400, {"error": "nothing to update"})

        try:
            url = f"{SUPABASE_URL}/rest/v1/orders?order_id=eq.{order_id}"
            payload = json.dumps(update).encode()
            req = urllib.request.Request(url, data=payload, headers={
                "Content-Type": "application/json",
                "apikey": key, "Authorization": f"Bearer {key}",
                "Prefer": "return=minimal",
            }, method="PATCH")
            urllib.request.urlopen(req, timeout=10)
            print(f"  ✅ Order updated: {order_id} → {update}")
            self._json(200, {"ok": True})
        except Exception as ex:
            print(f"  ✗  Order update error: {ex}")
            self._json(500, {"ok": False, "error": str(ex)})

    # 20. UPDATE USER PROFILE
    def _update_profile(self, body):
        key = SUPABASE_SERVICE
        user_id = body.get("user_id", "")
        if not user_id:
            return self._json(400, {"error": "user_id required"})
        update = {}
        if "name" in body:  update["name"]  = body["name"]
        if "email" in body: update["email"] = body["email"]
        if "phone" in body: update["phone"] = body["phone"]
        if not update:
            return self._json(400, {"error": "nothing to update"})
        try:
            url = f"{SUPABASE_URL}/rest/v1/users?id=eq.{user_id}"
            payload = json.dumps(update).encode()
            req = urllib.request.Request(url, data=payload, headers={
                "Content-Type": "application/json",
                "apikey": key, "Authorization": f"Bearer {key}",
                "Prefer": "return=minimal",
            }, method="PATCH")
            urllib.request.urlopen(req, timeout=10)
            self._json(200, {"ok": True})
        except Exception as ex:
            self._json(500, {"ok": False, "error": str(ex)})


def main():
    os.chdir(DIRECTORY)
    smtp_ready = "PASTE" not in SMTP_PASSWORD

    with socketserver.TCPServer(("", PORT), RusticHeritageHandler) as httpd:
        httpd.allow_reuse_address = True
        print("\n" + "═"*62)
        print("  🏺  Rustic Heritage Kitchenware — Server")
        print("═"*62)
        print(f"  ✦  http://localhost:{PORT}")
        print("─"*62)
        print(f"  Razorpay   : {RAZORPAY_KEY_ID[:20]}...")
        print(f"  Gmail SMTP : {SMTP_EMAIL}")
        print(f"  App Passwd : {'✅ SET' if smtp_ready else '⚠  NOT SET'}")
        print(f"  Supabase   : {SUPABASE_URL}")
        print(f"  Admin email: {ADMIN_EMAIL}")
        print("─"*62)
        print("  Routes:")
        print("    POST /api/create-order       Razorpay order")
        print("    POST /api/verify-payment     Razorpay signature check")
        print("    POST /api/send-email         Send via Gmail SMTP ✅")
        print("    POST /api/save-order         Save order to Supabase")
        print("    POST /api/save-order-item    Save each item")
        print("    POST /api/save-newsletter    Save subscriber")
        print("    POST /api/feedback           Save contact form")
        print("    POST /api/send-welcome-email Welcome email on signup")
        print("    POST /api/send-login-notify  Login alert email")
        print("    POST /api/subscribe          Subscribe + coupon email")
        print("    POST /api/send-delivery-email Delivery confirmation")
        print("    POST /api/get-orders         User's orders")
        print("    POST /api/admin/*            Admin panel endpoints")
        print("─"*62)
        print("  Ctrl+C to stop\n")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n  ✦  Stopped.\n")
            sys.exit(0)

if __name__ == "__main__":
    main()