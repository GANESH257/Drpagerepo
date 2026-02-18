# Running the Project Locally

## Prerequisites

✅ **Node.js**: v22.19.0 (installed)  
✅ **npm**: v10.9.3 (installed)  
✅ **Dependencies**: Already installed in `node_modules/`

---

## Quick Start

### 1. Install Dependencies (if needed)
```bash
npm install
```

### 2. Start Development Server

**Option A: Default Port (3001)**
```bash
npm run dev
```
Server will start at: **http://localhost:3001**

**Option B: Port 3000**
```bash
npm run dev:3000
```
Server will start at: **http://localhost:3000**

### 3. Open in Browser
Once the server starts, you'll see:
```
▲ Next.js 16.1.6
- Local:        http://localhost:3001
- Ready in X.Xs
```

Open **http://localhost:3001** in your browser.

---

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server on port 3001 |
| `npm run dev:3000` | Start dev server on port 3000 |
| `npm run build` | Build for production (creates `/out` folder) |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |

---

## Project Structure

```
EnsembleDrPage-main/
├── src/
│   ├── app/              # Next.js pages (App Router)
│   ├── components/       # React components
│   ├── data/            # Static data files
│   ├── lib/             # Utility functions
│   └── types/           # TypeScript definitions
├── public/              # Static assets
├── out/                 # Build output (generated)
└── package.json         # Dependencies & scripts
```

---

## Key Routes to Test

Once running locally, test these pages:

### Public Pages
- **Homepage**: http://localhost:3001/
- **Dark Homepage**: http://localhost:3001/homedark
- **Doctor Directory**: http://localhost:3001/doctors
- **Patients Page**: http://localhost:3001/patients
- **Physicians Page**: http://localhost:3001/physicians
- **Join Us**: http://localhost:3001/join-us

### Protected Pages (Require Login)
- **Doctor Dashboard**: http://localhost:3001/doctor/dashboard
  - Login: `doctor@aip.com` / `AIP@12345`
- **Admin Dashboard**: http://localhost:3001/admin
  - Login: `admin@aip.com` / `admin123`

---

## Features to Test

### 1. Dark Mode Toggle
- Click the sun/moon toggle in the top bar
- Should switch between `/` (light) and `/homedark` (dark)

### 2. Mission Statement
- Check the "Our Mission" section on homepage
- Should have:
  - ✅ Playfair Display font
  - ✅ Larger text size
  - ✅ Decorative quotation marks
  - ✅ White logo in footer

### 3. Doctor Directory
- Filter by specialty, location, insurance
- Click on doctor cards to view profiles
- Test search functionality

### 4. Authentication
- Try logging in as a doctor
- Test the join-us application flow

---

## Troubleshooting

### Port Already in Use
If port 3001 is busy:
```bash
# Use port 3000 instead
npm run dev:3000

# Or kill the process using port 3001
lsof -ti:3001 | xargs kill -9
```

### Module Not Found Errors
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Build Errors
```bash
# Clear Next.js cache
rm -rf .next
npm run dev
```

### Network Interface Error
If you see `uv_interface_addresses` error:
```bash
# Try binding to localhost only
HOSTNAME=localhost npm run dev
```

---

## Development Tips

1. **Hot Reload**: Changes to files automatically refresh the browser
2. **TypeScript**: Full type checking enabled
3. **Tailwind CSS**: Utility-first styling
4. **Static Export**: Build creates `/out` folder for deployment

---

## Build for Production

To create a production build:
```bash
npm run build
```

This will:
- Compile TypeScript
- Generate static HTML pages (195 pages)
- Create `/out` folder ready for deployment
- Optimize assets

---

## Environment

- **Framework**: Next.js 16.1.6
- **React**: 18.3.0
- **TypeScript**: 5.5.0
- **Tailwind CSS**: 3.4.4
- **Node.js**: 18+ required

---

## Notes

- ✅ No environment variables needed
- ✅ No database required (uses localStorage)
- ✅ All data in TypeScript files
- ✅ Fully static site generation
- ✅ Works offline after build

---

**Ready to run!** Just execute `npm run dev` and open http://localhost:3001 🚀
