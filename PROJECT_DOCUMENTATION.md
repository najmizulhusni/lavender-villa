# LAVENDER VILLA MELAKA - PROJECT DOCUMENTATION

## Project Overview

**Project Name:** Lavender Villa Melaka Website & Booking System
**Developer:** Muhammad Najmi Zulhusni Bin Mohd Sapuan
**Development Period:** December 2025
**Status:** Production Ready

---

## Project Summary

A complete villa booking website developed for Lavender Villa Melaka, a premium homestay located in Bemban, Melaka. The system includes a public-facing website for customers to view property details and make booking inquiries, plus a comprehensive admin dashboard for property management.

---

## Technology Stack

| Category | Technology |
|----------|------------|
| Frontend Framework | React 18 with Vite |
| Styling | Tailwind CSS |
| Icons | Lucide React |
| Database | Supabase (PostgreSQL) |
| Hosting | Vercel |
| Analytics | Google Analytics (G-6SZSRTK181) |
| Performance | Vercel Speed Insights |

---

## Features Developed

### Public Website

1. **Homepage**
   - Hero section with image carousel
   - Property information and amenities
   - Guest reviews section
   - Location with Google Maps integration
   - Interactive booking form with calendar
   - WhatsApp integration for booking inquiries
   - Floating WhatsApp button

2. **Booking System**
   - Date selection with availability calendar
   - Dynamic pricing (Weekday/Weekend/Festive)
   - Guest count selection
   - Real-time availability checking
   - WhatsApp booking submission
   - Booking confirmation modal

3. **FAQ Page**
   - Expandable FAQ sections
   - Location map
   - Contact information

### Admin Dashboard

1. **Authentication**
   - Secure login system
   - Session management (30-minute timeout)
   - Password reset functionality
   - Rate limiting (5 attempts per 15 minutes)

2. **Dashboard View**
   - Booking statistics overview
   - Revenue analytics
   - Monthly booking chart
   - Quick status indicators

3. **Calendar Management**
   - Visual calendar with booking status
   - Manual date blocking (Cuti/Tutup)
   - Public holiday display
   - Multi-property support (7 villas)

4. **Booking Management**
   - View all bookings
   - Filter by status/property/date
   - Update booking status
   - Generate PDF receipts
   - WhatsApp message templates
   - Add manual bookings

---

## Pricing Structure Implemented

| Package | Weekday | Weekend/PH | Festive |
|---------|---------|------------|---------|
| 2H1M (2 Hari 1 Malam) | RM 1,300 | RM 1,590 | RM 1,700 |
| 3H2M (3 Hari 2 Malam) | RM 2,400 | RM 2,990 | RM 3,200 |

**Festive Dates:** Hari Raya, CNY, Deepavali, Christmas (actual days only)

---

## Security Features

1. **Frontend Security**
   - Content Security Policy (CSP)
   - X-Frame-Options protection
   - XSS Protection headers
   - Input validation and sanitization
   - Honeypot anti-bot protection
   - Rate limiting on bookings

2. **Admin Security**
   - Hidden admin access (no public link)
   - Login rate limiting
   - Session timeout (30 minutes)
   - Password reset with verification code
   - Secure session management

3. **Database Security**
   - Row Level Security (RLS) enabled
   - Anon key with limited permissions
   - Secure API endpoints

---

## SEO Optimization

- Meta tags for search engines
- Open Graph tags for social sharing
- Twitter Card support
- Structured data (Schema.org)
- XML Sitemap
- Robots.txt configuration
- Canonical URLs
- Malay language keywords
- Geo-location meta tags

---

## Property Details

**Lavender Villa Melaka**
- Location: 47, Jalan Anjung Lavender 1, Taman Anjung Gapam, 77200 Bemban, Melaka
- Capacity: 15 comfortable, 20 maximum (including children 5+)
- Bedrooms: 5
- Bathrooms: 4
- Check-in: 3:00 PM
- Check-out: 12:00 PM
- Contact: +60 19 334 5686

**Amenities:**
- Private swimming pool (30x12x4 feet)
- BBQ area
- Full kitchen
- WiFi 300Mbps
- Smart TV 65" with Astro/Netflix/Disney+
- Karaoke system
- Children's play area
- Parking for 3 cars

---

## Database Schema

**Tables Created:**
1. properties - Villa/homestay information
2. bookings - Customer booking records
3. blocked_dates - Manual date blocks
4. public_holidays - Malaysian public holidays
5. admin_users - Admin authentication
6. whatsapp_templates - Message templates
7. activity_logs - Admin activity tracking

---

## File Structure

```
lavender-villa/
├── public/
│   ├── favicon.svg
│   ├── sitemap.xml
│   └── robots.txt
├── src/
│   ├── App.jsx          # Main website
│   ├── Admin.jsx        # Admin dashboard
│   ├── FAQ.jsx          # FAQ page
│   ├── main.jsx         # App entry point
│   ├── index.css        # Global styles
│   └── lib/
│       ├── supabase.js  # Supabase client
│       └── database.js  # Database functions
├── supabase/
│   ├── schema.sql       # Database schema
│   ├── seed.sql         # Initial data
│   └── rls-security.sql # Security policies
├── scripts/
│   └── update-domain.sh # Domain update script
├── index.html           # HTML entry point
├── vite.config.js       # Vite configuration
├── vercel.json          # Vercel configuration
├── tailwind.config.js   # Tailwind configuration
├── package.json         # Dependencies
├── README.md            # Project readme
├── QUICK_START.md       # User guide
├── SECURITY.md          # Security documentation
└── PROJECT_DOCUMENTATION.md # This file
```

---

## Deployment Information

**Live URL:** https://lavender-villa.vercel.app/
**Admin URL:** https://lavender-villa.vercel.app/admin
**Repository:** https://github.com/najmizulhusni/lavender-villa

**Hosting:** Vercel (Free Tier)
- Automatic deployments from GitHub
- Global CDN
- Free SSL certificate
- Edge caching

**Database:** Supabase (Free Tier)
- PostgreSQL database
- Real-time subscriptions
- Row Level Security
- Auto backups

---

## Admin Credentials

**Username:** admin
**Default Password:** lavendervilla2025
**Reset Code:** lavender2025

*Note: Password should be changed after first login*

---

## Future Enhancements (Recommended)

1. Add OG image for social media sharing
2. Implement email notifications
3. Add payment gateway integration
4. Create mobile app version
5. Add multi-language support
6. Implement customer reviews system

---

## Support & Maintenance

For technical support or modifications:
- Developer: Muhammad Najmi Zulhusni
- Contact: [Your contact information]

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | Dec 2025 | Initial release |

---

*Document Last Updated: December 2025*
