#!/bin/bash

# ============================================
# DOMAIN UPDATE SCRIPT - Lavender Villa Melaka
# ============================================
# Run this script after purchasing your domain
# Usage: ./scripts/update-domain.sh yourdomain.com
# Example: ./scripts/update-domain.sh lavendervillamelaka.com
# ============================================

# Check if domain argument is provided
if [ -z "$1" ]; then
    echo "❌ Error: Please provide your new domain"
    echo "Usage: ./scripts/update-domain.sh yourdomain.com"
    echo "Example: ./scripts/update-domain.sh lavendervillamelaka.com"
    exit 1
fi

NEW_DOMAIN=$1
OLD_DOMAIN="lavender-villa.vercel.app"

echo "🔄 Updating domain from $OLD_DOMAIN to $NEW_DOMAIN..."
echo ""

# Update index.html
echo "📝 Updating index.html..."
sed -i '' "s|https://$OLD_DOMAIN|https://$NEW_DOMAIN|g" index.html
echo "   ✅ index.html updated"

# Update sitemap.xml
echo "📝 Updating public/sitemap.xml..."
sed -i '' "s|https://$OLD_DOMAIN|https://$NEW_DOMAIN|g" public/sitemap.xml
echo "   ✅ sitemap.xml updated"

# Update robots.txt
echo "📝 Updating public/robots.txt..."
sed -i '' "s|https://$OLD_DOMAIN|https://$NEW_DOMAIN|g" public/robots.txt
echo "   ✅ robots.txt updated"

echo ""
echo "✅ All files updated successfully!"
echo ""
echo "📋 NEXT STEPS:"
echo "1. Commit and push changes:"
echo "   git add -A && git commit -m 'Update domain to $NEW_DOMAIN' && git push"
echo ""
echo "2. Add domain in Vercel:"
echo "   - Go to: https://vercel.com/dashboard"
echo "   - Select your project > Settings > Domains"
echo "   - Add: $NEW_DOMAIN"
echo ""
echo "3. Update DNS at your domain registrar:"
echo "   - Add CNAME record: @ -> cname.vercel-dns.com"
echo "   - Or A record: @ -> 76.76.21.21"
echo ""
echo "4. Verify in Google Search Console:"
echo "   - Go to: https://search.google.com/search-console"
echo "   - Add property: https://$NEW_DOMAIN"
echo ""
echo "5. Update Google Analytics (optional):"
echo "   - Go to: https://analytics.google.com"
echo "   - Admin > Property Settings > Update URL"
echo ""
