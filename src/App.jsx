import { useState, useEffect } from 'react';
import { Wifi, Coffee, Tv, Wind, MapPin, Star, X, Play, Phone, CheckCircle, Users, Sparkles, Moon, Sun, Cloud, Instagram, Mic, ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { getBookedDates, getPublicHolidays, createBooking, getProperty, getManuallyBlockedDates } from './lib/database';

export default function HomestayExperience() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [selectedDates, setSelectedDates] = useState({ checkIn: '', checkOut: '' });
  const [guests, setGuests] = useState(15);
  const [scrollY, setScrollY] = useState(0);
  const [activeStory, setActiveStory] = useState(0);
  const [message, setMessage] = useState('');
  const [spaceImageIndex, setSpaceImageIndex] = useState({});
  const [showCalendar, setShowCalendar] = useState(null);
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const [bookedDates, setBookedDates] = useState([]);
  const [manuallyBlockedDates, setManuallyBlockedDates] = useState([]); // Cuti/Tutup dates - fully blocked
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [showAlternatives, setShowAlternatives] = useState(false);
  const [clickedBookedDate, setClickedBookedDate] = useState(null);
  const [publicHolidaysList, setPublicHolidaysList] = useState([]);
  const [property, setProperty] = useState(null);
  const [showBookingSuccess, setShowBookingSuccess] = useState(false);
  const [bookingDetails, setBookingDetails] = useState(null);
  const [honeypot, setHoneypot] = useState(''); // Anti-bot honeypot field

  // Load data from Supabase
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load booked dates from Supabase
        const dates = await getBookedDates('lavender');
        setBookedDates(dates);
        
        // Load manually blocked dates (Cuti/Tutup) - these block both check-in AND check-out
        const manualBlocked = await getManuallyBlockedDates('lavender');
        setManuallyBlockedDates(manualBlocked);
        
        // Load public holidays from Supabase
        const holidays = await getPublicHolidays();
        setPublicHolidaysList(holidays);
        
        // Load property info
        const prop = await getProperty('lavender');
        setProperty(prop);
      } catch (error) {
        console.error('Error loading data:', error);
        // Fallback to localStorage if Supabase fails
        const savedDates = localStorage.getItem('bookedDates_lavender');
        const manualBlocked = localStorage.getItem('manualBlocked_lavender');
        let allBlockedDates = [];
        if (savedDates) allBlockedDates = [...JSON.parse(savedDates)];
        if (manualBlocked) {
          const manualBlockedArr = JSON.parse(manualBlocked);
          allBlockedDates = [...new Set([...allBlockedDates, ...manualBlockedArr])];
          setManuallyBlockedDates(manualBlockedArr);
        }
        setBookedDates(allBlockedDates.sort());
      }
    };
    
    loadData();
    
    // Refresh data every 30 seconds
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const images = [
    'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1600',
    'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1600',
    'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=1600',
    'https://images.unsplash.com/photo-1556912167-f556f1f39faa?w=1600',
    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1600',
  ];

  const stories = [
    {
      title: 'Check-In (3:00 PM)',
      time: 'mornings',
      icon: <Sun className="w-6 h-6" />,
      desc: 'Tiba dan terus berehat dengan selesa. Kolam renang siap untuk digunakan, dan anak-anak boleh berseronok di ruang permainan. Kawasan parking luas, muat sehingga 3 buah kereta.'
    },
    {
      title: 'Aktiviti Siang',
      time: 'afternoons',
      icon: <Cloud className="w-6 h-6" />,
      desc: 'Nikmati BBQ di luar, karaoke di ruang tamu, atau Netflix/Astro untuk hiburan santai. Dapur yang lengkap memudahkan tetamu memasak sendiri.'
    },
    {
      title: 'Malam yang Tenang',
      time: 'evenings',
      icon: <Moon className="w-6 h-6" />,
      desc: 'Berehat di 5 bilik berhawa dingin untuk tidur yang nyaman. Dilengkapi WiFi laju 300Mbps untuk streaming atau kerja. Check-out esok pada 12:00 PM, jadi masih sempat bersarapan dengan tenang.'
    },
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

  // Check if date is during school holiday
  const isSchoolHoliday = (dateStr) => {
    for (const range of schoolHolidayRanges) {
      if (dateStr >= range.start && dateStr <= range.end) {
        return range.name;
      }
    }
    return null;
  };

  // Check if booking requires minimum 2 nights (weekend during school holiday)
  // Returns true if check-in is on Saturday OR Sunday during school holiday
  const requiresMinStay = (checkInDateStr) => {
    const checkInDate = new Date(checkInDateStr + 'T00:00:00');
    const dayOfWeek = checkInDate.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6; // Saturday = 6, Sunday = 0
    const schoolHoliday = isSchoolHoliday(checkInDateStr);
    
    // Weekend check-in during school holiday requires min 2 nights
    return isWeekend && schoolHoliday;
  };
  
  // Check if any date in booking range includes weekend during school holiday
  // If yes, minimum 2 nights required
  const bookingRequiresMinStay = (checkInStr, checkOutStr) => {
    if (!checkInStr || !checkOutStr) return false;
    
    const start = new Date(checkInStr + 'T00:00:00');
    const end = new Date(checkOutStr + 'T00:00:00');
    
    // Check each date in the booking range (excluding checkout date)
    for (let d = new Date(start); d < end; d.setDate(d.getDate() + 1)) {
      const dateStr = formatDateToLocal(d);
      const dayOfWeek = d.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      const schoolHoliday = isSchoolHoliday(dateStr);
      
      if (isWeekend && schoolHoliday) {
        return true;
      }
    }
    return false;
  };

  const spaces = [
    {
      name: 'Ruang Tamu Luas',
      size: 'Smart TV 65"',
      features: ['Semua Saluran Astro', 'Netflix & Disney+', 'Karaoke'],
      images: [
        'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1600',
        'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1600',
        'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=1600'
      ]
    },
    {
      name: 'Dapur Lengkap',
      size: 'Dilengkapi Sepenuhnya',
      features: ['Periuk Nasi & Blender', 'Airfryer & Microwave', 'Alat Masak & Peralatan'],
      images: [
        'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=1600',
        'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1600',
        'https://images.unsplash.com/photo-1556909172-54557c7e4fb7?w=1600'
      ]
    },
    {
      name: '5 Bilik Tidur',
      size: 'Penghawa Dingin Penuh',
      features: ['Bilik Luas', '4 Bilik Air', 'Katil Selesa'],
      images: [
        'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1600',
        'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=1600',
        'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=1600'
      ]
    },
    {
      name: 'Kolam & Play Area',
      size: 'Kolam 30x12x4 kaki',
      features: ['Rumah Mainan Kanak-kanak', 'Gelongsor', 'Kawasan Aktiviti'],
      images: [
        'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1600',
        'https://images.unsplash.com/photo-1575429198097-0414ec08e8cd?w=1600',
        'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=1600'
      ]
    },
  ];

  const handleScrollTo = (id) => {
    const element = document.getElementById(id);
    if (element) {
      const offsetTop = element.offsetTop - 100;
      window.scrollTo({ top: offsetTop, behavior: 'smooth' });
    }
  };

  const TikTokIcon = () => (
    <svg className="w-5 h-5 sm:w-6 sm:h-6" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.68v13.67a2.4 2.4 0 1 1-2.4-2.4c.18 0 .37.02.56.07V9.41a7.26 7.26 0 0 0-1.25-.12A4.6 4.6 0 0 0 5 13.6a4.6 4.6 0 0 0 4.6 4.6 4.6 4.6 0 0 0 4.6-4.6V9.17a7.2 7.2 0 0 0 4.79 1.71v-3.19a4.8 4.8 0 0 1-.59-.05z" />
    </svg>
  );

  const handleBooking = async () => {
    // Honeypot check - if filled, it's a bot
    if (honeypot) {
      console.log('Bot detected via honeypot');
      return;
    }

    // Rate limiting - prevent spam (max 3 bookings per hour)
    const lastBookingTime = localStorage.getItem('lastBookingTime');
    const bookingCount = localStorage.getItem('bookingCount') || '0';
    const now = Date.now();

    if (lastBookingTime) {
      const timeDiff = now - parseInt(lastBookingTime);
      if (timeDiff < 3600000) { // 1 hour in milliseconds
        if (parseInt(bookingCount) >= 3) {
          alert('Terlalu banyak permintaan tempahan. Sila cuba lagi dalam 1 jam');
          return;
        }
        localStorage.setItem('bookingCount', (parseInt(bookingCount) + 1).toString());
      } else {
        localStorage.setItem('bookingCount', '1');
        localStorage.setItem('lastBookingTime', now.toString());
      }
    } else {
      localStorage.setItem('bookingCount', '1');
      localStorage.setItem('lastBookingTime', now.toString());
    }

    // Validate name
    if (!customerName.trim()) {
      alert('Sila masukkan nama anda');
      return;
    }

    // Validate phone
    if (!customerPhone.trim()) {
      alert('Sila masukkan nombor telefon anda');
      return;
    }

    // Validate phone format (Malaysian phone number)
    const phoneRegex = /^(\+?6?01)[0-9]{8,9}$/;
    const cleanPhone = customerPhone.replace(/[\s-]/g, '');
    if (!phoneRegex.test(cleanPhone)) {
      alert('Sila masukkan nombor telefon yang sah (contoh: 0123456789)');
      return;
    }

    // Validate dates
    if (!selectedDates.checkIn || !selectedDates.checkOut || calculateNights() === 0) {
      alert('Sila pilih tarikh daftar masuk dan daftar keluar yang sah');
      return;
    }

    // Validate check-in is not in the past
    const checkInDate = new Date(selectedDates.checkIn);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (checkInDate < today) {
      alert('Tarikh daftar masuk tidak boleh pada masa lalu');
      return;
    }

    // Validate minimum stay for weekend during school holiday (3H2M)
    const nights = calculateNights();
    if (bookingRequiresMinStay(selectedDates.checkIn, selectedDates.checkOut) && nights < 2) {
      alert('Tempahan yang termasuk hujung minggu semasa cuti sekolah memerlukan minimum 3 Hari 2 Malam');
      return;
    }

    // Validate message length (prevent spam)
    if (message.length > 500) {
      alert('Mesej terlalu panjang. Sila gunakan maksimum 500 aksara');
      return;
    }

    // Validate guests
    if (guests < 1 || guests > 20) {
      alert('Bilangan tetamu mesti antara 1 dan 20');
      return;
    }

    const total = calculateTotal();

    const checkIn = new Date(selectedDates.checkIn).toLocaleDateString('en-MY', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
    const checkOut = new Date(selectedDates.checkOut).toLocaleDateString('en-MY', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });

    // Sanitize inputs
    const sanitizedName = customerName.replace(/[<>]/g, '').trim();
    const sanitizedPhone = cleanPhone;
    const sanitizedMessage = message.replace(/[<>]/g, '').trim();

    // Save booking to Supabase
    try {
      const { supabase } = await import('./lib/supabase');
      
      // Get property ID
      const { data: prop } = await supabase
        .from('properties')
        .select('id')
        .eq('slug', 'lavender')
        .single();
      
      if (prop) {
        const bookingCode = 'LV' + new Date().toISOString().slice(2, 10).replace(/-/g, '') + Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        
        await supabase.from('bookings').insert({
          booking_code: bookingCode,
          property_id: prop.id,
          customer_name: sanitizedName,
          customer_phone: sanitizedPhone,
          check_in: selectedDates.checkIn,
          check_out: selectedDates.checkOut,
          nights: nights,
          guests: guests,
          total_amount: total,
          special_requests: sanitizedMessage,
          status: 'pending'
        });
      }
    } catch (error) {
      console.error('Error saving to Supabase:', error);
    }
    
    // Also save to localStorage as backup
    const newBooking = {
      id: `BK${Date.now()}`,
      name: sanitizedName,
      phone: sanitizedPhone,
      checkIn: selectedDates.checkIn,
      checkOut: selectedDates.checkOut,
      nights: nights,
      guests: guests,
      total: total,
      message: sanitizedMessage,
      status: 'pending',
      createdAt: new Date().toISOString(),
      property: 'lavender'
    };

    const existingBookings = JSON.parse(localStorage.getItem('bookings') || '[]');
    existingBookings.push(newBooking);
    localStorage.setItem('bookings', JSON.stringify(existingBookings));

    const bookingMessage = `*LAVENDER VILLA MELAKA – PERMOHONAN TEMPAHAN*

*Nama:* ${sanitizedName}
*No. Telefon:* ${sanitizedPhone}

*Daftar Masuk:* ${checkIn}
*Daftar Keluar:* ${checkOut}
*Malam:* ${nights}
*Tetamu:* ${guests}

*HARGA*
Penginapan: RM ${total.toLocaleString()}

*JUMLAH: RM ${total.toLocaleString()}*

${sanitizedMessage ? `*PERMINTAAN KHAS / SOALAN:*\n${sanitizedMessage}` : ''}

---
Saya ingin membuat tempahan untuk Lavender Villa Melaka pada tarikh di atas. Sila sahkan ketersediaan. Terima kasih!`;

    const encodedMessage = encodeURIComponent(bookingMessage);
    const whatsappURL = `https://wa.me/60193345686?text=${encodedMessage}`;
    
    // Save booking details for success modal
    setBookingDetails({
      name: sanitizedName,
      checkIn,
      checkOut,
      nights,
      guests,
      total
    });
    
    // Open WhatsApp
    window.open(whatsappURL, '_blank');
    
    // Show success modal
    setShowBookingSuccess(true);
    
    // Reset form
    setSelectedDates({ checkIn: '', checkOut: '' });
    setCustomerName('');
    setCustomerPhone('');
    setMessage('');
    setGuests(15);
  };

  const calculateNights = () => {
    if (selectedDates.checkIn && selectedDates.checkOut) {
      const start = new Date(selectedDates.checkIn);
      const end = new Date(selectedDates.checkOut);
      const nights = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
      return nights > 0 ? nights : 0;
    }
    return 0;
  };

  // Fallback public holidays (used if database not loaded yet)
  const fallbackHolidays = [
    '2025-01-01', '2025-01-29', '2025-01-30', '2025-03-31', '2025-04-01',
    '2025-05-01', '2025-05-12', '2025-06-02', '2025-06-07', '2025-06-27',
    '2025-08-31', '2025-09-05', '2025-09-16', '2025-10-15', '2025-10-20', '2025-12-25',
    '2026-01-01', '2026-02-17', '2026-02-18', '2026-02-20', '2026-03-21',
    '2026-03-22', '2026-03-23', '2026-03-24', '2026-05-01', '2026-05-27',
    '2026-05-31', '2026-06-01', '2026-06-17', '2026-08-24', '2026-08-25',
    '2026-08-31', '2026-09-16', '2026-11-08', '2026-12-25'
  ];

  // Helper function to format date to YYYY-MM-DD in local timezone (avoid UTC shift)
  const formatDateToLocal = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const isPublicHoliday = (date) => {
    const dateStr = formatDateToLocal(date);
    // Use database holidays if loaded, otherwise fallback
    const holidays = publicHolidaysList.length > 0 ? publicHolidaysList : fallbackHolidays;
    return holidays.includes(dateStr);
  };

  // Festive season dates (Hari Raya, CNY, Deepavali, Christmas periods)
  const festiveDates = [
    // Hari Raya Aidilfitri 2025 (March 30-31 + cuti)
    '2025-03-30', '2025-03-31', '2025-04-01',
    // Hari Raya Aidiladha 2025 (June 6-7)
    '2025-06-06', '2025-06-07',
    // Deepavali 2025 (October 20)
    '2025-10-20',
    // Christmas 2025 (Dec 24-25)
    '2025-12-24', '2025-12-25',
    // CNY 2026 (January 29-30)
    '2026-01-29', '2026-01-30',
    // Hari Raya Aidilfitri 2026 (March 20-22)
    '2026-03-20', '2026-03-21', '2026-03-22',
    // Deepavali 2026 (November 8)
    '2026-11-08',
    // Christmas 2026 (Dec 24-25)
    '2026-12-24', '2026-12-25'
  ];

  const isFestiveSeason = (date) => {
    const dateStr = formatDateToLocal(date);
    return festiveDates.includes(dateStr);
  };

  const calculateTotal = () => {
    if (!selectedDates.checkIn || !selectedDates.checkOut) return 0;
    const start = new Date(selectedDates.checkIn);
    const end = new Date(selectedDates.checkOut);
    
    // Calculate number of nights
    const nights = Math.round((end - start) / (1000 * 60 * 60 * 24));
    
    // Check if any date in the range is festive, weekend, or public holiday
    let hasFestive = false;
    let hasWeekendOrHoliday = false;
    
    for (let d = new Date(start); d < end; d.setDate(d.getDate() + 1)) {
      if (isFestiveSeason(d)) {
        hasFestive = true;
      }
      const dayOfWeek = d.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6; // Saturday & Sunday
      const isHoliday = isPublicHoliday(d);
      if (isWeekend || isHoliday) {
        hasWeekendOrHoliday = true;
      }
    }
    
    // Package pricing based on highest tier in the booking
    // Festive Season pricing (highest priority)
    if (hasFestive) {
      if (nights === 1) return 1700;  // 2H1M
      if (nights === 2) return 3200;  // 3H2M
      // For 3+ nights: 3H2M price + extra nights at festive rate
      return 3200 + ((nights - 2) * 1700);
    }
    
    // Weekend/SH/PH pricing
    if (hasWeekendOrHoliday) {
      if (nights === 1) return 1590;  // 2H1M
      if (nights === 2) return 2990;  // 3H2M
      // For 3+ nights: 3H2M price + extra nights at weekend rate
      return 2990 + ((nights - 2) * 1590);
    }
    
    // Weekday pricing
    if (nights === 1) return 1300;  // 2H1M
    if (nights === 2) return 2400;  // 3H2M
    // For 3+ nights: 3H2M price + extra nights at weekday rate
    return 2400 + ((nights - 2) * 1300);
  };

  const checkAvailability = () => {
    if (!selectedDates.checkIn || !selectedDates.checkOut) return null;
    const start = new Date(selectedDates.checkIn);
    const end = new Date(selectedDates.checkOut);
    
    for (let d = new Date(start); d < end; d.setDate(d.getDate() + 1)) {
      const dateStr = formatDateToLocal(d);
      if (bookedDates.includes(dateStr)) {
        return false;
      }
    }
    return true;
  };

  const isDateBooked = (date) => {
    const dateStr = formatDateToLocal(date);
    return bookedDates.includes(dateStr);
  };

  // Check if date is a checkout date (last day of a booking - available for new check-in)
  const isCheckoutDate = (date) => {
    const dateStr = formatDateToLocal(date);
    // A date is a checkout date if the previous day is booked but this day is not
    const prevDate = new Date(date);
    prevDate.setDate(prevDate.getDate() - 1);
    const prevDateStr = formatDateToLocal(prevDate);
    return bookedDates.includes(prevDateStr) && !bookedDates.includes(dateStr);
  };

  const isDatePast = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const formatDateForDisplay = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('ms-MY', { day: 'numeric', month: 'short', year: 'numeric' });
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

  const handleDateSelect = (date) => {
    if (isDatePast(date)) return;
    
    const dateStr = formatDateToLocal(date);
    const booked = isDateBooked(date);
    
    if (showCalendar === 'checkIn') {
      // For check-in: booked dates are NOT allowed
      if (booked) {
        setClickedBookedDate(dateStr);
        setShowAlternatives(true);
        setShowCalendar(null);
        setTimeout(() => {
          const element = document.getElementById('alternatives-clicked');
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 100);
        return;
      }
      
      setShowAlternatives(false);
      setClickedBookedDate(null);
      setSelectedDates({ ...selectedDates, checkIn: dateStr, checkOut: '' });
      setShowCalendar('checkOut');
    } else {
      // For check-out: must be after check-in and no blocked dates in between (including checkout date)
      if (dateStr > selectedDates.checkIn) {
        // Check if any dates between check-in and checkout are booked
        const start = new Date(selectedDates.checkIn + 'T00:00:00');
        const end = new Date(dateStr + 'T00:00:00');
        let hasBlockedInBetween = false;
        
        // Check dates from check-in up to (but NOT including) checkout
        // Checkout date CAN be booked (someone checking in at 3pm, you checkout at 12pm)
        for (let d = new Date(start); d < end; d.setDate(d.getDate() + 1)) {
          if (bookedDates.includes(formatDateToLocal(d))) {
            hasBlockedInBetween = true;
            break;
          }
        }
        
        if (hasBlockedInBetween) {
          // Can't book - blocked dates in range
          setClickedBookedDate(dateStr);
          setShowAlternatives(true);
          setShowCalendar(null);
          return;
        }
        
        // Check minimum stay requirement for weekend during school holiday
        const nights = Math.round((end - start) / (1000 * 60 * 60 * 24));
        if (bookingRequiresMinStay(selectedDates.checkIn, dateStr) && nights < 2) {
          alert('Tempahan yang termasuk hujung minggu semasa cuti sekolah memerlukan minimum 3 Hari 2 Malam.\n\nSila pilih tarikh checkout yang lebih jauh.');
          return;
        }
        
        setShowAlternatives(false);
        setClickedBookedDate(null);
        setSelectedDates({ ...selectedDates, checkOut: dateStr });
        setShowCalendar(null);
      }
    }
  };

  const isDateInRange = (date) => {
    if (!selectedDates.checkIn || !selectedDates.checkOut) return false;
    const dateStr = formatDateToLocal(date);
    return dateStr > selectedDates.checkIn && dateStr < selectedDates.checkOut;
  };

  const isDateSelected = (date) => {
    const dateStr = formatDateToLocal(date);
    return dateStr === selectedDates.checkIn || dateStr === selectedDates.checkOut;
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Floating Navigation */}
      <nav className="fixed top-2 sm:top-4 md:top-6 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-4xl px-2 sm:px-4">
        <div className="bg-white/5 backdrop-blur-2xl rounded-full px-3 sm:px-6 md:px-8 py-2 sm:py-3 shadow-2xl border border-white/20 flex items-center justify-between">
          <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="flex items-center gap-1 sm:gap-2 cursor-pointer transition flex-shrink-0 group">
            <div className="w-7 h-7 sm:w-9 sm:h-9 md:w-10 md:h-10 bg-gradient-to-br from-purple-400 to-purple-500 rounded-full flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 text-white" />
            </div>
            <span className="font-bold text-xs sm:text-sm md:text-base text-slate-900 tracking-tight hidden sm:inline">Lavender Villa Melaka</span>
          </button>
          <div className="h-4 sm:h-5 w-px bg-slate-200 mx-2 sm:mx-3 md:mx-4"></div>
          <div className="flex gap-1 sm:gap-2 md:gap-6 flex-shrink-0">
            <button onClick={() => handleScrollTo('experience')} className="text-slate-700 transition font-semibold cursor-pointer text-xs sm:text-sm md:text-base whitespace-nowrap px-2 sm:px-3 py-1.5 rounded-full hover:bg-slate-100">Info</button>
            <button onClick={() => handleScrollTo('spaces')} className="text-slate-700 transition font-semibold cursor-pointer text-xs sm:text-sm md:text-base whitespace-nowrap px-2 sm:px-3 py-1.5 rounded-full hover:bg-slate-100">Ruang</button>
            <button onClick={() => handleScrollTo('booking')} className="text-slate-700 transition font-semibold cursor-pointer text-xs sm:text-sm md:text-base whitespace-nowrap px-2 sm:px-3 py-1.5 rounded-full hover:bg-slate-100">Tempah</button>
          </div>
        </div>
      </nav>

      {/* Hero Section with Parallax */}
      <div className="relative h-screen overflow-hidden pt-12 sm:pt-0">
        <div className="absolute inset-0 transition-transform duration-300" style={{ transform: `translateY(${scrollY * 0.5}px)` }}>
          <img src={images[currentImageIndex]} alt="Homestay" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/50 via-transparent to-slate-900/70"></div>
        </div>

        <div className="absolute inset-0 flex flex-col items-center justify-center text-white px-4 sm:px-6">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-3 sm:mb-4 text-center tracking-tight">Lavender Villa Melaka</h1>
          <p className="text-base sm:text-lg md:text-xl mb-8 sm:mb-12 text-center max-w-3xl text-slate-100">Villa Mewah di Bemban, Melaka | Homestay Keluarga dengan Kolam Renang | Penginapan Terbaik untuk Cuti Keluarga</p>
          
          <div className="flex flex-col sm:flex-row gap-4 mb-16">
            <button onClick={() => handleScrollTo('booking')} className="bg-white text-slate-900 px-8 py-4 rounded-full font-bold hover:bg-slate-50 transition shadow-xl">Tempah Penginapan Anda</button>
            <button onClick={() => setShowVideoModal(true)} className="bg-white/15 backdrop-blur-md text-white px-8 py-4 rounded-full font-bold hover:bg-white/25 transition flex items-center justify-center gap-2 border border-white/30"><Play className="w-5 h-5" />Virtual Tour</button>
          </div>
          
          <div className="flex flex-wrap justify-center gap-6 sm:gap-10 text-sm">
            <div className="flex items-center gap-2"><Star className="w-4 h-4 sm:w-5 sm:h-5 fill-yellow-300 text-yellow-300" /><span className="font-semibold">5.0 Google Reviews</span></div>
            <div className="flex items-center gap-2"><MapPin className="w-4 h-4 sm:w-5 sm:h-5" /><span className="whitespace-nowrap font-semibold">Bemban, Melaka</span></div>
            <div className="flex items-center gap-2"><CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" /><span className="font-semibold">Tempahan Segera</span></div>
          </div>
        </div>

        {/* Image Navigation Arrows */}
        <button
          onClick={() => setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length)}
          className="absolute left-6 top-1/2 transform -translate-y-1/2 z-10 bg-white/20 hover:bg-white/40 text-white p-3 rounded-full transition backdrop-blur-sm"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button
          onClick={() => setCurrentImageIndex((prev) => (prev + 1) % images.length)}
          className="absolute right-6 top-1/2 transform -translate-y-1/2 z-10 bg-white/20 hover:bg-white/40 text-white p-3 rounded-full transition backdrop-blur-sm"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* Image Navigation Dots */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-2">
          {images.map((_, idx) => (
            <button key={idx} onClick={() => setCurrentImageIndex(idx)} className={`h-2 rounded-full transition-all ${currentImageIndex === idx ? 'bg-white w-8' : 'bg-white/50 w-2'}`} />
          ))}
        </div>
      </div>

      {/* Story Timeline - Full Width */}
      <div id="experience" className="w-full bg-gradient-to-br from-purple-50 via-white to-purple-50 py-20 sm:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-center mb-4 text-slate-900">Apa Yang Anda Dapat</h2>
          <p className="text-center text-slate-600 text-lg sm:text-xl mb-16 sm:mb-20">Dari check-in sampai check-out, semua dah ready untuk anda</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-10">
            {stories.map((story, idx) => (
              <div key={idx} onMouseEnter={() => setActiveStory(idx)} className={`relative overflow-hidden rounded-3xl cursor-pointer transition-all duration-500 bg-gradient-to-br from-purple-400 to-purple-500 ${activeStory === idx ? 'shadow-2xl scale-105' : 'shadow-lg scale-100'}`}>
                <div className="relative p-10 h-96 flex flex-col justify-between text-white">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center">{story.icon}</div>
                  <div>
                    <h3 className="text-3xl font-bold mb-3">{story.title}</h3>
                    <p className="text-white/95 text-lg leading-relaxed">{story.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Explore Spaces */}
      <div id="spaces" className="bg-white py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-4 text-slate-900">Jelajahi Ruang Kami</h2>
          <p className="text-center text-slate-600 text-lg mb-12 sm:mb-16">Ruang yang direka khas untuk keselesaan anda</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            {spaces.map((space, idx) => {
              const currentImg = spaceImageIndex[idx] || 0;
              return (
                <div key={idx} className="group relative overflow-hidden rounded-2xl h-96 shadow-md hover:shadow-xl transition-shadow duration-300">
                  <img src={space.images[currentImg]} alt={space.name} className="w-full h-full object-cover transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/95 via-slate-900/40 to-transparent"></div>
                  
                  {/* Navigation Arrows */}
                  <button 
                    onClick={() => setSpaceImageIndex(prev => ({ ...prev, [idx]: currentImg === 0 ? space.images.length - 1 : currentImg - 1 }))}
                    className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/40 transition opacity-0 group-hover:opacity-100"
                  >
                    <ChevronLeft className="w-5 h-5 text-white" />
                  </button>
                  <button 
                    onClick={() => setSpaceImageIndex(prev => ({ ...prev, [idx]: currentImg === space.images.length - 1 ? 0 : currentImg + 1 }))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/40 transition opacity-0 group-hover:opacity-100"
                  >
                    <ChevronRight className="w-5 h-5 text-white" />
                  </button>
                  
                  {/* Image Dots */}
                  <div className="absolute top-4 left-1/2 -translate-x-1/2 flex gap-1.5">
                    {space.images.map((_, imgIdx) => (
                      <button 
                        key={imgIdx} 
                        onClick={() => setSpaceImageIndex(prev => ({ ...prev, [idx]: imgIdx }))}
                        className={`h-1.5 rounded-full transition-all ${currentImg === imgIdx ? 'bg-white w-6' : 'bg-white/50 w-1.5'}`}
                      />
                    ))}
                  </div>
                  
                  <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 text-white">
                    <div className="inline-block bg-purple-500 px-3 py-1 rounded-full text-xs font-semibold mb-3">{space.size}</div>
                    <h3 className="text-2xl sm:text-3xl font-bold mb-3">{space.name}</h3>
                    <div className="flex flex-wrap gap-2">
                      {space.features.map((feature, i) => (
                        <span key={i} className="bg-white/15 backdrop-blur-sm px-3 py-1 rounded-full text-xs sm:text-sm">{feature}</span>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Premium Amenities */}
      <div className="bg-slate-50 py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-4 text-slate-900">Kemudahan Premium</h2>
          <p className="text-center text-slate-600 text-lg mb-12 sm:mb-16">Segala kemudahan disediakan untuk penginapan yang selesa dan eksklusif</p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {/* Wifi */}
            <div className="bg-white rounded-2xl p-8 shadow-md hover:shadow-lg transition-shadow duration-300 border border-slate-100">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-400 to-purple-500 rounded-xl flex items-center justify-center mb-6">
                <Wifi className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-slate-900">Unifi 300Mbps Percuma</h3>
              <p className="text-slate-600 text-sm leading-relaxed">Internet pantas untuk streaming, kerja, dan berhubung</p>
            </div>

            {/* TV */}
            <div className="bg-white rounded-2xl p-8 shadow-md hover:shadow-lg transition-shadow duration-300 border border-slate-100">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-400 to-purple-500 rounded-xl flex items-center justify-center mb-6">
                <Tv className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-slate-900">TV Premium</h3>
              <p className="text-slate-600 text-sm leading-relaxed">Astro, Netflix, Disney+ di TV pintar 65 inci</p>
            </div>

            {/* Kitchen */}
            <div className="bg-white rounded-2xl p-8 shadow-md hover:shadow-lg transition-shadow duration-300 border border-slate-100">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-400 to-purple-500 rounded-xl flex items-center justify-center mb-6">
                <Coffee className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-slate-900">Dapur Lengkap</h3>
              <p className="text-slate-600 text-sm leading-relaxed">Serba lengkap dengan semua peralatan dan alat masak</p>
            </div>

            {/* AC */}
            <div className="bg-white rounded-2xl p-8 shadow-md hover:shadow-lg transition-shadow duration-300 border border-slate-100">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-400 to-purple-500 rounded-xl flex items-center justify-center mb-6">
                <Wind className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-slate-900">Penghawa Dingin Penuh</h3>
              <p className="text-slate-600 text-sm leading-relaxed">Sejuk dan selesa di semua 5 bilik tidur</p>
            </div>

            {/* Play Area */}
            <div className="bg-white rounded-2xl p-8 shadow-md hover:shadow-lg transition-shadow duration-300 border border-slate-100">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-400 to-purple-500 rounded-xl flex items-center justify-center mb-6">
                <Users className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-slate-900">Kawasan Permainan Kanak-Kanak</h3>
              <p className="text-slate-600 text-sm leading-relaxed">Playground, gelongsor, dan aktiviti luar</p>
            </div>

            {/* Karaoke */}
            <div className="bg-white rounded-2xl p-8 shadow-md hover:shadow-lg transition-shadow duration-300 border border-slate-100">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-400 to-purple-500 rounded-xl flex items-center justify-center mb-6">
                <Mic className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-slate-900">Karaoke</h3>
              <p className="text-slate-600 text-sm leading-relaxed">Sistem karaoke untuk hiburan bersama keluarga</p>
            </div>
          </div>
        </div>
      </div>

      {/* Guest Reviews */}
      <div className="bg-white py-12 sm:py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-3 text-slate-900">Apa Kata Tetamu Kami</h2>
          <div className="flex items-center justify-center gap-2 mb-8 sm:mb-12">
            <Star className="w-5 h-5 fill-purple-300 text-purple-300" />
            <span className="text-lg sm:text-xl font-bold text-slate-900">5.0</span>
            <span className="text-slate-600 text-sm sm:text-base">di Google Reviews</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            <div className="bg-white rounded-2xl p-6 shadow-md border border-slate-200 hover:shadow-lg transition">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-300 to-purple-400 rounded-full flex items-center justify-center text-lg text-white font-bold flex-shrink-0">A</div>
                <div className="min-w-0">
                  <h3 className="font-bold text-base text-slate-900">Aryn Yusoff</h3>
                  <div className="flex gap-0.5 mt-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-purple-300 text-purple-300" />
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-slate-700 text-sm leading-relaxed">"The villa is spacious, clean, and comfortable. The kids absolutely loved the swimming pool. Special thanks to Kak Ila for her prompt responses and complimentary treats. We will definitely return!"</p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-md border border-slate-200 hover:shadow-lg transition">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-300 to-purple-400 rounded-full flex items-center justify-center text-lg text-white font-bold flex-shrink-0">Y</div>
                <div className="min-w-0">
                  <h3 className="font-bold text-base text-slate-900">Yana Zamri</h3>
                  <div className="flex gap-0.5 mt-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-purple-300 text-purple-300" />
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-slate-700 text-sm leading-relaxed">"3h2m di Lavender Villa Melaka. Rumah yg sangat cantik dan bersih family semua happy dan selesa. Anak anak pun teruja dapat bermain di dalam kawasan rumah dan paling best ada pool 🤩. Owner rumah sangat baik dan ramah orangnya 😍."</p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-md border border-slate-200 hover:shadow-lg transition">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-300 to-purple-400 rounded-full flex items-center justify-center text-lg text-white font-bold flex-shrink-0">H</div>
                <div className="min-w-0">
                  <h3 className="font-bold text-base text-slate-900">Hanin Naziha Hasnor</h3>
                  <div className="flex gap-0.5 mt-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-purple-300 text-purple-300" />
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-slate-700 text-sm leading-relaxed">"We had family day here with 10 adults and 11 kids. Beautiful, spacious n clean space for indoor n outdoor activities. The owner is very kind and sweet too. Easy to communicate with and so generous as we received 2 boxes of desserts, brownies and cheese tart as"</p>
            </div>
          </div>
        </div>
      </div>

      {/* Location Section */}
      <div className="bg-slate-50 py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-4 text-slate-900">Cari Kami</h2>
          <p className="text-center text-slate-600 text-lg mb-12 sm:mb-16">Terletak di kawasan Bemban, Melaka</p>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Map - Takes 2 columns */}
            <div className="lg:col-span-2 rounded-2xl overflow-hidden shadow-lg h-96 lg:h-96">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3984.5234567890123!2d102.3521975!3d2.2915775!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31d1e73e8455d413%3A0x3fd97fe2de23d790!2sLavender%20Villa%20Malacca!5e0!3m2!1sen!2smy!4v1234567890"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>

            {/* Location Info - Takes 1 column */}
            <div className="space-y-4">
              <div className="bg-white rounded-2xl p-6 shadow-md border border-slate-100 hover:shadow-lg transition">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-purple-500 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                    <MapPin className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 mb-1">Alamat</h3>
                    <p className="text-slate-600 text-sm leading-relaxed">47, Jalan Anjung Lavender 1, Taman Anjung Gapam, 77200 Bemban, Melaka</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-md border border-slate-100 hover:shadow-lg transition">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-purple-500 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                    <Phone className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 mb-2">Hubungi</h3>
                    <a href="tel:+60193345686" className="text-purple-600 hover:text-purple-700 font-semibold text-sm transition">+60 19 334 5686</a>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-md border border-slate-100 hover:shadow-lg transition">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-purple-500 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                    <MapPin className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 mb-2">Lihat Peta</h3>
                    <a href="https://www.google.com/maps/place/Lavender+Villa+Malacca/@2.2915775,102.3521975,17z" target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:text-purple-700 font-semibold text-sm transition">
                      Buka di Google Maps
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Section */}
      <div id="booking" className="bg-white py-12 sm:py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 text-slate-900">Tempah Penginapan Villa Anda</h2>
            <p className="text-slate-600 text-sm sm:text-base md:text-lg mb-2">Sesuai untuk keluarga & kumpulan • Sehingga 20 tetamu</p>
            <p className="text-purple-600 text-sm sm:text-base font-semibold">Penginapan Muslim Sahaja</p>
          </div>

          <div className="bg-gradient-to-br from-slate-50 to-white rounded-2xl sm:rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-lg">
            {/* Mobile Backdrop for Calendar/Dropdown */}
            {showCalendar && (
              <div 
                className="fixed inset-0 bg-black/30 z-40 sm:hidden" 
                onClick={() => setShowCalendar(null)}
              />
            )}

            {/* Booking Form Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
              {/* Check In */}
              <div className="group relative">
                <label className="block text-slate-900 font-bold mb-2 text-xs sm:text-sm uppercase tracking-widest">Daftar Masuk</label>
                <div className="relative">
                  <button 
                    type="button"
                    onClick={() => setShowCalendar(showCalendar === 'checkIn' ? null : 'checkIn')}
                    className="w-full px-3 sm:px-4 py-3 sm:py-4 bg-white border-2 border-slate-200 rounded-xl sm:rounded-2xl text-left focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition duration-300 flex items-center justify-between"
                  >
                    <span className={`font-semibold text-sm ${selectedDates.checkIn ? 'text-slate-900' : 'text-slate-400'}`}>
                      {selectedDates.checkIn ? formatDateForDisplay(selectedDates.checkIn) : 'Pilih tarikh'}
                    </span>
                    <Calendar className="w-5 h-5 text-slate-400" />
                  </button>
                  {selectedDates.checkIn && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedDates({ checkIn: '', checkOut: '' });
                        setShowCalendar(null);
                      }}
                      className="absolute right-10 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-100 rounded-full transition"
                    >
                      <X className="w-4 h-4 text-slate-400 hover:text-slate-600" />
                    </button>
                  )}
                </div>
                
                {/* Calendar Dropdown for Check In */}
                {showCalendar === 'checkIn' && (
                  <div className="fixed sm:absolute inset-x-4 sm:inset-x-auto top-1/2 sm:top-full left-auto sm:left-0 right-auto sm:right-0 -translate-y-1/2 sm:translate-y-0 sm:mt-2 bg-white rounded-2xl shadow-xl border border-slate-200 p-4 z-50 max-w-sm mx-auto sm:max-w-none">
                    <div className="flex items-center justify-between mb-2 sm:hidden">
                      <span className="font-bold text-slate-900 text-sm">Pilih Tarikh Masuk</span>
                      <button onClick={() => setShowCalendar(null)} className="p-1 hover:bg-slate-100 rounded-lg transition">
                        <X className="w-5 h-5 text-slate-500" />
                      </button>
                    </div>
                    <div className="flex items-center justify-between mb-4">
                      <button onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1))} className="p-2 hover:bg-slate-100 rounded-lg transition">
                        <ChevronLeft className="w-5 h-5 text-slate-600" />
                      </button>
                      <span className="font-bold text-slate-900">
                        {calendarMonth.toLocaleDateString('ms-MY', { month: 'long', year: 'numeric' })}
                      </span>
                      <button onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1))} className="p-2 hover:bg-slate-100 rounded-lg transition">
                        <ChevronRight className="w-5 h-5 text-slate-600" />
                      </button>
                    </div>
                    <div className="grid grid-cols-7 gap-1 mb-2">
                      {['Ah', 'Is', 'Se', 'Ra', 'Kh', 'Ju', 'Sa'].map(day => (
                        <div key={day} className="text-center text-xs font-semibold text-slate-500 py-2">{day}</div>
                      ))}
                    </div>
                    <div className="grid grid-cols-7 gap-1">
                      {(() => {
                        const { daysInMonth, startingDay } = getDaysInMonth(calendarMonth);
                        const days = [];
                        for (let i = 0; i < startingDay; i++) {
                          days.push(<div key={`empty-${i}`} />);
                        }
                        for (let day = 1; day <= daysInMonth; day++) {
                          const date = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), day);
                          const dateStr = formatDateToLocal(date);
                          const isPast = isDatePast(date);
                          const isBooked = isDateBooked(date);
                          const isSelected = isDateSelected(date);
                          const isHoliday = isPublicHoliday(date);
                          const needsMinStay = requiresMinStay(dateStr);
                          days.push(
                            <button
                              key={day}
                              onClick={() => handleDateSelect(date)}
                              disabled={isPast}
                              className={`p-2 text-sm rounded-lg transition relative ${
                                isSelected ? 'bg-purple-500 text-white font-bold' :
                                isBooked ? 'bg-red-100 text-red-500 cursor-pointer hover:bg-red-200' :
                                isPast ? 'text-slate-300 cursor-not-allowed' :
                                isHoliday ? 'bg-orange-50 text-orange-600 hover:bg-orange-100 font-medium' :
                                'hover:bg-purple-100 text-slate-700'
                              }`}
                              title={needsMinStay && !isPast && !isBooked ? 'Min 3H2M' : ''}
                            >
                              {day}
                              {needsMinStay && !isBooked && !isPast && (
                                <span className="absolute -top-1 -left-1 w-4 h-4 bg-amber-500 rounded-full text-[8px] text-white font-bold flex items-center justify-center">2</span>
                              )}
                              {isHoliday && !isBooked && !isPast && (
                                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-orange-400 rounded-full"></span>
                              )}
                            </button>
                          );
                        }
                        return days;
                      })()}
                    </div>
                  </div>
                )}
              </div>

              {/* Check Out */}
              <div className="group relative">
                <label className="block text-slate-900 font-bold mb-2 text-xs sm:text-sm uppercase tracking-widest">Daftar Keluar</label>
                <div className="relative">
                  <button 
                    type="button"
                    onClick={() => setShowCalendar(showCalendar === 'checkOut' ? null : 'checkOut')}
                    className="w-full px-3 sm:px-4 py-3 sm:py-4 bg-white border-2 border-slate-200 rounded-xl sm:rounded-2xl text-left focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition duration-300 flex items-center justify-between"
                  >
                    <span className={`font-semibold text-sm ${selectedDates.checkOut ? 'text-slate-900' : 'text-slate-400'}`}>
                      {selectedDates.checkOut ? formatDateForDisplay(selectedDates.checkOut) : 'Pilih tarikh'}
                    </span>
                    <Calendar className="w-5 h-5 text-slate-400" />
                  </button>
                  {selectedDates.checkOut && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedDates({ ...selectedDates, checkOut: '' });
                        setShowCalendar(null);
                      }}
                      className="absolute right-10 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-100 rounded-full transition"
                    >
                      <X className="w-4 h-4 text-slate-400 hover:text-slate-600" />
                    </button>
                  )}
                </div>
                
                {/* Calendar Dropdown for Check Out */}
                {showCalendar === 'checkOut' && (
                  <div className="fixed sm:absolute inset-x-4 sm:inset-x-auto top-1/2 sm:top-full left-auto sm:left-0 right-auto sm:right-0 -translate-y-1/2 sm:translate-y-0 sm:mt-2 bg-white rounded-2xl shadow-xl border border-slate-200 p-4 z-50 max-w-sm mx-auto sm:max-w-none">
                    <div className="flex items-center justify-between mb-2 sm:hidden">
                      <span className="font-bold text-slate-900 text-sm">Pilih Tarikh Keluar</span>
                      <button onClick={() => setShowCalendar(null)} className="p-1 hover:bg-slate-100 rounded-lg transition">
                        <X className="w-5 h-5 text-slate-500" />
                      </button>
                    </div>
                    <div className="flex items-center justify-between mb-4">
                      <button onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1))} className="p-2 hover:bg-slate-100 rounded-lg transition">
                        <ChevronLeft className="w-5 h-5 text-slate-600" />
                      </button>
                      <span className="font-bold text-slate-900">
                        {calendarMonth.toLocaleDateString('ms-MY', { month: 'long', year: 'numeric' })}
                      </span>
                      <button onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1))} className="p-2 hover:bg-slate-100 rounded-lg transition">
                        <ChevronRight className="w-5 h-5 text-slate-600" />
                      </button>
                    </div>
                    <div className="grid grid-cols-7 gap-1 mb-2">
                      {['Ah', 'Is', 'Se', 'Ra', 'Kh', 'Ju', 'Sa'].map(day => (
                        <div key={day} className="text-center text-xs font-semibold text-slate-500 py-2">{day}</div>
                      ))}
                    </div>
                    <div className="grid grid-cols-7 gap-1">
                      {(() => {
                        const { daysInMonth, startingDay } = getDaysInMonth(calendarMonth);
                        const days = [];
                        for (let i = 0; i < startingDay; i++) {
                          days.push(<div key={`empty-${i}`} />);
                        }
                        for (let day = 1; day <= daysInMonth; day++) {
                          const date = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), day);
                          const isPast = isDatePast(date);
                          const isBooked = isDateBooked(date);
                          const isSelected = isDateSelected(date);
                          const isInRange = isDateInRange(date);
                          const dateStr = formatDateToLocal(date);
                          // For checkout: must be AFTER check-in date (not same day or before)
                          const isBeforeOrSameAsCheckIn = selectedDates.checkIn && dateStr <= selectedDates.checkIn;
                          const isHoliday = isPublicHoliday(date);
                          // Check if this date is manually blocked (Cuti/Tutup) - NO checkout allowed
                          const isManuallyBlocked = manuallyBlockedDates.includes(dateStr);
                          // Check if there are blocked dates between check-in and this date (exclusive of checkout date)
                          // Checkout date CAN be booked (from paid bookings) - someone else checking in at 3pm, you checkout at 12pm
                          // BUT manually blocked dates (Cuti/Tutup) block BOTH check-in AND check-out
                          let hasBlockedBetween = false;
                          if (selectedDates.checkIn && dateStr > selectedDates.checkIn) {
                            const start = new Date(selectedDates.checkIn + 'T00:00:00');
                            const end = new Date(dateStr + 'T00:00:00');
                            // Only check dates BETWEEN check-in and checkout (not including checkout)
                            for (let d = new Date(start); d < end; d.setDate(d.getDate() + 1)) {
                              if (bookedDates.includes(formatDateToLocal(d))) {
                                hasBlockedBetween = true;
                                break;
                              }
                            }
                          }
                          // Check minimum stay requirement - if booking includes weekend during school holiday
                          let failsMinStay = false;
                          if (selectedDates.checkIn && dateStr > selectedDates.checkIn && !hasBlockedBetween && !isManuallyBlocked) {
                            const start = new Date(selectedDates.checkIn + 'T00:00:00');
                            const end = new Date(dateStr + 'T00:00:00');
                            const nights = Math.round((end - start) / (1000 * 60 * 60 * 24));
                            if (bookingRequiresMinStay(selectedDates.checkIn, dateStr) && nights < 2) {
                              failsMinStay = true;
                            }
                          }
                          // For checkout: blocked if manually blocked OR has blocked dates in between OR fails min stay
                          // Manually blocked = Cuti/Tutup (fully blocked, no check-in or check-out)
                          const isBlocked = isManuallyBlocked || hasBlockedBetween || failsMinStay;
                          days.push(
                            <button
                              key={day}
                              onClick={() => handleDateSelect(date)}
                              disabled={isPast || isBeforeOrSameAsCheckIn || isBlocked}
                              className={`p-2 text-sm rounded-lg transition relative group/day ${
                                isSelected ? 'bg-purple-500 text-white font-bold' :
                                isInRange ? 'bg-purple-100 text-purple-700' :
                                failsMinStay ? 'bg-amber-100 text-amber-400 cursor-not-allowed' :
                                isManuallyBlocked ? 'bg-red-100 text-red-400 cursor-not-allowed' :
                                isBlocked ? 'bg-red-100 text-red-400 cursor-not-allowed' :
                                isPast || isBeforeOrSameAsCheckIn ? 'text-slate-300 cursor-not-allowed' :
                                isBooked ? 'bg-green-50 text-green-600 hover:bg-green-100 font-medium' :
                                isHoliday ? 'bg-orange-50 text-orange-600 hover:bg-orange-100 font-medium' :
                                'hover:bg-purple-100 text-slate-700'
                              }`}
                              title={failsMinStay ? 'Min 3H2M' : (isManuallyBlocked ? 'Cuti/Tutup - tidak boleh checkout' : (isBooked && !isBlocked ? 'Boleh checkout hari ini' : ''))}
                            >
                              {day}
                              {failsMinStay && (
                                <span className="absolute -top-1 -left-1 w-4 h-4 bg-amber-500 rounded-full text-[8px] text-white font-bold flex items-center justify-center">2</span>
                              )}
                              {isBooked && !isBlocked && !isManuallyBlocked && !isPast && !isBeforeOrSameAsCheckIn && (
                                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-green-400 rounded-full"></span>
                              )}
                              {isHoliday && !isBooked && !isPast && !isBeforeOrSameAsCheckIn && !failsMinStay && (
                                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-orange-400 rounded-full"></span>
                              )}
                            </button>
                          );
                        }
                        return days;
                      })()}
                    </div>
                    {/* Legend */}
                    <div className="mt-3 pt-2 border-t border-slate-100 flex flex-wrap items-center justify-center gap-3 text-xs">
                      <div className="flex items-center gap-1.5">
                        <span className="w-4 h-4 bg-red-100 rounded"></span>
                        <span className="text-slate-600">Tidak Tersedia</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-4 h-4 bg-amber-100 rounded flex items-center justify-center"><span className="w-3 h-3 bg-amber-500 rounded-full text-[6px] text-white font-bold flex items-center justify-center">2</span></span>
                        <span className="text-slate-600">Min 3H2M</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-4 h-4 bg-green-50 rounded relative">
                          <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-green-400 rounded-full"></span>
                        </span>
                        <span className="text-slate-600">Boleh Checkout</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-4 h-4 bg-orange-50 rounded relative">
                          <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-orange-400 rounded-full"></span>
                        </span>
                        <span className="text-slate-600">Cuti Umum</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Tetamu */}
              <div className="group relative">
                <label className="block text-slate-900 font-bold mb-2 text-xs sm:text-sm uppercase tracking-widest">Tetamu</label>
                <button 
                  type="button"
                  onClick={() => setShowCalendar(showCalendar === 'guests' ? null : 'guests')}
                  className="w-full px-3 sm:px-4 py-3 sm:py-4 bg-white border-2 border-slate-200 rounded-xl sm:rounded-2xl text-left focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition duration-300 flex items-center justify-between"
                >
                  <span className="font-semibold text-sm text-slate-900">{guests} Tetamu</span>
                  <Users className="w-5 h-5 text-slate-400" />
                </button>
                
                {/* Guests Dropdown */}
                {showCalendar === 'guests' && (
                  <div className="fixed sm:absolute inset-x-4 sm:inset-x-auto top-1/2 sm:top-full left-auto sm:left-0 right-auto sm:right-0 -translate-y-1/2 sm:translate-y-0 sm:mt-2 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50 max-h-80 overflow-y-auto max-w-sm mx-auto sm:max-w-none">
                    <div className="flex items-center justify-between mb-2 px-2 sm:hidden">
                      <span className="font-bold text-slate-900 text-sm">Pilih Bilangan Tetamu</span>
                      <button onClick={() => setShowCalendar(null)} className="p-1 hover:bg-slate-100 rounded-lg transition">
                        <X className="w-5 h-5 text-slate-500" />
                      </button>
                    </div>
                    {[1, 2, 4, 6, 8, 10, 12, 15, 20].map(num => (
                      <button
                        key={num}
                        onClick={() => { setGuests(num); setShowCalendar(null); }}
                        className={`w-full px-4 py-3 text-left rounded-xl transition text-sm ${
                          guests === num 
                            ? 'bg-purple-500 text-white font-semibold' 
                            : 'hover:bg-purple-50 text-slate-700'
                        }`}
                      >
                        {num} Tetamu
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Honeypot field - hidden from real users, bots will fill it */}
            <div className="absolute -left-[9999px] opacity-0 h-0 overflow-hidden" aria-hidden="true">
              <label htmlFor="website">Website</label>
              <input 
                type="text"
                id="website"
                name="website"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
                tabIndex={-1}
                autoComplete="off"
              />
            </div>

            {/* Name and Phone */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
              <div>
                <label className="block text-slate-900 font-bold mb-2 text-xs sm:text-sm uppercase tracking-widest">Nama Penuh</label>
                <input 
                  type="text"
                  value={customerName} 
                  onChange={(e) => setCustomerName(e.target.value)} 
                  placeholder="Masukkan nama penuh anda"
                  className="w-full px-3 sm:px-4 py-3 sm:py-4 bg-white border-2 border-slate-200 rounded-xl sm:rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition duration-300 font-semibold text-base"
                />
              </div>
              <div>
                <label className="block text-slate-900 font-bold mb-2 text-xs sm:text-sm uppercase tracking-widest">No. Telefon</label>
                <input 
                  type="tel"
                  value={customerPhone} 
                  onChange={(e) => setCustomerPhone(e.target.value)} 
                  placeholder="Contoh: 0123456789"
                  className="w-full px-3 sm:px-4 py-3 sm:py-4 bg-white border-2 border-slate-200 rounded-xl sm:rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition duration-300 font-semibold text-base"
                />
              </div>
            </div>

            {/* Message/Request */}
            <div className="mb-6 sm:mb-8">
              <label className="block text-slate-900 font-bold mb-2 text-xs sm:text-sm uppercase tracking-widest">Permintaan atau Pertanyaan (Pilihan)</label>
              <textarea 
                value={message} 
                onChange={(e) => setMessage(e.target.value)} 
                placeholder="Beritahu kami apa yang anda ingin tanyakan atau minta..."
                className="w-full px-3 sm:px-4 py-3 sm:py-4 bg-white border-2 border-slate-200 rounded-xl sm:rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition duration-300 font-semibold text-base resize-none"
                rows={4}
              />
            </div>

            {/* Pricing Summary */}
            {calculateNights() > 0 && checkAvailability() && (
              <div className="bg-white rounded-2xl p-6 mb-6 border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-slate-500 text-sm">{calculateNights()} malam</p>
                    <p className="text-slate-900 text-sm">
                      {formatDateForDisplay(selectedDates.checkIn)} - {formatDateForDisplay(selectedDates.checkOut)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl sm:text-4xl font-bold text-slate-900">RM {calculateTotal().toLocaleString()}</p>
                  </div>
                </div>
                <div className="pt-4 border-t border-slate-100 text-xs text-slate-400">
                  <div className="flex items-center justify-center gap-4 flex-wrap">
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 bg-red-100 border border-red-200 rounded"></div>
                      <span>Telah Ditempah</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 bg-orange-50 border border-orange-200 rounded relative">
                        <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-orange-400 rounded-full"></span>
                      </div>
                      <span>Cuti Umum</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Unavailable Dates */}
            {calculateNights() > 0 && !checkAvailability() && (
              <div className="bg-white rounded-2xl p-6 mb-6 border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-slate-400 text-sm">{calculateNights()} malam</p>
                    <p className="text-slate-500 text-sm">
                      {formatDateForDisplay(selectedDates.checkIn)} - {formatDateForDisplay(selectedDates.checkOut)}
                    </p>
                  </div>
                  <div className="bg-slate-100 px-3 py-1 rounded-full">
                    <p className="text-slate-500 text-sm font-medium">Tidak Tersedia</p>
                  </div>
                </div>
                <p className="text-slate-500 text-sm mb-4">Tarikh ini telah ditempah. Pilih tarikh lain atau lihat villa lain.</p>
                <button 
                  onClick={() => handleScrollTo('alternatives')}
                  className="w-full py-3 rounded-xl font-semibold text-sm bg-purple-500 text-white hover:bg-purple-600 transition"
                >
                  Lihat Villa Lain
                </button>
              </div>
            )}

            {/* Teks Pembantu */}
            {(!selectedDates.checkIn || !selectedDates.checkOut) && (
              <div className="rounded-2xl p-4 mb-6 bg-slate-50 border border-slate-200 text-center">
                <p className="text-slate-500 text-sm">Pilih tarikh untuk melihat harga</p>
              </div>
            )}

            {/* Book Button */}
            {(!selectedDates.checkIn || !selectedDates.checkOut || checkAvailability()) && (
              <button 
                onClick={handleBooking}
                disabled={!selectedDates.checkIn || !selectedDates.checkOut || !customerName.trim() || !customerPhone.trim()}
                className={`w-full py-4 sm:py-5 rounded-xl sm:rounded-2xl font-bold text-base sm:text-lg transition transform duration-300 ${
                  !selectedDates.checkIn || !selectedDates.checkOut || !customerName.trim() || !customerPhone.trim()
                    ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-purple-400 via-purple-500 to-purple-600 text-white hover:from-purple-500 hover:via-purple-600 hover:to-purple-700 hover:scale-105 shadow-lg hover:shadow-purple-500/50'
                }`}
              >
                {!customerName.trim() || !customerPhone.trim() ? 'Isi Nama & No. Telefon' : !selectedDates.checkIn || !selectedDates.checkOut ? 'Pilih Tarikh untuk Book' : 'Book Sekarang'}
              </button>
            )}

            {/* Pricing Info - Clean inline design */}
            <div className="mt-6 pt-6 border-t border-slate-200">
              <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm">
                <span className="text-slate-500">Weekday <span className="font-semibold text-slate-700">RM1,300</span></span>
                <span className="text-slate-300">|</span>
                <span className="text-slate-500">Weekend/PH <span className="font-semibold text-purple-600">RM1,590</span></span>
                <span className="text-slate-300">|</span>
                <span className="text-slate-500">Festive <span className="font-semibold text-amber-600">RM1,700</span></span>
              </div>
              <p className="text-slate-400 text-xs text-center mt-3">Weekend & Cuti Sekolah: Min 3H2M • Pengesahan melalui WhatsApp</p>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Host - Show when dates are unavailable in booking form */}
      {selectedDates.checkIn && selectedDates.checkOut && !checkAvailability() && (
        <div id="alternatives" className="py-12 sm:py-16 bg-gradient-to-br from-purple-50 via-white to-purple-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <div className="bg-white rounded-3xl p-8 sm:p-10 shadow-xl border border-slate-200 text-center">
              {/* Icon */}
              <div className="w-20 h-20 bg-gradient-to-br from-purple-400 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-purple-500/30">
                <Calendar className="w-10 h-10 text-white" />
              </div>
              
              {/* Date Info */}
              <p className="text-purple-600 text-sm font-semibold mb-2">
                {new Date(selectedDates.checkIn).toLocaleDateString('ms-MY', { day: 'numeric', month: 'long' })} - {new Date(selectedDates.checkOut).toLocaleDateString('ms-MY', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
              
              <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3">Tarikh Tidak Tersedia</h3>
              <p className="text-slate-600 mb-8 max-w-md mx-auto">
                Lavender Villa Melaka tidak tersedia pada tarikh yang dipilih. Hubungi kami untuk bantuan mencari tarikh lain atau pilihan penginapan alternatif.
              </p>
              
              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <a 
                  href={`https://wa.me/60193345686?text=Hai%2C%20saya%20ingin%20bertanya%20tentang%20kekosongan%20Lavender%20Villa%20Melaka%20untuk%20tarikh%20${selectedDates.checkIn}%20hingga%20${selectedDates.checkOut}.%20Adakah%20tarikh%20lain%20yang%20tersedia%3F`} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-purple-600 hover:to-purple-700 transition shadow-lg shadow-purple-500/30"
                >
                  <Phone className="w-5 h-5" /> Hubungi Kami
                </a>
                <button 
                  onClick={() => setSelectedDates({ checkIn: '', checkOut: '' })}
                  className="px-8 py-4 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200 transition"
                >
                  Pilih Tarikh Lain
                </button>
              </div>
              
              {/* Help Text */}
              <p className="text-slate-400 text-xs mt-6">Kami akan membantu anda mencari tarikh atau penginapan yang sesuai</p>
            </div>
          </div>
        </div>
      )}

      {/* Alternative Homestays Section - Shows inline when clicking booked date in calendar */}
      {showAlternatives && (
        <div id="alternatives-clicked" className="py-12 sm:py-16 bg-gradient-to-br from-purple-50 via-white to-purple-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            {/* Contact Host Card */}
            <div className="bg-white rounded-3xl p-8 sm:p-10 shadow-xl border border-slate-200 text-center">
              <button 
                onClick={() => setShowAlternatives(false)} 
                className="absolute top-4 right-4 p-2 hover:bg-slate-100 rounded-full transition"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
              
              {/* Icon */}
              <div className="w-20 h-20 bg-gradient-to-br from-purple-400 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-purple-500/30">
                <Calendar className="w-10 h-10 text-white" />
              </div>
              
              {/* Date Info */}
              <p className="text-purple-600 text-sm font-semibold mb-2">
                {clickedBookedDate && new Date(clickedBookedDate).toLocaleDateString('ms-MY', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
              
              <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3">Tarikh Ini Telah Ditempah</h3>
              <p className="text-slate-600 mb-8 max-w-md mx-auto">
                Lavender Villa Melaka tidak tersedia pada tarikh ini. Hubungi kami untuk bantuan mencari tarikh lain atau pilihan penginapan alternatif.
              </p>
              
              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <a 
                  href={`https://wa.me/60193345686?text=Hai%2C%20saya%20ingin%20bertanya%20tentang%20kekosongan%20Lavender%20Villa%20Melaka%20untuk%20tarikh%20${clickedBookedDate}.%20Adakah%20tarikh%20lain%20yang%20tersedia%3F`} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-purple-600 hover:to-purple-700 transition shadow-lg shadow-purple-500/30"
                >
                  <Phone className="w-5 h-5" /> Hubungi Kami
                </a>
                <button 
                  onClick={() => setShowAlternatives(false)}
                  className="px-8 py-4 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200 transition"
                >
                  Pilih Tarikh Lain
                </button>
              </div>
              
              {/* Help Text */}
              <p className="text-slate-400 text-xs mt-6">Kami akan membantu anda mencari tarikh atau penginapan yang sesuai</p>
            </div>
          </div>
        </div>
      )}

      {/* Why Choose Us Section */}
      <div className="bg-white py-12 sm:py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-3 text-slate-900">Kenapa Pilih Lavender Villa?</h2>
          <p className="text-center text-slate-600 text-base sm:text-lg mb-8 sm:mb-12 max-w-2xl mx-auto">
            Villa mewah di Bemban, Melaka untuk percutian keluarga yang tidak dapat dilupakan
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            <div className="bg-white rounded-2xl p-8 shadow-md border border-slate-100 hover:shadow-lg transition">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-400 to-purple-500 rounded-xl flex items-center justify-center mb-6">
                <MapPin className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-slate-900">Lokasi Strategik</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Terletak di Bemban, Melaka dengan akses mudah ke Jonker Street, A Famosa, dan Pantai Klebang
              </p>
            </div>
            
            <div className="bg-white rounded-2xl p-8 shadow-md border border-slate-100 hover:shadow-lg transition">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-400 to-purple-500 rounded-xl flex items-center justify-center mb-6">
                <Users className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-slate-900">Sesuai untuk Keluarga</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                5 bilik tidur dengan 4 bilik air yang selesa untuk 15 orang, maksimum 20 orang termasuk kanak-kanak berusia 5 tahun ke atas
              </p>
            </div>
            
            <div className="bg-white rounded-2xl p-8 shadow-md border border-slate-100 hover:shadow-lg transition">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-400 to-purple-500 rounded-xl flex items-center justify-center mb-6">
                <Star className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-slate-900">Harga Berpatutan</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Pakej bermula dari RM1,300 (2H1M) dengan kemudahan lengkap termasuk kolam renang, BBQ, dan WiFi percuma
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div>
              <h3 className="text-2xl font-bold mb-3 bg-gradient-to-r from-purple-400 to-purple-500 bg-clip-text text-transparent">Lavender Villa Melaka</h3>
              <p className="text-slate-400 text-sm leading-relaxed">Tempat penginapan keluarga terbaik di villa Bemban, Melaka</p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-bold mb-4 text-white">Quick Links</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><button onClick={() => handleScrollTo('experience')} className="hover:text-purple-400 transition">Info</button></li>
                <li><button onClick={() => handleScrollTo('spaces')} className="hover:text-purple-400 transition">Ruang</button></li>
                <li><button onClick={() => handleScrollTo('booking')} className="hover:text-purple-400 transition">Tempah Sekarang</button></li>
                <li><a href="/faq" className="hover:text-purple-400 transition">FAQ</a></li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-bold mb-4 text-white">Hubungi</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="tel:+60193345686" className="hover:text-purple-400 transition">+60 19 334 5686</a></li>
                <li><a href="https://wasap.my/60193345686/PPHMLVM" target="_blank" rel="noopener noreferrer" className="hover:text-purple-400 transition">WhatsApp</a></li>
                <li className="text-xs">Bemban, Melaka</li>
              </ul>
            </div>

            {/* Social */}
            <div>
              <h4 className="font-bold mb-4 text-white">Ikuti Kami</h4>
              <div className="flex gap-4">
                <a href="https://www.instagram.com/lavendervillamelaka" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-purple-400 transition">
                  <Instagram className="w-5 h-5" />
                </a>
                <a href="https://www.tiktok.com/@lavendervillamelaka" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-purple-400 transition">
                  <TikTokIcon />
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-8">
            <p className="text-center text-slate-500 text-sm">© 2025 Lavender Villa Melaka. Semua hak terpelihara. Penginapan Muslim Sahaja.</p>
          </div>
        </div>
      </footer>

      {/* Video Modal */}
      {showVideoModal && (
        <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-6">
          <button onClick={() => setShowVideoModal(false)} className="absolute top-8 right-8 text-white hover:text-slate-300 transition">
            <X className="w-10 h-10" />
          </button>
          <div className="text-white text-center">
            <div className="w-32 h-32 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Play className="w-16 h-16" />
            </div>
            <p className="text-2xl">Virtual tour video would play here</p>
          </div>
        </div>
      )}

      {/* Booking Success Modal */}
      {showBookingSuccess && bookingDetails && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 text-center shadow-2xl animate-in fade-in zoom-in duration-300">
            {/* Success Icon */}
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-green-500" />
            </div>
            
            <h3 className="text-2xl font-bold text-slate-900 mb-2">Tempahan Dihantar!</h3>
            <p className="text-slate-600 mb-6">Sila lengkapkan tempahan anda di WhatsApp</p>
            
            {/* Booking Summary */}
            <div className="bg-slate-50 rounded-2xl p-4 mb-6 text-left">
              <div className="flex justify-between py-2 border-b border-slate-200">
                <span className="text-slate-500 text-sm">Nama</span>
                <span className="font-medium text-slate-900 text-sm">{bookingDetails.name}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-200">
                <span className="text-slate-500 text-sm">Check-in</span>
                <span className="font-medium text-slate-900 text-sm">{bookingDetails.checkIn}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-200">
                <span className="text-slate-500 text-sm">Check-out</span>
                <span className="font-medium text-slate-900 text-sm">{bookingDetails.checkOut}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-slate-500 text-sm">Jumlah</span>
                <span className="font-bold text-purple-600">RM {bookingDetails.total.toLocaleString()}</span>
              </div>
            </div>
            
            <p className="text-xs text-slate-500 mb-4">
              💬 Kami akan menghubungi anda melalui WhatsApp untuk pengesahan
            </p>
            
            <button
              onClick={() => setShowBookingSuccess(false)}
              className="w-full bg-purple-500 text-white py-3 rounded-xl font-semibold hover:bg-purple-600 transition"
            >
              Tutup
            </button>
          </div>
        </div>
      )}

      {/* Floating WhatsApp Button - Liquid Glass Effect */}
      <a
        href="https://wa.me/60193345686?text=Hai%2C%20saya%20ingin%20bertanya%20tentang%20Lavender%20Villa%20Melaka"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-40 group"
      >
        {/* Tooltip */}
        <div className="absolute bottom-full right-0 mb-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:translate-y-0 translate-y-2 pointer-events-none">
          <div className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-xl shadow-lg border border-white/50 whitespace-nowrap">
            <p className="text-slate-800 text-sm font-medium">Perlukan bantuan?</p>
            <p className="text-slate-500 text-xs">Chat dengan kami di WhatsApp</p>
          </div>
          <div className="absolute -bottom-1 right-6 w-3 h-3 bg-white/90 rotate-45 border-r border-b border-white/50"></div>
        </div>
        
        {/* Button with liquid glass effect */}
        <div className="relative">
          {/* Pulse animation ring */}
          <div className="absolute inset-0 bg-green-400 rounded-full animate-ping opacity-30"></div>
          
          {/* Outer glow */}
          <div className="absolute -inset-1 bg-gradient-to-r from-green-400 to-green-500 rounded-full blur-md opacity-50 group-hover:opacity-70 transition-opacity"></div>
          
          {/* Main button - liquid glass */}
          <div className="relative w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-green-400 to-green-500 rounded-full flex items-center justify-center shadow-xl group-hover:scale-110 transition-all duration-300 group-hover:shadow-green-500/50 group-hover:shadow-2xl">
            {/* Glass overlay */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-b from-white/30 to-transparent"></div>
            <div className="absolute inset-1 rounded-full bg-gradient-to-br from-white/20 via-transparent to-black/10"></div>
            
            {/* WhatsApp Icon */}
            <svg className="w-7 h-7 sm:w-8 sm:h-8 text-white relative z-10" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
          </div>
        </div>
      </a>
    </div>
  );
}
