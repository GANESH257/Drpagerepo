# Content Management Guide

## Brand Colors

### CSS Variables

Brand colors are defined in `src/app/globals.css`:

```css
:root {
  --brand-teal: #2EC4B6;
  --brand-dark-blue: #1A4B7F;
  --brand-dark-blue-alt: #2C4060;
}
```

### Tailwind Usage

Colors are available as Tailwind classes:
- `bg-brand-teal`
- `text-brand-dark-blue`
- `border-brand-dark-blue-alt`

Or use CSS variables:
- `bg-[var(--brand-teal)]`

### Primary Colors

- **Teal** (`#2EC4B6`): Primary CTA buttons, accents, links
- **Dark Blue** (`#1A4B7F`): Headings, primary text
- **Dark Blue Alt** (`#2C4060`): Secondary elements

## Logo Usage

### File Location

Logo file: `public/logodrp.png`

### Implementation

Used in:
- `src/components/Header.tsx` - Navigation header
- `src/components/Footer.tsx` - Footer

### Code Example

```tsx
import Image from 'next/image';

<Image
  src="/logodrp.png"
  alt="Alliance of Independent Physicians"
  width={200}
  height={60}
  className="h-12 w-auto"
/>
```

### Sizing

- Header: `h-12` (48px height, auto width)
- Footer: `h-12` (48px height, auto width)
- Adjust `width` and `height` props to maintain aspect ratio

## Updating Doctors

### Adding a New Doctor

Edit `src/data/doctors.ts`:

1. **Create doctor object** following the `Doctor` interface:

```typescript
{
  id: 'unique-id',                    // Unique identifier
  slug: 'firstname-lastname',          // URL-friendly slug
  firstName: 'First',
  lastName: 'Last',
  fullName: 'First Last, M.D.',         // Display name
  specialty: 'Internal Medicine',      // Must match department name
  credentials: 'M.D.',                // M.D., D.P.M., N.P., etc.
  bio: 'Doctor bio text...',
  image: '/doctors/doctor.jpg',        // Optional image path
  locations: [                         // Array of locations
    {
      name: 'Main Office',
      address: '123 Medical Center Dr',
      city: 'Los Angeles',
      state: 'CA',
      zip: '90001',
      phone: '(555) 123-4567',
      directionsUrl: 'https://maps.google.com',
    },
  ],
  insurance: [                         // Array of insurance objects
    { name: 'Aetna', slug: 'aetna' },
    { name: 'Blue Cross Blue Shield', slug: 'bcbs' },
  ],
  rating: 4.8,                        // 0-5 rating
  reviewCount: 127,                    // Number of reviews
  reviews: [...],                      // Array of review objects
  featured: true,                      // Show in featured section
  verified: true,                      // Show verified badge
  availability: [...],                 // Array of booking slots
  acceptsNewPatients: true,
}
```

2. **Add to doctors array**:

```typescript
export const doctors: Doctor[] = [
  // ... existing doctors
  newDoctorObject,
];
```

3. **Rebuild**: Run `npm run build` to regenerate static pages

### Updating Doctor Information

1. Find doctor in `src/data/doctors.ts`
2. Update relevant fields
3. Rebuild: `npm run build`

### Removing a Doctor

1. Remove doctor object from `doctors` array in `src/data/doctors.ts`
2. Rebuild: `npm run build`

## Updating Departments

### Adding a Department

Edit `src/data/departments.ts`:

```typescript
{
  name: 'Department Name',
  slug: 'department-slug',           // URL-friendly slug
  description: 'Department description...',
  icon: 'icon-name',                  // Optional icon identifier
}
```

### Updating Department Info

1. Find department in `departments` array
2. Update fields
3. Rebuild: `npm run build`

## Review Management

### Adding Reviews

Reviews are part of doctor objects in `src/data/doctors.ts`:

```typescript
reviews: [
  {
    id: 'review-1',
    patientName: 'Patient Name',
    rating: 4.5,                      // 0-5 rating
    comment: 'Review text...',
    date: '2024-01-15',               // ISO date string
    verified: true,                    // Verified visit badge
  },
]
```

### Review Guidelines

- Use realistic patient names (or "Patient 1", "Patient 2")
- Ratings: 0-5 (typically 3.5-5.0 for good doctors)
- Comments: Keep professional and realistic
- Dates: Use ISO format (YYYY-MM-DD)
- Verified: Set to `true` for verified visit badges

## Insurance Providers

### Adding Insurance

Insurance is part of doctor objects:

```typescript
insurance: [
  { name: 'Insurance Name', slug: 'insurance-slug' },
]
```

### Common Insurance Providers

Predefined in `src/data/doctors.ts`:
- Aetna
- Blue Cross Blue Shield
- Cigna
- UnitedHealthcare
- Medicare
- Medicaid
- Humana
- Kaiser Permanente

Add more as needed in doctor objects.

## Availability Slots

### Generating Availability

Availability slots are generated in `src/data/doctors.ts` using helper function:

```typescript
const generateAvailability = (daysAhead: number = 14): BookingSlot[] => {
  // Generates dummy availability slots
}
```

### Manual Availability

To set specific availability:

```typescript
availability: [
  {
    date: '2024-01-20',              // ISO date string
    time: '09:00',                    // 24-hour format
    available: true,
  },
]
```

## Mission Statement

The mission statement text is in `src/components/MissionStatement.tsx`.

**Do not modify** the exact text as specified in requirements. Only styling changes are allowed.

## FAQ Content

FAQ items are in `src/components/FAQ.tsx` in the `faqs` array.

To update:
1. Edit the `faqs` array
2. Rebuild: `npm run build`

## Hero Section

### Video Placeholder

The hero section in `src/components/Hero.tsx` has a TODO comment for video:

```tsx
{/* TODO: Replace with actual video file when available
    <video
      autoPlay
      loop
      muted
      playsInline
      className="absolute inset-0 w-full h-full object-cover"
      poster="/hero-poster.jpg"
    >
      <source src="/hero-video.mp4" type="video/mp4" />
    </video>
*/}
```

### Adding Video

1. Add video file to `public/hero-video.mp4`
2. Add poster image to `public/hero-poster.jpg`
3. Uncomment video code in `src/components/Hero.tsx`
4. Remove placeholder gradient div
5. Rebuild: `npm run build`

## Content Best Practices

### Doctor Bios

- Keep professional and concise (2-3 sentences)
- Highlight specialties and experience
- Avoid marketing language

### Department Descriptions

- Clear, patient-friendly language
- Explain what the specialty covers
- Keep to 1-2 sentences

### Reviews

- Mix of ratings (mostly positive, some neutral)
- Realistic comments
- Varied dates (not all same day)

## Rebuilding After Changes

After updating any content:

1. **Development**: Changes appear automatically in dev mode
2. **Production**: Run `npm run build` to regenerate static files
3. **Deploy**: Upload new `/out` folder contents to cPanel

## Medical Students Content

### Adding Resources

Resources are part of pillar objects in `src/data/medStudentPillars.ts`:

1. **Place PDF file** in appropriate directory:
   - Guides: `/public/resources/medical-students/guides/[filename].pdf`
   - Tools: `/public/resources/medical-students/tools/[filename].pdf`

2. **Add resource entry** to pillar's resources array:

```typescript
{
  id: 'resource-id',
  title: 'Resource Title',
  description: 'Brief description of the resource',
  type: 'download', // or 'external' for external URLs
  url: '/resources/medical-students/guides/filename.pdf',
  fileSize: '2.5 MB', // Optional
}
```

3. **Rebuild**: Run `npm run build` to regenerate static pages

### Adding Articles

Articles are in `src/data/medStudentArticles.ts`:

1. **Create article object**:

```typescript
{
  id: 'unique-id',
  slug: 'article-url-slug',
  title: 'Article Title',
  excerpt: 'Short excerpt for card display',
  content: '<h2>Full HTML content</h2><p>Article body...</p>',
  authorName: 'Dr. Author Name',
  authorSpecialty: 'Specialty Name',
  authorId: 'doctor-slug', // Optional: link to doctor profile
  category: 'study-exams', // or 'wellness', 'research', 'residency', 'finance'
  readingTime: 8, // minutes
  publishDate: '2024-01-15', // ISO date
  featured: false, // Optional: highlight article
}
```

2. **Add to articles array**
3. **Rebuild**: Run `npm run build` to generate static article page

### Adding News

Fallback news items are in `src/data/medStudentNews.ts`:

```typescript
{
  id: 'news-id',
  headline: 'News Headline',
  date: '2024-01-20', // ISO date
  source: 'Source Name',
  url: 'https://external-url.com', // External link
}
```

**RSS Feed Configuration**:
- Set `NEXT_PUBLIC_MED_STUDENT_RSS_URL` environment variable
- Or update `RSS_FEED_URL` constant in `src/components/NewsSection.tsx`
- Component falls back to local data if RSS fetch fails

### Updating Pillars

Edit `src/data/medStudentPillars.ts`:

1. **Modify pillar description** (2-3 sentences)
2. **Add/remove resources** from resources array
3. **Update icon** (must match Lucide icon name)
4. **Rebuild**: Run `npm run build`

### Placeholder PDFs

Placeholder PDF files are in:
- `/public/resources/medical-students/tools/`
- `/public/resources/medical-students/guides/`

**TODO**: Replace all placeholder files with actual PDF content before production deployment.

See `/public/resources/medical-students/README.md` for complete list of required files.

## Public Health Content

### Adding Articles

Articles are in `src/data/publicHealthArticles.ts`:

1. **Create article object**:

```typescript
{
  id: 'unique-id',
  slug: 'article-url-slug',
  title: 'Article Title',
  author: 'Dr. Author Name',
  authorId: 'doctor-slug', // Optional: link to doctor profile
  topics: ['covid-19', 'infectious-diseases'], // Array of topic slugs
  excerpt: 'Short excerpt for card display',
  content: '<h2>Full HTML content</h2><p>Article body...</p>',
  readingTime: 8, // minutes
  publishDate: '2024-01-15', // ISO date
  doctorWritten: true, // true if written by a doctor
}
```

2. **Add to articles array**
3. **Rebuild**: Run `npm run build` to generate static article page

**Available Topics**:
- bird-flu, covid-19, influenza, mental-health, heart-disease, diabetes, cancer, hypertension, obesity, asthma, arthritis, alzheimers, parkinsons, stroke, copd, kidney-disease, liver-disease, osteoporosis, depression, anxiety, substance-abuse, infectious-diseases, autoimmune, nutrition

### Adding News

Fallback news items are in `src/data/publicHealthNews.ts`:

```typescript
{
  headline: 'News Headline',
  date: '2024-01-20', // ISO date
  source: 'Source Name',
  url: 'https://external-url.com', // External link
  excerpt: 'Optional excerpt text', // Optional
}
```

**RSS Feed Configuration**:
- Set `NEXT_PUBLIC_PUBLIC_HEALTH_RSS_URL` environment variable
- Or update `RSS_FEED_URL` constant in `src/components/LatestNewsSection.tsx`
- Component falls back to local data if RSS fetch fails

### Adding Prevention Topics

Prevention topics are in `src/data/preventionWellness.ts`:

```typescript
{
  id: 'topic-id',
  slug: 'topic-slug',
  title: 'Topic Title',
  description: '2-3 sentence description',
  resources: [
    {
      title: 'Resource Title',
      url: '/public-health/articles/slug', // or external URL
      type: 'internal', // or 'external'
    },
  ],
}
```

### Adding Insurance Resources

Insurance resources are in `src/data/insuranceResources.ts`:

```typescript
{
  title: 'Resource Title',
  description: 'Brief description',
  url: '/public-health/articles/slug', // or external URL
  type: 'internal', // or 'external'
}
```

### Adding Doctor Publications

Publications are in `src/data/doctorPublications.ts`:

```typescript
{
  title: 'Publication Title',
  authorName: 'Dr. Author Name',
  authorId: 'doctor-slug', // Optional: link to doctor profile
  year: 2023,
  venue: 'Journal Name',
  url: 'https://external-publication-url.com', // External link
}
```

### Updating Disease Topics

Disease topics are defined in `src/data/publicHealthArticles.ts` as `DISEASE_TOPICS` array.

To add a new topic:
1. Add topic slug to `DISEASE_TOPICS` array
2. Add topic label to `topicLabels` object in components
3. Create articles with the new topic tag
4. Rebuild: Run `npm run build`

## Trustee Board Content

### Updating Board Members

Board members are in `src/data/trusteeBoardMembers.ts`:

1. **Edit member information**:
```typescript
{
  id: 'unique-id',
  name: 'Dr. Full Name',
  role: 'Chair', // or 'Vice Chair', 'Treasurer', 'Secretary', 'Trustee'
  photo: '/board/member-photo.jpg', // TODO: Replace placeholder.jpg
  bio: '2-4 line professional biography...',
  specialty: 'Internal Medicine', // Optional
  location: 'City, State', // Optional
  term: '2022-2025', // Optional
  email: 'email@aip.com', // Optional
}
```

2. **Add/remove members** from `trusteeBoardMembers` array
3. **Rebuild**: Run `npm run build`

**Board Member Photos**:
- Place photos in `/public/board/` directory
- Use descriptive filenames (e.g., `sarah-johnson.jpg`)
- Update `photo` field in member object
- TODO comments in code indicate placeholder images

### Updating Meeting Information

Meetings are in `src/data/boardMeetings.ts`:

1. **Update next meeting**:
```typescript
{
  id: 'next',
  date: '2026-02-15', // ISO date string
  time: '2:00 PM',
  timezone: 'PST', // or 'EST', 'CST', etc.
  location: 'Virtual Meeting', // or physical address
  isVirtual: true,
  meetingLink: 'https://zoom.us/...', // Optional: virtual meeting link
  agendaHighlights: [
    'Agenda item 1',
    'Agenda item 2',
    // ... 3-6 items
  ],
  icsFile: '/ics/next-board-meeting.ics',
}
```

2. **Update ICS calendar file**:
   - Edit `/public/ics/next-board-meeting.ics`
   - Update date, time, and description fields
   - Follow iCalendar format standards

3. **Add upcoming meetings** to `upcomingMeetings` array

4. **Rebuild**: Run `npm run build`

### Adding Announcements

Announcements are in `src/data/trusteeAnnouncements.ts`:

1. **Create announcement object**:
```typescript
{
  id: 'unique-id',
  slug: 'announcement-url-slug',
  title: 'Announcement Title',
  date: '2026-01-20', // ISO date string
  category: 'Announcement', // or 'Notice', 'Update', 'Policy'
  excerpt: 'Short excerpt for card display',
  content: '<h2>Full HTML content</h2><p>Announcement body...</p>', // Optional: for detail page
  url: '/trustee-board/announcements/slug', // Internal or external URL
  source: 'Board of Trustees', // Optional
}
```

2. **Add to announcements array**
3. **Rebuild**: Run `npm run build` to generate static detail page

**RSS Feed Configuration**:
- Set `NEXT_PUBLIC_TRUSTEE_ANNOUNCEMENTS_RSS` environment variable
- Component falls back to local data if RSS fetch fails
- TODO: Implement RSS parsing library if needed

### Updating Policies

Policies are in `src/data/trusteePolicies.ts`:

1. **Edit policy information**:
```typescript
{
  id: 'unique-id',
  title: 'Policy Title',
  description: 'Brief description of the policy',
  category: 'Governance', // or 'Compliance', 'Operations'
  filePath: '/policies/policy-name.pdf',
  fileSize: '245 KB', // Optional
}
```

2. **Add/remove policies** from `trusteePolicies` array
3. **Place PDF files** in `/public/policies/` directory
4. **Rebuild**: Run `npm run build`

**Policy PDFs**:
- Place PDF files in `/public/policies/` directory
- Use descriptive filenames (e.g., `code-of-conduct.pdf`)
- Update `filePath` field in policy object
- TODO comments in code indicate placeholder PDFs

### Calendar Files (ICS)

ICS files are in `/public/ics/`:

1. **Update meeting ICS file**:
   - Edit `/public/ics/next-board-meeting.ics`
   - Update `DTSTART`, `DTEND`, `SUMMARY`, `DESCRIPTION` fields
   - Follow iCalendar format (RFC 5545)

2. **ICS File Format**:
```ics
BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
DTSTART:20260215T220000Z
DTEND:20260215T230000Z
SUMMARY:Board of Trustees Meeting
DESCRIPTION:Meeting description...
LOCATION:Virtual Meeting
END:VEVENT
END:VCALENDAR
```

3. **Rebuild**: Not required for ICS files (served as static assets)

## Updating Membership Content

### Updating Membership Benefits

Edit `src/data/membershipBenefits.ts`:

```typescript
{
  id: 'unique-id',
  title: 'Benefit Title',
  description: 'Benefit description...',
  icon: 'IconName', // Lucide icon name (e.g., 'Users', 'Eye', 'Calendar')
}
```

**Available Icons**: Use any icon name from [Lucide React](https://lucide.dev/icons). Common icons: `Users`, `Eye`, `User`, `Calendar`, `Star`, `FileText`, `HelpCircle`, `GraduationCap`.

### Updating Membership Plans

Edit `src/data/membershipPlans.ts`:

```typescript
{
  id: 'plan-id',
  name: 'Plan Name',
  badge: 'Most Popular', // Optional badge
  pricing: {
    monthly: 99, // Number or 'Contact us' string
    annual: 990,
  },
  description: 'Optional plan description',
  features: [
    'Feature 1',
    'Feature 2',
    // ...
  ],
  ctaLabel: 'Choose Plan',
  ctaHref: '/join-us',
}
```

**Pricing**: Use numbers for actual prices, or `'Contact us'` string for custom pricing.

### Updating Membership Policies

Edit `src/data/membershipPolicies.ts`:

```typescript
{
  category: 'Category Name',
  items: [
    {
      id: 'unique-id',
      title: 'Policy Title',
      body: 'Policy description text...',
    },
  ],
}
```

**Categories**: Eligibility & Verification, Renewals & Billing, Profile & Directory Guidelines, Conduct & Community Standards, Data & Privacy, Cancellations/Termination.

### Updating Membership FAQ

Edit `src/data/membershipFAQ.ts`:

```typescript
{
  question: 'FAQ question?',
  answer: 'FAQ answer text...',
}
```

### Adding Membership Policy PDF

1. **Place PDF file** in `/public/policies/` directory
2. **Filename**: `membership-policy.pdf` (or update path in `PoliciesSection.tsx`)
3. **Update link**: The download link in `PoliciesSection.tsx` points to `/policies/membership-policy.pdf`
4. **Rebuild**: Not required for PDF files (served as static assets)

**Note**: Currently, the PDF link is a placeholder. Replace the PDF file when the actual policy document is ready.

## Updating Homepage Content

### Updating Homepage Stats

Edit `src/data/homeStats.ts`:

```typescript
{
  value: '102+',
  label: 'Physicians',
}
```

Update the stats shown in the hero section stats strip.

### Updating Member Benefits (Homepage)

Edit `src/data/memberBenefits.ts`:

```typescript
{
  id: 'unique-id',
  title: 'Benefit Title',
  description: 'Benefit description...',
  icon: 'IconName', // Lucide icon name
}
```

**Note**: This is separate from `membershipBenefits.ts` (used on `/membership` page). Homepage benefits focus on association value.

### Adding/Editing Community Comments

Edit `src/data/communityComments.ts`:

```typescript
{
  id: 'unique-id',
  author: 'Name',
  role: 'patient' | 'physician',
  comment: 'Comment text...',
  rating?: 5, // For patient reviews
  doctorName?: 'Dr. Name', // For patient reviews
  doctorSpecialty?: 'Specialty', // For patient reviews
  specialty?: 'Specialty', // For physician comments
  date?: '2024-01-15',
}
```

Mix patient reviews and physician member comments. Patient reviews can include ratings and doctor info. Physician comments focus on network benefits.

### Managing Global Medical Events

Edit `src/data/globalMedicalEvents.ts`:

```typescript
{
  id: 'unique-id',
  title: 'Event Title',
  date: '2026-03-15', // ISO date string
  location: 'City, State' or 'Online',
  isOnline: boolean,
  description: 'Event description...',
  url?: '#', // Optional link
}
```

Add upcoming medical conferences, webinars, and continuing education events.

### Updating Homepage FAQ

Edit `src/data/homeFAQ.ts`:

```typescript
{
  question: 'FAQ question?',
  answer: 'FAQ answer text...',
}
```

Questions should cover both patient and physician needs (dual-audience).

### Editing News/Article Previews

The homepage pulls from existing public-health data files:
- News previews: `src/data/publicHealthNews.ts` (shows latest 6 items)
- Article previews: `src/data/publicHealthArticles.ts` (shows latest 6 items, sorted by publish date)

To update what appears on homepage, edit these files. The homepage components automatically show the latest items.

## Content Workflow

1. Edit data files (`doctors.ts`, `departments.ts`, `medStudentPillars.ts`, `medStudentArticles.ts`, `trusteeBoardMembers.ts`, `boardMeetings.ts`, `trusteeAnnouncements.ts`, `trusteePolicies.ts`, `membershipBenefits.ts`, `membershipPlans.ts`, `membershipPolicies.ts`, `membershipFAQ.ts`, `homeStats.ts`, `memberBenefits.ts`, `communityComments.ts`, `globalMedicalEvents.ts`, `homeFAQ.ts`)
2. Test locally: `npm run dev`
3. Build: `npm run build`
4. Verify: Check `/out` folder
5. Deploy: Upload to cPanel
