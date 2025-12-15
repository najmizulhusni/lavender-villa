-- =============================================
-- LAVENDER VILLA MELAKA - SEED DATA
-- Run this after schema.sql
-- =============================================

-- 1. INSERT LAVENDER VILLA PROPERTY
INSERT INTO properties (name, slug, description, address, weekday_price_2h1m, weekday_price_3h2m, weekend_price_2h1m, weekend_price_3h2m, festive_price_2h1m, festive_price_3h2m, max_guests, comfortable_guests, bedrooms, bathrooms, whatsapp_number)
VALUES (
  'Lavender Villa Melaka',
  'lavender',
  'Villa mewah di Bemban, Melaka. 5 bilik tidur, 4 bilik air. Selesa untuk 15 orang, maksimum 20 orang. Dilengkapi kolam renang, BBQ, karaoke, dan kemudahan premium.',
  'Bemban, Melaka',
  1300.00,  -- weekday 2H1M
  2400.00,  -- weekday 3H2M
  1590.00,  -- weekend/PH 2H1M
  2990.00,  -- weekend/PH 3H2M
  1700.00,  -- festive 2H1M
  3200.00,  -- festive 3H2M
  20,       -- max guests
  15,       -- comfortable guests
  5,        -- bedrooms
  4,        -- bathrooms
  '60193345686'
) ON CONFLICT (slug) DO NOTHING;

-- 2. INSERT DEFAULT ADMIN USER
-- Password: lavendervilla2025 (you should hash this properly in production)
INSERT INTO admin_users (username, password_hash, display_name, role)
VALUES (
  'admin',
  'lavendervilla2025', -- In production, use proper bcrypt hash
  'Admin',
  'superadmin'
) ON CONFLICT (username) DO NOTHING;

-- 3. INSERT WHATSAPP TEMPLATES
INSERT INTO whatsapp_templates (name, template_key, message_template) VALUES
('Pengesahan Tempahan', 'booking_confirmation', 
'*LAVENDER VILLA MELAKA*

Terima kasih atas tempahan anda!

*Kod Tempahan:* {{booking_code}}
*Nama:* {{customer_name}}
*Daftar Masuk:* {{check_in}}
*Daftar Keluar:* {{check_out}}
*Tetamu:* {{guests}} orang
*Jumlah:* RM {{total}}

Sila buat bayaran deposit RM 500 untuk mengesahkan tempahan.

Bank: Maybank
Akaun: 1234567890
Nama: Lavender Villa

Terima kasih!'),

('Peringatan Check-in', 'checkin_reminder',
'*LAVENDER VILLA MELAKA - PERINGATAN CHECK-IN*

Assalamualaikum {{customer_name}},

Tempahan anda untuk esok:
📅 *Check-in:* {{check_in}} (3:00 PM)
📅 *Check-out:* {{check_out}} (12:00 PM)

*MAKLUMAT PENTING:*
📍 Alamat: Bemban, Melaka
🔑 Kod Pintu: Akan dihantar pada hari check-in
📞 Hubungi: 019-334 5686

Selamat datang!'),

('Peringatan Check-out', 'checkout_reminder',
'*LAVENDER VILLA MELAKA - PERINGATAN CHECK-OUT*

Assalamualaikum {{customer_name}},

Terima kasih kerana menginap di Lavender Villa!

*SENARAI SEMAK SEBELUM KELUAR:*
✅ Pastikan semua pintu & tingkap dikunci
✅ Tutup semua lampu & penghawa dingin
✅ Buang sampah di tong sampah luar
✅ Pastikan dapur dalam keadaan bersih
✅ Periksa barang peribadi anda
✅ Letakkan kunci di tempat yang ditetapkan

*Check-out:* {{check_out}} (12:00 PM)

Terima kasih & jumpa lagi! 🏡'),

('Pembatalan Tempahan', 'booking_cancellation',
'*LAVENDER VILLA MELAKA*

Tempahan anda telah dibatalkan.

*Kod Tempahan:* {{booking_code}}
*Nama:* {{customer_name}}

Jika ini adalah kesilapan, sila hubungi kami segera.

Terima kasih.')
ON CONFLICT (template_key) DO NOTHING;

-- 4. INSERT 2025-2026 PUBLIC HOLIDAYS (National + Melaka)
INSERT INTO public_holidays (holiday_date, name, year, is_national, states) VALUES
-- 2025 Holidays
('2025-01-01', 'Tahun Baru', 2025, true, ARRAY['National']),
('2025-01-29', 'Tahun Baru Cina', 2025, true, ARRAY['National']),
('2025-01-30', 'Tahun Baru Cina (Hari 2)', 2025, true, ARRAY['National']),
('2025-02-01', 'Hari Wilayah Persekutuan', 2025, false, ARRAY['Kuala Lumpur', 'Labuan', 'Putrajaya']),
('2025-03-31', 'Hari Raya Aidilfitri', 2025, true, ARRAY['National']),
('2025-04-01', 'Hari Raya Aidilfitri (Hari 2)', 2025, true, ARRAY['National']),
('2025-05-01', 'Hari Pekerja', 2025, true, ARRAY['National']),
('2025-05-12', 'Hari Wesak', 2025, true, ARRAY['National']),
('2025-06-02', 'Hari Keputeraan YDP Agong', 2025, true, ARRAY['National']),
('2025-06-07', 'Hari Raya Aidiladha', 2025, true, ARRAY['National']),
('2025-06-27', 'Awal Muharram', 2025, true, ARRAY['National']),
('2025-08-31', 'Hari Merdeka', 2025, true, ARRAY['National']),
('2025-09-05', 'Maulidur Rasul', 2025, true, ARRAY['National']),
('2025-09-16', 'Hari Malaysia', 2025, true, ARRAY['National']),
('2025-10-15', 'Hari Jadi Yang di-Pertua Negeri Melaka', 2025, false, ARRAY['Melaka']),
('2025-10-20', 'Deepavali', 2025, true, ARRAY['National']),
('2025-12-25', 'Hari Krismas', 2025, true, ARRAY['National']),

-- 2026 Holidays
('2026-01-01', 'Tahun Baru', 2026, true, ARRAY['National']),
('2026-02-17', 'Tahun Baru Cina', 2026, true, ARRAY['National']),
('2026-02-18', 'Tahun Baru Cina (Hari 2)', 2026, true, ARRAY['National']),
('2026-02-20', 'Hari Pengisytiharan Kemerdekaan', 2026, false, ARRAY['Melaka']),
('2026-03-21', 'Hari Raya Aidilfitri', 2026, true, ARRAY['National']),
('2026-03-22', 'Hari Raya Aidilfitri (Hari 2)', 2026, true, ARRAY['National']),
('2026-03-23', 'Hari Raya Aidilfitri (Cuti)', 2026, true, ARRAY['National']),
('2026-03-24', 'Hari Raya Aidilfitri (Cuti Melaka)', 2026, false, ARRAY['Melaka']),
('2026-05-01', 'Hari Pekerja', 2026, true, ARRAY['National']),
('2026-05-27', 'Hari Raya Haji', 2026, true, ARRAY['National']),
('2026-05-31', 'Hari Wesak', 2026, true, ARRAY['National']),
('2026-06-01', 'Hari Keputeraan YDP Agong', 2026, true, ARRAY['National']),
('2026-06-17', 'Awal Muharram', 2026, true, ARRAY['National']),
('2026-08-24', 'Hari Jadi Yang di-Pertua Negeri Melaka', 2026, false, ARRAY['Melaka']),
('2026-08-25', 'Maulidur Rasul', 2026, true, ARRAY['National']),
('2026-08-31', 'Hari Merdeka', 2026, true, ARRAY['National']),
('2026-09-16', 'Hari Malaysia', 2026, true, ARRAY['National']),
('2026-11-08', 'Deepavali', 2026, true, ARRAY['National']),
('2026-12-25', 'Hari Krismas', 2026, true, ARRAY['National'])
ON CONFLICT (holiday_date) DO NOTHING;
