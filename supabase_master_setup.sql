-- ══════════════════════════════════════════════════════════════════════════════════
-- RUSTIC HERITAGE KITCHENWARE — COMPLETE MASTER DATABASE SETUP
-- Single Unified SQL File for Fresh Database Initialization
-- Execute this entire script in the Supabase SQL Editor.
-- ══════════════════════════════════════════════════════════════════════════════════

-- ── 1. Enable Required Extensions ───────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── 2. Safe Cleanup (Drop Existing Tables & Triggers) ───────────────────────────
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.create_newsletter_subscription(TEXT, TEXT, TEXT) CASCADE;
DROP FUNCTION IF EXISTS public.is_admin() CASCADE;
DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;

-- Drop deleted logging & temporary tables
DROP TABLE IF EXISTS public.admin_logs           CASCADE;
DROP TABLE IF EXISTS public.email_logs           CASCADE;
DROP TABLE IF EXISTS public.newsletter_mail_logs CASCADE;
DROP TABLE IF EXISTS public.cart                 CASCADE;

-- Drop core business tables for clean reset
DROP TABLE IF EXISTS public.contact_enquiries    CASCADE;
DROP TABLE IF EXISTS public.reviews              CASCADE;
DROP TABLE IF EXISTS public.coupon_usage         CASCADE;
DROP TABLE IF EXISTS public.order_items          CASCADE;
DROP TABLE IF EXISTS public.orders               CASCADE;
DROP TABLE IF EXISTS public.subscribers          CASCADE;
DROP TABLE IF EXISTS public.coupons              CASCADE;
DROP TABLE IF EXISTS public.products             CASCADE;
DROP TABLE IF EXISTS public.addresses            CASCADE;
DROP TABLE IF EXISTS public.user_profiles        CASCADE;

-- ── 3. Table Definitions ────────────────────────────────────────────────────────

-- USER PROFILES (Linked to auth.users)
CREATE TABLE public.user_profiles (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_user_id     UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name        TEXT,
  email            TEXT NOT NULL,
  phone            TEXT,
  profile_image    TEXT,
  is_admin         BOOLEAN NOT NULL DEFAULT FALSE,
  default_address  TEXT,
  default_city     TEXT,
  default_pin      TEXT,
  default_state    TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ADDRESSES
CREATE TABLE public.addresses (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  receiver_name   TEXT NOT NULL,
  phone           TEXT,
  address_line1   TEXT NOT NULL,
  address_line2   TEXT,
  city            TEXT NOT NULL,
  state           TEXT NOT NULL,
  pincode         TEXT NOT NULL,
  country         TEXT NOT NULL DEFAULT 'India',
  is_default      BOOLEAN NOT NULL DEFAULT FALSE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- PRODUCTS
CREATE TABLE public.products (
  id           SERIAL PRIMARY KEY,
  product_name TEXT NOT NULL,
  description  TEXT NOT NULL,
  category     TEXT NOT NULL,
  material     TEXT,
  image        TEXT NOT NULL,
  price        NUMERIC(10,2) NOT NULL CHECK (price >= 0),
  stock        INTEGER NOT NULL DEFAULT 100 CHECK (stock >= 0),
  featured     BOOLEAN NOT NULL DEFAULT FALSE,
  active       BOOLEAN NOT NULL DEFAULT TRUE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- COUPONS
CREATE TABLE public.coupons (
  id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code                 TEXT UNIQUE NOT NULL,
  discount_type        TEXT NOT NULL DEFAULT 'percentage' CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value       NUMERIC(10,2) NOT NULL CHECK (discount_value > 0),
  minimum_order        NUMERIC(10,2) DEFAULT 0,
  maximum_discount     NUMERIC(10,2),
  usage_limit          INTEGER, -- NULL means Unlimited
  used_count           INTEGER NOT NULL DEFAULT 0,
  active               BOOLEAN NOT NULL DEFAULT TRUE,
  free_delivery        BOOLEAN NOT NULL DEFAULT FALSE,
  expiry_date          TIMESTAMPTZ, -- NULL means No Expiry
  generated_by_system  BOOLEAN NOT NULL DEFAULT FALSE,
  subscriber_email     TEXT,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- SUBSCRIBERS
CREATE TABLE public.subscribers (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email         TEXT UNIQUE NOT NULL,
  name          TEXT,
  coupon_id     UUID REFERENCES public.coupons(id) ON DELETE SET NULL,
  coupon_code   TEXT,
  email_sent    BOOLEAN NOT NULL DEFAULT FALSE,
  active        BOOLEAN NOT NULL DEFAULT TRUE,
  subscribed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ORDERS
CREATE TABLE public.orders (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number     TEXT UNIQUE NOT NULL,
  user_id          UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
  customer_name    TEXT NOT NULL,
  customer_email   TEXT NOT NULL,
  customer_phone   TEXT NOT NULL,
  delivery_address TEXT NOT NULL,
  city             TEXT NOT NULL,
  pincode          TEXT NOT NULL,
  state            TEXT NOT NULL DEFAULT 'Tamil Nadu',
  subtotal         NUMERIC(10,2) NOT NULL,
  discount_amount  NUMERIC(10,2) NOT NULL DEFAULT 0,
  shipping_fee     NUMERIC(10,2) NOT NULL DEFAULT 0,
  delivery_fee     NUMERIC(10,2) NOT NULL DEFAULT 0,
  total_amount     NUMERIC(10,2) NOT NULL,
  payment_method   TEXT NOT NULL CHECK (payment_method IN ('cod', 'online', 'razorpay', 'upi', 'card')),
  payment_status   TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  order_status     TEXT NOT NULL DEFAULT 'pending' CHECK (order_status IN ('pending', 'confirmed', 'delivered', 'cancelled')),
  razorpay_order_id TEXT,
  razorpay_payment_id TEXT,
  coupon_id        UUID REFERENCES public.coupons(id) ON DELETE SET NULL,
  coupon_code      TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ORDER ITEMS
CREATE TABLE public.order_items (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id    UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id  INTEGER REFERENCES public.products(id) ON DELETE SET NULL,
  title       TEXT NOT NULL,
  price       NUMERIC(10,2) NOT NULL,
  quantity    INTEGER NOT NULL CHECK (quantity > 0),
  total_price NUMERIC(10,2) NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- COUPON USAGE
CREATE TABLE public.coupon_usage (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  coupon_id   UUID NOT NULL REFERENCES public.coupons(id) ON DELETE CASCADE,
  coupon_code TEXT,
  user_id     UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
  user_name   TEXT,
  order_id    UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  used_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- CUSTOMER REVIEWS
CREATE TABLE public.reviews (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id          UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
  product_id       INTEGER REFERENCES public.products(id) ON DELETE SET NULL,
  customer_name    TEXT NOT NULL,
  customer_email   TEXT,
  location         TEXT,
  product_name     TEXT,
  rating           INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text      TEXT NOT NULL,
  status           TEXT NOT NULL DEFAULT 'approved' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- CONTACT ENQUIRIES / GET IN TOUCH
CREATE TABLE public.contact_enquiries (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name             TEXT NOT NULL,
  email            TEXT NOT NULL,
  phone            TEXT,
  subject          TEXT,
  product_interest TEXT,
  message          TEXT NOT NULL,
  status           TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'read', 'replied', 'closed')),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 4. Functions & Triggers ──────────────────────────────────────────────────────

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_user_profiles_updated_at BEFORE UPDATE ON public.user_profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_addresses_updated_at     BEFORE UPDATE ON public.addresses     FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_products_updated_at      BEFORE UPDATE ON public.products      FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_coupons_updated_at       BEFORE UPDATE ON public.coupons       FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_subscribers_updated_at   BEFORE UPDATE ON public.subscribers   FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_orders_updated_at        BEFORE UPDATE ON public.orders        FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_reviews_updated_at       BEFORE UPDATE ON public.reviews       FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_enquiries_updated_at     BEFORE UPDATE ON public.contact_enquiries FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Helper function: Is current authenticated user an admin?
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE auth_user_id = auth.uid() AND is_admin = TRUE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: Automatically create user_profile when user registers in auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_is_admin BOOLEAN := FALSE;
BEGIN
  IF LOWER(NEW.email) = 'mathubharathi15@gmail.com' THEN
    v_is_admin := TRUE;
  END IF;

  INSERT INTO public.user_profiles (auth_user_id, full_name, email, is_admin)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', SPLIT_PART(NEW.email, '@', 1)),
    NEW.email,
    v_is_admin
  )
  ON CONFLICT (auth_user_id) DO UPDATE
  SET full_name = EXCLUDED.full_name,
      email     = EXCLUDED.email,
      is_admin  = CASE WHEN EXCLUDED.is_admin THEN TRUE ELSE user_profiles.is_admin END;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- RPC Function: Create Newsletter Subscription & 30-Day Single-Use Coupon
CREATE OR REPLACE FUNCTION public.create_newsletter_subscription(
  p_email TEXT,
  p_name TEXT DEFAULT NULL,
  p_coupon_code TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  v_existing_id UUID;
  v_existing_code TEXT;
  v_coupon_id UUID;
  v_subscriber_id UUID;
  v_code_to_use TEXT;
  v_now TIMESTAMPTZ := NOW();
  v_expiry TIMESTAMPTZ := NOW() + INTERVAL '30 days';
BEGIN
  SELECT id, coupon_code INTO v_existing_id, v_existing_code
  FROM public.subscribers
  WHERE email = LOWER(p_email);

  IF v_existing_id IS NOT NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'duplicate', true,
      'subscriber_id', v_existing_id,
      'coupon_code', v_existing_code,
      'message', 'You are already subscribed.'
    );
  END IF;

  v_code_to_use := COALESCE(p_coupon_code, 'WELCOME-' || UPPER(SUBSTRING(MD5(RANDOM()::TEXT || CLOCK_TIMESTAMP()::TEXT) FROM 1 FOR 7)));

  INSERT INTO public.coupons (
    code, discount_type, discount_value, minimum_order, maximum_discount,
    usage_limit, used_count, active, free_delivery, expiry_date,
    generated_by_system, subscriber_email, created_at, updated_at
  ) VALUES (
    v_code_to_use, 'percentage', 15, 299, 200,
    1, 0, TRUE, FALSE, v_expiry,
    TRUE, LOWER(p_email), v_now, v_now
  )
  RETURNING id INTO v_coupon_id;

  INSERT INTO public.subscribers (
    email, name, coupon_id, coupon_code, email_sent, active, subscribed_at, created_at, updated_at
  ) VALUES (
    LOWER(p_email), p_name, v_coupon_id, v_code_to_use, FALSE, TRUE, v_now, v_now, v_now
  )
  RETURNING id INTO v_subscriber_id;

  RETURN jsonb_build_object(
    'success', true,
    'duplicate', false,
    'subscriber_id', v_subscriber_id,
    'coupon_id', v_coupon_id,
    'coupon_code', v_code_to_use,
    'message', 'Subscription successful!'
  );
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object(
    'success', false,
    'error', SQLERRM
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ── 5. Row Level Security (RLS) & Policies ──────────────────────────────────────

ALTER TABLE public.user_profiles        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addresses            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscribers          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupon_usage         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_enquiries    ENABLE ROW LEVEL SECURITY;

-- User Profiles
CREATE POLICY "Users read own profile" ON public.user_profiles FOR SELECT USING (auth_user_id = auth.uid() OR public.is_admin());
CREATE POLICY "Users update own profile" ON public.user_profiles FOR UPDATE USING (auth_user_id = auth.uid() OR public.is_admin());
CREATE POLICY "Anyone insert profile" ON public.user_profiles FOR INSERT WITH CHECK (TRUE);

-- Addresses
CREATE POLICY "Users manage own addresses" ON public.addresses FOR ALL USING (user_id IN (SELECT id FROM public.user_profiles WHERE auth_user_id = auth.uid()) OR public.is_admin());

-- Products
CREATE POLICY "Anyone read products" ON public.products FOR SELECT USING (TRUE);
CREATE POLICY "Admin manage products" ON public.products FOR ALL USING (public.is_admin());

-- Coupons
CREATE POLICY "Anyone read active coupons" ON public.coupons FOR SELECT USING (active = TRUE OR public.is_admin());
CREATE POLICY "Anyone insert coupons" ON public.coupons FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "Admin manage coupons" ON public.coupons FOR ALL USING (public.is_admin());

-- Subscribers
CREATE POLICY "Anyone subscribe" ON public.subscribers FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "Anyone read subscribers" ON public.subscribers FOR SELECT USING (TRUE);
CREATE POLICY "Admin manage subscribers" ON public.subscribers FOR ALL USING (public.is_admin());

-- Orders & Order Items
CREATE POLICY "Anyone read orders" ON public.orders FOR SELECT USING (TRUE);
CREATE POLICY "Anyone insert orders" ON public.orders FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "Admin manage orders" ON public.orders FOR ALL USING (public.is_admin());

CREATE POLICY "Anyone read order items" ON public.order_items FOR SELECT USING (TRUE);
CREATE POLICY "Anyone insert order items" ON public.order_items FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "Admin manage order items" ON public.order_items FOR ALL USING (public.is_admin());

-- Coupon Usage
CREATE POLICY "Anyone insert coupon usage" ON public.coupon_usage FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "Admin manage coupon usage" ON public.coupon_usage FOR ALL USING (public.is_admin());

-- Reviews
CREATE POLICY "Public read approved reviews" ON public.reviews FOR SELECT USING (status = 'approved' OR public.is_admin());
CREATE POLICY "Anyone submit review" ON public.reviews FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "Admin manage reviews" ON public.reviews FOR ALL USING (public.is_admin());

-- Enquiries
CREATE POLICY "Anyone submit enquiry" ON public.contact_enquiries FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "Admin manage enquiries" ON public.contact_enquiries FOR ALL USING (public.is_admin());

-- ── 6. Seed Product Data ────────────────────────────────────────────────────────

INSERT INTO public.products (id, product_name, description, category, material, image, price, stock, featured, active) VALUES
(1,  'Stone Mortar & Pestle',               'Perfect for grinding spices, herbs and pastes. The rough granite surface ensures fine grinding with minimal effort.',                               'Stone & Iron',      'Natural Granite Stone',                'images/img1.png',  599,  100, FALSE, TRUE),
(2,  'Wooden Ladle Set (in Ceramic Holder)','Set of 5 handcrafted ladles in assorted sizes, presented in a hand-painted ceramic holder.',                                                    'Wood',              'Sheesham Wood + Ceramic Holder',       'images/img2.png',  449,  100, FALSE, TRUE),
(3,  'Traditional Grinding Stone',          'The classic ammikallu used for grinding idli/dosa batter, chutneys, and masalas. Gives authentic flavour unmatched by mixers.',               'Stone & Iron',      'Black Basalt Stone',                   'images/img3.png',  1299, 100, FALSE, TRUE),
(4,  'Clay Cooking Pot with Lid',           'Slow-cooks dal, biryanis, and curries with earthy flavour. The porous clay naturally regulates moisture and heat.',                           'Clay & Terracotta', 'Natural Unglazed Red Clay',            'images/img4.png',  649,  100, FALSE, TRUE),
(5,  'Cast Iron Tawa (Large Flat Griddle)', 'Ideal for making dosas, rotis, parathas, and uttapam. Distributes heat evenly for perfect cooking every time.',                               'Stone & Iron',      'Pre-Seasoned Cast Iron',               'images/img5.png',  999,  100, FALSE, TRUE),
(6,  'Brass Bowl Set with Spoons & Tray',   'Traditional puja and dining set with 4 bowls, 4 spoons and 1 serving tray. Antimicrobial and food-safe.',                                    'Brass & Copper',    'Pure Brass (85% Copper, 15% Zinc)',    'images/img6.png',  1499, 100, FALSE, TRUE),
(7,  'Teak Wood Ladle Set (7-piece)',        '7-piece set including spatulas, ladles, and a stirrer. Naturally anti-bacterial, heat-resistant, and chemical-free.',                        'Wood',              'Aged Teak Wood',                       'images/img7.png',  749,  100, TRUE,  TRUE),
(8,  'Granite Cookware Set',                'Two-piece granite pot set (kalchatti) perfect for simmering rasam, sambar, and milk. Naturally non-stick surface.',                          'Stone & Iron',      'Natural Kalchatti Granite',            'images/img8.png',  1399, 100, TRUE,  TRUE),
(9,  'Copper Pan Set',                      'Two copper pans with tin-lined interior. Excellent heat conductor — cooks 3× faster than steel. Enhances food quality.',                     'Brass & Copper',    '99% Pure Copper',                      'images/img9.png',  1299, 100, FALSE, TRUE),
(10, 'Banana Leaf Plates',                  'Authentic banana leaf plates for traditional South Indian feasts. Food tastes better on banana leaf — a proven fact!',                        'Other',             'Dried Banana Leaf (Natural)',          'images/img10.png', 299,  100, FALSE, TRUE),
(11, 'Ceramic Spice Jar Set (3-piece)',     '3 ceramic jars with hand-painted floral motifs, cork lids and wooden spoons. Perfect for storing salt, turmeric, and chilli.',              'Clay & Terracotta', 'Hand-Painted Ceramic',                 'images/img11.png', 849,  100, FALSE, TRUE),
(12, 'Brass Uruli + Ladle Set',             'Traditional Kerala uruli for preparing payasam, halwa and temple offerings. Comes with a long brass ladle.',                                 'Brass & Copper',    'Pure Brass',                           'images/img12.png', 1199, 100, FALSE, TRUE),
(13, 'Brass Water Jug & Tumbler Set',       'Store water in brass overnight and drink in the morning — Ayurveda recommends it for gut health and immunity.',                               'Brass & Copper',    'Pure Brass',                           'images/img13.png', 1099, 100, FALSE, TRUE),
(14, 'Clay Water Jug (with Lid & Handle)',  'Keeps water naturally cool without electricity. The clay minerals subtly enrich the water taste and alkalinity.',                             'Clay & Terracotta', 'Natural Terracotta Clay',              'images/img14.png', 399,  100, FALSE, TRUE),
(15, 'Terracotta Water Bottles (Painted)',  'Pair of hand-painted terracotta bottles with cork stoppers. Keeps water cool for 4–6 hours naturally.',                                      'Clay & Terracotta', 'Hand-Painted Terracotta',              'images/img15.png', 549,  100, TRUE,  TRUE);

-- ── 7. Performance Indexes ──────────────────────────────────────────────────────

CREATE INDEX idx_user_profiles_auth_user_id ON public.user_profiles(auth_user_id);
CREATE INDEX idx_user_profiles_email        ON public.user_profiles(email);
CREATE INDEX idx_orders_customer_email      ON public.orders(customer_email);
CREATE INDEX idx_orders_user_id             ON public.orders(user_id);
CREATE INDEX idx_orders_order_status        ON public.orders(order_status);
CREATE INDEX idx_orders_created_at          ON public.orders(created_at DESC);
CREATE INDEX idx_order_items_order_id       ON public.order_items(order_id);
CREATE INDEX idx_coupon_usage_coupon_id     ON public.coupon_usage(coupon_id);
CREATE INDEX idx_coupons_code               ON public.coupons(code);
CREATE INDEX idx_subscribers_email          ON public.subscribers(email);
CREATE INDEX idx_reviews_status             ON public.reviews(status);
CREATE INDEX idx_contact_enquiries_status   ON public.contact_enquiries(status);

-- ── 8. Permissions & Grants ─────────────────────────────────────────────────────

GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.create_newsletter_subscription TO anon, authenticated, service_role;

-- ── 9. Completion Notice ────────────────────────────────────────────────────────
DO $$
BEGIN
  RAISE NOTICE '====================================================================';
  RAISE NOTICE '✅ RUSTIC HERITAGE CLEAN MASTER DATABASE SETUP COMPLETED!';
  RAISE NOTICE '====================================================================';
  RAISE NOTICE 'Clean 10 tables created without log tables.';
END $$;
