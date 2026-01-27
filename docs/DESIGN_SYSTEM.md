# Design System Documentation

## Overview

This document outlines the complete design system for the Alliance of Independent Physicians platform. The design system creates a cohesive, colorful, professional, sleek, modern, interactive, and animated experience throughout the entire application.

## Table of Contents

1. [Background Skin System](#background-skin-system)
2. [Animation System](#animation-system)
3. [Color System](#color-system)
4. [Typography System](#typography-system)
5. [Card Styling Standards](#card-styling-standards)
6. [Section Animation Patterns](#section-animation-patterns)
7. [Usage Guidelines](#usage-guidelines)
8. [Component Patterns](#component-patterns)

---

## Background Skin System

**Location**: `src/app/globals.css` (lines 656-794)

The project uses a layered background skin system with 8 distinct skins. Each skin creates visual distinction between sections and maintains a professional medical aesthetic.

### Skin Classes

#### 1. `.skin-hero` - Dark Gradient Hero Section

**Use Case**: Hero sections, landing page headers

**Characteristics**:
- Deep gradient from dark slate-blue (#1A2E3A) to darker teal (#1E3A47)
- Multiple radial gradient orbs positioned strategically (20% 30%, 80% 70%, 50% 50%)
- Vignette effect overlay for depth
- White text for optimal contrast
- Video background support with opacity overlay

**Implementation**:
```css
.skin-hero {
  position: relative;
  background: 
    radial-gradient(circle at 20% 30%, rgba(46, 196, 182, 0.15) 0%, transparent 50%),
    radial-gradient(circle at 80% 70%, rgba(26, 75, 127, 0.2) 0%, transparent 50%),
    radial-gradient(circle at 50% 50%, rgba(46, 196, 182, 0.1) 0%, transparent 60%),
    linear-gradient(135deg, var(--skin-hero-dark) 0%, var(--skin-hero-teal) 100%);
  color: white;
}
```

#### 2. `.skin-paper` - Warm Off-White Background

**Use Case**: Content sections, mission statements, FAQ sections

**Characteristics**:
- Base: Warm off-white (#FAF9F6)
- Radial gradient vignette (darker edges, lighter center)
- Thin top border (1px, subtle gray at 5% opacity)
- Creates a warm, inviting feel

**Implementation**:
```css
.skin-paper {
  background: 
    radial-gradient(ellipse at center, rgba(255, 255, 255, 0.8) 0%, var(--skin-paper) 100%),
    var(--skin-paper);
  border-top: 1px solid rgba(0, 0, 0, 0.05);
}
```

#### 3. `.skin-slate` - Light Slate/Blue-Gray Wash

**Use Case**: News sections, article listings, informational sections

**Characteristics**:
- Base: Light slate (#F5F7FA)
- Diagonal gradient overlay (brand colors at 3% opacity)
- Top border (2px, brand-teal at 20% opacity)
- Clean, modern appearance

**Implementation**:
```css
.skin-slate {
  background: 
    linear-gradient(135deg, rgba(26, 75, 127, 0.03) 0%, rgba(46, 196, 182, 0.03) 100%),
    var(--skin-slate);
  border-top: 2px solid rgba(46, 196, 182, 0.2);
}
```

#### 4. `.skin-gridline` - Grid Pattern Background

**Use Case**: Departments, structured content sections

**Characteristics**:
- Very light background (#FEFEFE)
- CSS repeating-linear-gradient for gridlines
- Grid opacity ~3-5% (subtle but visible)
- Clinical/structured feel

**Implementation**:
```css
.skin-gridline {
  background: 
    repeating-linear-gradient(0deg, transparent, transparent 39px, rgba(0, 0, 0, 0.03) 39px, rgba(0, 0, 0, 0.03) 40px),
    repeating-linear-gradient(90deg, transparent, transparent 39px, rgba(0, 0, 0, 0.03) 39px, rgba(0, 0, 0, 0.03) 40px),
    var(--skin-gridline);
}
```

#### 5. `.skin-tint` - Brand-Tinted Background

**Use Case**: Featured sections, highlighted content

**Characteristics**:
- Base: Brand-tinted (#F0F7F8)
- Radial highlight in top-right corner (brand-teal at 8% opacity)
- Subtle gradient overlay (brand colors at 4% opacity)
- Adds brand presence without overwhelming content

**Implementation**:
```css
.skin-tint {
  background: 
    radial-gradient(ellipse at top right, rgba(46, 196, 182, 0.08) 0%, transparent 60%),
    linear-gradient(135deg, rgba(46, 196, 182, 0.04) 0%, rgba(26, 75, 127, 0.04) 100%),
    var(--skin-tint-base);
}
```

#### 6. `.skin-mission-enhanced` - Enhanced Mission Background

**Use Case**: Mission statements, important content sections

**Characteristics**:
- Warm gradient from cream (#F8F6F2) to beige (#F5F3EF)
- Diagonal stripe pattern (2-3% opacity)
- Medical crosshair pattern overlay (very subtle, 1.5% opacity)
- Radial vignette for depth
- Gradient top border (brand-teal to transparent)

**Implementation**:
```css
.skin-mission-enhanced {
  background: 
    repeating-linear-gradient(45deg, transparent, transparent 98px, rgba(46, 196, 182, 0.015) 98px, rgba(46, 196, 182, 0.015) 100px),
    repeating-linear-gradient(-45deg, transparent, transparent 98px, rgba(46, 196, 182, 0.015) 98px, rgba(46, 196, 182, 0.015) 100px),
    repeating-linear-gradient(135deg, transparent, transparent 20px, rgba(0, 0, 0, 0.02) 20px, rgba(0, 0, 0, 0.02) 21px),
    radial-gradient(ellipse at center, rgba(255, 255, 255, 0.9) 0%, rgba(248, 246, 242, 0.95) 50%, #F5F3EF 100%),
    linear-gradient(180deg, #F8F6F2 0%, #F5F3EF 100%);
  border-top: 2px solid;
  border-image: linear-gradient(90deg, var(--brand-teal) 0%, transparent 100%) 1;
}
```

#### 7. `.skin-benefits-enhanced` - Enhanced Benefits Background

**Use Case**: Benefits sections, feature highlights

**Characteristics**:
- Soft gradient from teal-tinted white (#F0F7F8) to pale blue (#F5F9FA)
- Circular dot pattern (3-4% opacity)
- Diagonal gradient overlay (brand colors at 5% opacity)
- Radial highlight in top-right corner
- Top border (2px, brand-teal at 30% opacity)

**Implementation**:
```css
.skin-benefits-enhanced {
  background: 
    radial-gradient(circle at 2px 2px, rgba(46, 196, 182, 0.04) 1px, transparent 0),
    linear-gradient(0deg, transparent 24px, rgba(46, 196, 182, 0.03) 25px, rgba(46, 196, 182, 0.03) 26px, transparent 27px, transparent 50px),
    linear-gradient(135deg, rgba(46, 196, 182, 0.05) 0%, rgba(26, 75, 127, 0.05) 100%),
    radial-gradient(ellipse at top right, rgba(46, 196, 182, 0.08) 0%, transparent 60%),
    linear-gradient(180deg, #F0F7F8 0%, #F5F9FA 100%);
  border-top: 2px solid rgba(46, 196, 182, 0.3);
}
```

#### 8. `.skin-footer` - Dark Footer Background

**Use Case**: Footer sections

**Characteristics**:
- Darker slate (#2C3E50)
- Subtle gradient for depth
- Top border for separation (white at 10% opacity)
- White text for contrast

**Implementation**:
```css
.skin-footer {
  background: 
    linear-gradient(180deg, rgba(0, 0, 0, 0.1) 0%, transparent 100%),
    var(--skin-footer-dark);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  color: white;
}
```

---

## Animation System

**Location**: `src/app/globals.css` (lines 150-550, 800-890)

### Animation Keyframes

#### Scroll-Triggered Animations

**`fadeInScale`** - Fade in with scale
- From: opacity 0, scale 0.95
- To: opacity 1, scale 1.0
- Use: General content reveal

**`slideInFromLeft`** - Slide in from left
- From: opacity 0, translateX(-50px)
- To: opacity 1, translateX(0)
- Use: Left-aligned content

**`slideInFromRight`** - Slide in from right
- From: opacity 0, translateX(50px)
- To: opacity 1, translateX(0)
- Use: Right-aligned content, horizontal scrolling cards

**`rotateIn`** - Rotate in with scale
- From: opacity 0, rotate(-180deg), scale(0.8)
- To: opacity 1, rotate(0deg), scale(1)
- Use: Icons, decorative elements

#### Continuous Animations

**`pulse`** - Subtle pulse effect
- 0%, 100%: opacity 1, scale 1
- 50%: opacity 0.8, scale 1.05
- Use: CTAs, active indicators

**`float`** - Gentle floating
- 0%, 100%: translateY(0px)
- 50%: translateY(-10px)
- Use: Icons, decorative elements

**`glow`** - Glowing effect
- 0%, 100%: box-shadow subtle
- 50%: box-shadow enhanced
- Use: Buttons, interactive elements

#### Interactive Animations

**`cardFlip`** - 3D card flip
- Perspective-based rotation
- Use: Card hover effects

**`magneticPull`** - Magnetic cursor following
- CSS custom properties for dynamic positioning
- Use: Interactive cards

**`drawLine`** - Line drawing
- stroke-dashoffset animation
- Use: Connector lines, progress indicators

**`countUp`** - Number counting
- Opacity and translateY animation
- Use: Statistics, counters

### Animation Utility Classes

#### Scroll-Triggered Utilities

- `.animate-fade-in-scale` - Fade in with scale animation
- `.animate-slide-in-left` - Slide in from left
- `.animate-slide-in-right` - Slide in from right
- `.animate-rotate-in` - Rotate in animation

#### Continuous Utilities

- `.animate-pulse-subtle` - Subtle pulse (2s infinite)
- `.animate-float` - Floating animation (3s infinite)
- `.animate-glow` - Glow effect (2s infinite)

### Hover Effects

#### `.hover-lift`
- Default: Normal position
- Hover: translateY(-6px) with enhanced shadow
- Use: Cards, interactive elements

#### `.hover-glow`
- Default: Normal border
- Hover: Border glow with brand-teal
- Use: Cards, buttons

#### `.hover-rotate`
- Default: Normal rotation
- Hover: rotate(360deg)
- Use: Icons, decorative elements

#### `.hover-scale`
- Default: scale(1)
- Hover: scale(1.05)
- Use: Buttons, icons

### Animation Best Practices

1. **Always respect `prefers-reduced-motion`**
   ```tsx
   const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
   useEffect(() => {
     const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
     setPrefersReducedMotion(mediaQuery.matches);
   }, []);
   ```

2. **Use IntersectionObserver for scroll-triggered animations**
   ```tsx
   useEffect(() => {
     const observer = new IntersectionObserver(
       ([entry]) => {
         if (entry.isIntersecting) setIsVisible(true);
       },
       { threshold: 0.15 }
     );
     if (sectionRef.current) observer.observe(sectionRef.current);
     return () => observer.disconnect();
   }, []);
   ```

3. **Stagger animations for children**
   - Use delays: 100-150ms between items
   - Creates smooth sequential reveal

4. **Use CSS transforms for performance**
   - Prefer `transform` over `position` changes
   - Use `will-change` sparingly

---

## Color System

**Location**: `src/app/globals.css` (lines 6-63)

### Brand Colors

- **Brand Teal**: `#2EC4B6` (`--brand-teal`)
  - Primary brand color
  - Use: CTAs, highlights, accents, links

- **Brand Dark Blue**: `#1A4B7F` (`--brand-dark-blue`)
  - Secondary brand color
  - Use: Headings, important text, navigation

- **Brand Dark Blue Alt**: `#2C4060` (`--brand-dark-blue-alt`)
  - Alternative dark blue
  - Use: Secondary elements, borders

### Skin Base Colors

- `--skin-paper`: `#FAF9F6` - Warm off-white
- `--skin-slate`: `#F5F7FA` - Light slate/blue-gray
- `--skin-gridline`: `#FEFEFE` - Very light background
- `--skin-tint-base`: `#F0F7F8` - Brand-tinted white
- `--skin-hero-dark`: `#1A2E3A` - Dark slate-blue
- `--skin-hero-teal`: `#1E3A47` - Darker teal
- `--skin-footer-dark`: `#2C3E50` - Darker slate

### Color Usage Guidelines

1. **Primary Actions**: Use brand-teal
2. **Headings**: Use brand-dark-blue
3. **Backgrounds**: Use skin classes, not raw colors
4. **Accents**: Use brand colors at low opacity (5-10%)
5. **States**:
   - Success: Green variants
   - Warning: Yellow/Orange variants
   - Error: Red variants
   - Info: Brand-teal variants

---

## Typography System

**Location**: `src/app/globals.css` (lines 75-99)

### Heading Scale

- **H1**: `text-3xl md:text-4xl lg:text-5xl xl:text-6xl`
  - Max size: 60px (xl breakpoint)
  - Use: Page titles, hero headings

- **H2**: `text-3xl md:text-4xl lg:text-3xl`
  - Max size: 32px (reduced from 48px)
  - Use: Section headings

- **H3**: `text-2xl md:text-3xl lg:text-4xl`
  - Max size: 36px
  - Use: Subsection headings

- **H4**: `text-xl md:text-2xl`
  - Max size: 24px
  - Use: Card titles, small headings

### Utility Classes

- **`.eyebrow-label`**: Small uppercase label
  - `text-xs md:text-sm font-semibold uppercase tracking-wider text-brand-teal`
  - Letter spacing: 0.1em
  - Use: Section labels, category tags

### Typography Best Practices

1. **Maintain hierarchy**: Use appropriate heading levels
2. **Limit H2 size**: Maximum 32px for readability
3. **Use eyebrow labels**: Add sophistication to sections
4. **Consistent line-height**: 1.2-1.4 for headings, 1.7 for body

---

## Card Styling Standards

### Standard Card Properties

- **Padding**: `p-5` or `p-6` (20-24px, not larger)
- **Border Radius**: `rounded-xl` or `rounded-2xl` (16-18px)
- **Border**: `border-2 border-transparent` with hover state
- **Shadow**: `shadow-lg` or `shadow-xl`
- **Hover Lift**: `hover:-translate-y-1` or `hover:-translate-y-2` (maximum)

### Card Classes

```tsx
<Card className="h-full transition-all duration-300 border-2 border-transparent bg-white hover:border-brand-teal/30 hover:shadow-lg focus-ring hover-lift">
  <CardContent className="p-6">
    {/* Content */}
  </CardContent>
</Card>
```

### Card Animation Pattern

```tsx
style={{
  opacity: isVisible ? 1 : 0,
  transform: isVisible && !prefersReducedMotion
    ? 'translateY(0) scale(1)' 
    : 'translateY(30px) scale(0.95)',
  transition: prefersReducedMotion
    ? `opacity 0.3s ease ${delay}ms`
    : `opacity 0.7s ease-out ${delay}ms, transform 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) ${delay}ms`,
}}
```

---

## Section Animation Patterns

### Standard Section Pattern

Every section should follow this pattern:

1. **IntersectionObserver Setup**
   ```tsx
   const [isVisible, setIsVisible] = useState(false);
   const sectionRef = useRef<HTMLElement>(null);
   
   useEffect(() => {
     const observer = new IntersectionObserver(
       ([entry]) => {
         if (entry.isIntersecting) {
           setIsVisible(true);
           observer.disconnect();
         }
       },
       { threshold: 0.15 }
     );
     if (sectionRef.current) observer.observe(sectionRef.current);
     return () => observer.disconnect();
   }, []);
   ```

2. **Section Wrapper**
   ```tsx
   <section 
     ref={sectionRef} 
     className="py-16 md:py-24 relative skin-[skin-name] overflow-hidden"
   >
   ```

3. **Header Animation**
   ```tsx
   <h2 
     style={{
       opacity: isVisible ? 1 : 0,
       transform: isVisible && !prefersReducedMotion ? 'translateY(0)' : 'translateY(20px)',
       transition: prefersReducedMotion 
         ? 'opacity 0.3s ease' 
         : 'opacity 0.6s ease-out 0.2s, transform 0.6s ease-out 0.2s',
     }}
   >
   ```

4. **Staggered Children**
   ```tsx
   {items.map((item, index) => {
     const delay = prefersReducedMotion ? 0 : index * 100;
     return (
       <Card style={{
         opacity: isVisible ? 1 : 0,
         transform: isVisible && !prefersReducedMotion ? 'translateY(0)' : 'translateY(20px)',
         transition: prefersReducedMotion
           ? `opacity 0.3s ease ${delay}ms`
           : `opacity 0.7s ease-out ${delay}ms, transform 0.7s ease-out ${delay}ms`,
       }}>
       </Card>
     );
   })}
   ```

---

## Usage Guidelines

### When to Use Each Skin

- **`.skin-hero`**: Landing page heroes, important announcements
- **`.skin-paper`**: Content sections, mission statements, FAQs
- **`.skin-slate`**: News sections, article listings, informational content
- **`.skin-gridline`**: Structured content, departments, data-heavy sections
- **`.skin-tint`**: Featured content, highlighted sections
- **`.skin-mission-enhanced`**: Mission statements, important messages
- **`.skin-benefits-enhanced`**: Benefits sections, feature highlights
- **`.skin-footer`**: Footer sections only

### Animation Guidelines

1. **Scroll-triggered**: Use for content that appears on scroll
2. **Hover effects**: Use for interactive elements
3. **Continuous**: Use sparingly for attention-grabbing elements
4. **Stagger**: Use for lists, grids, card collections
5. **Respect motion preferences**: Always check `prefers-reduced-motion`

### Color Enhancement Strategy

1. **Use brand colors prominently** in CTAs and highlights
2. **Add accent colors** to interactive elements
3. **Use gradients** for hero sections
4. **Enhance badges** with colorful variants
5. **Use color** to indicate states (success, warning, error, info)

---

## Component Patterns

### Hero Component Pattern

```tsx
<section className="relative w-full h-[600px] md:h-[700px] overflow-hidden skin-hero">
  {/* Video/Image Background */}
  <div className="absolute inset-0 z-0">
    {/* Background content */}
  </div>
  
  {/* Content */}
  <div className="relative z-10 container mx-auto px-4 md:px-6 h-full flex items-center">
    {/* Hero content with animations */}
  </div>
</section>
```

### Section Component Pattern

```tsx
<section 
  ref={sectionRef} 
  className="py-16 md:py-24 relative skin-[skin-name] overflow-hidden"
>
  <div className="container mx-auto px-4 md:px-6 relative z-10">
    {/* Section content with animations */}
  </div>
</section>
```

### Card Grid Pattern

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {items.map((item, index) => {
    const delay = prefersReducedMotion ? 0 : index * 100;
    return (
      <Card
        className="h-full hover-lift"
        style={{
          opacity: isVisible ? 1 : 0,
          transform: isVisible && !prefersReducedMotion
            ? 'translateY(0) scale(1)' 
            : 'translateY(30px) scale(0.95)',
          transition: prefersReducedMotion
            ? `opacity 0.3s ease ${delay}ms`
            : `opacity 0.7s ease-out ${delay}ms, transform 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) ${delay}ms`,
        }}
      >
        {/* Card content */}
      </Card>
    );
  })}
</div>
```

---

## Implementation Checklist

When applying the design system to a new page:

- [ ] Apply appropriate skin class to main container
- [ ] Add IntersectionObserver for scroll animations
- [ ] Implement staggered animations for child elements
- [ ] Add hover effects to interactive elements
- [ ] Use consistent card styling
- [ ] Apply typography scale correctly
- [ ] Use brand colors for CTAs and highlights
- [ ] Respect `prefers-reduced-motion`
- [ ] Test animations on mobile devices
- [ ] Ensure WCAG AA contrast ratios
- [ ] Verify 60fps performance

---

## Examples

### Example: Section with Enhanced Background

```tsx
<section 
  ref={sectionRef} 
  className="py-16 md:py-24 relative skin-benefits-enhanced overflow-hidden"
>
  <div className="container mx-auto px-4 md:px-6 relative z-10">
    <h2 className="text-3xl md:text-4xl lg:text-3xl font-bold mb-8 text-brand-dark-blue">
      Section Title
    </h2>
    {/* Content */}
  </div>
</section>
```

### Example: Animated Card Grid

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {items.map((item, index) => (
    <Card
      key={item.id}
      className="h-full hover-lift"
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible && !prefersReducedMotion
          ? 'translateY(0) scale(1)' 
          : 'translateY(30px) scale(0.95)',
        transition: prefersReducedMotion
          ? `opacity 0.3s ease ${index * 100}ms`
          : `opacity 0.7s ease-out ${index * 100}ms, transform 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) ${index * 100}ms`,
      }}
    >
      <CardContent className="p-6">
        {/* Card content */}
      </CardContent>
    </Card>
  ))}
</div>
```

---

## Maintenance

- Keep design system documentation updated
- Document new utility classes as they're added
- Maintain consistency across all pages
- Review and update color palette as needed
- Test animations on various devices and browsers
