# Meciy Template - Component Architecture Diagram

## Page Structure Flow

```mermaid
graph TD
    A[Page Load] --> B[Preloader Animation]
    B --> C[Page Wrapper]
    C --> D[Header Component]
    C --> E[Main Content]
    C --> F[Footer Component]
    C --> G[Mobile Nav]
    C --> H[Search Popup]
    C --> I[Scroll to Top]
    
    D --> D1[Top Bar]
    D --> D2[Navigation Menu]
    D --> D3[Search & CTA]
    
    E --> E1[Hero Slider]
    E --> E2[Feature Sections]
    E --> E3[About Section]
    E --> E4[Services Section]
    E --> E5[Appointments CTA]
    E --> E6[Why Choose Us]
    E --> E7[Counter Section]
    E --> E8[Portfolio]
    E --> E9[Team Section]
    E --> E10[Testimonials]
    E --> E11[Blog Posts]
    E --> E12[Contact Form]
    
    F --> F1[About Widget]
    F --> F2[Quick Links]
    F --> F3[Instagram Feed]
    F --> F4[Appointment Form]
    F --> F5[Footer Bottom]
```

## Component Hierarchy

```mermaid
graph LR
    A[Page Wrapper] --> B[Header]
    A --> C[Main Content]
    A --> D[Footer]
    
    B --> B1[Top Bar]
    B --> B2[Main Menu]
    B --> B3[Sticky Header Clone]
    
    C --> C1[Hero Slider]
    C --> C2[Content Sections]
    
    C1 --> C1A[Swiper Container]
    C1A --> C1B[Slide 1]
    C1A --> C1C[Slide 2]
    C1A --> C1D[Slide 3]
    C1A --> C1E[Navigation]
    C1A --> C1F[Pagination]
    
    C2 --> C2A[Feature Cards]
    C2 --> C2B[About Section]
    C2 --> C2C[Services Grid]
    C2 --> C2D[Portfolio Carousel]
    C2 --> C2E[Team Grid]
    
    D --> D1[Widget Columns]
    D --> D2[Appointment Form]
    D --> D3[Copyright Bar]
```

## JavaScript Initialization Flow

```mermaid
sequenceDiagram
    participant Window
    participant jQuery
    participant meciy.js
    participant Plugins
    
    Window->>jQuery: DOM Ready
    jQuery->>meciy.js: Initialize
    meciy.js->>meciy.js: Handle Preloader
    meciy.js->>Plugins: Initialize Swiper
    meciy.js->>Plugins: Initialize Owl Carousel
    meciy.js->>meciy.js: Setup Mobile Nav
    meciy.js->>meciy.js: Setup Search Popup
    meciy.js->>Plugins: Initialize Odometer
    meciy.js->>Plugins: Initialize WOW.js
    meciy.js->>Plugins: Setup Form Validation
    meciy.js->>Plugins: Setup MailChimp
    meciy.js->>Plugins: Setup Magnific Popup
    meciy.js->>meciy.js: Dynamic Menu Highlighting
    meciy.js->>meciy.js: Scroll Handlers
```

## Form Submission Flow

```mermaid
sequenceDiagram
    participant User
    participant Form
    participant jQuery Validate
    participant AJAX
    participant PHP Handler
    participant Email Server
    
    User->>Form: Fill & Submit
    Form->>jQuery Validate: Validate Fields
    jQuery Validate->>jQuery Validate: Check Rules
    alt Validation Passes
        jQuery Validate->>AJAX: Serialize Form Data
        AJAX->>PHP Handler: POST Request
        PHP Handler->>Email Server: Send Email
        Email Server-->>PHP Handler: Success/Error
        PHP Handler-->>AJAX: Response
        AJAX->>Form: Show Result Message
        AJAX->>Form: Clear Fields
    else Validation Fails
        jQuery Validate->>Form: Show Error Messages
    end
```

## Responsive Breakpoint System

```mermaid
graph TD
    A[Viewport Width] --> B{< 576px?}
    B -->|Yes| C[Mobile - col-*]
    B -->|No| D{< 768px?}
    D -->|Yes| E[Small - col-sm-*]
    D -->|No| F{< 992px?}
    F -->|Yes| G[Medium - col-md-*]
    F -->|No| H{< 1200px?}
    H -->|Yes| I[Large - col-lg-*]
    H -->|No| J{< 1400px?}
    J -->|Yes| K[XL - col-xl-*]
    J -->|No| L[XXL - col-xxl-*]
    
    C --> C1[Stacked Layout]
    C --> C2[Mobile Menu]
    C --> C3[Single Column]
    
    G --> G1[2-3 Columns]
    G --> G2[Tablet Menu]
    
    I --> I1[3-4 Columns]
    I --> I2[Desktop Menu]
    
    K --> K1[4+ Columns]
    K --> K2[Full Features]
```

## Animation Trigger System

```mermaid
graph TD
    A[Page Load] --> B[WOW.js Initialized]
    B --> C[Scroll Event]
    C --> D{Element in Viewport?}
    D -->|Yes| E[Trigger Animation]
    D -->|No| F[Wait for Scroll]
    F --> C
    
    E --> E1[Fade In Up]
    E --> E2[Slide In Left]
    E --> E3[Zoom In]
    E --> E4[Custom Animation]
    
    E1 --> G[Add Animated Class]
    E2 --> G
    E3 --> G
    E4 --> G
    
    G --> H[CSS Animation Executes]
    H --> I[Element Visible]
```

## Component Interaction Map

```mermaid
graph TD
    A[Header] -->|Triggers| B[Mobile Nav]
    A -->|Triggers| C[Search Popup]
    A -->|Scroll| D[Sticky Header]
    
    E[Hero Slider] -->|Swiper| F[Navigation Arrows]
    E -->|Swiper| G[Pagination Dots]
    E -->|Auto-play| H[Slide Rotation]
    
    I[Portfolio] -->|Owl Carousel| J[Item Navigation]
    I -->|Isotope| K[Filter Buttons]
    K -->|Click| L[Filter Items]
    
    M[Contact Form] -->|Submit| N[jQuery Validate]
    N -->|Valid| O[AJAX POST]
    O -->|Success| P[Show Message]
    O -->|Error| Q[Show Error]
    
    R[Counter Section] -->|Scroll Into View| S[jQuery Appear]
    S -->|Trigger| T[Odometer Animation]
    T -->|Count Up| U[Display Number]
    
    V[Team Cards] -->|Hover| W[Show Social Icons]
    V -->|Click| X[Navigate to Details]
    
    Y[FAQ Section] -->|Click| Z[Accordion Toggle]
    Z -->|Expand| AA[Show Content]
    Z -->|Collapse| BB[Hide Content]
```

## Data Flow: Form to Email

```mermaid
flowchart LR
    A[User Input] --> B[Form Fields]
    B --> C[jQuery Validate]
    C -->|Valid| D[Serialize Data]
    C -->|Invalid| E[Show Errors]
    D --> F[AJAX POST]
    F --> G[PHP Handler]
    G --> H[PHPMailer]
    H --> I[SMTP Server]
    I -->|Success| J[Success Response]
    I -->|Error| K[Error Response]
    J --> L[Display Success Message]
    K --> M[Display Error Message]
    L --> N[Clear Form]
```

## Slider Configuration Pattern

```mermaid
graph TD
    A[Slider Container] -->|data-swiper-options| B[JSON Config]
    B --> C[slidesPerView: 1]
    B --> D[loop: true]
    B --> E[effect: fade]
    B --> F[autoplay: delay 5000]
    B --> G[pagination: bullets]
    B --> H[navigation: arrows]
    
    C --> I[Swiper Instance]
    D --> I
    E --> I
    F --> I
    G --> I
    H --> I
    
    I --> J[Render Slides]
    J --> K[Add Navigation]
    J --> L[Add Pagination]
    J --> M[Start Autoplay]
```

## Mobile Navigation Flow

```mermaid
sequenceDiagram
    participant User
    participant Hamburger
    participant MobileNav
    participant MainMenu
    participant Body
    
    User->>Hamburger: Click
    Hamburger->>MobileNav: Toggle 'expanded'
    Hamburger->>Body: Toggle 'locked'
    MobileNav->>MainMenu: Copy HTML
    MainMenu->>MobileNav: Inject Menu
    MobileNav->>MobileNav: Add Dropdown Toggles
    MobileNav->>MobileNav: Show Panel
    
    User->>MobileNav: Click Menu Item
    alt Has Submenu
        MobileNav->>MobileNav: Toggle Dropdown
    else Regular Link
        MobileNav->>MobileNav: Navigate
        MobileNav->>MobileNav: Close Panel
    end
    
    User->>MobileNav: Click Close
    MobileNav->>MobileNav: Remove 'expanded'
    MobileNav->>Body: Remove 'locked'
```

## CSS Class Naming Pattern

```
Component Block:    .component-name
Element:            .component-name__element
Modifier:           .component-name__element--modifier
Variant:            .component-name--variant
State:              .component-name.is-active
Utility:            .text-center, .hidden-lg
```

## Animation Timing System

```
Preloader:          800ms delay + 1000ms fade
WOW Animations:     100ms-400ms delays (staggered)
Swiper Autoplay:    5000ms per slide
Owl Autoplay:       6000ms per slide
Scroll Duration:    1000ms smooth scroll
Form Fade:          10000ms auto-hide messages
```

## Icon System Architecture

```
Font Icons:
├── Meciy Icons (Custom)
│   ├── icon-consulting
│   ├── icon-meditation
│   └── [20+ custom icons]
│
└── Font Awesome
    ├── Brands (fab)
    ├── Solid (fas)
    └── Regular (far)
```

## File Loading Order

```
1. CSS Files (Head)
   ├── Bootstrap
   ├── Vendor CSS
   └── Template CSS

2. HTML Content (Body)
   ├── Preloader
   ├── Sidebar Widget
   ├── Page Wrapper
   │   ├── Header
   │   ├── Main Content
   │   └── Footer
   └── Modals/Overlays

3. JavaScript Files (End of Body)
   ├── jQuery
   ├── Vendor JS
   └── Template JS (meciy.js)
```
