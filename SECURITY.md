# Security Guidelines - Lavender Villa Melaka

## Overview
This document outlines the security measures implemented for the Lavender Villa Melaka website and admin panel.

## Website Security

### 1. Admin Access
- **Hidden Admin Link**: The admin link is NOT visible on the public website
- **Direct URL Access**: Admin panel is only accessible via direct URL `/admin`
- **No Public Disclosure**: Admin credentials are never exposed in code or frontend

### 2. Data Protection
- **HTTPS Only**: All data transmitted over encrypted HTTPS
- **Input Validation**: All user inputs are validated and sanitized
- **XSS Prevention**: React automatically escapes content to prevent XSS attacks
- **CSRF Protection**: Form submissions use POST with proper validation

### 3. Booking Information
- **Phone Number Validation**: Malaysian phone numbers validated before submission
- **Rate Limiting**: Max 3 booking requests per hour per user
- **Message Length Limit**: Special requests limited to 500 characters
- **Guest Count Validation**: 1-20 guests only

## Admin Panel Security

### 1. Authentication
- **Username**: `admin` (hardcoded, cannot be changed via UI)
- **Password**: Stored securely, default is `lavendervilla2025`
- **Session Storage**: Uses sessionStorage (cleared on browser close)
- **Session Timeout**: 30 minutes of inactivity = automatic logout

### 2. Login Protection
- **Rate Limiting**: Maximum 5 login attempts per 15 minutes
- **Failed Attempt Tracking**: Tracks failed attempts in localStorage
- **Error Messages**: Generic error messages (don't reveal if username exists)
- **Password Reset**: Requires reset code `lavender2025`

### 3. Session Management
- **Session Time Tracking**: Records login timestamp
- **Automatic Logout**: Expires after 30 minutes of inactivity
- **Clear on Logout**: All session data cleared when logging out
- **No Persistent Login**: No "Remember Me" option

### 4. Data Access
- **Supabase RLS**: Row-level security policies on database
- **Anon Key Only**: Frontend uses anon key (limited permissions)
- **No Admin Key Exposure**: Admin key never exposed to frontend
- **Booking Validation**: Only confirmed/paid bookings affect availability

## Best Practices

### For Admin Users
1. **Change Default Password**: Change from `lavendervilla2025` immediately
2. **Use Strong Password**: At least 8 characters, mix of letters/numbers/symbols
3. **Logout When Done**: Always logout, especially on shared computers
4. **Clear Browser Cache**: Clear cache after logout
5. **Use HTTPS**: Always access admin via HTTPS (never HTTP)

### For Website Users
1. **Verify Booking**: Check WhatsApp confirmation after booking
2. **Secure Payment**: Only pay via secure channels
3. **Report Issues**: Contact via WhatsApp for any concerns

## Supabase Security

### Database
- **Public Holidays Table**: Read-only for frontend
- **Bookings Table**: Insert-only for customers, full access for admin
- **Blocked Dates Table**: Admin-only access
- **Properties Table**: Read-only for frontend

### API Keys
- **Anon Key**: Used in frontend (limited permissions)
- **Service Role Key**: Never exposed to frontend
- **Key Rotation**: Rotate keys if compromised

## Incident Response

### If Compromised
1. **Change Admin Password**: Immediately update password
2. **Check Bookings**: Review recent bookings for fraud
3. **Clear Sessions**: Force logout all admin sessions
4. **Rotate Keys**: Regenerate Supabase keys if needed
5. **Contact Support**: Reach out to Supabase support

### Suspicious Activity
- Multiple failed login attempts
- Unusual booking patterns
- Unexpected data changes
- Unauthorized access attempts

## Compliance

### Data Privacy
- **GDPR Compliant**: Customer data handled securely
- **No Third-Party Sharing**: Data not shared with external services
- **Data Retention**: Bookings kept for 1 year, then archived
- **User Consent**: Booking implies consent to contact via WhatsApp

### Backup & Recovery
- **Supabase Backups**: Automatic daily backups
- **Data Recovery**: Can restore from backups if needed
- **Disaster Plan**: Documented recovery procedures

## Regular Maintenance

### Monthly
- [ ] Review failed login attempts
- [ ] Check for suspicious bookings
- [ ] Verify all features working correctly

### Quarterly
- [ ] Update dependencies
- [ ] Review security logs
- [ ] Test backup restoration

### Annually
- [ ] Security audit
- [ ] Penetration testing
- [ ] Update security policies

## Contact & Support

For security concerns:
- **WhatsApp**: +60 19 334 5686
- **Email**: Contact via WhatsApp first
- **Emergency**: Immediate response for security incidents

---

**Last Updated**: December 2025
**Version**: 1.0
