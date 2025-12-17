// ==================== PROPERTIES ====================
export const PROPERTIES = [
  { id: 'lavender', name: 'Lavender Villa Melaka', location: 'Bemban', address: '47, Jalan Anjung Lavender 1, Taman Anjung Gapam, 77200 Bemban, Melaka', code: 'VLM' },
  { id: 'venus', name: 'Venus Cabana Villa', location: 'Ayer Keroh', address: 'Lot 5678, Jalan Ayer Keroh, 75450 Ayer Keroh, Melaka', code: 'VCV' },
  { id: 'merpati', name: 'Merpati Purple Guesthouse', location: 'Jasin', address: 'Lot 9012, Jalan Jasin, 77000 Jasin, Melaka', code: 'MPG' },
  { id: 'defrance', name: 'De France Pool Villa', location: 'Alor Gajah', address: 'Lot 3456, Jalan Alor Gajah, 78000 Alor Gajah, Melaka', code: 'DFV' },
  { id: 'oaks', name: 'The Oaks Villa', location: 'Durian Tunggal', address: 'Lot 7890, Jalan Durian Tunggal, 76100 Durian Tunggal, Melaka', code: 'TOV' },
  { id: 'nilofar', name: 'Nilofar Villa', location: 'Merlimau', address: 'Lot 2345, Jalan Merlimau, 77300 Merlimau, Melaka', code: 'NLV' },
  { id: 'anjung', name: 'Villa Anjung Cemara', location: 'Selandar', address: 'Lot 6789, Jalan Selandar, 77500 Selandar, Melaka', code: 'VAC' }
];

// ==================== PUBLIC HOLIDAYS 2025-2026 (National + Melaka) ====================
export const PUBLIC_HOLIDAYS = {
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

// Fallback list for App.jsx (array format)
export const PUBLIC_HOLIDAYS_LIST = Object.keys(PUBLIC_HOLIDAYS);

// ==================== FESTIVE DATES (Higher pricing) ====================
export const FESTIVE_DATES = [
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

// ==================== PRICING ====================
export const PRICING = {
  weekday: {
    oneNight: 1300,  // 2H1M
    twoNights: 2400, // 3H2M
    extraNight: 1300
  },
  weekend: {
    oneNight: 1590,  // 2H1M
    twoNights: 2990, // 3H2M
    extraNight: 1590
  },
  festive: {
    oneNight: 1700,  // 2H1M
    twoNights: 3200, // 3H2M
    extraNight: 1700
  }
};

// ==================== CONTACT INFO ====================
export const CONTACT = {
  whatsapp: '60193345686',
  phone: '+60 19 334 5686',
  instagram: '@lavendervillamelaka',
  tiktok: '@lavendervillamelaka'
};

// ==================== VILLA DETAILS ====================
export const VILLA_DETAILS = {
  bedrooms: 5,
  bathrooms: 4,
  minGuests: 1,
  maxGuests: 20,
  recommendedGuests: 15,
  checkInTime: '3:00 PM',
  checkOutTime: '12:00 PM',
  poolSize: '30x12x4 kaki'
};

// ==================== ADMIN CONFIG ====================
export const ADMIN_CONFIG = {
  sessionTimeout: 30 * 60 * 1000, // 30 minutes in ms
  maxLoginAttempts: 5,
  loginCooldown: 15 * 60 * 1000, // 15 minutes in ms
  maxBookingsPerHour: 3,
  resetCode: 'lavender2025'
};
