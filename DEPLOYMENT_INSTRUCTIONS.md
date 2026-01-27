# 🚀 GoDaddy Deployment Instructions

## ✅ Build Complete!

Your deployment zip file has been created: **`deployment.zip`** (~43 MB)

## 📦 What's Inside

The zip file contains everything from the `/out` folder:
- ✅ All HTML pages (169 static pages)
- ✅ JavaScript bundles (`_next/static/chunks/`)
- ✅ CSS files (`_next/static/css/`)
- ✅ All images and assets from `/public`
- ✅ All doctor profile pages (102 doctors)
- ✅ All article pages (public health, medical students, trustee announcements)
- ✅ Dashboard pages
- ✅ Membership page
- ✅ `.htaccess` file for routing (included)
- ✅ All other routes

## 🎯 Quick Deployment Steps

### Option 1: cPanel File Manager (Recommended)

1. **Log into GoDaddy cPanel**
   - Go to your GoDaddy account
   - Open cPanel

2. **Open File Manager**
   - Navigate to **File Manager** in cPanel
   - Go to `public_html/` (or your domain's root directory)

3. **Upload the Zip File**
   - Click **Upload** button
   - Select `deployment.zip` from your computer
   - Wait for upload to complete

4. **Extract the Zip File**
   - Right-click `deployment.zip` in File Manager
   - Select **Extract**
   - Extract to `public_html/`
   - This will create an `out/` folder

5. **Move Contents to Root**
   - Open the `out/` folder
   - Select **ALL** files and folders inside
   - Click **Move** button
   - Move to `public_html/` (parent directory)
   - Confirm the move

6. **Delete Empty Folders**
   - Delete the empty `out/` folder
   - Delete `deployment.zip` (optional, to save space)

7. **Set File Permissions** (if needed)
   - Files: **644**
   - Folders: **755**
   - `.htaccess` should be **644**

### Option 2: FTP/SFTP Upload

1. **Extract Locally**
   - Extract `deployment.zip` on your computer
   - You'll get an `out/` folder

2. **Connect via FTP**
   - Use FileZilla, Cyberduck, or any FTP client
   - Connect to your GoDaddy FTP server
   - Navigate to `public_html/` directory

3. **Upload Contents**
   - Upload **ALL contents** from the `out/` folder
   - Upload directly to `public_html/` (not inside a subfolder)
   - Ensure `.htaccess` is uploaded
   - Maintain directory structure

4. **Verify Upload**
   - Check that `index.html` is in `public_html/`
   - Check that `_next/` folder exists
   - Check that `.htaccess` exists

## ✅ Post-Deployment Checklist

After uploading, test these URLs:

- [ ] **Homepage**: `https://yourdomain.com/`
- [ ] **Doctors Directory**: `https://yourdomain.com/doctors/`
- [ ] **Doctor Profile**: `https://yourdomain.com/doctors/phillip-brick/`
- [ ] **Join Us Page**: `https://yourdomain.com/join-us/`
- [ ] **Login Test**: 
  - Go to `/join-us`
  - Email: `doctor@aip.com`
  - Password: `AIP@12345`
  - Should redirect to dashboard
- [ ] **Dashboard**: `https://yourdomain.com/doctor/dashboard/`
- [ ] **Public Health**: `https://yourdomain.com/public-health/`
- [ ] **Membership**: `https://yourdomain.com/membership/`
- [ ] **Trustee Board**: `https://yourdomain.com/trustee-board/`
- [ ] **Medical Students**: `https://yourdomain.com/medical-students/`

## 🔧 Troubleshooting

### 404 Errors on Routes

**Problem**: Direct navigation to routes returns 404

**Solution**:
- Verify `.htaccess` file is uploaded to `public_html/`
- Check file permissions (644 for `.htaccess`)
- Clear browser cache
- Try accessing with trailing slash: `/doctors/` instead of `/doctors`

### Assets Not Loading (CSS/JS/Images)

**Problem**: Page loads but styling is broken

**Solution**:
- Verify `_next/` folder is uploaded completely
- Check file permissions (644 for files, 755 for folders)
- Check browser console for 404 errors
- Verify paths in browser Network tab

### Login Not Working

**Problem**: Can't log in to dashboard

**Solution**:
- Use correct credentials: `doctor@aip.com` / `AIP@12345`
- Check browser console for errors
- Verify localStorage is enabled
- Try in incognito/private window

### .htaccess Not Working

**Problem**: Routing still broken after uploading `.htaccess`

**Solution**:
- Verify `.htaccess` is in `public_html/` root (not in subfolder)
- Check file permissions (644)
- Contact GoDaddy support to ensure mod_rewrite is enabled
- Try renaming to `.htaccess.txt` then back to `.htaccess`

## 📋 File Structure After Deployment

Your `public_html/` should look like this:

```
public_html/
├── .htaccess
├── index.html
├── 404.html
├── logodrp.png
├── Background.mp4
├── _next/
│   └── static/
│       ├── chunks/
│       └── css/
├── doctors/
│   ├── index.html
│   └── [slug]/
├── join-us/
├── doctor/
│   └── dashboard/
├── public-health/
├── membership/
├── trustee-board/
└── medical-students/
```

## 🔄 Updating the Site

To update the site in the future:

1. Make changes to source files
2. Run `npm run build` locally
3. Create new zip: `zip -r deployment.zip out -x "*.DS_Store"`
4. Upload new zip to cPanel
5. Extract and move contents (same as initial deployment)
6. Clear browser cache if needed

## 📞 Support

- **GoDaddy Hosting Issues**: Contact GoDaddy support
- **Application Issues**: Check documentation in `/docs` folder
- **Build Issues**: Run `npm run lint` to check for errors

## 🎉 Success!

Once deployed, your site should be live at `https://yourdomain.com/`

All pages are pre-rendered for fast loading, and the site works entirely client-side with no backend required.
