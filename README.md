# Alliance of Independent Physicians - Physician Network & Patient Directory

A comprehensive physician network and patient directory platform built with Next.js 14, TypeScript, and Tailwind CSS. This application supports referrals, collaboration, and easier access to quality care across medical specialties.

## 🚀 Features

- **Doctor Directory**: Browse 115+ board-certified physicians across 15+ medical specialties
- **Advanced Search & Filters**: Find doctors by specialty, location, insurance, and availability
- **Detailed Profiles**: View comprehensive doctor profiles with credentials, locations, reviews, and more
- **Member Portal**: Join the network, manage profiles, and access resources
- **Admin Dashboard**: Manage memberships, policies, and requests
- **Public Health Resources**: Articles, news, and wellness information
- **Medical Student Resources**: Guides, tools, and educational content
- **Trustee Board Portal**: Governance, announcements, and policy management

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui + Radix UI
- **Icons**: Lucide React
- **Deployment**: Static Export (GoDaddy cPanel compatible)

## 📋 Prerequisites

- Node.js 18+ and npm
- Git

## 🏃 Quick Start

### Installation

1. Clone the repository:
   ```bash
   git clone git@github.com:GANESH257/Drpagerepo.git
   cd Drpagerepo
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```
   The app will be available at [http://localhost:3001](http://localhost:3001)

### Build for Production

Build the static export:
```bash
npm run build
```

This generates a `/out` folder containing all static files ready for deployment.

## 📁 Project Structure

```
├── public/                 # Static assets (images, videos, PDFs)
├── src/
│   ├── app/               # Next.js App Router pages
│   │   ├── layout.tsx     # Root layout
│   │   ├── page.tsx       # Homepage
│   │   ├── doctors/       # Doctor directory & profiles
│   │   ├── join-us/       # Membership application flow
│   │   ├── doctor/        # Doctor dashboard
│   │   ├── admin/         # Admin dashboard
│   │   └── ...
│   ├── components/        # React components
│   │   ├── ui/            # shadcn/ui components
│   │   ├── dashboard/     # Dashboard components
│   │   ├── admin/         # Admin components
│   │   └── ...
│   ├── data/              # Static data (doctors, articles, etc.)
│   ├── lib/               # Utility functions
│   └── types/              # TypeScript type definitions
├── docs/                   # Documentation
└── package.json           # Dependencies and scripts
```

## 🔐 Login Credentials

### Demo Doctor Login
- **Email**: `doctor@aip.com`
- **Password**: `AIP@12345`

### Alternative Doctor Emails
Any doctor email from `src/data/doctors.ts` works with the same password:
- `phillip.brick@aip.com`
- `hashim.raza@aip.com`
- `robert.hacker@aip.com`
- `amit.bhandarkar@aip.com`
- And more...

## 📦 Deployment

### GoDaddy cPanel Deployment

1. **Build the project**:
   ```bash
   npm run build
   ```

2. **Upload to GoDaddy**:
   - Connect via FTP or cPanel File Manager
   - Navigate to `public_html/`
   - Upload ALL contents of the `/out` folder
   - Ensure `index.html` is in the root

3. **Set file permissions**:
   - Files: 644
   - Directories: 755

See [BUILD_AND_DEPLOY.md](./BUILD_AND_DEPLOY.md) and [docs/DEPLOY_GODADDY.md](./docs/DEPLOY_GODADDY.md) for detailed deployment instructions.

## 📚 Documentation

- [Build & Deploy Guide](./BUILD_AND_DEPLOY.md)
- [GoDaddy Deployment](./docs/DEPLOY_GODADDY.md)
- [Architecture Overview](./docs/ARCHITECTURE.md)
- [Design System](./docs/DESIGN_SYSTEM.md)
- [Features List](./docs/FEATURES.md)

## 🎨 Key Features

### For Patients
- Search and filter doctors by specialty, location, insurance
- View detailed doctor profiles with reviews and availability
- Access public health resources and articles
- Medical student resources and guides

### For Physicians
- Join the network and create profiles
- Manage locations, insurance, and availability
- Dashboard for profile management
- Referral network access

### For Administrators
- Manage membership requests
- Edit membership plans and policies
- Review and approve applications
- Policy management

## 🔧 Development

### Available Scripts

- `npm run dev` - Start development server (port 3001)
- `npm run dev:3000` - Start development server (port 3000)
- `npm run build` - Build static export
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Code Structure

- **Pages**: Located in `src/app/` using Next.js App Router
- **Components**: Reusable components in `src/components/`
- **Data**: Static data files in `src/data/`
- **Utilities**: Helper functions in `src/lib/`
- **Types**: TypeScript definitions in `src/types/`

## 🌐 Routes

- `/` - Homepage
- `/doctors` - Doctor directory
- `/doctors/[slug]` - Individual doctor profiles
- `/join-us` - Membership application
- `/doctor/dashboard` - Doctor dashboard
- `/admin` - Admin dashboard
- `/membership` - Membership information
- `/public-health` - Public health resources
- `/medical-students` - Student resources
- `/trustee-board` - Trustee board portal
- `/contact-us` - Contact page

## 📝 Notes

- ✅ **No environment variables required** - Works out of the box
- ✅ **No database needed** - All data is static
- ✅ **Login works** - Uses localStorage (client-side only)
- ✅ **All routes pre-rendered** - Fast loading times
- ✅ **Mobile responsive** - Works on all devices
- ✅ **Static export compatible** - Ready for GoDaddy hosting

## 📄 License

This project is private and proprietary.

## 👥 Contributing

This is a private repository. For questions or issues, please contact the project maintainer.

---

**Built with ❤️ for the Alliance of Independent Physicians**
