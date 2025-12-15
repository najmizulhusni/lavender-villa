# Lavender Villa Melaka - Website & Booking System

**Professional Villa Rental Management Platform**

---

## 📋 Project Overview

Lavender Villa is a modern, full-featured website and booking management system for a luxury villa rental property located in Bemban, Melaka. The platform enables guests to browse, book, and manage their stays while providing administrators with comprehensive tools to manage bookings, pricing, and communications.

**Live Website:** https://lavender-villa.vercel.app/

---

## ✨ Key Features

### Guest Features
- **Interactive Calendar Booking System** - Real-time availability with visual date selection
- **Responsive Design** - Optimized for desktop, tablet, and mobile devices
- **Instant WhatsApp Integration** - Direct messaging with property owner
- **Public Holiday Pricing** - Automatic weekend and public holiday rate adjustments
- **Booking Confirmation** - Success modal with booking summary
- **FAQ Section** - Comprehensive guest information and policies
- **Google Reviews** - 5.0 rating display with guest testimonials

### Admin Features
- **Secure Login System** - Username/password authentication with password reset
- **Dashboard Analytics** - Revenue and booking trends visualization
- **Booking Management** - View, filter, and manage all reservations
- **Calendar Management** - Block dates, view bookings, manage availability
- **WhatsApp Templates** - Pre-configured message templates for guest communication
- **Mobile Responsive** - Full admin functionality on mobile devices

### Technical Features
- **Supabase Database** - Secure cloud database for bookings and data
- **Google Analytics** - Visitor tracking and behavior analysis
- **SEO Optimized** - Malay keywords, structured data, rich snippets
- **Speed Insights** - Performance monitoring and optimization
- **Automated Routing** - SPA routing with proper 404 handling

---

## 🏗️ Technology Stack

**Frontend:**
- React 18.2.0
- React Router DOM 6.14.0
- Tailwind CSS 3.3.0
- Lucide React Icons
- Vite 7.2.7

**Backend & Database:**
- Supabase (PostgreSQL)
- Supabase Auth
- Supabase Real-time

**Deployment:**
- Vercel (Frontend hosting)
- Supabase Cloud (Database)

**Monitoring & Analytics:**
- Google Analytics 4
- Vercel Speed Insights

---

## 📁 Project Structure

```
lavender-villa/
├── src/
│   ├── App.jsx                 # Main homepage with booking system
│   ├── Admin.jsx               # Admin dashboard
│   ├── FAQ.jsx                 # FAQ page
│   ├── main.jsx                # React entry point
│   ├── index.css               # Global styles
│   └── lib/
│       ├── database.js         # Supabase database functions
│       └── supabase.js         # Supabase client configuration
├── public/
│   ├── favicon.svg             # Website icon
│   ├── robots.txt              # SEO robots configuration
│   ├── sitemap.xml             # SEO sitemap
│   └── _headers                # Vercel caching headers
├── supabase/
│   ├── schema.sql              # Database schema
│   └── seed.sql                # Initial data
├── index.html                  # HTML entry point
├── vite.config.js              # Vite configuration
├── vercel.json                 # Vercel deployment config
├── tailwind.config.js          # Tailwind CSS config
├── postcss.config.js           # PostCSS config
├── package.json                # Dependencies
└── .env                        # Environment variables (not in repo)
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ and npm
- Supabase account
- Vercel account (for deployment)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/najmizulhusni/lavender-villa.git
   cd lavender-villa
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Update `.env` with your Supabase credentials:
   ```
   VITE_SUPABASE_URL=https://rybqolewawemajhhftzv.supabase.co
   VITE_SUPABASE_ANON_KEY=your_anon_key_here
   ```

4. **Run development server**
   ```bash
   npm run dev
   ```
   Visit http://localhost:3000/

5. **Build for production**
   ```bash
   npm run build
   ```

---

## 🔐 Admin Access

**Login Credentials:**
- **Username:** admin
- **Password:** lavendervilla2025
- **Password Reset Code:** lavender2025

**Admin URL:** https://lavender-villa.vercel.app/admin

---

## 💰 Pricing Structure

**Weekdays:**
- 2H1M: RM 1,300
- 3H2M: RM 2,400

**Weekend / Special Holiday / Public Holiday:**
- 2H1M: RM 1,590
- 3H2M: RM 2,990

**Festive Season (Hari Raya, CNY, Deepavali, Christmas):**
- 2H1M: RM 1,700
- 3H2M: RM 3,200

---

## 📊 Database Schema

### Tables
- **properties** - Villa information and details
- **bookings** - Guest reservations and booking data
- **blocked_dates** - Manually blocked unavailable dates
- **public_holidays** - Malaysia public holidays 2025-2026
- **admin_users** - Admin account credentials
- **whatsapp_templates** - Pre-configured WhatsApp messages
- **activity_logs** - System activity tracking

---

## 🌐 SEO & Marketing

**Implemented SEO Features:**
- Malay language keywords optimization
- Structured data (JSON-LD) for rich snippets
- Meta tags and Open Graph tags
- Sitemap and robots.txt
- Google Analytics tracking
- Local geo-targeting for Melaka

**Recommended Next Steps:**
1. Submit to Google Search Console
2. List on booking platforms (Booking.com, Agoda, Airbnb)
3. Create Google My Business listing
4. Gather guest reviews on Google and TripAdvisor

---

## 📱 Contact & Support

**WhatsApp:** +60193345686
**Email:** [Add your email]
**Location:** Bemban, Melaka, Malaysia

---

## 📝 Booking Information

**Check-in:** 3:00 PM
**Check-out:** 12:00 PM
**Capacity:** 15 guests (comfortable), maximum 20 guests (including children aged 5 and above)
**Bedrooms:** 5
**Bathrooms:** 4
**Amenities:** Swimming pool, BBQ area, WiFi, Kitchen, Air conditioning, Children's play area

---

## 🔄 Deployment

The website is automatically deployed to Vercel whenever changes are pushed to the main branch on GitHub.

**Deployment URL:** https://lavender-villa.vercel.app/

**Deployment Status:** Check GitHub Actions or Vercel Dashboard

---

## 📈 Performance Metrics

- **Page Load Time:** < 2 seconds
- **Lighthouse Score:** 90+
- **Mobile Friendly:** Yes
- **SEO Score:** 95+

Monitor performance at: Vercel Dashboard → Speed Insights

---

## 🛠️ Maintenance

### Regular Tasks
- Monitor bookings and guest communications
- Update public holidays annually
- Review and respond to guest reviews
- Check analytics for traffic patterns
- Backup database regularly

### Troubleshooting
- **Booking not saving:** Check Supabase connection and database status
- **Admin login issues:** Verify credentials in database
- **Calendar not updating:** Clear browser cache and refresh
- **WhatsApp not opening:** Check WhatsApp number format

---

## 📄 License

This project is proprietary and confidential. All rights reserved.

---

**Last Updated:** December 15, 2025
**Version:** 1.0.0
**Status:** Production Ready ✅
