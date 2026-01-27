# Meciy HTML Template - Comprehensive Project Analysis

## Project Overview

**Meciy** is a premium responsive HTML5 template designed specifically for **mental health counseling, therapy, and psychological services** websites. Created by Webplateone in February 2023, it's built on Bootstrap 5.x framework with extensive customization options.

### Purpose
- Mental health clinics
- Psychology practices
- Counseling centers
- Therapy services
- Behavioral health organizations

---

## Project Structure

```
meciy-package-files/
├── 1_meciy-html-files/          # Main template files
│   ├── index.html               # Homepage variant 1
│   ├── index2.html             # Homepage variant 2
│   ├── index3.html             # Homepage variant 3
│   ├── about-1.html            # About page variant 1
│   ├── about-2.html            # About page variant 2
│   ├── services.html           # Services listing
│   ├── team.html               # Team members
│   ├── portfolio-1.html         # Portfolio grid
│   ├── blog.html               # Blog listing
│   ├── contact.html            # Contact page
│   └── assets/                 # All assets
│       ├── css/                # Stylesheets
│       ├── js/                 # JavaScript files
│       ├── images/             # Images & graphics
│       └── vendors/            # Third-party libraries
└── 2_meciy-documentations/      # Documentation
    ├── index.html              # Documentation site
    ├── css/                    # Doc styles
    └── js/                     # Doc scripts
```

---

## Technology Stack

### Core Technologies
- **HTML5** - Semantic markup
- **CSS3** - Modern styling with animations
- **JavaScript/jQuery** - Interactive functionality
- **Bootstrap 5.x** - Responsive grid system

### Typography
- **Primary Font**: Poppins (Google Fonts) - Modern, clean sans-serif
- **Secondary Font**: Cormorant Garamond - Elegant serif for headings
- **Custom Icons**: Meciy Icons (custom icon font)
- **Font Awesome** - Social media & UI icons

### JavaScript Libraries & Plugins

#### Animation & Effects
- **WOW.js** - Scroll animations (`wow fadeInUp`, `data-wow-delay`)
- **Animate.css** - CSS animation library
- **TweenMax (GSAP)** - Advanced animations for preloader
- **Jarallax** - Parallax scrolling effects

#### Sliders & Carousels
- **Swiper.js** - Modern touch slider (main hero slider)
- **Owl Carousel** - Portfolio/testimonial carousels
- **Tiny Slider** - Lightweight slider alternative
- **BX Slider** - jQuery slider plugin

#### UI Components
- **jQuery UI** - Date picker, accordion, tabs
- **Bootstrap Select** - Enhanced select dropdowns
- **Nice Select** - Custom styled selects
- **NoUISlider** - Range sliders for filters
- **Magnific Popup** - Lightbox for images/videos

#### Forms & Validation
- **jQuery Validate** - Form validation
- **jQuery AJAX Chimp** - MailChimp integration
- **PHPMailer** - Email sending (PHP backend)

#### Counters & Progress
- **Odometer** - Animated number counters
- **jQuery Circle Progress** - Circular progress bars
- **jQuery Appear** - Trigger animations on scroll

#### Other Utilities
- **Isotope** - Filterable grid layouts
- **Countdown** - Timer functionality
- **Vegas** - Background slideshow
- **CircleType** - Curved text effects
- **TimePicker** - Time selection inputs

---

## Design Components & Sections

### 1. Preloader Component
**Location**: Top of every page

**Structure**:
```html
<div class="loader-wrap">
  <div class="preloader">
    <div class="handle-preloader">
      <div class="layer layer-one"><span class="overlay"></span></div>
      <div class="layer layer-two"><span class="overlay"></span></div>
      <div class="layer layer-three"><span class="overlay"></span></div>
      <div class="animation-preloader">
        <div class="spinner"></div>
        <div class="txt-loading">
          <span data-text-preloader="m">m</span>
          <span data-text-preloader="e">e</span>
          <!-- ... -->
        </div>
      </div>
    </div>
  </div>
</div>
```

**Functionality**:
- Three-layer overlay animation (TweenMax)
- Animated spinner
- Letter-by-letter text reveal ("meciy")
- Auto-hides after page load (800ms delay + 1000ms fade)

---

### 2. Header Component

#### Header Variant 1 (`main-header`)
**Structure**:
- **Top Bar**: Contact info, social links, logo center, location/hours
- **Navigation**: Multi-level dropdown menu with mobile toggle
- **Right Side**: Search button + CTA button ("Get Free Quote")

**Features**:
- Sticky header on scroll (`stricky-header`)
- Mobile-responsive hamburger menu
- Dropdown menus with hover effects
- Active page highlighting (dynamic)

#### Header Variant 2 (`main-header-two`)
- Welcome message bar at top
- Different layout arrangement
- "Let's Talk" CTA button

#### Header Variant 3 (`main-header-three`)
- Alternative styling
- Different color scheme

**Navigation Structure**:
```html
<ul class="main-menu__list">
  <li class="dropdown">
    <a href="index.html">Home</a>
    <ul>
      <li><a href="index.html">Home One</a></li>
      <li><a href="index2.html">Home Two</a></li>
      <!-- Nested dropdowns supported -->
    </ul>
  </li>
  <!-- More menu items -->
</ul>
```

---

### 3. Sidebar Widget

**Location**: Slide-in sidebar (triggered by button)

**Content**:
- Logo
- About text
- Contact form ("Get a free quote")
- Close button (X)

**Functionality**:
- Overlay background
- Slide-in animation
- Form submission handling

---

### 4. Main Slider Section (`main-slider`)

**Technology**: Swiper.js

**Configuration**:
```javascript
{
  slidesPerView: 1,
  loop: true,
  effect: "fade",
  autoplay: { delay: 5000 },
  pagination: { bullets, clickable },
  navigation: { prev/next buttons }
}
```

**Slide Structure**:
- Background image layer (`image-layer`)
- Content overlay with:
  - Animated shape (`main-slider__shape-one float-bob-x`)
  - Headline text
  - CTA button
- Navigation arrows (custom styled)
- Pagination dots

**Animations**:
- Fade transition between slides
- Floating shape animation (`float-bob-x`)
- Text fade-in on load

---

### 5. Feature Sections

#### Feature One (`feature-one`)
**Layout**: 4-column grid (responsive)

**Card Structure**:
- Title with link
- Description text
- "Read More" link
- Icon (custom Meciy icons)
- Count number (optional)
- Variant classes: `--two`, `--four` for styling

**Icons Used**:
- `icon-consulting` - Individual Counseling
- `icon-meditation` - Spiritual Goals
- `icon-personality` - Personality Disorders
- `icon-negative` - Troubling Emotions

**Animations**: WOW.js fadeInUp with staggered delays (100ms, 200ms, 300ms, 400ms)

---

### 6. About Section (`about-one`)

**Layout**: Two-column (image left, content right)

**Left Side**:
- Image box with:
  - Main image
  - Secondary image overlay
  - Experience badge (odometer counter: "12+ Years Experience")
  - Video popup button (YouTube integration)
  - Decorative text ("about company")
- WOW animation: `slideInLeft`

**Right Side**:
- Section title with tagline
- Description text
- Feature points list (icons + content):
  - Online Counseling
  - Group Therapy
- CTA button

**Odometer Counter**:
```html
<h3 class="odometer" data-count="12">00</h3>
```
- Animates from 00 to target number on scroll into view

---

### 7. Services Section (`services-one`)

**Layout**: 3-column grid

**Card Structure**:
- Content box (title + description)
- Image box with:
  - Service image
  - Custom icon overlay
- Hover effects

**Services Featured**:
- Dating & Relation (`icon-happy`)
- Anxiety Disorder (`icon-dissociative-identity-disorder`)
- Family Counseling (`icon-crm`)

---

### 8. Appointments Section (`appointments-one`)

**Layout**: Single row with image, icon, content, and CTA

**Structure**:
- Background decorative text ("Psychologist")
- Doctor image
- Icon (`icon-brain`)
- Title: "Book For Online Appointments"
- CTA button: "Book Now"

**Purpose**: Call-to-action for appointment booking

---

### 9. Why Choose Us Section (`why-choose-one`)

**Layout**: Two-column

**Left Side**:
- Section title
- Subtitle ("Therapy With Dr. Jans Smith")
- Description text
- Feature points grid (2x2):
  - Online Counseling
  - Experts Doctors
  - Brain Checkup
  - Medico Reports
- "Read More" button
- Call-to-action box with phone number

**Right Side**:
- Image box with:
  - Main image
  - Content overlay card:
    - Icon
    - Text: "Get 20 minutes free complimentary doctor consultation"
    - "Book Now" button
  - Decorative icons

**Side Image**: Floating animation (`img-bounce`)

---

### 10. Counter Section (`counter-one`)

**Layout**: 4-item horizontal list

**Items**:
1. Certificates & Awards - 4,831+
2. Psychologys Family - 2,710k
3. Individuales CounSell - 121k+
4. Case Issues Solves - 27k

**Structure**:
- Icon
- Title
- Odometer counter (`data-count` attribute)
- Plus/Letter suffix

**Technology**: Odometer.js + jQuery Appear (triggers on scroll)

---

### 11. Portfolio Section (`portfolio-one`)

**Layout**: Top section (title + description) + Carousel bottom

**Carousel Technology**: Owl Carousel

**Configuration**:
```javascript
{
  items: 1-4 (responsive),
  margin: 30,
  autoplay: 6000,
  loop: true,
  nav: false,
  dots: false
}
```

**Portfolio Item Structure**:
- Image
- Content overlay:
  - Subtitle ("Depression")
  - Title link
  - Arrow icon link

**Background**: Decorative text ("portfolio")

---

### 12. Team Section (`team-one`)

**Layout**: 4-column grid

**Card Structure**:
- Image with:
  - Team member photo
  - Social share button (hover trigger)
  - Social links (Twitter, Facebook, Pinterest, Instagram)
- Content:
  - Name (linked to details page)
  - Job title/role

**Hover Effects**:
- Social icons appear on hover
- Image overlay effects

---

### 13. Testimonials Section

**Technology**: Owl Carousel or Swiper

**Structure**:
- Client image
- Quote text
- Client name
- Rating stars
- Job title/location

---

### 14. Blog Section

**Layout**: Grid of blog posts

**Post Structure**:
- Featured image
- Date/Category badges
- Title
- Excerpt
- Author info
- Read more link

---

### 15. Footer Component (`site-footer`)

**Layout**: 4-column grid + bottom bar

**Columns**:
1. **About Widget**:
   - Logo
   - Description
   - Social links
   - Contact info (email, address)
   - Opening hours

2. **Quick Links**:
   - Navigation menu
   - Useful links

3. **Instagram Widget**:
   - 6-image grid
   - Instagram icon overlays
   - Call-to-action box with phone

4. **Appointment Form**:
   - Emergency consultation form
   - Fields: Name, Phone, Service dropdown, Message
   - Submit button
   - PHP form handler (`assets/inc/sendemail.php`)

**Bottom Bar**:
- Copyright text
- Footer menu (Terms, Privacy, Support)

---

### 16. Mobile Navigation

**Structure**:
- Overlay background
- Slide-in panel from left
- Logo
- Menu items (copied from main menu)
- Contact info
- Social links
- Close button

**Functionality**:
- Toggle class: `expanded`
- Body lock class: `locked` (prevents scrolling)
- Dropdown toggles for submenus
- Auto-populated from main menu HTML

---

### 17. Search Popup

**Structure**:
- Overlay background
- Centered search box
- Input field
- Submit button (magnifying glass icon)

**Functionality**:
- Toggle class: `active`
- Closes mobile nav when opened
- Body lock on open

---

### 18. Scroll to Top Button

**Structure**:
```html
<a href="#" data-target="html" class="scroll-to-target scroll-to-top">
  <i class="fa fa-angle-up"></i>
</a>
```

**Functionality**:
- Smooth scroll animation (1000ms)
- Appears on scroll down
- Scrolls to top of page

---

## CSS Architecture

### Main Stylesheets

1. **bootstrap.min.css** - Bootstrap 5.x grid and utilities
2. **meciy.css** - Main template styles (~50KB+)
3. **meciy-responsive.css** - Mobile/tablet breakpoints

### CSS Naming Convention

**BEM-like Methodology**:
```
.component-name
.component-name__element
.component-name__element--modifier
.component-name--variant
```

**Examples**:
- `.main-header`
- `.main-header__top`
- `.main-header__top-inner`
- `.feature-one__single--two`

### Key CSS Classes

**Layout**:
- `.container` - Bootstrap container
- `.row` - Bootstrap row
- `.col-xl-*`, `.col-lg-*`, `.col-md-*`, `.col-sm-*` - Responsive columns

**Animations**:
- `.wow` - WOW.js trigger
- `.fadeInUp`, `.slideInLeft`, etc. - Animation types
- `.float-bob-x`, `.float-bob-y` - Floating animations
- `.img-bounce` - Bounce animation

**Utilities**:
- `.text-center`, `.text-left` - Text alignment
- `.list-unstyled` - Remove list styling
- `.thm-btn` - Theme button style

---

## JavaScript Functionality

### Main Script: `meciy.js`

#### 1. Preloader Handler
```javascript
function handlePreloader() {
  $('.loader-wrap').delay(800).fadeOut(1000);
  TweenMax.to($(".loader-wrap .overlay"), 1.2, {
    force3D: true,
    left: "100%",
    ease: Expo.easeInOut
  });
}
```

#### 2. Swiper Initialization
- Auto-detects `.thm-swiper__slider` elements
- Reads options from `data-swiper-options` attribute
- Creates Swiper instances dynamically

#### 3. Owl Carousel Initialization
- Auto-detects `.thm-owl__carousel` elements
- Reads options from `data-owl-options` attribute
- Custom navigation support

#### 4. Mobile Navigation
- Copies main menu HTML to mobile container
- Adds dropdown toggles to submenu items
- Toggle functionality with body lock

#### 5. Search Popup
- Toggle open/close
- Body lock on open
- Closes mobile nav when opened

#### 6. Dynamic Menu Highlighting
```javascript
function dynamicCurrentMenuClass(selector) {
  let FileName = window.location.href.split("/").reverse()[0];
  // Finds matching menu item and adds "current" class
}
```

#### 7. Form Validation
- jQuery Validate integration
- Custom validation rules
- AJAX form submission
- Success/error handling

#### 8. MailChimp Integration
- AJAX Chimp plugin
- Dynamic URL from `data-url` attribute
- Response handling (success/error states)

#### 9. Video Popup
- Magnific Popup for YouTube/Vimeo
- iFrame type popup
- Fade animation

#### 10. Image Gallery
- Magnific Popup gallery
- Groups images by `data-group` attribute
- Lightbox functionality

#### 11. Odometer Counters
- Triggers on scroll (jQuery Appear)
- Reads `data-count` attribute
- Animates number counting

#### 12. Progress Bars
- Appear on scroll
- Animated width based on `data-percent`
- Used in skills/levels sections

#### 13. Accordion
- Custom accordion implementation
- Group-based (`data-grp-name`)
- Slide up/down animations

#### 14. Scroll to Target
- Smooth scrolling to anchors
- Configurable duration (1000ms default)

#### 15. Sticky Header
- Clones header content to sticky element
- Shows on scroll down

---

## Page Templates

### Homepage Variants

#### index.html (Home One)
- Header variant 1
- Main slider (3 slides)
- Feature One (4 features)
- About One
- Feature Two (2 items)
- Services One (3 services)
- Appointments One
- Why Choose One
- Counter One
- Portfolio One
- Team One
- Footer

#### index2.html (Home Two)
- Header variant 2
- Different section arrangements
- Alternative styling

#### index3.html (Home Three)
- Header variant 3
- Unique layout

### Inner Pages

#### about-1.html / about-2.html
- About company information
- Team members
- Mission/vision
- Statistics

#### services.html
- Services grid/list
- Service categories
- Filter functionality (Isotope)

#### Service Detail Pages
- `dating-&-relation.html`
- `anxiety-disorder.html`
- `family-counseling.html`
- `depression-problem.html`
- `couple-counseling.html`

**Structure**:
- Hero section
- Service description
- Features/benefits
- Process/steps
- Related services sidebar

#### team.html
- Team grid
- Filter by specialty
- Social links

#### team-details.html
- Individual team member profile
- Bio, credentials
- Services offered
- Contact info

#### portfolio-1.html / portfolio-2.html
- Case studies grid
- Filter buttons
- Portfolio carousel

#### portfolio-details.html
- Single case study
- Images gallery
- Project details
- Related projects

#### blog.html
- Blog posts grid
- Pagination
- Categories sidebar
- Recent posts

#### blog-details.html
- Single blog post
- Featured image
- Content
- Author info
- Related posts
- Comments section

#### faq.html
- Accordion FAQ section
- Categories
- Search functionality

#### contact.html
- Contact form
- Google Map (iframe)
- Contact information
- Office hours

---

## Form Handling

### Contact Form

**Structure**:
```html
<form action="assets/inc/sendemail.php" 
      class="contact-form-validated" 
      novalidate="novalidate">
  <input type="text" name="name" required>
  <input type="email" name="email" required>
  <textarea name="message" required></textarea>
  <button type="submit">Submit</button>
</form>
<div class="result"></div>
```

**Validation Rules**:
- Name: Required
- Email: Required + valid email format
- Message: Required
- Subject: Required (if present)

**Submission**:
- jQuery AJAX POST to PHP handler
- Response appended to `.result` div
- Form fields cleared on success

**Backend**: PHPMailer integration (`assets/inc/sendemail.php`)

### Appointment Form (Footer)

**Fields**:
- Full Name
- Phone
- Service (dropdown)
- Message

**Submission**: Same PHP handler

### MailChimp Newsletter

**Structure**:
```html
<form class="mc-form" data-url="MAILCHIMP_URL">
  <input type="email" name="EMAIL">
  <button type="submit">Subscribe</button>
</form>
<div class="mc-form__response"></div>
```

**Functionality**:
- AJAX Chimp plugin
- URL from `data-url` attribute
- Success/error response handling
- Auto-clear on success

---

## Responsive Design

### Breakpoints (Bootstrap 5)

- **Extra Small**: < 576px (mobile)
- **Small**: ≥ 576px (mobile landscape)
- **Medium**: ≥ 768px (tablet)
- **Large**: ≥ 992px (desktop)
- **Extra Large**: ≥ 1200px (large desktop)
- **XXL**: ≥ 1400px (extra large desktop)

### Responsive Classes

**Grid System**:
- `col-xl-*` - Extra large screens
- `col-lg-*` - Large screens
- `col-md-*` - Medium screens
- `col-sm-*` - Small screens
- `col-*` - Extra small screens

**Utility Classes**:
- `.hidden-lg` - Hide on large screens
- `.mobile-nav__toggler` - Mobile menu button
- Responsive text sizes
- Responsive spacing

### Mobile Optimizations

1. **Mobile Navigation**: Slide-in menu
2. **Touch-Friendly**: Larger tap targets
3. **Responsive Images**: `srcset` attributes
4. **Stacked Layouts**: Columns stack on mobile
5. **Simplified Menus**: Collapsed dropdowns

---

## Animation System

### WOW.js Animations

**Trigger**: Scroll into viewport

**Types**:
- `fadeInUp` - Fade + slide up
- `fadeInDown` - Fade + slide down
- `slideInLeft` - Slide from left
- `slideInRight` - Slide from right
- `zoomIn` - Zoom in effect
- `bounceIn` - Bounce effect

**Usage**:
```html
<div class="wow fadeInUp" data-wow-delay="100ms">
  Content
</div>
```

**Delay Options**:
- `data-wow-delay="100ms"` - Stagger animations
- `data-wow-duration="2500ms"` - Custom duration

### CSS Animations

**Floating Effects**:
- `.float-bob-x` - Horizontal float
- `.float-bob-y` - Vertical float
- `.img-bounce` - Bounce animation

**Keyframe Animations**:
- Preloader spinner rotation
- Letter loading animations
- Button hover effects
- Image hover transitions

### GSAP/TweenMax

**Used For**:
- Preloader overlay animation
- Complex timeline animations
- Performance-optimized animations

---

## Icon System

### Custom Meciy Icons

**Font File**: `assets/vendors/meciy-icons/style.css`

**Usage**:
```html
<span class="icon-consulting"></span>
<span class="icon-meditation"></span>
<span class="icon-brain"></span>
```

**Available Icons** (sample):
- `icon-consulting`
- `icon-meditation`
- `icon-personality`
- `icon-negative`
- `icon-happy`
- `icon-dissociative-identity-disorder`
- `icon-crm`
- `icon-brain`
- `icon-counseling`
- `icon-mental-health`
- `icon-doctor`
- `icon-human-brain`
- `icon-report`
- `icon-certificate`
- `icon-family`
- `icon-communication`
- `icon-discussion`
- `icon-phone-call`
- `icon-message`
- `icon-location`
- `icon-back-in-time`
- `icon-right-arrow`
- `icon-right-arrow1`
- `icon-magnifying-glass`

### Font Awesome Icons

**Usage**:
```html
<i class="fab fa-facebook-f"></i>
<i class="fas fa-envelope"></i>
<i class="fa fa-bars"></i>
```

**Categories**:
- `fab` - Brands (social media)
- `fas` - Solid
- `far` - Regular
- `fa` - Legacy

---

## Color Scheme

### Primary Colors (Inferred from CSS)

- **Brand Teal**: Primary action color
- **Brand Dark Blue**: Headings, text
- **White**: Backgrounds
- **Gray Scale**: Text, borders, backgrounds

### Color Usage

- Buttons: Teal background, white text
- Headings: Dark blue
- Links: Teal on hover
- Backgrounds: White, light gray gradients
- Borders: Light gray

---

## Performance Optimizations

### Image Optimization
- WebP format support (via HTML5 picture tags)
- Lazy loading (via plugins)
- Responsive images (`srcset`)

### JavaScript Optimization
- Minified vendor libraries
- Deferred script loading
- Event delegation
- Efficient selectors

### CSS Optimization
- Minified production CSS
- Critical CSS inline (if implemented)
- Unused CSS removal

### Loading Strategy
- Preloader for perceived performance
- Progressive enhancement
- Graceful degradation

---

## Browser Compatibility

**Supported Browsers**:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- IE10+ (with polyfills)

**Features**:
- CSS3 animations (with fallbacks)
- HTML5 semantic elements
- Modern JavaScript (ES5+)
- Responsive design

---

## Customization Guide

### Changing Colors

1. **Primary Colors**: Edit `meciy.css`
   - Search for color values (`#hex` or `rgb()`)
   - Replace with brand colors

2. **Button Colors**: 
   - `.thm-btn` class
   - Hover states

### Changing Fonts

1. **Google Fonts**: Update `<link>` tags in `<head>`
2. **CSS**: Update `font-family` in `meciy.css`

### Adding New Sections

1. Copy existing section HTML structure
2. Update class names
3. Add corresponding CSS
4. Add JavaScript if needed (sliders, animations)

### Modifying Navigation

1. Edit `<ul class="main-menu__list">` in header
2. Add/remove menu items
3. Update mobile nav (auto-copied)

### Form Configuration

1. **Contact Form**: Update `action` attribute to PHP handler
2. **MailChimp**: Update `data-url` with MailChimp list URL
3. **Validation**: Modify rules in `meciy.js`

---

## Key Features Summary

### Design Features
✅ Clean, modern design
✅ Professional healthcare aesthetic
✅ Multiple header styles
✅ 3 homepage variants
✅ Fully responsive
✅ Smooth animations
✅ Custom icon set

### Functional Features
✅ Multi-level navigation
✅ Mobile-friendly menu
✅ Search functionality
✅ Contact forms
✅ Appointment booking forms
✅ MailChimp integration
✅ Google Maps integration
✅ Image galleries
✅ Video popups
✅ Blog system
✅ Team profiles
✅ Portfolio showcase
✅ FAQ accordion
✅ Testimonials carousel
✅ Counter animations
✅ Progress bars
✅ Filterable grids

### Technical Features
✅ Bootstrap 5.x framework
✅ jQuery-based interactions
✅ PHP form handling
✅ SEO-friendly markup
✅ Cross-browser compatible
✅ Well-commented code
✅ Extensive documentation

---

## File Organization

### Assets Structure

```
assets/
├── css/
│   ├── meciy.css              # Main stylesheet
│   └── meciy-responsive.css   # Responsive styles
├── js/
│   └── meciy.js               # Main JavaScript
├── images/
│   ├── backgrounds/           # Background images
│   ├── resources/             # Content images
│   ├── services/              # Service images
│   ├── team/                  # Team photos
│   ├── project/               # Portfolio images
│   ├── shapes/                # Decorative shapes
│   ├── icon/                  # Icon images
│   └── favicons/              # Favicon set
└── vendors/                   # Third-party libraries
    ├── bootstrap/
    ├── swiper/
    ├── owl-carousel/
    ├── jquery/
    └── [30+ other libraries]
```

---

## Integration Points

### Email Integration
- **PHPMailer**: Contact form submissions
- **SMTP Support**: Configurable email server
- **Form Handler**: `assets/inc/sendemail.php`

### Third-Party Services
- **Google Maps**: Embedded iframe
- **MailChimp**: Newsletter subscriptions
- **YouTube/Vimeo**: Video embeds

### Backend Requirements
- **PHP**: Form processing
- **SMTP Server**: Email sending
- **Web Server**: Apache/Nginx

---

## Best Practices Used

1. **Semantic HTML5**: Proper use of `<header>`, `<nav>`, `<section>`, `<footer>`
2. **Accessibility**: ARIA labels, semantic markup
3. **SEO**: Meta tags, structured data ready
4. **Performance**: Optimized assets, lazy loading
5. **Maintainability**: Well-organized code, comments
6. **Responsive**: Mobile-first approach
7. **Cross-browser**: Fallbacks and polyfills

---

## Common Customization Tasks

### Adding a New Page
1. Copy existing page HTML
2. Update page title in `<head>`
3. Modify content sections
4. Update navigation links
5. Test responsiveness

### Changing Logo
1. Replace `assets/images/resources/logo-1.png`
2. Update `<img src="">` in header
3. Update mobile nav logo
4. Update sidebar logo

### Adding New Service
1. Copy service card HTML
2. Update image, title, description
3. Add icon class
4. Link to service detail page

### Modifying Slider
1. Edit Swiper configuration in HTML
2. Add/remove slides
3. Update images and content
4. Adjust autoplay timing

---

## Documentation

**Location**: `2_meciy-documentations/index.html`

**Sections**:
1. Introduction
2. HTML Structure
3. CSS Files and Structure
4. Javascript
5. Google Map Settings
6. MailChimp Settings
7. Contact Form Settings
8. Tutorial
9. Sources and Credits
10. Support

---

## Summary

The **Meciy HTML Template** is a comprehensive, production-ready template for mental health and counseling websites. It features:

- **23 HTML pages** covering all common website needs
- **30+ JavaScript libraries** for rich interactivity
- **3 header variants** for design flexibility
- **Fully responsive** design for all devices
- **Extensive customization** options
- **Professional design** tailored for healthcare
- **Well-documented** codebase
- **PHP backend** integration ready

The template uses modern web technologies while maintaining compatibility with older browsers, making it suitable for professional healthcare websites requiring a polished, trustworthy appearance.
