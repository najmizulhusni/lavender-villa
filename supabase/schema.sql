-- =============================================
-- LAVENDER VILLA MELAKA - DATABASE SCHEMA
-- Run this in Supabase SQL Editor
-- =============================================

-- 1. PROPERTIES TABLE (Villa/Homestay)
CREATE TABLE IF NOT EXISTS properties (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  address TEXT,
  weekday_price_2h1m DECIMAL(10,2) DEFAULT 1300.00,
  weekday_price_3h2m DECIMAL(10,2) DEFAULT 2400.00,
  weekend_price_2h1m DECIMAL(10,2) DEFAULT 1590.00,
  weekend_price_3h2m DECIMAL(10,2) DEFAULT 2990.00,
  festive_price_2h1m DECIMAL(10,2) DEFAULT 1700.00,
  festive_price_3h2m DECIMAL(10,2) DEFAULT 3200.00,
  max_guests INTEGER DEFAULT 20,
  comfortable_guests INTEGER DEFAULT 15,
  bedrooms INTEGER DEFAULT 5,
  bathrooms INTEGER DEFAULT 4,
  whatsapp_number VARCHAR(20),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. BOOKINGS TABLE
CREATE TABLE IF NOT EXISTS bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_code VARCHAR(20) UNIQUE NOT NULL,
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  customer_name VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(20) NOT NULL,
  customer_email VARCHAR(255),
  check_in DATE NOT NULL,
  check_out DATE NOT NULL,
  nights INTEGER NOT NULL,
  guests INTEGER NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  deposit_amount DECIMAL(10,2) DEFAULT 0,
  balance_amount DECIMAL(10,2),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'paid', 'cancelled', 'completed')),
  payment_method VARCHAR(50),
  special_requests TEXT,
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. BLOCKED DATES TABLE (Manual blocks by admin)
CREATE TABLE IF NOT EXISTS blocked_dates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  blocked_date DATE NOT NULL,
  reason VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(property_id, blocked_date)
);

-- 4. PUBLIC HOLIDAYS TABLE
CREATE TABLE IF NOT EXISTS public_holidays (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  holiday_date DATE NOT NULL,
  name VARCHAR(255) NOT NULL,
  year INTEGER NOT NULL,
  is_national BOOLEAN DEFAULT true,
  states TEXT[], -- Array of states that observe this holiday
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(holiday_date)
);

-- 5. ADMIN USERS TABLE
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  display_name VARCHAR(100),
  role VARCHAR(20) DEFAULT 'admin' CHECK (role IN ('admin', 'superadmin')),
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. WHATSAPP TEMPLATES TABLE
CREATE TABLE IF NOT EXISTS whatsapp_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  template_key VARCHAR(50) UNIQUE NOT NULL,
  message_template TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. ACTIVITY LOGS TABLE
CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id UUID REFERENCES admin_users(id),
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50),
  entity_id UUID,
  details JSONB,
  ip_address VARCHAR(45),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- INDEXES FOR BETTER PERFORMANCE
-- =============================================
CREATE INDEX IF NOT EXISTS idx_bookings_property ON bookings(property_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_checkin ON bookings(check_in);
CREATE INDEX IF NOT EXISTS idx_bookings_checkout ON bookings(check_out);
CREATE INDEX IF NOT EXISTS idx_blocked_dates_property ON blocked_dates(property_id);
CREATE INDEX IF NOT EXISTS idx_blocked_dates_date ON blocked_dates(blocked_date);
CREATE INDEX IF NOT EXISTS idx_holidays_date ON public_holidays(holiday_date);
CREATE INDEX IF NOT EXISTS idx_holidays_year ON public_holidays(year);

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocked_dates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public_holidays ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- Public read access for properties
CREATE POLICY "Public can view active properties" ON properties
  FOR SELECT USING (is_active = true);

-- Public can create bookings
CREATE POLICY "Public can create bookings" ON bookings
  FOR INSERT WITH CHECK (true);

-- Public can view their own bookings by booking code
CREATE POLICY "Public can view bookings" ON bookings
  FOR SELECT USING (true);

-- Public can view blocked dates
CREATE POLICY "Public can view blocked dates" ON blocked_dates
  FOR SELECT USING (true);

-- Public can view public holidays
CREATE POLICY "Public can view holidays" ON public_holidays
  FOR SELECT USING (true);

-- =============================================
-- FUNCTIONS
-- =============================================

-- Function to generate booking code
CREATE OR REPLACE FUNCTION generate_booking_code()
RETURNS TEXT AS $$
DECLARE
  code TEXT;
BEGIN
  code := 'LV' || TO_CHAR(NOW(), 'YYMMDD') || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
  RETURN code;
END;
$$ LANGUAGE plpgsql;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_properties_updated_at
  BEFORE UPDATE ON properties
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_bookings_updated_at
  BEFORE UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_admin_users_updated_at
  BEFORE UPDATE ON admin_users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_whatsapp_templates_updated_at
  BEFORE UPDATE ON whatsapp_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Function to get booked dates for a property
CREATE OR REPLACE FUNCTION get_booked_dates(prop_id UUID, start_date DATE, end_date DATE)
RETURNS TABLE(booked_date DATE) AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT d::DATE as booked_date
  FROM bookings b,
       generate_series(b.check_in, b.check_out - INTERVAL '1 day', '1 day') d
  WHERE b.property_id = prop_id
    AND b.status IN ('confirmed', 'paid')
    AND b.check_in <= end_date
    AND b.check_out >= start_date
  UNION
  SELECT blocked_date
  FROM blocked_dates
  WHERE property_id = prop_id
    AND blocked_date BETWEEN start_date AND end_date
  ORDER BY booked_date;
END;
$$ LANGUAGE plpgsql;
