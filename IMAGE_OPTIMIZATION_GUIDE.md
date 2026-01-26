# Image Optimization Guide

## Current Issues
PageSpeed Insights shows **462 KiB** can be saved by optimizing images.

## Priority Images to Optimize

### 1. Hero Image (CRITICAL - affects LCP)
**File:** `/images/view_from_top_1_lanscape.jpg`
- **Current:** 308 KiB
- **Potential savings:** 233 KiB
- **Action:** Convert to WebP format and compress

### 2. Pool Image
**File:** `/images/pool_1_potrait.jpg`
- **Current:** 234 KiB  
- **Potential savings:** 138 KiB
- **Issues:** 
  - Wrong dimensions (960x971 loaded, 665x887 displayed)
  - Not in modern format
- **Action:** Resize to 665x887 and convert to WebP

### 3. Logo
**File:** `/images/logo.jpg`
- **Current:** 55 KiB
- **Potential savings:** 54.7 KiB
- **Issues:** Wrong dimensions (702x687 loaded, 68x42 displayed)
- **Action:** Create smaller version (136x84 @2x for retina) and convert to WebP

### 4. Other Images
- `living_room_1_lanscape.jpg` - Save 14.3 KiB
- `kitchen_1_lanscape.jpg` - Save 14.1 KiB
- `bedroom_1_lanscape.jpg` - Save 7.6 KiB

## How to Optimize Images

### Option 1: Online Tools (Easiest)
1. Go to https://squoosh.app/
2. Upload each image
3. Select WebP format
4. Adjust quality to 80-85%
5. For logo and pool image, also resize to correct dimensions
6. Download and replace original files

### Option 2: Command Line (Batch Processing)
```bash
# Install cwebp (WebP converter)
brew install webp  # macOS
# or
sudo apt-get install webp  # Linux

# Convert images to WebP
cd lavender-villa/public/images

# Hero image (compress heavily)
cwebp -q 75 view_from_top_1_lanscape.jpg -o view_from_top_1_lanscape.webp

# Pool image (resize + convert)
# First resize with ImageMagick
convert pool_1_potrait.jpg -resize 665x887 pool_1_potrait_resized.jpg
cwebp -q 80 pool_1_potrait_resized.jpg -o pool_1_potrait.webp

# Logo (create small version)
convert logo.jpg -resize 136x84 logo_small.jpg
cwebp -q 85 logo_small.jpg -o logo_small.webp

# Other images
cwebp -q 80 living_room_1_lanscape.jpg -o living_room_1_lanscape.webp
cwebp -q 80 kitchen_1_lanscape.jpg -o kitchen_1_lanscape.webp
cwebp -q 80 bedroom_1_lanscape.jpg -o bedroom_1_lanscape.webp
```

### Option 3: Use Vercel Image Optimization (Recommended)
Vercel automatically optimizes images if you use their Image component or API.

**Update code to use Vercel Image Optimization:**
```jsx
// Instead of:
<img src="/images/view_from_top_1_lanscape.jpg" />

// Use Vercel's optimization:
<img src="/_vercel/image?url=/images/view_from_top_1_lanscape.jpg&w=800&q=75" />
```

## After Optimization

### Update file references in code:
If you convert to WebP, update these files:
- `src/App.jsx` - Update all image paths from `.jpg` to `.webp`
- Keep `.jpg` as fallback for older browsers

### Use picture element for fallback:
```jsx
<picture>
  <source srcset="/images/view_from_top_1_lanscape.webp" type="image/webp" />
  <img src="/images/view_from_top_1_lanscape.jpg" alt="Lavender Villa" />
</picture>
```

## Expected Results After Optimization

### Before:
- Performance: 81
- LCP: 4.9s
- Total image size: 811.9 KiB

### After:
- Performance: 90+
- LCP: <2.5s
- Total image size: ~350 KiB (57% reduction)

## Quick Win - Immediate Actions

1. **Fix robots.txt** ✅ (Done)
2. **Add logo dimensions** ✅ (Done)
3. **Optimize hero image** (Do this first - biggest impact on LCP)
4. **Optimize pool image** (Second priority)
5. **Create smaller logo** (Third priority)

## Testing
After optimization, test at:
- https://pagespeed.web.dev/
- https://www.webpagetest.org/

Target scores:
- Performance: 90+
- LCP: <2.5s
- CLS: <0.1
