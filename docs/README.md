# Alliance of Independent Physicians - Doctors Directory

A patient-facing doctors directory MVP built with Next.js, TypeScript, and Tailwind CSS. This application is designed to be deployed as a static export on GoDaddy cPanel hosting.

## Overview

This directory allows patients to:
- Browse doctors by specialty, location, and insurance
- View detailed doctor profiles with reviews and availability
- Request appointments (placeholder functionality)
- Leave reviews (placeholder functionality)

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- Git

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Build for Production

Build the static export:
```bash
npm run build
```

This generates a `/out` folder containing all static files ready for deployment.

## Project Structure

```
├── public/              # Static assets (logo, images)
├── src/
│   ├── app/            # Next.js App Router pages
│   │   ├── layout.tsx   # Root layout
│   │   ├── page.tsx    # Landing page
│   │   ├── doctors/     # Directory and profile pages
│   │   ├── join-us/     # Doctor onboarding page
│   │   ├── doctor/      # Doctor dashboard
│   │   ├── trustee-board/ # Trustee Board page and announcements
│   │   ├── medical-students/ # Medical students resources
│   │   ├── public-health/ # Public health page and articles
│   │   └── membership/ # Membership page with plans and policies
│   ├── components/     # React components
│   │   ├── ui/         # shadcn/ui components
│   │   └── ...         # Feature components
│   ├── data/           # Local data files
│   │   ├── doctors.ts  # Doctor data
│   │   ├── departments.ts # Department data
│   │   ├── medStudentPillars.ts # Student pillars/resources
│   │   ├── medStudentArticles.ts # Student articles
│   │   ├── medStudentNews.ts # Fallback news data
│   │   ├── publicHealthNews.ts # Public health news fallback
│   │   ├── publicHealthArticles.ts # Public health articles
│   │   ├── preventionWellness.ts # Prevention topics
│   │   ├── insuranceResources.ts # Insurance resources
│   │   ├── doctorPublications.ts # Doctor publications
│   │   ├── trusteeBoardMembers.ts # Board member data
│   │   ├── boardMeetings.ts # Meeting information
│   │   ├── trusteeAnnouncements.ts # Announcements fallback
│   │   ├── trusteePolicies.ts # Policy documents data
│   │   ├── membershipBenefits.ts # Membership benefits data
│   │   ├── membershipPlans.ts # Membership plans and pricing
│   │   ├── membershipPolicies.ts # Membership policies
│   │   ├── membershipFAQ.ts # Membership FAQ data
│   │   ├── homeStats.ts # Homepage hero stats
│   │   ├── memberBenefits.ts # Homepage member benefits
│   │   ├── communityComments.ts # Patient + physician testimonials
│   │   ├── globalMedicalEvents.ts # Upcoming medical events
│   │   └── homeFAQ.ts # Homepage FAQ questions
│   ├── lib/            # Utility functions
│   └── types/          # TypeScript types
├── docs/               # Documentation
└── out/                # Static export output (generated)
```

## Routes

- `/` - Homepage (dual-audience: physician network & patient directory) with hero, mission, what we do, departments, member benefits, how it works, latest news/articles, featured doctors, community comments, global events, and FAQ
- `/doctors` - Doctor directory with filters
- `/doctors/[slug]` - Individual doctor profile pages
- `/join-us` - Doctor onboarding page with sign-in/sign-up forms
- `/doctor/dashboard` - Protected doctor dashboard overview (requires authentication)
- `/doctor/dashboard/profile` - Edit profile section
- `/doctor/dashboard/locations` - Manage practice locations
- `/doctor/dashboard/insurance` - Manage insurance and services
- `/doctor/dashboard/appointments` - View and manage appointment requests
- `/doctor/dashboard/referrals` - Track referrals from network physicians
- `/trustee-board` - Trustee Board page with members, meetings, announcements, and policies
- `/trustee-board/announcements` - Announcements index page
- `/trustee-board/announcements/[slug]` - Individual announcement detail pages
- `/medical-students` - Medical students resources page
- `/medical-students/articles/[slug]` - Individual article detail pages
- `/public-health` - Public health page with news, articles, and resources
- `/public-health/articles` - Articles index page
- `/public-health/articles/[slug]` - Individual public health article detail pages
- `/membership` - Membership page with benefits, plans, policies, and FAQ

## Data Management

### Adding a Doctor

Edit `src/data/doctors.ts` and add a new doctor object following the `Doctor` interface:

```typescript
{
  id: 'unique-id',
  slug: 'firstname-lastname',
  firstName: 'First',
  lastName: 'Last',
  fullName: 'First Last, M.D.',
  specialty: 'Internal Medicine',
  // ... other fields
}
```

### Adding a Department

Edit `src/data/departments.ts` and add a new department object.

### Updating Doctor Information

Modify the doctor object in `src/data/doctors.ts` and rebuild the site.

## Join Request Flow

The application uses a **membership application/join request** system. Doctors must submit a join request that requires admin approval before accessing the dashboard.

### Application Flow

1. **Sign Up** (`/join-us`):
   - Create account with email and password
   - Email stored in localStorage: `aip_join_email`
   - Redirects to `/join-us/application` (no auto-login)

2. **Application Form** (`/join-us/application`):
   - **Step 1**: Basic Information (name, credentials, specialty, contact info)
   - **Step 2**: Select Membership Plan (Basic, Professional, Premier)
   - **Step 3**: Payment Method (PayPal or Card - dummy selection only)
   - **Step 4**: Review & Submit
   - Draft saved to localStorage: `aip_join_request_draft`
   - On submit: Request saved to `aip_join_requests` array

3. **Confirmation** (`/join-us/submitted`):
   - Shows success message
   - Explains approval process
   - No profile created, no payment charged

### Sign In (Demo Mode)

- **Demo Credentials**: Only works for existing approved doctors in seed data
  - Email: Any doctor email from `src/data/doctors.ts`
  - Password: `AIP@12345`
- **Access Message**: "Access is available after your membership is approved"
- **Session Management**: Uses localStorage (key: `aip_doctor_session`)
  - Session includes: `{ email: string, role: "doctor", doctorId?: string, loginAt: ISO string }`
- **Protected Routes**: All `/doctor/dashboard/*` routes require authentication
- **Dashboard Guard**: Shows approval message and "Submit Join Request" CTA for non-approved users

### localStorage Keys

**Join Request Flow:**
- `aip_join_email` - Signup email address
- `aip_join_request_draft` - Current application draft (ApplicationDraft object)
- `aip_join_requests` - Array of submitted join requests (JoinRequest objects)

**Dashboard (Approved Doctors):**
- `aip_doctor_session` - Current session
- `aip_doctor_profile_<doctorId>` - Saved doctor profile edits
- `aip_doctor_requests_<doctorId>` - Appointment requests
- `aip_doctor_referrals_<doctorId>` - Referrals

### Demo Doctor Emails

The following doctor emails are configured for testing (use password `AIP@12345`):
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

**Note**: This is a demo system. Real authentication, admin approval workflow, and email notifications will be implemented in Phase 2.

## Limitations

- **No Database**: All data is stored in TypeScript files
- **No Backend**: No API routes or server-side functionality
- **No Auto-Login**: Sign up does not create profiles or auto-login
- **No Profile Creation**: Join requests are stored in localStorage, awaiting admin approval
- **No Payment Processing**: Payment method selection is dummy UI only
- **Placeholder Features**: Booking and review submission are client-only placeholders
- **Static Generation**: All pages are pre-rendered at build time
- **Dummy Authentication**: Authentication uses localStorage (no real backend)
- **No Email Notifications**: Join request submissions are stored locally only

## Deployment

See [DEPLOY_GODADDY.md](./DEPLOY_GODADDY.md) for detailed deployment instructions.

## Documentation

- [DEPLOY_GODADDY.md](./DEPLOY_GODADDY.md) - Deployment guide
- [ARCHITECTURE.md](./ARCHITECTURE.md) - Technical architecture
- [FEATURES.md](./FEATURES.md) - Feature documentation
- [CONTENT_GUIDE.md](./CONTENT_GUIDE.md) - Content management guide
- [ROADMAP.md](./ROADMAP.md) - Future features and improvements

## Development

### Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui (Radix UI)
- **Icons**: Lucide React

### Key Configuration Files

- `next.config.js` - Next.js configuration (static export)
- `tailwind.config.ts` - Tailwind CSS configuration
- `tsconfig.json` - TypeScript configuration
- `components.json` - shadcn/ui configuration

## Brand Colors

- Primary Teal: `#2EC4B6`
- Dark Blue: `#1A4B7F` / `#2C4060`
- Defined in `src/app/globals.css` as CSS variables

## Support

For questions or issues, please refer to the documentation files or contact the development team.
