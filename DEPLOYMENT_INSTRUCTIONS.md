# GoDaddy cPanel Deployment Instructions

## Build Status
✅ Build completed successfully
- All pages generated as static HTML
- Total size: ~128MB
- Deployment packages created:
  - `deployment.tar.gz` (in project root) - 112MB compressed
  - Alternative: Extract from `/out` folder directly

## Deployment Steps for GoDaddy cPanel

### Step 1: Upload the Deployment Package
1. Log in to your GoDaddy cPanel account
2. Navigate to **File Manager**
3. Go to your domain's root directory (usually `public_html` or `www`)
4. **IMPORTANT**: If you have an existing site, backup current files first
5. Upload `deployment.zip` to the root directory

### Step 2: Extract Files
1. In File Manager, locate `deployment.zip`
2. Right-click and select **Extract** (or use Extract option in toolbar)
3. Extract to the current directory (root/public_html)
4. **VERIFY**: After extraction, you should see:
   - `index.html` in the root
   - `_next/` folder (contains CSS, JS, and assets)
   - Various page folders (`/patients/`, `/physicians/`, `/doctors/`, etc.)
   - Public assets (`Icons/`, `Dr_images/`, video files, etc.)

### Step 3: Verify File Structure
The root directory should contain:
```
public_html/
├── index.html                    (Homepage)
├── 404.html                      (Error page)
├── _next/                        (Next.js assets - CSS, JS)
├── patients/
│   └── index.html
├── physicians/
│   └── index.html
├── doctors/
│   └── index.html
├── Icons/                        (Medical specialty icons)
├── Dr_images/                    (Doctor profile images)
├── Insurance_Images/             (Insurance provider logos)
├── Background*.mp4               (Video backgrounds)
└── [other static assets]
```

### Step 4: Set Permissions (if needed)
- Files: `644` (rw-r--r--)
- Folders: `755` (rwxr-xr-x)
- Most cPanel uploads set these automatically

### Step 5: Test Your Site
1. Visit your domain: `https://yourdomain.com`
2. Test key pages:
   - Homepage: `/`
   - Patients: `/patients/`
   - Physicians: `/physicians/`
   - Doctors: `/doctors/`
3. Check that:
   - Images load correctly
   - CSS styles are applied
   - JavaScript interactions work
   - Navigation links work

### Step 6: Clean Up (Optional)
- Delete `deployment.zip` after successful extraction
- Remove any old/backup files if needed

## Important Notes

### Static Export Configuration
- ✅ `output: 'export'` - Generates static HTML files
- ✅ `trailingSlash: true` - URLs end with `/` (e.g., `/patients/`)
- ✅ `images: { unoptimized: true }` - Required for static hosting

### File Size
- Total deployment size: ~128MB
- Includes all images, videos, and assets
- Ensure your hosting plan supports this size

### URL Structure
- All routes are static HTML files
- Dynamic routes (like `/doctors/[slug]`) are pre-generated
- 404 page is included for invalid routes

### Troubleshooting

**Issue: Pages show 404**
- Ensure files are extracted to the correct directory
- Check that `index.html` exists in root
- Verify folder structure matches above

**Issue: CSS/JS not loading**
- Check that `_next/` folder was uploaded
- Verify file permissions (644 for files, 755 for folders)
- Check browser console for 404 errors

**Issue: Images not displaying**
- Verify `Icons/`, `Dr_images/`, and other asset folders exist
- Check image file permissions
- Ensure paths are correct (case-sensitive on Linux servers)

**Issue: Videos not playing**
- Verify video files (`.mp4`) are in root directory
- Check file sizes aren't too large for hosting limits
- Ensure video codec compatibility

## Alternative: FTP Upload
If File Manager doesn't work, use FTP:
1. Use FTP client (FileZilla, Cyberduck, etc.)
2. Connect to your GoDaddy FTP server
3. Upload all contents of `/out` folder to `public_html`
4. Maintain folder structure exactly as in `/out`

## Post-Deployment Checklist
- [ ] Homepage loads correctly
- [ ] All navigation links work
- [ ] Images display properly
- [ ] CSS styles are applied
- [ ] JavaScript interactions work
- [ ] Forms submit correctly (if any)
- [ ] Mobile responsiveness works
- [ ] All pages accessible (no 404s)

## Support
If you encounter issues:
1. Check browser console for errors
2. Verify file permissions
3. Check GoDaddy error logs in cPanel
4. Ensure all files were uploaded completely
