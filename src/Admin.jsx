import { useState, useEffect } from 'react';
import { Sparkles, X, Trash2, ChevronLeft, ChevronRight, MapPin, TrendingUp, Users, CalendarDays, Lock, Eye, EyeOff, Phone, CheckCircle, Clock, XCircle, ClipboardList, Plus, FileText, Send, Navigation, ScrollText, Bell, Key, Heart, Copy, Wallet, Edit3 } from 'lucide-react';
import { adminLogin, updateAdminPassword, getAllBookings, updateBookingStatus, deleteBooking, getBookedDates, addBlockedDate, removeBlockedDate, getManuallyBlockedDates, getWhatsAppTemplates, saveWhatsAppTemplate, deleteWhatsAppTemplate } from './lib/database';
import { supabase } from './lib/supabase';

// Villa Logo
const VillaIcon = ({ className }) => (
  <img 
    src="/images/logo.jpg" 
    alt="Lavender Villa" 
    className={`${className} rounded-full object-cover`}
  />
);

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
  const [editingTemplate, setEditingTemplate] = useState({ title: '', message: '', key: '' });
  const [showEditDateModal, setShowEditDateModal] = useState(false);

  // Default WhatsApp templates
  const defaultTemplates = {
    pengesahan: `🏡 *PENGESAHAN TEMPAHAN*\n\nTerima kasih kerana memilih Lavender Villa Melaka!\n\n✅ Tempahan anda telah disahkan.\n\n📅 Check-in: 3:00 PM\n📅 Check-out: 12:00 PM\n\n💰 *BAYARAN*\n• Deposit: RM300 (RM500 untuk majlis)\n• Bayaran penuh: Selewat-lewatnya 5 hari sebelum check-in\n\n⚠️ *PERATURAN PENTING*\n\n*PEMBATALAN TEMPAHAN*\nPembatalan tempahan akan menyebabkan deposit tidak dipulangkan.\n\n*PERTUKARAN TARIKH*\n• Hendaklah dibuat sebulan sebelum tarikh check-in\n• Hanya sekali sahaja pertukaran tarikh dibenarkan\n\nKami akan hantar maklumat lokasi dan peraturan villa sebelum tarikh check-in.\n\nSebarang pertanyaan, hubungi kami.\n\nTerima kasih! 🙏`,
    lokasi: `📍 *LOKASI & ARAH*\n\nLavender Villa Melaka\n47, Jalan Anjung Lavender 1,\nTaman Anjung Gapam,\n77200 Bemban, Melaka\n\n🗺️ Google Maps:\nhttps://maps.google.com/?q=Lavender+Villa+Melaka\n\n🚗 Dari Plaza Tol Ayer Keroh:\nHanya 8-10 minit sahaja!\n\n⏰ Check-in: 3:00 PM\n📞 Hubungi 019-334 5686 jika sesat!`,
    peraturan: `📋 *PERATURAN VILLA*\n\n👨‍👩‍👧‍👦 *TETAMU*\n• Ahli keluarga mahram atau kumpulan sama jantina sahaja\n• Percampuran lelaki & wanita bukan mahram TIDAK dibenarkan\n• Ideal 15 orang, maksimum 20 orang\n\n🍽️ *MAKANAN*\n• Makanan & minuman HALAL sahaja\n\n✅ *DIBENARKAN*\n• Masak di dapur\n• BBQ di luar\n• Karaoke (sehingga 10PM)\n• Kolam renang (tiada lifeguard)\n\n❌ *TIDAK DIBENARKAN*\n• Haiwan peliharaan\n• Merokok dalam rumah\n• Parti bising selepas 11PM\n\n💰 *DEPOSIT*\n• RM300 tempahan biasa\n• RM500 untuk majlis (pertunangan/akikah)\n• Dipulangkan dalam 24 jam selepas check-out\n\n💳 *BAYARAN PENUH*\n• Selewat-lewatnya 5 hari sebelum check-in\n\n⚠️ *PEMBATALAN TEMPAHAN*\nPembatalan tempahan akan menyebabkan deposit tidak dipulangkan.\n\n📅 *PERTUKARAN TARIKH*\n• Hendaklah dibuat sebulan sebelum tarikh check-in\n• Hanya sekali sahaja pertukaran tarikh dibenarkan\n\nTerima kasih! 🙏`,
    peringatan: `⏰ *PERINGATAN CHECK-IN*\n\nHai! Ini peringatan untuk check-in anda esok.\n\n📅 Check-in: 3:00 PM\n📍 Lokasi: Lavender Villa Melaka\n47, Jalan Anjung Lavender 1, Taman Anjung Gapam, 77200 Bemban\n\n📞 Hubungi 019-334 5686 jika ada pertanyaan.\n\nJumpa esok! 👋`,
    checkout: `🏠 *PERINGATAN CHECK-OUT*\n\nHai! Ini peringatan untuk check-out hari ini.\n\n⏰ Masa Check-out: 12:00 PM\n\n✅ Senarai Semak Sebelum Keluar:\n• Pastikan semua pintu & tingkap dikunci\n• Matikan semua lampu & kipas\n• Matikan aircond\n• Buang sampah di tong luar\n• Letakkan kunci di tempat asal\n• Pastikan tiada barang tertinggal\n\n🔑 Sila pastikan kunci diletakkan semula di tempat yang ditetapkan.\n\n💰 Deposit akan dipulangkan dalam 24 jam jika tiada kerosakan.\n\nTerima kasih! 🙏\nJumpa lagi! 👋`,
    terimakasih: `🙏 *TERIMA KASIH*\n\nTerima kasih kerana menginap di Lavender Villa Melaka!\n\nKami harap anda dan keluarga menikmati penginapan.\n\n⭐ Jika berkenan, sila tinggalkan review di Google:\nhttps://g.page/r/lavendervillamelaka/review\n\nHubungi kami untuk tempahan akan datang.\n📞 019-334 5686\n\nJumpa lagi! 👋`
  };

  // Saved templates state (loaded from Supabase + localStorage fallback)
  const [savedTemplates, setSavedTemplates] = useState({});

  // Load templates from Supabase on mount
  useEffect(() => {
    const loadTemplates = async () => {
      try {
        const templates = await getWhatsAppTemplates();
        if (Object.keys(templates).length > 0) {
          setSavedTemplates(templates);
          // Also save to localStorage as backup
          localStorage.setItem('whatsappTemplates', JSON.stringify(templates));
        } else {
          // Fallback to localStorage
          const saved = localStorage.getItem('whatsappTemplates');
          if (saved) setSavedTemplates(JSON.parse(saved));
        }
      } catch (error) {
        console.error('Error loading templates:', error);
        // Fallback to localStorage
        const saved = localStorage.getItem('whatsappTemplates');
        if (saved) setSavedTemplates(JSON.parse(saved));
      }
    };
    loadTemplates();
  }, []);

  // Get template (saved or default)
  const getTemplate = (key) => savedTemplates[key] || defaultTemplates[key];

  // Save template to Supabase + localStorage
  const saveTemplate = async (key, message) => {
    const updated = { ...savedTemplates, [key]: message };
    setSavedTemplates(updated);
    localStorage.setItem('whatsappTemplates', JSON.stringify(updated));
    
    try {
      await saveWhatsAppTemplate(key, message);
    } catch (error) {
      console.error('Error saving to Supabase:', error);
    }
  };

  // Reset template to default
  const resetTemplate = async (key) => {
    const updated = { ...savedTemplates };
    delete updated[key];
    setSavedTemplates(updated);
    localStorage.setItem('whatsappTemplates', JSON.stringify(updated));
    setEditingTemplate({ ...editingTemplate, message: defaultTemplates[key] });
    
    try {
      await deleteWhatsAppTemplate(key);
    } catch (error) {
      console.error('Error deleting from Supabase:', error);
    }
  };

  const [editingBooking, setEditingBooking] = useState(null);
  const [newCheckIn, setNewCheckIn] = useState('');
  const [newCheckOut, setNewCheckOut] = useState('');
  const [editDateCalendarMonth, setEditDateCalendarMonth] = useState(new Date());
  const [editDateStep, setEditDateStep] = useState('checkIn'); // 'checkIn' or 'checkOut'

  // Check if already logged in with session token validation
  useEffect(() => {
    const session = sessionStorage.getItem('adminLoggedIn');
    const sessionTime = sessionStorage.getItem('adminSessionTime');
    const sessionToken = sessionStorage.getItem('adminSessionToken');
    const now = Date.now();
    
    // Session timeout: 30 minutes
    if (session === 'true' && sessionTime && sessionToken) {
      const elapsed = now - parseInt(sessionTime);
      // Validate session token format (should be a hash)
      const isValidToken = sessionToken && sessionToken.length === 64;
      
      if (elapsed > 30 * 60 * 1000 || !isValidToken) {
        // Session expired or invalid
        sessionStorage.removeItem('adminLoggedIn');
        sessionStorage.removeItem('adminSessionTime');
        sessionStorage.removeItem('adminSessionToken');
        sessionStorage.removeItem('adminUser');
        setIsLoggedIn(false);
      } else {
        setIsLoggedIn(true);
        // Refresh session time on activity
        sessionStorage.setItem('adminSessionTime', now.toString());
      }
    }
  }, []);

  // Generate a simple session token
  const generateSessionToken = () => {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  };

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
      const sessionToken = generateSessionToken();
      setIsLoggedIn(true);
      sessionStorage.setItem('adminLoggedIn', 'true');
      sessionStorage.setItem('adminSessionTime', Date.now().toString());
      sessionStorage.setItem('adminSessionToken', sessionToken);
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
        const sessionToken = generateSessionToken();
        setIsLoggedIn(true);
        sessionStorage.setItem('adminLoggedIn', 'true');
        sessionStorage.setItem('adminSessionTime', Date.now().toString());
        sessionStorage.setItem('adminSessionToken', sessionToken);
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
    sessionStorage.removeItem('adminSessionToken');
    sessionStorage.removeItem('adminUser');
    setUsername('');
    setPassword('');
  };
  
  const properties = [
    { id: 'lavender', name: 'Lavender Villa Melaka', location: 'Bemban, Jasin', address: '47, Jalan Anjung Lavender 1, Taman Anjung Gapam, 77200 Bemban, Melaka', code: 'VLM' },
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
                Untuk pertanyaan: WhatsApp 019-334 5686
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
        const newManualBlockedDates = {};
        
        try {
          const lavenderDates = await getBookedDates('lavender');
          newBookedDates['lavender'] = lavenderDates;
          
          // Also load manually blocked dates from Supabase
          const manualBlocked = await getManuallyBlockedDates('lavender');
          newManualBlockedDates['lavender'] = manualBlocked;
        } catch {
          newBookedDates['lavender'] = [];
          newManualBlockedDates['lavender'] = [];
        }
        
        // Initialize other properties as empty (not in database yet)
        properties.forEach(p => {
          if (!newBookedDates[p.id]) {
            newBookedDates[p.id] = [];
          }
          if (!newManualBlockedDates[p.id]) {
            // Load from localStorage for other properties
            const saved = localStorage.getItem(`manualBlocked_${p.id}`);
            newManualBlockedDates[p.id] = saved ? JSON.parse(saved) : [];
          }
        });
        
        setBookedDates(newBookedDates);
        setManualBlockedDates(newManualBlockedDates);
        
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
        
        setManualBlockedDates(manualDates);
        
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

  // Sync booked dates based on paid/deposit bookings + manual blocked dates
  const syncBookedDates = (allBookings, manualDates = manualBlockedDates) => {
    const newBookedDates = {};
    properties.forEach(p => {
      // Start with manual blocked dates
      newBookedDates[p.id] = [...(manualDates[p.id] || [])];
    });
    
    // Add dates from all PAID or DEPOSIT bookings (both block dates)
    allBookings.forEach(booking => {
      if ((booking.status === 'paid' || booking.status === 'deposit') && booking.checkIn && booking.checkOut) {
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

  // Open edit date modal
  const openEditDateModal = (booking) => {
    setEditingBooking(booking);
    setNewCheckIn(booking.checkIn);
    setNewCheckOut(booking.checkOut);
    setEditDateCalendarMonth(new Date(booking.checkIn));
    setEditDateStep('checkIn');
    setShowEditDateModal(true);
  };

  // Calculate nights for edit date
  const calculateEditNights = () => {
    if (newCheckIn && newCheckOut) {
      const start = new Date(newCheckIn);
      const end = new Date(newCheckOut);
      const nights = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
      return nights > 0 ? nights : 0;
    }
    return 0;
  };

  // Check if new dates are available (excluding current booking's dates)
  const checkEditDateAvailability = () => {
    if (!newCheckIn || !newCheckOut || !editingBooking) return false;
    
    const newDates = getDatesBetween(newCheckIn, newCheckOut);
    const currentDates = getDatesBetween(editingBooking.checkIn, editingBooking.checkOut);
    const propertyId = editingBooking.property || 'lavender';
    
    // Get all booked dates except current booking's dates
    const otherBookedDates = (bookedDates[propertyId] || []).filter(d => !currentDates.includes(d));
    
    // Check if any new date conflicts
    return !newDates.some(d => otherBookedDates.includes(d));
  };

  // Handle edit date save
  const handleEditDateSave = async () => {
    if (!editingBooking || !newCheckIn || !newCheckOut) return;
    
    if (!checkEditDateAvailability()) {
      alert('Tarikh yang dipilih tidak tersedia. Sila pilih tarikh lain.');
      return;
    }

    const nights = calculateEditNights();
    if (nights < 1) {
      alert('Sila pilih tarikh yang sah.');
      return;
    }

    try {
      // Update in Supabase if we have dbId
      if (editingBooking.dbId) {
        await supabase
          .from('bookings')
          .update({ 
            check_in: newCheckIn, 
            check_out: newCheckOut,
            nights: nights,
            date_changed: true
          })
          .eq('id', editingBooking.dbId);
      }
    } catch (error) {
      console.error('Error updating dates in Supabase:', error);
    }

    // Update local state
    const updatedBookings = bookings.map(b => 
      b.id === editingBooking.id 
        ? { ...b, checkIn: newCheckIn, checkOut: newCheckOut, nights: nights, dateChanged: true } 
        : b
    );
    setBookings(updatedBookings);
    localStorage.setItem('bookings', JSON.stringify(updatedBookings));
    syncBookedDates(updatedBookings);

    // Close modal
    setShowEditDateModal(false);
    setEditingBooking(null);
  };

  // Get bookings count by status
  const getPendingCount = () => bookings.filter(b => (b.status || 'pending') === 'pending').length;
  const getPaidCount = () => bookings.filter(b => b.status === 'paid').length;
  const getRefundCount = () => bookings.filter(b => b.status === 'refund').length;
  const getCancelledCount = () => bookings.filter(b => b.status === 'cancelled').length;
  
  // Get bookings count by status for ACTIVE view only (checkout >= today)
  const getActivePendingCount = () => {
    const todayStr = getTodayStr();
    return bookings.filter(b => b.checkOut >= todayStr && (b.status || 'pending') === 'pending').length;
  };
  const getActiveDepositCount = () => {
    const todayStr = getTodayStr();
    return bookings.filter(b => b.checkOut >= todayStr && b.status === 'deposit').length;
  };
  const getActivePaidCount = () => {
    const todayStr = getTodayStr();
    return bookings.filter(b => b.checkOut >= todayStr && b.status === 'paid').length;
  };
  const getActiveRefundCount = () => {
    const todayStr = getTodayStr();
    return bookings.filter(b => b.checkOut >= todayStr && b.status === 'refund').length;
  };
  const getActiveCancelledCount = () => {
    const todayStr = getTodayStr();
    return bookings.filter(b => b.checkOut >= todayStr && b.status === 'cancelled').length;
  };
  
  // Get bookings count by status for HISTORY view only (checkout < today)
  const getHistoryPendingCount = () => {
    const todayStr = getTodayStr();
    return bookings.filter(b => b.checkOut < todayStr && (b.status || 'pending') === 'pending').length;
  };
  const getHistoryPaidCount = () => {
    const todayStr = getTodayStr();
    return bookings.filter(b => b.checkOut < todayStr && b.status === 'paid').length;
  };
  const getHistoryRefundCount = () => {
    const todayStr = getTodayStr();
    return bookings.filter(b => b.checkOut < todayStr && b.status === 'refund').length;
  };
  const getHistoryCancelledCount = () => {
    const todayStr = getTodayStr();
    return bookings.filter(b => b.checkOut < todayStr && b.status === 'cancelled').length;
  };
  
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
  const [addBookingCalendar, setAddBookingCalendar] = useState(null); // 'checkIn' or 'checkOut'
  const [addBookingMonth, setAddBookingMonth] = useState(new Date());
  const [newBooking, setNewBooking] = useState({
    name: '',
    phone: '',
    property: 'lavender',
    checkIn: '',
    checkOut: '',
    guests: 15,
    total: 0,
    message: '',
    status: 'pending',
    referralSource: ''
  });

  // Custom prices state (host can override default pricing)
  const [customPrices, setCustomPrices] = useState(() => {
    const saved = localStorage.getItem('customPrices_lavender');
    return saved ? JSON.parse(saved) : {};
  });
  const [showPriceModal, setShowPriceModal] = useState(false);
  const [editingPriceDate, setEditingPriceDate] = useState(null);
  const [editingPrice, setEditingPrice] = useState('');

  // Save custom prices to localStorage
  useEffect(() => {
    localStorage.setItem('customPrices_lavender', JSON.stringify(customPrices));
  }, [customPrices]);

  // Get price for a specific date (custom or calculated)
  const getPriceForDate = (date) => {
    const dateStr = formatDateStr(date);
    
    // Check for custom price first
    if (customPrices[dateStr]) {
      return { price: customPrices[dateStr], isCustom: true };
    }
    
    // Calculate based on day type
    // Weekend NIGHTS are Friday (5) and Saturday (6) - these are the nights you stay
    // Weekend DAYS are Saturday (6) and Sunday (0) - for min stay requirement
    const dayOfWeek = date.getDay();
    const isWeekendNight = dayOfWeek === 5 || dayOfWeek === 6; // Friday & Saturday nights for pricing
    const isWeekendDay = dayOfWeek === 0 || dayOfWeek === 6; // Saturday & Sunday for min stay
    const isHoliday = publicHolidays[dateStr];
    const isFestive = festiveDates.includes(dateStr);
    
    // ALL weekends require min 3H2M (2 nights)
    const requiresMinStayForDay = isWeekendDay;
    
    if (isFestive) {
      return { price: 1700, isCustom: false, type: 'festive', minStay: requiresMinStayForDay ? 2 : 1 };
    }
    if (isWeekendNight || isHoliday) {
      return { price: 1590, isCustom: false, type: 'weekend', minStay: requiresMinStayForDay ? 2 : 1 };
    }
    return { price: 1300, isCustom: false, type: 'weekday', minStay: 1 };
  };

  // Check if a date requires minimum 2 nights (ALL weekends require 3H2M)
  // Weekend = Saturday (6) or Sunday (0)
  const requiresMinStay = (date) => {
    const dayOfWeek = date.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6; // Saturday & Sunday
    return isWeekend;
  };

  // Set custom price for a date
  const setCustomPrice = (dateStr, price) => {
    if (price && price > 0) {
      setCustomPrices(prev => ({ ...prev, [dateStr]: parseInt(price) }));
    } else {
      // Remove custom price (revert to calculated)
      setCustomPrices(prev => {
        const updated = { ...prev };
        delete updated[dateStr];
        return updated;
      });
    }
  };

  // Open price edit modal
  const openPriceModal = (date) => {
    const dateStr = formatDateStr(date);
    setEditingPriceDate(dateStr);
    const priceInfo = getPriceForDate(date);
    setEditingPrice(priceInfo.price.toString());
    setShowPriceModal(true);
  };

  // Save price from modal
  const savePriceFromModal = () => {
    if (editingPriceDate && editingPrice) {
      const defaultPrice = getPriceForDate(new Date(editingPriceDate + 'T00:00:00'));
      if (parseInt(editingPrice) === defaultPrice.price && !defaultPrice.isCustom) {
        // Same as default, remove custom
        setCustomPrice(editingPriceDate, null);
      } else {
        setCustomPrice(editingPriceDate, editingPrice);
      }
    }
    setShowPriceModal(false);
    setEditingPriceDate(null);
    setEditingPrice('');
  };

  // Festive dates for pricing
  const festiveDates = [
    '2025-03-30', '2025-03-31', '2025-04-01', // Hari Raya 2025
    '2025-06-06', '2025-06-07', // Hari Raya Haji 2025
    '2025-10-20', // Deepavali 2025
    '2025-12-24', '2025-12-25', // Christmas 2025
    '2026-01-29', '2026-01-30', // CNY 2026
    '2026-03-20', '2026-03-21', '2026-03-22', // Hari Raya 2026
    '2026-11-08', // Deepavali 2026
    '2026-12-24', '2026-12-25' // Christmas 2026
  ];

  // School holidays date ranges (Kumpulan B - Melaka)
  const schoolHolidayRanges = [
    { start: '2025-05-29', end: '2025-06-09', name: 'Cuti Penggal 1' },
    { start: '2025-09-13', end: '2025-09-21', name: 'Cuti Penggal 2' },
    { start: '2025-12-20', end: '2026-01-11', name: 'Cuti Akhir Tahun' },
    { start: '2026-02-16', end: '2026-02-20', name: 'Cuti Tahun Baru Cina' },
    { start: '2026-03-19', end: '2026-03-29', name: 'Cuti Hari Raya' },
    { start: '2026-05-23', end: '2026-06-07', name: 'Cuti Pertengahan Tahun' },
    { start: '2026-08-29', end: '2026-09-06', name: 'Cuti Penggal 2' },
    { start: '2026-11-08', end: '2026-11-10', name: 'Cuti Deepavali' },
    { start: '2026-12-05', end: '2026-12-31', name: 'Cuti Akhir Tahun' }
  ];

  // Check if date is school holiday
  const isSchoolHoliday = (date) => {
    const dateStr = formatDateStr(date);
    for (const range of schoolHolidayRanges) {
      if (dateStr >= range.start && dateStr <= range.end) {
        return range.name;
      }
    }
    return null;
  };

  // Calculate price for add booking - ONLY for Lavender Villa
  // Other villas require manual price input
  const calculateAddBookingPrice = (checkIn, checkOut, propertyId) => {
    // Only auto-calculate for Lavender Villa
    if (propertyId !== 'lavender') return 0;
    
    if (!checkIn || !checkOut) return 0;
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const nights = Math.round((end - start) / (1000 * 60 * 60 * 24));
    if (nights <= 0) return 0;

    let hasFestive = false;
    let hasWeekendOrHoliday = false;

    for (let d = new Date(start); d < end; d.setDate(d.getDate() + 1)) {
      const dateStr = formatDateStr(d);
      if (festiveDates.includes(dateStr)) hasFestive = true;
      const dayOfWeek = d.getDay();
      // Weekend NIGHTS are Friday (5) and Saturday (6) - these are the nights you stay
      if (dayOfWeek === 5 || dayOfWeek === 6 || publicHolidays[dateStr]) hasWeekendOrHoliday = true;
    }

    if (hasFestive) {
      if (nights === 1) return 1700;
      if (nights === 2) return 3200;
      return 3200 + ((nights - 2) * 1700);
    }
    if (hasWeekendOrHoliday) {
      if (nights === 1) return 1590;
      if (nights === 2) return 2990;
      return 2990 + ((nights - 2) * 1590);
    }
    if (nights === 1) return 1300;
    if (nights === 2) return 2400;
    return 2400 + ((nights - 2) * 1300);
  };

  // Check if date is booked for add booking modal
  const isDateBookedForAdd = (date, propertyId) => {
    const dateStr = formatDateStr(date);
    return (bookedDates[propertyId] || []).includes(dateStr);
  };

  // Add new booking
  const handleAddBooking = async () => {
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
      referralSource: newBooking.referralSource,
      createdAt: new Date().toISOString()
    };

    // Save to Supabase first
    try {
      // Get property ID from Supabase
      const { data: prop } = await supabase
        .from('properties')
        .select('id')
        .eq('slug', newBooking.property)
        .single();
      
      if (prop) {
        const { data: dbBooking, error } = await supabase
          .from('bookings')
          .insert({
            booking_code: bookingId,
            property_id: prop.id,
            customer_name: newBooking.name.trim(),
            customer_phone: newBooking.phone.trim(),
            check_in: newBooking.checkIn,
            check_out: newBooking.checkOut,
            nights: nights,
            guests: newBooking.guests,
            total_amount: newBooking.total || 0,
            special_requests: newBooking.message.trim(),
            referral_source: newBooking.referralSource,
            status: newBooking.status
          })
          .select()
          .single();
        
        if (error) {
          console.error('Error saving to Supabase:', error);
        } else if (dbBooking) {
          // Add the database ID to the booking
          booking.dbId = dbBooking.id;
        }
      }
    } catch (error) {
      console.error('Error saving to Supabase:', error);
    }

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
      status: 'pending',
      referralSource: ''
    });
    setShowAddBooking(false);
  };
  
  // Get today's date string for comparison
  const getTodayStr = () => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  };

  // Get filtered bookings (current/upcoming only - checkout >= today)
  const getFilteredBookings = () => {
    const todayStr = getTodayStr();
    let filtered = bookings.filter(b => b.checkOut >= todayStr); // Only current/upcoming
    
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

  // Get history bookings (past only - checkout < today)
  const getHistoryBookings = () => {
    const todayStr = getTodayStr();
    let filtered = bookings.filter(b => b.checkOut < todayStr); // Only past bookings
    
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

  // Get occupancy rate for selected month (percentage of days booked)
  const getOccupancyRate = () => {
    const monthKey = getAnalyticsMonthKey();
    const year = analyticsMonth.getFullYear();
    const month = analyticsMonth.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    // Count booked nights for paid bookings in this month
    let bookedNights = 0;
    bookings
      .filter(b => b.status === 'paid' && b.checkIn)
      .forEach(b => {
        const checkIn = new Date(b.checkIn);
        const checkOut = new Date(b.checkOut);
        
        // Count nights that fall within the selected month
        for (let d = new Date(checkIn); d < checkOut; d.setDate(d.getDate() + 1)) {
          const dateMonth = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
          if (dateMonth === monthKey) {
            bookedNights++;
          }
        }
      });
    
    return daysInMonth > 0 ? Math.round((bookedNights / daysInMonth) * 100) : 0;
  };

  // Get monthly revenue from Jan to Dec of selected year (12 months)
  const getMonthlyRevenue = (propertyId = 'all') => {
    const months = [];
    const selectedYear = analyticsMonth.getFullYear();
    // Start from January to December
    for (let i = 0; i < 12; i++) {
      const date = new Date(selectedYear, i, 1); // 0 = January (0-indexed)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthName = date.toLocaleDateString('ms-MY', { month: 'short' });
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
              <div className="w-10 h-10 rounded-xl overflow-hidden border-2 border-purple-200">
                <VillaIcon className="w-full h-full" />
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
      {/* Navigation - Static header for admin */}
      <nav className="w-full bg-white shadow-sm border-b border-slate-200 px-4 sm:px-6 py-2 sm:py-3">
        <div className="flex items-center justify-between">
          <a href="/" className="flex items-center gap-1.5 sm:gap-2 cursor-pointer transition flex-shrink-0 group">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full overflow-hidden shadow-md shadow-purple-500/30 group-hover:shadow-lg group-hover:shadow-purple-500/40 transition-shadow border-2 border-purple-200">
              <VillaIcon className="w-full h-full" />
            </div>
            <span className="font-bold text-sm sm:text-base text-slate-900 tracking-tight">Pengurusan</span>
          </a>
          <div className="flex items-center gap-2 sm:gap-3">
            <a href="/" className="text-slate-600 hover:text-purple-600 transition-colors font-medium cursor-pointer text-xs sm:text-sm whitespace-nowrap px-3 py-2 rounded-lg hover:bg-purple-50 hidden sm:flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" />
              Laman Utama
            </a>
            <button onClick={handleLogout} className="bg-red-500 hover:bg-red-600 text-white font-semibold cursor-pointer text-xs sm:text-sm whitespace-nowrap px-3 sm:px-4 py-2 rounded-lg transition-all active:scale-95 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Log Keluar</span>
              <span className="sm:hidden">Keluar</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Header */}
      <div className="py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold text-slate-900 mb-2">Pengurusan Tempahan</h1>
          <p className="text-slate-500 text-sm sm:text-base">Mengurus tempahan untuk semua villa & homestay</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">

        {/* View Toggle - Scrollable on mobile */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:overflow-visible scrollbar-hide">
          <button
            onClick={() => setAdminView('dashboard')}
            className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-semibold transition whitespace-nowrap flex items-center gap-1.5 sm:gap-2 ${
              adminView === 'dashboard'
                ? 'bg-purple-500 text-white shadow-lg shadow-purple-200'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Dashboard</span>
            <span className="sm:hidden">Home</span>
          </button>
          <button
            onClick={() => setAdminView('bookings')}
            className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-semibold transition whitespace-nowrap flex items-center gap-1.5 sm:gap-2 ${
              adminView === 'bookings'
                ? 'bg-purple-500 text-white shadow-lg shadow-purple-200'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <ClipboardList className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            Tempahan
          </button>
          <button
            onClick={() => setAdminView('history')}
            className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-semibold transition whitespace-nowrap flex items-center gap-1.5 sm:gap-2 ${
              adminView === 'history'
                ? 'bg-purple-500 text-white shadow-lg shadow-purple-200'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            History
          </button>
          <button
            onClick={() => setAdminView('calendar')}
            className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-semibold transition whitespace-nowrap flex items-center gap-1.5 sm:gap-2 ${
              adminView === 'calendar'
                ? 'bg-purple-500 text-white shadow-lg shadow-purple-200'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <CalendarDays className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
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
                <p className="text-3xl font-bold text-slate-900">{getSelectedMonthBookingsByStatus('paid')}</p>
                <p className="text-slate-500 text-sm">Tempahan</p>
              </div>
              
              {/* Occupancy Rate */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                    <CalendarDays className="w-5 h-5 text-blue-600" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-blue-600">{getOccupancyRate()}%</p>
                <p className="text-slate-500 text-sm">Kadar Penghunian</p>
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
                          {booking.createdAt && (
                            <p className="text-xs text-slate-400">Ditempah: {new Date(booking.createdAt).toLocaleDateString('ms-MY', { day: 'numeric', month: 'short' })} {new Date(booking.createdAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}</p>
                          )}
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
                <h3 className="font-bold text-slate-900">Prestasi Jan - Dis {analyticsMonth.getFullYear()}</h3>
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

            {/* Referral Source Chart */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200">
              <div className="flex items-center gap-2 mb-4">
                <Users className="w-5 h-5 text-purple-500" />
                <h3 className="font-bold text-slate-900">Dari Mana Pelanggan Tahu?</h3>
              </div>
              
              {(() => {
                // Count referral sources from all bookings
                const referralLabels = {
                  'tiktok': { label: 'TikTok', color: 'bg-pink-500', bgLight: 'bg-pink-100', text: 'text-pink-600' },
                  'instagram': { label: 'Instagram', color: 'bg-purple-500', bgLight: 'bg-purple-100', text: 'text-purple-600' },
                  'facebook': { label: 'Facebook', color: 'bg-blue-500', bgLight: 'bg-blue-100', text: 'text-blue-600' },
                  'google': { label: 'Google', color: 'bg-red-500', bgLight: 'bg-red-100', text: 'text-red-600' },
                  'kawan': { label: 'Kawan', color: 'bg-green-500', bgLight: 'bg-green-100', text: 'text-green-600' },
                  'saudara': { label: 'Saudara', color: 'bg-orange-500', bgLight: 'bg-orange-100', text: 'text-orange-600' },
                  'lain': { label: 'Lain-lain', color: 'bg-slate-500', bgLight: 'bg-slate-100', text: 'text-slate-600' }
                };
                
                const sourceCounts = {};
                let totalWithSource = 0;
                
                bookings.forEach(b => {
                  if (b.referralSource) {
                    sourceCounts[b.referralSource] = (sourceCounts[b.referralSource] || 0) + 1;
                    totalWithSource++;
                  }
                });
                
                // Sort by count descending
                const sortedSources = Object.entries(sourceCounts)
                  .sort((a, b) => b[1] - a[1]);
                
                const maxCount = sortedSources.length > 0 ? sortedSources[0][1] : 1;
                
                if (sortedSources.length === 0) {
                  return (
                    <div className="text-center py-8">
                      <Users className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                      <p className="text-slate-400 text-sm">Tiada data sumber pelanggan</p>
                      <p className="text-slate-300 text-xs mt-1">Data akan muncul apabila pelanggan mengisi borang tempahan</p>
                    </div>
                  );
                }
                
                return (
                  <div className="space-y-3">
                    {sortedSources.map(([source, count]) => {
                      const info = referralLabels[source] || referralLabels['lain'];
                      const percentage = Math.round((count / totalWithSource) * 100);
                      const barWidth = Math.round((count / maxCount) * 100);
                      
                      return (
                        <div key={source} className="group">
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <div className={`w-3 h-3 rounded-full ${info.color}`}></div>
                              <span className="text-sm font-medium text-slate-700">{info.label}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`text-sm font-bold ${info.text}`}>{count}</span>
                              <span className="text-xs text-slate-400">({percentage}%)</span>
                            </div>
                          </div>
                          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div 
                              className={`h-full ${info.color} rounded-full transition-all duration-500`}
                              style={{ width: `${barWidth}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                    
                    {/* Total */}
                    <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-sm text-slate-500">Jumlah Respons</span>
                      <span className="text-lg font-bold text-slate-900">{totalWithSource}</span>
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
                  onClick={() => { setEditingTemplate({ title: 'Pengesahan Tempahan', message: getTemplate('pengesahan'), key: 'pengesahan' }); setShowTemplateModal(true); }}
                  className="flex flex-col items-center gap-2 p-4 bg-purple-50 border border-purple-200 rounded-xl hover:bg-purple-100 transition group"
                >
                  <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center group-hover:scale-110 transition">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xs font-medium text-purple-700 text-center">Pengesahan</span>
                </button>

                <button
                  onClick={() => { setEditingTemplate({ title: 'Lokasi & Arah', message: getTemplate('lokasi'), key: 'lokasi' }); setShowTemplateModal(true); }}
                  className="flex flex-col items-center gap-2 p-4 bg-purple-50 border border-purple-200 rounded-xl hover:bg-purple-100 transition group"
                >
                  <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center group-hover:scale-110 transition">
                    <Navigation className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xs font-medium text-purple-700 text-center">Lokasi</span>
                </button>

                <button
                  onClick={() => { setEditingTemplate({ title: 'Peraturan Villa', message: getTemplate('peraturan'), key: 'peraturan' }); setShowTemplateModal(true); }}
                  className="flex flex-col items-center gap-2 p-4 bg-purple-50 border border-purple-200 rounded-xl hover:bg-purple-100 transition group"
                >
                  <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center group-hover:scale-110 transition">
                    <ScrollText className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xs font-medium text-purple-700 text-center">Peraturan</span>
                </button>

                <button
                  onClick={() => { setEditingTemplate({ title: 'Peringatan Check-in', message: getTemplate('peringatan'), key: 'peringatan' }); setShowTemplateModal(true); }}
                  className="flex flex-col items-center gap-2 p-4 bg-purple-50 border border-purple-200 rounded-xl hover:bg-purple-100 transition group"
                >
                  <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center group-hover:scale-110 transition">
                    <Bell className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xs font-medium text-purple-700 text-center">Peringatan</span>
                </button>

                <button
                  onClick={() => { setEditingTemplate({ title: 'Peringatan Check-out', message: getTemplate('checkout'), key: 'checkout' }); setShowTemplateModal(true); }}
                  className="flex flex-col items-center gap-2 p-4 bg-purple-50 border border-purple-200 rounded-xl hover:bg-purple-100 transition group"
                >
                  <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center group-hover:scale-110 transition">
                    <Key className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xs font-medium text-purple-700 text-center">Check-out</span>
                </button>

                <button
                  onClick={() => { setEditingTemplate({ title: 'Terima Kasih', message: getTemplate('terimakasih'), key: 'terimakasih' }); setShowTemplateModal(true); }}
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

        {/* History View - Past Bookings */}
        {adminView === 'history' && (
          <div className="space-y-4">
            {/* Filter Panel - Always visible */}
            <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200 shadow-sm overflow-visible">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-slate-900 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-purple-500" />
                  Sejarah Tempahan
                </h3>
                {(bookingFilter !== 'all' || propertyFilter !== 'all' || dateFilterFrom || dateFilterTo) && (
                  <button 
                    onClick={clearAllFilters}
                    className="text-xs text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1"
                  >
                    <X className="w-3 h-3" /> Reset
                  </button>
                )}
              </div>
              
              {/* Status Filter Buttons - Horizontal Scroll on Mobile */}
              <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap scrollbar-hide mb-4">
                <button 
                  onClick={() => setBookingFilter('all')}
                  className={`px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${bookingFilter === 'all' ? 'bg-purple-500 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                >
                  Semua
                </button>
                <button 
                  onClick={() => setBookingFilter('pending')}
                  className={`px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 ${bookingFilter === 'pending' ? 'bg-yellow-500 text-white shadow-md' : 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100 border border-yellow-200'}`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  Belum
                </button>
                <button 
                  onClick={() => setBookingFilter('deposit')}
                  className={`px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 ${bookingFilter === 'deposit' ? 'bg-blue-500 text-white shadow-md' : 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200'}`}
                >
                  <Wallet className="w-3.5 h-3.5" />
                  Deposit
                </button>
                <button 
                  onClick={() => setBookingFilter('paid')}
                  className={`px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 ${bookingFilter === 'paid' ? 'bg-green-500 text-white shadow-md' : 'bg-green-50 text-green-700 hover:bg-green-100 border border-green-200'}`}
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  Selesai
                </button>
                <button 
                  onClick={() => setBookingFilter('refund')}
                  className={`px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 ${bookingFilter === 'refund' ? 'bg-orange-500 text-white shadow-md' : 'bg-orange-50 text-orange-700 hover:bg-orange-100 border border-orange-200'}`}
                >
                  <Wallet className="w-3.5 h-3.5" />
                  Refund
                </button>
                <button 
                  onClick={() => setBookingFilter('cancelled')}
                  className={`px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${bookingFilter === 'cancelled' ? 'bg-red-500 text-white shadow-md' : 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200'}`}
                >
                  Batal
                </button>
              </div>
              
              {/* Villa Filter */}
              <div className="relative">
                <label className="block text-slate-500 text-xs mb-1.5">Villa / Homestay</label>
                <button
                  onClick={() => setShowVillaDropdown(showVillaDropdown === 'history' ? null : 'history')}
                  className="w-full sm:w-64 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm sm:text-base font-medium focus:outline-none focus:border-purple-400 transition text-left flex items-center justify-between"
                >
                  <span>{propertyFilter === 'all' ? 'Semua Villa' : properties.find(p => p.id === propertyFilter)?.name}</span>
                  <ChevronRight className={`w-4 h-4 text-slate-400 transition-transform ${showVillaDropdown === 'history' ? 'rotate-90' : ''}`} />
                </button>
                
                {showVillaDropdown === 'history' && (
                  <div className="absolute top-full left-0 right-0 sm:right-auto sm:w-64 mt-2 bg-white rounded-xl shadow-xl border border-slate-200 p-2 z-50 max-h-64 overflow-y-auto">
                    <button
                      onClick={() => { setPropertyFilter('all'); setShowVillaDropdown(null); }}
                      className={`w-full px-3 py-2.5 rounded-lg text-left text-sm font-medium transition ${propertyFilter === 'all' ? 'bg-purple-100 text-purple-700' : 'hover:bg-slate-50 text-slate-700'}`}
                    >
                      Semua Villa
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
            </div>

            {/* History List or Empty State */}
            {getHistoryBookings().length === 0 ? (
              <div className="bg-white rounded-2xl p-8 sm:p-12 border border-slate-200 shadow-sm text-center">
                <Clock className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500 text-sm sm:text-base">
                  {bookingFilter !== 'all' 
                    ? `Tiada tempahan "${bookingFilter === 'paid' ? 'Selesai' : bookingFilter === 'cancelled' ? 'Dibatalkan' : 'Refund'}" dalam sejarah`
                    : 'Tiada sejarah tempahan'}
                </p>
                {bookingFilter !== 'all' && (
                  <button 
                    onClick={() => setBookingFilter('all')}
                    className="mt-3 text-purple-600 text-sm font-medium hover:text-purple-700"
                  >
                    Lihat semua sejarah →
                  </button>
                )}
              </div>
            ) : (
              <>
                {/* History List - Improved Cards matching Bookings view */}
                <div className="space-y-3">
                  {getHistoryBookings().sort((a, b) => new Date(b.checkIn) - new Date(a.checkIn)).map(booking => (
                    <div 
                      key={booking.id} 
                      className={`bg-white rounded-2xl border-2 shadow-sm overflow-hidden transition-all hover:shadow-md ${
                        booking.status === 'pending' ? 'border-yellow-300' :
                        booking.status === 'deposit' ? 'border-blue-300' :
                        booking.status === 'paid' ? 'border-green-200' :
                        booking.status === 'refund' ? 'border-orange-300' :
                        booking.status === 'cancelled' ? 'border-red-200' :
                        'border-slate-200'
                      }`}
                    >
                      {/* Status Header Bar */}
                      <div className={`px-4 py-2 flex items-center justify-between ${
                        booking.status === 'pending' ? 'bg-yellow-50' :
                        booking.status === 'deposit' ? 'bg-blue-50' :
                        booking.status === 'paid' ? 'bg-green-50' :
                        booking.status === 'refund' ? 'bg-orange-50' :
                        booking.status === 'cancelled' ? 'bg-red-50' :
                        'bg-slate-50'
                      }`}>
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${
                            booking.status === 'pending' ? 'bg-yellow-500' :
                            booking.status === 'deposit' ? 'bg-blue-500' :
                            booking.status === 'paid' ? 'bg-green-500' :
                            booking.status === 'refund' ? 'bg-orange-500' :
                            booking.status === 'cancelled' ? 'bg-red-500' :
                            'bg-slate-400'
                          }`}></span>
                          <span className={`text-xs font-bold uppercase tracking-wide ${
                            booking.status === 'pending' ? 'text-yellow-700' :
                            booking.status === 'deposit' ? 'text-blue-700' :
                            booking.status === 'paid' ? 'text-green-700' :
                            booking.status === 'refund' ? 'text-orange-700' :
                            booking.status === 'cancelled' ? 'text-red-700' :
                            'text-slate-500'
                          }`}>
                            {booking.status === 'pending' ? 'Belum Bayar' :
                             booking.status === 'deposit' ? 'Deposit' :
                             booking.status === 'paid' ? 'Selesai' :
                             booking.status === 'refund' ? 'Refund' :
                             booking.status === 'cancelled' ? 'Dibatalkan' :
                             'Belum'}
                          </span>
                        </div>
                        <span className="text-xs text-slate-400 font-mono">{booking.id}</span>
                      </div>
                      
                      {/* Card Content */}
                      <div className="p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3 min-w-0 flex-1">
                            <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                              booking.status === 'pending' ? 'bg-yellow-100' :
                              booking.status === 'deposit' ? 'bg-blue-100' :
                              booking.status === 'paid' ? 'bg-green-100' :
                              booking.status === 'refund' ? 'bg-orange-100' :
                              booking.status === 'cancelled' ? 'bg-red-100' :
                              'bg-slate-100'
                            }`}>
                              <span className={`text-sm sm:text-base font-bold ${
                                booking.status === 'pending' ? 'text-yellow-600' :
                                booking.status === 'deposit' ? 'text-blue-600' :
                                booking.status === 'paid' ? 'text-green-600' :
                                booking.status === 'refund' ? 'text-orange-600' :
                                booking.status === 'cancelled' ? 'text-red-600' :
                                'text-slate-500'
                              }`}>{booking.name?.charAt(0)?.toUpperCase()}</span>
                            </div>
                            <div className="min-w-0 flex-1">
                              <h4 className="font-bold text-slate-900 text-base">{booking.name}</h4>
                              <div className="text-xs text-slate-500 mt-1">
                                <span className="text-purple-600 font-medium">{properties.find(p => p.id === booking.property)?.name?.replace(' Melaka', '') || 'Lavender Villa'}</span>
                              </div>
                              {/* Mobile: Stack vertically with icons */}
                              <div className="flex flex-col gap-1 mt-2 sm:hidden">
                                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                  <CalendarDays className="w-3.5 h-3.5 text-slate-400" />
                                  <span>{new Date(booking.checkIn).toLocaleDateString('ms-MY', { day: 'numeric', month: 'short', year: 'numeric' })} → {new Date(booking.checkOut).toLocaleDateString('ms-MY', { day: 'numeric', month: 'short' })}</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                                  <span>{booking.nights} malam</span>
                                </div>
                              </div>
                              {/* Desktop: Single line */}
                              <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500 mt-1 flex-wrap">
                                <CalendarDays className="w-3.5 h-3.5" />
                                <span>{new Date(booking.checkIn).toLocaleDateString('ms-MY', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                <span>→</span>
                                <span>{new Date(booking.checkOut).toLocaleDateString('ms-MY', { day: 'numeric', month: 'short' })}</span>
                                <span className="text-slate-300">•</span>
                                <span>{booking.nights} malam</span>
                              </div>
                              {booking.createdAt && (
                                <div className="text-xs text-slate-400 mt-1">
                                  Ditempah: {new Date(booking.createdAt).toLocaleDateString('ms-MY', { day: 'numeric', month: 'short', year: 'numeric' })} {new Date(booking.createdAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                                </div>
                              )}
                            </div>
                          </div>
                          
                          {/* Price */}
                          <div className="text-right flex-shrink-0">
                            <p className="font-bold text-slate-900 text-base sm:text-lg">RM {booking.total?.toLocaleString()}</p>
                          </div>
                        </div>
                        
                        {/* Actions */}
                        <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-100">
                          <a
                            href={`tel:${booking.phone}`}
                            className="flex-1 sm:flex-none px-3 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-medium hover:bg-slate-200 transition flex items-center justify-center gap-1.5"
                          >
                            <Phone className="w-3.5 h-3.5" />
                            <span>{booking.phone}</span>
                          </a>
                          <a
                            href={`https://wa.me/${booking.phone?.replace(/^0/, '60')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-2 bg-green-100 text-green-700 rounded-xl text-xs font-medium hover:bg-green-200 transition flex items-center gap-1.5"
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">WhatsApp</span>
                          </a>
                          <button
                            onClick={() => generateReceipt(booking)}
                            className="px-3 py-2 bg-purple-100 text-purple-700 rounded-xl text-xs font-medium hover:bg-purple-200 transition flex items-center gap-1.5"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Resit</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Summary */}
                <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 text-sm">Jumlah</span>
                    <span className="font-bold text-slate-900">{getHistoryBookings().length} tempahan</span>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Calendar View */}
        {adminView === 'calendar' && (
          <>
            {/* Filter Panel */}
            <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200 shadow-sm mb-6">
              <div className="flex flex-col sm:flex-row sm:items-end gap-4">
                {/* Villa Dropdown - Custom styled like dashboard/bookings */}
                <div className="flex-1 relative">
                  <label className="block text-slate-500 text-xs mb-1.5 font-medium">Villa / Homestay</label>
                  <button
                    onClick={() => setShowVillaDropdown(showVillaDropdown === 'calendar' ? null : 'calendar')}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-base font-medium focus:outline-none focus:border-purple-400 transition text-left flex items-center justify-between"
                  >
                    <span>{properties.find(p => p.id === activeTab)?.name || 'Pilih Villa'}</span>
                    <ChevronRight className={`w-4 h-4 text-slate-400 transition-transform ${showVillaDropdown === 'calendar' ? 'rotate-90' : ''}`} />
                  </button>
                  
                  {/* Custom Dropdown */}
                  {showVillaDropdown === 'calendar' && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-slate-200 p-2 z-50 max-h-64 overflow-y-auto">
                      {properties.map(p => (
                        <button
                          key={p.id}
                          onClick={() => { setActiveTab(p.id); setShowVillaDropdown(null); }}
                          className={`w-full px-3 py-2.5 rounded-lg text-left text-sm font-medium transition ${activeTab === p.id ? 'bg-purple-100 text-purple-700' : 'hover:bg-slate-50 text-slate-700'}`}
                        >
                          {p.name}
                        </button>
                      ))}
                    </div>
                  )}
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
                const schoolHolidayName = isSchoolHoliday(date);
                const priceInfo = getPriceForDate(date);
                const needsMinStay = requiresMinStay(date);
                // Priority: Paid > Manual > Custom Price > Public+School > Public > School > Normal
                // Colors: Green=Paid, Red=Blocked, Orange=Custom, Blue=Public Holiday, Yellow=School Holiday
                const hasPublicAndSchool = holidayName && schoolHolidayName;
                days.push(
                  <div key={day} className="relative group">
                    <button
                      onClick={() => toggleDate(date)}
                      className={`w-full p-1 sm:p-2 text-xs sm:text-sm rounded-lg sm:rounded-xl transition font-medium relative flex flex-col items-center justify-center min-h-[50px] sm:min-h-[60px] ${
                        isPaidBooking 
                          ? 'bg-emerald-500 text-white' 
                          : isManual
                          ? 'bg-red-500 text-white'
                          : priceInfo.isCustom
                          ? 'bg-gradient-to-br from-orange-100 to-amber-100 text-orange-700 border-2 border-orange-400'
                          : hasPublicAndSchool
                          ? 'bg-gradient-to-br from-blue-100 to-yellow-100 text-slate-700 border-2 border-blue-300'
                          : holidayName
                          ? 'bg-blue-100 text-blue-700 border-2 border-blue-300'
                          : schoolHolidayName
                          ? 'bg-yellow-100 text-yellow-700 border-2 border-yellow-300'
                          : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <span className="font-bold">{day}</span>
                      {activeTab === 'lavender' && !isManual && (
                        <span className={`text-[9px] sm:text-[10px] mt-0.5 ${
                          isPaidBooking ? 'text-white/80' :
                          priceInfo.isCustom ? 'text-orange-600 font-bold' : 'text-slate-400'
                        }`}>
                          RM{priceInfo.price >= 1000 ? (priceInfo.price/1000).toFixed(1) + 'k' : priceInfo.price}
                        </span>
                      )}
                      {priceInfo.isCustom && !isPaidBooking && !isManual && (
                        <span className="absolute -top-1 -right-1 w-2 h-2 bg-orange-500 rounded-full"></span>
                      )}
                      {holidayName && !priceInfo.isCustom && !isPaidBooking && !isManual && (
                        <span className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full"></span>
                      )}
                      {schoolHolidayName && !holidayName && !priceInfo.isCustom && !isPaidBooking && !isManual && (
                        <span className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-500 rounded-full"></span>
                      )}
                    </button>
                    {/* Edit price button - appears on hover for Lavender Villa */}
                    {activeTab === 'lavender' && !isPaidBooking && !isManual && (
                      <button
                        onClick={(e) => { e.stopPropagation(); openPriceModal(date); }}
                        className="absolute -bottom-1 -right-1 w-5 h-5 bg-purple-500 hover:bg-purple-600 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity shadow-sm flex items-center justify-center z-10"
                        title="Tukar harga"
                      >
                        <TrendingUp className="w-3 h-3" />
                      </button>
                    )}
                    {/* Tooltip for holidays and price */}
                    {(holidayName || schoolHolidayName || priceInfo.isCustom) && !isPaidBooking && !isManual && (
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
                        <div className="bg-slate-900 text-white text-xs px-3 py-2 rounded-lg shadow-lg whitespace-nowrap">
                          {priceInfo.isCustom && (
                            <div className="flex items-center gap-1.5 text-orange-300 font-medium">
                              <span className="w-2 h-2 bg-orange-400 rounded-full"></span>
                              <span>Harga Khas - RM{priceInfo.price.toLocaleString()}</span>
                            </div>
                          )}
                          {holidayName && (
                            <div className="flex items-center gap-1.5 mt-1">
                              <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                              <span>{holidayName}</span>
                            </div>
                          )}
                          {schoolHolidayName && (
                            <div className="flex items-center gap-1.5 mt-1">
                              <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
                              <span>{schoolHolidayName}</span>
                            </div>
                          )}
                          {activeTab === 'lavender' && (
                            <div className="text-slate-400 text-[10px] mt-1 border-t border-slate-700 pt-1">
                              Klik ikon untuk tukar harga
                            </div>
                          )}
                        </div>
                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900"></div>
                      </div>
                    )}
                  </div>
                );
              }
              return days;
            })()}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-4 mt-6 pt-6 border-t border-slate-100">
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-4 bg-slate-50 rounded border border-slate-200"></div>
              <span className="text-xs text-slate-600">Tersedia</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-4 bg-emerald-500 rounded"></div>
              <span className="text-xs text-slate-600">Telah Bayar</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-4 bg-red-500 rounded"></div>
              <span className="text-xs text-slate-600">Ditutup</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-4 bg-orange-100 rounded border-2 border-orange-400"></div>
              <span className="text-xs text-slate-600">Harga Khas</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-4 bg-blue-100 rounded border-2 border-blue-300"></div>
              <span className="text-xs text-slate-600">Cuti Umum</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-4 bg-yellow-100 rounded border-2 border-yellow-300"></div>
              <span className="text-xs text-slate-600">Cuti Sekolah</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-slate-400">⚠️ Hujung Minggu: Min 3H2M</span>
            </div>
          </div>
          
          {/* Price info note */}
          {activeTab === 'lavender' && (
            <div className="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
              <p className="text-xs text-slate-600 text-center">
                Weekday RM1,300/RM2,400 • Weekend/PH/SH RM1,590/RM2,990 • Festive RM1,700/RM3,200
              </p>
              <p className="text-xs text-slate-500 text-center mt-1">
                Hover tarikh untuk tukar harga
              </p>
            </div>
          )}
        </div>

        {/* Manual Blocked Dates List */}
        {(manualBlockedDates[activeTab] || []).length > 0 && (
          <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-2xl p-5 mt-6 border border-red-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center">
                  <X className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Tarikh Ditutup</h3>
                  <p className="text-xs text-slate-500">{(manualBlockedDates[activeTab] || []).length} tarikh</p>
                </div>
              </div>
              <button 
                onClick={() => {
                  if (confirm('Padam semua tarikh tutup?')) {
                    setManualBlockedDates(prev => ({ ...prev, [activeTab]: [] }));
                  }
                }}
                className="text-xs text-red-600 hover:text-red-700 font-medium"
              >
                Padam Semua
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
              {(manualBlockedDates[activeTab] || []).sort().map(dateStr => {
                const [year, month, day] = dateStr.split('-').map(Number);
                const displayDate = new Date(year, month - 1, day);
                const dayName = displayDate.toLocaleDateString('ms-MY', { weekday: 'short' });
                return (
                  <div 
                    key={dateStr}
                    className="group bg-white px-3 py-2 rounded-xl border border-red-200 hover:border-red-400 transition shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-bold text-slate-800">
                          {displayDate.toLocaleDateString('ms-MY', { day: 'numeric', month: 'short' })}
                        </p>
                        <p className="text-xs text-slate-400">{dayName}, {year}</p>
                      </div>
                      <button 
                        onClick={() => toggleManualBlockedDate(dateStr)}
                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 rounded-lg transition"
                      >
                        <X className="w-3.5 h-3.5 text-red-500" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

            {/* Note */}
            <div className="mt-6 p-3 sm:p-4 bg-slate-50 rounded-xl border border-slate-200">
              <p className="text-slate-600 text-xs text-center">
                <span className="text-emerald-600 font-medium">Hijau</span> = Telah Bayar | 
                <span className="text-red-600 font-medium"> Merah</span> = Ditutup | 
                <span className="text-purple-600 font-medium"> Ungu</span> = Cuti Umum | 
                <span className="text-sky-600 font-medium"> Biru</span> = Cuti Sekolah | 
                Klik tarikh untuk tutup/buka
              </p>
            </div>

            {/* Holidays Reference Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
              {/* Public Holidays */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="bg-gradient-to-r from-purple-500 to-purple-600 px-4 py-3">
                  <h3 className="text-white font-bold flex items-center gap-2">
                    <CalendarDays className="w-4 h-4" />
                    Cuti Umum 2026
                  </h3>
                  <p className="text-purple-100 text-xs mt-0.5">Kebangsaan & Melaka</p>
                </div>
                <div className="p-4 max-h-80 overflow-y-auto">
                  <div className="space-y-1.5">
                    {Object.entries(publicHolidays).map(([date, name]) => {
                      const [year, month, day] = date.split('-').map(Number);
                      const d = new Date(year, month - 1, day);
                      const dayName = d.toLocaleDateString('ms-MY', { weekday: 'short' });
                      const displayDate = d.toLocaleDateString('ms-MY', { day: 'numeric', month: 'short', year: 'numeric' });
                      return (
                        <div key={date} className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-purple-50 transition text-sm">
                          <span className="text-slate-700">{name}</span>
                          <span className="text-purple-600 text-xs font-medium">{dayName}, {displayDate}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="px-4 py-2 bg-purple-50 border-t border-purple-100">
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-3 h-3 bg-purple-100 rounded border-2 border-purple-300"></div>
                    <p className="text-xs text-purple-600">Harga Weekend/PH dikenakan pada tarikh ini</p>
                  </div>
                </div>
              </div>

              {/* School Holidays */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="bg-gradient-to-r from-sky-500 to-sky-600 px-4 py-3">
                  <h3 className="text-white font-bold flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Cuti Sekolah 2026
                  </h3>
                  <p className="text-sky-100 text-xs mt-0.5">Melaka</p>
                </div>
                <div className="p-4 max-h-80 overflow-y-auto">
                  <div className="space-y-2">
                    <div className="bg-sky-50 rounded-lg p-2.5 border border-sky-200">
                      <p className="text-sm font-medium text-slate-700">Cuti Tahun Baru Cina</p>
                      <p className="text-xs text-sky-600">16 Feb - 20 Feb 2026</p>
                    </div>
                    <div className="bg-sky-50 rounded-lg p-2.5 border border-sky-200">
                      <p className="text-sm font-medium text-slate-700">Cuti Hari Raya / Penggal 1</p>
                      <p className="text-xs text-sky-600">19 Mac - 29 Mac 2026</p>
                    </div>
                    <div className="bg-sky-50 rounded-lg p-2.5 border border-sky-200">
                      <p className="text-sm font-medium text-slate-700">Cuti Pertengahan Tahun</p>
                      <p className="text-xs text-sky-600">23 Mei - 7 Jun 2026</p>
                    </div>
                    <div className="bg-sky-50 rounded-lg p-2.5 border border-sky-200">
                      <p className="text-sm font-medium text-slate-700">Cuti Penggal 2</p>
                      <p className="text-xs text-sky-600">29 Ogos - 6 Sep 2026</p>
                    </div>
                    <div className="bg-sky-50 rounded-lg p-2.5 border border-sky-200">
                      <p className="text-sm font-medium text-slate-700">Cuti Deepavali</p>
                      <p className="text-xs text-sky-600">8 Nov - 10 Nov 2026</p>
                    </div>
                    <div className="bg-sky-50 rounded-lg p-2.5 border border-sky-200">
                      <p className="text-sm font-medium text-slate-700">Cuti Akhir Tahun</p>
                      <p className="text-xs text-sky-600">5 Dis - 31 Dis 2026</p>
                    </div>
                  </div>
                </div>
                <div className="px-4 py-2 bg-slate-50 border-t border-slate-100">
                  <p className="text-xs text-slate-400 text-center">Sumber: moe.gov.my | Tarikh untuk negeri Melaka</p>
                </div>
              </div>
            </div>

            {/* Custom Prices Section - Only for Lavender Villa */}
            {activeTab === 'lavender' && Object.keys(customPrices).length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mt-6">
                <div className="bg-gradient-to-r from-orange-500 to-amber-500 px-4 py-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-white font-bold flex items-center gap-2">
                        <TrendingUp className="w-4 h-4" />
                        Harga Khas
                      </h3>
                      <p className="text-orange-100 text-xs mt-0.5">{Object.keys(customPrices).length} tarikh dengan harga khas</p>
                    </div>
                    <button
                      onClick={() => {
                        if (confirm('Padam semua harga khas dan kembali ke harga asal?')) {
                          setCustomPrices({});
                        }
                      }}
                      className="bg-white/20 hover:bg-white/30 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition"
                    >
                      Reset Semua
                    </button>
                  </div>
                </div>
                
                <div className="p-4">
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                    {Object.entries(customPrices).sort(([a], [b]) => a.localeCompare(b)).map(([dateStr, price]) => {
                      const [year, month, day] = dateStr.split('-').map(Number);
                      const displayDate = new Date(year, month - 1, day);
                      const dayName = displayDate.toLocaleDateString('ms-MY', { weekday: 'short' });
                      return (
                        <div 
                          key={dateStr}
                          className="group bg-orange-50 px-3 py-2 rounded-xl border border-orange-200 hover:border-orange-400 transition"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-bold text-slate-800">
                                {displayDate.toLocaleDateString('ms-MY', { day: 'numeric', month: 'short' })}
                              </p>
                              <p className="text-xs text-slate-400">{dayName}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-bold text-orange-600">RM{price.toLocaleString()}</p>
                              <button 
                                onClick={() => setCustomPrice(dateStr, null)}
                                className="opacity-0 group-hover:opacity-100 text-xs text-red-500 hover:text-red-600 transition"
                              >
                                Padam
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Price Edit Modal */}
            {showPriceModal && editingPriceDate && (
              <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl">
                  <div className="bg-gradient-to-r from-orange-500 to-amber-500 p-4 rounded-t-2xl">
                    <div className="flex items-center justify-between">
                      <h3 className="text-white font-bold">Tukar Harga</h3>
                      <button onClick={() => setShowPriceModal(false)} className="text-white/80 hover:text-white">
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="p-4 space-y-4">
                    <div className="text-center">
                      <p className="text-slate-500 text-sm">Tarikh</p>
                      <p className="text-lg font-bold text-slate-800">
                        {new Date(editingPriceDate + 'T00:00:00').toLocaleDateString('ms-MY', { 
                          weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' 
                        })}
                      </p>
                    </div>
                    
                    <div>
                      <label className="block text-slate-600 text-xs font-medium mb-1">Harga (RM)</label>
                      <input
                        type="number"
                        value={editingPrice}
                        onChange={(e) => setEditingPrice(e.target.value)}
                        placeholder="cth: 999"
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-lg font-bold text-center focus:outline-none focus:border-orange-400 transition"
                      />
                      <p className="text-xs text-slate-400 mt-2 text-center">
                        Harga asal: RM{(() => {
                          const date = new Date(editingPriceDate + 'T00:00:00');
                          const dayOfWeek = date.getDay();
                          const isWeekendNight = dayOfWeek === 5 || dayOfWeek === 6; // Friday & Saturday nights
                          const isHoliday = publicHolidays[editingPriceDate];
                          const isFestive = festiveDates.includes(editingPriceDate);
                          if (isFestive) return '1,700';
                          if (isWeekendNight || isHoliday) return '1,590';
                          return '1,300';
                        })()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="p-4 border-t border-slate-100 flex gap-2">
                    <button
                      onClick={() => {
                        setCustomPrice(editingPriceDate, null);
                        setShowPriceModal(false);
                      }}
                      className="px-4 py-2.5 bg-slate-100 text-slate-600 rounded-xl font-medium hover:bg-slate-200 transition text-sm"
                    >
                      Reset
                    </button>
                    <button
                      onClick={savePriceFromModal}
                      className="flex-1 px-4 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl font-medium hover:from-orange-600 hover:to-amber-600 transition text-sm"
                    >
                      Simpan
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* Bookings View */}
        {adminView === 'bookings' && (
          <div className="space-y-4">
            {/* Quick Action Summary - Priority Tasks */}
            {(getActivePendingCount() > 0 || getActiveDepositCount() > 0 || getActiveRefundCount() > 0) && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {getActivePendingCount() > 0 && (
                  <button
                    onClick={() => setBookingFilter('pending')}
                    className={`p-3 sm:p-4 rounded-2xl border-2 transition-all ${
                      bookingFilter === 'pending' 
                        ? 'bg-yellow-500 border-yellow-500 text-white shadow-lg' 
                        : 'bg-yellow-50 border-yellow-200 hover:border-yellow-400'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="text-left">
                        <p className={`text-xl sm:text-2xl font-bold ${bookingFilter === 'pending' ? 'text-white' : 'text-yellow-600'}`}>
                          {getActivePendingCount()}
                        </p>
                        <p className={`text-xs font-medium ${bookingFilter === 'pending' ? 'text-yellow-100' : 'text-yellow-700'}`}>
                          Belum Bayar
                        </p>
                      </div>
                      <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center ${
                        bookingFilter === 'pending' ? 'bg-white/20' : 'bg-yellow-100'
                      }`}>
                        <Clock className={`w-4 h-4 sm:w-5 sm:h-5 ${bookingFilter === 'pending' ? 'text-white' : 'text-yellow-600'}`} />
                      </div>
                    </div>
                  </button>
                )}
                {getActiveDepositCount() > 0 && (
                  <button
                    onClick={() => setBookingFilter('deposit')}
                    className={`p-3 sm:p-4 rounded-2xl border-2 transition-all ${
                      bookingFilter === 'deposit' 
                        ? 'bg-blue-500 border-blue-500 text-white shadow-lg' 
                        : 'bg-blue-50 border-blue-200 hover:border-blue-400'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="text-left">
                        <p className={`text-xl sm:text-2xl font-bold ${bookingFilter === 'deposit' ? 'text-white' : 'text-blue-600'}`}>
                          {getActiveDepositCount()}
                        </p>
                        <p className={`text-xs font-medium ${bookingFilter === 'deposit' ? 'text-blue-100' : 'text-blue-700'}`}>
                          Deposit
                        </p>
                      </div>
                      <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center ${
                        bookingFilter === 'deposit' ? 'bg-white/20' : 'bg-blue-100'
                      }`}>
                        <Wallet className={`w-4 h-4 sm:w-5 sm:h-5 ${bookingFilter === 'deposit' ? 'text-white' : 'text-blue-600'}`} />
                      </div>
                    </div>
                  </button>
                )}
                {getActiveRefundCount() > 0 && (
                  <button
                    onClick={() => setBookingFilter('refund')}
                    className={`p-3 sm:p-4 rounded-2xl border-2 transition-all ${
                      bookingFilter === 'refund' 
                        ? 'bg-orange-500 border-orange-500 text-white shadow-lg' 
                        : 'bg-orange-50 border-orange-200 hover:border-orange-400'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="text-left">
                        <p className={`text-xl sm:text-2xl font-bold ${bookingFilter === 'refund' ? 'text-white' : 'text-orange-600'}`}>
                          {getActiveRefundCount()}
                        </p>
                        <p className={`text-xs font-medium ${bookingFilter === 'refund' ? 'text-orange-100' : 'text-orange-700'}`}>
                          Refund
                        </p>
                      </div>
                      <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center ${
                        bookingFilter === 'refund' ? 'bg-white/20' : 'bg-orange-100'
                      }`}>
                        <Wallet className={`w-4 h-4 sm:w-5 sm:h-5 ${bookingFilter === 'refund' ? 'text-white' : 'text-orange-600'}`} />
                      </div>
                    </div>
                  </button>
                )}
                {/* Show Paid count as info card */}
                <div className="p-3 sm:p-4 rounded-2xl bg-green-50 border-2 border-green-200">
                  <div className="flex items-center justify-between">
                    <div className="text-left">
                      <p className="text-xl sm:text-2xl font-bold text-green-600">{getActivePaidCount()}</p>
                      <p className="text-xs font-medium text-green-700">Full</p>
                    </div>
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-green-100 flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Filter Panel */}
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm overflow-visible">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-slate-900 flex items-center gap-2">
                  <ClipboardList className="w-4 h-4 text-purple-500" />
                  Senarai Tempahan
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
                    className="px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition bg-purple-500 text-white hover:bg-purple-600 flex items-center gap-1.5 shadow-md"
                  >
                    <Plus className="w-4 h-4" />
                    <span className="hidden sm:inline">Tambah</span>
                  </button>
                </div>
              </div>
              
              {/* Status Filter - Horizontal Scroll on Mobile */}
              <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap scrollbar-hide mb-4">
                <button 
                  onClick={() => setBookingFilter('all')}
                  className={`px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${bookingFilter === 'all' ? 'bg-purple-500 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                >
                  Semua
                </button>
                <button 
                  onClick={() => setBookingFilter('pending')}
                  className={`px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 ${bookingFilter === 'pending' ? 'bg-yellow-500 text-white shadow-md' : 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100 border border-yellow-200'}`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  Belum
                </button>
                <button 
                  onClick={() => setBookingFilter('deposit')}
                  className={`px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 ${bookingFilter === 'deposit' ? 'bg-blue-500 text-white shadow-md' : 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200'}`}
                >
                  <Wallet className="w-3.5 h-3.5" />
                  Deposit
                </button>
                <button 
                  onClick={() => setBookingFilter('paid')}
                  className={`px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 ${bookingFilter === 'paid' ? 'bg-green-500 text-white shadow-md' : 'bg-green-50 text-green-700 hover:bg-green-100 border border-green-200'}`}
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  Full
                </button>
                <button 
                  onClick={() => setBookingFilter('refund')}
                  className={`px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 ${bookingFilter === 'refund' ? 'bg-orange-500 text-white shadow-md' : 'bg-orange-50 text-orange-700 hover:bg-orange-100 border border-orange-200'}`}
                >
                  <Wallet className="w-3.5 h-3.5" />
                  Refund
                </button>
                <button 
                  onClick={() => setBookingFilter('cancelled')}
                  className={`px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${bookingFilter === 'cancelled' ? 'bg-red-500 text-white shadow-md' : 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200'}`}
                >
                  Batal
                </button>
              </div>
              
              {/* Villa & Date Filters - Clean Grid Layout */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="relative">
                  <label className="block text-slate-500 text-xs mb-1.5">Villa / Homestay</label>
                  <button
                    onClick={() => setShowVillaDropdown(showVillaDropdown === 'bookings' ? null : 'bookings')}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm sm:text-base font-medium focus:outline-none focus:border-purple-400 transition text-left flex items-center justify-between"
                  >
                    <span>{propertyFilter === 'all' ? 'Semua Villa' : properties.find(p => p.id === propertyFilter)?.name}</span>
                    <ChevronRight className={`w-4 h-4 text-slate-400 transition-transform ${showVillaDropdown === 'bookings' ? 'rotate-90' : ''}`} />
                  </button>
                  
                  {/* Custom Dropdown */}
                  {showVillaDropdown === 'bookings' && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-slate-200 p-2 z-50 max-h-64 overflow-y-auto">
                      <button
                        onClick={() => { setPropertyFilter('all'); setShowVillaDropdown(null); }}
                        className={`w-full px-3 py-2.5 rounded-lg text-left text-sm font-medium transition ${propertyFilter === 'all' ? 'bg-purple-100 text-purple-700' : 'hover:bg-slate-50 text-slate-700'}`}
                      >
                        Semua Villa
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
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm sm:text-base font-medium focus:outline-none focus:border-purple-400 transition text-left flex items-center justify-between"
                  >
                    <span className={dateFilterFrom ? 'text-slate-900' : 'text-slate-400'}>
                      {dateFilterFrom ? new Date(dateFilterFrom).toLocaleDateString('ms-MY', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Pilih tarikh'}
                    </span>
                    <CalendarDays className="w-4 h-4 text-slate-400" />
                  </button>
                  {dateFilterFrom && (
                    <button onClick={() => setDateFilterFrom('')} className="absolute right-8 top-1/2 -translate-y-1/2 mt-3 p-1 hover:bg-slate-200 rounded-full z-10">
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
                        className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm sm:text-base font-medium focus:outline-none focus:border-purple-400 transition text-left flex items-center justify-between"
                      >
                        <span className={dateFilterTo ? 'text-slate-900' : 'text-slate-400'}>
                          {dateFilterTo ? new Date(dateFilterTo).toLocaleDateString('ms-MY', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Pilih tarikh'}
                        </span>
                        <CalendarDays className="w-4 h-4 text-slate-400" />
                      </button>
                      {dateFilterTo && (
                        <button onClick={() => setDateFilterTo('')} className="absolute right-8 top-1/2 -translate-y-1/2 mt-3 p-1 hover:bg-slate-200 rounded-full z-10">
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
                
            {/* Bookings List or Empty State */}
            {getFilteredBookings().length === 0 ? (
              <div className="bg-white rounded-2xl p-8 sm:p-12 border border-slate-200 shadow-sm text-center">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ClipboardList className="w-8 h-8 text-slate-300" />
                </div>
                <h3 className="font-bold text-slate-700 mb-2">Tiada Tempahan</h3>
                <p className="text-slate-500 text-sm sm:text-base mb-4">
                  {bookingFilter !== 'all' 
                    ? `Tiada tempahan "${bookingFilter === 'pending' ? 'Belum Bayar' : bookingFilter === 'paid' ? 'Telah Bayar' : bookingFilter === 'cancelled' ? 'Dibatalkan' : 'Refund'}"`
                    : 'Tiada tempahan aktif buat masa ini'}
                </p>
                {bookingFilter !== 'all' ? (
                  <button 
                    onClick={() => setBookingFilter('all')}
                    className="text-purple-600 text-sm font-medium hover:text-purple-700"
                  >
                    Lihat semua tempahan →
                  </button>
                ) : (
                  <button 
                    onClick={() => setShowAddBooking(true)}
                    className="px-4 py-2 bg-purple-500 text-white rounded-xl text-sm font-semibold hover:bg-purple-600 transition"
                  >
                    + Tambah Tempahan
                  </button>
                )}
              </div>
            ) : (
              <>
                {/* Bookings List - Improved Cards */}
                <div className="space-y-3">
                  {getFilteredBookings()
                    .sort((a, b) => {
                      // Priority: pending first, then deposit, then refund, then by check-in date (soonest first)
                      const statusPriority = { pending: 0, deposit: 1, refund: 2, paid: 3, cancelled: 4 };
                      const aStatus = a.status || 'pending';
                      const bStatus = b.status || 'pending';
                      const priorityDiff = (statusPriority[aStatus] ?? 5) - (statusPriority[bStatus] ?? 5);
                      if (priorityDiff !== 0) return priorityDiff;
                      return new Date(a.checkIn) - new Date(b.checkIn);
                    })
                    .map(booking => (
                      <div 
                        key={booking.id} 
                        className={`bg-white rounded-2xl border-2 shadow-sm overflow-hidden transition-all hover:shadow-md ${
                          booking.status === 'pending' ? 'border-yellow-300' :
                          booking.status === 'deposit' ? 'border-blue-300' :
                          booking.status === 'refund' ? 'border-orange-300' :
                          booking.status === 'paid' ? 'border-green-200' :
                          'border-slate-200'
                        }`}
                      >
                        {/* Status Header Bar */}
                        <div className={`px-4 py-2 flex items-center justify-between ${
                          booking.status === 'pending' ? 'bg-yellow-50' :
                          booking.status === 'deposit' ? 'bg-blue-50' :
                          booking.status === 'refund' ? 'bg-orange-50' :
                          booking.status === 'paid' ? 'bg-green-50' :
                          'bg-slate-50'
                        }`}>
                          <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${
                              booking.status === 'pending' ? 'bg-yellow-500 animate-pulse' :
                              booking.status === 'deposit' ? 'bg-blue-500' :
                              booking.status === 'refund' ? 'bg-orange-500 animate-pulse' :
                              booking.status === 'paid' ? 'bg-green-500' :
                              'bg-slate-400'
                            }`}></span>
                            <span className={`text-xs font-bold uppercase tracking-wide ${
                              booking.status === 'pending' ? 'text-yellow-700' :
                              booking.status === 'deposit' ? 'text-blue-700' :
                              booking.status === 'refund' ? 'text-orange-700' :
                              booking.status === 'paid' ? 'text-green-700' :
                              'text-slate-500'
                            }`}>
                              {booking.status === 'pending' ? 'Menunggu Bayaran' :
                               booking.status === 'deposit' ? 'Deposit Dibayar' :
                               booking.status === 'refund' ? 'Perlu Refund' :
                               booking.status === 'paid' ? 'Telah Bayar' :
                               'Dibatalkan'}
                            </span>
                          </div>
                          <span className="text-xs text-slate-400 font-mono">{booking.id}</span>
                        </div>

                        {/* Main Content */}
                        <div className="p-4">
                          <div className="flex items-start justify-between gap-3">
                            {/* Guest Info */}
                            <div className="flex items-start gap-3 min-w-0 flex-1">
                              <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                                booking.status === 'pending' ? 'bg-yellow-100' :
                                booking.status === 'deposit' ? 'bg-blue-100' :
                                booking.status === 'refund' ? 'bg-orange-100' :
                                booking.status === 'paid' ? 'bg-green-100' :
                                'bg-slate-100'
                              }`}>
                                <span className={`text-lg font-bold ${
                                  booking.status === 'pending' ? 'text-yellow-600' :
                                  booking.status === 'deposit' ? 'text-blue-600' :
                                  booking.status === 'refund' ? 'text-orange-600' :
                                  booking.status === 'paid' ? 'text-green-600' :
                                  'text-slate-500'
                                }`}>{booking.name?.charAt(0)?.toUpperCase()}</span>
                              </div>
                              <div className="min-w-0 flex-1">
                                <h4 className="font-bold text-slate-900 text-base truncate">{booking.name}</h4>
                                <p className="text-sm text-purple-600 font-medium">
                                  {properties.find(p => p.id === booking.property)?.name?.replace(' Melaka', '') || 'Lavender Villa'}
                                </p>
                                {/* Mobile: Stack vertically with icons */}
                                <div className="flex flex-col gap-1 mt-2 sm:hidden">
                                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                    <CalendarDays className="w-3.5 h-3.5 text-slate-400" />
                                    <span>{new Date(booking.checkIn).toLocaleDateString('ms-MY', { day: 'numeric', month: 'short' })} → {new Date(booking.checkOut).toLocaleDateString('ms-MY', { day: 'numeric', month: 'short' })}</span>
                                  </div>
                                  <div className="flex items-center gap-3 text-xs text-slate-500">
                                    <span className="flex items-center gap-1">
                                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                                      {booking.nights} malam
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <Users className="w-3.5 h-3.5 text-slate-400" />
                                      {booking.guests} orang
                                    </span>
                                  </div>
                                </div>
                                {/* Desktop: Single line with icons */}
                                <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500 mt-1">
                                  <CalendarDays className="w-3.5 h-3.5" />
                                  <span>{new Date(booking.checkIn).toLocaleDateString('ms-MY', { day: 'numeric', month: 'short' })}</span>
                                  <span>→</span>
                                  <span>{new Date(booking.checkOut).toLocaleDateString('ms-MY', { day: 'numeric', month: 'short' })}</span>
                                  <span className="text-slate-300">•</span>
                                  <span>{booking.nights} malam</span>
                                  <span className="text-slate-300">•</span>
                                  <Users className="w-3.5 h-3.5" />
                                  <span>{booking.guests}</span>
                                </div>
                              </div>
                            </div>
                            
                            {/* Price */}
                            <div className="text-right flex-shrink-0">
                              <p className="text-xl font-bold text-slate-900">RM {booking.total?.toLocaleString()}</p>
                              {booking.createdAt && (
                                <p className="text-xs text-slate-400 mt-1">
                                  {new Date(booking.createdAt).toLocaleDateString('ms-MY', { day: 'numeric', month: 'short' })}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="px-4 pb-4">
                          <div className="flex items-center gap-2 flex-wrap">
                            {/* Primary Action based on status */}
                            {booking.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => handleUpdateBookingStatus(booking.id, 'deposit')}
                                  className="flex-1 sm:flex-none px-4 py-2.5 bg-blue-500 text-white rounded-xl text-sm font-bold hover:bg-blue-600 transition shadow-md shadow-blue-500/30 flex items-center justify-center gap-2"
                                >
                                  <Wallet className="w-4 h-4" />
                                  Deposit
                                </button>
                                <button
                                  onClick={() => handleUpdateBookingStatus(booking.id, 'paid')}
                                  className="flex-1 sm:flex-none px-4 py-2.5 bg-green-500 text-white rounded-xl text-sm font-bold hover:bg-green-600 transition shadow-md shadow-green-500/30 flex items-center justify-center gap-2"
                                >
                                  <CheckCircle className="w-4 h-4" />
                                  Full
                                </button>
                              </>
                            )}
                            {booking.status === 'deposit' && (
                              <button
                                onClick={() => handleUpdateBookingStatus(booking.id, 'paid')}
                                className="flex-1 sm:flex-none px-4 py-2.5 bg-green-500 text-white rounded-xl text-sm font-bold hover:bg-green-600 transition shadow-md shadow-green-500/30 flex items-center justify-center gap-2"
                              >
                                <CheckCircle className="w-4 h-4" />
                                Full
                              </button>
                            )}
                            {booking.status === 'refund' && (
                              <button
                                onClick={() => handleUpdateBookingStatus(booking.id, 'cancelled')}
                                className="flex-1 sm:flex-none px-4 py-2.5 bg-green-500 text-white rounded-xl text-sm font-bold hover:bg-green-600 transition shadow-md shadow-green-500/30 flex items-center justify-center gap-2"
                              >
                                <CheckCircle className="w-4 h-4" />
                                Refund Selesai
                              </button>
                            )}
                            {booking.status === 'paid' && (
                              <button
                                onClick={() => generateReceipt(booking)}
                                className="px-3 py-2 bg-purple-100 text-purple-700 rounded-xl text-xs font-semibold hover:bg-purple-200 transition flex items-center gap-1.5"
                              >
                                <FileText className="w-3.5 h-3.5" />
                                Resit
                              </button>
                            )}
                            
                            {/* Secondary Actions */}
                            {booking.status === 'pending' && (
                              <button
                                onClick={() => handleUpdateBookingStatus(booking.id, 'cancelled')}
                                className="px-3 py-2 bg-slate-100 text-slate-600 rounded-xl text-xs font-medium hover:bg-slate-200 transition"
                              >
                                Batal
                              </button>
                            )}
                            {booking.status === 'deposit' && (
                              <button
                                onClick={() => handleUpdateBookingStatus(booking.id, 'refund')}
                                className="px-3 py-2 bg-orange-100 text-orange-700 rounded-xl text-xs font-medium hover:bg-orange-200 transition"
                              >
                                Refund
                              </button>
                            )}
                            {booking.status === 'paid' && (
                              <button
                                onClick={() => handleUpdateBookingStatus(booking.id, 'refund')}
                                className="px-3 py-2 bg-orange-100 text-orange-700 rounded-xl text-xs font-medium hover:bg-orange-200 transition"
                              >
                                Refund
                              </button>
                            )}
                            
                            {/* Edit Date - Only for deposit/pending/paid, and only if not already changed */}
                            {(booking.status === 'deposit' || booking.status === 'pending' || booking.status === 'paid') && !booking.dateChanged && (
                              <button
                                onClick={() => openEditDateModal(booking)}
                                className="px-3 py-2 bg-purple-100 text-purple-700 rounded-xl text-xs font-medium hover:bg-purple-200 transition flex items-center gap-1.5"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">Tukar Tarikh</span>
                              </button>
                            )}
                            {booking.dateChanged && (
                              <span className="px-3 py-2 bg-slate-50 text-slate-400 rounded-xl text-xs font-medium flex items-center gap-1.5">
                                <Edit3 className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">Tarikh Ditukar</span>
                              </span>
                            )}
                            
                            {/* Contact Actions */}
                            <a
                              href={`https://wa.me/${booking.phone?.replace(/^0/, '60')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-2 bg-green-100 text-green-700 rounded-xl text-xs font-medium hover:bg-green-200 transition flex items-center gap-1.5"
                            >
                              <Send className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">WhatsApp</span>
                            </a>
                            <a
                              href={`tel:${booking.phone}`}
                              className="px-3 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-medium hover:bg-slate-200 transition flex items-center gap-1.5"
                            >
                              <Phone className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">{booking.phone}</span>
                            </a>
                            
                            {/* Delete */}
                            <button
                              onClick={() => handleDeleteBooking(booking.id)}
                              className="px-2.5 py-2 bg-red-50 text-red-500 rounded-xl text-xs font-medium hover:bg-red-100 transition ml-auto"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
                
                {/* Summary Footer */}
                <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">Jumlah Tempahan</span>
                    <span className="font-bold text-slate-900">{getFilteredBookings().length}</span>
                  </div>
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
                {/* Referral Source - Dari Mana Tahu */}
                <div className="mt-3">
                  <label className="block text-slate-500 text-xs mb-1">Dari Mana Tahu?</label>
                  <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                    {[
                      { id: 'tiktok', label: 'TikTok', color: 'pink' },
                      { id: 'instagram', label: 'IG', color: 'purple' },
                      { id: 'facebook', label: 'FB', color: 'blue' },
                      { id: 'google', label: 'Google', color: 'red' },
                      { id: 'kawan', label: 'Kawan', color: 'green' },
                      { id: 'saudara', label: 'Saudara', color: 'orange' },
                      { id: 'lain', label: 'Lain', color: 'slate' }
                    ].map(source => (
                      <button
                        key={source.id}
                        type="button"
                        onClick={() => setNewBooking({...newBooking, referralSource: newBooking.referralSource === source.id ? '' : source.id})}
                        className={`px-2 py-2 rounded-xl text-xs font-semibold transition border-2 ${
                          newBooking.referralSource === source.id
                            ? `bg-${source.color}-500 border-${source.color}-500 text-white`
                            : `bg-white border-slate-200 text-slate-600 hover:border-${source.color}-300`
                        }`}
                        style={newBooking.referralSource === source.id ? {
                          backgroundColor: source.color === 'pink' ? '#ec4899' : source.color === 'purple' ? '#a855f7' : source.color === 'blue' ? '#3b82f6' : source.color === 'red' ? '#ef4444' : source.color === 'green' ? '#22c55e' : source.color === 'orange' ? '#f97316' : '#64748b',
                          borderColor: source.color === 'pink' ? '#ec4899' : source.color === 'purple' ? '#a855f7' : source.color === 'blue' ? '#3b82f6' : source.color === 'red' ? '#ef4444' : source.color === 'green' ? '#22c55e' : source.color === 'orange' ? '#f97316' : '#64748b',
                          color: 'white'
                        } : {}}
                      >
                        {source.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Booking Details Section */}
              <div className="bg-slate-50 rounded-2xl p-4 mb-4">
                <h3 className="font-semibold text-slate-700 mb-3 flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-purple-500" /> Butiran Tempahan
                </h3>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  {/* Check In with Calendar */}
                  <div className="relative">
                    <label className="block text-slate-500 text-xs mb-1">Daftar Masuk</label>
                    <button
                      type="button"
                      onClick={() => setAddBookingCalendar(addBookingCalendar === 'checkIn' ? null : 'checkIn')}
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-left focus:outline-none focus:border-purple-400 transition text-sm flex items-center justify-between"
                    >
                      <span className={newBooking.checkIn ? 'text-slate-900' : 'text-slate-400'}>
                        {newBooking.checkIn ? new Date(newBooking.checkIn + 'T00:00:00').toLocaleDateString('ms-MY', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Pilih tarikh'}
                      </span>
                      <CalendarDays className="w-4 h-4 text-slate-400" />
                    </button>
                    {addBookingCalendar === 'checkIn' && (
                      <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-slate-200 p-3 z-50">
                        <div className="flex items-center justify-between mb-3">
                          <button onClick={() => setAddBookingMonth(new Date(addBookingMonth.getFullYear(), addBookingMonth.getMonth() - 1))} className="p-1 hover:bg-slate-100 rounded-lg"><ChevronLeft className="w-4 h-4" /></button>
                          <span className="font-semibold text-sm">{addBookingMonth.toLocaleDateString('ms-MY', { month: 'long', year: 'numeric' })}</span>
                          <button onClick={() => setAddBookingMonth(new Date(addBookingMonth.getFullYear(), addBookingMonth.getMonth() + 1))} className="p-1 hover:bg-slate-100 rounded-lg"><ChevronRight className="w-4 h-4" /></button>
                        </div>
                        <div className="grid grid-cols-7 gap-1 mb-1">
                          {['A', 'I', 'S', 'R', 'K', 'J', 'S'].map(d => <div key={d} className="text-center text-xs text-slate-400 py-1">{d}</div>)}
                        </div>
                        <div className="grid grid-cols-7 gap-1">
                          {(() => {
                            const { daysInMonth, startingDay } = getDaysInMonth(addBookingMonth);
                            const days = [];
                            for (let i = 0; i < startingDay; i++) days.push(<div key={`e-${i}`} />);
                            for (let day = 1; day <= daysInMonth; day++) {
                              const date = new Date(addBookingMonth.getFullYear(), addBookingMonth.getMonth(), day);
                              const dateStr = formatDateStr(date);
                              const isPast = date < new Date(new Date().setHours(0,0,0,0));
                              const isBooked = isDateBookedForAdd(date, newBooking.property);
                              const holidayName = isPublicHoliday(date);
                              const schoolHolidayName = isSchoolHoliday(date);
                              days.push(
                                <button
                                  key={day}
                                  type="button"
                                  disabled={isPast || isBooked}
                                  onClick={() => {
                                    setNewBooking({...newBooking, checkIn: dateStr, checkOut: '', total: 0});
                                    setAddBookingCalendar('checkOut');
                                  }}
                                  className={`p-1.5 text-xs rounded-lg transition relative ${
                                    newBooking.checkIn === dateStr ? 'bg-purple-500 text-white font-bold' :
                                    isBooked ? 'bg-red-100 text-red-400 cursor-not-allowed' :
                                    isPast ? 'text-slate-300 cursor-not-allowed' :
                                    holidayName ? 'bg-blue-50 text-blue-600' :
                                    schoolHolidayName ? 'bg-yellow-50 text-yellow-700' :
                                    'hover:bg-purple-100 text-slate-700'
                                  }`}
                                  title={holidayName || schoolHolidayName || ''}
                                >
                                  {day}
                                  {holidayName && !isBooked && <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-blue-500 rounded-full"></span>}
                                  {schoolHolidayName && !holidayName && !isBooked && <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-yellow-400 rounded-full"></span>}
                                </button>
                              );
                            }
                            return days;
                          })()}
                        </div>
                        <div className="mt-2 pt-2 border-t flex flex-wrap gap-2 text-xs">
                          <span className="flex items-center gap-1"><span className="w-3 h-3 bg-red-100 rounded"></span>Ditempah</span>
                          <span className="flex items-center gap-1"><span className="w-3 h-3 bg-blue-50 rounded border border-blue-200"></span>Cuti Umum</span>
                          <span className="flex items-center gap-1"><span className="w-3 h-3 bg-yellow-50 rounded border border-yellow-200"></span>Cuti Sekolah</span>
                        </div>
                      </div>
                    )}
                  </div>
                  {/* Check Out with Calendar */}
                  <div className="relative">
                    <label className="block text-slate-500 text-xs mb-1">Daftar Keluar</label>
                    <button
                      type="button"
                      onClick={() => newBooking.checkIn && setAddBookingCalendar(addBookingCalendar === 'checkOut' ? null : 'checkOut')}
                      className={`w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-left focus:outline-none focus:border-purple-400 transition text-sm flex items-center justify-between ${!newBooking.checkIn ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <span className={newBooking.checkOut ? 'text-slate-900' : 'text-slate-400'}>
                        {newBooking.checkOut ? new Date(newBooking.checkOut + 'T00:00:00').toLocaleDateString('ms-MY', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Pilih tarikh'}
                      </span>
                      <CalendarDays className="w-4 h-4 text-slate-400" />
                    </button>
                    {addBookingCalendar === 'checkOut' && newBooking.checkIn && (
                      <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-slate-200 p-3 z-50">
                        <div className="flex items-center justify-between mb-3">
                          <button onClick={() => setAddBookingMonth(new Date(addBookingMonth.getFullYear(), addBookingMonth.getMonth() - 1))} className="p-1 hover:bg-slate-100 rounded-lg"><ChevronLeft className="w-4 h-4" /></button>
                          <span className="font-semibold text-sm">{addBookingMonth.toLocaleDateString('ms-MY', { month: 'long', year: 'numeric' })}</span>
                          <button onClick={() => setAddBookingMonth(new Date(addBookingMonth.getFullYear(), addBookingMonth.getMonth() + 1))} className="p-1 hover:bg-slate-100 rounded-lg"><ChevronRight className="w-4 h-4" /></button>
                        </div>
                        <div className="grid grid-cols-7 gap-1 mb-1">
                          {['A', 'I', 'S', 'R', 'K', 'J', 'S'].map(d => <div key={d} className="text-center text-xs text-slate-400 py-1">{d}</div>)}
                        </div>
                        <div className="grid grid-cols-7 gap-1">
                          {(() => {
                            const { daysInMonth, startingDay } = getDaysInMonth(addBookingMonth);
                            const days = [];
                            for (let i = 0; i < startingDay; i++) days.push(<div key={`e-${i}`} />);
                            for (let day = 1; day <= daysInMonth; day++) {
                              const date = new Date(addBookingMonth.getFullYear(), addBookingMonth.getMonth(), day);
                              const dateStr = formatDateStr(date);
                              const isBeforeCheckIn = dateStr <= newBooking.checkIn;
                              const isBooked = isDateBookedForAdd(date, newBooking.property);
                              let hasBlockedBetween = false;
                              if (dateStr > newBooking.checkIn) {
                                const start = new Date(newBooking.checkIn + 'T00:00:00');
                                const end = new Date(dateStr + 'T00:00:00');
                                for (let d = new Date(start); d < end; d.setDate(d.getDate() + 1)) {
                                  if ((bookedDates[newBooking.property] || []).includes(formatDateStr(d))) {
                                    hasBlockedBetween = true;
                                    break;
                                  }
                                }
                              }
                              const holidayName = isPublicHoliday(date);
                              const schoolHolidayName = isSchoolHoliday(date);
                              const isDisabled = isBeforeCheckIn || isBooked || hasBlockedBetween;
                              days.push(
                                <button
                                  key={day}
                                  type="button"
                                  disabled={isDisabled}
                                  onClick={() => {
                                    const price = calculateAddBookingPrice(newBooking.checkIn, dateStr, newBooking.property);
                                    setNewBooking({...newBooking, checkOut: dateStr, total: price});
                                    setAddBookingCalendar(null);
                                  }}
                                  className={`p-1.5 text-xs rounded-lg transition relative ${
                                    newBooking.checkOut === dateStr ? 'bg-purple-500 text-white font-bold' :
                                    isBooked || hasBlockedBetween ? 'bg-red-100 text-red-400 cursor-not-allowed' :
                                    isBeforeCheckIn ? 'text-slate-300 cursor-not-allowed' :
                                    holidayName ? 'bg-blue-50 text-blue-600' :
                                    schoolHolidayName ? 'bg-yellow-50 text-yellow-700' :
                                    'hover:bg-purple-100 text-slate-700'
                                  }`}
                                  title={holidayName || schoolHolidayName || ''}
                                >
                                  {day}
                                  {holidayName && !isBooked && !hasBlockedBetween && !isBeforeCheckIn && <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-blue-500 rounded-full"></span>}
                                  {schoolHolidayName && !holidayName && !isBooked && !hasBlockedBetween && !isBeforeCheckIn && <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-yellow-400 rounded-full"></span>}
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
                {/* Price Summary */}
                {newBooking.checkIn && newBooking.checkOut && (
                  <div className="bg-purple-50 rounded-xl p-3 mb-3 border border-purple-200">
                    <div className="flex justify-between items-center">
                      <span className="text-purple-700 text-sm">
                        {Math.round((new Date(newBooking.checkOut) - new Date(newBooking.checkIn)) / (1000 * 60 * 60 * 24))} malam
                      </span>
                      <span className="text-purple-700 font-bold">RM {newBooking.total.toLocaleString()}</span>
                    </div>
                  </div>
                )}
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-500 text-xs mb-1">Tetamu</label>
                    <select
                      value={newBooking.guests}
                      onChange={(e) => setNewBooking({...newBooking, guests: parseInt(e.target.value) || 10})}
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition text-sm text-center"
                    >
                      {[10, 12, 14, 15, 16, 18, 20].map(num => (
                        <option key={num} value={num}>{num}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-500 text-xs mb-1">Harga (RM)</label>
                    <input
                      type="number"
                      min="0"
                      value={newBooking.total}
                      onChange={(e) => setNewBooking({...newBooking, total: parseInt(e.target.value) || 0})}
                      placeholder="Auto"
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

      {/* Edit Date Modal */}
      {showEditDateModal && editingBooking && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="bg-purple-500 p-4 text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold">Tukar Tarikh</h3>
                <p className="text-purple-100 text-xs">{editingBooking.name}</p>
              </div>
              <button onClick={() => setShowEditDateModal(false)} className="p-1 hover:bg-white/20 rounded-lg transition">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Current vs New Dates */}
            <div className="p-4 bg-slate-50 border-b border-slate-200">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-500 mb-1">Tarikh Asal</p>
                  <p className="text-sm font-semibold text-slate-700">
                    {new Date(editingBooking.checkIn).toLocaleDateString('ms-MY', { day: 'numeric', month: 'short' })} → {new Date(editingBooking.checkOut).toLocaleDateString('ms-MY', { day: 'numeric', month: 'short' })}
                  </p>
                  <p className="text-xs text-slate-400">{editingBooking.nights} malam</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Tarikh Baru</p>
                  <p className={`text-sm font-semibold ${newCheckIn && newCheckOut ? 'text-purple-600' : 'text-slate-400'}`}>
                    {newCheckIn && newCheckOut 
                      ? `${new Date(newCheckIn).toLocaleDateString('ms-MY', { day: 'numeric', month: 'short' })} → ${new Date(newCheckOut).toLocaleDateString('ms-MY', { day: 'numeric', month: 'short' })}`
                      : 'Pilih tarikh'}
                  </p>
                  <p className="text-xs text-slate-400">{calculateEditNights() > 0 ? `${calculateEditNights()} malam` : '-'}</p>
                </div>
              </div>
            </div>

            {/* Step Indicator */}
            <div className="p-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setEditDateStep('checkIn')}
                  className={`flex-1 py-2 rounded-xl text-sm font-semibold transition ${editDateStep === 'checkIn' ? 'bg-purple-500 text-white' : 'bg-slate-100 text-slate-600'}`}
                >
                  Check-in
                </button>
                <button
                  onClick={() => setEditDateStep('checkOut')}
                  className={`flex-1 py-2 rounded-xl text-sm font-semibold transition ${editDateStep === 'checkOut' ? 'bg-purple-500 text-white' : 'bg-slate-100 text-slate-600'}`}
                >
                  Check-out
                </button>
              </div>
            </div>

            {/* Calendar */}
            <div className="p-4">
              {/* Month Navigation */}
              <div className="flex items-center justify-between mb-4">
                <button 
                  onClick={() => setEditDateCalendarMonth(new Date(editDateCalendarMonth.getFullYear(), editDateCalendarMonth.getMonth() - 1))} 
                  className="p-2 hover:bg-slate-100 rounded-lg transition"
                >
                  <ChevronLeft className="w-5 h-5 text-slate-600" />
                </button>
                <span className="font-bold text-slate-900">
                  {editDateCalendarMonth.toLocaleDateString('ms-MY', { month: 'long', year: 'numeric' })}
                </span>
                <button 
                  onClick={() => setEditDateCalendarMonth(new Date(editDateCalendarMonth.getFullYear(), editDateCalendarMonth.getMonth() + 1))} 
                  className="p-2 hover:bg-slate-100 rounded-lg transition"
                >
                  <ChevronRight className="w-5 h-5 text-slate-600" />
                </button>
              </div>

              {/* Day Headers */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {['Ah', 'Is', 'Se', 'Ra', 'Kh', 'Ju', 'Sa'].map(day => (
                  <div key={day} className="text-center text-xs font-semibold text-slate-500 py-1">{day}</div>
                ))}
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1">
                {(() => {
                  const year = editDateCalendarMonth.getFullYear();
                  const month = editDateCalendarMonth.getMonth();
                  const firstDay = new Date(year, month, 1).getDay();
                  const daysInMonth = new Date(year, month + 1, 0).getDate();
                  const days = [];
                  
                  // Empty cells for days before first day of month
                  for (let i = 0; i < firstDay; i++) {
                    days.push(<div key={`empty-${i}`} />);
                  }
                  
                  // Days of month
                  for (let day = 1; day <= daysInMonth; day++) {
                    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                    const date = new Date(year, month, day);
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    const isPast = date < today;
                    
                    // Check if date is booked (excluding current booking's dates)
                    const currentDates = getDatesBetween(editingBooking.checkIn, editingBooking.checkOut);
                    const propertyId = editingBooking.property || 'lavender';
                    const isBookedByOthers = (bookedDates[propertyId] || []).includes(dateStr) && !currentDates.includes(dateStr);
                    
                    const isSelected = dateStr === newCheckIn || dateStr === newCheckOut;
                    const isInRange = newCheckIn && newCheckOut && dateStr > newCheckIn && dateStr < newCheckOut;
                    const isDisabled = isPast || isBookedByOthers;
                    
                    days.push(
                      <button
                        key={day}
                        onClick={() => {
                          if (isDisabled) return;
                          if (editDateStep === 'checkIn') {
                            setNewCheckIn(dateStr);
                            if (newCheckOut && dateStr >= newCheckOut) {
                              setNewCheckOut('');
                            }
                            setEditDateStep('checkOut');
                          } else {
                            if (dateStr > newCheckIn) {
                              setNewCheckOut(dateStr);
                            }
                          }
                        }}
                        disabled={isDisabled}
                        className={`aspect-square flex items-center justify-center text-sm rounded-lg transition ${
                          isDisabled 
                            ? 'text-slate-300 cursor-not-allowed' 
                            : isSelected 
                              ? 'bg-purple-500 text-white font-bold' 
                              : isInRange
                                ? 'bg-purple-100 text-purple-700'
                                : 'hover:bg-purple-50 text-slate-700'
                        } ${isBookedByOthers ? 'bg-red-50 text-red-300' : ''}`}
                      >
                        {day}
                      </button>
                    );
                  }
                  return days;
                })()}
              </div>

              {/* Legend */}
              <div className="flex items-center justify-center gap-4 mt-4 text-xs text-slate-500">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 bg-purple-500 rounded"></div>
                  <span>Dipilih</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 bg-red-50 border border-red-200 rounded"></div>
                  <span>Tidak Tersedia</span>
                </div>
              </div>
            </div>

            {/* Warning */}
            <div className="px-4 pb-2">
              <p className="text-xs text-orange-600 bg-orange-50 p-2 rounded-lg text-center">
                ⚠️ Pertukaran tarikh hanya dibenarkan sekali sahaja
              </p>
            </div>

            {/* Actions */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex gap-3">
              <button
                onClick={() => setShowEditDateModal(false)}
                className="flex-1 py-3 bg-white text-slate-700 rounded-xl font-semibold hover:bg-slate-100 transition border border-slate-200"
              >
                Batal
              </button>
              <button
                onClick={handleEditDateSave}
                disabled={!newCheckIn || !newCheckOut || !checkEditDateAvailability() || calculateEditNights() < 1}
                className={`flex-1 py-3 rounded-xl font-semibold transition flex items-center justify-center gap-2 ${
                  newCheckIn && newCheckOut && checkEditDateAvailability() && calculateEditNights() >= 1
                    ? 'bg-purple-500 text-white hover:bg-purple-600'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                <CheckCircle className="w-4 h-4" />
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
              <div className="flex items-center justify-between mb-2">
                <label className="text-slate-500 text-xs">Edit mesej:</label>
                {savedTemplates[editingTemplate.key] && (
                  <button
                    onClick={() => resetTemplate(editingTemplate.key)}
                    className="text-xs text-orange-600 hover:text-orange-700 font-medium"
                  >
                    Reset Asal
                  </button>
                )}
              </div>
              <textarea
                value={editingTemplate.message}
                onChange={(e) => setEditingTemplate({ ...editingTemplate, message: e.target.value })}
                rows={12}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition resize-none font-mono"
              />
              {savedTemplates[editingTemplate.key] && (
                <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" /> Template telah disimpan
                </p>
              )}
            </div>
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex gap-2">
              <button
                onClick={() => setShowTemplateModal(false)}
                className="px-4 py-3 bg-white text-slate-700 rounded-xl font-semibold hover:bg-slate-100 transition border border-slate-200 text-sm"
              >
                Tutup
              </button>
              <button
                onClick={() => { saveTemplate(editingTemplate.key, editingTemplate.message); alert('Template disimpan!'); }}
                className="px-4 py-3 bg-green-500 text-white rounded-xl font-semibold hover:bg-green-600 transition text-sm"
              >
                Simpan
              </button>
              <button
                onClick={() => { navigator.clipboard.writeText(editingTemplate.message); alert('Mesej disalin!'); setShowTemplateModal(false); }}
                className="flex-1 py-3 bg-purple-500 text-white rounded-xl font-semibold hover:bg-purple-600 transition flex items-center justify-center gap-2 text-sm"
              >
                <Copy className="w-4 h-4" />
                Salin
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-slate-100 border-t border-slate-200 py-6 mt-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-center sm:text-left">
              <p className="text-slate-500 text-sm">© 2026 Lavender Villa Melaka</p>
              <p className="text-slate-400 text-xs">Sistem Pengurusan Tempahan</p>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-slate-400">Masalah teknikal?</span>
              <a href="https://wa.me/6001111458752" target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1">
                <Phone className="w-3.5 h-3.5" />
                Najmi (011-1145 8752)
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
