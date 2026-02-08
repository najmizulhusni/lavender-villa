# Date Blocking Status Guide

## Calendar Date Colors & Meanings

### Check-In Calendar (First Calendar)

| Color | Status | Meaning | Can Click? |
|-------|--------|---------|-----------|
| **Grey** | Past Date | Date is in the past | ❌ No |
| **Grey** | Booked | Date is already booked | ❌ No |
| **Purple** | Available | Date is available for check-in | ✅ Yes |
| **Purple (Bold)** | Selected | This is your selected check-in date | ✅ Yes |

---

### Check-Out Calendar (Second Calendar)

| Color | Status | Meaning | Can Click? |
|-------|--------|---------|-----------|
| **Grey** | Past Date | Date is in the past | ❌ No |
| **Grey** | Before Check-In | Date is before or same as check-in | ❌ No |
| **Red** | Manually Blocked (Cuti/Tutup) | Villa is closed/blocked - no checkout allowed | ❌ No |
| **Red** | Booked Dates In Between | There are bookings between check-in and this date | ❌ No |
| **Amber** | Fails Min Stay | Booking includes weekend but less than 3H2M | ❌ No |
| **Light Purple** | In Range | Date is between check-in and checkout | ✅ Yes (visual only) |
| **Purple (Bold)** | Selected | This is your selected check-out date | ✅ Yes |
| **Purple** | Available | Date is available for checkout | ✅ Yes |

---

## Legend (Bottom of Calendar)

```
🔴 Tiada Kekosongan (No Availability) = Red blocked dates
🟢 Boleh Checkout (Can Checkout) = Green dot indicator
🟡 Cuti Sekolah (School Holiday) = Yellow dot indicator
🔵 Cuti Umum (Public Holiday) = Blue dot indicator
⚠️ Hujung Minggu: Min 3H2M (Weekend: Min 3D2N) = Warning
```

---

## Date Blocking Logic

### 1. **Past Dates**
- Any date before today
- Shown in grey, disabled
- Cannot be selected

### 2. **Booked Dates** (from Supabase)
- Dates with existing bookings
- Shown in red on check-in calendar
- Can be checkout date (someone else checking in at 3pm, you checkout at 12pm)
- Marked with green dot indicator

### 3. **Manually Blocked Dates** (Cuti/Tutup)
- Dates when villa is closed
- Stored in `manuallyBlockedDates` from Supabase
- Shown in red on checkout calendar
- Cannot be used for checkout
- Tooltip: "Cuti/Tutup - tidak boleh checkout"

### 4. **Public Holidays** (Cuti Umum)
- Fixed dates like Hari Raya, CNY, Deepavali, Christmas
- Marked with blue dot
- Higher pricing applies
- Can still be booked

### 5. **School Holidays** (Cuti Sekolah)
- Specific date ranges (Kumpulan B - Melaka)
- Marked with yellow dot
- Higher pricing applies
- Weekend minimum stay (3H2M) required

### 6. **Weekend Minimum Stay**
- ALL weekends require minimum 3H2M (3 Days 2 Nights)
- Shown in amber if booking fails this requirement
- Tooltip: "Min 3H2M"

---

## Example Scenarios

### Scenario 1: Normal Weekday Booking
```
Check-In: Monday (Available) ✅
Check-Out: Wednesday (Available) ✅
Status: 2 nights, RM2,400 (Weekday rate)
```

### Scenario 2: Weekend Booking
```
Check-In: Friday (Available) ✅
Check-Out: Sunday (Available) ✅
Status: 2 nights, RM2,990 (Weekend rate, meets 3H2M minimum)
```

### Scenario 3: Blocked Dates
```
Check-In: Monday (Available) ✅
Check-Out: Friday (Booked) ❌
Status: Cannot checkout - dates in between are booked
```

### Scenario 4: School Holiday
```
Check-In: Monday (School Holiday) ✅
Check-Out: Wednesday (School Holiday) ✅
Status: 2 nights, RM2,990 (School Holiday rate, meets 3H2M minimum)
```

### Scenario 5: Villa Closed
```
Check-In: Monday (Available) ✅
Check-Out: Friday (Manually Blocked - Cuti/Tutup) ❌
Status: Cannot checkout - villa is closed
```

---

## How to Update Blocked Dates

### Add Booked Dates
- Automatically synced from Supabase `bookings` table
- Updates every 60 seconds

### Add Manually Blocked Dates (Cuti/Tutup)
- Add to Supabase `manually_blocked_dates` table
- Format: `YYYY-MM-DD`
- Example: `2025-12-25` (Christmas)

### Add Public Holidays
- Add to Supabase `public_holidays` table
- Format: `YYYY-MM-DD`
- Example: `2025-01-29` (CNY)

### Add School Holidays
- Edit `schoolHolidayRanges` array in App.jsx
- Format: `{ start: 'YYYY-MM-DD', end: 'YYYY-MM-DD', name: 'Holiday Name' }`

---

## Current Blocked Dates (2025-2026)

### Manually Blocked (Cuti/Tutup)
- None currently set

### Public Holidays
- 2025-01-29, 2025-01-30 (CNY)
- 2025-03-30, 2025-03-31, 2025-04-01 (Hari Raya)
- 2025-06-06, 2025-06-07 (Hari Raya Aidiladha)
- 2025-10-20 (Deepavali)
- 2025-12-24, 2025-12-25 (Christmas)
- And more for 2026...

### School Holidays (Kumpulan B - Melaka)
- 2025-05-29 to 2025-06-09 (Cuti Penggal 1)
- 2025-09-13 to 2025-09-21 (Cuti Penggal 2)
- 2025-12-20 to 2026-01-11 (Cuti Akhir Tahun)
- And more...

---

## Pricing by Date Type

| Date Type | 2H1M | 3H2M |
|-----------|------|------|
| Weekday | RM1,300 | RM2,400 |
| Weekend/PH/SH | RM1,590 | RM2,990 |
| Festive Season | RM1,700 | RM3,200 |

**Note:** Festive pricing applies to: CNY, Hari Raya Aidilfitri, Hari Raya Aidiladha, Deepavali, Christmas
