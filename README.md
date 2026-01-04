# Lavender Villa Melaka - Website & Booking System

**Professional Villa Rental Management Platform**

---

## 📋 Project Overview

Lavender Villa is a modern, full-featured website and booking management system for a luxury villa rental property located in Bemban, Melaka. The platform enables guests to browse, book, and manage their stays while providing administrators with comprehensive tools to manage bookings, pricing, and communications.

**Live Website:** [https://lavender-villa.vercel.app/](https://www.lavendervillamelaka.com/)

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
