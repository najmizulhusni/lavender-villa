# Supabase Setup Guide - Lavender Villa Melaka

## 1. Get Your Supabase Keys

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project: `rybqolewawemajhhftzv`
3. Go to **Settings** → **API**
4. Copy:
   - **Project URL**: `https://rybqolewawemajhhftzv.supabase.co`
   - **anon public key**: (starts with `eyJ...`)

## 2. Update Environment Variables

Edit `.env` file:

```env
VITE_SUPABASE_URL=https://rybqolewawemajhhftzv.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

## 3. Run Database Schema

1. Go to Supabase Dashboard → **SQL Editor**
2. Click **New Query**
3. Copy & paste contents of `supabase/schema.sql`
4. Click **Run**

## 4. Run Seed Data

1. In SQL Editor, create another new query
2. Copy & paste contents of `supabase/seed.sql`
3. Click **Run**

## 5. Verify Tables Created

Go to **Table Editor** and check these tables exist:
- ✅ properties
- ✅ bookings
- ✅ blocked_dates
- ✅ public_holidays
- ✅ admin_users
- ✅ whatsapp_templates
- ✅ activity_logs

## 6. Database Structure

### Tables Overview

| Table | Purpose |
|-------|---------|
| `properties` | Villa/homestay info (name, price, etc) |
| `bookings` | Customer bookings |
| `blocked_dates` | Manual date blocks by admin |
| `public_holidays` | Malaysia public holidays |
| `admin_users` | Admin login credentials |
| `whatsapp_templates` | WhatsApp message templates |
| `activity_logs` | Admin activity tracking |

### Booking Status Flow

```
pending → confirmed → paid → completed
                ↓
            cancelled
```

### Pricing Logic

- **Weekday** (Mon-Fri): RM 1,500/night
- **Weekend** (Sat-Sun): RM 1,800/night
- **Public Holiday**: RM 1,800/night

## 7. Connection Details

```
Host: db.rybqolewawemajhhftzv.supabase.co
Port: 5432
Database: postgres
User: postgres
Password: BHA0HXW9frPDtJ1z
```

## 8. Security Notes

⚠️ **IMPORTANT:**
- Never expose database password in frontend code
- Use Row Level Security (RLS) policies
- Only use `anon` key in frontend
- Use `service_role` key only in backend/server

## 9. Test Connection

After setup, run the app:
```bash
npm run dev
```

Check browser console for any Supabase connection errors.
