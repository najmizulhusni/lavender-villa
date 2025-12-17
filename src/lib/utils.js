import { PUBLIC_HOLIDAYS, FESTIVE_DATES, PRICING } from './constants';

// ==================== DATE UTILITIES ====================

/**
 * Format date to YYYY-MM-DD in local timezone (avoid UTC shift)
 * @param {Date} date - Date object to format
 * @returns {string} - Formatted date string
 */
export const formatDateToLocal = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Format date for display in Malay locale
 * @param {string} dateStr - Date string in YYYY-MM-DD format
 * @returns {string} - Formatted date for display
 */
export const formatDateForDisplay = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('ms-MY', { day: 'numeric', month: 'short', year: 'numeric' });
};

/**
 * Get days in month info for calendar rendering
 * @param {Date} date - Date object for the month
 * @returns {Object} - { daysInMonth, startingDay }
 */
export const getDaysInMonth = (date) => {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDay = firstDay.getDay();
  return { daysInMonth, startingDay };
};

/**
 * Check if date is in the past
 * @param {Date} date - Date to check
 * @returns {boolean}
 */
export const isDatePast = (date) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date < today;
};

/**
 * Get all dates between two dates (exclusive of end date)
 * @param {string} startDate - Start date string YYYY-MM-DD
 * @param {string} endDate - End date string YYYY-MM-DD
 * @returns {string[]} - Array of date strings
 */
export const getDatesBetween = (startDate, endDate) => {
  const dates = [];
  const start = new Date(startDate + 'T00:00:00');
  const end = new Date(endDate + 'T00:00:00');
  for (let d = new Date(start); d < end; d.setDate(d.getDate() + 1)) {
    dates.push(formatDateToLocal(d));
  }
  return dates;
};

// ==================== HOLIDAY UTILITIES ====================

/**
 * Check if date is a public holiday
 * @param {Date} date - Date to check
 * @returns {string|null} - Holiday name or null
 */
export const getPublicHolidayName = (date) => {
  const dateStr = formatDateToLocal(date);
  return PUBLIC_HOLIDAYS[dateStr] || null;
};

/**
 * Check if date is a public holiday (boolean)
 * @param {Date} date - Date to check
 * @param {string[]} holidaysList - Optional list of holiday dates from database
 * @returns {boolean}
 */
export const isPublicHoliday = (date, holidaysList = null) => {
  const dateStr = formatDateToLocal(date);
  if (holidaysList && holidaysList.length > 0) {
    return holidaysList.includes(dateStr);
  }
  return !!PUBLIC_HOLIDAYS[dateStr];
};

/**
 * Check if date is in festive season (higher pricing)
 * @param {Date} date - Date to check
 * @returns {boolean}
 */
export const isFestiveSeason = (date) => {
  const dateStr = formatDateToLocal(date);
  return FESTIVE_DATES.includes(dateStr);
};

/**
 * Check if date is weekend (Saturday or Sunday)
 * @param {Date} date - Date to check
 * @returns {boolean}
 */
export const isWeekend = (date) => {
  const dayOfWeek = date.getDay();
  return dayOfWeek === 0 || dayOfWeek === 6;
};

// ==================== PRICING UTILITIES ====================

/**
 * Calculate total price for a booking
 * @param {string} checkIn - Check-in date YYYY-MM-DD
 * @param {string} checkOut - Check-out date YYYY-MM-DD
 * @param {string[]} holidaysList - Optional list of holiday dates from database
 * @returns {number} - Total price in RM
 */
export const calculateBookingPrice = (checkIn, checkOut, holidaysList = null) => {
  if (!checkIn || !checkOut) return 0;
  
  const start = new Date(checkIn + 'T00:00:00');
  const end = new Date(checkOut + 'T00:00:00');
  const nights = Math.round((end - start) / (1000 * 60 * 60 * 24));
  
  if (nights <= 0) return 0;

  // Check if any date in the range is festive, weekend, or public holiday
  let hasFestive = false;
  let hasWeekendOrHoliday = false;

  for (let d = new Date(start); d < end; d.setDate(d.getDate() + 1)) {
    if (isFestiveSeason(d)) {
      hasFestive = true;
    }
    if (isWeekend(d) || isPublicHoliday(d, holidaysList)) {
      hasWeekendOrHoliday = true;
    }
  }

  // Package pricing based on highest tier in the booking
  if (hasFestive) {
    if (nights === 1) return PRICING.festive.oneNight;
    if (nights === 2) return PRICING.festive.twoNights;
    return PRICING.festive.twoNights + ((nights - 2) * PRICING.festive.extraNight);
  }

  if (hasWeekendOrHoliday) {
    if (nights === 1) return PRICING.weekend.oneNight;
    if (nights === 2) return PRICING.weekend.twoNights;
    return PRICING.weekend.twoNights + ((nights - 2) * PRICING.weekend.extraNight);
  }

  // Weekday pricing
  if (nights === 1) return PRICING.weekday.oneNight;
  if (nights === 2) return PRICING.weekday.twoNights;
  return PRICING.weekday.twoNights + ((nights - 2) * PRICING.weekday.extraNight);
};

/**
 * Calculate number of nights between two dates
 * @param {string} checkIn - Check-in date YYYY-MM-DD
 * @param {string} checkOut - Check-out date YYYY-MM-DD
 * @returns {number} - Number of nights
 */
export const calculateNights = (checkIn, checkOut) => {
  if (!checkIn || !checkOut) return 0;
  const start = new Date(checkIn + 'T00:00:00');
  const end = new Date(checkOut + 'T00:00:00');
  const nights = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
  return nights > 0 ? nights : 0;
};

// ==================== VALIDATION UTILITIES ====================

/**
 * Validate Malaysian phone number
 * @param {string} phone - Phone number to validate
 * @returns {boolean}
 */
export const isValidMalaysianPhone = (phone) => {
  const phoneRegex = /^(\+?6?01)[0-9]{8,9}$/;
  const cleanPhone = phone.replace(/[\s-]/g, '');
  return phoneRegex.test(cleanPhone);
};

/**
 * Clean phone number (remove spaces and dashes)
 * @param {string} phone - Phone number to clean
 * @returns {string}
 */
export const cleanPhoneNumber = (phone) => {
  return phone.replace(/[\s-]/g, '');
};

/**
 * Sanitize user input (remove HTML tags)
 * @param {string} input - Input to sanitize
 * @returns {string}
 */
export const sanitizeInput = (input) => {
  return input.replace(/[<>]/g, '').trim();
};

// ==================== BOOKING CODE UTILITIES ====================

/**
 * Generate booking code
 * @param {string} propertyCode - Property code (e.g., 'VLM')
 * @param {number} existingCount - Number of existing bookings this month
 * @returns {string} - Booking code (e.g., 'VLM-2512-001')
 */
export const generateBookingCode = (propertyCode, existingCount = 0) => {
  const now = new Date();
  const yearMonth = `${String(now.getFullYear()).slice(-2)}${String(now.getMonth() + 1).padStart(2, '0')}`;
  const bookingNumber = String(existingCount + 1).padStart(3, '0');
  return `${propertyCode}-${yearMonth}-${bookingNumber}`;
};

/**
 * Generate simple booking code for public bookings
 * @returns {string} - Booking code (e.g., 'LV2512120001')
 */
export const generateSimpleBookingCode = () => {
  return 'LV' + new Date().toISOString().slice(2, 10).replace(/-/g, '') + 
         Math.floor(Math.random() * 10000).toString().padStart(4, '0');
};
