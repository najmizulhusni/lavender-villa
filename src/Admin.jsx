import { useState, useEffect } from 'react';
import { Sparkles, X, Trash2, ChevronLeft, ChevronRight, MapPin, TrendingUp, Users, CalendarDays, Lock, Eye, EyeOff, Phone, CheckCircle, Clock, XCircle, ClipboardList, Plus, FileText, Send, Navigation, ScrollText, Bell, Key, Heart, Copy } from 'lucide-react';
import { adminLogin, updateAdminPassword, getAllBookings, updateBookingStatus, deleteBooking, getBookedDates, addBlockedDate, removeBlockedDate } from './lib/database';
import { supabase } from './lib/supabase';

export default function Admin() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [loginSlide, setLoginSlide] = useState(0); // For right side slider
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetStep, setResetStep] = useState(1); // 1: verify code, 2: new password
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetError, setResetError] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState('lavender');
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const [adminView, setAdminView] = useState('dashboard'); // 'dashboard', 'calendar', 'bookings', 'analytics'
  const [bookings, setBookings] = useState([]);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState({ title: '', message: '' });

  // Check if already logged in
  useEffect(() => {
    const session = sessionStorage.getItem('adminLoggedIn');
    const sessionTime = sessionStorage.getItem('adminSessionTime');
    const now = Date.now();
    
    // Session timeout: 30 minutes
    if (session === 'true' && sessionTime) {
      const elapsed = now - parseInt(sessionTime);
      if (elapsed > 30 * 60 * 1000) {
        // Session expired
        sessionStorage.removeItem('adminLoggedIn');
        sessionStorage.removeItem('adminSessionTime');
        sessionStorage.removeItem('adminUser');
        setIsLoggedIn(false);
      } else {
        setIsLoggedIn(true);
      }
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    
    // Rate limiting: max 5 attempts per 15 minutes
    const loginAttempts = JSON.parse(localStorage.getItem('adminLoginAttempts') || '[]');
    const now = Date.now();
    const recentAttempts = loginAttempts.filter(time => now - time < 15 * 60 * 1000);
    
    if (recentAttempts.length >= 5) {
      setLoginError('Terlalu banyak percubaan login. Sila cuba lagi dalam 15 minit');
      return;
    }
    
    try {
      const admin = await adminLogin(username, password);
      setIsLoggedIn(true);
      sessionStorage.setItem('adminLoggedIn', 'true');
      sessionStorage.setItem('adminSessionTime', Date.now().toString());
      sessionStorage.setItem('adminUser', JSON.stringify(admin));
      setLoginError('');
      setUsername('');
      setPassword('');
      // Clear login attempts on successful login
      localStorage.removeItem('adminLoginAttempts');
    } catch (error) {
      // Fallback to localStorage if Supabase fails
      const storedPassword = localStorage.getItem('adminPassword') || 'lavendervilla2025';
      if (username === 'admin' && password === storedPassword) {
        setIsLoggedIn(true);
        sessionStorage.setItem('adminLoggedIn', 'true');
        sessionStorage.setItem('adminSessionTime', Date.now().toString());
        setLoginError('');
        setUsername('');
        setPassword('');
        // Clear login attempts on successful login
        localStorage.removeItem('adminLoginAttempts');
      } else {
        // Record failed attempt
        recentAttempts.push(now);
        localStorage.setItem('adminLoginAttempts', JSON.stringify(recentAttempts));
        setLoginError('Nama pengguna atau kata laluan salah');
      }
    }
  };

  // Handle password reset
  const handleResetPassword = async (e) => {
    e.preventDefault();
    
    if (resetStep === 1) {
      if (resetCode === 'lavender2025') {
        setResetStep(2);
        setResetError('');
      } else {
        setResetError('Kod reset tidak sah');
      }
    } else if (resetStep === 2) {
      if (newPassword.length < 6) {
        setResetError('Kata laluan mesti sekurang-kurangnya 6 aksara');
        return;
      }
      if (newPassword !== confirmPassword) {
        setResetError('Kata laluan tidak sepadan');
        return;
      }
      
      try {
        // Update password in Supabase
        await updateAdminPassword('admin', newPassword);
        // Also update localStorage as fallback
        localStorage.setItem('adminPassword', newPassword);
        setResetSuccess(true);
        setResetError('');
        
        setTimeout(() => {
          setShowForgotPassword(false);
          setResetStep(1);
          setResetCode('');
          setNewPassword('');
          setConfirmPassword('');
          setResetSuccess(false);
        }, 2000);
      } catch (error) {
        // Fallback to localStorage only
        localStorage.setItem('adminPassword', newPassword);
        setResetSuccess(true);
        setResetError('');
        setTimeout(() => {
          setShowForgotPassword(false);
          setResetStep(1);
          setResetCode('');
          setNewPassword('');
          setConfirmPassword('');
          setResetSuccess(false);
        }, 2000);
      }
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    sessionStorage.removeItem('adminLoggedIn');
    sessionStorage.removeItem('adminSessionTime');
    sessionStorage.removeItem('adminUser');
    setUsername('');
    setPassword('');
  };
  
  const properties = [
    { id: 'lavender', name: 'Lavender Villa Melaka', location: 'Bemban', address: 'Lot 1234, Jalan Bemban, 77200 Bemban, Melaka', code: 'VLM' },
    { id: 'venus', name: 'Venus Cabana Villa', location: 'Ayer Keroh', address: 'Lot 5678, Jalan Ayer Keroh, 75450 Ayer Keroh, Melaka', code: 'VCV' },
    { id: 'merpati', name: 'Merpati Purple Guesthouse', location: 'Jasin', address: 'Lot 9012, Jalan Jasin, 77000 Jasin, Melaka', code: 'MPG' },
    { id: 'defrance', name: 'De France Pool Villa', location: 'Alor Gajah', address: 'Lot 3456, Jalan Alor Gajah, 78000 Alor Gajah, Melaka', code: 'DFV' },
    { id: 'oaks', name: 'The Oaks Villa', location: 'Durian Tunggal', address: 'Lot 7890, Jalan Durian Tunggal, 76100 Durian Tunggal, Melaka', code: 'TOV' },
    { id: 'nilofar', name: 'Nilofar Villa', location: 'Merlimau', address: 'Lot 2345, Jalan Merlimau, 77300 Merlimau, Melaka', code: 'NLV' },
    { id: 'anjung', name: 'Villa Anjung Cemara', location: 'Selandar', address: 'Lot 6789, Jalan Selandar, 77500 Selandar, Melaka', code: 'VAC' }
  ];

  // Public holidays 2025-2026 (National + Melaka)
  const publicHolidays = {
    '2025-01-01': 'Tahun Baru',
    '2025-01-29': 'Tahun Baru Cina',
    '2025-01-30': 'Tahun Baru Cina',
    '2025-03-31': 'Hari Raya Aidilfitri',
    '2025-04-01': 'Hari Raya Aidilfitri',
    '2025-05-01': 'Hari Pekerja',
    '2025-05-12': 'Hari Wesak',
    '2025-06-02': 'Hari Keputeraan Agong',
    '2025-06-07': 'Hari Raya Aidiladha',
    '2025-06-27': 'Awal Muharram',
    '2025-08-31': 'Hari Merdeka',
    '2025-09-05': 'Maulidur Rasul',
    '2025-09-16': 'Hari Malaysia',
    '2025-10-15': 'Hari Jadi TYT Melaka',
    '2025-10-20': 'Deepavali',
    '2025-12-25': 'Hari Krismas',
    '2026-01-01': 'Tahun Baru',
    '2026-02-17': 'Tahun Baru Cina',
    '2026-02-18': 'Tahun Baru Cina',
    '2026-02-20': 'Hari Kemerdekaan Melaka',
    '2026-03-21': 'Hari Raya Aidilfitri',
    '2026-03-22': 'Hari Raya Aidilfitri',
    '2026-05-01': 'Hari Pekerja',
    '2026-05-27': 'Hari Raya Haji',
    '2026-05-31': 'Hari Wesak',
    '2026-06-01': 'Hari Keputeraan Agong',
    '2026-06-17': 'Awal Muharram',
    '2026-08-24': 'Hari Jadi TYT Melaka',
    '2026-08-25': 'Maulidur Rasul',
    '2026-08-31': 'Hari Merdeka',
    '2026-09-16': 'Hari Malaysia',
    '2026-11-08': 'Deepavali',
    '2026-12-25': 'Hari Krismas'
  };

  // Check if date is public holiday
  const isPublicHoliday = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    return publicHolidays[dateStr] || null;
  };

  // Generate PDF Receipt - Professional black & white format
  const generateReceipt = (booking) => {
    const property = properties.find(p => p.id === booking.property) || properties[0];
    const checkInDate = new Date(booking.checkIn).toLocaleDateString('ms-MY', { day: 'numeric', month: 'long', year: 'numeric' });
    const checkOutDate = new Date(booking.checkOut).toLocaleDateString('ms-MY', { day: 'numeric', month: 'long', year: 'numeric' });
    const receiptDate = new Date().toLocaleDateString('ms-MY', { day: 'numeric', month: 'long', year: 'numeric' });
    // Receipt number: Replace property code with RCP (e.g., VLM-2512-001 → RCP-2512-001)
    const receiptNo = booking.id.replace(/^[A-Z]{3}-/, 'RCP-');
    const pricePerNight = booking.nights > 0 ? Math.round(booking.total / booking.nights) : booking.total;
    
    const receiptHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Resit - ${receiptNo}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 20px; background: white; font-size: 14px; color: #000; }
          .receipt { max-width: 700px; margin: 0 auto; background: white; border: 1px solid #000; }
          .header { padding: 25px 30px; border-bottom: 2px solid #000; }
          .header-top { display: flex; justify-content: space-between; align-items: flex-start; }
          .company-info h1 { font-size: 22px; color: #000; margin-bottom: 5px; font-weight: 700; }
          .company-info p { color: #333; font-size: 12px; line-height: 1.6; }
          .receipt-title { text-align: right; }
          .receipt-title h2 { font-size: 24px; color: #000; margin-bottom: 5px; font-weight: 700; }
          .receipt-title .receipt-no { font-size: 14px; color: #000; font-weight: 600; }
          .receipt-title .receipt-date { font-size: 12px; color: #333; margin-top: 5px; }
          .content { padding: 25px 30px; }
          .two-col { display: flex; gap: 30px; margin-bottom: 25px; }
          .col { flex: 1; }
          .section-title { font-size: 11px; color: #000; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 10px; font-weight: 700; border-bottom: 1px solid #000; padding-bottom: 5px; }
          .info-item { margin-bottom: 8px; }
          .info-label { color: #555; font-size: 12px; display: block; }
          .info-value { color: #000; font-weight: 600; font-size: 14px; }
          .table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          .table th { background: #f5f5f5; padding: 12px 15px; text-align: left; font-size: 11px; color: #000; text-transform: uppercase; letter-spacing: 0.5px; border: 1px solid #000; }
          .table td { padding: 12px 15px; border: 1px solid #ccc; color: #000; }
          .table .text-right { text-align: right; }
          .table .total-row td { border: 1px solid #000; font-weight: 700; font-size: 16px; background: #f5f5f5; }
          .table .total-row .amount { font-size: 18px; }
          .status-text { font-weight: 600; text-transform: uppercase; }
          .footer { background: #f5f5f5; padding: 20px 30px; border-top: 1px solid #000; }
          .footer-content { text-align: center; }
          .footer-left { font-size: 11px; color: #333; line-height: 1.6; }
          .terms { margin-top: 20px; padding: 15px; border: 1px solid #ccc; }
          .terms h4 { font-size: 11px; color: #000; margin-bottom: 8px; text-transform: uppercase; font-weight: 700; }
          .terms ul { font-size: 11px; color: #333; padding-left: 15px; line-height: 1.6; }
          @media print { 
            body { padding: 0; } 
            .receipt { border: 1px solid #000; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="receipt">
          <div class="header">
            <div class="header-top">
              <div class="company-info">
                <h1>${property.name}</h1>
                <p>
                  ${property.address}<br>
                  Tel: 012-345 6789
                </p>
              </div>
              <div class="receipt-title">
                <h2>RESIT</h2>
                <div class="receipt-no">${receiptNo}</div>
                <div class="receipt-date">Tarikh: ${receiptDate}</div>
              </div>
            </div>
          </div>
          
          <div class="content">
            <div class="two-col">
              <div class="col">
                <div class="section-title">Maklumat Tetamu</div>
                <div class="info-item">
                  <span class="info-label">Nama Penuh</span>
                  <span class="info-value">${booking.name}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">No. Telefon</span>
                  <span class="info-value">${booking.phone}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Bilangan Tetamu</span>
                  <span class="info-value">${booking.guests} orang</span>
                </div>
              </div>
              <div class="col">
                <div class="section-title">Butiran Penginapan</div>
                <div class="info-item">
                  <span class="info-label">No. Tempahan</span>
                  <span class="info-value">${booking.id}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Daftar Masuk</span>
                  <span class="info-value">${checkInDate}, 3:00 PM</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Daftar Keluar</span>
                  <span class="info-value">${checkOutDate}, 12:00 PM</span>
                </div>
              </div>
            </div>
            
            <div class="section-title">Butiran Bayaran</div>
            <table class="table">
              <thead>
                <tr>
                  <th>Penerangan</th>
                  <th>Kuantiti</th>
                  <th class="text-right">Harga Seunit</th>
                  <th class="text-right">Jumlah</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <strong>${property.name}</strong><br>
                    <span style="color: #555; font-size: 12px;">Penginapan ${booking.nights} malam</span>
                  </td>
                  <td>${booking.nights} malam</td>
                  <td class="text-right">RM ${pricePerNight.toLocaleString()}</td>
                  <td class="text-right">RM ${booking.total?.toLocaleString()}</td>
                </tr>
                <tr class="total-row">
                  <td colspan="3"><strong>JUMLAH KESELURUHAN</strong></td>
                  <td class="text-right amount">RM ${booking.total?.toLocaleString()}</td>
                </tr>
              </tbody>
            </table>
            
            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 15px;">
              <div>
                <span class="info-label">Status Bayaran</span><br>
                <span class="status-text">TELAH DIBAYAR</span>
              </div>
              <div style="text-align: right;">
                <span class="info-label">Kaedah Bayaran</span><br>
                <span class="info-value">Online Transfer</span>
              </div>
            </div>
            
            <div class="terms">
              <h4>Terma & Syarat</h4>
              <ul>
                <li>Daftar masuk: 3:00 PM | Daftar keluar: 12:00 PM</li>
                <li>Deposit akan dipulangkan selepas pemeriksaan unit</li>
                <li>Sebarang kerosakan akan ditolak dari deposit</li>
                <li>Resit ini adalah bukti pembayaran yang sah</li>
              </ul>
            </div>
          </div>
          
          <div class="footer">
            <div class="footer-content">
              <div class="footer-left">
                <strong>${property.name}</strong><br>
                Terima kasih atas tempahan anda.<br>
                Untuk pertanyaan: WhatsApp 012-345 6789
              </div>
            </div>
          </div>
        </div>
        
        <div class="no-print" style="text-align: center; margin-top: 20px;">
          <button onclick="window.print()" style="background: #7c3aed; color: white; border: none; padding: 12px 30px; border-radius: 8px; font-size: 14px; cursor: pointer; font-weight: 600;">
            🖨️ Cetak Resit
          </button>
        </div>
      </body>
      </html>
    `;
    
    // Open in new window
    const printWindow = window.open('', '_blank');
    printWindow.document.write(receiptHTML);
    printWindow.document.close();
  };

  // Initialize booked dates from localStorage
  const [bookedDates, setBookedDates] = useState(() => {
    const initial = {};
    properties.forEach(p => {
      const saved = localStorage.getItem(`bookedDates_${p.id}`);
      initial[p.id] = saved ? JSON.parse(saved) : (p.id === 'lavender' ? ['2025-12-13', '2025-12-14'] : []);
    });
    return initial;
  });

  // Manual blocked dates (holidays, maintenance, etc.)
  const [manualBlockedDates, setManualBlockedDates] = useState(() => {
    const initial = {};
    properties.forEach(p => {
      const saved = localStorage.getItem(`manualBlocked_${p.id}`);
      initial[p.id] = saved ? JSON.parse(saved) : [];
    });
    return initial;
  });

  // Save to localStorage whenever bookedDates changes
  useEffect(() => {
    Object.keys(bookedDates).forEach(key => {
      localStorage.setItem(`bookedDates_${key}`, JSON.stringify(bookedDates[key]));
    });
  }, [bookedDates]);

  // Save manual blocked dates to localStorage
  useEffect(() => {
    Object.keys(manualBlockedDates).forEach(key => {
      localStorage.setItem(`manualBlocked_${key}`, JSON.stringify(manualBlockedDates[key]));
    });
  }, [manualBlockedDates]);

  // Migrate old booking IDs to property-specific format and ensure uniqueness
  const migrateBookingIds = (bookingsList) => {
    let needsSave = false;
    const usedIds = new Set();
    
    // First pass: collect all existing property-coded IDs
    bookingsList.forEach(booking => {
      if (booking.id && /^[A-Z]{3}-\d{4}-\d{3}$/.test(booking.id)) {
        usedIds.add(booking.id);
      }
    });
    
    const migrated = bookingsList.map(booking => {
      // Skip if already in proper format (XXX-YYMM-NNN)
      if (booking.id && /^[A-Z]{3}-\d{4}-\d{3}$/.test(booking.id)) {
        return booking;
      }
      
      // Get property code
      const prop = properties.find(p => p.id === booking.property) || properties[0];
      const propertyCode = prop.code;
      
      // Generate new ID based on check-in date or created date
      const dateRef = booking.checkIn ? new Date(booking.checkIn) : new Date(booking.createdAt || Date.now());
      const yearMonth = `${String(dateRef.getFullYear()).slice(-2)}${String(dateRef.getMonth() + 1).padStart(2, '0')}`;
      
      // Find next available number for this property and month
      let counter = 1;
      let newId = `${propertyCode}-${yearMonth}-${String(counter).padStart(3, '0')}`;
      while (usedIds.has(newId)) {
        counter++;
        newId = `${propertyCode}-${yearMonth}-${String(counter).padStart(3, '0')}`;
      }
      usedIds.add(newId);
      
      needsSave = true;
      return { ...booking, id: newId };
    });
    
    // Save migrated bookings
    if (needsSave) {
      localStorage.setItem('bookings', JSON.stringify(migrated));
    }
    
    return migrated;
  };

  // Load bookings from Supabase
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load bookings from Supabase
        const dbBookings = await getAllBookings();
        
        // Transform to match existing format
        const formattedBookings = dbBookings.map(b => ({
          id: b.booking_code,
          dbId: b.id,
          name: b.customer_name,
          phone: b.customer_phone,
          checkIn: b.check_in,
          checkOut: b.check_out,
          nights: b.nights,
          guests: b.guests,
          total: parseFloat(b.total_amount),
          status: b.status,
          message: b.special_requests,
          property: b.properties?.slug || 'lavender',
          createdAt: b.created_at
        }));
        
        setBookings(formattedBookings);
        
        // Load booked dates - only for lavender (the only property in database for now)
        const newBookedDates = {};
        try {
          const lavenderDates = await getBookedDates('lavender');
          newBookedDates['lavender'] = lavenderDates;
        } catch {
          newBookedDates['lavender'] = [];
        }
        // Initialize other properties as empty (not in database yet)
        properties.forEach(p => {
          if (!newBookedDates[p.id]) {
            newBookedDates[p.id] = [];
          }
        });
        setBookedDates(newBookedDates);
        
      } catch (error) {
        console.error('Error loading from Supabase:', error);
        // Fallback to localStorage
        const savedBookings = localStorage.getItem('bookings');
        let parsedBookings = savedBookings ? JSON.parse(savedBookings) : [];
        parsedBookings = migrateBookingIds(parsedBookings);
        setBookings(parsedBookings);
        
        const manualDates = {};
        properties.forEach(p => {
          const saved = localStorage.getItem(`manualBlocked_${p.id}`);
          manualDates[p.id] = saved ? JSON.parse(saved) : [];
        });
        
        const newBookedDates = {};
        properties.forEach(p => {
          newBookedDates[p.id] = [...(manualDates[p.id] || [])];
        });
        
        parsedBookings.forEach(booking => {
          if (booking.status === 'paid' && booking.checkIn && booking.checkOut) {
            const dates = [];
            const start = new Date(booking.checkIn);
            const end = new Date(booking.checkOut);
            for (let d = new Date(start); d < end; d.setDate(d.getDate() + 1)) {
              dates.push(d.toISOString().split('T')[0]);
            }
            const propertyId = booking.property || 'lavender';
            newBookedDates[propertyId] = [...new Set([...newBookedDates[propertyId], ...dates])].sort();
          }
        });
        
        setBookedDates(newBookedDates);
      }
    };
    
    loadData();
    
    // Refresh every 30 seconds
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  // Helper: Get all dates between check-in and check-out
  const getDatesBetween = (checkIn, checkOut) => {
    const dates = [];
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    for (let d = new Date(start); d < end; d.setDate(d.getDate() + 1)) {
      dates.push(d.toISOString().split('T')[0]);
    }
    return dates;
  };

  // Sync booked dates based on paid bookings + manual blocked dates
  const syncBookedDates = (allBookings, manualDates = manualBlockedDates) => {
    const newBookedDates = {};
    properties.forEach(p => {
      // Start with manual blocked dates
      newBookedDates[p.id] = [...(manualDates[p.id] || [])];
    });
    
    // Add dates from all PAID bookings
    allBookings.forEach(booking => {
      if (booking.status === 'paid' && booking.checkIn && booking.checkOut) {
        const dates = getDatesBetween(booking.checkIn, booking.checkOut);
        const propertyId = booking.property || 'lavender';
        newBookedDates[propertyId] = [...new Set([...newBookedDates[propertyId], ...dates])].sort();
      }
    });
    
    // Update state
    setBookedDates(newBookedDates);
    
    // Also update localStorage for each property
    Object.keys(newBookedDates).forEach(key => {
      localStorage.setItem(`bookedDates_${key}`, JSON.stringify(newBookedDates[key]));
    });
  };

  // Helper: Format date to YYYY-MM-DD string (timezone safe)
  const formatDateStr = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Toggle manual blocked date (for holidays/events)
  const toggleManualBlockedDate = async (date) => {
    const dateStr = typeof date === 'string' ? date : formatDateStr(date);
    const current = manualBlockedDates[activeTab] || [];
    const isBlocked = current.includes(dateStr);
    
    // Update Supabase
    try {
      if (isBlocked) {
        await removeBlockedDate(activeTab, dateStr);
      } else {
        await addBlockedDate(activeTab, dateStr, 'Manual block');
      }
    } catch (error) {
      console.error('Error updating blocked date in Supabase:', error);
    }
    
    // Update local state
    setManualBlockedDates(prev => {
      let updated;
      if (isBlocked) {
        updated = { ...prev, [activeTab]: current.filter(d => d !== dateStr) };
      } else {
        updated = { ...prev, [activeTab]: [...current, dateStr].sort() };
      }
      
      // Re-sync booked dates with new manual dates
      setTimeout(() => syncBookedDates(bookings, updated), 0);
      return updated;
    });
  };

  // Check if date is manually blocked
  const isManuallyBlocked = (date) => {
    const dateStr = formatDateStr(date);
    return (manualBlockedDates[activeTab] || []).includes(dateStr);
  };

  // Check if date is from paid booking
  const isFromPaidBooking = (date) => {
    const dateStr = formatDateStr(date);
    return bookings.some(b => 
      b.status === 'paid' && 
      b.property === activeTab &&
      b.checkIn && b.checkOut &&
      dateStr >= b.checkIn && dateStr < b.checkOut
    );
  };

  // Update booking status
  const handleUpdateBookingStatus = async (bookingId, newStatus) => {
    const booking = bookings.find(b => b.id === bookingId);
    
    try {
      // Update in Supabase if we have dbId
      if (booking?.dbId) {
        await updateBookingStatus(booking.dbId, newStatus);
      }
    } catch (error) {
      console.error('Error updating in Supabase:', error);
    }
    
    // Update local state
    const updatedBookings = bookings.map(b => 
      b.id === bookingId ? { ...b, status: newStatus } : b
    );
    setBookings(updatedBookings);
    localStorage.setItem('bookings', JSON.stringify(updatedBookings));
    syncBookedDates(updatedBookings);
  };

  // Delete booking
  const handleDeleteBooking = async (bookingId) => {
    if (confirm('Padam tempahan ini?')) {
      const booking = bookings.find(b => b.id === bookingId);
      
      try {
        // Delete from Supabase if we have dbId
        if (booking?.dbId) {
          await deleteBooking(booking.dbId);
        }
      } catch (error) {
        console.error('Error deleting from Supabase:', error);
      }
      
      // Update local state
      const updatedBookings = bookings.filter(b => b.id !== bookingId);
      setBookings(updatedBookings);
      localStorage.setItem('bookings', JSON.stringify(updatedBookings));
      syncBookedDates(updatedBookings);
      
      // Reload booked dates from Supabase to ensure sync
      try {
        const lavenderDates = await getBookedDates('lavender');
        setBookedDates(prev => ({
          ...prev,
          lavender: lavenderDates
        }));
        localStorage.setItem('bookedDates_lavender', JSON.stringify(lavenderDates));
      } catch (error) {
        console.error('Error reloading booked dates:', error);
      }
    }
  };

  // Get bookings count by status
  const getPendingCount = () => bookings.filter(b => (b.status || 'pending') === 'pending').length;
  const getPaidCount = () => bookings.filter(b => b.status === 'paid').length;
  const getRefundCount = () => bookings.filter(b => b.status === 'refund').length;
  const getCancelledCount = () => bookings.filter(b => b.status === 'cancelled').length;
  
  // Filter state
  const [bookingFilter, setBookingFilter] = useState('all'); // 'all', 'pending', 'paid', 'cancelled'
  const [propertyFilter, setPropertyFilter] = useState('all'); // 'all' or property id
  const [dateFilterFrom, setDateFilterFrom] = useState(''); // Filter by check-in date from
  const [dateFilterTo, setDateFilterTo] = useState(''); // Filter by check-in date to
  const [analyticsMonth, setAnalyticsMonth] = useState(new Date()); // Month filter for analytics
  const [chartPropertyFilter, setChartPropertyFilter] = useState('all'); // Property filter for chart
  const [showVillaDropdown, setShowVillaDropdown] = useState(null); // 'dashboard', 'bookings', or null
  const [showDatePicker, setShowDatePicker] = useState(null); // 'from', 'to', or null
  const [datePickerMonth, setDatePickerMonth] = useState(new Date());
  
  // Add booking modal state
  const [showAddBooking, setShowAddBooking] = useState(false);
  const [newBooking, setNewBooking] = useState({
    name: '',
    phone: '',
    property: 'lavender',
    checkIn: '',
    checkOut: '',
    guests: 15,
    total: 0,
    message: '',
    status: 'pending'
  });

  // Add new booking
  const handleAddBooking = () => {
    if (!newBooking.name.trim()) {
      alert('Sila masukkan nama pelanggan');
      return;
    }
    if (!newBooking.phone.trim()) {
      alert('Sila masukkan nombor telefon');
      return;
    }
    if (!newBooking.checkIn || !newBooking.checkOut) {
      alert('Sila pilih tarikh daftar masuk dan keluar');
      return;
    }
    if (new Date(newBooking.checkOut) <= new Date(newBooking.checkIn)) {
      alert('Tarikh keluar mesti selepas tarikh masuk');
      return;
    }

    const checkIn = new Date(newBooking.checkIn);
    const checkOut = new Date(newBooking.checkOut);
    const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));

    // Generate booking ID: [CODE]-YYMM-XXX (e.g., VLM-2512-001, VCV-2512-001)
    const selectedProperty = properties.find(p => p.id === newBooking.property) || properties[0];
    const propertyCode = selectedProperty.code;
    const now = new Date();
    const yearMonth = `${String(now.getFullYear()).slice(-2)}${String(now.getMonth() + 1).padStart(2, '0')}`;
    const monthBookings = bookings.filter(b => b.id && b.id.startsWith(`${propertyCode}-${yearMonth}`)).length;
    const bookingNumber = String(monthBookings + 1).padStart(3, '0');
    const bookingId = `${propertyCode}-${yearMonth}-${bookingNumber}`;

    const booking = {
      id: bookingId,
      name: newBooking.name.trim(),
      phone: newBooking.phone.trim(),
      property: newBooking.property,
      checkIn: newBooking.checkIn,
      checkOut: newBooking.checkOut,
      nights: nights,
      guests: newBooking.guests,
      total: newBooking.total || 0,
      message: newBooking.message.trim(),
      status: newBooking.status,
      createdAt: new Date().toISOString()
    };

    const updatedBookings = [...bookings, booking];
    setBookings(updatedBookings);
    localStorage.setItem('bookings', JSON.stringify(updatedBookings));
    
    // Sync booked dates if booking is paid
    syncBookedDates(updatedBookings);

    // Reset form and close modal
    setNewBooking({
      name: '',
      phone: '',
      property: 'lavender',
      checkIn: '',
      checkOut: '',
      guests: 15,
      total: 0,
      message: '',
      status: 'pending'
    });
    setShowAddBooking(false);
  };
  
  // Get filtered bookings
  const getFilteredBookings = () => {
    let filtered = bookings;
    
    // Filter by status
    if (bookingFilter !== 'all') {
      filtered = filtered.filter(b => (b.status || 'pending') === bookingFilter);
    }
    
    // Filter by property
    if (propertyFilter !== 'all') {
      filtered = filtered.filter(b => b.property === propertyFilter);
    }
    
    // Filter by date range (check-in date)
    if (dateFilterFrom) {
      filtered = filtered.filter(b => b.checkIn >= dateFilterFrom);
    }
    if (dateFilterTo) {
      filtered = filtered.filter(b => b.checkIn <= dateFilterTo);
    }
    
    return filtered;
  };

  // Clear all filters
  const clearAllFilters = () => {
    setBookingFilter('all');
    setPropertyFilter('all');
    setDateFilterFrom('');
    setDateFilterTo('');
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();
    return { daysInMonth, startingDay };
  };

  // Toggle date - only allows manual blocking (not unblocking paid bookings)
  const toggleDate = (date) => {
    // Check if this date is from a paid booking
    if (isFromPaidBooking(date)) {
      alert('Tarikh ini dari tempahan yang telah dibayar. Untuk membuka tarikh ini, sila tukar status tempahan kepada "Belum Bayar" atau "Dibatalkan" di Senarai Tempahan.');
      return;
    }
    
    // Toggle manual blocked date
    toggleManualBlockedDate(date);
  };

  const isDateBooked = (date) => {
    const dateStr = formatDateStr(date);
    return (bookedDates[activeTab] || []).includes(dateStr);
  };

  const clearAllDates = () => {
    if (confirm('Padam semua tarikh cuti/acara yang ditutup manual?')) {
      setManualBlockedDates(prev => {
        const updated = { ...prev, [activeTab]: [] };
        // Re-sync booked dates
        setTimeout(() => syncBookedDates(bookings, updated), 0);
        return updated;
      });
    }
  };

  // Analytics calculations
  const getTotalBookedDates = () => {
    return Object.values(bookedDates).reduce((sum, dates) => sum + dates.length, 0);
  };

  const getThisMonthBookings = () => {
    const now = new Date();
    const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    return Object.values(bookedDates).reduce((sum, dates) => {
      return sum + dates.filter(d => d.startsWith(thisMonth)).length;
    }, 0);
  };

  const getMostBookedProperty = () => {
    let max = 0;
    let name = '-';
    properties.forEach(p => {
      const count = (bookedDates[p.id] || []).length;
      if (count > max) {
        max = count;
        name = p.name;
      }
    });
    return { name, count: max };
  };

  // Get current month key
  const getCurrentMonthKey = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  };

  // Get current month name
  const getCurrentMonthName = () => {
    return new Date().toLocaleDateString('ms-MY', { month: 'long', year: 'numeric' });
  };

  // Get this month's bookings by status
  const getThisMonthBookingsByStatus = (status) => {
    const thisMonth = getCurrentMonthKey();
    if (status === 'all') {
      return bookings.filter(b => b.checkIn && b.checkIn.startsWith(thisMonth)).length;
    }
    return bookings.filter(b => b.status === status && b.checkIn && b.checkIn.startsWith(thisMonth)).length;
  };

  // Get this month's revenue (from paid bookings)
  const getThisMonthRevenue = () => {
    const thisMonth = getCurrentMonthKey();
    return bookings
      .filter(b => b.status === 'paid' && b.checkIn && b.checkIn.startsWith(thisMonth))
      .reduce((sum, b) => sum + (b.total || 0), 0);
  };

  // Get total revenue (all paid bookings)
  const getTotalRevenue = () => {
    return bookings
      .filter(b => b.status === 'paid')
      .reduce((sum, b) => sum + (b.total || 0), 0);
  };

  // Get analytics month key
  const getAnalyticsMonthKey = () => {
    return `${analyticsMonth.getFullYear()}-${String(analyticsMonth.getMonth() + 1).padStart(2, '0')}`;
  };

  // Get analytics month name
  const getAnalyticsMonthName = () => {
    return analyticsMonth.toLocaleDateString('ms-MY', { month: 'long', year: 'numeric' });
  };

  // Get selected month's revenue
  const getSelectedMonthRevenue = () => {
    const monthKey = getAnalyticsMonthKey();
    return bookings
      .filter(b => b.status === 'paid' && b.checkIn && b.checkIn.startsWith(monthKey))
      .reduce((sum, b) => sum + (b.total || 0), 0);
  };

  // Get selected month's bookings by status
  const getSelectedMonthBookingsByStatus = (status) => {
    const monthKey = getAnalyticsMonthKey();
    if (status === 'all') {
      return bookings.filter(b => b.checkIn && b.checkIn.startsWith(monthKey)).length;
    }
    return bookings.filter(b => b.status === status && b.checkIn && b.checkIn.startsWith(monthKey)).length;
  };

  // Get revenue by property for selected month
  const getRevenueByProperty = (useSelectedMonth = false) => {
    const monthKey = getAnalyticsMonthKey();
    const revenue = {};
    properties.forEach(p => {
      revenue[p.id] = bookings
        .filter(b => b.status === 'paid' && b.property === p.id && (!useSelectedMonth || (b.checkIn && b.checkIn.startsWith(monthKey))))
        .reduce((sum, b) => sum + (b.total || 0), 0);
    });
    return revenue;
  };

  // Get bookings count by property for selected month
  const getBookingsByProperty = (useSelectedMonth = false) => {
    const monthKey = getAnalyticsMonthKey();
    const counts = {};
    properties.forEach(p => {
      counts[p.id] = bookings.filter(b => b.property === p.id && (!useSelectedMonth || (b.checkIn && b.checkIn.startsWith(monthKey)))).length;
    });
    return counts;
  };

  // Get monthly revenue from Dec 2025 to Dec 2026 (13 months)
  const getMonthlyRevenue = (propertyId = 'all') => {
    const months = [];
    // Start from December 2025 to December 2026
    for (let i = 0; i <= 12; i++) {
      const date = new Date(2025, 11 + i, 1); // 11 = December (0-indexed)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthName = date.toLocaleDateString('ms-MY', { month: 'short', year: '2-digit' });
      const revenue = bookings
        .filter(b => b.status === 'paid' && b.checkIn && b.checkIn.startsWith(monthKey) && (propertyId === 'all' || b.property === propertyId))
        .reduce((sum, b) => sum + (b.total || 0), 0);
      months.push({ month: monthName, revenue, key: monthKey });
    }
    return months;
  };

  const activeProperty = properties.find(p => p.id === activeTab);

  // Slider content for login page
  const loginSlides = [
    {
      title: 'Urus Tempahan dengan Mudah',
      desc: 'Semua yang anda perlukan dalam satu dashboard yang mudah digunakan.',
      icon: <ClipboardList className="w-12 h-12 text-white" />
    },
    {
      title: 'Pantau Pendapatan',
      desc: 'Lihat prestasi perniagaan anda dengan graf dan analitik yang jelas.',
      icon: <TrendingUp className="w-12 h-12 text-white" />
    },
    {
      title: 'Kalendar Tempahan',
      desc: 'Urus ketersediaan villa dengan kalendar interaktif.',
      icon: <CalendarDays className="w-12 h-12 text-white" />
    }
  ];

  // Auto-slide for login page
  useEffect(() => {
    if (!isLoggedIn) {
      const interval = setInterval(() => {
        setLoginSlide((prev) => (prev + 1) % loginSlides.length);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [isLoggedIn]);

  // Login Screen
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex">
        {/* Left Side - Login Form */}
        <div className="w-full lg:w-1/2 bg-white flex items-center justify-center p-6 sm:p-12">
          <div className="w-full max-w-md">
            {/* Logo */}
            <div className="flex items-center gap-2 mb-10">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-purple-500 rounded-xl flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl text-slate-900">Lavender Villa</span>
            </div>
            
            {/* Header */}
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Log Masuk Admin</h1>
            <p className="text-slate-500 mb-8">Selamat kembali! Sila masukkan maklumat anda.</p>
            
            <form onSubmit={handleLogin}>
              {/* Username Field */}
              <div className="mb-4">
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2">
                    <Users className="w-5 h-5 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Nama Pengguna"
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition"
                  />
                </div>
              </div>
              
              {/* Password Field */}
              <div className="mb-4">
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2">
                    <Lock className="w-5 h-5 text-slate-400" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Kata Laluan"
                    className="w-full pl-12 pr-12 py-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {loginError && (
                  <p className="text-red-500 text-sm mt-2">{loginError}</p>
                )}
              </div>
              
              {/* Forgot Password Link */}
              <div className="flex justify-end mb-6">
                <button 
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  className="text-purple-500 text-sm font-medium hover:text-purple-600 transition"
                >
                  Lupa Kata Laluan?
                </button>
              </div>
              
              {/* Login Button */}
              <button
                type="submit"
                className="w-full py-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl font-semibold hover:from-purple-600 hover:to-purple-700 transition shadow-lg shadow-purple-500/30"
              >
                Log Masuk
              </button>
            </form>
            
            {/* Back Link */}
            <div className="text-center mt-8">
              <a href="/" className="text-slate-500 text-sm hover:text-purple-500 transition">← Kembali ke laman utama</a>
            </div>

            {/* Forgot Password Modal */}
            {showForgotPassword && (
              <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
                  {/* Header */}
                  <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-6 text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-xl font-bold">Reset Kata Laluan</h2>
                        <p className="text-purple-100 text-sm mt-1">
                          {resetStep === 1 ? 'Masukkan kod reset' : 'Tetapkan kata laluan baru'}
                        </p>
                      </div>
                      <button 
                        onClick={() => {
                          setShowForgotPassword(false);
                          setResetStep(1);
                          setResetCode('');
                          setNewPassword('');
                          setConfirmPassword('');
                          setResetError('');
                          setResetSuccess(false);
                        }}
                        className="p-2 hover:bg-white/20 rounded-xl transition"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                  
                  <form onSubmit={handleResetPassword} className="p-6">
                    {resetSuccess ? (
                      <div className="text-center py-8">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <CheckCircle className="w-8 h-8 text-green-500" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 mb-2">Berjaya!</h3>
                        <p className="text-slate-500 text-sm">Kata laluan anda telah dikemas kini.</p>
                      </div>
                    ) : resetStep === 1 ? (
                      <>
                        <div className="mb-4">
                          <label className="block text-slate-700 text-sm font-medium mb-2">Kod Reset</label>
                          <div className="relative">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2">
                              <Key className="w-5 h-5 text-slate-400" />
                            </div>
                            <input
                              type="text"
                              value={resetCode}
                              onChange={(e) => setResetCode(e.target.value)}
                              placeholder="Masukkan kod reset"
                              className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition"
                            />
                          </div>
                          <p className="text-slate-400 text-xs mt-2">Hubungi pemilik untuk mendapatkan kod reset.</p>
                        </div>
                        {resetError && (
                          <p className="text-red-500 text-sm mb-4">{resetError}</p>
                        )}
                        <button
                          type="submit"
                          className="w-full py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl font-semibold hover:from-purple-600 hover:to-purple-700 transition"
                        >
                          Sahkan Kod
                        </button>
                      </>
                    ) : (
                      <>
                        <div className="mb-4">
                          <label className="block text-slate-700 text-sm font-medium mb-2">Kata Laluan Baru</label>
                          <div className="relative">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2">
                              <Lock className="w-5 h-5 text-slate-400" />
                            </div>
                            <input
                              type="password"
                              value={newPassword}
                              onChange={(e) => setNewPassword(e.target.value)}
                              placeholder="Masukkan kata laluan baru"
                              className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition"
                            />
                          </div>
                        </div>
                        <div className="mb-4">
                          <label className="block text-slate-700 text-sm font-medium mb-2">Sahkan Kata Laluan</label>
                          <div className="relative">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2">
                              <Lock className="w-5 h-5 text-slate-400" />
                            </div>
                            <input
                              type="password"
                              value={confirmPassword}
                              onChange={(e) => setConfirmPassword(e.target.value)}
                              placeholder="Masukkan semula kata laluan"
                              className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition"
                            />
                          </div>
                        </div>
                        {resetError && (
                          <p className="text-red-500 text-sm mb-4">{resetError}</p>
                        )}
                        <button
                          type="submit"
                          className="w-full py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl font-semibold hover:from-purple-600 hover:to-purple-700 transition"
                        >
                          Simpan Kata Laluan
                        </button>
                      </>
                    )}
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Right Side - Purple Gradient with Slider */}
        <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-purple-500 via-purple-600 to-purple-700 items-center justify-center p-12 relative overflow-hidden">
          {/* Background Decorations */}
          <div className="absolute top-20 left-20 w-32 h-32 bg-purple-400/30 rounded-full blur-xl"></div>
          <div className="absolute bottom-32 right-20 w-48 h-48 bg-purple-300/20 rounded-full blur-2xl"></div>
          <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-purple-400/20 rounded-full blur-lg"></div>
          <div className="absolute bottom-20 left-32 w-20 h-20 bg-purple-300/30 rounded-full blur-lg"></div>
          
          {/* Content */}
          <div className="relative z-10 text-center max-w-md">
            {/* Animated Icon Container */}
            <div className="relative w-64 h-64 mx-auto mb-8">
              {/* Central Circle with Icon */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30 shadow-2xl">
                <div className="transition-all duration-500">
                  {loginSlides[loginSlide].icon}
                </div>
              </div>
              
              {/* Orbiting Elements */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-12 bg-white rounded-2xl shadow-xl flex items-center justify-center animate-pulse">
                <CalendarDays className="w-6 h-6 text-purple-500" />
              </div>
              
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-12 bg-white rounded-2xl shadow-xl flex items-center justify-center animate-pulse" style={{ animationDelay: '0.5s' }}>
                <CheckCircle className="w-6 h-6 text-green-500" />
              </div>
              
              <div className="absolute top-1/2 left-0 -translate-y-1/2 w-12 h-12 bg-white rounded-2xl shadow-xl flex items-center justify-center animate-pulse" style={{ animationDelay: '1s' }}>
                <TrendingUp className="w-6 h-6 text-blue-500" />
              </div>
              
              <div className="absolute top-1/2 right-0 -translate-y-1/2 w-12 h-12 bg-white rounded-2xl shadow-xl flex items-center justify-center animate-pulse" style={{ animationDelay: '1.5s' }}>
                <Users className="w-6 h-6 text-purple-500" />
              </div>
            </div>
            
            {/* Slider Text */}
            <div className="h-24 flex flex-col justify-center">
              <h2 className="text-2xl font-bold text-white mb-3 transition-all duration-500">
                {loginSlides[loginSlide].title}
              </h2>
              <p className="text-purple-100 text-sm transition-all duration-500">
                {loginSlides[loginSlide].desc}
              </p>
            </div>
            
            {/* Dots Indicator - Clickable */}
            <div className="flex items-center justify-center gap-2 mt-8">
              {loginSlides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setLoginSlide(idx)}
                  className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                    loginSlide === idx ? 'bg-white w-8' : 'bg-white/40 hover:bg-white/60'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navigation */}
      <nav className="fixed top-2 sm:top-4 md:top-6 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-4xl px-2 sm:px-4">
        <div className="bg-white/5 backdrop-blur-2xl rounded-full px-3 sm:px-6 md:px-8 py-2 sm:py-3 shadow-2xl border border-white/20 flex items-center justify-between">
          <a href="/" className="flex items-center gap-1 sm:gap-2 cursor-pointer transition flex-shrink-0 group">
            <div className="w-7 h-7 sm:w-9 sm:h-9 md:w-10 md:h-10 bg-gradient-to-br from-purple-400 to-purple-500 rounded-full flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 text-white" />
            </div>
            <span className="font-bold text-xs sm:text-sm md:text-base text-slate-900 tracking-tight hidden sm:inline">Lavender Villa Melaka</span>
          </a>
          <button onClick={handleLogout} className="text-slate-700 transition font-semibold cursor-pointer text-xs sm:text-sm md:text-base whitespace-nowrap px-2 sm:px-3 py-1.5 rounded-full hover:bg-white/30">Log Keluar</button>
        </div>
      </nav>

      {/* Header */}
      <div className="py-12 sm:py-16 pt-20 sm:pt-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold text-slate-900 mb-2">Admin Panel</h1>
          <p className="text-slate-500 text-sm sm:text-base">Mengurus tempahan untuk semua villa & homestay</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">

        {/* View Toggle - Scrollable on mobile */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:overflow-visible">
          <button
            onClick={() => setAdminView('dashboard')}
            className={`px-4 py-2.5 rounded-full text-sm font-semibold transition whitespace-nowrap flex items-center gap-2 ${
              adminView === 'dashboard'
                ? 'bg-purple-500 text-white shadow-lg shadow-purple-200'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span className="hidden sm:inline">Dashboard</span>
            <span className="sm:hidden">Home</span>
          </button>
          <button
            onClick={() => setAdminView('bookings')}
            className={`px-4 py-2.5 rounded-full text-sm font-semibold transition whitespace-nowrap flex items-center gap-2 ${
              adminView === 'bookings'
                ? 'bg-purple-500 text-white shadow-lg shadow-purple-200'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <ClipboardList className="w-4 h-4" />
            Tempahan
            {(getPendingCount() > 0 || getRefundCount() > 0) && (
              <span className="px-1.5 py-0.5 bg-yellow-400 text-yellow-900 rounded-full text-xs font-bold">
                {getPendingCount() + getRefundCount()}
              </span>
            )}
          </button>
          <button
            onClick={() => setAdminView('calendar')}
            className={`px-4 py-2.5 rounded-full text-sm font-semibold transition whitespace-nowrap flex items-center gap-2 ${
              adminView === 'calendar'
                ? 'bg-purple-500 text-white shadow-lg shadow-purple-200'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <CalendarDays className="w-4 h-4" />
            Kalendar
          </button>
        </div>

        {/* Dashboard View */}
        {adminView === 'dashboard' && (
          <div className="space-y-6">
            {/* Filter Panel */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Villa Filter */}
                <div className="relative">
                  <label className="block text-slate-500 text-xs mb-1.5 font-medium">Villa / Homestay</label>
                  <button
                    onClick={() => setShowVillaDropdown(showVillaDropdown === 'dashboard' ? null : 'dashboard')}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-base font-medium focus:outline-none focus:border-purple-400 transition text-left flex items-center justify-between"
                  >
                    <span>{chartPropertyFilter === 'all' ? 'Semua Villa' : properties.find(p => p.id === chartPropertyFilter)?.name}</span>
                    <ChevronRight className={`w-4 h-4 text-slate-400 transition-transform ${showVillaDropdown === 'dashboard' ? 'rotate-90' : ''}`} />
                  </button>
                  
                  {/* Custom Dropdown */}
                  {showVillaDropdown === 'dashboard' && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-slate-200 p-2 z-50 max-h-64 overflow-y-auto">
                      <button
                        onClick={() => { setChartPropertyFilter('all'); setShowVillaDropdown(null); }}
                        className={`w-full px-3 py-2.5 rounded-lg text-left text-sm font-medium transition ${chartPropertyFilter === 'all' ? 'bg-purple-100 text-purple-700' : 'hover:bg-slate-50 text-slate-700'}`}
                      >
                        Semua Villa
                      </button>
                      {properties.map(p => (
                        <button
                          key={p.id}
                          onClick={() => { setChartPropertyFilter(p.id); setShowVillaDropdown(null); }}
                          className={`w-full px-3 py-2.5 rounded-lg text-left text-sm font-medium transition ${chartPropertyFilter === p.id ? 'bg-purple-100 text-purple-700' : 'hover:bg-slate-50 text-slate-700'}`}
                        >
                          {p.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                
                {/* Month Navigation */}
                <div>
                  <label className="block text-slate-500 text-xs mb-1.5 font-medium">Bulan</label>
                  <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-xl px-2 py-1">
                    <button 
                      onClick={() => setAnalyticsMonth(new Date(analyticsMonth.getFullYear(), analyticsMonth.getMonth() - 1))}
                      className="p-1.5 hover:bg-slate-200 rounded-lg transition"
                    >
                      <ChevronLeft className="w-4 h-4 text-slate-600" />
                    </button>
                    <span className="font-semibold text-slate-900 flex-1 text-center text-sm">
                      {analyticsMonth.toLocaleDateString('ms-MY', { month: 'long', year: 'numeric' })}
                    </span>
                    <button 
                      onClick={() => setAnalyticsMonth(new Date(analyticsMonth.getFullYear(), analyticsMonth.getMonth() + 1))}
                      className="p-1.5 hover:bg-slate-200 rounded-lg transition"
                    >
                      <ChevronRight className="w-4 h-4 text-slate-600" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Key Metrics - 2 Row Layout */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Revenue - Big Card */}
              <div className="col-span-2 bg-gradient-to-br from-purple-400 to-purple-500 rounded-2xl p-6 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
                <div className="relative">
                  <p className="text-purple-100 text-sm font-medium mb-1">Pendapatan Bulan Ini</p>
                  <p className="text-4xl font-bold">RM {getSelectedMonthRevenue().toLocaleString()}</p>
                  <div className="flex items-center gap-4 mt-3">
                    <div className="flex items-center gap-1.5">
                      <CheckCircle className="w-4 h-4 text-purple-200" />
                      <span className="text-purple-100 text-sm">{getSelectedMonthBookingsByStatus('paid')} Dibayar</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-purple-200" />
                      <span className="text-purple-100 text-sm">{getSelectedMonthBookingsByStatus('pending')} Pending</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Total Bookings */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                    <ClipboardList className="w-5 h-5 text-purple-600" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-slate-900">{getSelectedMonthBookingsByStatus('all')}</p>
                <p className="text-slate-500 text-sm">Tempahan</p>
              </div>
              
              {/* Success Rate */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-green-600">{getSelectedMonthBookingsByStatus('all') > 0 ? Math.round((getSelectedMonthBookingsByStatus('paid') / getSelectedMonthBookingsByStatus('all')) * 100) : 0}%</p>
                <p className="text-slate-500 text-sm">Kadar Kejayaan</p>
              </div>
            </div>
            


            {/* Upcoming Check-ins */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200">
              <h3 className="font-bold text-slate-900 mb-4">Check-in Akan Datang (7 Hari)</h3>
              {(() => {
                const today = new Date();
                const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
                const upcoming = bookings.filter(b => {
                  const checkIn = new Date(b.checkIn);
                  return b.status === 'paid' && checkIn >= today && checkIn <= nextWeek;
                }).sort((a, b) => new Date(a.checkIn) - new Date(b.checkIn));
                
                if (upcoming.length === 0) {
                  return <p className="text-slate-400 text-sm">Tiada check-in dalam 7 hari akan datang</p>;
                }
                
                return (
                  <div className="space-y-3">
                    {upcoming.map(booking => (
                      <div key={booking.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                        <div>
                          <p className="font-semibold text-slate-900 text-sm">{booking.name}</p>
                          <p className="text-xs text-slate-500">{properties.find(p => p.id === booking.property)?.name || 'Lavender Villa'}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-purple-600">{new Date(booking.checkIn).toLocaleDateString('ms-MY', { day: 'numeric', month: 'short' })}</p>
                          <p className="text-xs text-slate-400">{booking.nights} malam</p>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>

            {/* Monthly Revenue & Bookings Line Chart */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-slate-900">Prestasi Dis 2025 - Dis 2026</h3>
                {chartPropertyFilter !== 'all' && (
                  <span className="text-xs bg-purple-100 text-purple-600 px-2 py-1 rounded-full font-medium">
                    {properties.find(p => p.id === chartPropertyFilter)?.name}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                  <span className="text-xs text-slate-500">Pendapatan (RM)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="text-xs text-slate-500">Tempahan</span>
                </div>
              </div>
              
              {(() => {
                const monthlyData = getMonthlyRevenue(chartPropertyFilter).map(item => {
                  const bookingCount = bookings.filter(b => b.status === 'paid' && b.checkIn && b.checkIn.startsWith(item.key) && (chartPropertyFilter === 'all' || b.property === chartPropertyFilter)).length;
                  return { ...item, bookings: bookingCount };
                });
                
                const maxRevenue = Math.max(...monthlyData.map(m => m.revenue), 1);
                const maxBookings = Math.max(...monthlyData.map(m => m.bookings), 1);
                const chartHeight = 160;
                
                // Calculate points for revenue line
                const revenuePoints = monthlyData.map((item, idx) => {
                  const x = (idx / (monthlyData.length - 1)) * 100;
                  const y = 100 - ((item.revenue / maxRevenue) * 100);
                  return { x, y, value: item.revenue };
                });
                
                // Calculate points for bookings line
                const bookingPoints = monthlyData.map((item, idx) => {
                  const x = (idx / (monthlyData.length - 1)) * 100;
                  const y = 100 - ((item.bookings / maxBookings) * 100);
                  return { x, y, value: item.bookings };
                });
                
                // Create SVG path for lines
                const createPath = (points) => {
                  if (points.length === 0) return '';
                  return points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
                };
                
                return (
                  <div className="relative">
                    {/* Y-axis labels */}
                    <div className="absolute left-0 top-0 bottom-8 w-12 flex flex-col justify-between text-right pr-2">
                      <span className="text-xs text-slate-400">{maxRevenue > 0 ? `${(maxRevenue/1000).toFixed(0)}k` : '0'}</span>
                      <span className="text-xs text-slate-400">{maxRevenue > 0 ? `${(maxRevenue/2000).toFixed(0)}k` : '0'}</span>
                      <span className="text-xs text-slate-400">0</span>
                    </div>
                    
                    {/* Chart area */}
                    <div className="ml-12">
                      <div className="relative" style={{ height: `${chartHeight}px` }}>
                        {/* Grid lines */}
                        <div className="absolute inset-0 flex flex-col justify-between">
                          <div className="border-b border-slate-100"></div>
                          <div className="border-b border-slate-100"></div>
                          <div className="border-b border-slate-200"></div>
                        </div>
                        
                        {/* SVG Chart */}
                        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                          {/* Revenue area fill */}
                          <path
                            d={`${createPath(revenuePoints)} L 100 100 L 0 100 Z`}
                            fill="url(#purpleGradient)"
                            opacity="0.2"
                          />
                          {/* Revenue line */}
                          <path
                            d={createPath(revenuePoints)}
                            fill="none"
                            stroke="#a855f7"
                            strokeWidth="2"
                            vectorEffect="non-scaling-stroke"
                          />
                          {/* Bookings line */}
                          <path
                            d={createPath(bookingPoints)}
                            fill="none"
                            stroke="#22c55e"
                            strokeWidth="2"
                            strokeDasharray="4 2"
                            vectorEffect="non-scaling-stroke"
                          />
                          {/* Gradient definition */}
                          <defs>
                            <linearGradient id="purpleGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                              <stop offset="0%" stopColor="#a855f7" />
                              <stop offset="100%" stopColor="#a855f7" stopOpacity="0" />
                            </linearGradient>
                          </defs>
                        </svg>
                        
                        {/* Data points - Revenue */}
                        {revenuePoints.map((point, idx) => (
                          <div
                            key={`rev-${idx}`}
                            className="absolute w-3 h-3 bg-purple-500 rounded-full border-2 border-white shadow-sm transform -translate-x-1/2 -translate-y-1/2 hover:scale-150 transition cursor-pointer group"
                            style={{ left: `${point.x}%`, top: `${point.y}%` }}
                          >
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap pointer-events-none">
                              RM {point.value.toLocaleString()}
                            </div>
                          </div>
                        ))}
                        
                        {/* Data points - Bookings */}
                        {bookingPoints.map((point, idx) => (
                          <div
                            key={`book-${idx}`}
                            className="absolute w-3 h-3 bg-green-500 rounded-full border-2 border-white shadow-sm transform -translate-x-1/2 -translate-y-1/2 hover:scale-150 transition cursor-pointer group"
                            style={{ left: `${point.x}%`, top: `${point.y}%` }}
                          >
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap pointer-events-none">
                              {point.value} tempahan
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      {/* X-axis labels */}
                      <div className="flex justify-between mt-2">
                        {monthlyData.map((item, idx) => (
                          <span key={idx} className={`text-xs font-medium ${idx === monthlyData.length - 1 ? 'text-purple-600' : 'text-slate-400'}`}>
                            {item.month}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    {/* Summary below chart */}
                    <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-slate-100">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-purple-600">RM {monthlyData.reduce((sum, m) => sum + m.revenue, 0).toLocaleString()}</p>
                        <p className="text-xs text-slate-500">Jumlah Pendapatan</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-green-600">{monthlyData.reduce((sum, m) => sum + m.bookings, 0)}</p>
                        <p className="text-xs text-slate-500">Jumlah Tempahan</p>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* WhatsApp Templates - Clean Grid */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200">
              <div className="flex items-center gap-2 mb-4">
                <Phone className="w-5 h-5 text-purple-500" />
                <h3 className="font-bold text-slate-900">Template Mesej WhatsApp</h3>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <button
                  onClick={() => { setEditingTemplate({ title: 'Pengesahan Tempahan', message: `🏡 *PENGESAHAN TEMPAHAN*\n\nTerima kasih kerana memilih Lavender Villa Melaka!\n\n✅ Tempahan anda telah disahkan.\n\n📅 Check-in: 3:00 PM\n📅 Check-out: 12:00 PM\n\nKami akan hantar maklumat lokasi dan peraturan villa sebelum tarikh check-in.\n\nSebarang pertanyaan, hubungi kami di sini.\n\nTerima kasih! 🙏` }); setShowTemplateModal(true); }}
                  className="flex flex-col items-center gap-2 p-4 bg-purple-50 border border-purple-200 rounded-xl hover:bg-purple-100 transition group"
                >
                  <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center group-hover:scale-110 transition">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xs font-medium text-purple-700 text-center">Pengesahan</span>
                </button>

                <button
                  onClick={() => { setEditingTemplate({ title: 'Lokasi & Arah', message: `📍 *LOKASI & ARAH*\n\nLavender Villa Melaka\nBemban, Melaka\n\n🗺️ Google Maps:\nhttps://maps.google.com/?q=Lavender+Villa+Melaka\n\n🚗 Dari Lebuhraya PLUS:\n1. Keluar di Exit Jasin\n2. Ikut papan tanda ke Bemban\n3. Villa terletak di sebelah kanan\n\n⏰ Check-in: 3:00 PM\n📞 Hubungi jika sesat!` }); setShowTemplateModal(true); }}
                  className="flex flex-col items-center gap-2 p-4 bg-purple-50 border border-purple-200 rounded-xl hover:bg-purple-100 transition group"
                >
                  <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center group-hover:scale-110 transition">
                    <Navigation className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xs font-medium text-purple-700 text-center">Lokasi</span>
                </button>

                <button
                  onClick={() => { setEditingTemplate({ title: 'Peraturan Villa', message: `📋 *PERATURAN VILLA*\n\n✅ DIBENARKAN:\n• Masak di dapur\n• BBQ di luar\n• Karaoke (sehingga 10PM)\n• Kolam renang\n\n❌ TIDAK DIBENARKAN:\n• Haiwan peliharaan\n• Merokok dalam rumah\n• Parti bising selepas 11PM\n• Tetamu tambahan tanpa maklum\n\n⚠️ DEPOSIT:\n• RM500 deposit kerosakan\n• Dipulangkan selepas pemeriksaan\n\nTerima kasih atas kerjasama! 🙏` }); setShowTemplateModal(true); }}
                  className="flex flex-col items-center gap-2 p-4 bg-purple-50 border border-purple-200 rounded-xl hover:bg-purple-100 transition group"
                >
                  <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center group-hover:scale-110 transition">
                    <ScrollText className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xs font-medium text-purple-700 text-center">Peraturan</span>
                </button>

                <button
                  onClick={() => { setEditingTemplate({ title: 'Peringatan Check-in', message: `⏰ *PERINGATAN CHECK-IN*\n\nHai! Ini peringatan untuk check-in anda esok.\n\n📅 Check-in: 3:00 PM\n📍 Lokasi: Lavender Villa Melaka, Bemban\n\n🔑 Kod pintu akan dihantar pada hari check-in.\n\n📞 Hubungi kami jika ada sebarang pertanyaan.\n\nJumpa esok! 👋` }); setShowTemplateModal(true); }}
                  className="flex flex-col items-center gap-2 p-4 bg-purple-50 border border-purple-200 rounded-xl hover:bg-purple-100 transition group"
                >
                  <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center group-hover:scale-110 transition">
                    <Bell className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xs font-medium text-purple-700 text-center">Peringatan</span>
                </button>

                <button
                  onClick={() => { setEditingTemplate({ title: 'Peringatan Check-out', message: `🏠 *PERINGATAN CHECK-OUT*\n\nHai! Ini peringatan untuk check-out hari ini.\n\n⏰ Masa Check-out: 12:00 PM\n\n✅ Senarai Semak Sebelum Keluar:\n• Pastikan semua pintu & tingkap dikunci\n• Matikan semua lampu & kipas\n• Matikan aircond\n• Buang sampah di tong luar\n• Letakkan kunci di tempat asal\n• Pastikan tiada barang tertinggal\n\n🔑 Sila pastikan kunci diletakkan semula di tempat yang ditetapkan.\n\nTerima kasih atas kerjasama! 🙏\nJumpa lagi di lain masa! 👋` }); setShowTemplateModal(true); }}
                  className="flex flex-col items-center gap-2 p-4 bg-purple-50 border border-purple-200 rounded-xl hover:bg-purple-100 transition group"
                >
                  <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center group-hover:scale-110 transition">
                    <Key className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xs font-medium text-purple-700 text-center">Check-out</span>
                </button>

                <button
                  onClick={() => { setEditingTemplate({ title: 'Terima Kasih', message: `🙏 *TERIMA KASIH*\n\nTerima kasih kerana menginap di Lavender Villa Melaka!\n\nKami harap anda dan keluarga menikmati penginapan.\n\n⭐ Jika berkenan, sila tinggalkan review di Google:\nhttps://g.page/r/lavendervillamelaka/review\n\nHubungi kami untuk tempahan akan datang. Jumpa lagi! 👋` }); setShowTemplateModal(true); }}
                  className="flex flex-col items-center gap-2 p-4 bg-purple-50 border border-purple-200 rounded-xl hover:bg-purple-100 transition group"
                >
                  <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center group-hover:scale-110 transition">
                    <Heart className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xs font-medium text-purple-700 text-center">Terima Kasih</span>
                </button>
              </div>
              
              <p className="text-slate-400 text-xs text-center mt-4">Klik untuk edit & salin mesej</p>
            </div>
          </div>
        )}

        {/* Calendar View */}
        {adminView === 'calendar' && (
          <>
            {/* Filter Panel */}
            <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200 shadow-sm mb-6">
              <div className="flex flex-col sm:flex-row sm:items-end gap-4">
                {/* Villa Dropdown */}
                <div className="flex-1">
                  <label className="block text-slate-500 text-xs mb-2 font-medium">Pilih Villa / Homestay</label>
                  <select
                    value={activeTab}
                    onChange={(e) => setActiveTab(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm font-semibold focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition"
                  >
                    {properties.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                {/* Property Info */}
                <div className="flex items-center gap-2 bg-purple-50 px-4 py-3 rounded-xl border border-purple-200">
                  <MapPin className="w-4 h-4 text-purple-500" />
                  <span className="text-sm font-medium text-purple-700">{activeProperty?.location}</span>
                </div>
              </div>
            </div>

        {/* Calendar */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-900">Pilih Tarikh Tidak Tersedia</h3>
            <button
              onClick={clearAllDates}
              className="text-sm text-slate-500 hover:text-red-500 transition flex items-center gap-1"
            >
              <Trash2 className="w-4 h-4" /> Padam Semua
            </button>
          </div>

          {/* Month Navigation */}
          <div className="flex items-center justify-between mb-6">
            <button 
              onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1))} 
              className="p-2 hover:bg-slate-100 rounded-lg transition"
            >
              <ChevronLeft className="w-5 h-5 text-slate-600" />
            </button>
            <span className="font-bold text-slate-900 text-lg">
              {calendarMonth.toLocaleDateString('ms-MY', { month: 'long', year: 'numeric' })}
            </span>
            <button 
              onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1))} 
              className="p-2 hover:bg-slate-100 rounded-lg transition"
            >
              <ChevronRight className="w-5 h-5 text-slate-600" />
            </button>
          </div>

          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2">
            {['Ah', 'Is', 'Se', 'Ra', 'Kh', 'Ju', 'Sa'].map(day => (
              <div key={day} className="text-center text-xs font-semibold text-slate-500 py-2">{day}</div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2">
            {(() => {
              const { daysInMonth, startingDay } = getDaysInMonth(calendarMonth);
              const days = [];
              for (let i = 0; i < startingDay; i++) {
                days.push(<div key={`empty-${i}`} />);
              }
              for (let day = 1; day <= daysInMonth; day++) {
                const date = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), day);
                const isBooked = isDateBooked(date);
                const isPaidBooking = isFromPaidBooking(date);
                const isManual = isManuallyBlocked(date);
                const holidayName = isPublicHoliday(date);
                days.push(
                  <button
                    key={day}
                    onClick={() => toggleDate(date)}
                    title={holidayName || ''}
                    className={`p-2 sm:p-4 text-xs sm:text-sm rounded-lg sm:rounded-xl transition font-medium relative ${
                      isPaidBooking 
                        ? 'bg-green-500 text-white' 
                        : isManual
                        ? 'bg-orange-500 text-white'
                        : holidayName
                        ? 'bg-purple-100 text-purple-700 border-2 border-purple-300'
                        : 'bg-slate-50 text-slate-700 hover:bg-orange-100'
                    }`}
                  >
                    {day}
                    {holidayName && !isPaidBooking && !isManual && (
                      <span className="absolute -top-1 -right-1 w-2 h-2 bg-purple-500 rounded-full"></span>
                    )}
                  </button>
                );
              }
              return days;
            })()}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap items-center gap-4 sm:gap-6 mt-6 pt-6 border-t border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-slate-50 rounded border border-slate-200"></div>
              <span className="text-xs sm:text-sm text-slate-600">Tersedia</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span className="text-xs sm:text-sm text-slate-600">Telah Bayar</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-orange-500 rounded"></div>
              <span className="text-xs sm:text-sm text-slate-600">Cuti / Tutup</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-purple-100 rounded border-2 border-purple-300 relative">
                <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-purple-500 rounded-full"></span>
              </div>
              <span className="text-xs sm:text-sm text-slate-600">Cuti Umum</span>
            </div>
          </div>
        </div>

        {/* Manual Blocked Dates List */}
        {(manualBlockedDates[activeTab] || []).length > 0 && (
          <div className="bg-white rounded-2xl p-6 mt-6 border border-slate-200 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Cuti / Tutup</h3>
            <div className="flex flex-wrap gap-2">
              {(manualBlockedDates[activeTab] || []).map(dateStr => {
                // Parse date string safely (YYYY-MM-DD format)
                const [year, month, day] = dateStr.split('-').map(Number);
                const displayDate = new Date(year, month - 1, day);
                return (
                  <div 
                    key={dateStr}
                    className="flex items-center gap-2 bg-orange-50 px-3 py-2 rounded-lg border border-orange-200"
                  >
                    <span className="text-sm text-orange-700 font-medium">
                      {displayDate.toLocaleDateString('ms-MY', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                    <button 
                      onClick={() => toggleManualBlockedDate(dateStr)}
                      className="text-orange-400 hover:text-orange-600 transition"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

            {/* Note */}
            <div className="mt-6 p-3 sm:p-4 bg-slate-50 rounded-xl border border-slate-200">
              <p className="text-slate-600 text-xs text-center">
                <span className="text-green-600 font-medium">Hijau</span> = Telah Bayar | 
                <span className="text-orange-600 font-medium"> Oren</span> = Cuti/Tutup | 
                <span className="text-purple-600 font-medium"> Ungu</span> = Cuti Umum | 
                Klik tarikh untuk tutup/buka
              </p>
            </div>
          </>
        )}

        {/* Bookings View */}
        {adminView === 'bookings' && (
          <div className="space-y-4">
            {bookings.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 border border-slate-200 shadow-sm text-center">
                <ClipboardList className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500 mb-4">Tiada tempahan lagi</p>
                <button
                  onClick={() => setShowAddBooking(true)}
                  className="px-4 py-2 rounded-full text-sm font-semibold transition bg-green-500 text-white hover:bg-green-600 inline-flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Tambah Tempahan
                </button>
              </div>
            ) : (
              <>
                {/* Filter Panel */}
                <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200 shadow-sm mb-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-slate-900 flex items-center gap-2">
                      <CalendarDays className="w-4 h-4 text-purple-500" />
                      Tapis Tempahan
                    </h3>
                    <div className="flex items-center gap-2">
                      {(bookingFilter !== 'all' || propertyFilter !== 'all' || dateFilterFrom || dateFilterTo) && (
                        <button 
                          onClick={clearAllFilters}
                          className="text-xs text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1"
                        >
                          <X className="w-3 h-3" /> Reset
                        </button>
                      )}
                      <button
                        onClick={() => setShowAddBooking(true)}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold transition bg-green-500 text-white hover:bg-green-600 flex items-center gap-1.5"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Tambah
                      </button>
                    </div>
                  </div>
                  
                  {/* Status Filter Buttons */}
                  <div className="flex gap-2 flex-wrap mb-4">
                    <span className="text-slate-400 text-xs self-center mr-1">Status:</span>
                    <button 
                      onClick={() => setBookingFilter('all')}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${bookingFilter === 'all' ? 'bg-purple-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                    >
                      Semua
                    </button>
                    <button 
                      onClick={() => setBookingFilter('pending')}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${bookingFilter === 'pending' ? 'bg-yellow-500 text-white' : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'}`}
                    >
                      Belum Bayar ({getPendingCount()})
                    </button>
                    <button 
                      onClick={() => setBookingFilter('paid')}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${bookingFilter === 'paid' ? 'bg-green-500 text-white' : 'bg-green-100 text-green-700 hover:bg-green-200'}`}
                    >
                      Telah Bayar ({getPaidCount()})
                    </button>
                    <button 
                      onClick={() => setBookingFilter('refund')}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${bookingFilter === 'refund' ? 'bg-orange-500 text-white' : 'bg-orange-100 text-orange-700 hover:bg-orange-200'}`}
                    >
                      Refund ({getRefundCount()})
                    </button>
                    <button 
                      onClick={() => setBookingFilter('cancelled')}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${bookingFilter === 'cancelled' ? 'bg-red-500 text-white' : 'bg-red-100 text-red-700 hover:bg-red-200'}`}
                    >
                      Dibatalkan ({getCancelledCount()})
                    </button>
                  </div>
                  
                  {/* Villa & Date Filters - Clean Grid Layout */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="relative">
                      <label className="block text-slate-500 text-xs mb-1.5">Villa / Homestay</label>
                      <button
                        onClick={() => setShowVillaDropdown(showVillaDropdown === 'bookings' ? null : 'bookings')}
                        className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-base font-medium focus:outline-none focus:border-purple-400 transition text-left flex items-center justify-between"
                      >
                        <span>{propertyFilter === 'all' ? 'Semua' : properties.find(p => p.id === propertyFilter)?.name}</span>
                        <ChevronRight className={`w-4 h-4 text-slate-400 transition-transform ${showVillaDropdown === 'bookings' ? 'rotate-90' : ''}`} />
                      </button>
                      
                      {/* Custom Dropdown */}
                      {showVillaDropdown === 'bookings' && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-slate-200 p-2 z-50 max-h-64 overflow-y-auto">
                          <button
                            onClick={() => { setPropertyFilter('all'); setShowVillaDropdown(null); }}
                            className={`w-full px-3 py-2.5 rounded-lg text-left text-sm font-medium transition ${propertyFilter === 'all' ? 'bg-purple-100 text-purple-700' : 'hover:bg-slate-50 text-slate-700'}`}
                          >
                            Semua
                          </button>
                          {properties.map(p => (
                            <button
                              key={p.id}
                              onClick={() => { setPropertyFilter(p.id); setShowVillaDropdown(null); }}
                              className={`w-full px-3 py-2.5 rounded-lg text-left text-sm font-medium transition ${propertyFilter === p.id ? 'bg-purple-100 text-purple-700' : 'hover:bg-slate-50 text-slate-700'}`}
                            >
                              {p.name}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="relative">
                      <label className="block text-slate-500 text-xs mb-1.5">Dari Tarikh</label>
                      <button
                        onClick={() => setShowDatePicker(showDatePicker === 'from' ? null : 'from')}
                        className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-base font-medium focus:outline-none focus:border-purple-400 transition text-left flex items-center justify-between"
                      >
                        <span className={dateFilterFrom ? 'text-slate-900' : 'text-slate-400'}>
                          {dateFilterFrom ? new Date(dateFilterFrom).toLocaleDateString('ms-MY', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Pilih tarikh'}
                        </span>
                        <CalendarDays className="w-4 h-4 text-slate-400" />
                      </button>
                      {dateFilterFrom && (
                        <button onClick={() => setDateFilterFrom('')} className="absolute right-8 top-8 p-1 hover:bg-slate-200 rounded-full">
                          <X className="w-3 h-3 text-slate-400" />
                        </button>
                      )}
                      
                      {/* Calendar Popup */}
                      {showDatePicker === 'from' && (
                        <div className="absolute top-full left-0 mt-2 bg-white rounded-xl shadow-xl border border-slate-200 p-4 z-50 w-72">
                          <div className="flex items-center justify-between mb-4">
                            <button onClick={() => setDatePickerMonth(new Date(datePickerMonth.getFullYear(), datePickerMonth.getMonth() - 1))} className="p-2 hover:bg-slate-100 rounded-lg">
                              <ChevronLeft className="w-4 h-4 text-slate-600" />
                            </button>
                            <span className="font-bold text-slate-900 text-sm">{datePickerMonth.toLocaleDateString('ms-MY', { month: 'long', year: 'numeric' })}</span>
                            <button onClick={() => setDatePickerMonth(new Date(datePickerMonth.getFullYear(), datePickerMonth.getMonth() + 1))} className="p-2 hover:bg-slate-100 rounded-lg">
                              <ChevronRight className="w-4 h-4 text-slate-600" />
                            </button>
                          </div>
                          <div className="grid grid-cols-7 gap-1 mb-2">
                            {['Ah', 'Is', 'Se', 'Ra', 'Kh', 'Ju', 'Sa'].map(d => (
                              <div key={d} className="text-center text-xs font-semibold text-slate-500 py-1">{d}</div>
                            ))}
                          </div>
                          <div className="grid grid-cols-7 gap-1">
                            {(() => {
                              const year = datePickerMonth.getFullYear();
                              const month = datePickerMonth.getMonth();
                              const firstDay = new Date(year, month, 1).getDay();
                              const daysInMonth = new Date(year, month + 1, 0).getDate();
                              const days = [];
                              for (let i = 0; i < firstDay; i++) days.push(<div key={`e-${i}`} />);
                              for (let day = 1; day <= daysInMonth; day++) {
                                const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                                const isSelected = dateFilterFrom === dateStr;
                                days.push(
                                  <button
                                    key={day}
                                    onClick={() => { setDateFilterFrom(dateStr); setShowDatePicker(null); }}
                                    className={`p-2 text-sm rounded-lg transition ${isSelected ? 'bg-purple-500 text-white font-bold' : 'hover:bg-purple-100 text-slate-700'}`}
                                  >
                                    {day}
                                  </button>
                                );
                              }
                              return days;
                            })()}
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="relative">
                      <label className="block text-slate-500 text-xs mb-1.5">Hingga Tarikh</label>
                      <button
                        onClick={() => setShowDatePicker(showDatePicker === 'to' ? null : 'to')}
                        className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-base font-medium focus:outline-none focus:border-purple-400 transition text-left flex items-center justify-between"
                      >
                        <span className={dateFilterTo ? 'text-slate-900' : 'text-slate-400'}>
                          {dateFilterTo ? new Date(dateFilterTo).toLocaleDateString('ms-MY', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Pilih tarikh'}
                        </span>
                        <CalendarDays className="w-4 h-4 text-slate-400" />
                      </button>
                      {dateFilterTo && (
                        <button onClick={() => setDateFilterTo('')} className="absolute right-8 top-8 p-1 hover:bg-slate-200 rounded-full">
                          <X className="w-3 h-3 text-slate-400" />
                        </button>
                      )}
                      
                      {/* Calendar Popup */}
                      {showDatePicker === 'to' && (
                        <div className="absolute top-full left-0 mt-2 bg-white rounded-xl shadow-xl border border-slate-200 p-4 z-50 w-72">
                          <div className="flex items-center justify-between mb-4">
                            <button onClick={() => setDatePickerMonth(new Date(datePickerMonth.getFullYear(), datePickerMonth.getMonth() - 1))} className="p-2 hover:bg-slate-100 rounded-lg">
                              <ChevronLeft className="w-4 h-4 text-slate-600" />
                            </button>
                            <span className="font-bold text-slate-900 text-sm">{datePickerMonth.toLocaleDateString('ms-MY', { month: 'long', year: 'numeric' })}</span>
                            <button onClick={() => setDatePickerMonth(new Date(datePickerMonth.getFullYear(), datePickerMonth.getMonth() + 1))} className="p-2 hover:bg-slate-100 rounded-lg">
                              <ChevronRight className="w-4 h-4 text-slate-600" />
                            </button>
                          </div>
                          <div className="grid grid-cols-7 gap-1 mb-2">
                            {['Ah', 'Is', 'Se', 'Ra', 'Kh', 'Ju', 'Sa'].map(d => (
                              <div key={d} className="text-center text-xs font-semibold text-slate-500 py-1">{d}</div>
                            ))}
                          </div>
                          <div className="grid grid-cols-7 gap-1">
                            {(() => {
                              const year = datePickerMonth.getFullYear();
                              const month = datePickerMonth.getMonth();
                              const firstDay = new Date(year, month, 1).getDay();
                              const daysInMonth = new Date(year, month + 1, 0).getDate();
                              const days = [];
                              for (let i = 0; i < firstDay; i++) days.push(<div key={`e-${i}`} />);
                              for (let day = 1; day <= daysInMonth; day++) {
                                const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                                const isSelected = dateFilterTo === dateStr;
                                days.push(
                                  <button
                                    key={day}
                                    onClick={() => { setDateFilterTo(dateStr); setShowDatePicker(null); }}
                                    className={`p-2 text-sm rounded-lg transition ${isSelected ? 'bg-purple-500 text-white font-bold' : 'hover:bg-purple-100 text-slate-700'}`}
                                  >
                                    {day}
                                  </button>
                                );
                              }
                              return days;
                            })()}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Bookings List - Compact Table Style */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  {getFilteredBookings().length === 0 ? (
                    <div className="p-8 text-center">
                      <p className="text-slate-500">Tiada tempahan</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100">
                      {getFilteredBookings().sort((a, b) => new Date(a.checkIn) - new Date(b.checkIn)).map(booking => (
                        <div key={booking.id} className="p-3 sm:p-4 hover:bg-slate-50 transition">
                          {/* Row 1: Name, Villa, Dates, Price, Status */}
                          <div className="flex items-center gap-3 mb-2">
                            {/* Status Indicator */}
                            <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                              booking.status === 'paid' ? 'bg-green-500' :
                              booking.status === 'refund' ? 'bg-orange-500' :
                              booking.status === 'cancelled' ? 'bg-red-500' :
                              'bg-yellow-500'
                            }`}></div>
                            
                            {/* Name & Phone */}
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-semibold text-slate-900 text-sm">{booking.name}</span>
                                <span className="text-slate-400 text-xs hidden sm:inline">•</span>
                                <span className="text-slate-500 text-xs">{booking.phone}</span>
                                <span className="text-slate-300 text-xs hidden sm:inline">•</span>
                                <span className="text-slate-400 text-xs font-mono hidden sm:inline">{booking.id}</span>
                              </div>
                              <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                                <span className="text-purple-600 font-medium">{properties.find(p => p.id === booking.property)?.name?.replace(' Melaka', '') || 'Lavender Villa'}</span>
                                <span>•</span>
                                <span>{new Date(booking.checkIn).toLocaleDateString('ms-MY', { day: 'numeric', month: 'short' })} - {new Date(booking.checkOut).toLocaleDateString('ms-MY', { day: 'numeric', month: 'short' })}</span>
                                <span>•</span>
                                <span>{booking.nights} malam</span>
                              </div>
                            </div>
                            
                            {/* Price */}
                            <div className="text-right flex-shrink-0">
                              <p className="font-bold text-slate-900">RM {booking.total?.toLocaleString()}</p>
                              <span className={`text-xs font-medium ${
                                booking.status === 'paid' ? 'text-green-600' :
                                booking.status === 'refund' ? 'text-orange-600' :
                                booking.status === 'cancelled' ? 'text-red-600' :
                                'text-yellow-600'
                              }`}>
                                {booking.status === 'paid' ? 'Bayar ✓' :
                                 booking.status === 'refund' ? 'Refund' :
                                 booking.status === 'cancelled' ? 'Batal' :
                                 'Belum'}
                              </span>
                            </div>
                          </div>
                          
                          {/* Row 2: Actions */}
                          <div className="flex items-center gap-2 ml-5 flex-wrap">
                            {booking.status === 'pending' && (
                              <button
                                onClick={() => handleUpdateBookingStatus(booking.id, 'paid')}
                                className="px-3 py-1.5 bg-green-500 text-white rounded-lg text-xs font-medium hover:bg-green-600 transition"
                              >
                                ✓ Sahkan
                              </button>
                            )}
                            {booking.status === 'paid' && (
                              <>
                                <button
                                  onClick={() => generateReceipt(booking)}
                                  className="px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-xs font-medium hover:bg-green-200 transition flex items-center gap-1"
                                >
                                  <FileText className="w-3.5 h-3.5" />
                                  Resit
                                </button>
                                <button
                                  onClick={() => handleUpdateBookingStatus(booking.id, 'refund')}
                                  className="px-3 py-1.5 bg-orange-100 text-orange-700 rounded-lg text-xs font-medium hover:bg-orange-200 transition"
                                >
                                  Refund
                                </button>
                              </>
                            )}
                            {booking.status === 'refund' && (
                              <button
                                onClick={() => handleUpdateBookingStatus(booking.id, 'cancelled')}
                                className="px-3 py-1.5 bg-green-500 text-white rounded-lg text-xs font-medium hover:bg-green-600 transition"
                              >
                                ✓ Refund Selesai
                              </button>
                            )}
                            {(booking.status === 'pending') && (
                              <button
                                onClick={() => handleUpdateBookingStatus(booking.id, 'cancelled')}
                                className="px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg text-xs font-medium hover:bg-slate-200 transition"
                              >
                                Batal
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteBooking(booking.id)}
                              className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-medium hover:bg-red-100 transition"
                            >
                              Padam
                            </button>
                            <div className="relative group">
                              <a
                                href={`https://wa.me/${booking.phone?.replace(/^0/, '60')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-3 py-1.5 bg-purple-100 text-purple-700 rounded-lg text-xs font-medium hover:bg-purple-200 transition inline-flex items-center gap-1"
                              >
                                <Phone className="w-3 h-3" />
                                WhatsApp
                              </a>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}


      </div>

      {/* Add Booking Modal */}
      {showAddBooking && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold">Tambah Tempahan</h2>
                  <p className="text-purple-100 text-xs sm:text-sm mt-1">Masukkan maklumat tempahan pelanggan</p>
                </div>
                <button onClick={() => setShowAddBooking(false)} className="p-2 hover:bg-white/20 rounded-xl transition">
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {/* Property Selection - Card Style */}
              <div className="mb-6">
                <label className="block text-slate-700 font-semibold mb-3 text-sm">Pilih Villa / Homestay</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {properties.map(p => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setNewBooking({...newBooking, property: p.id})}
                      className={`p-3 rounded-xl text-left transition border-2 ${
                        newBooking.property === p.id 
                          ? 'border-purple-500 bg-purple-50' 
                          : 'border-slate-200 hover:border-purple-300 hover:bg-slate-50'
                      }`}
                    >
                      <p className={`font-semibold text-xs sm:text-sm ${newBooking.property === p.id ? 'text-purple-700' : 'text-slate-700'}`}>
                        {p.name.replace(' Melaka', '').replace(' Villa', '')}
                      </p>
                      <p className="text-slate-400 text-xs mt-0.5">{p.location}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Customer Info Section */}
              <div className="bg-slate-50 rounded-2xl p-4 mb-4">
                <h3 className="font-semibold text-slate-700 mb-3 flex items-center gap-2">
                  <Users className="w-4 h-4 text-purple-500" /> Maklumat Pelanggan
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-500 text-xs mb-1">Nama Penuh</label>
                    <input
                      type="text"
                      value={newBooking.name}
                      onChange={(e) => setNewBooking({...newBooking, name: e.target.value})}
                      placeholder="Ahmad bin Ali"
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-300 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 text-xs mb-1">No. Telefon</label>
                    <input
                      type="tel"
                      value={newBooking.phone}
                      onChange={(e) => setNewBooking({...newBooking, phone: e.target.value})}
                      placeholder="0123456789"
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-300 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Booking Details Section */}
              <div className="bg-slate-50 rounded-2xl p-4 mb-4">
                <h3 className="font-semibold text-slate-700 mb-3 flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-purple-500" /> Butiran Tempahan
                </h3>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="block text-slate-500 text-xs mb-1">Daftar Masuk</label>
                    <input
                      type="date"
                      value={newBooking.checkIn}
                      onChange={(e) => setNewBooking({...newBooking, checkIn: e.target.value})}
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 text-xs mb-1">Daftar Keluar</label>
                    <input
                      type="date"
                      value={newBooking.checkOut}
                      onChange={(e) => setNewBooking({...newBooking, checkOut: e.target.value})}
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition text-sm"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-500 text-xs mb-1">Tetamu</label>
                    <input
                      type="number"
                      min="1"
                      max="30"
                      value={newBooking.guests}
                      onChange={(e) => setNewBooking({...newBooking, guests: parseInt(e.target.value) || 1})}
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition text-sm text-center"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 text-xs mb-1">Harga (RM)</label>
                    <input
                      type="number"
                      min="0"
                      value={newBooking.total}
                      onChange={(e) => setNewBooking({...newBooking, total: parseInt(e.target.value) || 0})}
                      placeholder="1300"
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-300 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition text-sm text-center"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 text-xs mb-1">Status</label>
                    <select
                      value={newBooking.status}
                      onChange={(e) => setNewBooking({...newBooking, status: e.target.value})}
                      className="w-full px-3 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition text-sm"
                    >
                      <option value="pending">Pending</option>
                      <option value="paid">Paid</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-slate-500 text-xs mb-1">Nota (Pilihan)</label>
                <textarea
                  value={newBooking.message}
                  onChange={(e) => setNewBooking({...newBooking, message: e.target.value})}
                  placeholder="Sebarang nota atau permintaan khas..."
                  rows={2}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-300 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition resize-none text-sm"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex gap-3">
              <button
                onClick={() => setShowAddBooking(false)}
                className="flex-1 py-3 bg-white text-slate-700 rounded-xl font-semibold hover:bg-slate-100 transition border border-slate-200"
              >
                Batal
              </button>
              <button
                onClick={handleAddBooking}
                className="flex-1 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl font-semibold hover:from-purple-600 hover:to-purple-700 transition shadow-lg shadow-purple-500/30"
              >
                <Plus className="w-4 h-4 inline mr-2" />
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Template Edit Modal */}
      {showTemplateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-hidden shadow-2xl">
            <div className="bg-purple-500 p-4 text-white flex items-center justify-between">
              <h3 className="font-bold">{editingTemplate.title}</h3>
              <button onClick={() => setShowTemplateModal(false)} className="p-1 hover:bg-white/20 rounded-lg transition">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4">
              <label className="block text-slate-500 text-xs mb-2">Edit mesej sebelum salin:</label>
              <textarea
                value={editingTemplate.message}
                onChange={(e) => setEditingTemplate({ ...editingTemplate, message: e.target.value })}
                rows={12}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition resize-none font-mono"
              />
            </div>
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex gap-3">
              <button
                onClick={() => setShowTemplateModal(false)}
                className="flex-1 py-3 bg-white text-slate-700 rounded-xl font-semibold hover:bg-slate-100 transition border border-slate-200"
              >
                Batal
              </button>
              <button
                onClick={() => { navigator.clipboard.writeText(editingTemplate.message); alert('Mesej disalin!'); setShowTemplateModal(false); }}
                className="flex-1 py-3 bg-purple-500 text-white rounded-xl font-semibold hover:bg-purple-600 transition flex items-center justify-center gap-2"
              >
                <Copy className="w-4 h-4" />
                Salin Mesej
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
