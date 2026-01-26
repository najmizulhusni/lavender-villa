# Performance Optimizations - Lavender Villa Website

## Summary
Fixed performance issues to improve Real Experience Score (RES) from 84 to 90+.

## Changes Made

### 1. Image Optimizations
- **Added lazy loading** to all non-critical images (reviews, space images)
- **Added explicit width/height** to prevent Cumulative Layout Shift (CLS)
- **Hero image priority loading** with `loading="eager"` and `fetchPriority="high"`
- **Preloaded critical images** in index.html (hero image and logo)

### 2. Resource Hints
- Added `dns-prefetch` for Supabase domain
- Added `preload` for critical hero image
- Added `preconnect` for external resources

### 3. Caching Headers (vercel.json)
- **Images**: `Cache-Control: public, max-age=31536000, immutable`
- **Assets**: `Cache-Control: public, max-age=31536000, immutable`
- **HTML**: `Cache-Control: public, max-age=0, must-revalidate`

### 4. Database Polling Optimization
- Reduced Supabase polling from 30s to 60s
- Reduces unnecessary network requests

### 5. Build Optimizations (vite.config.js)
- **Code splitting**: Separated React vendor and Lucide icons into separate chunks
- **Minification**: Using esbuild (faster than terser, built-in)
- **Chunk size optimization**: Set warning limit to 1000kb

### 6. Font Loading
- Added `font-display: swap` to prevent FOIT (Flash of Invisible Text)

## Expected Improvements

### Before
- RES: 84
- LCP: 1.44s
- CLS: 0.3
- TTFB: 1.22s
- INP: 96ms

### After (Expected)
- RES: 90+
- LCP: <1.2s (improved by lazy loading and preloading)
- CLS: <0.1 (fixed by explicit image dimensions)
- TTFB: <1.0s (improved by caching headers)
- INP: <90ms (improved by code splitting)

## Testing
1. Deploy to Vercel (automatic on push)
2. Wait 5-10 minutes for deployment
3. Test on https://pagespeed.web.dev/
4. Check Real Experience Score in Vercel Speed Insights

## Files Modified
- `src/App.jsx` - Image optimizations, lazy loading, polling reduction
- `index.html` - Resource hints, preloading
- `vercel.json` - Caching headers
- `vite.config.js` - Build optimizations
- `src/index.css` - Font display swap

## Notes
- All changes are backward compatible
- No breaking changes to functionality
- Images will load progressively (lazy loading)
- First visit may be slightly slower due to cache warming
- Subsequent visits will be much faster due to aggressive caching
