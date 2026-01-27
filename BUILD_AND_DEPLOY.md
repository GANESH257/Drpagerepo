# Build and Deploy Instructions

## Quick Start

Run these commands in order to build and prepare for deployment:

```bash
# 1. Install dependencies (if not already installed)
npm install

# 2. Build the static export
npm run build

# 3. Verify the build output
# Check that /out folder was created successfully
ls -la out/
```

## What Gets Built

After running `npm run build`, Next.js will:
- Generate static HTML files for all pages
- Pre-render all dynamic routes (doctor profiles, articles, announcements)
- Bundle all JavaScript and CSS
- Copy all assets from `/public` folder
- Create the `/out` folder with everything ready to deploy

## Deployment to GoDaddy

1. **Build the project** (see commands above)

2. **Upload to GoDaddy**:
   - Connect via FTP or cPanel File Manager
   - Navigate to your domain's `public_html` directory
   - Upload ALL contents of the `/out` folder
   - Ensure file permissions are correct (644 for files, 755 for directories)

3. **Test the deployment**:
   - Visit your domain
   - Test login: Go to `/join-us`, use `doctor@aip.com` / `AIP@12345`
   - Verify dashboard works after login
   - Test logout functionality

## Login Credentials

**Demo Login**:
- Email: `doctor@aip.com`
- Password: `AIP@12345`

**Alternative emails** (any doctor email from `src/data/doctors.ts` works with the same password):
- `phillip.brick@aip.com`
- `hashim.raza@aip.com`
- `richard.divalerio@aip.com`
- `ying.du@aip.com`
- `sitwat.malik@aip.com`
- `melvin.maclin@aip.com`
- `lawrence.feigenbaum@aip.com`
- `connie.gibstine@aip.com`
- `sarah.johnson@aip.com`
- `michael.chen@aip.com`
- `robert.martinez@aip.com`

## Important Notes

- ✅ **No environment variables required** - Everything works out of the box
- ✅ **No database needed** - All data is static
- ✅ **Login works** - Uses localStorage (client-side only)
- ✅ **All routes pre-rendered** - Fast loading times
- ✅ **Mobile responsive** - Works on all devices

## Troubleshooting

If build fails:
```bash
# Check for TypeScript errors
npm run lint

# Clear Next.js cache and rebuild
rm -rf .next out
npm run build
```

If login doesn't work:
- Check browser console for errors
- Verify localStorage is enabled
- Try a different browser
- Clear browser cache and try again

## Files Structure After Build

```
out/
├── index.html              # Home page
├── doctors/
│   ├── index.html          # Doctors directory
│   └── [slug]/            # Individual doctor profiles
├── join-us/
│   └── index.html          # Login page
├── doctor/
│   └── dashboard/          # Dashboard routes
├── public-health/
│   └── articles/           # Public health articles
├── membership/
│   └── index.html          # Membership page
├── trustee-board/          # Trustee board pages
├── medical-students/       # Student resources
├── _next/                  # JavaScript and CSS bundles
└── [all public assets]     # Images, PDFs, etc.
```

## Ready to Deploy!

Once `npm run build` completes successfully, your `/out` folder contains everything needed for deployment. Just upload it to GoDaddy and you're done!
