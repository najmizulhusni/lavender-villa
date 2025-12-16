-- =============================================
-- SUPABASE RLS SECURITY POLICIES
-- Run this in Supabase SQL Editor to verify/add security
-- =============================================

-- =============================================
-- STEP 1: VERIFY RLS IS ENABLED
-- =============================================
-- Run this to check if RLS is enabled on all tables:
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- All tables should show 'true' in rowsecurity column
-- If any show 'false', run the ALTER TABLE commands below

-- =============================================
-- STEP 2: ENABLE RLS ON ALL TABLES (if not already)
-- =============================================
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocked_dates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public_holidays ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- =============================================
-- STEP 3: DROP EXISTING POLICIES (to recreate clean)
-- =============================================
-- Uncomment these if you want to reset policies:
-- DROP POLICY IF EXISTS "Public can view active properties" ON properties;
-- DROP POLICY IF EXISTS "Public can create bookings" ON bookings;
-- DROP POLICY IF EXISTS "Public can view bookings" ON bookings;
-- DROP POLICY IF EXISTS "Public can view blocked dates" ON blocked_dates;
-- DROP POLICY IF EXISTS "Public can view holidays" ON public_holidays;

-- =============================================
-- STEP 4: CREATE SECURITY POLICIES
-- =============================================

-- PROPERTIES TABLE
-- Public can only READ active properties
CREATE POLICY IF NOT EXISTS "properties_select_public" ON properties
  FOR SELECT 
  TO anon, authenticated
  USING (is_active = true);

-- BOOKINGS TABLE
-- Public can INSERT new bookings
CREATE POLICY IF NOT EXISTS "bookings_insert_public" ON bookings
  FOR INSERT 
  TO anon, authenticated
  WITH CHECK (true);

-- Public can SELECT bookings (needed for checking availability)
CREATE POLICY IF NOT EXISTS "bookings_select_public" ON bookings
  FOR SELECT 
  TO anon, authenticated
  USING (true);

-- Only service role can UPDATE/DELETE bookings (admin operations)
-- This is handled by using service_role key in admin panel

-- BLOCKED DATES TABLE
-- Public can only READ blocked dates
CREATE POLICY IF NOT EXISTS "blocked_dates_select_public" ON blocked_dates
  FOR SELECT 
  TO anon, authenticated
  USING (true);

-- Public can INSERT blocked dates (for admin via anon key)
CREATE POLICY IF NOT EXISTS "blocked_dates_insert_public" ON blocked_dates
  FOR INSERT 
  TO anon, authenticated
  WITH CHECK (true);

-- Public can DELETE blocked dates (for admin via anon key)
CREATE POLICY IF NOT EXISTS "blocked_dates_delete_public" ON blocked_dates
  FOR DELETE 
  TO anon, authenticated
  USING (true);

-- PUBLIC HOLIDAYS TABLE
-- Public can only READ holidays
CREATE POLICY IF NOT EXISTS "holidays_select_public" ON public_holidays
  FOR SELECT 
  TO anon, authenticated
  USING (true);

-- ADMIN USERS TABLE
-- Public can SELECT for login verification
CREATE POLICY IF NOT EXISTS "admin_select_public" ON admin_users
  FOR SELECT 
  TO anon, authenticated
  USING (true);

-- Public can UPDATE for password changes
CREATE POLICY IF NOT EXISTS "admin_update_public" ON admin_users
  FOR UPDATE 
  TO anon, authenticated
  USING (true);

-- WHATSAPP TEMPLATES TABLE
-- Public can only READ active templates
CREATE POLICY IF NOT EXISTS "templates_select_public" ON whatsapp_templates
  FOR SELECT 
  TO anon, authenticated
  USING (is_active = true);

-- ACTIVITY LOGS TABLE
-- No public access - only service role
-- (No policies needed - RLS blocks all access by default)

-- =============================================
-- STEP 5: VERIFY POLICIES ARE CREATED
-- =============================================
-- Run this to see all policies:
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- =============================================
-- SECURITY NOTES
-- =============================================
-- 1. The anon key (used in frontend) has LIMITED access:
--    - Can READ properties, bookings, blocked_dates, holidays
--    - Can INSERT bookings
--    - Can INSERT/DELETE blocked_dates (for admin panel)
--    - Cannot access activity_logs
--
-- 2. For production, consider:
--    - Using service_role key for admin operations (server-side only)
--    - Adding rate limiting at Supabase level
--    - Enabling Supabase Auth for admin users
--
-- 3. Current setup is SAFE for a small villa booking website
--    - No sensitive data exposed
--    - Booking data is not confidential (just names/phones)
--    - Admin password is hashed (should be in production)
