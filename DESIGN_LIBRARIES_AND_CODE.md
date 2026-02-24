# Design Libraries & Code – UI/UX Resource

This document lists **all design-related libraries** and **copy-paste-ready code** used in this site: smooth scroll, scroll reveal, page transitions, loading screen, glassmorphism, cursor-following circle, parallax, GSAP animations, and more. Use it as a reference when redesigning or building another website.

---

## Table of Contents

1. [NPM dependencies (design & animation)](#1-npm-dependencies-design--animation)
2. [Locomotive Scroll (smooth scroll)](#2-locomotive-scroll-smooth-scroll)
3. [GSAP + ScrollTrigger (scroll reveal & triggers)](#3-gsap--scrolltrigger-scroll-reveal--triggers)
4. [Page transition (route change)](#4-page-transition-route-change)
5. [Loading page (loader)](#5-loading-page-loader)
6. [Cursor-following circle + click ripple](#6-cursor-following-circle--click-ripple)
7. [Glassmorphism](#7-glassmorphism)
8. [Parallax & scroll-linked effects](#8-parallax--scroll-linked-effects)
9. [Poppr-style animations (initAllAnimations)](#9-poppr-style-animations-initallanimations)
10. [Animated icons & SVG draw](#10-animated-icons--svg-draw)
11. [CSS Keyframes for Scrolling & Animations](#11-css-keyframes-for-scrolling--animations)
12. [Other libraries (Swiper, Three, etc.)](#12-other-libraries-swiper-three-etc)
13. [3D animations (GSAP + Framer Motion)](#13-3d-animations-gsap--framer-motion--implemented)

---

## 1. NPM dependencies (design & animation)

Install these for the features below:

```json
{
  "dependencies": {
    "gsap": "^3.12.5",
    "framer-motion": "^11.x",
    "locomotive-scroll": "^5.0.1",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^7.13.0"
  }
}
```

- **GSAP** – timeline, tweens, ScrollTrigger (scroll-based and 3D scroll reveal). Wired to Locomotive in `src/lib/animations/gsapLocomotive.ts`.
- **Framer Motion** – component 3D (hero tilt, staggered entrances). Used in hero and anywhere declarative 3D is needed.
- **Locomotive Scroll** – smooth scroll (v5 uses Lenis under the hood).

---

## 2. Locomotive Scroll (smooth scroll)

**Library:** `locomotive-scroll` (v5).

**Status:** ✅ **IMPLEMENTED** - Fully integrated with smooth scrolling and scroll reveal animations.

**Setup:** The scroll container is automatically set up via `SmoothScrollWrapper` component in the layout.

**Usage:** Simply add data attributes to any element you want to animate on scroll:

### Scroll Reveal Animations

Add these data attributes to any section or element:

```jsx
// Basic fade in on scroll
<section data-scroll-section>
  <h2>This will fade in when scrolled into view</h2>
</section>

// Fade only
<div data-scroll-fade>Content</div>

// Scale in
<div data-scroll-scale>Content</div>

// Slide from left
<div data-scroll-slide-left>Content</div>

// Slide from right
<div data-scroll-slide-right>Content</div>

// Stagger children (for lists, cards, etc.)
<div data-scroll-stagger>
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</div>
```

**HTML structure (automatically handled):**

```html
<div data-scroll-container>
  <!-- All page content + footer -->
</div>
```

**Current Implementation:**

The Locomotive Scroll is automatically initialized via `SmoothScrollWrapper` component in `src/components/SmoothScrollWrapper.tsx`. It:
- ✅ Enables smooth scrolling on desktop (768px+)
- ✅ Uses native scroll on mobile for better performance
- ✅ Automatically handles scroll reveal animations
- ✅ Updates on route changes
- ✅ Respects `prefers-reduced-motion`

**Features:**
- Smooth scroll with customizable lerp (0.1 = very smooth)
- Automatic scroll reveal using Intersection Observer
- Mobile-friendly (falls back to native scroll)
- Route-aware (resets scroll on navigation)

**CSS (hide default scrollbar so only #main scrolls):**

```css
html, body { overflow: hidden; height: 100%; }
html::-webkit-scrollbar, body::-webkit-scrollbar { display: none; }
html, body { -ms-overflow-style: none; scrollbar-width: none; }
```

**Import Locomotive CSS:**

```javascript
import 'locomotive-scroll/dist/locomotive-scroll.css'
```

---

## 3. GSAP + ScrollTrigger (scroll reveal & triggers)

**Libraries:** `gsap`, `gsap/ScrollTrigger`.

Sections with `data-scroll-section` start hidden and animate in when they enter view. Use the **same scroller** as Locomotive (`#main`).

**CSS – initial state (sections hidden until GSAP runs):**

```css
[data-scroll-section] {
  opacity: 0;
  transform: translateY(72px);
}
```

**JS – scroll reveal (run after DOM + Locomotive ready):**

```javascript
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export function initScrollReveal(mainElement) {
  const scroller = mainElement || document.querySelector('#main')
  if (!scroller) return

  ScrollTrigger.getAll().forEach((t) => {
    if (t.trigger?.hasAttribute?.('data-scroll-section')) t.kill()
  })

  const sections = document.querySelectorAll('[data-scroll-section]')
  if (!sections.length) return

  sections.forEach((section, i) => {
    gsap.to(section, {
      opacity: 1,
      y: 0,
      duration: 1.2,
      delay: 0.12 * i,
      ease: 'power2.out',
      overwrite: 'auto',
      scrollTrigger: {
        trigger: section,
        scroller,
        start: 'top 98%',
        end: 'top 50%',
        toggleActions: 'play none none none',
        once: true,
      },
    })
  })

  ScrollTrigger.refresh()

  const viewportH = window.innerHeight || 800
  sections.forEach((section) => {
    const rect = section.getBoundingClientRect()
    if (rect.top < viewportH * 1.35) gsap.set(section, { opacity: 1, y: 0 })
  })
}
```

**Usage in JSX:** add `data-scroll-section` (and optionally `data-scroll`) to any section you want to reveal:

```jsx
<section id="features" data-scroll data-scroll-section>
  ...
</section>
```

---

## 4. Page transition (route change)

**Libraries:** `react-router-dom`, `gsap`.

On route change: overlay fades in, content switches, overlay fades out. Locomotive is scrolled to top and refreshed after transition.

**Component (PageTransition.jsx):**

```jsx
import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { gsap } from 'gsap'

function PageTransition({ children }) {
  const location = useLocation()
  const [isLoading, setIsLoading] = useState(false)
  const [displayLocation, setDisplayLocation] = useState(location)
  const [transitionStage, setTransitionStage] = useState('entered')

  useEffect(() => {
    if (location.pathname !== displayLocation.pathname) {
      setIsLoading(true)
      setTransitionStage('exiting')
    }
  }, [location.pathname, displayLocation.pathname])

  useEffect(() => {
    if (isLoading) {
      const ls = window.locomotiveScroll
      const lenis = ls?.lenisInstance ?? ls?.LenisInstance
      if (lenis?.scrollTo) lenis.scrollTo(0, { immediate: true })

      const exitTimeline = gsap.timeline({
        onComplete: () => {
          setDisplayLocation(location)
          setTransitionStage('entering')
          setTimeout(() => {
            setIsLoading(false)
            setTimeout(() => {
              const lenis = ls?.lenisInstance ?? ls?.LenisInstance
              if (lenis?.resize) { lenis.resize(); window.ScrollTrigger?.refresh() }
            }, 100)
          }, 50)
        }
      })
      exitTimeline
        .to('.page-transition-overlay', { opacity: 1, duration: 0.4, ease: 'power2.inOut' })
        .to('.page-transition-loader', { scale: 1, opacity: 1, duration: 0.3, ease: 'back.out(1.7)' }, '-=0.2')
    }
  }, [isLoading, location])

  useEffect(() => {
    if (!isLoading && transitionStage === 'entering') {
      const enterTimeline = gsap.timeline({
        onComplete: () => setTransitionStage('entered')
      })
      enterTimeline
        .to('.page-transition-loader', { scale: 0.8, opacity: 0, duration: 0.3, ease: 'power2.in' })
        .to('.page-transition-overlay', { opacity: 0, duration: 0.4, ease: 'power2.out' }, '-=0.2')
        .set('.page-transition-overlay', { opacity: 0, display: 'none' })
    }
  }, [isLoading, transitionStage])

  return (
    <>
      <div
        className="page-transition-overlay fixed inset-0 z-[999999] bg-white pointer-events-none opacity-0"
        style={{
          display: (transitionStage === 'exiting' || transitionStage === 'entering') ? 'block' : 'none',
          pointerEvents: (transitionStage === 'exiting' || transitionStage === 'entering') ? 'auto' : 'none'
        }}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="page-transition-loader transform scale-75 opacity-0 text-center">
            <h3 className="text-6xl font-bold text-cyan-600">Your Brand</h3>
            <div className="w-12 h-8 border-2 border-cyan-600 rounded-full flex items-center justify-center relative mx-auto mt-4">
              <div className="w-2 h-2 bg-cyan-600 rounded-full absolute animate-pulse" />
              <div className="absolute inset-0 border-2 border-cyan-600 rounded-full animate-spin border-t-transparent" />
            </div>
          </div>
        </div>
      </div>
      <div key={displayLocation.pathname} className={`page-content ${transitionStage}`}>
        {children}
      </div>
    </>
  )
}
```

Wrap your router outlet with `<PageTransition>`.

---

## 5. Loading page (loader)

**Library:** `gsap`.

Full-screen loader; on complete it fades out and calls `onComplete` (e.g. to show main content).

**Component (Loader.jsx):**

```jsx
import { useEffect, useState } from 'react'
import { gsap } from 'gsap'

function Loader({ onComplete }) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const loader = document.querySelector('#loader')
    if (!loader) {
      if (onComplete) onComplete()
      return
    }
    const tl = gsap.timeline({
      onComplete: () => {
        setIsVisible(false)
        if (onComplete) onComplete()
      }
    })
    tl.to('#loader', { opacity: 0, duration: 0.8, ease: 'power2.inOut' })
      .to('#loader', { display: 'none', duration: 0 }, '-=0.2')
  }, [onComplete])

  if (!isVisible) return null

  return (
    <div id="loader" className="fixed inset-0 z-[1000000] bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h3 className="text-6xl sm:text-7xl font-bold text-cyan-600 mb-8">Your Brand</h3>
        <div className="w-16 h-12 mx-auto flex items-center justify-center">
          <div className="w-12 h-8 border-2 border-cyan-600 rounded-full flex items-center justify-center">
            <div className="w-2 h-2 bg-cyan-600 rounded-full animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  )
}
```

---

## 6. Cursor-following circle + click ripple

**Libraries:** None (vanilla JS + React + CSS).

Smooth-following ring with lerp; click ripples at cursor. Respect `prefers-reduced-motion`.

**Component (MovingCircle.jsx):**

```jsx
import { useEffect, useRef, useState } from 'react'

function MovingCircle() {
  const ringRef = useRef(null)
  const [clicks, setClicks] = useState([])
  const [mounted, setMounted] = useState(false)
  const targetRef = useRef({ x: 0, y: 0 })
  const currentRef = useRef({ x: 0, y: 0 })
  const rafRef = useRef(null)

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    if (!mounted || !ringRef.current) return
    const ring = ringRef.current
    const initialX = window.innerWidth / 2
    const initialY = window.innerHeight / 2
    targetRef.current = { x: initialX, y: initialY }
    currentRef.current = { x: initialX, y: initialY }
    ring.style.left = `${initialX}px`
    ring.style.top = `${initialY}px`

    const lerp = 0.18
    const onMove = (e) => {
      targetRef.current.x = e.clientX
      targetRef.current.y = e.clientY
    }
    const tick = () => {
      const target = targetRef.current
      const current = currentRef.current
      current.x += (target.x - current.x) * lerp
      current.y += (target.y - current.y) * lerp
      ring.style.left = `${current.x}px`
      ring.style.top = `${current.y}px`
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    window.addEventListener('mousemove', onMove)
    return () => {
      window.removeEventListener('mousemove', onMove)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [mounted])

  useEffect(() => {
    if (!mounted) return
    const handleClick = (e) => {
      setClicks((prev) => [...prev.slice(-4), { x: e.clientX, y: e.clientY, id: Date.now() }])
    }
    window.addEventListener('click', handleClick)
    return () => window.removeEventListener('click', handleClick)
  }, [mounted])

  useEffect(() => {
    if (clicks.length === 0) return
    const t = setTimeout(() => setClicks((prev) => prev.slice(1)), 600)
    return () => clearTimeout(t)
  }, [clicks])

  return (
    <>
      <div
        ref={ringRef}
        className="cursor-ring fixed pointer-events-none"
        style={{ transform: 'translate(-50%, -50%)', zIndex: 999999 }}
        aria-hidden
      />
      {clicks.map(({ x, y, id }) => (
        <div
          key={id}
          className="cursor-click-ripple fixed pointer-events-none"
          style={{ left: x, top: y, transform: 'translate(-50%, -50%)', zIndex: 999998 }}
          aria-hidden
        />
      ))}
    </>
  )
}
```

**CSS:**

```css
.cursor-ring {
  width: 48px;
  height: 48px;
  border: 2px solid #17F1D1;
  border-radius: 50%;
  background: transparent;
  box-shadow: 0 0 20px rgba(23, 241, 209, 0.4);
  will-change: left, top;
}

.cursor-click-ripple {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  border: 2px solid #0891B2;
  background: transparent;
  animation: cursor-click-ripple 0.6s ease-out forwards;
  pointer-events: none;
}

@keyframes cursor-click-ripple {
  0% {
    transform: translate(-50%, -50%) scale(0.5);
    opacity: 1;
    border-width: 3px;
  }
  100% {
    transform: translate(-50%, -50%) scale(4);
    opacity: 0;
    border-width: 1px;
  }
}
```

---

## 7. Glassmorphism

**Library:** None (Tailwind + CSS).

Use semi-transparent background + `backdrop-blur` for a frosted-glass look.

**Tailwind classes (examples):**

```html
<!-- Light glass -->
<div class="bg-white/80 backdrop-blur-xl border border-gray-200 rounded-2xl shadow-xl">

<!-- Dark glass (nav) -->
<div class="bg-gray-900/60 backdrop-blur-3xl border border-white/10 rounded-[2rem]">

<!-- Card overlay -->
<div class="bg-white/95 backdrop-blur-md border border-gray-200/80 rounded-xl">

<!-- Navbar on scroll -->
<nav class="bg-bg-primary/95 backdrop-blur-sm shadow-lg">
```

**Custom shadow for depth:**

```css
box-shadow: 0 8px 32px rgba(0, 0, 0, 0.25);
```

---

## 8. Parallax & scroll-linked effects

**Libraries:** `gsap`, `ScrollTrigger`.

**Footer parallax (element rises + fades in as you scroll to footer):**

```javascript
export function initFooterScroll() {
  const footer = document.querySelector('footer')
  const parallaxCircle = document.querySelector('.parallax-circle')
  const footerContent = document.querySelector('.footer-content')
  if (!footer) return

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: footer,
      scroller: '#main',
      start: 'top 95%',
      end: 'top 25%',
      scrub: 2.2,
    },
  })
  if (parallaxCircle) {
    tl.fromTo(parallaxCircle, { yPercent: 85, opacity: 0 }, { yPercent: 0, opacity: 1, ease: 'none' }, 0)
  }
  if (footerContent) {
    tl.fromTo(footerContent, { y: 60 }, { y: 0, ease: 'none' }, 0.15)
  }
}
```

**CSS for footer “curved” block:**

```css
.footer-cover-parallax {
  min-height: 60vh;
  width: 100%;
  overflow: hidden;
  position: relative;
}

.parallax-circle {
  min-height: 420px;
  width: 100%;
  background-color: var(--color-brand-primary);
  border-radius: 3rem 3rem 0 0;
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}
```

**Hero 3D tilt (mouse-based, not scroll):**

```javascript
export function initMainImageMovement(targetSelector, visualSelector) {
  const visual = document.querySelector(visualSelector)
  const target = document.querySelector(targetSelector)
  if (!visual || !target) return
  target.addEventListener('mousemove', (e) => {
    const rotx = (window.innerWidth / 2 - e.clientX) / 17
    const roty = -(window.innerHeight / 2 - e.clientY) / 10
    visual.style.transform = `rotateX(${rotx}deg) rotateY(${-roty}deg)`
  })
}
```

---

## 9. Poppr-style animations (initAllAnimations)

**Library:** `gsap`, `ScrollTrigger`.

Central list of animations; run after Locomotive is ready. Typically: scroll reveal, nav hide, footer scroll, left-arrow hover, images scroll, image hover, image reveal, etc.

**Skeleton:**

```javascript
export function initAllAnimations(mainElement) {
  if (typeof window === 'undefined') return
  const isMobile = window.innerWidth <= 500

  setTimeout(() => {
    initScrollReveal(mainElement)
    if (isMobile) {
      initLeftArrow()
      initImagesScroll()
      initImageHover()
      initImageReveal()
    } else {
      initNavHide()
      initFooterScroll()
      initLeftArrow()
      initImagesScroll()
      initImageHover()
      initImageReveal()
    }
  }, 500)
}
```

**Examples from this project:**

- **Nav hide/show:** GSAP + ScrollTrigger to hide/show logo on scroll.
- **Left arrow hover:** scale circle, move arrows, change color on hover.
- **Images scroll:** `gsap.to('.images', { scrollTrigger: { trigger: '.images', scroller: '#main', scrub: true }, x: '-60vw' })`.
- **Image hover:** mouseenter/mouseleave to show text, zoom image, change label color.
- **Image reveal:** move reveal-image with cursor; hide on mouseleave.
- **Menu open:** GSAP `.from(menuItems, { opacity: 0, y: -400, stagger: 0.1, duration: 0.8 })`.

---

## 10. Animated icons & SVG draw

**Libraries:** `gsap` (optional), CSS `stroke-dasharray` / `stroke-dashoffset`.

**SVG path draw-in (CSS only):**

```css
.draw-path {
  stroke-dasharray: 120;
  stroke-dashoffset: 120;
  animation: draw-in 1.4s ease-out 0.5s forwards;
}

@keyframes draw-in {
  to { stroke-dashoffset: 0; }
}
```

**Looped draw (draw → hold → reset):**

```css
.draw-path-loop {
  stroke-dasharray: 120;
  stroke-dashoffset: 120;
  animation: draw-loop 2.5s ease-in-out 0.5s infinite;
}

@keyframes draw-loop {
  0%   { stroke-dashoffset: 120; }
  45%  { stroke-dashoffset: 0; }
  55%  { stroke-dashoffset: 0; }
  100% { stroke-dashoffset: 120; }
}
```

**SVG path:** use `pathLength` so dash values are predictable:

```html
<path class="draw-path" pathLength="120" d="M 8 5 Q 25 22 12 38 ..." stroke="url(#gradient)" />
```

**Rainbow stroke (gradient in SVG):**

```html
<defs>
  <linearGradient id="rainbow" x1="0%" y1="0%" x2="100%" y2="100%">
    <stop offset="0%" stop-color="#ef4444" />
    <stop offset="20%" stop-color="#f97316" />
    <stop offset="40%" stop-color="#eab308" />
    <stop offset="60%" stop-color="#22c55e" />
    <stop offset="80%" stop-color="#06b6d4" />
    <stop offset="100%" stop-color="#8b5cf6" />
  </linearGradient>
</defs>
<path stroke="url(#rainbow)" ... />
```

**Spinning icon (e.g. refresh):** `className="animate-spin"` (Tailwind) or `animation: spin 3s linear infinite` with `@keyframes spin { to { transform: rotate(360deg); } }`.

---

## 11. CSS Keyframes for Scrolling & Animations

**Library:** None (Pure CSS + Intersection Observer or ScrollTrigger).

CSS keyframes provide powerful, performant animations that can be triggered by scroll position, element visibility, or user interaction. Combine with Intersection Observer API for scroll-based triggers.

### 11.1 Scroll-Triggered Animations (Intersection Observer)

**React Hook for Scroll Reveal:**

```javascript
import { useEffect, useRef, useState } from 'react'

export function useScrollReveal(options = {}) {
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          if (options.once !== false) observer.unobserve(entry.target)
        }
      },
      {
        threshold: options.threshold || 0.1,
        rootMargin: options.rootMargin || '0px',
      }
    )

    if (ref.current) observer.observe(ref.current)

    return () => {
      if (ref.current) observer.unobserve(ref.current)
    }
  }, [])

  return [ref, isVisible]
}
```

**Usage:**

```jsx
function AnimatedSection() {
  const [ref, isVisible] = useScrollReveal({ threshold: 0.2 })
  
  return (
    <section 
      ref={ref}
      className={`fade-in-up ${isVisible ? 'animate' : ''}`}
    >
      Content here
    </section>
  )
}
```

### 11.2 Essential Scroll Animation Keyframes

**Fade In Up (most common):**

```css
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.fade-in-up {
  opacity: 0;
  transform: translateY(30px);
  transition: opacity 0.6s ease-out, transform 0.6s ease-out;
}

.fade-in-up.animate {
  animation: fadeInUp 0.6s ease-out forwards;
}
```

**Fade In Scale:**

```css
@keyframes fadeInScale {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.fade-in-scale {
  opacity: 0;
  transform: scale(0.9);
  transition: opacity 0.5s ease-out, transform 0.5s ease-out;
}

.fade-in-scale.animate {
  animation: fadeInScale 0.5s ease-out forwards;
}
```

**Slide In Left/Right:**

```css
@keyframes slideInLeft {
  from {
    opacity: 0;
    transform: translateX(-50px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(50px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.slide-in-left {
  opacity: 0;
  transform: translateX(-50px);
}

.slide-in-left.animate {
  animation: slideInLeft 0.7s ease-out forwards;
}

.slide-in-right {
  opacity: 0;
  transform: translateX(50px);
}

.slide-in-right.animate {
  animation: slideInRight 0.7s ease-out forwards;
}
```

**Rotate In:**

```css
@keyframes rotateIn {
  from {
    opacity: 0;
    transform: rotate(-180deg) scale(0.8);
  }
  to {
    opacity: 1;
    transform: rotate(0deg) scale(1);
  }
}

.rotate-in {
  opacity: 0;
  transform: rotate(-180deg) scale(0.8);
}

.rotate-in.animate {
  animation: rotateIn 0.8s ease-out forwards;
}
```

### 11.3 Staggered Animations (Children)

**CSS for staggered reveal:**

```css
.stagger-children > * {
  opacity: 0;
  transform: translateY(20px);
}

.stagger-children.animate > *:nth-child(1) {
  animation: fadeInUp 0.6s ease-out 0.1s forwards;
}

.stagger-children.animate > *:nth-child(2) {
  animation: fadeInUp 0.6s ease-out 0.2s forwards;
}

.stagger-children.animate > *:nth-child(3) {
  animation: fadeInUp 0.6s ease-out 0.3s forwards;
}

/* Or use CSS custom properties for dynamic delay */
.stagger-children.animate > * {
  animation: fadeInUp 0.6s ease-out calc(var(--delay, 0.1s) * var(--index, 1)) forwards;
}
```

**React component with staggered children:**

```jsx
function StaggeredGrid({ items }) {
  const [ref, isVisible] = useScrollReveal()
  
  return (
    <div ref={ref} className={`stagger-children ${isVisible ? 'animate' : ''}`}>
      {items.map((item, index) => (
        <div 
          key={index}
          style={{ '--index': index } as React.CSSProperties}
        >
          {item}
        </div>
      ))}
    </div>
  )
}
```

### 11.4 Scroll-Based Progress Animations

**Progress bar that fills on scroll:**

```css
@keyframes scrollProgress {
  from {
    width: 0%;
  }
  to {
    width: 100%;
  }
}

.scroll-progress {
  position: fixed;
  top: 0;
  left: 0;
  height: 4px;
  background: var(--brand-teal);
  width: 0%;
  z-index: 9999;
  transform-origin: left;
}
```

**JavaScript to update progress:**

```javascript
useEffect(() => {
  const updateProgress = () => {
    const scrollTop = window.scrollY
    const docHeight = document.documentElement.scrollHeight - window.innerHeight
    const progress = (scrollTop / docHeight) * 100
    document.querySelector('.scroll-progress').style.width = `${progress}%`
  }
  
  window.addEventListener('scroll', updateProgress)
  return () => window.removeEventListener('scroll', updateProgress)
}, [])
```

### 11.5 Parallax with CSS Keyframes (Alternative to GSAP)

**Simple parallax on scroll:**

```css
.parallax-element {
  will-change: transform;
  transition: transform 0.1s ease-out;
}
```

**JavaScript parallax:**

```javascript
useEffect(() => {
  const handleScroll = () => {
    const scrolled = window.scrollY
    const parallaxElements = document.querySelectorAll('.parallax-element')
    
    parallaxElements.forEach((el, index) => {
      const speed = 0.5 + (index * 0.1) // Different speeds
      const yPos = -(scrolled * speed)
      el.style.transform = `translateY(${yPos}px)`
    })
  }
  
  window.addEventListener('scroll', handleScroll, { passive: true })
  return () => window.removeEventListener('scroll', handleScroll)
}, [])
```

### 11.6 Hover Animations with Keyframes

**Card lift on hover:**

```css
@keyframes cardLift {
  from {
    transform: translateY(0) scale(1);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }
  to {
    transform: translateY(-8px) scale(1.02);
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
  }
}

.card {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.card:hover {
  animation: cardLift 0.3s ease forwards;
}
```

**Button pulse on hover:**

```css
@keyframes buttonPulse {
  0%, 100% {
    transform: scale(1);
    box-shadow: 0 4px 15px rgba(29, 212, 196, 0.4);
  }
  50% {
    transform: scale(1.05);
    box-shadow: 0 6px 20px rgba(29, 212, 196, 0.6);
  }
}

.button:hover {
  animation: buttonPulse 1s ease-in-out infinite;
}
```

### 11.7 Loading Spinner Keyframes

**Rotating spinner:**

```css
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(29, 212, 196, 0.2);
  border-top-color: var(--brand-teal);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}
```

**Pulsing dots:**

```css
@keyframes pulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.5;
    transform: scale(0.8);
  }
}

.loading-dots span {
  display: inline-block;
  width: 8px;
  height: 8px;
  background: var(--brand-teal);
  border-radius: 50%;
  animation: pulse 1.4s ease-in-out infinite;
}

.loading-dots span:nth-child(2) {
  animation-delay: 0.2s;
}

.loading-dots span:nth-child(3) {
  animation-delay: 0.4s;
}
```

### 11.8 Text Reveal Animations

**Typewriter effect:**

```css
@keyframes typewriter {
  from {
    width: 0;
  }
  to {
    width: 100%;
  }
}

.typewriter {
  overflow: hidden;
  white-space: nowrap;
  border-right: 2px solid var(--brand-teal);
  animation: typewriter 3s steps(40) forwards, blink 0.75s step-end infinite;
}

@keyframes blink {
  from, to {
    border-color: transparent;
  }
  50% {
    border-color: var(--brand-teal);
  }
}
```

**Text fade in word by word:**

```css
@keyframes fadeInWord {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.text-reveal span {
  display: inline-block;
  opacity: 0;
  animation: fadeInWord 0.5s ease-out forwards;
}

.text-reveal span:nth-child(1) { animation-delay: 0.1s; }
.text-reveal span:nth-child(2) { animation-delay: 0.2s; }
.text-reveal span:nth-child(3) { animation-delay: 0.3s; }
/* ... */
```

### 11.9 Scroll-Triggered Counter Animation

**Number counter that animates on scroll:**

```css
@keyframes countUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.counter {
  animation: countUp 0.6s ease-out forwards;
}
```

**JavaScript to animate numbers:**

```javascript
function useCounter(target, duration = 2000) {
  const [count, setCount] = useState(0)
  const [ref, isVisible] = useScrollReveal()
  
  useEffect(() => {
    if (!isVisible) return
    
    let start = 0
    const increment = target / (duration / 16) // 60fps
    const timer = setInterval(() => {
      start += increment
      if (start >= target) {
        setCount(target)
        clearInterval(timer)
      } else {
        setCount(Math.floor(start))
      }
    }, 16)
    
    return () => clearInterval(timer)
  }, [isVisible, target, duration])
  
  return [ref, count]
}
```

### 11.10 Performance Tips

- Use `will-change` sparingly: `will-change: transform;`
- Prefer `transform` and `opacity` for animations (GPU accelerated)
- Use `transform: translateZ(0)` to force GPU acceleration
- Respect `prefers-reduced-motion`:

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

### 11.11 Animation Timeline & Animation Range (Modern CSS Scroll Animations)

**Browser Support:** Chrome 115+, Edge 115+, Safari 17+ (as of 2024)

`animation-timeline` and `animation-range` are modern CSS features that allow scroll-linked animations without JavaScript. They provide native browser support for scroll-triggered animations.

#### Basic Animation Timeline Setup

**Scroll Progress Timeline:**

```css
@keyframes fadeInOnScroll {
  from {
    opacity: 0;
    transform: translateY(50px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.scroll-animated {
  animation: fadeInOnScroll linear;
  animation-timeline: scroll();
  animation-range: entry 0% entry 100%;
}
```

**View Progress Timeline (based on viewport):**

```css
.scroll-animated {
  animation: fadeInOnScroll linear;
  animation-timeline: view();
  animation-range: entry 0% entry 100%;
}
```

#### Animation Range Explained

`animation-range` controls when the animation starts and ends relative to the timeline:

```css
/* Syntax: animation-range: <start> <end>; */

/* Start when element enters viewport, end when fully visible */
animation-range: entry 0% entry 100%;

/* Start 20% into viewport, end when fully visible */
animation-range: entry 20% entry 100%;

/* Start when element enters, end when it exits viewport */
animation-range: entry 0% exit 100%;

/* Start 10% before entry, end 10% after entry */
animation-range: entry -10% entry 110%;

/* Cover entire scroll range */
animation-range: 0% 100%;
```

#### Named Scroll Timeline (More Control)

**HTML setup:**

```html
<div class="scroll-container">
  <div class="scroll-content">
    <div class="animated-element">Content</div>
  </div>
</div>
```

**CSS:**

```css
.scroll-container {
  height: 200vh; /* Container with scroll */
  overflow-y: scroll;
  scroll-timeline: --page-scroll;
}

.animated-element {
  animation: fadeInOnScroll linear;
  animation-timeline: --page-scroll;
  animation-range: 0% 50%; /* Animate during first half of scroll */
}
```

#### Practical Examples

**Fade in as you scroll:**

```css
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.fade-on-scroll {
  animation: fadeIn linear;
  animation-timeline: view();
  animation-range: entry 0% entry 50%;
}
```

**Scale up on scroll:**

```css
@keyframes scaleUp {
  from {
    transform: scale(0.8);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

.scale-on-scroll {
  animation: scaleUp linear;
  animation-timeline: view();
  animation-range: entry 0% entry 100%;
}
```

**Parallax effect with animation-timeline:**

```css
@keyframes parallax {
  from {
    transform: translateY(0);
  }
  to {
    transform: translateY(-100px);
  }
}

.parallax-element {
  animation: parallax linear;
  animation-timeline: scroll();
  animation-range: 0% 100%;
}
```

**Progress bar that fills on scroll:**

```css
@keyframes fillProgress {
  from {
    width: 0%;
  }
  to {
    width: 100%;
  }
}

.progress-bar {
  height: 4px;
  background: var(--brand-teal);
  animation: fillProgress linear;
  animation-timeline: scroll();
  animation-range: 0% 100%;
}
```

**Text reveal on scroll:**

```css
@keyframes revealText {
  from {
    clip-path: inset(0 100% 0 0);
  }
  to {
    clip-path: inset(0 0% 0 0);
  }
}

.text-reveal {
  animation: revealText linear;
  animation-timeline: view();
  animation-range: entry 0% entry 100%;
}
```

**Rotate on scroll:**

```css
@keyframes rotateOnScroll {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.rotating-element {
  animation: rotateOnScroll linear;
  animation-timeline: scroll();
  animation-range: 0% 100%;
}
```

#### Multiple Animations on Same Element

```css
.element {
  /* Fade in */
  animation: fadeIn linear, scaleUp linear;
  animation-timeline: view(), view();
  animation-range: entry 0% entry 50%, entry 50% entry 100%;
}
```

#### Scroll Progress Indicator

```css
@keyframes scrollProgress {
  from {
    transform: scaleX(0);
  }
  to {
    transform: scaleX(1);
  }
}

.scroll-indicator {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 4px;
  background: var(--brand-teal);
  transform-origin: left;
  animation: scrollProgress linear;
  animation-timeline: scroll();
  animation-range: 0% 100%;
  z-index: 9999;
}
```

#### View Timeline with Custom Range

```css
/* Animate when element is 25% visible to 75% visible */
.element {
  animation: fadeIn linear;
  animation-timeline: view();
  animation-range: 25% 75%;
}

/* Animate from entry to exit */
.element {
  animation: fadeIn linear;
  animation-timeline: view();
  animation-range: entry 0% exit 100%;
}
```

#### Combining with Existing Animations

**Fallback for browsers without support:**

```css
.element {
  /* Fallback: use Intersection Observer or GSAP */
  opacity: 0;
  transform: translateY(30px);
  transition: opacity 0.6s ease, transform 0.6s ease;
}

/* Modern browsers: use animation-timeline */
@supports (animation-timeline: scroll()) {
  .element {
    animation: fadeInUp linear;
    animation-timeline: view();
    animation-range: entry 0% entry 100%;
    opacity: 1; /* Reset for animation */
    transform: none;
  }
}
```

#### React Component Example

```jsx
function ScrollAnimated({ children, animation = 'fadeIn' }) {
  return (
    <div 
      className={`scroll-animated ${animation}`}
      style={{
        animationTimeline: 'view()',
        animationRange: 'entry 0% entry 100%',
      }}
    >
      {children}
    </div>
  )
}
```

#### Performance Tips

- Use `will-change: transform` for elements with transform animations
- Prefer `transform` and `opacity` for GPU acceleration
- Limit the number of animated elements on screen
- Use `animation-range` to control when animations run (don't animate off-screen)

#### Browser Compatibility Check

```javascript
// Check if animation-timeline is supported
const supportsAnimationTimeline = CSS.supports('animation-timeline', 'scroll()')

if (supportsAnimationTimeline) {
  // Use native scroll animations
} else {
  // Fallback to Intersection Observer or GSAP
}
```

#### Complete Example: Scroll-Triggered Card Reveal

```css
@keyframes cardReveal {
  from {
    opacity: 0;
    transform: translateY(50px) scale(0.9);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.card {
  animation: cardReveal linear;
  animation-timeline: view();
  animation-range: entry 20% entry 80%;
  /* Stagger delay using CSS custom properties */
  animation-delay: calc(var(--index, 0) * 0.1s);
}
```

```jsx
function CardGrid({ cards }) {
  return (
    <div className="card-grid">
      {cards.map((card, index) => (
        <div 
          key={index}
          className="card"
          style={{ '--index': index } as React.CSSProperties}
        >
          {card.content}
        </div>
      ))}
    </div>
  )
}
```

### 11.12 Combining Keyframes with ScrollTrigger (GSAP Alternative)

**Pure CSS scroll snap with animations:**

```css
.scroll-container {
  scroll-snap-type: y mandatory;
  overflow-y: scroll;
  height: 100vh;
}

.scroll-section {
  scroll-snap-align: start;
  height: 100vh;
  opacity: 0;
  transform: translateY(50px);
  transition: opacity 0.8s ease, transform 0.8s ease;
}

.scroll-section.active {
  opacity: 1;
  transform: translateY(0);
}
```

**JavaScript to detect active section:**

```javascript
useEffect(() => {
  const sections = document.querySelectorAll('.scroll-section')
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active')
        }
      })
    },
    { threshold: 0.5 }
  )
  
  sections.forEach((section) => observer.observe(section))
  return () => sections.forEach((section) => observer.unobserve(section))
}, [])
```

---

## 12. Other libraries (Swiper, Three, etc.)

Used elsewhere in the project (carousels, 3D), not required for the “design resource” features above:

| Package        | Typical use        |
|----------------|--------------------|
| `swiper`       | Carousels / sliders |
| `three`        | 3D scenes          |
| `@theatre/core`| Animation editing  |
| `pixi.js`      | 2D canvas / WebGL   |

---

## 13. 3D animations (GSAP + Framer Motion) – **IMPLEMENTED**

**Libraries:** `gsap` (with ScrollTrigger), `framer-motion`.

This project uses **GSAP + Locomotive Scroll** for scroll-driven 3D and **Framer Motion** for component-level 3D (hero tilt, staggered entrances).

### 13.1 GSAP + Locomotive integration

- **Location:** `src/lib/animations/gsapLocomotive.ts`
- **Setup:** `initGSAPScrollTrigger(scrollContainer, locomotiveInstance)` is called from `SmoothScrollWrapper` after Locomotive is created. ScrollTrigger uses the Lenis scroll position so all scroll-based animations stay in sync with smooth scroll.
- **Usage:** Use `gsap` and `ScrollTrigger` anywhere; default scroller is already the smooth-scroll container.

### 13.2 3D scroll reveal (data attributes)

- **Location:** `src/lib/animations/scrollReveal3D.ts`
- **Init:** `init3DScrollReveals(scrollContainer)` runs after GSAP is wired (from SmoothScrollWrapper).
- **Usage:** Add `data-3d-reveal` to any section or block. Optional attributes:
  - `data-3d-reveal-delay` – delay in seconds (default `0`)
  - `data-3d-reveal-duration` – animation duration (default `0.9`)
  - `data-3d-reveal-y` – starting Y offset in px (default `48`)
  - `data-3d-reveal-rotate-x` – starting rotateX in deg (default `12`)
  - `data-3d-reveal-stagger=".child-selector"` – stagger children (e.g. `.card`, `[data-reveal-item]`)
- **Example:**

```html
<section data-3d-reveal data-3d-reveal-y="40" data-3d-reveal-rotate-x="8">
  ...
</section>
```

### 13.3 Hero 3D mouse-follow tilt (Framer Motion)

- **Location:** `src/components/newhome/NewHomeHeroDocumented.tsx`
- **Pattern:** `useMotionValue` + `useSpring` for smooth 3D rotateX/rotateY from mouse position; applied to the video wrapper with `motion.div` and `style={{ rotateX, rotateY }}`. Respects `prefersReducedMotion`.
- **Reuse:** Wrap any “card” or media block in a ref + mouse handlers and a `motion.div` with `rotateX`/`rotateY` from spring MotionValues.

### 13.4 Staggered 3D entrance (Framer Motion)

- **Pattern:** Parent `motion.div` with `variants` and `staggerChildren`; children with `variants` that set `opacity`, `x`/`y`, `rotateX`/`rotateY`, and optional `filter: 'blur(0px)'` for a premium reveal.
- **Example:** Hero content blocks in `NewHomeHeroDocumented` use `staggerChildren: 0.12` and per-block `rotateY`/`rotateX` for a 3D slide-in.

### 13.5 NPM (already in package.json)

```json
"gsap": "^3.x",
"framer-motion": "^11.x",
"locomotive-scroll": "^5.0.1"
```

---

## 14. Awwwards-style design ideas – roadmap

Reference: [Awwwards – Website Awards & Best Web Design Trends](https://www.awwwards.com/). Use as many of these patterns as possible for award-level polish.

### 14.1 Already in this project

| Awwwards trend / element | Where we have it | Doc section |
|--------------------------|------------------|-------------|
| **Smooth scrolling** | Locomotive Scroll (desktop) | §2 |
| **Scroll-triggered animations** | GSAP ScrollTrigger + data-scroll-section | §3 |
| **3D scroll reveal** | `data-3d-reveal` + stagger | §13.2 |
| **3D hero / mouse tilt** | Hero video tilt (Framer Motion) | §13.3 |
| **Staggered entrances** | Hero, Benefits cards (Framer Motion) | §13.4 |
| **Page transition** | PageTransition (slide + direction) | §4, `PageTransition.tsx` |
| **Loading screen** | LoadingScreen + exit crossfade | §5 |
| **Glassmorphism** | TopBar, nav bar, cards (backdrop-blur) | §7 |
| **Cursor / interaction** | HandCursor, cursor-follow | §6 |
| **Directional nav** | Route order + slide left/right | `PageTransition.tsx` |
| **Floating pill nav** | Header (gradient, rounded, shadow) | §14 (design lib) |
| **Gradients & depth** | Body band, section gradients, blobs | `globals.css`, BenefitsJumbledGrid |

### 14.2 Add next (high impact, low effort)

- **Parallax on scroll:** ScrollTrigger `scrub` on hero or section backgrounds (§8).
- **Magnetic / hover buttons:** Slight move toward cursor on CTA buttons (Framer Motion or GSAP).
- **Text reveal (split line / word):** Stagger words or lines on scroll (GSAP SplitText pattern or Framer Motion).
- **Horizontal scroll section:** One section that scrolls horizontally (GSAP + ScrollTrigger horizontal).
- **Scroll progress indicator:** Thin bar or line that fills on scroll (ScrollTrigger progress).
- **Hover scale + shadow on cards:** Already on Benefits; extend to all cards site-wide.
- **Accent bars / numbers on cards:** Already on Benefits; reuse on other list/card sections.

### 14.3 Add later (more effort)

- **Full-page or section transitions:** Animate out current section, then animate in next (GSAP timeline).
- **Custom cursor that changes per section:** Different cursor style over hero vs content vs CTAs.
- **Scroll-linked color/theme:** Change nav or background tint based on scroll position.
- **3D cards (tilt on hover):** Reuse hero tilt pattern on feature cards.
- **Noise/grain overlay:** Subtle texture on hero or full page for depth.
- **Bold typography scale:** Larger display headlines, variable font or distinct type for headings.

### 14.4 Where to apply (by page/section)

- **Hero:** 3D tilt ✅, parallax, text reveal, scroll cue (arrow or “scroll”).
- **Nav / TopBar:** Glass ✅, maybe hide on scroll down / show on scroll up.
- **Sections:** 3D reveal ✅ on some, parallax backgrounds, horizontal scroll for one “showcase” section.
- **Cards / lists:** Stagger ✅, hover lift ✅, accent bars ✅; add magnetic CTA on primary buttons.
- **Footer:** Parallax or simple fade-in on scroll (§8).
- **Loading:** Already strong; optional: loader morphs into cursor or first section.

See **`AWWWARDS_DESIGN_IDEAS.md`** for a full checklist of design ideas and elements to pull from Awwwards into this project.

---

## Quick checklist for another site

- [ ] Install: `gsap`, `locomotive-scroll`, `react`, `react-router-dom`
- [ ] Layout: `#main` + `[data-scroll-content]`, `useLocomotiveScroll(ref)`, ScrollTrigger proxy
- [ ] Scroll reveal: `[data-scroll-section]` + `initScrollReveal(#main)`
- [ ] Page transition: `PageTransition` wrapper + overlay + GSAP timeline
- [ ] Loader: `Loader` with GSAP timeline + `onComplete`
- [ ] Cursor: `MovingCircle` component + `.cursor-ring` / `.cursor-click-ripple` CSS
- [ ] Glassmorphism: `backdrop-blur-*` + `bg-*/*` in Tailwind
- [ ] Parallax: ScrollTrigger + `scrub` + `fromTo` (e.g. footer)
- [ ] SVG draw: `stroke-dasharray`, `stroke-dashoffset`, `pathLength`, keyframes
- [ ] CSS Keyframes: Scroll reveal, stagger animations, hover effects
- [ ] Intersection Observer: For scroll-triggered animations without GSAP
- [ ] Respect `prefers-reduced-motion` for cursor and heavy animations

This file is a living reference: copy the code you need and adjust class names, colors, and structure to your new project.
