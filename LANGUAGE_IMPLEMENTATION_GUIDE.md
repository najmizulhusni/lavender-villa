# Language Toggle Implementation Guide

## Overview
I've created a complete language system that allows switching between Malay (default) and English. It's easy to implement!

## Files Created

### 1. `src/translations.js`
Contains all text in both Malay and English:
```javascript
translations = {
  ms: { /* Malay translations */ },
  en: { /* English translations */ }
}
```

### 2. `src/LanguageContext.jsx`
React Context for managing language state globally:
- Stores language preference in localStorage
- Provides `useLanguage()` hook to access language anywhere
- `toggleLanguage()` function to switch between languages

### 3. `src/LanguageToggle.jsx`
Language toggle button component:
- Shows "🇬🇧 EN" when in Malay mode
- Shows "🇲🇾 MS" when in English mode
- Can be placed in navigation bar

### 4. Updated `src/main.jsx`
Wrapped app with `<LanguageProvider>` to enable language context

## How to Use in Components

### Step 1: Import the hook
```javascript
import { useLanguage } from './LanguageContext';
import { translations } from './translations';
```

### Step 2: Use in component
```javascript
export default function MyComponent() {
  const { language } = useLanguage();
  const t = translations[language];

  return (
    <div>
      <h1>{t.hero_title}</h1>
      <p>{t.hero_subtitle}</p>
      <button>{t.book_now}</button>
    </div>
  );
}
```

## Implementation Steps

### For App.jsx (Main Page)
1. Add import at top:
```javascript
import { useLanguage } from './LanguageContext';
import { translations } from './translations';
```

2. Inside component, add:
```javascript
const { language, toggleLanguage } = useLanguage();
const t = translations[language];
```

3. Replace all hardcoded text with `t.key`:
```javascript
// Before:
<h1>Lavender Villa Melaka</h1>

// After:
<h1>{t.hero_title}</h1>
```

4. Add language toggle button in navigation:
```javascript
import { LanguageToggle } from './LanguageToggle';

// In navigation JSX:
<LanguageToggle />
```

### For FAQ.jsx
Same process - import hook, use translations

### For Admin.jsx
Same process - import hook, use translations

## Translation Keys Available

### Navigation
- `nav_info`, `nav_spaces`, `nav_book`, `nav_back`

### Hero Section
- `hero_title`, `hero_subtitle`, `hero_book_btn`, `hero_rating`, etc.

### Booking Form
- `checkin_label`, `checkout_label`, `guests_label`
- `name_label`, `phone_label`, `message_label`
- `book_now`, `fill_name_phone`, `pick_dates`

### Calendar
- `no_availability`, `booked`, `public_holiday`, `school_holiday`

### Footer
- `footer_copyright`, `footer_muslim`

## Adding More Translations

To add new text:

1. Add to `translations.js`:
```javascript
ms: {
  my_new_key: 'Teks Melayu',
  ...
},
en: {
  my_new_key: 'English Text',
  ...
}
```

2. Use in component:
```javascript
<p>{t.my_new_key}</p>
```

## Features

✅ **Persistent**: Language preference saved in localStorage
✅ **Global**: Works across all pages (App, FAQ, Admin)
✅ **Easy**: Simple hook-based API
✅ **Scalable**: Easy to add more languages
✅ **Default**: Malay is default language
✅ **Toggle**: Simple button to switch languages

## Estimated Implementation Time

- **App.jsx**: 30-45 minutes (replace ~100+ text strings)
- **FAQ.jsx**: 10-15 minutes (replace ~30 text strings)
- **Admin.jsx**: 45-60 minutes (replace ~200+ text strings)
- **Total**: 1.5-2 hours for full implementation

## Next Steps

1. ✅ Files created and ready
2. ⏳ Update App.jsx with translations
3. ⏳ Update FAQ.jsx with translations
4. ⏳ Update Admin.jsx with translations
5. ⏳ Test language toggle
6. ⏳ Push to GitHub

## Notes

- All translations are already prepared
- No additional dependencies needed
- Works with existing code
- Can be done incrementally (one page at a time)
- Language preference persists across sessions
