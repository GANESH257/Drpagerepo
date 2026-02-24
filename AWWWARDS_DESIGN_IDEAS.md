# Awwwards-Style Design Ideas & Elements

Reference: **[Awwwards – Website Awards & Best Web Design Trends](https://www.awwwards.com/)**. This doc lists design ideas and UI elements commonly seen in award-winning sites and maps them to this codebase so the team can implement as much as possible.

---

## Table of Contents

1. [Scrolling & layout](#1-scrolling--layout)
2. [Animations & motion](#2-animations--motion)
3. [Headers, nav & UI chrome](#3-headers-nav--ui-chrome)
4. [Typography](#4-typography)
5. [Cards, lists & content blocks](#5-cards-lists--content-blocks)
6. [Loading & transitions](#6-loading--transitions)
7. [Cursor & interaction](#7-cursor--interaction)
8. [Visual effects (gradients, 3D, texture)](#8-visual-effects-gradients-3d-texture)
9. [Implementation checklist](#9-implementation-checklist)

---

## 1. Scrolling & layout

| Idea | Description | In this project | How to add |
|------|-------------|-----------------|------------|
| **Smooth scroll** | Buttery scroll (Lenis/Locomotive) | ✅ `SmoothScrollWrapper`, Locomotive | — |
| **Scroll-triggered reveal** | Elements fade/slide in on scroll | ✅ GSAP ScrollTrigger, `data-scroll-section`, `data-3d-reveal` | Add `data-3d-reveal` to more sections |
| **Parallax** | Background or layer moves at different speed | §8 DESIGN_LIBRARIES; footer example | ScrollTrigger `scrub` on hero bg or section bgs |
| **Horizontal scroll section** | One section scrolls horizontally | — | GSAP ScrollTrigger horizontal + fixed viewport section |
| **Scroll progress** | Bar or line that fills with scroll | — | ScrollTrigger `scrub` on a progress bar; update width/scale |
| **Hide nav on scroll down, show on scroll up** | Nav hides when scrolling down | — | Track scroll direction; add `translateY(-100%)` / `translateY(0)` with transition |
| **Sticky sections / full-screen panels** | Each section is 100vh, snap or scroll through | — | CSS `scroll-snap` or GSAP ScrollTrigger pin + snap |

**Files to touch:** `SmoothScrollWrapper.tsx`, `gsapLocomotive.ts`, `scrollReveal3D.ts`, section components, `globals.css`.

---

## 2. Animations & motion

| Idea | Description | In this project | How to add |
|------|-------------|-----------------|------------|
| **Staggered entrance** | Children animate in with delay | ✅ Hero, Benefits (Framer Motion) | Reuse `staggerChildren` + variants on more sections |
| **3D scroll reveal** | Section enters with rotateX/Y + opacity | ✅ `data-3d-reveal` | Add to Mission, FAQ, Departments, etc. |
| **3D mouse tilt** | Card/media tilts with mouse | ✅ Hero video | Reuse on feature cards (Framer `useMotionValue` + `useSpring`) |
| **Page transition** | Route change animates (slide/fade) | ✅ `PageTransition` directional slide | — |
| **Micro-interactions** | Button hover scale, icon bounce | ✅ Buttons, some cards | Extend: magnetic hover, ripple on click |
| **Text reveal (word/line)** | Headline reveals word by word or line by line | — | GSAP SplitText (plugin) or Framer Motion stagger on wrapped words |
| **Number / counter animation** | Stats count up when in view | ✅ Hero stats (NewHomeHeroDocumented) | Reuse on other stats blocks |
| **SVG draw on scroll** | Path draws in when visible | §10 DESIGN_LIBRARIES | Add to icons or decorative SVGs |

**Libraries:** GSAP, ScrollTrigger, Framer Motion (already in use). Optional: GSAP SplitText for text reveal.

---

## 3. Headers, nav & UI chrome

| Idea | Description | In this project | How to add |
|------|-------------|-----------------|------------|
| **Floating pill nav** | Rounded, centered, gradient bar | ✅ Header | — |
| **Glass nav** | Backdrop blur, semi-transparent | ✅ TopBar, Header | — |
| **Mega menu / dropdown** | Rich dropdowns with images or links | — | Add dropdown panels to nav links (e.g. Patients, Physicians) |
| **Minimal header** | Logo + one CTA, rest in hamburger | — | Optional mobile-first variant |
| **Scroll-aware header** | Shrinks or changes style after hero | ✅ Header height change | Optional: color or blur change on scroll |
| **Sticky CTA** | Floating “Find a Practice” / “Join” | ✅ FloatingCTA | Optional: hide on scroll down, show on scroll up |

**Files:** `Header.tsx`, `TopBar.tsx`, `FloatingCTA.tsx`.

---

## 4. Typography

| Idea | Description | In this project | How to add |
|------|-------------|-----------------|------------|
| **Large display headlines** | Big, bold hero and section titles | ✅ Hero, some sections | Increase size on key pages; consider a display font |
| **Variable font** | One font with weight/width axis | — | Pick a variable font for headings; use in CSS |
| **Mono / accent font** | Secondary font for labels, numbers | — | Add a mono or geometric font for “01”, “02”, labels |
| **Text gradient** | Headline with gradient fill | §11 DESIGN_LIBRARIES (shimmer) | Apply to one hero line or section title |
| **Letter-spacing / tracking** | Tight headlines, wide labels | ✅ Some use of `tracking-tight`, `uppercase` | Use consistently: tight for titles, wide for overlines |
| **Line clamp / truncation** | Limit lines with ellipsis | — | Use `line-clamp-2` etc. where needed |

**Files:** `globals.css`, Tailwind config, any component with `<h1>`/`<h2>`.

---

## 5. Cards, lists & content blocks

| Idea | Description | In this project | How to add |
|------|-------------|-----------------|------------|
| **Accent bar (left/top)** | Colored stripe on card | ✅ BenefitsJumbledGrid | Reuse on other card components |
| **Numbered items (01, 02)** | Editorial numbering | ✅ Benefits | Reuse on steps, features, team |
| **Hover lift + shadow** | Card moves up and shadow grows | ✅ Benefits, some buttons | Apply to all cards site-wide |
| **Glass card** | `backdrop-blur` + border | ✅ Some cards | Use on overlays, modals, nav |
| **Bento / asymmetric grid** | Mixed card sizes | — | Use grid with `col-span-2`, `row-span-2` on key cards |
| **Magnetic button** | CTA moves slightly toward cursor | — | Framer Motion: `useMotionValue`, `useTransform`, `x`/`y` from mouse |
| **Image zoom on hover** | Image scales gently inside card | — | `overflow-hidden` + `scale-105` on hover |

**Files:** `BenefitsJumbledGrid.tsx`, other card/list components, shared Card styles in `globals.css`.

---

## 6. Loading & transitions

| Idea | Description | In this project | How to add |
|------|-------------|-----------------|------------|
| **Full-screen loader** | Logo or animation before content | ✅ LoadingScreen | — |
| **Loader → content crossfade** | No hard cut | ✅ `onExitStart` + class-based transition | — |
| **Route transition** | Directional slide between pages | ✅ PageTransition | — |
| **Section transition** | Animate out current, animate in next | — | GSAP timeline on section change (e.g. full-page sections) |
| **Skeleton loading** | Placeholder blocks while data loads | — | Add skeleton components for lists/cards |

**Files:** `LoadingScreen.tsx`, `LoadingScreenWrapper.tsx`, `PageTransition.tsx`.

---

## 7. Cursor & interaction

| Idea | Description | In this project | How to add |
|------|-------------|-----------------|------------|
| **Custom cursor** | Circle or dot following mouse | ✅ HandCursor | — |
| **Cursor change on hover** | Scale or style over buttons/links | — | HandCursor could accept “hover” state from context |
| **Click ripple** | Ripple on click | §6 DESIGN_LIBRARIES | Ensure ripple is wired to cursor component |
| **Magnetic elements** | Buttons/links pull cursor slightly | — | Framer Motion + mouse position |

**Files:** `HandCursor.tsx`, `globals.css` (cursor styles).

---

## 8. Visual effects (gradients, 3D, texture)

| Idea | Description | In this project | How to add |
|------|-------------|-----------------|------------|
| **Gradient backgrounds** | Section or page gradients | ✅ Body band, Benefits, main | Add to more sections (e.g. Mission, FAQ) |
| **Gradient mesh / blobs** | Soft colored shapes for depth | ✅ Benefits blobs | Reuse on hero, footer, other sections |
| **Noise / grain overlay** | Subtle texture | — | Fixed overlay with `opacity: 0.03` noise image or CSS |
| **3D perspective** | Sections with slight rotateX on scroll | ✅ `data-3d-reveal` | Add `transformPerspective` to more reveals |
| **Shadow with color** | Teal/blue tinted shadow | ✅ Some buttons, cards | Use `shadow-brand-teal/20` etc. on hover |
| **Border gradient** | Border uses gradient | — | `border-image` or pseudo-element with gradient |

**Files:** `globals.css`, section components.

---

## 9. Implementation checklist

Use this to track what’s done and what to do next. Check off as you implement.

### Scrolling & layout
- [x] Smooth scroll (Locomotive)
- [x] Scroll reveal (GSAP + data attributes)
- [x] 3D scroll reveal (data-3d-reveal)
- [ ] Parallax on hero or section backgrounds
- [ ] Horizontal scroll section (one section)
- [ ] Scroll progress indicator
- [ ] Nav hide on scroll down / show on scroll up

### Animations
- [x] Staggered entrances (Framer Motion)
- [x] 3D mouse tilt (hero)
- [x] Page transition (directional)
- [x] Loading screen + crossfade
- [ ] Text reveal (word/line) on one headline
- [ ] 3D tilt on feature cards (optional)
- [ ] Magnetic hover on primary CTAs

### UI chrome
- [x] Floating pill nav
- [x] Glass TopBar
- [x] Sticky floating CTAs
- [ ] Scroll-aware header (color/blur change)
- [ ] Mega menu or dropdowns (optional)

### Typography
- [x] Large hero headline
- [x] Uppercase labels / tracking
- [ ] Display or variable font for headings (optional)
- [ ] Gradient text on one headline (optional)

### Cards & content
- [x] Accent bar on cards (Benefits)
- [x] Numbered items (01, 02)
- [x] Hover lift + shadow on cards
- [ ] Apply same card style to other sections
- [ ] Bento grid on one page (optional)
- [ ] Image zoom on hover (optional)

### Visual effects
- [x] Section gradients
- [x] Soft blobs
- [x] Colored shadows on hover
- [ ] Noise overlay (optional)
- [ ] Border gradient on one component (optional)

---

**Summary:** The codebase already covers smooth scroll, 3D reveal, hero tilt, staggered motion, directional page transition, loading screen, glass nav, and upgraded cards. Next high-impact adds: **parallax**, **scroll progress**, **text reveal** on one headline, **magnetic CTA**, and reusing the **card style** (accent bar + number + hover) on more sections. Use [Awwwards](https://www.awwwards.com/) for inspiration; implement with GSAP, Framer Motion, and Locomotive as in `DESIGN_LIBRARIES_AND_CODE.md`.
