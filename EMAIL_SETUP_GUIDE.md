# Rustic Heritage Kitchenware — Email Setup & Notification Guide

This guide explains how email notifications work and how to configure your SMTP credentials for live production email delivery.

---

## 📧 Supported Email Notifications

Every key user action automatically triggers a branded, custom HTML email:

| User Action | Triggered Email | Target Recipient | Handler |
| :--- | :--- | :--- | :--- |
| **Registration** | Account Creation Welcome Email | User's Registered Email | `/api/send-welcome-email` |
| **Subscription** | Welcome Gift Coupon Code Email | Subscriber's Email | `/api/newsletter-subscribe` |
| **Order Placement** | Order Receipt & Details Confirmation | Customer's Checkout Email | `/api/send-order-email` |
| **Order Status: Confirmed** | Order Confirmed & Dispatch Preparation Email | Customer's Order Email | `/api/send-order-status` |
| **Order Status: Delivered** | Order Delivered Confirmation Email | Customer's Order Email | `/api/send-order-status` |
| **Order Status: Cancelled** | Order Cancellation Notice Email | Customer's Order Email | `/api/send-order-status` |

---

## ⚙️ How to Configure Email Credentials (SMTP)

Your system uses Gmail SMTP (`smtp.gmail.com`) via Nodemailer to send emails.

### 1. Environment Variables (`.env`)
Ensure the following keys exist in your `.env` file (or Vercel Environment Variables):

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_EMAIL=workatbuildcrew@gmail.com
SMTP_PASSWORD=your_16_character_app_password
```

### 2. How to Generate a Gmail App Password
Standard Gmail passwords **will not work** due to Google security policies. You must generate a **Gmail App Password**:

1. Go to your Google Account: [https://myaccount.google.com/](https://myaccount.google.com/)
2. Select **Security** from the left menu.
3. Enable **2-Step Verification** (if not already enabled).
4. Search for **App passwords** in the top search bar (or visit [https://myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)).
5. Type an app name (e.g., `Rustic Heritage Website`) and click **Create**.
6. Google will generate a 16-character passcode (e.g., `bexm ykoq fncg hhku`).
7. Copy this 16-character code (without spaces) into `.env` as `SMTP_PASSWORD`:
   ```env
   SMTP_PASSWORD=bexmykoqfncghhku
   ```

---

## 🚀 Local Development & Deployment

- **Local Dev (`npm run dev`)**: Vite includes a built-in Node.js API server plugin (`vite.config.js`) that processes all `/api/*` endpoints and sends real emails locally using your `.env` SMTP credentials.
- **Production (Vercel)**: When deploying to Vercel, add `SMTP_HOST`, `SMTP_PORT`, `SMTP_EMAIL`, and `SMTP_PASSWORD` under **Project Settings → Environment Variables**.
