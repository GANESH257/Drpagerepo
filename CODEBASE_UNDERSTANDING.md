# Complete Codebase Understanding

## Project Overview

**Alliance of Independent Physicians** - A comprehensive physician network and patient directory platform built with Next.js 16, TypeScript, and Tailwind CSS. This is a static site that connects independent physicians with patients and provides administrative tools for managing the network.

## Architecture

### Tech Stack
- **Framework**: Next.js 16.1.6 (App Router)
- **Language**: TypeScript 5.5.0
- **Styling**: Tailwind CSS 3.4.4
- **UI Components**: Radix UI + shadcn/ui pattern
- **Icons**: Lucide React
- **Charts**: Recharts
- **Deployment**: Static Export (compatible with GoDaddy cPanel)
- **State Management**: React hooks + localStorage (no external state library)

### Key Architectural Decisions
1. **Static Site Generation**: All pages pre-rendered at build time
2. **Client-Side Data Storage**: Uses localStorage for all data persistence (no backend/database)
3. **Demo Mode**: Authentication and data management are client-side only
4. **Component-Based**: Modular React components with clear separation of concerns

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── layout.tsx         # Root layout with TopBar, Header, Footer
│   ├── page.tsx           # Homepage
│   ├── doctors/           # Doctor directory & individual profiles
│   ├── join-us/           # Membership application flow
│   ├── doctor/dashboard/  # Doctor dashboard (protected)
│   ├── admin/             # Admin dashboard (protected)
│   ├── membership/        # Membership information pages
│   ├── public-health/     # Public health resources
│   ├── medical-students/  # Student resources
│   └── trustee-board/     # Trustee board portal
├── components/            # React components
│   ├── ui/                # shadcn/ui base components
│   ├── dashboard/         # Doctor dashboard components
│   ├── admin/             # Admin dashboard components
│   ├── join-us/           # Join/onboarding components
│   ├── newhome/           # Homepage sections
│   └── ...                # Various feature components
├── data/                  # Static data files
│   ├── doctors.ts         # Doctor profiles (115+ doctors)
│   ├── departments.ts     # Medical specialties
│   ├── membershipPlans.ts # Membership pricing
│   └── ...                # Other static data
├── lib/                   # Utility functions
│   ├── doctorStorage.ts   # Doctor profile CRUD
│   ├── adminStorage.ts    # Admin data management
│   ├── useDoctorSession.ts # Authentication hooks
│   └── ...                # Other utilities
└── types/                 # TypeScript definitions
    └── index.ts           # All type definitions
```

## Core Features

### 1. Doctor Directory (`/doctors`)
- **Search & Filter**: By specialty, location, insurance, name, availability
- **Doctor Cards**: Display key info with links to profiles
- **Sorting**: By rating, reviews, name
- **Featured Doctors**: Prioritized display
- **Data Source**: `src/data/doctors.ts` + localStorage overrides

### 2. Doctor Profiles (`/doctors/[slug]`)
- **Comprehensive Profiles**: Bio, credentials, locations, insurance, reviews
- **Booking Slots**: Availability calendar (demo)
- **Reviews**: Patient reviews with ratings
- **Professional Info**: Medical school, residency, certifications
- **Static Generation**: Pre-rendered for all doctors

### 3. Join/Application Flow (`/join-us`)
**Two Flows:**

#### A. Application Flow (New Members)
1. **Sign Up** (`/join-us`): Email/password registration
2. **Application Form** (`/join-us/application`):
   - Step 1: Basic details (name, credentials, specialty, contact)
   - Step 2: Select membership plan
   - Step 3: Payment method selection
   - Step 4: Review & submit
3. **Confirmation** (`/join-us/submitted`): Success message

#### B. Onboarding Flow (Approved Members)
1. **Sign In** (`/join-us`): Login with email/password
2. **Onboarding** (`/join-us/onboarding`):
   - Step 1: Complete profile details
   - Step 2: Select membership plan
   - Step 3: Payment setup
   - Step 4: Complete & create profile

**Storage Keys:**
- `aip_join_email` - Signup email
- `aip_join_request_draft` - Application draft
- `aip_join_requests` - Submitted requests array
- `aip_onboarding_draft_<email>` - Onboarding progress

### 4. Doctor Dashboard (`/doctor/dashboard`)
**Protected Routes** (requires authentication):
- **Overview** (`/doctor/dashboard`): Stats, charts, quick actions
- **Profile** (`/doctor/dashboard/profile`): Edit profile, credentials, bio
- **Locations** (`/doctor/dashboard/locations`): Manage practice locations
- **Insurance** (`/doctor/dashboard/insurance`): Manage accepted insurance
- **Appointments** (`/doctor/dashboard/appointments`): View appointment requests
- **Referrals** (`/doctor/dashboard/referrals`): Track referrals
- **Membership** (`/doctor/dashboard/membership`): View/upgrade membership

**Features:**
- Profile editing with validation
- Location CRUD operations
- Insurance provider management
- Appointment request management
- Referral tracking
- Membership status & upgrade options

**Data Storage:**
- `aip_doctor_session` - Current session
- `aip_doctor_profile_<doctorId>` - Profile data
- `aip_doctor_requests_<doctorId>` - Appointment requests
- `aip_doctor_referrals_<doctorId>` - Referrals

### 5. Admin Dashboard (`/admin`)
**Protected Routes** (requires admin login):
- **Dashboard** (`/admin`): Overview with stats and charts
- **Requests** (`/admin/requests`): Manage join requests (approve/reject)
- **Members** (`/admin/members`): View/edit all doctor profiles
- **Memberships** (`/admin/memberships`): Manage membership plans
- **Policies** (`/admin/policies`): Manage organization policies
- **Events** (`/admin/events`): Manage global medical events

**Features:**
- Join request approval/rejection workflow
- Doctor profile editing
- Membership plan CRUD
- Policy management
- Analytics charts (growth, distribution, trends)
- Stats cards (total members, requests, etc.)

**Admin Credentials:**
- Email: `admin@aip.com`
- Password: `admin123` (hardcoded in `src/lib/adminSession.ts`)

### 6. Public Health (`/public-health`)
- **Articles**: Filterable by topic (diabetes, heart disease, etc.)
- **News Section**: Latest medical news
- **Prevention & Wellness**: Health resources
- **Insurance Info**: Insurance provider information
- **Publications**: Doctor publications showcase

### 7. Medical Students (`/medical-students`)
- **Resource Pillars**: Organized learning resources
- **Articles**: Educational content
- **Tools**: Quick access tools
- **Guides**: Study guides and resources

### 8. Trustee Board (`/trustee-board`)
- **Board Members**: Member profiles and roles
- **Announcements**: Board announcements
- **Policies**: Governance policies
- **Meetings**: Upcoming board meetings

## Authentication System

### Doctor Authentication
- **Storage**: localStorage (`aip_doctor_session`)
- **Session Format**: `{ email: string, role: "doctor", doctorId?: string, loginAt: ISO string }`
- **Demo Credentials**: 
  - Email: Any doctor email from `doctors.ts` (e.g., `doctor@aip.com`)
  - Password: `AIP@12345`
- **Password Hashing**: Uses bcrypt-like hashing in `src/lib/passwordUtils.ts`
- **Protected Routes**: Client-side route guards in dashboard layout
- **Email Mapping**: Maps email to doctor record from `doctors.ts`

### Admin Authentication
- **Storage**: localStorage (`aip_admin_session`)
- **Session Format**: `{ email: string, role: "admin", loginAt: ISO string }`
- **Credentials**: Hardcoded in `src/lib/adminSession.ts`
- **Protected Routes**: Client-side guards in admin layout

## Data Management

### Data Storage Strategy
All data is stored in **localStorage** with the following pattern:

1. **Seed Data**: Static TypeScript files in `src/data/`
2. **Runtime Overrides**: localStorage takes precedence
3. **Fallback**: If localStorage empty, use seed data

### Key Storage Functions

**Doctor Data** (`src/lib/doctorStorage.ts`):
- `loadDoctorProfile(doctorId)` - Load profile (localStorage → seed)
- `saveDoctorProfile(doctorId, profile)` - Save to localStorage
- `loadAppointmentRequests(doctorId)` - Load requests
- `saveAppointmentRequests(doctorId, requests)` - Save requests
- `loadReferrals(doctorId)` - Load referrals
- `saveReferrals(doctorId, referrals)` - Save referrals

**Admin Data** (`src/lib/adminStorage.ts`):
- `getJoinRequests()` - Get all join requests
- `saveJoinRequests(requests)` - Save requests
- `updateJoinRequest(id, updates)` - Update request
- `acceptJoinRequest(id, notes)` - Approve request
- `rejectJoinRequest(id, reason)` - Reject request
- `getMembershipPlans()` - Get plans
- `saveMembershipPlans(plans)` - Save plans

**Membership Data** (`src/lib/membershipStorage.ts`):
- `getMembership(doctorId)` - Get membership info
- `saveMembership(doctorId, membership)` - Save membership
- `upgradeMembership(doctorId, planId, cycle)` - Upgrade plan

## Type System

### Core Types (`src/types/index.ts`)

**Doctor-Related:**
- `Doctor` - Complete doctor profile
- `Location` - Practice location
- `Insurance` - Insurance provider
- `Review` - Patient review
- `BookingSlot` - Availability slot
- `AppointmentRequest` - Appointment request
- `Referral` - Network referral

**Membership-Related:**
- `MembershipPlan` - Plan definition
- `MembershipData` - User's membership status
- `MembershipBenefit` - Benefit definition
- `JoinRequest` - Application request
- `ApplicationDraft` - Application in progress
- `OnboardingDraft` - Onboarding in progress

**Content-Related:**
- `Department` - Medical specialty
- `PublicHealthArticle` - Health article
- `StudentArticle` - Student resource
- `NewsItem` - News item
- `TrusteeBoardMember` - Board member
- `BoardMeeting` - Meeting info

## Routing Structure

### Public Routes
- `/` - Homepage
- `/doctors` - Doctor directory
- `/doctors/[slug]` - Doctor profile
- `/join-us` - Sign up/Sign in
- `/join-us/application` - Application form
- `/join-us/submitted` - Application confirmation
- `/membership` - Membership info
- `/public-health` - Public health resources
- `/medical-students` - Student resources
- `/trustee-board` - Board portal
- `/contact-us` - Contact page

### Protected Routes (Doctor)
- `/doctor/dashboard` - Dashboard overview
- `/doctor/dashboard/profile` - Profile management
- `/doctor/dashboard/locations` - Location management
- `/doctor/dashboard/insurance` - Insurance management
- `/doctor/dashboard/appointments` - Appointment requests
- `/doctor/dashboard/referrals` - Referral tracking
- `/doctor/dashboard/membership` - Membership management

### Protected Routes (Admin)
- `/admin` - Admin dashboard
- `/admin/requests` - Join request management
- `/admin/members` - Member management
- `/admin/memberships` - Plan management
- `/admin/policies` - Policy management
- `/admin/events` - Event management
- `/admin/login` - Admin login

## Component Architecture

### UI Components (`src/components/ui/`)
Base shadcn/ui components:
- Button, Card, Input, Label, Badge
- Dialog, Drawer, Tabs, Select
- Accordion, Alert Dialog, Checkbox
- Separator, Switch, Slot

### Feature Components

**Homepage** (`src/components/newhome/`):
- `NewHomeHeroDocumented` - Hero section
- `AudienceSwitchFloating` - Patient/Physician toggle
- `SearchSection` - Doctor search
- `MissionStatementNewHome` - Mission statement
- `TopSearchedSpecialties` - Popular specialties

**Doctor Directory** (`src/components/`):
- `DoctorCard` - Doctor card display
- `DoctorProfile` - Full profile view
- `DoctorFilters` - Search/filter UI

**Dashboard** (`src/components/dashboard/`):
- `OverviewSection` - Dashboard overview
- `EditProfileSection` - Profile editor
- `LocationsSection` - Location manager
- `InsuranceSection` - Insurance manager
- `AppointmentsSection` - Request manager
- `ReferralsSection` - Referral tracker
- `MembershipSection` - Membership UI

**Admin** (`src/components/admin/`):
- `StatsCards` - Dashboard statistics
- `RequestsTable` - Join request table
- `RequestDetailDrawer` - Request details
- `MembersTable` - Member list
- `MemberEditDialog` - Edit member
- `PlansEditor` - Plan management
- `PoliciesEditor` - Policy management
- Various charts (growth, distribution, etc.)

## Data Files

### Static Data (`src/data/`)

1. **doctors.ts** - 115+ doctor profiles with:
   - Personal info (name, credentials, bio)
   - Locations (address, phone, hours)
   - Insurance providers
   - Reviews and ratings
   - Availability slots
   - Professional credentials

2. **departments.ts** - 20+ medical specialties

3. **membershipPlans.ts** - 3 tiers:
   - Basic ($99/mo or $990/yr)
   - Professional ($199/mo or $1990/yr) - Most Popular
   - Premier (Contact us)

4. **publicHealthArticles.ts** - Health articles by topic

5. **mockJoinRequests.ts** - Sample join requests for testing

6. **homeStats.ts** - Homepage statistics

7. **communityComments.ts** - Patient/physician testimonials

## Key Utilities

### Session Management
- `src/lib/useDoctorSession.ts` - Doctor session hooks
- `src/lib/adminSession.ts` - Admin session management
- `src/lib/passwordUtils.ts` - Password hashing/validation

### Storage Utilities
- `src/lib/doctorStorage.ts` - Doctor data CRUD
- `src/lib/adminStorage.ts` - Admin data CRUD
- `src/lib/membershipStorage.ts` - Membership data
- `src/lib/joinRequestStorage.ts` - Join request storage
- `src/lib/onboardingStorage.ts` - Onboarding progress

### Helper Functions
- `src/lib/slugify.ts` - URL slug generation
- `src/lib/utils.ts` - General utilities (cn, etc.)
- `src/lib/departmentIcons.ts` - Specialty icons
- `src/lib/adminAnalytics.ts` - Analytics calculations

## Styling

### Design System
- **Primary Color**: `#0F5FA8` (brand-dark-blue)
- **Secondary Color**: Teal accents
- **Tailwind Config**: Custom colors defined
- **Responsive**: Mobile-first approach
- **Animations**: Smooth transitions, reduced motion support

### CSS Architecture
- `src/app/globals.css` - Global styles
- Tailwind utility classes throughout
- Component-specific styles inline
- Dark mode support (partial)

## Development Workflow

### Scripts
- `npm run dev` - Dev server (port 3001)
- `npm run dev:3000` - Dev server (port 3000)
- `npm run build` - Static export build
- `npm run start` - Production server
- `npm run lint` - ESLint

### Build Process
1. Next.js compiles TypeScript
2. Static pages pre-rendered
3. Output to `/out` directory
4. Ready for static hosting

### Deployment
- **Target**: GoDaddy cPanel
- **Method**: Static file upload
- **Requirements**: Upload `/out` contents to `public_html/`
- **File Permissions**: 644 (files), 755 (directories)

## Current State & Limitations

### Demo Mode Features
✅ **Working:**
- Doctor directory browsing
- Profile viewing
- Join application flow
- Doctor dashboard (profile editing, locations, insurance)
- Admin dashboard (request management, member editing)
- All UI/UX flows

⚠️ **Limitations:**
- No real authentication (localStorage only)
- No backend API
- No real payment processing
- No email notifications
- Data resets on localStorage clear
- No server-side validation

### Phase 2 Plans (from docs)
- Real OAuth (Google Sign-In)
- Backend API integration
- JWT token authentication
- Database integration
- Email notifications
- Payment processing
- Profile verification workflow

## Key Files Reference

### Entry Points
- `src/app/page.tsx` - Homepage
- `src/app/layout.tsx` - Root layout
- `src/app/globals.css` - Global styles

### Core Logic
- `src/lib/doctorStorage.ts` - Doctor data management
- `src/lib/adminStorage.ts` - Admin data management
- `src/lib/useDoctorSession.ts` - Authentication hooks
- `src/types/index.ts` - Type definitions

### Data Sources
- `src/data/doctors.ts` - Doctor seed data
- `src/data/departments.ts` - Specialty data
- `src/data/membershipPlans.ts` - Plan definitions

### Key Components
- `src/components/DoctorCard.tsx` - Doctor card
- `src/components/DoctorProfile.tsx` - Profile view
- `src/components/dashboard/EditProfileSection.tsx` - Profile editor
- `src/components/admin/RequestsTable.tsx` - Request management

## Testing Credentials

### Doctor Login
- **Email**: `doctor@aip.com` (or any doctor email from `doctors.ts`)
- **Password**: `AIP@12345`

### Admin Login
- **Email**: `admin@aip.com`
- **Password**: `admin123`

## Notes

1. **No Environment Variables**: Works out of the box
2. **No Database**: All data in localStorage
3. **Static Export**: Fully static site
4. **Client-Side Only**: No server-side logic
5. **Demo Purpose**: Built for demonstration/prototyping
6. **Production Ready**: UI/UX is production-quality
7. **Extensible**: Easy to add backend integration

---

**Last Updated**: January 28, 2026
**Project Status**: Fully functional demo/prototype
**Next Steps**: Backend integration, real authentication, database migration
