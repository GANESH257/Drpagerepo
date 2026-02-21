#!/bin/bash
# Build Next.js static export and create a ZIP of everything needed for GoDaddy cPanel.
# Run from project root. Requires: npm, node, zip (or tar).

set -e
cd "$(dirname "$0")"

echo "=============================================="
echo "  AIP Frontend — Build & Zip for GoDaddy"
echo "=============================================="
echo ""

# 1. Optional .env check
if [ -f ".env.local" ]; then
  echo "✓ .env.local found (NEXT_PUBLIC_* will be used for build)"
else
  echo "⚠ No .env.local found. Using defaults from next.config.js"
  echo "  (Backend URL defaults to https://aip-backend-112180822704.us-central1.run.app)"
  echo "  To override: create .env.local with NEXT_PUBLIC_API_URL=https://your-backend-url"
  echo ""
fi

# 2. Install deps if needed
if [ ! -d "node_modules" ]; then
  echo "📦 Installing dependencies..."
  npm install
  echo ""
fi

# 3. Build
echo "🔨 Building static export (npm run build)..."
npm run build
echo ""

if [ ! -d "out" ]; then
  echo "❌ Error: Build did not produce 'out' folder. Check build errors above."
  exit 1
fi

# 4. Remove old deployment zip
DEPLOY_ZIP="aip-frontend-godaddy.zip"
[ -f "$DEPLOY_ZIP" ] && rm -f "$DEPLOY_ZIP"

# 5. Create zip from contents of out/
echo "📦 Creating $DEPLOY_ZIP from contents of out/..."
(
  cd out
  if command -v zip >/dev/null 2>&1; then
    zip -r "../$DEPLOY_ZIP" . -x "*.DS_Store" -x "*.git*"
  else
    echo "⚠ 'zip' not found. Using tar.gz (extract on server or rename to .zip)."
    tar -czf "../${DEPLOY_ZIP%.zip}.tar.gz" . --exclude='.DS_Store' --exclude='.git*'
    DEPLOY_ZIP="${DEPLOY_ZIP%.zip}.tar.gz"
  fi
)

if [ ! -f "$DEPLOY_ZIP" ]; then
  echo "❌ Failed to create archive."
  exit 1
fi

SIZE=$(du -h "$DEPLOY_ZIP" | cut -f1)
echo ""
echo "=============================================="
echo "✅ Done!"
echo "=============================================="
echo "   File: $(pwd)/$DEPLOY_ZIP"
echo "   Size: $SIZE"
echo ""
echo "Contents (what will be in public_html):"
echo "   - index.html, 404.html"
echo "   - _next/ (JS, CSS, static assets)"
echo "   - doctors/, join-us/, admin/, doctor/, contact-us/, etc."
echo "   - All images, fonts, and public assets"
echo ""
echo "Next: See DEPLOY_FRONTEND_GODADDY.md for upload steps."
echo ""
