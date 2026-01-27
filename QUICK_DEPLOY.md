# ⚡ Quick Deployment Guide

## 📦 Package Ready

**File**: `deployment.zip` (30 MB)
**Location**: `/Users/ganesh/Desktop/DRPNEW/deployment.zip`

## 🚀 3-Step Deployment

### Step 1: Upload
- Log into GoDaddy cPanel
- Go to File Manager → `public_html/`
- Upload `deployment.zip`

### Step 2: Extract
- Right-click `deployment.zip` → Extract
- Extract to `public_html/`

### Step 3: Move Files
- Open `out/` folder
- Select ALL files/folders
- Move to `public_html/` (parent)
- Delete empty `out/` folder

## ✅ Test

Visit: `https://yourdomain.com/`

**Login Test**:
- Go to `/join-us`
- Email: `doctor@aip.com`
- Password: `AIP@12345`

## 📋 What's Included

- ✅ 169 static HTML pages
- ✅ 102 doctor profiles
- ✅ All CSS/JS bundles
- ✅ All images/assets
- ✅ `.htaccess` for routing
- ✅ Dashboard pages
- ✅ All routes pre-rendered

## 🔧 If Issues

1. **404 Errors**: Check `.htaccess` is uploaded (644 permissions)
2. **No Styling**: Verify `_next/` folder uploaded completely
3. **Login Fails**: Use exact credentials above, check browser console

## 📖 Full Instructions

See `DEPLOYMENT_INSTRUCTIONS.md` for detailed guide.
