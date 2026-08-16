# 📖 Rustic Heritage Kitchenware — Complete Setup & Operating Guide

This guide provides step-by-step instructions to set up your Supabase database from scratch, configure admin access, set up environment variables, and run or deploy the application.

---

## 🚀 Step 1: Initialize Database in Supabase

1. Open your [Supabase Dashboard](https://supabase.com/dashboard).
2. Go to your project: **Rustic Heritage**.
3. In the left navigation, click on **SQL Editor** (`>_`).
4. Click **New Query** (+).
5. Open the file **`supabase_master_setup.sql`** from your project folder.
6. Copy the entire contents of `supabase_master_setup.sql` and paste it into the SQL Editor.
7. Click **Run** (►).

> ✅ **Result**: This will safely drop any old broken schema and create all 10 clean business tables (`user_profiles`, `addresses`, `products`, `coupons`, `subscribers`, `orders`, `order_items`, `coupon_usage`, `reviews`, `contact_enquiries`), triggers, RLS policies, and seed all 15 authentic kitchenware products.

---

## 🔐 Step 2: Set Up Admin Account Access

1. In Supabase Dashboard, go to **Authentication** -> **Users**.
2. Click **Add User** -> **Create User**.
   - **Email**: `mathubharathi15@gmail.com`
   - **Password**: *(Set a strong password for your admin login)*
3. Click **Create User**.
4. Go back to **SQL Editor** in Supabase and run this quick query to elevate the account to Admin status:

```sql
UPDATE public.user_profiles 
SET is_admin = TRUE 
WHERE email = 'mathubharathi15@gmail.com';
```

> ✅ **Result**: Your admin user is now ready. You can log into `admin.html` with `mathubharathi15@gmail.com` and your password.

---

## ⚙️ Step 3: Environment Variables Setup (`.env`)

For deployment on Vercel or local backend running, configure your `.env` file with **ONLY** the following 9 variables:

```env
SUPABASE_URL=https://tlhhxpttifgtgnrzjrga.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRsaGh4cHR0aWZndGducnpqcmdhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMyOTQ2MDUsImV4cCI6MjA5ODg3MDYwNX0.ZYB12Ekl1EImXRdxvyGNEvXLxnNOe-36oxvo3z4gSI0
SUPABASE_SERVICE_ROLE_KEY=YOUR_SUPABASE_SERVICE_ROLE_KEY_HERE

SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_EMAIL=mathubharathi15@gmail.com
SMTP_PASSWORD=YOUR_GMAIL_APP_PASSWORD_HERE

RAZORPAY_KEY_ID=YOUR_RAZORPAY_KEY_ID_HERE
RAZORPAY_KEY_SECRET=YOUR_RAZORPAY_KEY_SECRET_HERE
```

*Note: Business contact details (Email: `mathubharathi15@gmail.com`, Phone: `8072505342`, Location: `Coimbatore, Tamil Nadu, India`) are built directly into public code files as mandated.*

---

## 🌐 Step 4: Deploying & Running the Website

### Option A: Hosting on Vercel
1. Connect your GitHub repository to [Vercel](https://vercel.com).
2. Set the 9 Environment Variables in Vercel Project Settings -> **Environment Variables**.
3. Deploy! Vercel will automatically serve static frontend files and the serverless endpoints in `/api`.

### Option B: Local Testing
- Open `index.html`, `products.html`, `contact.html`, `reviews.html`, `profile.html`, or `admin.html` directly in your browser or with VS Code Live Server / Python HTTP Server (`python server.py`).

---

## ✅ Step 5: Feature Verification Checklist

1. **Newsletter Subscription (`index.html`)**:
   - Enter an email and click **Subscribe →**.
   - Check that coupon code `WELCOME-XXXXXXX` is generated and displayed.
   - Verify subscriber appears in Supabase `subscribers` table and Admin Newsletter section.

2. **Address Management (`profile.html`)**:
   - Log in as a customer on `profile.html`.
   - Fill in Default Delivery Address fields and click **Save Address**.
   - Refresh page to verify address persists seamlessly.

3. **Get in Touch / Enquiries (`getintouch.html`)**:
   - Fill out the form and click **Send Message 📩**.
   - Verify record appears in Supabase `contact_enquiries` table.
   - Open `admin.html`, go to **Get in Touch / Enquiries** tab to view the enquiry detail drawer.

4. **Customer Reviews (`contact.html` & `reviews.html`)**:
   - Submit a review on `contact.html`.
   - Verify it is saved in `reviews` table in Supabase.
   - Open `reviews.html` to see the review rendered dynamically on the live site!

5. **Mellow-Style Admin Dashboard (`admin.html`)**:
   - Log into `admin.html` with `mathubharathi15@gmail.com`.
   - Verify top header contains **`🏪 Store ↗`** button (redirecting to live store).
   - Check real-time KPI metrics, Order Management, Customer Reviews, Enquiries, and Discount Codes.
