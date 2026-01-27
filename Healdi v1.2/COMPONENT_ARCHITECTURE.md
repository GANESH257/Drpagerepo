# Healdi v1.2 - Component Architecture Diagrams

This document provides visual representations of the Healdi template's architecture using Mermaid diagrams.

## Table of Contents
1. [Page Structure Flow](#page-structure-flow)
2. [Component Hierarchy](#component-hierarchy)
3. [JavaScript Initialization Flow](#javascript-initialization-flow)
4. [Form Submission Flow](#form-submission-flow)
5. [Responsive Breakpoint System](#responsive-breakpoint-system)
6. [Animation Trigger System](#animation-trigger-system)
7. [Component Interaction Map](#component-interaction-map)
8. [Data Flow: Form to Email](#data-flow-form-to-email)
9. [Carousel Configuration Pattern](#carousel-configuration-pattern)
10. [Mobile Navigation Flow](#mobile-navigation-flow)
11. [CSS Class Naming Pattern](#css-class-naming-pattern)
12. [Animation Timing System](#animation-timing-system)
13. [Icon System Architecture](#icon-system-architecture)
14. [File Loading Order](#file-loading-order)

---

## Page Structure Flow

```mermaid
graph TD
    A[HTML Document Start] --> B[Preloader]
    B --> C[Header Top Bar]
    C --> D[Navigation Header]
    D --> E{Banner/Slider?}
    E -->|Yes| F[Banner Carousel]
    E -->|No| G[Content Sections]
    F --> G
    G --> H[Top Entry Section]
    H --> I[About Section]
    I --> J[Services/Departments]
    J --> K[Consultation Process]
    K --> L[Why Choose Us]
    L --> M[Doctors Section]
    M --> N[Testimonials]
    N --> O[Blog Section]
    O --> P[Fun Factor/Counter]
    P --> Q[Health Tips]
    Q --> R[Gallery]
    R --> S[Contact Section]
    S --> T[Footer]
    T --> U[Footer Bottom]
    U --> V[Scripts Loading]
    V --> W[Page Ready]
```

---

## Component Hierarchy

```mermaid
graph TD
    A[Page Container] --> B[Header]
    A --> C[Main Content]
    A --> D[Footer]
    
    B --> B1[Top Bar]
    B --> B2[Navigation]
    B2 --> B2a[Logo]
    B2 --> B2b[Menu Items]
    B2 --> B2c[Emergency Contact]
    
    C --> C1[Banner]
    C --> C2[Top Entry]
    C --> C3[About]
    C --> C4[Departments]
    C --> C5[Consultation]
    C --> C6[Doctors]
    C --> C7[Testimonials]
    C --> C8[Blog]
    C --> C9[Contact]
    
    C4 --> C4a[Department Carousel]
    C4a --> C4a1[Department Card]
    
    C6 --> C6a[Specialty Tabs]
    C6 --> C6b[Doctor Cards]
    
    C7 --> C7a[Testimonial Carousel]
    C7a --> C7a1[Testimonial Item]
    
    D --> D1[Footer Content]
    D --> D2[Footer Bottom]
    D1 --> D1a[About Section]
    D1 --> D1b[Links Section]
    D1 --> D1c[Branches Section]
```

---

## JavaScript Initialization Flow

```mermaid
sequenceDiagram
    participant Window
    participant jQuery
    participant WOW
    participant Carousel
    participant Isotope
    participant Counter
    participant Popup
    participant Form
    
    Window->>jQuery: Document Ready
    jQuery->>WOW: Initialize WOW.js
    jQuery->>Carousel: Initialize Owl Carousels
    jQuery->>Isotope: Initialize Isotope Filters
    jQuery->>Counter: Initialize Count To
    jQuery->>Popup: Initialize Magnific Popup
    jQuery->>Form: Initialize Form Handlers
    
    Window->>Window: Window Load Event
    Window->>jQuery: Hide Preloader
```

---

## Form Submission Flow

```mermaid
flowchart TD
    A[User Fills Form] --> B{Form Valid?}
    B -->|No| C[Show Validation Error]
    C --> A
    B -->|Yes| D[Disable Submit Button]
    D --> E[Show Loading Indicator]
    E --> F[AJAX POST Request]
    F --> G{Server Response}
    G -->|Success| H[Show Success Message]
    G -->|Error| I[Show Error Message]
    H --> J[Reset Form]
    I --> J
    J --> K[Enable Submit Button]
    K --> L[Remove Loading Indicator]
```

---

## Responsive Breakpoint System

```mermaid
graph LR
    A[Mobile<br/>< 576px] --> B[Large Mobile<br/>≥ 576px]
    B --> C[Tablet<br/>≥ 768px]
    C --> D[Desktop<br/>≥ 992px]
    D --> E[Large Desktop<br/>≥ 1200px]
    
    A --> A1[Stacked Layout<br/>Mobile Menu<br/>Single Column]
    B --> B1[2 Column Grid<br/>Mobile Menu]
    C --> C1[3 Column Grid<br/>Desktop Menu]
    D --> D1[4 Column Grid<br/>Full Features]
    E --> E1[5+ Column Grid<br/>Wide Layout]
```

---

## Animation Trigger System

```mermaid
graph TD
    A[Page Load] --> B[WOW.js Initialized]
    B --> C[User Scrolls]
    C --> D{Element in Viewport?}
    D -->|Yes| E[Check data-animation]
    D -->|No| C
    E --> F[Add Animation Class]
    F --> G[Animation Plays]
    G --> H[Animation Complete]
    H --> I[Remove Animation Class]
    
    J[Carousel Slide] --> K[Trigger Slide Event]
    K --> L[Animate Text Elements]
    L --> M[Add Animation Classes]
    M --> N[Animation Complete]
```

---

## Component Interaction Map

```mermaid
graph TD
    A[Navigation] --> B[Page Sections]
    C[Banner Carousel] --> D[Animated Text]
    E[Department Carousel] --> F[Department Cards]
    G[Doctor Tabs] --> H[Doctor Cards]
    I[Testimonial Carousel] --> J[Testimonial Items]
    K[Blog Grid] --> L[Blog Cards]
    M[Gallery Filter] --> N[Isotope Grid]
    O[Contact Form] --> P[PHP Handler]
    Q[Counter] --> R[jQuery Appear]
    R --> S[Count To Plugin]
    T[Magnific Popup] --> U[Lightbox Display]
```

---

## Data Flow: Form to Email

```mermaid
sequenceDiagram
    participant User
    participant Form
    participant jQuery
    participant AJAX
    participant PHP
    participant Email
    
    User->>Form: Fill & Submit
    Form->>jQuery: Form Submit Event
    jQuery->>jQuery: Validate Fields
    jQuery->>AJAX: POST Request
    AJAX->>PHP: Send Form Data
    PHP->>PHP: Process Data
    PHP->>Email: Send Email
    PHP->>AJAX: Return Response
    AJAX->>jQuery: Success/Error
    jQuery->>Form: Display Message
    Form->>User: Show Result
```

---

## Carousel Configuration Pattern

```mermaid
graph TD
    A[Carousel Container] --> B{Carousel Type}
    B -->|Department| C[department-carousel]
    B -->|Doctors| D[doctors-carousel]
    B -->|Testimonials| E[testimonials-carousel]
    B -->|Tips| F[tips-carousel]
    
    C --> C1[loop: false<br/>margin: 30<br/>nav: false<br/>dots: true<br/>autoplay: false]
    D --> D1[loop: false<br/>margin: 30<br/>dots: true<br/>autoplay: true<br/>items: 1]
    E --> E1[loop: true<br/>margin: 30<br/>dots: true<br/>autoplay: false<br/>items: 1-2]
    F --> F1[loop: false<br/>margin: 30<br/>dots: true<br/>autoplay: true<br/>items: 1]
    
    C1 --> G[Responsive Breakpoints]
    D1 --> G
    E1 --> G
    F1 --> G
    
    G --> H[0px: 1 item<br/>800px: 2 items<br/>1000px: 3 items]
```

---

## Mobile Navigation Flow

```mermaid
stateDiagram-v2
    [*] --> Desktop: Desktop View
    [*] --> Mobile: Mobile View
    
    Desktop --> DesktopMenu: Show Full Menu
    DesktopMenu --> DesktopMenu: Dropdown Menus
    
    Mobile --> Hamburger: Show Hamburger Icon
    Hamburger --> SideNav: Click Hamburger
    SideNav --> SideNav: Slide In Animation
    SideNav --> MenuItems: Display Menu Items
    MenuItems --> SubMenu: Click Dropdown
    SubMenu --> MenuItems: Expand Submenu
    MenuItems --> Close: Click Close Button
    Close --> [*]: Slide Out Animation
    
    DesktopMenu --> Mobile: Resize to Mobile
    Mobile --> Desktop: Resize to Desktop
```

---

## CSS Class Naming Pattern

```mermaid
graph TD
    A[Component Name] --> B[Component Area]
    A --> C[Component Items]
    A --> D[Single Item]
    
    B --> B1[.component-area]
    C --> C1[.component-items]
    D --> D1[.single-item]
    
    B1 --> B1a[.default-padding]
    B1 --> B1b[.bg-gray]
    B1 --> B1c[.text-center]
    
    C1 --> C1a[.owl-carousel]
    C1 --> C1b[.row]
    
    D1 --> D1a[.col-lg-4]
    D1 --> D1b[.col-md-6]
    D1 --> D1c[.wow]
    D1 --> D1d[.fadeInUp]
```

---

## Animation Timing System

```mermaid
graph LR
    A[Animation Trigger] --> B{Animation Type}
    B -->|Scroll| C[WOW.js]
    B -->|Carousel| D[Slide Event]
    B -->|Counter| E[Appear Event]
    
    C --> C1[Offset: 0px<br/>Mobile: true<br/>Live: true]
    C1 --> C2[Animation Duration: 1s]
    
    D --> D1[Animation End Event]
    D1 --> D2[Remove Previous Classes]
    D2 --> D3[Add New Classes]
    
    E --> E1[Element Visible]
    E1 --> E2[Count To Start]
    E2 --> E3[Duration: 2000ms]
    E3 --> E4[Easing: easeOut]
```

---

## Icon System Architecture

```mermaid
graph TD
    A[Icon Request] --> B{Icon Type}
    B -->|Font Awesome| C[Font Awesome 7]
    B -->|Themify| D[Themify Icons]
    B -->|Flaticon| E[Flaticon Set]
    
    C --> C1[fas fa-icon-name]
    C --> C2[fab fa-icon-name]
    C --> C3[far fa-icon-name]
    
    D --> D1[ti-icon-name]
    
    E --> E1[flaticon-icon-name]
    
    C1 --> F[Render Icon]
    D1 --> F
    E1 --> F
    
    F --> G[CSS Styling]
    G --> H[Display Icon]
```

---

## File Loading Order

```mermaid
graph TD
    A[HTML Document] --> B[CSS Files]
    B --> B1[bootstrap.min.css]
    B1 --> B2[animate.css]
    B2 --> B3[magnific-popup.css]
    B3 --> B4[owl.carousel.min.css]
    B4 --> B5[font-awesome.min.css]
    B5 --> B6[themify-icons.css]
    B6 --> B7[bootsnav.css]
    B7 --> B8[flaticon-set.css]
    B8 --> B9[style.css]
    B9 --> B10[responsive.css]
    
    B10 --> C[Body Content]
    C --> D[Scripts]
    
    D --> D1[jquery-3.7.1.min.js]
    D1 --> D2[bootstrap.min.js]
    D2 --> D3[popper.min.js]
    D3 --> D4[bootsnav.js]
    D4 --> D5[owl.carousel.min.js]
    D5 --> D6[jquery.magnific-popup.min.js]
    D6 --> D7[wow.min.js]
    D7 --> D8[isotope.pkgd.min.js]
    D8 --> D9[imagesloaded.pkgd.min.js]
    D9 --> D10[count-to.js]
    D10 --> D11[jquery.appear.js]
    D11 --> D12[jquery.nice-select.min.js]
    D12 --> D13[main.js]
    
    D13 --> E[Page Ready]
```

---

## Component State Transitions

```mermaid
stateDiagram-v2
    [*] --> Loading: Page Load
    Loading --> Preloader: Show Preloader
    Preloader --> Ready: Window Loaded
    Ready --> Scrolling: User Scrolls
    Scrolling --> Animated: Element in Viewport
    Animated --> Scrolling: Animation Complete
    Scrolling --> StickyNav: Scroll Past Threshold
    StickyNav --> NormalNav: Scroll to Top
    NormalNav --> Scrolling: Continue Scrolling
    
    Ready --> FormSubmit: Form Interaction
    FormSubmit --> Validating: Submit Clicked
    Validating --> Submitting: Valid
    Validating --> FormError: Invalid
    Submitting --> Success: Server Success
    Submitting --> FormError: Server Error
    Success --> Ready: Reset Form
    FormError --> Ready: Show Error
```

---

*These diagrams provide a visual representation of the Healdi v1.2 template's architecture and component relationships. Use them as a reference when customizing or extending the template.*
