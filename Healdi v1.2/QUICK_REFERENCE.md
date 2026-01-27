# Healdi v1.2 - Quick Reference Guide

A developer-focused quick reference for common tasks, code snippets, and troubleshooting in the Healdi template.

## Table of Contents
1. [Common Tasks](#common-tasks)
2. [CSS Classes Reference](#css-classes-reference)
3. [JavaScript Functions Reference](#javascript-functions-reference)
4. [Data Attributes Reference](#data-attributes-reference)
5. [Icon Reference](#icon-reference)
6. [Color Customization](#color-customization)
7. [Responsive Breakpoints](#responsive-breakpoints)
8. [File Paths Reference](#file-paths-reference)
9. [Common Issues & Solutions](#common-issues--solutions)
10. [Performance Tips](#performance-tips)
11. [Browser Testing Checklist](#browser-testing-checklist)
12. [SEO Checklist](#seo-checklist)

---

## Common Tasks

### Change Logo
```html
<!-- In header navigation -->
<a class="navbar-brand" href="index.html">
    <img src="assets/img/logo.png" class="logo" alt="Logo">
</a>

<!-- Also update in mobile collapse header -->
<div class="collapse-header">
    <img src="assets/img/logo.png" alt="Logo">
</div>
```

### Add Menu Item
```html
<ul class="nav navbar-nav navbar-right">
    <li>
        <a href="page.html">Menu Item</a>
    </li>
    <li class="dropdown">
        <a href="#" class="dropdown-toggle" data-toggle="dropdown">Dropdown</a>
        <ul class="dropdown-menu">
            <li><a href="subpage.html">Sub Item</a></li>
        </ul>
    </li>
</ul>
```

### Create Slider Slide
```html
<div class="carousel-item">
    <div class="slider-thumb bg-cover" style="background-image: url(assets/img/banner/1.jpg);"></div>
    <div class="box-table">
        <div class="box-cell shadow dark">
            <div class="container">
                <div class="row">
                    <div class="col-lg-9">
                        <div class="content">
                            <h4 data-animation="animated slideInDown">Title</h4>
                            <h2 data-animation="animated slideInRight">Heading</h2>
                            <a data-animation="animated fadeInUp" class="btn btn-md btn-gradient" href="#">Button</a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
```

### Add Feature Card
```html
<div class="col-lg-4 col-md-6 single-item">
    <div class="item">
        <i class="fas fa-icon-name"></i>
        <h4>Feature Title</h4>
        <p>Feature description text.</p>
    </div>
</div>
```

### Add Department Card
```html
<div class="item">
    <div class="thumb">
        <img src="assets/img/departments/1.jpg" alt="Thumb">
    </div>
    <div class="info">
        <h4><a href="#">Department Name</a></h4>
        <p>Department description.</p>
        <div class="head-of">
            <p><strong>Department head: </strong> Dr. Name</p>
        </div>
        <div class="bottom">
            <a href="#"><i class="fas fa-arrow-right"></i></a>
        </div>
    </div>
</div>
```

### Add Doctor Card
```html
<div class="item">
    <div class="row">
        <div class="col-lg-6 thumb">
            <img src="assets/img/doctors/1.jpg" alt="Thumb">
        </div>
        <div class="col-lg-6 info-box">
            <div class="info">
                <h4>Dr. Name</h4>
                <span>MBBS, BMBS, MBChB</span>
                <p>Doctor description.</p>
                <a class="btn btn-sm btn-gradient cirlce" href="#"><i class="fas fa-angle-right"></i> Read More</a>
            </div>
        </div>
    </div>
</div>
```

### Add Blog Post
```html
<div class="single-item col-lg-4 col-md-6">
    <div class="item">
        <div class="thumb">
            <a href="#"><img src="assets/img/blog/1.jpg" alt="Thumb"></a>
            <div class="post-date">12 Jul</div>
        </div>
        <div class="info">
            <div class="tags">
                <ul>
                    <li><a href="#">Tag</a></li>
                </ul>
            </div>
            <h4><a href="#">Post Title</a></h4>
            <div class="meta">
                <ul>
                    <li>
                        <a href="#">
                            <img src="assets/img/team/1.jpg" alt="Author">
                            <span>Author</span>
                        </a>
                    </li>
                    <li><a href="#"><i class="fas fa-comments"></i> 12 Comments</a></li>
                </ul>
            </div>
        </div>
    </div>
</div>
```

### Add Counter/Stat
```html
<div class="fun-fact">
    <i class="fas fa-icon"></i>
    <span class="timer" data-to="100" data-speed="2000">0</span>
    <h5>Stat Label</h5>
</div>
```

### Add Testimonial
```html
<div class="item">
    <div class="provider">
        <div class="thumb">
            <img src="assets/img/team/1.jpg" alt="Thumb">
        </div>
        <div class="bio">
            <h5>Patient Name</h5>
            <span>patient of <strong>treatment</strong></span>
        </div>
    </div>
    <div class="info">
        <p>Testimonial text here.</p>
    </div>
</div>
```

### Add Gallery Item
```html
<div class="pf-item" data-filter="category">
    <a href="assets/img/gallery/1.jpg" class="item popup-link">
        <img src="assets/img/gallery/1.jpg" alt="Gallery">
    </a>
</div>
```

---

## CSS Classes Reference

### Layout Classes
- `.container` - Bootstrap container
- `.container-medium` - Medium width container (1400px max)
- `.container-full` - Full width container
- `.row` - Bootstrap row
- `.col-lg-*`, `.col-md-*`, `.col-sm-*` - Bootstrap columns

### Spacing Classes
- `.default-padding` - Default section padding
- `.default-padding-bottom` - Bottom padding only
- `.inc-pad` - Increased padding
- `.inc-border` - Border included

### Background Classes
- `.bg-gray` - Gray background
- `.bg-dark` - Dark background
- `.bg-cover` - Background cover
- `.bg-fixed` - Fixed background

### Text Classes
- `.text-center` - Center align text
- `.text-light` - Light text color
- `.text-end` - Right align text

### Component Classes
- `.banner-area` - Banner section
- `.about-area` - About section
- `.department-area` - Departments section
- `.doctors-area` - Doctors section
- `.testimonials-area` - Testimonials section
- `.blog-area` - Blog section
- `.contact-us-area` - Contact section
- `.fun-factor-area` - Counter section

### Animation Classes
- `.wow` - WOW.js trigger
- `.animated` - Animation base class
- `.fadeIn`, `.fadeInUp`, `.slideInDown` - Animation types

### Carousel Classes
- `.owl-carousel` - Owl Carousel container
- `.owl-theme` - Owl theme
- `.department-carousel` - Department carousel
- `.testimonials-carousel` - Testimonials carousel
- `.tips-carousel` - Tips carousel

### Button Classes
- `.btn` - Base button
- `.btn-md` - Medium button
- `.btn-sm` - Small button
- `.btn-gradient` - Gradient button
- `.btn-light` - Light button
- `.circle` - Rounded button

---

## JavaScript Functions Reference

### Initialize WOW.js
```javascript
var wow = new WOW({
    boxClass: 'wow',
    animateClass: 'animated',
    offset: 0,
    mobile: true,
    live: true
});
wow.init();
```

### Initialize Owl Carousel
```javascript
$('.carousel-name').owlCarousel({
    loop: false,
    margin: 30,
    nav: false,
    dots: true,
    autoplay: true,
    items: 1,
    responsive: {
        0: { items: 1 },
        800: { items: 2 },
        1000: { items: 3 }
    }
});
```

### Initialize Isotope
```javascript
var $grid = $('#portfolio-grid').isotope({
    itemSelector: '.pf-item',
    percentPosition: true,
    masonry: {
        columnWidth: '.pf-item'
    }
});
```

### Initialize Magnific Popup
```javascript
// Image popup
$(".popup-link").magnificPopup({
    type: 'image'
});

// Gallery popup
$(".popup-gallery").magnificPopup({
    type: 'image',
    gallery: { enabled: true }
});

// YouTube popup
$(".popup-youtube").magnificPopup({
    type: "iframe",
    mainClass: "mfp-fade"
});
```

### Initialize Counter
```javascript
$('.timer').countTo();
$('.fun-fact').appear(function() {
    $('.timer').countTo();
}, { accY: -100 });
```

### Smooth Scroll
```javascript
$('a.smooth-menu').on('click', function(event) {
    var $anchor = $(this);
    var headerH = '75';
    $('html, body').stop().animate({
        scrollTop: $($anchor.attr('href')).offset().top - headerH + "px"
    }, 1500, 'easeInOutExpo');
    event.preventDefault();
});
```

### Nice Select
```javascript
$('select').niceSelect();
```

---

## Data Attributes Reference

### Animation Attributes
- `data-animation="animated slideInDown"` - WOW.js animation
- `data-in="fadeInDown"` - Menu animation in
- `data-out="fadeOutUp"` - Menu animation out

### Carousel Attributes
- `data-ride="carousel"` - Bootstrap carousel
- `data-bs-target="#carousel-id"` - Carousel target
- `data-bs-slide="prev/next"` - Carousel navigation

### Counter Attributes
- `data-to="100"` - Count to value
- `data-speed="2000"` - Animation speed (ms)

### Filter Attributes
- `data-filter=".category"` - Isotope filter

### Popup Attributes
- `class="popup-youtube"` - YouTube popup
- `class="popup-vimeo"` - Vimeo popup
- `class="popup-gmaps"` - Google Maps popup
- `class="popup-link"` - Image popup
- `class="popup-gallery"` - Gallery popup

### Navigation Attributes
- `data-toggle="dropdown"` - Bootstrap dropdown
- `data-toggle="collapse"` - Bootstrap collapse
- `data-target="#target-id"` - Target element

---

## Icon Reference

### Font Awesome Icons
```html
<!-- Solid icons -->
<i class="fas fa-stethoscope"></i>
<i class="fas fa-ambulance"></i>
<i class="fas fa-ribbon"></i>
<i class="fas fa-play"></i>
<i class="fas fa-angle-right"></i>
<i class="fas fa-bars"></i>
<i class="fas fa-times"></i>

<!-- Brand icons -->
<i class="fab fa-facebook-f"></i>
<i class="fab fa-twitter"></i>
<i class="fab fa-linkedin-in"></i>
<i class="fab fa-youtube"></i>
```

### Flaticon Icons
```html
<i class="flaticon-calendar"></i>
<i class="flaticon-doctor"></i>
<i class="flaticon-heartbeat-1"></i>
<i class="flaticon-cardiologist"></i>
<i class="flaticon-dermatologist"></i>
<i class="flaticon-paramedic"></i>
<i class="flaticon-therapist"></i>
<i class="flaticon-call"></i>
<i class="flaticon-email"></i>
```

### Themify Icons
```html
<i class="ti-icon-name"></i>
```

---

## Color Customization

### CSS Variables (style.css)
```css
:root {
    --color-primary: #1ebeb6;        /* Teal/Turquoise */
    --color-secondary: #001d4c;      /* Dark Blue */
    --color-heading: #232323;         /* Dark Gray */
    --color-paragraph: #666666;       /* Medium Gray */
    --bg-gray: #f7f7f7;              /* Light Gray */
    --dark: #1d2024;                 /* Dark Background */
}
```

### Change Primary Color
1. Update `--color-primary` in `:root`
2. Update gradient if needed: `--bg-gradient`
3. Check all components for color consistency

### Change Secondary Color
1. Update `--color-secondary` in `:root`
2. Update gradient: `--bg-gradient`

---

## Responsive Breakpoints

### Bootstrap Breakpoints
- **Extra Small**: < 576px (Mobile)
- **Small**: ≥ 576px (Large Mobile)
- **Medium**: ≥ 768px (Tablet)
- **Large**: ≥ 992px (Desktop)
- **Extra Large**: ≥ 1200px (Large Desktop)

### Custom Media Queries
```css
@media (max-width: 767px) { /* Mobile */ }
@media (min-width: 768px) and (max-width: 991px) { /* Tablet */ }
@media (min-width: 992px) { /* Desktop */ }
```

---

## File Paths Reference

### CSS Files
```
assets/css/bootstrap.min.css
assets/css/animate.css
assets/css/magnific-popup.css
assets/css/owl.carousel.min.css
assets/css/font-awesome.min.css
assets/css/themify-icons.css
assets/css/bootsnav.css
assets/css/flaticon-set.css
style.css
assets/css/responsive.css
```

### JavaScript Files
```
assets/js/jquery-3.7.1.min.js
assets/js/bootstrap.min.js
assets/js/popper.min.js
assets/js/bootsnav.js
assets/js/owl.carousel.min.js
assets/js/jquery.magnific-popup.min.js
assets/js/wow.min.js
assets/js/isotope.pkgd.min.js
assets/js/imagesloaded.pkgd.min.js
assets/js/count-to.js
assets/js/jquery.appear.js
assets/js/jquery.nice-select.min.js
assets/js/main.js
```

### Image Directories
```
assets/img/logo.png
assets/img/banner/
assets/img/about/
assets/img/departments/
assets/img/doctors/
assets/img/blog/
assets/img/team/
assets/img/gallery/
assets/img/icon/
assets/img/shape/
```

---

## Common Issues & Solutions

### Carousel Not Working
**Problem**: Carousel doesn't slide or show items.

**Solution**:
1. Check jQuery is loaded before Owl Carousel
2. Verify Owl Carousel CSS is included
3. Ensure container has correct class: `.owl-carousel`
4. Check JavaScript initialization in `main.js`

### Animations Not Triggering
**Problem**: WOW.js animations don't play.

**Solution**:
1. Ensure WOW.js is loaded
2. Add `wow` class to element
3. Add `data-animation` attribute
4. Check element is in viewport
5. Verify `wow.init()` is called

### Form Not Submitting
**Problem**: Contact form doesn't send emails.

**Solution**:
1. Check PHP handler path: `assets/mail/contact.php`
2. Verify server supports PHP
3. Check form action attribute
4. Verify AJAX is working (check console)
5. Test form validation

### Navigation Not Sticky
**Problem**: Navigation doesn't stick on scroll.

**Solution**:
1. Check `.navbar-sticky` class is present
2. Verify BootsNav JS is loaded
3. Check CSS for sticky positioning
4. Verify z-index is correct

### Icons Not Displaying
**Problem**: Font icons show as squares or don't appear.

**Solution**:
1. Verify font CSS files are loaded
2. Check font file paths are correct
3. Verify icon class names are correct
4. Check font files exist in `assets/fonts/`

### Mobile Menu Not Working
**Problem**: Hamburger menu doesn't open.

**Solution**:
1. Check Bootstrap JS is loaded
2. Verify `data-toggle="collapse"` attribute
3. Check `data-target` matches ID
4. Verify BootsNav JS is loaded
5. Check for JavaScript errors in console

### Counter Not Counting
**Problem**: Number counters don't animate.

**Solution**:
1. Ensure Count To plugin is loaded
2. Verify jQuery Appear is loaded
3. Check `.timer` class is present
4. Verify `data-to` attribute has value
5. Check initialization in `main.js`

---

## Performance Tips

### Image Optimization
- Use optimized image formats (WebP, JPEG 2000)
- Compress images before uploading
- Use appropriate image sizes
- Implement lazy loading

### CSS Optimization
- Minify CSS files
- Remove unused CSS
- Combine CSS files where possible
- Use CSS variables efficiently

### JavaScript Optimization
- Load scripts at end of body
- Use minified versions
- Defer non-critical scripts
- Remove unused plugins

### Loading Optimization
- Enable browser caching
- Use CDN for libraries
- Minimize HTTP requests
- Optimize font loading

---

## Browser Testing Checklist

- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Opera (latest)
- [ ] Mobile Chrome (Android)
- [ ] Mobile Safari (iOS)
- [ ] Tablet viewports
- [ ] Desktop viewports
- [ ] Large screen viewports

### Test Features
- [ ] Navigation menu
- [ ] Dropdown menus
- [ ] Mobile menu
- [ ] Carousels/sliders
- [ ] Forms
- [ ] Animations
- [ ] Popups/lightboxes
- [ ] Gallery filtering
- [ ] Counter animations
- [ ] Responsive layout

---

## SEO Checklist

### Meta Tags
```html
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="description" content="Page description">
<meta name="keywords" content="keywords, here">
```

### Title Tags
```html
<title>Page Title - Healdi Medical</title>
```

### Alt Attributes
```html
<img src="image.jpg" alt="Descriptive alt text">
```

### Semantic HTML
- Use proper heading hierarchy (h1, h2, h3)
- Use semantic HTML5 elements
- Include proper link text
- Use descriptive class names

### Performance
- Optimize images
- Minify CSS/JS
- Enable compression
- Use CDN if possible

### Accessibility
- Add ARIA labels where needed
- Ensure keyboard navigation works
- Check color contrast
- Add alt text to images

---

*This quick reference guide provides essential information for working with the Healdi v1.2 template. For detailed documentation, refer to the main documentation files.*
