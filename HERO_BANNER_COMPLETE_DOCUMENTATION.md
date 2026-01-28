# Hero Banner Complete Design Documentation

**Version:** 1.0  
**Last Updated:** January 27, 2026  
**Component:** `NewHomeHero`  
**Location:** `src/components/newhome/NewHomeHero.tsx`

---

## Table of Contents

1. [Overview](#overview)
2. [Design Principles](#design-principles)
3. [Complete Component Code](#complete-component-code)
4. [Color System](#color-system)
5. [Typography System](#typography-system)
6. [Layout Structure](#layout-structure)
7. [Animation System](#animation-system)
8. [Responsive Design](#responsive-design)
9. [Dependencies](#dependencies)
10. [Media Assets](#media-assets)
11. [Supporting Components](#supporting-components)
12. [Data Structures](#data-structures)
13. [Implementation Guide](#implementation-guide)
14. [Troubleshooting](#troubleshooting)
15. [Code Snippets](#code-snippets)

---

## Overview

The Hero Banner is a sophisticated, modern landing section featuring:
- **Two-column responsive layout** (content left, circular video right)
- **Glassmorphism effects** with backdrop blur
- **Animated statistics counter** with smooth number transitions
- **Integrated search functionality** with Suspense loading
- **Staggered entrance animations** respecting reduced motion preferences
- **Gradient background** with brand colors
- **Accessibility-first** design with ARIA labels and focus states

### Visual Hierarchy

```
Hero Section (Full Width)
├── Container (Max-width responsive padding)
    ├── Flex Container (Column on mobile, Row on desktop)
        ├── Content Area (Left - Flex-1)
        │   ├── Heading (H1)
        │   ├── Description (P)
        │   ├── Stats Strip (Glassmorphism Card)
        │   └── CTAs + Search Bar
        └── Circular Video (Right - Flex-shrink-0)
```

---

## Design Principles

### 1. **Visual Hierarchy**
- **Primary**: Large heading with teal accent highlights
- **Secondary**: Descriptive text and statistics
- **Tertiary**: Call-to-action buttons and search

### 2. **Glassmorphism**
- Semi-transparent backgrounds (`bg-white/10`)
- Backdrop blur effects (`backdrop-blur-md`)
- Subtle borders (`border-white/20`)
- Layered shadows for depth

### 3. **Motion Design**
- **Staggered animations**: Elements appear sequentially (0.2s, 0.4s, 0.6s delays)
- **Smooth transitions**: Ease-out timing functions
- **Reduced motion support**: Respects user preferences
- **Performance optimized**: Conditional animations

### 4. **Accessibility**
- Semantic HTML structure
- ARIA labels for screen readers
- Focus states on interactive elements
- Keyboard navigation support
- Reduced motion detection

### 5. **Responsive Design**
- Mobile-first approach
- Breakpoint-based scaling
- Flexible layouts (flex-col → flex-row)
- Adaptive typography and spacing

---

## Complete Component Code

### Main Component File

**File:** `src/components/newhome/NewHomeHero.tsx`

```tsx
'use client';

import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { homeStats } from '@/data/homeStats';
import { ArrowRight } from 'lucide-react';
import { TopSearchBar } from '../DoctorFilters';

export function NewHomeHero() {
  const [isVisible, setIsVisible] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [animatedStats, setAnimatedStats] = useState<Record<number, number>>({});

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      setPrefersReducedMotion(mediaQuery.matches);
      setIsVisible(true);

      const handleChange = (e: MediaQueryListEvent) => {
        setPrefersReducedMotion(e.matches);
      };

      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, []);

  // Animate stats counter
  useEffect(() => {
    if (!isVisible) return;

    const timers: NodeJS.Timeout[] = [];

    if (!prefersReducedMotion) {
      homeStats.forEach((stat, index) => {
        const numericValue = parseInt(stat.value.replace(/\D/g, '')) || 0;
        if (numericValue > 0) {
          const duration = 2000;
          const steps = 60;
          const increment = numericValue / steps;
          let current = 0;
          const timer = setInterval(() => {
            current += increment;
            if (current >= numericValue) {
              setAnimatedStats(prev => ({ ...prev, [index]: numericValue }));
              clearInterval(timer);
            } else {
              setAnimatedStats(prev => ({ ...prev, [index]: Math.floor(current) }));
            }
          }, duration / steps);
          timers.push(timer);
        } else {
          // For non-numeric values like "Verified", set immediately
          setAnimatedStats(prev => ({ ...prev, [index]: 0 }));
        }
      });
    } else {
      // Set final values immediately if reduced motion
      const finalStats: Record<number, number> = {};
      homeStats.forEach((stat, index) => {
        const numericValue = parseInt(stat.value.replace(/\D/g, '')) || 0;
        finalStats[index] = numericValue;
      });
      setAnimatedStats(finalStats);
    }

    return () => {
      timers.forEach(timer => clearInterval(timer));
    };
  }, [isVisible, prefersReducedMotion]);

  return (
    <section 
      id="main-content"
      className="relative w-full min-h-[600px] md:min-h-[700px] overflow-hidden mt-24 md:mt-28 bg-gradient-to-br from-brand-dark-blue via-brand-dark-blue/95 to-brand-teal/30"
      aria-label="Hero section"
    >
      {/* Container with flex layout */}
      <div className="container mx-auto px-4 md:px-6 lg:px-8 xl:px-12">
        <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12 xl:gap-16 min-h-[600px] md:min-h-[700px] py-12 md:py-16 lg:py-20">
          {/* Content Area */}
          <div className="flex-1 w-full lg:w-auto">
            <div 
              className="max-w-2xl"
              style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible && !prefersReducedMotion ? 'translateX(0)' : 'translateX(-30px)',
                transition: prefersReducedMotion ? 'opacity 0.3s ease' : 'opacity 0.8s ease-out 0.2s, transform 0.8s ease-out 0.2s',
              }}
            >
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold mb-4 md:mb-8 leading-[1.15] text-white tracking-tight">
                <span className="whitespace-nowrap">Connect. <span className="text-brand-teal">Collaborate.</span></span>
                <br />
                <span className="whitespace-normal sm:whitespace-nowrap">Refer. <span className="text-brand-teal">Find Elite Care</span></span>
              </h1>
              <p className="text-base md:text-xl lg:text-2xl mb-6 md:mb-8 text-white/90 leading-relaxed max-w-xl">
                A trusted physician network and patient directory that supports referrals, collaboration, and easier access to quality care.
              </p>

              {/* Stats Strip - Tightly wrapped and centered on mobile */}
              <div
                className="inline-flex flex-wrap items-center justify-start gap-0 md:gap-0 mb-8 md:mb-10 bg-white/10 backdrop-blur-md rounded-xl md:rounded-2xl border border-white/20 shadow-xl overflow-hidden w-fit"
                style={{
                  opacity: isVisible ? 1 : 0,
                  transform: isVisible && !prefersReducedMotion ? 'translateY(0)' : 'translateY(20px)',
                  transition: prefersReducedMotion ? 'opacity 0.3s ease' : 'opacity 0.8s ease-out 0.4s, transform 0.8s ease-out 0.4s',
                }}
              >
                {homeStats.map((stat, index) => {
                  const numericValue = animatedStats[index] ?? 0;
                  const suffix = stat.value.replace(/\d/g, '');
                  const isNumeric = numericValue > 0;

                  return (
                    <div key={index} className="flex flex-col items-start px-4 py-2.5 md:px-6 md:py-3.5 border-r border-white/10 last:border-r-0 hover:bg-white/5 transition-colors cursor-default">
                      <div className="text-sm md:text-lg lg:text-xl font-black text-white leading-tight">
                        {isNumeric ? `${numericValue}${suffix}` : stat.value}
                      </div>
                      <div className="text-[10px] md:text-xs text-brand-teal font-bold uppercase tracking-wider mt-0.5">
                        {stat.label}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Primary CTAs */}
              <div
                className="flex flex-col gap-8"
                style={{
                  opacity: isVisible ? 1 : 0,
                  transform: isVisible && !prefersReducedMotion ? 'translateY(0) scale(1)' : 'translateY(30px) scale(0.95)',
                  transition: prefersReducedMotion ? 'opacity 0.3s ease' : 'opacity 0.8s ease-out 0.6s, transform 0.8s ease-out 0.6s',
                }}
              >
                <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4">
                  <Button
                    asChild
                    size="lg"
                    variant="colorful-glow"
                    className="bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20 hover:border-white/40 w-full sm:w-auto focus-ring shadow-lg hover:shadow-xl"
                  >
                    <Link href="/join-us">Join the Network</Link>
                  </Button>
                  <Button
                    asChild
                    size="lg"
                    variant="colorful-glow"
                    className="bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20 hover:border-white/40 w-full sm:w-auto focus-ring shadow-lg hover:shadow-xl"
                  >
                    <Link href="#departments">Explore Medical Specialties</Link>
                  </Button>
                </div>

                {/* Integrated Search Bar */}
                <div className="w-full max-w-4xl lg:ml-0">
                  <Suspense fallback={<div className="h-16 w-full bg-white/10 rounded-xl animate-pulse" />}>
                    <TopSearchBar />
                  </Suspense>
                </div>
              </div>
            </div>
          </div>

          {/* Circular Video Element */}
          <div className="flex-shrink-0 w-64 h-64 md:w-80 md:h-80 lg:w-96 lg:h-96 xl:w-[500px] xl:h-[500px] rounded-full overflow-hidden relative">
            <video
              autoPlay
              loop
              muted
              playsInline
              className="absolute inset-0 w-full h-full object-cover object-[center_30%] rounded-full"
              aria-hidden="true"
              style={{
                opacity: isVisible ? 1 : 0,
                transition: prefersReducedMotion ? 'opacity 0.3s ease' : 'opacity 1s ease-out 0.3s',
              }}
            >
              <source src="/Backgroundui2.mp4" type="video/mp4" />
            </video>
          </div>
        </div>
      </div>
    </section>
  );
}
```

---

## Color System

### Brand Colors (CSS Variables)

**File:** `src/app/globals.css`

```css
:root {
  /* Brand Colors - Enhanced Vibrant */
  --brand-teal: #1DD4C4;
  --brand-dark-blue: #0F5FA8;
  --brand-dark-blue-alt: #2C4060;
  
  /* Accent Colors */
  --brand-teal-light: #4EDFD0;
  --brand-teal-dark: #1AB8A8;
  --brand-blue-light: #3D8FD4;
  --accent-purple: #7C3AED;
  --accent-emerald: #10B981;
  --accent-amber: #F59E0B;
}
```

### Color Usage in Hero Banner

| Element | Color | CSS Class/Variable | RGB Value |
|---------|-------|-------------------|-----------|
| Background Gradient Start | Dark Blue | `from-brand-dark-blue` | `#0F5FA8` |
| Background Gradient Middle | Dark Blue (95% opacity) | `via-brand-dark-blue/95` | `rgba(15, 95, 168, 0.95)` |
| Background Gradient End | Teal (30% opacity) | `to-brand-teal/30` | `rgba(29, 212, 196, 0.3)` |
| Heading Text | White | `text-white` | `#FFFFFF` |
| Heading Accent | Teal | `text-brand-teal` | `#1DD4C4` |
| Description Text | White (90% opacity) | `text-white/90` | `rgba(255, 255, 255, 0.9)` |
| Stats Background | White (10% opacity) | `bg-white/10` | `rgba(255, 255, 255, 0.1)` |
| Stats Border | White (20% opacity) | `border-white/20` | `rgba(255, 255, 255, 0.2)` |
| Stats Label | Teal | `text-brand-teal` | `#1DD4C4` |
| Button Background | White (10% opacity) | `bg-white/10` | `rgba(255, 255, 255, 0.1)` |
| Button Border | White (30% opacity) | `border-white/30` | `rgba(255, 255, 255, 0.3)` |
| Button Hover Background | White (20% opacity) | `hover:bg-white/20` | `rgba(255, 255, 255, 0.2)` |

### Gradient Background Specification

```css
background: linear-gradient(
  to bottom right,
  #0F5FA8 0%,                    /* from-brand-dark-blue */
  rgba(15, 95, 168, 0.95) 50%,  /* via-brand-dark-blue/95 */
  rgba(29, 212, 196, 0.3) 100%  /* to-brand-teal/30 */
);
```

**Direction:** `135deg` (bottom-right diagonal)  
**Stops:** 0%, 50%, 100%

---

## Typography System

### Heading (H1)

**Responsive Sizes:**
- Mobile: `text-3xl` (1.875rem / 30px)
- Tablet: `md:text-5xl` (3rem / 48px)
- Desktop: `lg:text-6xl` (3.75rem / 60px)

**Properties:**
```css
font-weight: 800; /* font-extrabold */
line-height: 1.15; /* leading-[1.15] */
color: white;
letter-spacing: -0.025em; /* tracking-tight */
margin-bottom: 1rem; /* mb-4 on mobile */
margin-bottom: 2rem; /* md:mb-8 on tablet+ */
```

**Text Content:**
```
Line 1: "Connect. Collaborate."
Line 2: "Refer. Find Elite Care"
```

**Accent Words:** "Collaborate" and "Find Elite Care" use `text-brand-teal`

### Description (P)

**Responsive Sizes:**
- Mobile: `text-base` (1rem / 16px)
- Tablet: `md:text-xl` (1.25rem / 20px)
- Desktop: `lg:text-2xl` (1.5rem / 24px)

**Properties:**
```css
color: rgba(255, 255, 255, 0.9); /* text-white/90 */
line-height: 1.625; /* leading-relaxed */
max-width: 36rem; /* max-w-xl */
margin-bottom: 1.5rem; /* mb-6 on mobile */
margin-bottom: 2rem; /* md:mb-8 on tablet+ */
```

**Text Content:**
```
"A trusted physician network and patient directory that supports referrals, collaboration, and easier access to quality care."
```

### Stats Typography

**Value (Number):**
- Mobile: `text-sm` (0.875rem / 14px)
- Tablet: `md:text-lg` (1.125rem / 18px)
- Desktop: `lg:text-xl` (1.25rem / 20px)
- Weight: `font-black` (900)
- Color: `text-white`
- Line-height: `leading-tight` (1.25)

**Label:**
- Mobile: `text-[10px]` (0.625rem / 10px)
- Tablet: `md:text-xs` (0.75rem / 12px)
- Weight: `font-bold` (700)
- Color: `text-brand-teal`
- Transform: `uppercase`
- Letter-spacing: `tracking-wider` (0.05em)

---

## Layout Structure

### Section Container

```tsx
<section 
  id="main-content"
  className="relative w-full min-h-[600px] md:min-h-[700px] overflow-hidden mt-24 md:mt-28 bg-gradient-to-br from-brand-dark-blue via-brand-dark-blue/95 to-brand-teal/30"
  aria-label="Hero section"
>
```

**Properties:**
- `relative`: Positioning context
- `w-full`: 100% width
- `min-h-[600px]`: Mobile minimum height (600px)
- `md:min-h-[700px]`: Tablet+ minimum height (700px)
- `overflow-hidden`: Clip overflow content
- `mt-24`: Top margin 6rem (96px) on mobile
- `md:mt-28`: Top margin 7rem (112px) on tablet+

### Inner Container

```tsx
<div className="container mx-auto px-4 md:px-6 lg:px-8 xl:px-12">
```

**Properties:**
- `container`: Max-width container (responsive)
- `mx-auto`: Center horizontally
- `px-4`: Horizontal padding 1rem (16px) on mobile
- `md:px-6`: Horizontal padding 1.5rem (24px) on tablet
- `lg:px-8`: Horizontal padding 2rem (32px) on desktop
- `xl:px-12`: Horizontal padding 3rem (48px) on XL screens

### Flex Layout Container

```tsx
<div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12 xl:gap-16 min-h-[600px] md:min-h-[700px] py-12 md:py-16 lg:py-20">
```

**Properties:**
- `flex`: Flexbox layout
- `flex-col`: Column direction on mobile
- `lg:flex-row`: Row direction on desktop
- `items-center`: Vertical centering
- `gap-8`: Gap 2rem (32px) on mobile
- `lg:gap-12`: Gap 3rem (48px) on desktop
- `xl:gap-16`: Gap 4rem (64px) on XL screens
- `py-12`: Vertical padding 3rem (48px) on mobile
- `md:py-16`: Vertical padding 4rem (64px) on tablet
- `lg:py-20`: Vertical padding 5rem (80px) on desktop

### Content Area (Left Side)

```tsx
<div className="flex-1 w-full lg:w-auto">
  <div className="max-w-2xl">
```

**Properties:**
- `flex-1`: Grow to fill available space
- `w-full`: Full width on mobile
- `lg:w-auto`: Auto width on desktop
- `max-w-2xl`: Maximum width 42rem (672px)

### Circular Video Container (Right Side)

```tsx
<div className="flex-shrink-0 w-64 h-64 md:w-80 md:h-80 lg:w-96 lg:h-96 xl:w-[500px] xl:h-[500px] rounded-full overflow-hidden relative">
```

**Responsive Sizes:**
- Mobile: `w-64 h-64` (256px × 256px)
- Tablet: `md:w-80 md:h-80` (320px × 320px)
- Desktop: `lg:w-96 lg:h-96` (384px × 384px)
- XL: `xl:w-[500px] xl:h-[500px]` (500px × 500px)

**Properties:**
- `flex-shrink-0`: Prevent shrinking
- `rounded-full`: Perfect circle
- `overflow-hidden`: Clip video to circle
- `relative`: Positioning context

---

## Animation System

### Animation Timeline

| Element | Delay | Duration | Transform | Easing |
|---------|-------|----------|-----------|--------|
| Content Area | 0.2s | 0.8s | translateX(-30px) → 0 | ease-out |
| Stats Strip | 0.4s | 0.8s | translateY(20px) → 0 | ease-out |
| CTAs | 0.6s | 0.8s | translateY(30px) scale(0.95) → 0 scale(1) | ease-out |
| Video | 0.3s | 1s | opacity 0 → 1 | ease-out |

### Reduced Motion Support

**Detection:**
```tsx
const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
setPrefersReducedMotion(mediaQuery.matches);
```

**Behavior:**
- If reduced motion: Only opacity transitions (0.3s)
- If normal motion: Full transforms + opacity (0.8s)
- Stats counter: Immediate values vs. animated count-up

### Stats Counter Animation

**Algorithm:**
```tsx
const duration = 2000; // 2 seconds
const steps = 60; // 60 frames
const increment = numericValue / steps;
let current = 0;

const timer = setInterval(() => {
  current += increment;
  if (current >= numericValue) {
    setAnimatedStats(prev => ({ ...prev, [index]: numericValue }));
    clearInterval(timer);
  } else {
    setAnimatedStats(prev => ({ ...prev, [index]: Math.floor(current) }));
  }
}, duration / steps); // ~33ms per frame
```

**Example:** For "120+"
- Target: 120
- Increment: 120 / 60 = 2
- Updates every ~33ms
- Final value: 120

**Non-numeric values** (e.g., "Verified", "Board-Certified") display immediately.

### Inline Style Animations

**Content Area:**
```tsx
style={{
  opacity: isVisible ? 1 : 0,
  transform: isVisible && !prefersReducedMotion ? 'translateX(0)' : 'translateX(-30px)',
  transition: prefersReducedMotion 
    ? 'opacity 0.3s ease' 
    : 'opacity 0.8s ease-out 0.2s, transform 0.8s ease-out 0.2s',
}}
```

**Stats Strip:**
```tsx
style={{
  opacity: isVisible ? 1 : 0,
  transform: isVisible && !prefersReducedMotion ? 'translateY(0)' : 'translateY(20px)',
  transition: prefersReducedMotion 
    ? 'opacity 0.3s ease' 
    : 'opacity 0.8s ease-out 0.4s, transform 0.8s ease-out 0.4s',
}}
```

**CTAs:**
```tsx
style={{
  opacity: isVisible ? 1 : 0,
  transform: isVisible && !prefersReducedMotion 
    ? 'translateY(0) scale(1)' 
    : 'translateY(30px) scale(0.95)',
  transition: prefersReducedMotion 
    ? 'opacity 0.3s ease' 
    : 'opacity 0.8s ease-out 0.6s, transform 0.8s ease-out 0.6s',
}}
```

**Video:**
```tsx
style={{
  opacity: isVisible ? 1 : 0,
  transition: prefersReducedMotion 
    ? 'opacity 0.3s ease' 
    : 'opacity 1s ease-out 0.3s',
}}
```

---

## Responsive Design

### Breakpoint System

Using Tailwind CSS default breakpoints:

| Breakpoint | Min Width | Usage |
|------------|-----------|-------|
| `sm` | 640px | Small tablets |
| `md` | 768px | Tablets |
| `lg` | 1024px | Desktop |
| `xl` | 1280px | Large desktop |

### Responsive Properties

#### Section Height
- Mobile: `min-h-[600px]`
- Tablet+: `md:min-h-[700px]`

#### Top Margin
- Mobile: `mt-24` (96px)
- Tablet+: `md:mt-28` (112px)

#### Container Padding
- Mobile: `px-4` (16px)
- Tablet: `md:px-6` (24px)
- Desktop: `lg:px-8` (32px)
- XL: `xl:px-12` (48px)

#### Flex Direction
- Mobile: `flex-col` (stacked)
- Desktop: `lg:flex-row` (side-by-side)

#### Gap Between Columns
- Mobile: `gap-8` (32px)
- Desktop: `lg:gap-12` (48px)
- XL: `xl:gap-16` (64px)

#### Vertical Padding
- Mobile: `py-12` (48px)
- Tablet: `md:py-16` (64px)
- Desktop: `lg:py-20` (80px)

#### Heading Size
- Mobile: `text-3xl` (30px)
- Tablet: `md:text-5xl` (48px)
- Desktop: `lg:text-6xl` (60px)

#### Description Size
- Mobile: `text-base` (16px)
- Tablet: `md:text-xl` (20px)
- Desktop: `lg:text-2xl` (24px)

#### Video Size
- Mobile: `w-64 h-64` (256px)
- Tablet: `md:w-80 md:h-80` (320px)
- Desktop: `lg:w-96 lg:h-96` (384px)
- XL: `xl:w-[500px] xl:h-[500px]` (500px)

#### Stats Value Size
- Mobile: `text-sm` (14px)
- Tablet: `md:text-lg` (18px)
- Desktop: `lg:text-xl` (20px)

#### Stats Label Size
- Mobile: `text-[10px]` (10px)
- Tablet+: `md:text-xs` (12px)

#### Stats Padding
- Mobile: `px-4 py-2.5` (16px × 10px)
- Tablet+: `md:px-6 md:py-3.5` (24px × 14px)

#### Stats Border Radius
- Mobile: `rounded-xl` (12px)
- Tablet+: `md:rounded-2xl` (16px)

#### Button Width
- Mobile: `w-full` (100%)
- Tablet+: `sm:w-auto` (auto)

---

## Dependencies

### Required Packages

```json
{
  "dependencies": {
    "react": "^18.x",
    "next": "^14.x",
    "lucide-react": "^0.x",
    "@radix-ui/react-slot": "^1.x",
    "class-variance-authority": "^0.x",
    "tailwindcss": "^3.x"
  }
}
```

### Import Statements

```tsx
import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { homeStats } from '@/data/homeStats';
import { ArrowRight } from 'lucide-react';
import { TopSearchBar } from '../DoctorFilters';
```

### Required Components

1. **Button Component** (`@/components/ui/button`)
   - Must support `variant="colorful-glow"`
   - Must support `size="lg"`
   - Must support `asChild` prop (Radix Slot)

2. **TopSearchBar Component** (`@/components/DoctorFilters`)
   - Must be wrapped in Suspense
   - Must handle search functionality

3. **homeStats Data** (`@/data/homeStats`)
   - Array of `{ value: string, label: string }`

### Required CSS Classes

**From `globals.css`:**
- `.btn-colorful-glow` (button variant)
- `.focus-ring` (focus state utility)
- Brand color variables (`--brand-teal`, `--brand-dark-blue`)

---

## Media Assets

### Video File

**Path:** `/public/Backgroundui2.mp4`

**Specifications:**
- Format: MP4 (H.264 recommended)
- Location: Public folder (accessible at `/Backgroundui2.mp4`)
- Usage: Circular video element on right side
- Attributes:
  - `autoPlay`: Starts automatically
  - `loop`: Repeats continuously
  - `muted`: No audio (required for autoplay)
  - `playsInline`: Prevents fullscreen on mobile

**Object Fit:**
- `object-cover`: Fills container while maintaining aspect ratio
- `object-[center_30%]`: Focuses on center-top area (30% from top)

**Recommended Video Specs:**
- Resolution: 1920×1080 or higher
- Aspect Ratio: 1:1 (square) or 16:9 (will be cropped to circle)
- Duration: 10-30 seconds (loops seamlessly)
- File Size: < 5MB (optimized for web)

**Alternative:** If video unavailable, use a static image:
```tsx
<img 
  src="/hero-image.jpg" 
  alt=""
  className="absolute inset-0 w-full h-full object-cover object-[center_30%] rounded-full"
  aria-hidden="true"
/>
```

---

## Supporting Components

### TopSearchBar Component

**Location:** `src/components/DoctorFilters.tsx`

**Usage:**
```tsx
<Suspense fallback={<div className="h-16 w-full bg-white/10 rounded-xl animate-pulse" />}>
  <TopSearchBar />
</Suspense>
```

**Key Features:**
- Glassmorphism design matching hero
- Multi-field search (name, location, insurance)
- Responsive layout
- Navigation to `/doctors` with query params

**Required Props:** None (uses internal hooks)

### Button Component

**Location:** `src/components/ui/button.tsx`

**Required Variant:**
```tsx
"colorful-glow": "btn-colorful-glow"
```

**CSS Class Definition:**
```css
.btn-colorful-glow {
  background: var(--brand-teal);
  color: white;
  border: 2px solid transparent;
  box-shadow: 0 0 15px rgba(29, 212, 196, 0.5);
  transition: all 0.3s ease;
}

.btn-colorful-glow:hover {
  box-shadow: 0 0 30px rgba(29, 212, 196, 0.8), 0 0 50px rgba(15, 95, 168, 0.5);
  border-color: var(--brand-teal-light);
  transform: translateY(-2px);
}
```

**Note:** Hero buttons override base styles with glassmorphism:
```tsx
className="bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20 hover:border-white/40"
```

---

## Data Structures

### homeStats Interface

**File:** `src/data/homeStats.ts`

```tsx
export interface HomeStat {
  value: string;
  label: string;
}

export const homeStats: HomeStat[] = [
  {
    value: 'Verified',
    label: 'Network',
  },
  {
    value: '120+',
    label: 'Physicians',
  },
  {
    value: '15+',
    label: 'Medical Specialties',
  },
  {
    value: 'Board-Certified',
    label: 'Specialists',
  },
];
```

**Usage:**
```tsx
{homeStats.map((stat, index) => {
  const numericValue = parseInt(stat.value.replace(/\D/g, '')) || 0;
  const suffix = stat.value.replace(/\d/g, '');
  const isNumeric = numericValue > 0;
  
  return (
    <div key={index}>
      <div>{isNumeric ? `${numericValue}${suffix}` : stat.value}</div>
      <div>{stat.label}</div>
    </div>
  );
})}
```

**Customization:**
- Add/remove stats by modifying the array
- Numeric values will animate (e.g., "120+", "15+")
- Non-numeric values display immediately (e.g., "Verified", "Board-Certified")

---

## Implementation Guide

### Step 1: Setup Dependencies

```bash
npm install react next lucide-react @radix-ui/react-slot class-variance-authority tailwindcss
```

### Step 2: Create Data File

**File:** `src/data/homeStats.ts`

```tsx
export interface HomeStat {
  value: string;
  label: string;
}

export const homeStats: HomeStat[] = [
  {
    value: 'Verified',
    label: 'Network',
  },
  {
    value: '120+',
    label: 'Physicians',
  },
  {
    value: '15+',
    label: 'Medical Specialties',
  },
  {
    value: 'Board-Certified',
    label: 'Specialists',
  },
];
```

### Step 3: Setup CSS Variables

**File:** `src/app/globals.css`

Add to `:root`:
```css
:root {
  --brand-teal: #1DD4C4;
  --brand-dark-blue: #0F5FA8;
  --brand-teal-light: #4EDFD0;
  --brand-teal-dark: #1AB8A8;
  --brand-blue-light: #3D8FD4;
}
```

Add button variant class:
```css
.btn-colorful-glow {
  background: var(--brand-teal);
  color: white;
  border: 2px solid transparent;
  box-shadow: 0 0 15px rgba(29, 212, 196, 0.5);
  transition: all 0.3s ease;
}

.btn-colorful-glow:hover {
  box-shadow: 0 0 30px rgba(29, 212, 196, 0.8), 0 0 50px rgba(15, 95, 168, 0.5);
  border-color: var(--brand-teal-light);
  transform: translateY(-2px);
}
```

Add focus ring utility:
```css
.focus-ring {
  @apply focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal focus-visible:ring-offset-2;
}
```

### Step 4: Configure Tailwind

**File:** `tailwind.config.js`

```js
module.exports = {
  theme: {
    extend: {
      colors: {
        'brand-teal': '#1DD4C4',
        'brand-dark-blue': '#0F5FA8',
        'brand-teal-light': '#4EDFD0',
        'brand-teal-dark': '#1AB8A8',
        'brand-blue-light': '#3D8FD4',
      },
    },
  },
}
```

### Step 5: Create Button Component

**File:** `src/components/ui/button.tsx`

```tsx
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        "colorful-glow": "btn-colorful-glow",
      },
      size: {
        default: "h-10 px-4 py-2",
        lg: "h-11 rounded-md px-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
```

### Step 6: Create Hero Component

**File:** `src/components/newhome/NewHomeHero.tsx`

Copy the complete component code from [Complete Component Code](#complete-component-code) section.

### Step 7: Add Video Asset

Place video file at: `/public/Backgroundui2.mp4`

**Alternative:** Use placeholder image:
```tsx
// Replace video element with:
<div className="flex-shrink-0 w-64 h-64 md:w-80 md:h-80 lg:w-96 lg:h-96 xl:w-[500px] xl:h-[500px] rounded-full overflow-hidden relative bg-gradient-to-br from-brand-teal/20 to-brand-dark-blue/20">
  <div className="absolute inset-0 flex items-center justify-center">
    <div className="w-32 h-32 bg-white/10 rounded-full backdrop-blur-md"></div>
  </div>
</div>
```

### Step 8: Use Component

**File:** `src/app/page.tsx` (or your home page)

```tsx
import { NewHomeHero } from '@/components/newhome/NewHomeHero';

export default function Home() {
  return (
    <main>
      <NewHomeHero />
      {/* Rest of your page content */}
    </main>
  );
}
```

---

## Troubleshooting

### Issue: Animations Not Working

**Symptoms:** Elements appear instantly without animation

**Solutions:**
1. Check `isVisible` state is set to `true`
2. Verify `prefers-reduced-motion` is not enabled in browser
3. Check CSS transitions are not overridden
4. Ensure component is client-side (`'use client'` directive)

### Issue: Stats Counter Not Animating

**Symptoms:** Numbers appear immediately instead of counting up

**Solutions:**
1. Verify `isVisible` is `true` before animation starts
2. Check `prefersReducedMotion` is `false`
3. Ensure numeric values are parseable (e.g., "120+" works, "120" works)
4. Check console for errors in `useEffect`

### Issue: Video Not Playing

**Symptoms:** Video element shows but doesn't play

**Solutions:**
1. Verify video file exists at `/public/Backgroundui2.mp4`
2. Check video format is MP4 (H.264)
3. Ensure `muted` attribute is present (required for autoplay)
4. Check browser autoplay policies
5. Verify `playsInline` attribute for mobile

### Issue: Glassmorphism Not Visible

**Symptoms:** Stats strip and buttons appear solid white

**Solutions:**
1. Verify `backdrop-blur-md` is supported (modern browsers)
2. Check `bg-white/10` opacity values
3. Ensure parent has background (gradient)
4. Test in Chrome/Firefox/Safari (backdrop-filter support varies)

### Issue: Layout Breaks on Mobile

**Symptoms:** Content overlaps or doesn't stack properly

**Solutions:**
1. Verify `flex-col` on mobile, `lg:flex-row` on desktop
2. Check container padding (`px-4 md:px-6 lg:px-8`)
3. Ensure video container has `flex-shrink-0`
4. Test with different viewport sizes

### Issue: Colors Not Matching

**Symptoms:** Colors appear different than expected

**Solutions:**
1. Verify CSS variables are defined in `globals.css`
2. Check Tailwind config includes brand colors
3. Ensure Tailwind is processing custom classes
4. Clear browser cache and rebuild

### Issue: Search Bar Not Loading

**Symptoms:** Suspense fallback shows indefinitely

**Solutions:**
1. Verify `TopSearchBar` component exists and exports correctly
2. Check for errors in `DoctorFilters.tsx`
3. Ensure Suspense boundary is properly set up
4. Check Next.js Suspense configuration

### Issue: Buttons Not Clickable

**Symptoms:** Buttons don't navigate or respond

**Solutions:**
1. Verify `asChild` prop is used with `Link`
2. Check `href` values are correct (`/join-us`, `#departments`)
3. Ensure `Button` component supports `asChild`
4. Check for z-index issues (overlapping elements)

---

## Code Snippets

### Minimal Implementation

**Simplified version without animations:**

```tsx
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { homeStats } from '@/data/homeStats';

export function SimpleHero() {
  return (
    <section className="relative w-full min-h-[600px] bg-gradient-to-br from-brand-dark-blue via-brand-dark-blue/95 to-brand-teal/30">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center gap-12 py-20">
          <div className="flex-1 max-w-2xl">
            <h1 className="text-5xl font-extrabold mb-8 text-white">
              Connect. <span className="text-brand-teal">Collaborate.</span>
              <br />
              Refer. <span className="text-brand-teal">Find Elite Care</span>
            </h1>
            <p className="text-xl mb-8 text-white/90">
              A trusted physician network and patient directory.
            </p>
            
            <div className="inline-flex flex-wrap gap-0 mb-10 bg-white/10 backdrop-blur-md rounded-xl border border-white/20">
              {homeStats.map((stat, index) => (
                <div key={index} className="px-6 py-3 border-r border-white/10 last:border-r-0">
                  <div className="text-lg font-black text-white">{stat.value}</div>
                  <div className="text-xs text-brand-teal font-bold uppercase">{stat.label}</div>
                </div>
              ))}
            </div>

            <div className="flex gap-4">
              <Button asChild size="lg" variant="colorful-glow">
                <Link href="/join-us">Join the Network</Link>
              </Button>
              <Button asChild size="lg" variant="colorful-glow">
                <Link href="#departments">Explore Specialties</Link>
              </Button>
            </div>
          </div>

          <div className="flex-shrink-0 w-96 h-96 rounded-full overflow-hidden">
            <video autoPlay loop muted playsInline className="w-full h-full object-cover rounded-full">
              <source src="/Backgroundui2.mp4" type="video/mp4" />
            </video>
          </div>
        </div>
      </div>
    </section>
  );
}
```

### Stats Counter Hook

**Reusable hook for animated counters:**

```tsx
import { useEffect, useState } from 'react';

export function useAnimatedCounter(
  targetValue: number,
  duration: number = 2000,
  enabled: boolean = true
) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!enabled) {
      setValue(targetValue);
      return;
    }

    const steps = 60;
    const increment = targetValue / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= targetValue) {
        setValue(targetValue);
        clearInterval(timer);
      } else {
        setValue(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [targetValue, duration, enabled]);

  return value;
}
```

### Animation Wrapper Component

**Reusable animation wrapper:**

```tsx
interface AnimatedWrapperProps {
  children: React.ReactNode;
  delay?: number;
  direction?: 'left' | 'right' | 'up' | 'down';
  disabled?: boolean;
}

export function AnimatedWrapper({ 
  children, 
  delay = 0, 
  direction = 'up',
  disabled = false 
}: AnimatedWrapperProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
  }, []);

  const transforms = {
    left: 'translateX(-30px)',
    right: 'translateX(30px)',
    up: 'translateY(20px)',
    down: 'translateY(-20px)',
  };

  return (
    <div
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible && !prefersReducedMotion && !disabled 
          ? 'translate(0)' 
          : transforms[direction],
        transition: prefersReducedMotion || disabled
          ? `opacity 0.3s ease`
          : `opacity 0.8s ease-out ${delay}s, transform 0.8s ease-out ${delay}s`,
      }}
    >
      {children}
    </div>
  );
}
```

### Custom Stats Component

**Standalone stats display:**

```tsx
interface StatsDisplayProps {
  stats: Array<{ value: string; label: string }>;
  animated?: boolean;
}

export function StatsDisplay({ stats, animated = true }: StatsDisplayProps) {
  const [animatedValues, setAnimatedValues] = useState<Record<number, number>>({});
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    // Animation logic here
  }, []);

  return (
    <div className="inline-flex flex-wrap gap-0 bg-white/10 backdrop-blur-md rounded-xl border border-white/20">
      {stats.map((stat, index) => {
        const numericValue = parseInt(stat.value.replace(/\D/g, '')) || 0;
        const suffix = stat.value.replace(/\d/g, '');
        const displayValue = animated && numericValue > 0
          ? `${animatedValues[index] ?? 0}${suffix}`
          : stat.value;

        return (
          <div key={index} className="px-6 py-3 border-r border-white/10 last:border-r-0">
            <div className="text-lg font-black text-white">{displayValue}</div>
            <div className="text-xs text-brand-teal font-bold uppercase">{stat.label}</div>
          </div>
        );
      })}
    </div>
  );
}
```

---

## Additional Resources

### Design Tokens Reference

**Spacing Scale:**
- `px-4` = 16px (1rem)
- `px-6` = 24px (1.5rem)
- `px-8` = 32px (2rem)
- `px-12` = 48px (3rem)
- `gap-8` = 32px (2rem)
- `gap-12` = 48px (3rem)
- `gap-16` = 64px (4rem)

**Border Radius:**
- `rounded-xl` = 12px
- `rounded-2xl` = 16px
- `rounded-full` = 9999px (perfect circle)

**Shadows:**
- `shadow-lg` = `0px 10px 15px -3px rgba(0, 0, 0, 0.1)`
- `shadow-xl` = `0px 20px 25px -5px rgba(0, 0, 0, 0.1)`

**Backdrop Blur:**
- `backdrop-blur-sm` = 4px
- `backdrop-blur-md` = 12px
- `backdrop-blur-xl` = 24px

### Browser Support

**Required Features:**
- CSS Grid/Flexbox (all modern browsers)
- Backdrop Filter (Chrome 76+, Firefox 103+, Safari 9+)
- CSS Custom Properties (all modern browsers)
- Intersection Observer (for scroll animations, if added)

**Fallbacks:**
- If backdrop-filter not supported: Use solid background colors
- If CSS variables not supported: Use direct color values
- If animations not supported: Content still visible (graceful degradation)

### Performance Considerations

**Optimizations:**
1. Video: Use compressed MP4 (H.264), < 5MB
2. Images: Use WebP format when possible
3. Animations: Use `transform` and `opacity` (GPU accelerated)
4. State: Minimize re-renders with proper dependency arrays
5. Code splitting: Suspense for search bar component

**Lighthouse Targets:**
- Performance: 90+
- Accessibility: 100
- Best Practices: 90+
- SEO: 100

---

## Conclusion

This documentation provides everything needed to replicate the Hero Banner design. The component is:

- **Fully responsive** across all device sizes
- **Accessible** with ARIA labels and reduced motion support
- **Performant** with optimized animations and code splitting
- **Maintainable** with clear structure and reusable patterns
- **Customizable** with easy-to-modify data and styles

For questions or issues, refer to the [Troubleshooting](#troubleshooting) section or review the code examples in [Code Snippets](#code-snippets).

---

**Document Version:** 1.0  
**Last Updated:** January 27, 2026  
**Maintained By:** Development Team
