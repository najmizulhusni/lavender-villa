import { supabase } from './supabase';

// ==================== BOOKINGS ====================

export async function createBooking(bookingData) {
  const bookingCode = 'LV' + new Date().toISOString().slice(2, 10).replace(/-/g, '') + Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  
  const { data, error } = await supabase
    .from('bookings')
    .insert({
      booking_code: bookingCode,
      property_id: bookingData.propertyId,
      customer_name: bookingData.name,
      customer_phone: bookingData.phone,
      check_in: bookingData.checkIn,
      check_out: bookingData.checkOut,
      nights: bookingData.nights,
      guests: bookingData.guests,
      total_amount: bookingData.total,
      special_requests: bookingData.message,
      status: 'pending'
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getBookings(propertySlug = 'lavender') {
  const { data, error } = await supabase
    .from('bookings')
    .select(`
      *,
      properties!inner(slug, name)
    `)
    .eq('properties.slug', propertySlug)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function getAllBookings() {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    // Add property info separately if needed
    return data?.map(b => ({
      ...b,
      properties: { slug: 'lavender', name: 'Lavender Villa Melaka' }
    })) || [];
  } catch (err) {
    console.error('Supabase getAllBookings error:', err);
    throw err;
  }
}

export async function updateBookingStatus(bookingId, status) {
  const { data, error } = await supabase
    .from('bookings')
    .update({ status })
    .eq('id', bookingId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteBooking(bookingId) {
  const { error } = await supabase
    .from('bookings')
    .delete()
    .eq('id', bookingId);

  if (error) throw error;
}

// ==================== BOOKED DATES ====================

export async function getBookedDates(propertySlug = 'lavender') {
  // Get property ID first
  const { data: property } = await supabase
    .from('properties')
    .select('id')
    .eq('slug', propertySlug)
    .single();

  if (!property) return [];

  // Get confirmed/paid bookings
  const { data: bookings, error: bookingsError } = await supabase
    .from('bookings')
    .select('check_in, check_out')
    .eq('property_id', property.id)
    .in('status', ['confirmed', 'paid']);

  if (bookingsError) throw bookingsError;

  // Get manually blocked dates
  const { data: blocked, error: blockedError } = await supabase
    .from('blocked_dates')
    .select('blocked_date')
    .eq('property_id', property.id);

  if (blockedError) throw blockedError;

  // Generate all booked dates from bookings
  const bookedDates = new Set();
  
  bookings?.forEach(booking => {
    const start = new Date(booking.check_in);
    const end = new Date(booking.check_out);
    for (let d = new Date(start); d < end; d.setDate(d.getDate() + 1)) {
      bookedDates.add(d.toISOString().split('T')[0]);
    }
  });

  // Add manually blocked dates
  blocked?.forEach(b => bookedDates.add(b.blocked_date));

  return Array.from(bookedDates).sort();
}

// ==================== BLOCKED DATES ====================

export async function addBlockedDate(propertySlug, date, reason = '') {
  const { data: property } = await supabase
    .from('properties')
    .select('id')
    .eq('slug', propertySlug)
    .single();

  if (!property) throw new Error('Property not found');

  const { data, error } = await supabase
    .from('blocked_dates')
    .insert({
      property_id: property.id,
      blocked_date: date,
      reason
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function removeBlockedDate(propertySlug, date) {
  const { data: property } = await supabase
    .from('properties')
    .select('id')
    .eq('slug', propertySlug)
    .single();

  if (!property) return;

  const { error } = await supabase
    .from('blocked_dates')
    .delete()
    .eq('property_id', property.id)
    .eq('blocked_date', date);

  if (error) throw error;
}

// ==================== PUBLIC HOLIDAYS ====================

export async function getPublicHolidays(year = null) {
  let query = supabase
    .from('public_holidays')
    .select('holiday_date, name')
    .order('holiday_date');

  if (year) {
    query = query.eq('year', year);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data?.map(h => h.holiday_date) || [];
}

// ==================== PROPERTIES ====================

export async function getProperty(slug = 'lavender') {
  const { data, error } = await supabase
    .from('properties')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) throw error;
  return data;
}

// ==================== ADMIN AUTH ====================

export async function adminLogin(username, password) {
  const { data, error } = await supabase
    .from('admin_users')
    .select('*')
    .eq('username', username)
    .eq('is_active', true)
    .single();

  if (error || !data) {
    throw new Error('Username tidak dijumpai');
  }

  // Simple password check (in production, use proper hashing)
  if (data.password_hash !== password) {
    throw new Error('Kata laluan salah');
  }

  // Update last login
  await supabase
    .from('admin_users')
    .update({ last_login: new Date().toISOString() })
    .eq('id', data.id);

  return {
    id: data.id,
    username: data.username,
    displayName: data.display_name,
    role: data.role
  };
}

export async function updateAdminPassword(username, newPassword) {
  const { error } = await supabase
    .from('admin_users')
    .update({ password_hash: newPassword })
    .eq('username', username);

  if (error) throw error;
}

// ==================== WHATSAPP TEMPLATES ====================

export async function getWhatsAppTemplates() {
  const { data, error } = await supabase
    .from('whatsapp_templates')
    .select('*')
    .eq('is_active', true);

  if (error) throw error;
  return data;
}
