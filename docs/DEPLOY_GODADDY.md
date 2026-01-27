# Deploying to GoDaddy cPanel

This guide covers deploying the static export to GoDaddy cPanel hosting.

## Prerequisites

1. GoDaddy cPanel hosting account
2. FTP/SFTP access credentials
3. Built static export (`/out` folder)

## Build the Static Export

1. Ensure all dependencies are installed:
   ```bash
   npm install
   ```

2. Build the static export:
   ```bash
   npm run build
   ```

3. Verify the `/out` folder was created and contains:
   - `index.html`
   - `doctors/` directory
   - `_next/` directory (static assets)
   - Other static files

## Deployment Options

### Option 1: Root Domain Deployment

If deploying to the root of your domain (e.g., `yourdomain.com`):

1. **Upload Files**:
   - Connect via FTP/SFTP to your cPanel
   - Navigate to `public_html/` (or `www/` depending on your setup)
   - Upload ALL contents of the `/out` folder to `public_html/`
   - Ensure `index.html` is in the root

2. **Verify**:
   - Visit `yourdomain.com` - should show the landing page
   - Visit `yourdomain.com/doctors/` - should show the directory

### Option 2: Subfolder Deployment

If deploying to a subfolder (e.g., `yourdomain.com/directory/`):

1. **Set Base Path**:
   - Create a `.env.local` file in the project root:
     ```
     NEXT_PUBLIC_BASE_PATH=/directory
     ```
   - Rebuild: `npm run build`

2. **Upload Files**:
   - Upload ALL contents of `/out` to `public_html/directory/`
   - Ensure the folder structure is: `public_html/directory/index.html`

3. **Verify**:
   - Visit `yourdomain.com/directory/` - should show the landing page

## File Upload Steps (cPanel File Manager)

1. Log into cPanel
2. Open **File Manager**
3. Navigate to `public_html/` (or your target directory)
4. Upload the contents of `/out` folder:
   - Select all files in `/out`
   - Upload via drag-and-drop or upload button
   - Ensure folder structure is preserved

## File Upload Steps (FTP/SFTP)

1. Connect using an FTP client (FileZilla, Cyberduck, etc.)
2. Navigate to `public_html/` directory
3. Upload all files from `/out` folder maintaining the directory structure

## Important Notes

### Trailing Slashes

The site is configured with `trailingSlash: true` in `next.config.js`. This means:
- Routes end with `/` (e.g., `/doctors/`)
- cPanel should handle this automatically, but verify URLs work

### .htaccess (if needed)

If you encounter routing issues, create a `.htaccess` file in `public_html/`:

```apache
RewriteEngine On
RewriteBase /

# Handle trailing slashes
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_URI} !(.*)/$
RewriteRule ^(.*)$ $1/ [L,R=301]

# Handle Next.js routing
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ /index.html [L]
```

### Base Path Configuration

If deploying to a subfolder, ensure `NEXT_PUBLIC_BASE_PATH` is set before building:

```bash
# In .env.local
NEXT_PUBLIC_BASE_PATH=/your-subfolder

# Then rebuild
npm run build
```

## Troubleshooting

### 404 Errors on Routes

**Problem**: Direct navigation to `/doctors/[slug]` returns 404

**Solution**: 
- Ensure all files from `/out` are uploaded
- Check that `.htaccess` is configured (see above)
- Verify trailing slashes are handled correctly

### Assets Not Loading

**Problem**: CSS, JS, or images not loading

**Solution**:
- Verify `_next/` folder is uploaded with all contents
- Check file permissions (should be 644 for files, 755 for directories)
- Verify `basePath` configuration matches your deployment path

### Logo Not Showing

**Problem**: Logo image not displaying

**Solution**:
- Verify `public/logodrp.png` is uploaded to `public_html/logodrp.png`
- Check file permissions
- Verify the path in code matches the actual file location

### Build Errors

**Problem**: `npm run build` fails

**Solution**:
- Ensure all dependencies are installed: `npm install`
- Check for TypeScript errors: `npm run lint`
- Verify Node.js version is 18+

## Post-Deployment Checklist

- [ ] Landing page loads correctly
- [ ] Navigation links work
- [ ] Doctor directory page loads
- [ ] Doctor profile pages load (test multiple slugs)
- [ ] Filters work on directory page
- [ ] Images and assets load correctly
- [ ] Mobile responsive design works
- [ ] All links and CTAs function

## Updating the Site

To update the site:

1. Make changes to source files
2. Rebuild: `npm run build`
3. Upload new `/out` contents to cPanel
4. Clear browser cache if needed

## Support

For GoDaddy-specific hosting issues, contact GoDaddy support. For application issues, refer to other documentation files.
