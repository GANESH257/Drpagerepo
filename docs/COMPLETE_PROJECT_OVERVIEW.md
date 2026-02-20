# Complete Project Overview - Alliance of Independent Physicians

**Date**: January 29, 2026  
**Status**: Production-Ready V2 Implementation (87.5% Complete)  
**Architecture**: Next.js 16 Static Export with V2 Practice-Centric Model

---

## Executive Summary

**Alliance of Independent Physicians (AIP)** is a comprehensive physician network and patient directory platform that has undergone a major architectural transformation from **v1 (doctor-centric)** to **v2 (practice-centric)** model. The platform serves three primary audiences:

1. **Patients**: Find doctors, view profiles, access health resources
2. **Physicians**: Join network, manage profiles, access referral network, manage practices
3. **Administrators**: Manage memberships, approvals, policies, and network governance

**Current State**: 
- ✅ V2 Implementation: Steps 2-10.7 Complete (87.5%)
- ✅ All critical features implemented and tested
- ✅ Production-ready for static hosting
- ⚠️ Firebase messaging feature recently merged (may need dependency fixes)
- ⚠️ Chat Scaffolding (Step 8) pending

---

## Technology Stack

### Core Framework
- **Next.js 16.1.6** (App Router with Static Export)
- **React 18.3.0**
- **TypeScript 5.5.0**
- **Static Export Mode** (`output: 'export'`) - No server runtime

### Styling & UI
- **Tailwind CSS 3.4.4** (Utility-first CSS)
- **shadcn/ui** (Radix UI components)
- **Lucide React** (Icons)
- **Recharts** (Charts for admin dashboard)
- **Swiper** (Carousels)
- **Firebase 12.9.0** (Messaging feature - recently added)

### Build & Deployment
- **Node.js 18+** required
- **Static Export** - Generates `/out` folder with all HTML/CSS/JS
- **GoDaddy cPanel Compatible** - Upload `/out` contents to `public_html/`

---

## Project Architecture

### Static Site Architecture
- ✅ **No Server Runtime**: All pages pre-rendered at build time
- ✅ **No API Routes**: Client-side only functionality (except Firebase for messaging)
- ✅ **No Database**: Data stored in TypeScript files + localStorage
- ✅ **localStorage Persistence**: Authentication, profile edits, approvals, referrals, notifications
- ✅ **Firebase Integration**: Real-time messaging (recently added)

### Data Storage Strategy
```
Seed Data (TypeScript files in src/data/)
    ↓
localStorage Overrides (if any)
    ↓
Deleted Items Filter
    ↓
Final Data Set
```

**Storage Keys**:
- `aip_doctor_overrides` - Doctor profile edits
- `aip_practice_overrides` - Practice edits
- `aip_approval_requests` - All approval requests
- `aip_referrals` - Referral data
- `aip_notifications_{doctorId}` - Per-doctor notifications
- `aip_doctor_session` - Doctor authentication
- `aip_admin_session` - Admin authentication
- `aip_practice_roles` - Practice admin assignments

---

## V2 Architecture Transformation

### V1 → V2 Migration

**V1 (Doctor-Centric)**:
- Doctors were standalone entities
- Single admin approval workflow
- Doctor-level practice data
- Simple referral system

**V2 (Practice-Centric)**:
- **Practices are primary entities**
- Doctors belong to practices (`practiceId` required)
- **Multi-party approval workflows** (Admin + Practice Admin)
- Practice-level data (locations, insurance, services)
- Enhanced referral system with history tracking
- Notification system for real-time updates
- Practice Admin portal for practice management

### Key V2 Features Implemented

#### 1. Practice Management (Steps 10.1-10.4)
- ✅ Multi-location support
- ✅ Location add/edit/remove requests
- ✅ Practice edit requests
- ✅ Services & insurance management

#### 2. Approval Workflows (Steps 10.5-10.7)
- ✅ Structured approval rendering (Before/After diffs)
- ✅ Practice edit refinement
- ✅ Roster governance (add/remove doctors)
- ✅ Last practice admin guard
- ✅ Idempotency protection
- ✅ Deep cloning for audit integrity

#### 3. Referrals & Notifications (Step 8)
- ✅ Enhanced referral system with history
- ✅ Notification system with deep linking
- ✅ Referral status tracking

#### 4. Contact Visibility (Step 9)
- ✅ Role-based contact display
- ✅ Public sees practice contact only
- ✅ Logged-in doctors see personal contacts

---

## Project Structure

```
EnsembleDrPage-main/
├── src/
│   ├── app/                          # Next.js App Router pages
│   │   ├── layout.tsx               # Root layout (TopBar, Header, Footer, FloatingMessageIcon)
│   │   ├── page.tsx                 # Homepage
│   │   ├── doctors/                 # Doctor directory & profiles
│   │   │   ├── page.tsx             # Directory listing
│   │   │   └── [slug]/page.tsx     # Individual doctor profiles
│   │   ├── practices/               # Practice directory (V2)
│   │   │   ├── page.tsx             # Practice listing
│   │   │   └── [slug]/page.tsx     # Practice detail pages
│   │   ├── join-us/                 # Authentication & onboarding
│   │   │   ├── page.tsx             # Sign in/Sign up
│   │   │   ├── application/        # Application flow
│   │   │   └── onboarding/         # Onboarding flow
│   │   ├── doctor/dashboard/        # Doctor portal (protected)
│   │   │   ├── page.tsx             # Overview
│   │   │   ├── profile/             # Edit profile
│   │   │   ├── locations/           # Manage locations
│   │   │   ├── insurance/          # Insurance & services
│   │   │   ├── appointments/       # Appointment requests
│   │   │   ├── referrals/          # Referrals (V2 - Sent/Received)
│   │   │   ├── notifications/       # Notifications (V2)
│   │   │   ├── announcements/      # Announcements feed (V2)
│   │   │   ├── messages/            # Messaging (Firebase - recently added)
│   │   │   └── practice/            # Practice Admin portal (V2)
│   │   │       ├── page.tsx         # Practice overview
│   │   │       ├── approvals/       # Practice admin approval queue
│   │   │       ├── doctors/        # Roster management
│   │   │       ├── locations/      # Location management
│   │   │       ├── services-insurance/ # Services & insurance
│   │   │       ├── membership/     # Membership overview
│   │   │       ├── history/        # Approval history
│   │   │       └── announcements/create/ # Create announcements
│   │   ├── admin/                   # Admin portal (protected)
│   │   │   ├── login/page.tsx       # Admin login
│   │   │   ├── page.tsx             # Dashboard
│   │   │   ├── requests-v2/         # Approval queue (V2)
│   │   │   │   ├── page.tsx         # Queue listing
│   │   │   │   └── [id]/page.tsx    # Request detail
│   │   │   ├── history/approvals/   # Approval history
│   │   │   ├── members/             # Member management
│   │   │   ├── memberships/         # Membership plans
│   │   │   ├── policies/            # Policies
│   │   │   ├── events/               # Events
│   │   │   └── announcements/       # Announcements (create & list)
│   │   ├── membership/              # Public membership info
│   │   ├── public-health/           # Public health resources
│   │   ├── medical-students/         # Student resources
│   │   ├── trustee-board/           # Board portal
│   │   ├── patients/                 # Patient-focused pages
│   │   ├── physicians/              # Physician-focused pages
│   │   └── contact-us/              # Contact page
│   ├── components/                   # React components
│   │   ├── ui/                      # shadcn/ui base components
│   │   ├── dashboard/                # Doctor dashboard components
│   │   ├── admin/                    # Admin dashboard components
│   │   ├── join-us/                  # Authentication components
│   │   ├── newhome/                  # Homepage sections
│   │   ├── shared/                   # Shared components
│   │   │   ├── approvals/           # Approval UI components (V2)
│   │   │   │   ├── ApprovalStatusBadge.tsx
│   │   │   │   ├── ApprovalTypeBadge.tsx
│   │   │   │   ├── RequestedChangesRenderer.tsx
│   │   │   │   ├── LocationSummary.tsx
│   │   │   │   ├── PracticeSummary.tsx
│   │   │   │   ├── ChangedFieldsList.tsx
│   │   │   │   ├── Timeline.tsx
│   │   │   │   ├── EmptyState.tsx
│   │   │   │   ├── SearchAndFilterBar.tsx
│   │   │   │   └── SectionHeader.tsx
│   │   │   └── history/              # History components
│   │   ├── public/practices/         # Practice public components (V2)
│   │   ├── portal/                   # Portal shell components
│   │   └── ...                      # Various feature components
│   ├── data/                         # Static data files
│   │   ├── doctors.ts                # Doctor profiles (115+ doctors)
│   │   ├── practices.ts              # Practice seed data (V2)
│   │   ├── departments.ts            # Medical specialties
│   │   ├── membershipPlans.ts       # Membership pricing
│   │   ├── homeStats.ts              # Homepage statistics
│   │   └── ...                      # Other static data
│   ├── lib/                          # Utility functions & services
│   │   ├── services/                 # Business logic services (V2)
│   │   │   ├── approvalEngine.ts    # Approval workflow engine
│   │   │   ├── referralEngine.ts   # Referral management
│   │   │   ├── permissionService.ts # RBAC
│   │   │   ├── visibilityService.ts # Contact visibility rules
│   │   │   ├── membershipService.ts # Membership tracking
│   │   │   ├── announcementService.ts # Announcements
│   │   │   ├── practiceDirectoryService.ts # Practice directory
│   │   │   ├── geocodingService.ts  # ZIP to coordinates
│   │   │   └── errors.ts            # Error types
│   │   ├── storage/                  # Storage modules (V2)
│   │   │   ├── approvalStorage.ts   # Approval requests
│   │   │   ├── practiceStorage.ts   # Practice data
│   │   │   ├── referralStorage.ts  # Referrals
│   │   │   ├── notificationStorage.ts # Notifications
│   │   │   ├── invitationStorage.ts # Invitations
│   │   │   ├── referralHistoryStorage.ts # Referral history
│   │   │   ├── keys.ts              # Storage key constants
│   │   │   └── localStorage.ts     # SSR-safe helpers
│   │   ├── utils/                    # Utility functions
│   │   │   ├── locationDiff.ts      # Location diffing (V2)
│   │   │   ├── practiceDiff.ts     # Practice diffing (V2)
│   │   │   ├── approvalTypeLabels.ts # Approval type labels
│   │   │   ├── approvalStatusHelpers.ts # Status helpers
│   │   │   └── approvalHistoryHelpers.ts # History helpers
│   │   ├── migrations/               # Data migration utilities (V2)
│   │   ├── firebase.ts               # Firebase config (recently added)
│   │   ├── messageStorage.ts        # Message storage (Firebase - recently added)
│   │   ├── doctorStorage.ts          # Doctor CRUD
│   │   ├── adminStorage.ts          # Admin data management
│   │   ├── useDoctorSession.ts      # Authentication hooks
│   │   ├── dateUtils.ts             # Date formatting
│   │   └── toast.ts                 # Toast notifications
│   └── types/                        # TypeScript definitions
│       ├── index.ts                 # Core types (Doctor, Location, etc.)
│       ├── practice.ts              # Practice types (V2)
│       ├── approvals.ts             # Approval types (V2)
│       ├── referrals.ts             # Referral types (V2)
│       ├── notifications.ts         # Notification types (V2)
│       ├── announcements.ts         # Announcement types (V2)
│       ├── invitations.ts           # Invitation types (V2)
│       └── membership.ts            # Membership types (V2)
├── public/                           # Static assets
│   ├── logodrp.png                  # Logo
│   ├── bg.mp4                       # Hero video
│   ├── shapes/                      # Shape images
│   ├── resources/                   # PDF resources
│   └── ...                          # Other assets
├── docs/                             # Documentation
│   ├── V2_COMPLETE_IMPLEMENTATION_SUMMARY.md
│   ├── V2_TESTING_AND_VERIFICATION_GUIDE.md
│   ├── V2_QUICK_REFERENCE.md
│   ├── V2_MIGRATION_GUIDE.md
│   ├── V2_STEP*.md                  # Step-by-step implementation docs
│   └── ...                          # Other documentation
├── firestore.rules                   # Firebase rules (recently added)
├── firestore.indexes.json            # Firebase indexes (recently added)
├── next.config.js                    # Next.js configuration
├── tailwind.config.ts                # Tailwind CSS configuration
├── tsconfig.json                      # TypeScript configuration
└── package.json                      # Dependencies & scripts
```

---

## Core Features

### 1. Public-Facing Features

#### Homepage (`/`)
- Hero section with video background
- Dual-audience messaging (patients/physicians)
- Featured doctors
- Departments/specialties grid
- Latest news and articles
- Community comments/testimonials
- FAQ section

#### Doctor Directory (`/doctors`)
- Advanced search & filters (specialty, location, insurance, availability)
- Doctor cards with ratings and reviews
- URL-synced filters
- Responsive design (sticky sidebar desktop, sheet drawer mobile)

#### Doctor Profiles (`/doctors/[slug]`)
- Comprehensive doctor information
- Practice context (V2)
- Locations with maps
- Insurance accepted
- Patient reviews
- Send Referral button (for authenticated doctors)
- Contact visibility based on role

#### Practice Directory (`/practices`) - V2
- Practice listing with search/filters
- Practice detail pages
- Multiple locations per practice
- Doctors in practice
- Services & insurance

### 2. Doctor Portal (`/doctor/dashboard/*`)

#### Overview (`/doctor/dashboard`)
- Stats cards (appointments, referrals)
- Quick actions
- Charts (monthly appointments, referrals)

#### Profile Management (`/doctor/dashboard/profile`)
- Comprehensive profile editing
- Accordion sections (basic info, credentials, locations, insurance)
- Auto-save functionality

#### Referrals (`/doctor/dashboard/referrals`) - V2
- Sent/Received tabs
- Referral status management
- Referral detail view with timeline
- Status changes (new → attended/removed)

#### Notifications (`/doctor/dashboard/notifications`) - V2
- All/Unread filtering
- Mark as read functionality
- Deep linking support
- Type badges (Referral, Approval, Announcement, Roster)

#### Announcements (`/doctor/dashboard/announcements`) - V2
- Announcements feed
- Filtered by audience (all doctors or practice doctors)
- Admin and practice admin announcements

#### Messages (`/doctor/dashboard/messages`) - Recently Added
- Real-time messaging via Firebase
- Doctor-to-doctor messaging
- Floating message icon in layout

#### Practice Admin Portal (`/doctor/dashboard/practice/*`) - V2
- **Practice Overview**: View practice details
- **Approvals**: Review and approve practice requests
- **Doctors**: Roster management (invite/remove doctors)
- **Locations**: Location management (add/edit/remove)
- **Services & Insurance**: Manage services and insurance
- **Membership**: View practice membership overview
- **History**: View approval history for practice
- **Announcements**: Create practice announcements

### 3. Admin Portal (`/admin/*`)

#### Dashboard (`/admin`)
- Stats cards (pending requests, members, etc.)
- Analytics charts
- Recent requests

#### Approval Queue (`/admin/requests-v2`) - V2
- Unified approval queue
- Search and filter functionality
- Request type badges
- Status badges
- Quick glance summaries
- Detail pages with formatted rendering

#### Approval History (`/admin/history/approvals`) - V2
- Complete approval history log
- Filtering (type, status, date range, practice, doctor)
- Detail drawer with formatted views
- Timeline display

#### Announcements (`/admin/announcements`) - V2
- Create announcements for all doctors
- Announcement listing
- Notification creation

#### Other Admin Features
- Member management
- Membership plans
- Policies
- Events

---

## V2 Approval Workflows

### Approval Request Types

1. **`doctor_join_practice`** - Doctor requests to join existing practice
2. **`new_practice_with_admin_doctor`** - Doctor creates new practice
3. **`practice_edit_request`** - Practice admin requests practice edits
4. **`practice_doctor_add_request`** - Practice admin invites doctor
5. **`practice_doctor_remove_request`** - Practice admin removes doctor
6. **`practice_location_add_request`** - Practice admin adds location
7. **`practice_location_edit_request`** - Practice admin edits location
8. **`practice_location_remove_request`** - Practice admin removes location
9. **`practice_location_change_request`** - Legacy type
10. **`practice_insurance_services_change_request`** - Legacy type

### Approval Flow

```
Submit Request
    ↓
Status: 'submitted'
    ↓
Admin Approval Required? → Yes → Admin Reviews
    ↓                                    ↓
Practice Admin Required? → Yes → Practice Admin Reviews
    ↓                                    ↓
Both Approved? → Yes → Status: 'approved' → Side Effects Applied
    ↓
Any Rejection? → Yes → Status: 'rejected' → No Changes
```

### Multi-Party Approval
- **Admin**: Can approve/reject any request
- **Practice Admin**: Can approve/reject requests for their practice only
- **Both Required**: Some requests require both approvals

---

## Data Models

### Practice (V2 Primary Entity)
```typescript
{
  id: string;
  slug: string;
  name: string;
  description: string;
  phone: string;
  email?: string;
  website?: string;
  address: { line1, line2?, city, state, zip, country };
  locations: PracticeLocation[]; // Multiple locations
  specialties: string[]; // Derived from doctors
  doctorIds: string[]; // Doctors in practice
  services?: string[];
  insurance?: Insurance[];
  logo?: string;
  images?: string[];
  createdAt: string;
  updatedAt: string;
}
```

### Doctor
```typescript
{
  id: string;
  slug: string;
  practiceId: string; // Required in V2
  roleInPractice?: 'doctor' | 'practice_admin'; // V2
  firstName: string;
  lastName: string;
  fullName: string;
  specialty: string;
  specialties?: string[];
  credentials: string;
  bio: string;
  email?: string; // Visibility controlled
  phone?: string; // Visibility controlled
  locations: Location[]; // Legacy - use practice.locations
  insurance: Insurance[];
  rating: number;
  reviewCount: number;
  reviews: Review[];
  // ... other fields
}
```

### ApprovalRequest (V2)
```typescript
{
  id: string;
  type: ApprovalType;
  status: 'submitted' | 'under_review' | 'approved' | 'rejected';
  submittedAt: string;
  updatedAt: string;
  submittedBy: {
    role: 'public' | 'doctor' | 'practice_admin' | 'admin';
    email?: string;
    doctorId?: string;
    practiceId?: string;
  };
  approvals: {
    admin: { status, decidedAt?, notes? };
    practiceAdmin?: { practiceId, status, decidedAt?, notes? };
  };
  payload: any; // Type-specific payload
  target?: { practiceId?, doctorId? };
}
```

### Referral (V2)
```typescript
{
  id: string;
  createdAt: string;
  updatedAt: string;
  fromDoctorId: string;
  toDoctorId: string;
  fromPracticeId?: string;
  toPracticeId?: string;
  patient: { initials?, age?, sex? };
  condition: string;
  notes?: string;
  status: 'new' | 'attended' | 'removed';
}
```

### Notification (V2)
```typescript
{
  id: string;
  doctorId: string;
  type: NotificationType;
  title: string;
  message: string;
  href?: string; // Deep link
  createdAt: string;
  readAt?: string;
}
```

---

## Authentication System

### Current Implementation (Demo Mode)
- **Storage**: localStorage (`aip_doctor_session`, `aip_admin_session`)
- **Session Object**: `{ email, role, doctorId?, practiceId?, loginAt }`
- **Email Mapping**: Maps email to doctor record from `doctors.ts`
- **Protected Routes**: Client-side route protection
- **Demo Credentials**: 
  - Doctor: `doctor@aip.com` / `AIP@12345`
  - Admin: `admin@aip.com` / any password

### Roles
1. **Public**: Unauthenticated users
2. **Doctor**: Authenticated doctor (can be `practice_admin`)
3. **Practice Admin**: Doctor with `roleInPractice: 'practice_admin'`
4. **Admin**: System administrator

---

## Key Services & Engines

### Approval Engine (`src/lib/services/approvalEngine.ts`)
- **Submit Request**: Creates approval request with validation
- **Decide As Admin**: Admin approval/rejection logic
- **Decide As Practice Admin**: Practice admin approval/rejection logic
- **Apply Side Effects**: Applies approved changes to data
- **Governance**: Idempotency, last admin guard, deep cloning

### Referral Engine (`src/lib/services/referralEngine.ts`)
- **Create Referral**: Doctor-to-doctor referrals
- **Set Status**: Update referral status
- **Get Timeline**: Retrieve referral history
- **Notifications**: Auto-create notifications

### Permission Service (`src/lib/services/permissionService.ts`)
- **Role Checks**: `assertAdmin`, `assertDoctor`, `assertPracticeAdmin`
- **Permission Checks**: `canSendReferral`, `canEditPractice`
- **Actor Resolution**: `getActorFromSession`

### Visibility Service (`src/lib/services/visibilityService.ts`)
- **Contact Visibility**: Role-based contact display
- **Public vs Authenticated**: Different contact rules

---

## Routes Summary

### Public Routes
- `/` - Homepage
- `/doctors` - Doctor directory
- `/doctors/[slug]` - Doctor profiles
- `/practices` - Practice directory (V2)
- `/practices/[slug]` - Practice profiles (V2)
- `/join-us` - Authentication
- `/membership` - Membership info
- `/public-health` - Health resources
- `/medical-students` - Student resources
- `/trustee-board` - Board portal
- `/patients` - Patient-focused pages
- `/physicians` - Physician-focused pages
- `/contact-us` - Contact page

### Doctor Portal Routes (Protected)
- `/doctor/dashboard` - Overview
- `/doctor/dashboard/profile` - Edit profile
- `/doctor/dashboard/locations` - Manage locations
- `/doctor/dashboard/insurance` - Insurance & services
- `/doctor/dashboard/appointments` - Appointment requests
- `/doctor/dashboard/referrals` - Referrals (V2)
- `/doctor/dashboard/notifications` - Notifications (V2)
- `/doctor/dashboard/announcements` - Announcements (V2)
- `/doctor/dashboard/messages` - Messaging (Firebase)
- `/doctor/dashboard/practice/*` - Practice Admin portal (V2)

### Admin Portal Routes (Protected)
- `/admin/login` - Admin login
- `/admin` - Dashboard
- `/admin/requests-v2` - Approval queue (V2)
- `/admin/requests-v2/[id]` - Request detail (V2)
- `/admin/history/approvals` - Approval history (V2)
- `/admin/announcements` - Announcements (V2)
- `/admin/members` - Member management
- `/admin/memberships` - Membership plans
- `/admin/policies` - Policies
- `/admin/events` - Events

---

## Current Issues & Status

### ✅ Completed
- V2 Steps 2-10.7 (87.5% complete)
- All UI screens implemented
- All navigation links updated
- Testing guide comprehensive
- TypeScript compilation: 0 errors

### ⚠️ Known Issues
- **Firebase Module Not Found**: After recent merge, Firebase modules may need `npm install` or dependency refresh
- **Chat Scaffolding**: Step 8 pending (not critical)

### 🔄 Recent Changes
- Messaging feature merged (Firebase integration)
- Admin announcements page added
- Approval request detail pages refactored to client components
- UI/UX updates

---

## Development Workflow

### Local Development
```bash
npm install              # Install dependencies
npm run dev             # Start dev server (port 3001)
npm run dev:3000        # Start dev server (port 3000)
npm run build           # Build static export
npm run start           # Start production server (testing)
npm run lint            # Run ESLint
```

### Build Process
1. `npm run build` runs Next.js build
2. Next.js pre-renders all pages
3. `generateStaticParams()` creates all dynamic routes
4. Output written to `/out` folder
5. `/out` contains fully static HTML, CSS, JS files

### Deployment
- **Target**: GoDaddy cPanel hosting
- **Method**: Upload `/out` folder contents to `public_html/`
- **Configuration**: `trailingSlash: true` for URL structure

---

## Testing & Verification

### Testing Guide
- Comprehensive guide: `docs/V2_TESTING_AND_VERIFICATION_GUIDE.md`
- Covers all Steps 2-10.7
- Includes referral forms, notifications, approvals testing
- Edge cases and integration testing

### Verification Status
- ✅ All UI screens verified
- ✅ All navigation links verified
- ✅ All routes exist and accessible
- ✅ Request type names corrected
- ✅ Testing guide comprehensive

---

## Documentation Files

### V2 Documentation
- `docs/V2_COMPLETE_IMPLEMENTATION_SUMMARY.md` - Complete V2 overview
- `docs/V2_TESTING_AND_VERIFICATION_GUIDE.md` - Comprehensive testing guide
- `docs/V2_QUICK_REFERENCE.md` - Quick reference guide
- `docs/V2_MIGRATION_GUIDE.md` - Migration guide
- `docs/V2_STEP*.md` - Step-by-step implementation docs
- `docs/V2_FINAL_VERIFICATION_SUMMARY.md` - Final verification report

### General Documentation
- `README.md` - Main project README
- `PROJECT_UNDERSTANDING.md` - Project overview
- `docs/ARCHITECTURE.md` - Technical architecture
- `docs/FEATURES.md` - Feature documentation
- `docs/DEPLOY_GODADDY.md` - Deployment guide

---

## Key Takeaways

1. **V2 Transformation**: Successfully migrated from doctor-centric to practice-centric model
2. **Multi-Party Approvals**: Admin + Practice Admin approval workflows
3. **Practice Management**: Full practice admin portal with location/roster management
4. **Enhanced Features**: Referrals with history, notifications, announcements
5. **Structured Rendering**: Before/After diffs for approval requests
6. **Governance**: Idempotency, guards, deep cloning for data integrity
7. **Production Ready**: All critical features implemented and tested
8. **Static Export**: Fully static site ready for GoDaddy hosting
9. **Firebase Integration**: Real-time messaging recently added
10. **Comprehensive Docs**: Extensive documentation for all features

---

**Last Updated**: January 29, 2026  
**Document Version**: 1.0  
**Status**: Complete Project Overview
