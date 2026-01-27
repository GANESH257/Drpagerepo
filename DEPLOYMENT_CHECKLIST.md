# GoDaddy Deployment Checklist

## Pre-Build Checklist

✅ **Static Export Configuration**
- `next.config.js` has `output: 'export'`
- `trailingSlash: true` for GoDaddy compatibility
- `images: { unoptimized: true }` for static hosting

✅ **No Server-Side Features**
- No API routes (`src/app/api/`)
- No server actions (`'use server'`)
- All authentication is client-side (localStorage)
- All data is in TypeScript files

✅ **Dynamic Routes**
- All dynamic routes have `generateStaticParams()`:
  - `/doctors/[slug]` ✅
  - `/public-health/articles/[slug]` ✅
  - `/trustee-board/announcements/[slug]` ✅
  - `/medical-students/articles/[slug]` ✅

✅ **Login Functionality**
- Sign In form works with dummy credentials
- Email: `doctor@aip.com` (or any doctor email from `src/data/doctors.ts`)
- Password: `AIP@12345`
- Session stored in localStorage
- Dashboard routes protected client-side
- Logout button in dashboard header ✅

✅ **Dashboard Header Spacing**
- Header positioned below main navbar (`top-20`)
- Proper spacing and visibility ✅

✅ **Environment Variables (Optional)**
- RSS feed URLs are optional (have fallbacks):
  - `NEXT_PUBLIC_TRUSTEE_ANNOUNCEMENTS_RSS`
  - `NEXT_PUBLIC_MED_STUDENT_RSS_URL`
  - `NEXT_PUBLIC_PUBLIC_HEALTH_RSS_URL`
- Not required for deployment (fallback to local data)

## Build Commands

Run these commands in order:

```bash
# 1. Install dependencies (if needed)
npm install

# 2. Build the static export
npm run build

# 3. Verify build output
# Check that /out folder was created with all files
```

## Build Output

After running `npm run build`, you should have:
- `/out` folder containing all static files
- HTML files for all routes
- CSS and JS bundles
- Images and assets from `/public`

## Deployment Steps

1. **Build the project**:
   ```bash
   npm run build
   ```

2. **Verify build output**:
   - Check `/out` folder exists
   - Verify all pages are generated
   - Check file sizes are reasonable

3. **Upload to GoDaddy**:
   - Connect via FTP/cPanel File Manager
   - Upload ALL contents of `/out` folder to your domain's `public_html` directory
   - Ensure `.htaccess` file is uploaded (if needed for routing)

4. **Verify deployment**:
   - Visit your domain
   - Test all main routes:
     - `/` (Home)
     - `/doctors` (Directory)
     - `/doctors/[slug]` (Doctor profiles)
     - `/join-us` (Login page)
     - `/doctor/dashboard` (After login)
     - `/public-health`
     - `/membership`
     - `/trustee-board`
     - `/medical-students`

5. **Test Login**:
   - Go to `/join-us`
   - Sign in with: `doctor@aip.com` / `AIP@12345`
   - Verify redirect to dashboard
   - Test dashboard navigation
   - Test logout functionality

## Important Notes

- **No .env file needed** for basic deployment (RSS feeds optional)
- **All data is static** - no database required
- **localStorage works** - session persists in browser
- **All routes are pre-rendered** - fast loading times
- **Images are unoptimized** - acceptable for static hosting

## Troubleshooting

### Build Errors
- Check for TypeScript errors: `npm run lint`
- Verify all imports are correct
- Ensure all data files exist

### Deployment Issues
- Verify all files uploaded correctly
- Check file permissions (644 for files, 755 for directories)
- Ensure `.htaccess` is present (if using custom routing)
- Check browser console for JavaScript errors

### Login Not Working
- Verify localStorage is enabled in browser
- Check browser console for errors
- Ensure doctor email exists in `src/data/doctors.ts`
- Test with: `doctor@aip.com` / `AIP@12345`

## Files to Deploy

Upload everything from `/out` folder, including:
- `index.html` and all HTML files
- `_next/` folder (JS and CSS bundles)
- All files from `public/` folder (images, PDFs, etc.)
- `.htaccess` (if present)

## Post-Deployment

- Test all routes
- Verify images load correctly
- Test login/logout flow
- Check mobile responsiveness
- Verify SEO metadata (view page source)
