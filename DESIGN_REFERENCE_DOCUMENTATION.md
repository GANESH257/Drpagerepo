# Design Reference Documentation
## Alliance of Independent Physicians - Redesign Reference

**Date:** January 28, 2026  
**Reference Sources:** 
- ipa.care/community design
- United Physicians Association design

---

## Table of Contents
1. [Overview](#overview)
2. [Hero/Banner Section](#hero-banner-section)
3. [For Patients / For Physicians Portal Section](#for-patients--for-physicians-portal-section)
4. [Statistics/Metrics Section](#statistics-metrics-section)
5. [Featured Physicians Section](#featured-physicians-section)
6. [Testimonials/Stories Section](#testimonials-stories-section)
7. [Accreditations & Partnerships](#accreditations--partnerships)
8. [Color Palette](#color-palette)
9. [Typography](#typography)
10. [Component Specifications](#component-specifications)
11. [Layout Patterns](#layout-patterns)

---

## Overview

Both reference designs emphasize a dual-audience approach with clear visual separation between patient-facing and physician-facing content. The designs prioritize:

- **Clear user segmentation** through prominent portal cards
- **Professional yet approachable** aesthetic
- **Trust-building elements** (accreditations, statistics, testimonials)
- **Modern, clean layouts** with rounded corners and soft gradients
- **Human-centered imagery** featuring real medical professionals

---

## Hero/Banner Section

### Design Pattern 1: ipa.care/community

**Layout:**
- Full-width hero banner with large background image
- Overlay text centered on image
- Warm, human-focused imagery (doctor and patient interaction)

**Content:**
- **Primary Heading:** "Where Care Meets Community"
  - Font: Large, elegant serif font
  - Color: Golden/light brown (#D4A574 or similar)
  - Size: Very large, prominent
  
- **Tagline:** "Compassionate Care for Every Life Stage"
  - Font: Smaller sans-serif
  - Color: Dark purple (#4A3A6B or similar)
  - Position: Below primary heading

**Visual Elements:**
- Background image: Smiling woman and doctor holding hands
- Soft blur effect on background
- Professional, comforting indoor environment
- Natural lighting

### Design Pattern 2: United Physicians Association

**Layout:**
- Full-width hero banner with large background image
- Overlay text centered on image
- Professional group imagery

**Content:**
- **Primary Heading:** "United in Care. Dedicated to You."
  - Font: Large white text
  - Color: White (#FFFFFF)
  - Size: Very large, bold
  
- **Description:** "Empowering independent physicians to deliver exceptional, patient-centered healthcare through collaboration, innovation, and trust."
  - Font: Smaller white text
  - Color: White with slight transparency
  - Position: Below primary heading

**Visual Elements:**
- Background image: Four diverse medical professionals (2 women, 2 men) in white coats
- Discussion around light-wood circular table
- Modern hospital/clinic lobby setting
- Large windows with natural light and greenery

---

## For Patients / For Physicians Portal Section

**⚠️ CRITICAL SECTION - This is the key design element to implement**

This section appears **directly below the hero banner** and serves as the primary navigation switch for different user types. Both designs use a **side-by-side card layout** (not a toggle switch) where both options are visible simultaneously.

### Design Pattern 1: ipa.care/community

**Layout:**
- Two equal-width cards positioned side-by-side
- Rounded corners on all cards
- Horizontal layout (50% width each)
- Positioned directly below hero banner with spacing

#### Left Card: "For Physicians"

**Visual Design:**
- **Background:** Soft light purple gradient (#E8E3F0 or similar)
- **Border:** Rounded corners (approximately 12-16px radius)
- **Padding:** Generous padding around content
- **Height:** Tall enough to accommodate content comfortably

**Content Structure:**
1. **Title:** "For Physicians"
   - Font: Smaller, dark font
   - Color: Dark text (#2C2C2C or similar)
   - Position: Centered at top
   - Weight: Medium

2. **Tagline:** "Empower Your Practice. Connect with Peers."
   - Font: Larger, bold sans-serif
   - Color: Dark text (#1A1A1A or similar)
   - Position: Centered below title
   - Weight: Bold
   - Size: Significantly larger than title

3. **CTA Button:** "Explore Membership →"
   - **Style:**
     - Background: Dark purple (#4A3A6B or similar)
     - Text: White (#FFFFFF)
     - Border: Rounded rectangle
     - Border radius: ~8px
     - Padding: Comfortable padding (vertical and horizontal)
   - **Icon:** Small gold/orange arrow (→) pointing right
   - **Position:** Centered at bottom of card
   - **Hover State:** Should have visual feedback (darker shade or slight scale)

#### Right Card: "For Patients"

**Visual Design:**
- **Background:** Soft light beige/cream gradient (#F5F1E8 or similar)
- **Border:** Rounded corners (matching left card)
- **Padding:** Matching left card
- **Height:** Matching left card

**Content Structure:**
1. **Title:** "For Patients"
   - Font: Smaller, dark font
   - Color: Dark text (matching left card)
   - Position: Centered at top
   - Weight: Medium

2. **Tagline:** "Find Your Provider. Experience Excellence."
   - Font: Larger, bold sans-serif
   - Color: Dark text (matching left card)
   - Position: Centered below title
   - Weight: Bold
   - Size: Matching left card tagline

3. **CTA Button:** "Access Care →"
   - **Style:**
     - Background: Light gold/orange (#E8A87C or similar)
     - Text: Dark text (#2C2C2C)
     - Border: Rounded rectangle
     - Border radius: ~8px
     - Padding: Matching left card button
   - **Icon:** Small gold/orange arrow (→) pointing right
   - **Position:** Centered at bottom of card
   - **Hover State:** Should have visual feedback

**Spacing:**
- Gap between cards: Moderate spacing (16-24px)
- Margin from hero banner: Generous spacing (48-64px)
- Responsive: Cards stack vertically on mobile

### Design Pattern 2: United Physicians Association

**Layout:**
- Two equal-width cards positioned side-by-side
- Frosted glass effect (backdrop blur)
- Gold borders
- Horizontal layout (50% width each)

#### Left Card: "PROVIDER PORTAL"

**Visual Design:**
- **Background:** Frosted glass effect with slight transparency
- **Border:** Thin gold border (#D4AF37 or similar)
- **Border radius:** Rounded corners
- **Effect:** Backdrop blur for glassmorphism

**Content Structure:**
1. **Icon:** 
   - Dark blue briefcase icon
   - White cross overlay
   - Gold stethoscope icon overlaid
   - Position: Top center or left

2. **Heading:** "PROVIDER PORTAL"
   - Font: Large, serif-like font
   - Color: Dark blue (#1E3A5F or similar)
   - Size: Very large
   - Weight: Bold
   - Case: Uppercase

3. **Description:** "Unlock resources, streamline practice management, and join a network committed to clinical excellence."
   - Font: Smaller sans-serif
   - Color: Grey (#666666 or similar)
   - Position: Below heading
   - Line height: Comfortable reading

4. **CTA Button:** "Partner With Us"
   - **Style:**
     - Background: White (#FFFFFF)
     - Text: Dark blue (matching heading)
     - Border: Thin gold border (#D4AF37)
     - Border radius: Rounded corners (~8px)
     - Padding: Comfortable padding

#### Right Card: "PATIENT PORTAL"

**Visual Design:**
- **Background:** Frosted glass effect (matching left card)
- **Border:** Thin gold border (matching left card)
- **Border radius:** Rounded corners (matching left card)
- **Effect:** Backdrop blur (matching left card)

**Content Structure:**
1. **Icon:**
   - Dark blue heart shape
   - Gold electrocardiogram (ECG) line running through it
   - Position: Top center or left

2. **Heading:** "PATIENT PORTAL"
   - Font: Large, serif-like font (matching left card)
   - Color: Dark blue (matching left card)
   - Size: Very large (matching left card)
   - Weight: Bold
   - Case: Uppercase

3. **Description:** "Access your health records, book appointments, and connect with top-tier physicians dedicated to your well-being."
   - Font: Smaller sans-serif (matching left card)
   - Color: Grey (matching left card)
   - Position: Below heading
   - Line height: Comfortable reading

4. **CTA Button:** "Find a Doctor"
   - **Style:**
     - Background: White (matching left card)
     - Text: Dark blue (matching left card)
     - Border: Thin gold border (matching left card)
     - Border radius: Rounded corners (matching left card)
     - Padding: Matching left card button

**Key Design Principles:**
- Both cards are visually balanced
- Clear visual distinction through background colors (Pattern 1) or icons (Pattern 2)
- Equal visual weight for both options
- Prominent placement immediately after hero
- Clear call-to-action buttons
- Professional yet approachable aesthetic

---

## Statistics/Metrics Section

### Design Pattern 1: ipa.care/community

**Layout:**
- Single wide card below portal section
- Light beige/off-white background
- Rounded corners
- Three-column layout for metrics

**Content:**
- **Left Metric:**
  - Icon: Stethoscope
  - Number: "2,500+"
  - Label: "Physicians"
  
- **Middle Metric:**
  - Icon: Group of people
  - Number: "1M+"
  - Label: "Patients Served"
  
- **Right Metric:**
  - Icon: Heart
  - Number: "98%"
  - Label: "Patient Satisfaction"

**Styling:**
- Icons: Simple, thematic icons
- Numbers: Large, bold font
- Labels: Smaller, descriptive text
- Spacing: Equal spacing between columns

### Design Pattern 2: United Physicians Association

**Layout:**
- White card with light blue background accent
- Positioned on right side of Featured Physicians section
- Rounded corners

**Content:**
- **Metric 1:** "98% Patient Satisfaction Rate"
  - Icon: Circular gauge
  
- **Metric 2:** "500+ Independent Practices"
  - Icon: Circular gauge
  
- **Metric 3:** "1 Million+ Patients Served Annually"
  - Icon: Two-person icon
  
- **Metric 4:** "Top 5% in Clinical Quality Outcomes"
  - Icon: Heart icon

**Styling:**
- Card background: White with light blue accent
- Icons: Circular gauges and thematic icons
- Text: Clear, readable font
- Layout: Vertical list or grid

---

## Featured Physicians Section

### Design Pattern 2: United Physicians Association

**Layout:**
- Horizontal carousel of physician profiles
- Left/right navigation arrows
- Pagination dots below
- Dark blue card backgrounds

**Card Structure:**
- **Image:** Professional headshot (circular or rounded square)
- **Name:** "Dr. [Name], M.D." or similar credentials
- **Specialty:** Medical specialty name
- **Description:** Brief description of practice/expertise
- **Background:** Dark blue (#1E3A5F or similar)

**Navigation:**
- Left/right arrow buttons
- Pagination dots indicating current position
- Smooth transitions between cards

**Section Title:**
- "FEATURED PHYSICIANS" (uppercase, dark grey)
- "Meet Our Leading Specialists" (larger, dark blue)

---

## Testimonials/Stories Section

### Design Pattern 1: ipa.care/community

**Layout:**
- Section titled "Stories of Care & Healing"
- Three-column card layout
- Light purple background (matching "For Physicians" card)

**Card Structure:**
- **Image:** Circular profile photo (headshot)
- **Quote:** Partial testimonial text
- **Attribution:** Name and role (if visible)

**Styling:**
- Background: Light purple (#E8E3F0 or similar)
- Cards: White or light background with rounded corners
- Images: Circular, professional headshots
- Text: Readable, comfortable line height

---

## Accreditations & Partnerships

### Design Pattern 2: United Physicians Association

**Layout:**
- Horizontal carousel of partner logos
- Section title: "OUR ACCREDITATIONS & PARTNERSHIPS"
- Navigation arrows on sides

**Logos Included:**
- The Joint Commission
- Accreditation seals
- Blue Cross Blue Shield Association
- AMA American Medical Association
- Additional partner logos

**Styling:**
- Title: Dark grey, uppercase
- Logos: Grayscale or original colors
- Spacing: Even spacing between logos
- Carousel: Smooth scrolling with arrows

---

## Color Palette

### Design Pattern 1: ipa.care/community

**Primary Colors:**
- **Dark Purple:** #4A3A6B (headings, buttons)
- **Light Purple:** #E8E3F0 (For Physicians card background)
- **Light Beige/Cream:** #F5F1E8 (For Patients card background)
- **Gold/Orange:** #E8A87C (accent, buttons)
- **Golden Brown:** #D4A574 (hero text)
- **Dark Text:** #1A1A1A, #2C2C2C (body text)
- **White:** #FFFFFF (buttons, backgrounds)

**Usage:**
- Purple tones: Professional, trustworthy
- Beige/Cream: Warm, approachable
- Gold/Orange: Accent, call-to-action
- Dark text: Readability, contrast

### Design Pattern 2: United Physicians Association

**Primary Colors:**
- **Dark Blue:** #1E3A5F (headings, text, cards)
- **Gold:** #D4AF37 (borders, accents)
- **White:** #FFFFFF (backgrounds, buttons)
- **Grey:** #666666 (descriptions, secondary text)
- **Light Blue:** Light blue accent (metrics card)

**Usage:**
- Dark blue: Primary brand color, professionalism
- Gold: Premium, trust, excellence
- White: Clean, modern backgrounds
- Grey: Secondary information

---

## Typography

### Design Pattern 1: ipa.care/community

**Headings:**
- **Primary:** Elegant serif font (large, golden brown)
- **Secondary:** Bold sans-serif (dark purple)
- **Section Titles:** Dark, uppercase, medium weight

**Body Text:**
- **Primary:** Clean sans-serif
- **Size:** Readable (16-18px base)
- **Line Height:** Comfortable (1.5-1.6)
- **Color:** Dark text on light backgrounds

**Buttons:**
- **Font:** Sans-serif, medium weight
- **Size:** Readable, prominent
- **Case:** Title case or sentence case

### Design Pattern 2: United Physicians Association

**Headings:**
- **Primary:** Large serif-like font (dark blue)
- **Section Titles:** Uppercase, bold, dark grey
- **Card Headings:** Large, serif-like, uppercase

**Body Text:**
- **Primary:** Clean sans-serif
- **Size:** Readable (14-16px for descriptions)
- **Line Height:** Comfortable
- **Color:** Grey for descriptions, dark blue for headings

**Buttons:**
- **Font:** Sans-serif, medium weight
- **Size:** Readable
- **Case:** Title case

---

## Component Specifications

### Portal Card Component

**Dimensions:**
- **Width:** 50% of container (side-by-side layout)
- **Height:** Auto (content-driven) or fixed minimum height
- **Padding:** 32-48px (vertical), 24-32px (horizontal)
- **Border Radius:** 12-16px
- **Gap:** 16-24px between cards

**Responsive Behavior:**
- **Desktop:** Side-by-side (50% each)
- **Tablet:** Side-by-side (may reduce padding)
- **Mobile:** Stacked vertically (100% width each)

**States:**
- **Default:** Normal appearance
- **Hover:** Slight elevation, scale, or color change
- **Active/Focus:** Clear focus ring for accessibility

### CTA Button Component

**Dimensions:**
- **Height:** 44-48px (touch-friendly)
- **Padding:** 12-16px horizontal, 10-14px vertical
- **Border Radius:** 8px
- **Min Width:** Comfortable for text + icon

**States:**
- **Default:** Normal appearance
- **Hover:** Darker shade or slight scale (1.02-1.05)
- **Active:** Pressed state (slightly darker)
- **Focus:** Clear focus ring (accessibility)

---

## Layout Patterns

### Overall Page Structure

1. **Header/Navigation** (top)
2. **Hero/Banner Section** (full-width)
3. **For Patients / For Physicians Portal Section** (container-width, side-by-side cards)
4. **Statistics/Metrics Section** (container-width)
5. **Featured Physicians Section** (container-width, carousel)
6. **Testimonials/Stories Section** (container-width, cards)
7. **Accreditations Section** (container-width, carousel)
8. **Footer** (full-width)

### Container Widths

- **Full-width sections:** 100vw
- **Content containers:** Max-width 1200-1400px, centered
- **Padding:** 16-24px on mobile, 24-48px on desktop

### Spacing System

- **Section spacing:** 64-96px between major sections
- **Card spacing:** 16-24px between cards
- **Content spacing:** 24-32px within cards
- **Mobile spacing:** Reduced by 30-40%

---

## Implementation Recommendations

### Priority Implementation Order

1. **Hero/Banner Section** - Establish visual foundation
2. **For Patients / For Physicians Portal Section** - Critical user navigation
3. **Statistics/Metrics Section** - Build credibility
4. **Featured Physicians Section** - Showcase network
5. **Testimonials Section** - Social proof
6. **Accreditations Section** - Trust indicators

### Technical Considerations

- **Responsive Design:** Mobile-first approach
- **Accessibility:** ARIA labels, keyboard navigation, focus states
- **Performance:** Optimize images, lazy load carousels
- **Animation:** Smooth transitions, respect prefers-reduced-motion
- **Browser Support:** Modern browsers, graceful degradation

### Design System Integration

- Use existing brand colors where possible
- Maintain consistency with current design system
- Adapt reference designs to match brand identity
- Ensure accessibility standards (WCAG 2.1 AA)

---

## Notes

- Both designs emphasize **dual-audience approach** with clear visual separation
- Portal cards are **not toggle switches** - both options are always visible
- **Color differentiation** is key to distinguishing patient vs physician paths
- **Professional imagery** builds trust and humanizes the brand
- **Statistics and testimonials** provide social proof and credibility
- **Rounded corners and soft gradients** create modern, approachable aesthetic

---

**Document Version:** 1.0  
**Last Updated:** January 28, 2026
