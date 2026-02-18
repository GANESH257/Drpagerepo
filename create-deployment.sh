#!/bin/bash

# GoDaddy Deployment Package Creator
# This script creates a deployment zip from the /out folder

echo "🚀 Creating GoDaddy Deployment Package..."
echo ""

# Navigate to project root
cd "$(dirname "$0")"

# Check if out folder exists
if [ ! -d "out" ]; then
    echo "❌ Error: /out folder not found!"
    echo "Please run 'npm run build' first."
    exit 1
fi

# Remove old deployment files if they exist
if [ -f "deployment.zip" ]; then
    echo "⚠️  Removing old deployment.zip..."
    rm -f deployment.zip
fi

if [ -f "deployment.tar.gz" ]; then
    echo "⚠️  Removing old deployment.tar.gz..."
    rm -f deployment.tar.gz
fi

# Create ZIP file
echo "📦 Creating deployment.zip..."
cd out
zip -r ../deployment.zip . -x "*.DS_Store" -x "*.git*" 2>/dev/null || {
    echo "⚠️  zip command failed, trying alternative method..."
    cd ..
    # Alternative: Use tar and convert
    tar -czf deployment.tar.gz -C out . 2>/dev/null && {
        echo "✅ Created deployment.tar.gz instead"
        echo "   You can rename it to .zip or extract and re-zip in cPanel"
        exit 0
    }
    echo "❌ Failed to create package"
    exit 1
}
cd ..

# Verify creation
if [ -f "deployment.zip" ]; then
    SIZE=$(du -h deployment.zip | cut -f1)
    echo ""
    echo "✅ Deployment package created successfully!"
    echo "   File: deployment.zip"
    echo "   Size: $SIZE"
    echo "   Location: $(pwd)/deployment.zip"
    echo ""
    echo "📋 Next steps:"
    echo "   1. Upload deployment.zip to GoDaddy cPanel"
    echo "   2. Extract to public_html directory"
    echo "   3. Verify index.html is in root"
    echo ""
else
    echo "❌ Failed to create deployment.zip"
    exit 1
fi
