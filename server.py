#!/usr/bin/env python3
"""
Rustic Heritage Kitchenware — Server
- Environment variables read strictly via os.environ
- Run: python server.py
"""

import os
import smtplib
import ssl
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

# ══════════════════════════════════════════════════════
#   ★ ENVIRONMENT CONFIGURATION ★
# ══════════════════════════════════════════════════════
RAZORPAY_KEY_ID     = os.environ.get("RAZORPAY_KEY_ID", "")
RAZORPAY_KEY_SECRET = os.environ.get("RAZORPAY_KEY_SECRET", "")

SMTP_EMAIL    = os.environ.get("SMTP_EMAIL", "")
SMTP_PASSWORD = os.environ.get("SMTP_PASSWORD", "")

ADMIN_EMAIL   = os.environ.get("ADMIN_EMAIL", "mathubharathi15@gmail.com")

SUPABASE_URL     = os.environ.get("SUPABASE_URL", "")
SUPABASE_ANON    = os.environ.get("SUPABASE_ANON_KEY", "")
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

def send_email_smtp(to_email, subject, html):
    """Send HTML email via Gmail SMTP."""
    if not SMTP_EMAIL or not SMTP_PASSWORD:
        print("  ⚠ SMTP_EMAIL or SMTP_PASSWORD not set in environment.")
        return False
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
    except (smtplib.SMTPException, OSError) as e1:
        print(f"  ⚠  SSL failed ({e1}), trying TLS:587…")

    try:
        with smtplib.SMTP("smtp.gmail.com", 587, timeout=15) as s:
            s.ehlo()
            s.starttls(context=ssl.create_default_context())
            s.login(SMTP_EMAIL, SMTP_PASSWORD)
            s.sendmail(SMTP_EMAIL, to_email, msg.as_string())
        print(f"  ✅ Email sent (TLS:587) → {to_email} | {subject[:50]}")
        return True
    except (smtplib.SMTPException, OSError) as e2:
        print(f"  ✗  Email failed: {e2}")
        return False