# Architecture Documentation

## Overview

This is a Next.js 14 application using the App Router, configured for static export. All pages are pre-rendered at build time, and there is no server-side runtime.

## Component Structure

### Layout Components

- **Header** (`src/components/Header.tsx`): Sticky navigation header with logo and menu
- **Footer** (`src/components/Footer.tsx`): Site footer with links and contact info

### Landing Page Sections

- **Hero** (`src/components/Hero.tsx`): Video-style hero with CTAs and specialty pills
- **MissionStatement** (`src/components/MissionStatement.tsx`): Mission statement text
- **Advantages** (`src/components/Advantages.tsx`): Icon cards showing benefits
- **Departments** (`src/components/Departments.tsx`): Grid of department cards
- **HowItWorks** (`src/components/HowItWorks.tsx`): Step-by-step patient guide
- **FeaturedDoctors** (`src/components/FeaturedDoctors.tsx`): Featured doctors grid
- **Reviews** (`src/components/Reviews.tsx`): Testimonial highlights
- **FAQ** (`src/components/FAQ.tsx`): Frequently asked questions accordion

### Directory Components

- **DoctorCard** (`src/components/DoctorCard.tsx`): Card displaying doctor summary
- **DoctorFilters** (`src/components/DoctorFilters.tsx`): Filter sidebar/sheet with URL param sync

### Profile Components

- **DoctorProfile** (`src/components/DoctorProfile.tsx`): Full doctor profile page
- **BookingModal** (`src/components/BookingModal.tsx`): Appointment request modal (placeholder)
- **ReviewModal** (`src/components/ReviewModal.tsx`): Review submission modal (placeholder)

### UI Components

Located in `src/components/ui/`, these are shadcn/ui components:
- Button, Card, Dialog, Sheet, Accordion, Badge, Input, Select, Label, Separator

## State Management

### Client-Side State

- **React useState**: Used for component-level state (modals, filters, etc.)
- **URL Query Parameters**: Used for filter persistence and sharing
- **No Global State**: No Redux, Zustand, or Context API needed

### Filter State Flow

1. User interacts with filters in `DoctorFilters` component
2. Filters update local state
3. `useEffect` syncs state to URL query parameters via `useRouter`
4. `DoctorsPage` reads URL params and filters doctor list
5. Filtered results displayed in `DoctorCard` components

## Routing Strategy

### Static Generation

All pages are statically generated at build time:

- **Landing Page** (`/`): Pre-rendered from `src/app/page.tsx`
- **Directory Page** (`/doctors`): Pre-rendered from `src/app/doctors/page.tsx`
- **Profile Pages** (`/doctors/[slug]`): Generated via `generateStaticParams()` in `src/app/doctors/[slug]/page.tsx`

### Dynamic Routes

Doctor profile pages use dynamic routes with static generation:

```typescript
export function generateStaticParams() {
  return doctors.map((doctor) => ({
    slug: doctor.slug,
  }));
}
```

This pre-generates all doctor profile pages at build time.

## Data Flow

### Data Source

All data is stored in TypeScript files:
- `src/data/doctors.ts`: Array of doctor objects
- `src/data/departments.ts`: Array of department objects

### Data Access Pattern

1. **Import directly**: Components import data directly from data files
2. **No API calls**: All data is bundled at build time
3. **Client-side filtering**: Filtering happens in browser after page load

### Type Safety

TypeScript interfaces defined in `src/types/index.ts`:
- `Doctor`: Doctor profile data structure
- `Department`: Department information
- `Location`, `Insurance`, `Review`, `BookingSlot`: Supporting types

## Static Export Configuration

### Next.js Config

`next.config.js`:
```javascript
{
  output: 'export',           // Generate static files
  trailingSlash: true,       // URLs end with /
  images: { unoptimized: true }, // Required for static export
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || '',
}
```

### Build Process

1. `npm run build` runs Next.js build
2. Next.js pre-renders all pages
3. `generateStaticParams()` creates all dynamic routes
4. Output written to `/out` folder
5. `/out` contains fully static HTML, CSS, JS files

## Styling Architecture

### Tailwind CSS

- Utility-first CSS framework
- Configured in `tailwind.config.ts`
- Brand colors defined as Tailwind tokens
- CSS variables in `globals.css` for theming

### Brand Colors

Defined in `src/app/globals.css`:
- `--brand-teal`: `#2EC4B6`
- `--brand-dark-blue`: `#1A4B7F`
- `--brand-dark-blue-alt`: `#2C4060`

Mapped to Tailwind config for use throughout app.

## Component Patterns

### Client Components

Components using hooks or interactivity marked with `'use client'`:
- `Header`, `Hero`, `DoctorFilters`, `DoctorsPage`, `DoctorProfile`, modals

### Server Components (Default)

Components without client-side interactivity are server components:
- `Footer`, `MissionStatement`, `Departments`, `FAQ`

### Composition

- Landing page (`page.tsx`) composes multiple section components
- Profile page uses `DoctorProfile` component
- Directory page uses `DoctorCard` and `DoctorFilters`

## Performance Considerations

### Static Generation Benefits

- Fast page loads (pre-rendered HTML)
- SEO-friendly (all content in HTML)
- No server required (works on CDN)
- Low hosting costs

### Optimization

- Images: Using Next.js `<Image>` component (unoptimized for static export)
- Code splitting: Automatic via Next.js
- CSS: Tailwind purges unused styles

## Limitations

### No Server Features

- No API routes
- No server actions
- No middleware
- No dynamic server-side rendering

### Client-Only Features

- Booking requests: Placeholder (no persistence)
- Review submission: Placeholder (no persistence)
- Filtering: Client-side only (no server-side search)

## Future Architecture Considerations

If adding backend features:

1. **API Routes**: Add `src/app/api/` for backend endpoints
2. **Database**: Integrate Prisma or similar ORM
3. **Authentication**: Add NextAuth.js or similar
4. **Server Actions**: Use for form submissions
5. **ISR**: Incremental Static Regeneration for dynamic content

## File Organization

```
src/
├── app/              # Next.js App Router
│   ├── layout.tsx    # Root layout
│   ├── page.tsx      # Landing page
│   └── doctors/      # Doctor routes
├── components/       # React components
│   ├── ui/           # shadcn/ui components
│   └── ...           # Feature components
├── data/             # Data files
├── lib/              # Utilities
└── types/            # TypeScript types
```

This structure follows Next.js 14 App Router conventions and keeps code organized by feature.
