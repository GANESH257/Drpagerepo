# Features Documentation

## Homepage Features (Dual-Audience: Physician Network & Patient Directory)

The homepage serves both doctors and patients with unified copy that naturally fits both audiences. No separate "For Doctors" vs "For Patients" sections—each section applies to both.

### Hero Section

- **Dual-audience headline**: "Connect, Refer, Find Care, Collaborate"
- **Video-style background**: Video background with gradient overlay
- **Primary CTAs**: 
  - "Find a Doctor" (primary) → `/doctors`
  - "Join the Network" (secondary) → `/join-us`
  - "Explore Departments" (tertiary) → `#departments`
- **Quick-link pills**: Browse Departments, Public Health Updates, Member Benefits, How It Works
- **Stats strip**: Professional metrics (102+ Physicians, 15+ Departments, Verified Network)
- **Scroll shrink/shadow**: Header shrinks and adds shadow on scroll

### Mission Statement

- Displays exact mission statement text verbatim (no wording changes)
- Enhanced typography and spacing
- Scroll animations

### What We Do Section

Interactive 6-card carousel with dual-audience descriptions:
1. Find the Right Specialist Fast - dual-purpose copy
2. Filter by Insurance - coordination-focused
3. Verified Physician Profiles - credential-focused
4. Real Reviews & Feedback - patient + reputation signals
5. Requests & Referrals - coordination-focused
6. Multi-Location Access - dual-purpose
- Auto-play carousel with pause on interaction
- stlvascular-like hover effects and card emphasis

### Departments Section

- Modern card grid with subtle motion
- All departments with "View Doctors" CTAs
- Each card links to `/doctors?specialty=[slug]`
- "View All Doctors" CTA button
- Animated stacked images on right side

### Member Benefits Section (NEW)

- Association-style layout (AMA-inspired)
- Grid of 8 benefit cards with icons
- Benefits: Referral Network, Patient Visibility, Profile Management, Appointment Requests, Reputation & Reviews, Community Connection, Research Visibility, Continuing Education
- CTAs: "Join Us" → `/join-us`, "View Membership Plans" → `/membership`
- Anchor: `#member-benefits`

### How It Works Section

Step-by-step guide (dual-audience):
1. Choose a Department/Specialty
2. Filter by Insurance (if applicable)
3. Enter Location
4. Compare Profiles (credentials, locations, availability, focus areas)
5. **Connect & Coordinate** - generic for both audiences
6. **Follow Through Confidently** - generic for both
- Staggered card layout
- **Helpful Tips Panel**:
  - New Patient vs Returning Patient
  - Telehealth Availability
  - When to Call 911 vs Schedule Visit
  - **For Physicians: Network Coordination** (new, generic tip)

### Latest Public Health News Section (NEW)

- Shows 6 latest news items from public-health data
- Card-based preview layout
- Date badges, source labels
- "View more" link → `/public-health#latest-news`
- Anchor: `#latest-news`

### Latest Articles & Insights Section (NEW)

- Shows 6 latest articles from public-health data
- Title, author, topic badges, excerpt, reading time
- "View more" link → `/public-health/articles`

### Featured Doctors Section

- Premium layout with enhanced badges
- Displays 6 featured doctors
- Shows rating, review count
- **Verified** and **Accepting New Patients** badges prominently displayed
- Links to individual profiles
- Enhanced hover effects

### Community Comments Section (UPDATED)

- Title: "What Our Community Is Saying"
- Mixes patient feedback + physician member comments
- Badge system: "Patient" / "Physician Member" tags
- Consistent card design
- Star ratings for patient reviews
- Professional tone for physician comments

### Global Medical Events Section (NEW)

- Shows 8 upcoming medical events/conferences
- Card grid layout
- Each card: title, date, location/online badge, description, "Learn more" link
- Anchor: `#events`

### FAQ Section

Dual-audience FAQ with 6 questions:
1. How do I find a doctor?
2. How do referrals work?
3. How do booking and connection requests work?
4. Are physician profiles verified?
5. How do members update their profile?
6. What is your privacy policy?

## Directory Page Features

### Filters

**Desktop**: Sticky sidebar with all filters
**Mobile**: Sheet/Drawer component

**Filter Options**:
- **Specialty**: Dropdown of all departments
- **Location**: Text input (ZIP/city/state) + state dropdown
- **Insurance**: Dropdown of all insurance providers
- **Provider Name**: Text input for name search
- **Last Name Prefix**: A-Z button strip
- **Availability**: Dropdown (this week, next week, this month)
- **Sort**: Dropdown (rating, reviews, name A-Z/Z-A)

**URL Sync**: All filters sync to URL query parameters for sharing/bookmarking

### Doctor Cards

Each card displays:
- Doctor name and specialty
- Verified badge (if applicable)
- Star rating and review count
- Location (city, state)
- Earliest available appointment date
- Accepted insurance (first 2 + count)
- "View Profile" button

### Results Display

- Grid layout (responsive: 1 col mobile, 2 tablet, 3 desktop)
- Shows count of filtered results
- Empty state message when no results

## Profile Page Features

### Header Section

- Doctor name with verified badge
- Specialty
- Star rating and review count
- "Request Appointment" CTA button

### Main Content

**About Section**:
- Doctor bio/description

**Locations**:
- List of all practice locations
- Address, phone, directions link

**Accepted Insurance**:
- Badge list of all accepted insurance plans

**Patient Reviews**:
- List of reviews (first 5)
- Star ratings, verified badges
- Patient names and dates
- "Leave a Review" button

### Sidebar

**Available Appointments**:
- List of available time slots (first 10)
- Click to open booking modal
- "View All Times" button

**Quick Info**:
- Credentials
- Accepts new patients status

### Related Doctors

- Shows up to 3 other doctors in same specialty
- Uses `DoctorCard` component
- Only shows verified doctors

### Modals

**Booking Modal**:
- Date and time selection
- Patient information form (name, email, phone)
- Reason for visit (optional)
- Placeholder submission (alert)

**Review Modal**:
- Star rating selector
- Patient name (optional)
- Review text
- Placeholder submission (alert)

## Technical Features

### Static Export

- All pages pre-rendered at build time
- No server required
- Works on any static hosting

### Responsive Design

- Mobile-first approach
- Breakpoints: mobile, tablet, desktop
- Mobile menu in header
- Filters in sheet on mobile

### URL Query Parameters

- Filters persist in URL
- Shareable/bookmarkable filtered views
- Browser back/forward navigation works

### Type Safety

- Full TypeScript coverage
- Type-safe data structures
- Compile-time error checking

### Accessibility

- Semantic HTML
- ARIA labels where needed
- Keyboard navigation support
- Screen reader friendly

## Placeholder Features

These features are implemented but don't persist data:

### Booking Requests

- Form collects appointment request data
- Shows success alert
- No backend submission
- No email notifications

### Review Submission

- Form collects review data
- Shows success alert
- No backend submission
- No moderation or publishing

### Telehealth Availability

- Mentioned in "How It Works" section
- Not actually checked or displayed per doctor

## Medical Students Page

### Route
`/medical-students`

### Hero Section
- Gradient background with brand colors
- Headline: "Your Journey to Becoming a Physician"
- Subheadline explaining value proposition
- Three CTA buttons with smooth scroll:
  - "Explore Resources" → scrolls to Main Tracks
  - "Quick Tools" → scrolls to Quick Tools
  - "Helpful Articles" → scrolls to Articles

### How to Use Section
- 5-step onboarding guide
- Horizontal card layout
- Icons for each step
- Accessible ordered list structure

### Main Tracks / Pillars
Six primary pillars displayed in responsive grid:
1. Prep for Med School
2. USMLE® Step 1 & 2
3. USMLE® Step 3
4. Med Student Finance
5. Publishing Research
6. Transition to Residency

**Each Pillar Includes**:
- Title and description (2-3 sentences)
- Icon representation
- Resources & Guides section:
  - First 3 resources displayed as cards
  - Additional resources in accordion ("View more resources")
  - Each resource has download or external link button

### Quick Tools Section
- 6 downloadable PDF tools:
  - Medical School Study Planner
  - USMLE Study Timeline Template
  - Medical CV / Resume Checklist
  - Research Publication Checklist
  - Residency Application Checklist
  - Interview Preparation Guide
- Compact card layout (3 columns desktop, 1 mobile)
- Each tool shows icon, title, description, and download button

### Articles Section
- Filterable article grid using Tabs component
- Categories: All, Study & Exams, Wellness, Research, Residency, Finance
- Each article card shows:
  - Title (links to detail page)
  - Author name and specialty
  - Reading time and publish date
  - Excerpt (2-3 lines)
- Responsive grid: 1 col mobile, 2 tablet, 3 desktop

### Article Detail Pages
- Route: `/medical-students/articles/[slug]`
- Full article content with HTML rendering
- Author information with optional link to doctor profile
- Back link to articles section
- Category badge
- Reading time and publish date
- Static generation via `generateStaticParams`

### Latest News Section
- Client-side RSS feed fetch with fallback
- Displays 5-8 news items
- Each item shows:
  - Headline (external link)
  - Date and source badge
  - Opens in new tab with proper rel attributes
- Graceful error handling with fallback to local data

### Static Export Compatibility
- All components work with static export
- No server-side runtime required
- PDFs stored in `/public/resources/medical-students/`
- RSS fetch uses client-side useEffect with CORS handling

## Public Health Page

### Route
`/public-health`

### Hero Section
- Gradient background with brand colors
- H1: "Public Health"
- 2-3 sentence description explaining the page purpose
- Three CTA buttons with smooth scroll:
  - "Browse Topics" → scrolls to #disease-topics
  - "Latest News" → scrolls to #latest-news
  - "Prevention & Wellness" → scrolls to #prevention

### Latest Medical News Section
- Client-side RSS feed fetch with fallback to local data
- Displays 6-10 news items
- Each item shows:
  - Headline (external link)
  - Date and source badge
  - Optional excerpt
  - Opens in new tab with proper rel attributes
- Loading skeleton state
- Error handling with fallback indicator
- "View more news" external link

### Disease Topics Hub
- Filterable article directory with 25 disease topics
- Topics include: Bird Flu, COVID-19, Influenza, Mental Health, Heart Disease, Diabetes, Cancer, and more
- Tabs/pills filter interface (scrollable on mobile)
- Default shows "All" topics
- Article grid displays 9-12 articles per page with pagination
- Each article card shows:
  - Title (links to detail page)
  - Author name with "Doctor-written" badge if applicable
  - Topic chips/badges
  - Reading time and publish date
  - Short excerpt
  - "Read article" CTA button

### Article Detail Pages
- Route: `/public-health/articles/[slug]`
- Full article content with HTML rendering
- Table of contents (generated from H2 headings)
- Key takeaways callout box
- "When to seek care" safety disclaimer
- Related articles (same topic, different article)
- Back link to public health page
- Static generation via `generateStaticParams`

### Prevention & Wellness Hub
- Header with explanation of prevention importance
- Two paragraphs (second in accordion)
- Expandable "Show more / Show less" area
- Explore Topics grid with 8 topics:
  - Preventive Care
  - Nutrition & Diet
  - Sleep
  - Exercise
  - Vaccines, Vaccinations & Immunizations
  - Type 2 Diabetes Prevention
  - Hypertension Control
  - Improving Public Health
- Each topic card shows:
  - Title and description
  - 2-3 resource links (internal or external)
  - Link to filtered view

### Insurance Information Section
- Public-facing insurance guidance (not medical advice)
- Explanation of coverage basics (in-network, referrals, prior authorizations, etc.)
- 2-column layout on desktop:
  - Left: Quick insurance checklist (bulleted list)
  - Right: Resources (links)
- Common plan types explanation (HMO/PPO/EPO)
- Disclaimer: "Coverage varies by plan. Confirm with your insurer."
- Link to Find a Doctor directory

### Latest Publications by Doctors
- Grid/list of 6-10 publication cards
- Each card shows:
  - Title (external link)
  - Doctor name
  - Year and venue/journal
  - External link to publication
- "View all publications" message

### Static Export Compatibility
- All components work with static export
- No server-side runtime required
- RSS fetch uses client-side useEffect with CORS handling
- All articles statically generated via `generateStaticParams`
- Article filtering uses URL query parameters (SEO-friendly)

## Join Us Page

### Route
`/join-us`

### Overview
Premium doctor onboarding page with sign-in and sign-up functionality. Features a modern split-screen design with benefits panel on the left and authentication forms on the right.

### Layout
- **Desktop**: Two-column split layout (45% benefits, 55% auth card)
- **Mobile**: Stacked layout with benefits panel above auth form
- **Background**: Gradient using brand colors (teal and dark blue)

### Left Panel - Doctor Benefits
- Brand logo (`logodrp.png`)
- Headline: "Join the Alliance of Independent Physicians"
- Supporting copy for physicians
- Six benefits with icons:
  1. Get referrals from a trusted physician network
  2. Increase visibility to patients searching by specialty and location
  3. Manage your profile, locations, and accepted insurance (Phase 2)
  4. Receive appointment requests online (Phase 2)
  5. Build credibility with verified reviews (Phase 3)
  6. Connect with the physician community
- "How it works for Doctors" mini-steps (3 steps)

### Right Panel - Authentication Card
- Premium card with tabs: "Sign In" and "Create Account"
- Google Sign-In button (placeholder - shows dialog)
- Email/password forms with validation
- Password visibility toggle
- "Remember me" checkbox (UI only)
- "Forgot password?" link (shows placeholder dialog)

### Sign In Form
- Email and password fields
- Inline validation (email format, required fields)
- **Dummy Credentials**:
  - Email: `doctor@aip.com`
  - Password: `AIP@12345`
- On success: Stores session in localStorage and redirects to `/doctor/dashboard`
- On failure: Shows error message

### Sign Up Form
- Email, password, and confirm password fields
- Validation:
  - Email format
  - Password minimum 8 characters
  - Password match confirmation
- Terms and conditions checkbox (required)
- On success: Auto-logs in and redirects to dashboard

### Google Sign-In
- Styled button with Google logo
- Clicking shows dialog: "Google sign-in will be enabled in Phase 2"
- Placeholder functionality only

### Static Export Compatibility
- All authentication logic is client-side
- Uses localStorage for session persistence
- No API routes or server components
- Fully compatible with static export

## Doctor Dashboard

### Routes
- `/doctor/dashboard` - Overview page with stats and quick actions
- `/doctor/dashboard/profile` - Edit profile section
- `/doctor/dashboard/locations` - Manage practice locations
- `/doctor/dashboard/insurance` - Manage insurance and services
- `/doctor/dashboard/appointments` - View and manage appointment requests
- `/doctor/dashboard/referrals` - Track referrals from network physicians

### Overview
Full-featured doctor admin dashboard with collapsible sidebar navigation, multiple editable sections, and client-side data persistence. Designed with a premium SaaS aesthetic and fully responsive layout.

### Authentication Protection
- Client-side route protection via layout component
- Checks localStorage for `aip_doctor_session` on mount
- Maps email to doctor record from `src/data/doctors.ts`
- Redirects to `/join-us` if not authenticated or doctor not found
- Shows loading state while checking authentication
- Updates session with `doctorId` after successful lookup

### Layout & Navigation

**Desktop Layout**:
- Fixed collapsible sidebar on left (256px expanded, 64px collapsed)
- Main content area with header
- Smooth transitions for sidebar collapse/expand

**Mobile Layout**:
- Hamburger menu button in header
- Sheet/Drawer component for sidebar navigation
- Full-width content area

**Sidebar Navigation**:
- Overview (dashboard home)
- Edit Profile
- Manage Locations
- Insurance & Services
- Appointment Requests
- Referrals
- Each nav item shows icon, label, and description
- Active state highlighting based on current route

**Header**:
- "Doctor Dashboard" title
- Doctor name and verified badge (desktop)
- Logout button
- Mobile hamburger menu button

### Overview Section (`/doctor/dashboard`)

**Stats Cards**:
- Profile Completion % (calculated from filled fields)
- New Appointment Requests count
- Referrals This Month count
- Verification Status badge

**Quick Actions**:
- Grid of action buttons linking to each dashboard section
- Each button shows icon, label, and description

### Edit Profile Section (`/doctor/dashboard/profile`)

**Form Sections** (Accordion layout):

1. **Basic Information**:
   - First Name, Last Name
   - Full Name (required, auto-updates from first/last)
   - Credentials dropdown (M.D., D.O., D.P.M., etc.)
   - Primary Specialty (required, dropdown)
   - Additional Specialties (tag input)

2. **Biography**:
   - Short Bio (required, textarea)
   - Detailed About (optional, long textarea)

3. **Professional Credentials**:
   - Medical School (text input)
   - Internship (text input)
   - Residency (text input)
   - Board Certifications (editable list with suggestions)
   - Hospital Privileges (editable list)
   - States Licensed In (tag input with US state codes)

4. **Status & Settings**:
   - Accepts New Patients (toggle switch)
   - Verified Status (read-only display)
   - Featured Profile (toggle switch)

**Features**:
- Inline validation for required fields
- Save/Reset buttons
- Success message on save
- Helper panel with tips (desktop right sidebar, collapsible on mobile)
- All changes persist to localStorage (`aip_doctor_profile_<doctorId>`)

### Manage Locations Section (`/doctor/dashboard/locations`)

**Features**:
- Grid display of location cards
- Each card shows: name, address, city/state/zip, phone, directions link
- "Primary" badge for first location
- Edit and Delete buttons for each location
- "Set as Primary" option for non-primary locations

**Add/Edit Location Dialog**:
- Form fields: name, address, city, state, zip, phone, directions URL
- Required field validation
- Save/Cancel buttons

**Delete Confirmation**:
- AlertDialog for delete confirmation
- Prevents accidental deletion

### Insurance & Services Section (`/doctor/dashboard/insurance`)

**Two-Column Layout**:

1. **Accepted Insurance**:
   - Display current insurance as removable chips
   - Add insurance via searchable dropdown or custom input
   - Helper text: "Only list plans you accept"
   - Common providers pre-populated in dropdown

2. **Conditions & Services**:
   - Tag input for conditions and services
   - Suggestions dropdown for common items
   - Add/remove tags dynamically

### Appointment Requests Section (`/doctor/dashboard/appointments`)

**Features**:
- Table display of appointment requests
- Columns: Patient Name, Requested Date/Time, Reason, Insurance, Status, Actions
- Status badges: New (blue), Confirmed (green), Completed (gray), Declined (red)

**Filtering**:
- Tabs for filtering by status: All, New, Confirmed, Completed, Declined
- Count badges on each tab

**Actions**:
- Approve (New → Confirmed)
- Decline (with optional note, New → Declined)
- Mark Completed (Confirmed → Completed)
- Message patient (placeholder button)

**Sample Data**:
- "Generate Sample Requests" button for demo
- Creates 8 sample requests with various statuses
- All data persists to localStorage (`aip_doctor_requests_<doctorId>`)

### Referrals Section (`/doctor/dashboard/referrals`)

**Network Insights Cards**:
- New Referrals count
- In Progress count
- Closed This Month count

**Features**:
- Table display of referrals
- Columns: Referring Physician, Specialty, Date, Patient Initials, Reason, Status, Actions
- Status badges: New (blue), In Progress (yellow), Closed (gray)

**Filtering**:
- Tabs for filtering by status: All, New, In Progress, Closed
- Count badges on each tab

**Actions**:
- Mark In Progress (New → In Progress)
- Close Referral (In Progress/New → Closed)

**Sample Data**:
- "Generate Sample Referrals" button for demo
- Creates 6 sample referrals with various statuses
- All data persists to localStorage (`aip_doctor_referrals_<doctorId>`)

### Data Persistence

**localStorage Keys**:
- `aip_doctor_session` - Current session (email, role, doctorId, loginAt)
- `aip_doctor_profile_<doctorId>` - Saved doctor profile edits
- `aip_doctor_requests_<doctorId>` - Appointment requests
- `aip_doctor_referrals_<doctorId>` - Referrals

**Load Strategy**:
- Profile: Check localStorage first, fallback to seed data from `src/data/doctors.ts`
- Requests/Referrals: Always load from localStorage (empty array if none)

**Save Strategy**:
- Profile edits: Merge changes into full Doctor object, save to localStorage
- Requests/Referrals: Save entire array to localStorage

### Session Management
- Session stored in localStorage with key `aip_doctor_session`
- Session object: `{ email: string, role: "doctor", doctorId?: string, loginAt: ISO string }`
- Session persists across page refreshes
- Logout clears session and redirects to `/join-us`
- Email-to-doctor mapping via `findDoctorByEmail()` function

## Trustee Board Page

### Route
`/trustee-board`

### Overview
Professional Trustee Board page showcasing board members, meeting information, announcements, and governance policies. Features a modern, premium design with excellent accessibility and SEO.

### Hero Section
- H1: "Trustee Board"
- Description: "Meet our Board of Trustees and stay informed on key announcements, policies, and upcoming meetings."
- Three CTA buttons with smooth scroll:
  - "View Board Members" → scrolls to #board
  - "Latest Announcements" → scrolls to #announcements
  - "Next Meeting" → scrolls to #meeting
- Gradient background using brand colors

### Board Members Section (#board)
- Grid display of 10 board members
- Responsive layout: 1 col mobile, 2 tablet, 3-4 desktop
- Each member card shows:
  - Photo (placeholder image)
  - Name and role badge
  - Short bio (2-4 lines)
  - Specialty, location, term (if available)
  - Email contact link (if available)
- Clicking a card opens modal with full bio
- Proper alt text for images: "{name} - {role}"

### Next Scheduled Meeting Section (#meeting)
- Prominent card displaying next meeting:
  - Date (formatted: "Month Day, Year")
  - Time with timezone
  - Location or "Virtual Meeting" with link
  - Agenda highlights (bulleted list)
- Action buttons:
  - "Add to Calendar" (downloads ICS file)
  - "View Agenda" (PDF download placeholder)
- Meeting cadence information

### Latest Announcements Section (#announcements)
- Client-side RSS/JSON fetch with fallback
- Environment variable: `NEXT_PUBLIC_TRUSTEE_ANNOUNCEMENTS_RSS`
- Displays 6-10 announcements
- Each announcement shows:
  - Title
  - Date
  - Category badge (Announcement/Notice/Update/Policy)
  - Excerpt
  - Link to detail page or external URL
- Loading skeleton state
- Error handling with fallback indicator

### Announcement Detail Pages
- Route: `/trustee-board/announcements/[slug]`
- Statically generated via `generateStaticParams`
- Displays full announcement content
- Back link to main trustee board page
- Proper SEO metadata

### Policies Section (#policies)
- "Policies & Governance" section
- Intro paragraph explaining governance
- Policies grouped by category in Accordion:
  - Governance (Code of Conduct, Conflict of Interest, Bylaws)
  - Compliance (Privacy & Data Handling, Patient Safety)
  - Operations (Meeting Minutes Policy)
- Each policy card shows:
  - Title and description
  - Category badge
  - File size (if available)
  - "Download PDF" button
- 6+ policy documents total

### Governance Metrics (Optional)
- Horizontal metrics strip showing:
  - Board Members count
  - Policies Published count
  - Next Meeting date
- Clean card layout with icons

### Static Export Compatibility
- All data in TypeScript files
- Client-side RSS fetch with fallback
- Static generation for announcement detail pages
- No API routes or server actions
- PDF and ICS files served from `/public`

## Future Feature Ideas

See [ROADMAP.md](./ROADMAP.md) for planned enhancements:
- Real booking integration
- Review moderation system
- User accounts
- Email notifications
- Admin portal
- Payment processing
- Real OAuth integration (Google Sign-In)
- Profile verification system
- Password reset functionality