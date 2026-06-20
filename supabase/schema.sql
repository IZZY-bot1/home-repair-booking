-- ============================================================
-- Home Repair Booking Platform — Database Schema
-- Run this in your Supabase SQL Editor
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- TABLES
-- ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS services (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name             TEXT NOT NULL,
  description      TEXT,
  duration_minutes INTEGER NOT NULL DEFAULT 60,
  price            DECIMAL(10,2) NOT NULL DEFAULT 0,
  is_active        BOOLEAN NOT NULL DEFAULT true,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS appointments (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name        TEXT NOT NULL,
  email            TEXT NOT NULL,
  phone            TEXT NOT NULL,
  service_id       UUID NOT NULL REFERENCES services(id),
  appointment_date DATE NOT NULL,
  start_time       TIME NOT NULL,
  end_time         TIME NOT NULL,
  status           TEXT NOT NULL DEFAULT 'pending'
                     CHECK (status IN ('pending','confirmed','cancelled','completed')),
  notes            TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS business_hours (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  weekday    INTEGER NOT NULL UNIQUE CHECK (weekday BETWEEN 0 AND 6),
  is_open    BOOLEAN NOT NULL DEFAULT true,
  start_time TIME NOT NULL DEFAULT '08:00:00',
  end_time   TIME NOT NULL DEFAULT '18:00:00'
);

CREATE TABLE IF NOT EXISTS blocked_dates (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blocked_date DATE NOT NULL UNIQUE,
  reason       TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS business_settings (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_name         TEXT NOT NULL DEFAULT 'FixRight Home Repair',
  business_email        TEXT,
  business_phone        TEXT,
  business_address      TEXT,
  slot_interval_minutes INTEGER NOT NULL DEFAULT 30,
  booking_notice_hours  INTEGER NOT NULL DEFAULT 24,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS admin_users (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ────────────────────────────────────────────────────────────
-- RLS
-- ────────────────────────────────────────────────────────────

ALTER TABLE services         ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments     ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_hours   ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocked_dates    ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users      ENABLE ROW LEVEL SECURITY;

-- ── services ──────────────────────────────────────────────

-- Public can read active services
CREATE POLICY "Public read active services"
  ON services FOR SELECT TO anon
  USING (is_active = true);

-- Admins can manage all services (including inactive)
CREATE POLICY "Admins manage services"
  ON services FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid()));

-- ── appointments ──────────────────────────────────────────

-- Public can insert appointments (no SELECT — confirmation from local state)
CREATE POLICY "Public insert appointments"
  ON appointments FOR INSERT TO anon
  WITH CHECK (true);

-- Admins can read and manage all appointments
CREATE POLICY "Admins manage appointments"
  ON appointments FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid()));

-- ── business_hours ────────────────────────────────────────

CREATE POLICY "Public read business hours"
  ON business_hours FOR SELECT TO anon
  USING (true);

CREATE POLICY "Admins manage business hours"
  ON business_hours FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid()));

-- ── blocked_dates ─────────────────────────────────────────

CREATE POLICY "Public read blocked dates"
  ON blocked_dates FOR SELECT TO anon
  USING (true);

CREATE POLICY "Admins manage blocked dates"
  ON blocked_dates FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid()));

-- ── business_settings ─────────────────────────────────────

CREATE POLICY "Public read business settings"
  ON business_settings FOR SELECT TO anon
  USING (true);

CREATE POLICY "Admins manage business settings"
  ON business_settings FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid()));

-- ── admin_users ───────────────────────────────────────────

CREATE POLICY "Authenticated can read admin users"
  ON admin_users FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Admins manage admin users"
  ON admin_users FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid()));

-- ────────────────────────────────────────────────────────────
-- FUNCTION: Availability check (bypasses RLS, returns only time data)
-- ────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION get_appointment_slots_for_date(p_date DATE)
RETURNS TABLE(start_time TIME, end_time TIME)
SECURITY DEFINER
LANGUAGE SQL
AS $$
  SELECT start_time, end_time
  FROM appointments
  WHERE appointment_date = p_date
    AND status NOT IN ('cancelled');
$$;

-- Allow anonymous users to call this function
GRANT EXECUTE ON FUNCTION get_appointment_slots_for_date TO anon;
GRANT EXECUTE ON FUNCTION get_appointment_slots_for_date TO authenticated;

-- ────────────────────────────────────────────────────────────
-- SEED DATA
-- ────────────────────────────────────────────────────────────

-- Default business hours (Sun closed, Mon–Fri 8am–6pm, Sat 9am–4pm)
INSERT INTO business_hours (weekday, is_open, start_time, end_time) VALUES
  (0, false, '09:00:00', '17:00:00'),
  (1, true,  '08:00:00', '18:00:00'),
  (2, true,  '08:00:00', '18:00:00'),
  (3, true,  '08:00:00', '18:00:00'),
  (4, true,  '08:00:00', '18:00:00'),
  (5, true,  '08:00:00', '18:00:00'),
  (6, true,  '09:00:00', '16:00:00')
ON CONFLICT (weekday) DO NOTHING;

-- Default business settings (only insert if table is empty)
INSERT INTO business_settings (business_name, business_email, business_phone, business_address, slot_interval_minutes, booking_notice_hours)
SELECT
  'FixRight Home Repair',
  'hello@fixright.com',
  '(555) 247-8900',
  '123 Main Street, Suite 100, Your City, ST 12345',
  30,
  24
WHERE NOT EXISTS (SELECT 1 FROM business_settings);

-- Sample services (only insert if table is empty)
INSERT INTO services (name, description, duration_minutes, price, is_active)
SELECT * FROM (VALUES
  (
    'General Handyman Visit',
    'Our skilled handymen handle a wide variety of tasks around your home — from minor fixes and adjustments to general maintenance and small repairs. Tell us what you need and we will take care of it.',
    60, 75.00::DECIMAL, true
  ),
  (
    'Plumbing Repair',
    'Professional plumbing repair services including faucet replacement, pipe repairs, drain clearing, toilet repairs, and fixture installation. All work performed by licensed and insured plumbers.',
    90, 120.00::DECIMAL, true
  ),
  (
    'Electrical Repair',
    'Safe and reliable electrical repairs handled by certified technicians. Services include light fixture installation, outlet and switch replacement, ceiling fan installation, and basic panel inspection.',
    90, 135.00::DECIMAL, true
  ),
  (
    'Drywall & Paint Repair',
    'Expert drywall patching, hole filling, texturing, and paint touch-up services. We restore your walls to their original condition with precision and care — no trace of the original damage.',
    120, 150.00::DECIMAL, true
  ),
  (
    'Furniture Assembly',
    'Professional assembly of all types of flat-pack and ready-to-assemble furniture. Fast, clean, and careful setup with all hardware properly secured and the space left tidy.',
    60, 85.00::DECIMAL, true
  ),
  (
    'Home Repair Consultation',
    'Not sure what you need? Book a consultation with our senior repair specialist. We will assess your home, identify issues, explain options, and recommend the most cost-effective solutions.',
    45, 50.00::DECIMAL, true
  )
) AS v(name, description, duration_minutes, price, is_active)
WHERE NOT EXISTS (SELECT 1 FROM services);

-- ────────────────────────────────────────────────────────────
-- HOW TO ADD AN ADMIN USER
-- ────────────────────────────────────────────────────────────
-- 1. Create a user in Supabase Auth (Authentication > Users > Add user)
-- 2. Copy the user's UUID from the Users list
-- 3. Run this query (replace the UUID with the real one):
--
-- INSERT INTO admin_users (user_id) VALUES ('PASTE-YOUR-AUTH-USER-UUID-HERE');
--
-- That user can now log in to /admin with their email and password.
