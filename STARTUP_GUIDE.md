# Startup Guide - Alliance of Independent Physicians Website

## Quick Start

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager
- Git (for version control)

### Initial Setup

1. **Clone the repository** (if not already done):
   ```bash
   git clone <repository-url>
   cd EnsembleDrPage-main
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```

4. **Open your browser**:
   Navigate to `http://localhost:3001`

## Development Workflow

### Starting the Dev Server

**Standard start:**
```bash
npm run dev
```

**Start on different port:**
```bash
npm run dev:3000  # Starts on port 3000
```

**Kill existing processes and restart:**
```bash
# Kill processes on port 3001
lsof -ti:3001 | xargs kill -9 2>/dev/null

# Or kill all node processes
killall -9 node 2>/dev/null

# Then start fresh
npm run dev
```

### Common Issues and Solutions

#### Port Already in Use (EADDRINUSE)
```bash
# Find and kill process on port 3001
lsof -ti:3001 | xargs kill -9

# Or use the kill script
./kill-processes.sh
```

#### Infinite Loading / Compilation Errors
1. Check browser console for runtime errors
2. Check terminal for compilation errors
3. Verify TypeScript compilation:
   ```bash
   npx tsc --noEmit --skipLibCheck
   ```
4. Clear Next.js cache:
   ```bash
   rm -rf .next
   npm run dev
   ```

#### Google Fonts Network Errors
- These are warnings and won't prevent the app from running
- Fonts will fallback to system fonts if network access is restricted
- For production, ensure network access to `fonts.gstatic.com`

### Project Structure

```
EnsembleDrPage-main/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── page.tsx            # Homepage (role selection)
│   │   ├── about/              # About page
│   │   ├── practices/         # Practice search page
│   │   ├── patients/           # Patient landing page
│   │   ├── physicians/         # Physician landing page
│   │   └── ...
│   ├── components/             # React components
│   │   ├── newhome/           # Homepage components
│   │   ├── patients/          # Patient-specific components
│   │   ├── physicians/        # Physician-specific components
│   │   └── ...
│   ├── data/                   # Static data files
│   │   ├── doctors.ts         # Doctor data
│   │   ├── institutions.ts    # Institution data
│   │   ├── departments.ts     # Department data
│   │   └── zipCoordinates.ts  # ZIP code coordinates
│   ├── lib/                    # Utility functions and hooks
│   │   ├── institutionSearch.ts
│   │   ├── useGeolocation.ts
│   │   └── ...
│   └── scripts/                # Data generation scripts
│       ├── seedInstitutionsFromDoctors.ts
│       └── extractZipCodes.ts
├── public/                      # Static assets
│   ├── Icons/                  # Department icons
│   ├── drplogo/                # Logo files
│   └── ...
├── package.json
├── tsconfig.json
└── next.config.js
```

## Key Features

### 1. Homepage (`/`)
- Hero banner with subheadline
- Role selection (Patient/Doctor)
- Minimal, focused design

### 2. About Page (`/about`)
- Mission statement
- Departments marquee
- "What We Do" section (toggleable Patient/Physician view)
- FAQ section
- Generic CTA section

### 3. Practice Search (`/practices`)
- Search by specialty, name, location
- ZIP code and radius search
- Filter by insurance and availability
- Sort by rating, name, or distance

### 4. Patient Landing (`/patients`)
- Patient-focused content
- Benefits grid
- Step-by-step guide
- Specialties grid

### 5. Physician Landing (`/physicians`)
- Physician-focused content
- Member benefits
- Join steps
- Impact stats

## Development Commands

### Build Commands
```bash
# Development build
npm run dev

# Production build
npm run build

# Start production server
npm start
```

### Type Checking
```bash
# Check TypeScript errors
npx tsc --noEmit --skipLibCheck

# Check with linting
npm run lint
```

### Data Scripts
```bash
# Extract ZIP codes from data
npx tsx src/scripts/extractZipCodes.ts

# Seed institutions from doctors
npx tsx src/scripts/seedInstitutionsFromDoctors.ts
```

## Environment Setup

### Required Environment Variables
Currently, the project uses client-side data storage. No environment variables are required for basic development.

### Optional Configuration
- `NEXT_TELEMETRY_DISABLED=1` - Disable Next.js telemetry
- `NEXT_HOSTNAME=localhost` - Set hostname for dev server

## Git Workflow

### Before Committing
1. Check status: `git status`
2. Review changes: `git diff`
3. Add files: `git add -A` (or specific files)
4. Commit: `git commit -m "descriptive message"`
5. Push: `git push origin <branch-name>`

### Current Branch
- Branch: `feature/homepage-ia-restructure`
- Remote: `origin/feature/homepage-ia-restructure`

## Troubleshooting

### Server Won't Start
1. Check if port is in use: `lsof -ti:3001`
2. Kill processes: `killall -9 node`
3. Clear cache: `rm -rf .next`
4. Reinstall dependencies: `rm -rf node_modules && npm install`

### Components Not Rendering
1. Check browser console for errors
2. Verify component imports are correct
3. Check for TypeScript errors
4. Ensure all dependencies are installed

### Search Not Working
1. Verify data files are present (`src/data/institutions.ts`, etc.)
2. Check browser console for errors
3. Verify ZIP code coordinates are loaded
4. Test with known ZIP codes (e.g., "63101")

## Performance Tips

1. **Use production build for testing**: `npm run build && npm start`
2. **Monitor bundle size**: Check `.next/analyze` if configured
3. **Optimize images**: Use Next.js Image component
4. **Code splitting**: Already implemented via Next.js App Router

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [React Documentation](https://react.dev)

## Support

For issues or questions:
1. Check existing documentation files
2. Review `CODEBASE_UNDERSTANDING.md` for architecture details
3. Check `SESSION_CHANGES_SUMMARY.md` for recent changes
4. Review git commit history for context

## Next Steps After Startup

1. ✅ Verify server is running on `http://localhost:3001`
2. ✅ Test homepage loads correctly
3. ✅ Test navigation to About page
4. ✅ Test practice search functionality
5. ✅ Verify all images and assets load
6. ✅ Check browser console for any errors
7. ✅ Test responsive design on mobile/tablet

---

**Last Updated**: January 29, 2026
**Project Version**: 0.1.0
**Node Version**: 18+
**Next.js Version**: 16.1.6
