# Meciy Template - Quick Reference Guide

## Common Tasks

### Change Logo
```html
<!-- Header -->
<a href="index.html">
  <img src="assets/images/resources/logo-1.png" alt="">
</a>

<!-- Mobile Nav -->
<img src="assets/images/resources/logo-1.png" alt="">

<!-- Sidebar -->
<img src="assets/images/resources/logo-1.png" alt="">
```

### Add New Menu Item
```html
<li>
  <a href="new-page.html">New Page
    <span class="main-menu-border"></span>
  </a>
</li>
```

### Add Dropdown Menu
```html
<li class="dropdown">
  <a href="#">Parent
    <span class="main-menu-border"></span>
  </a>
  <ul>
    <li><a href="child-1.html">Child 1</a></li>
    <li><a href="child-2.html">Child 2</a></li>
  </ul>
</li>
```

### Create New Slider Slide
```html
<div class="swiper-slide">
  <div class="image-layer" 
       style="background-image: url(path/to/image.jpg);">
  </div>
  <div class="container">
    <div class="main-slider__content">
      <h2 class="main-slider__title">Your Title</h2>
      <a href="link.html" class="thm-btn">Button Text</a>
    </div>
  </div>
</div>
```

### Add Feature Card
```html
<div class="col-xl-3 col-lg-6 col-md-6 wow fadeInUp" data-wow-delay="100ms">
  <div class="feature-one__single">
    <div class="feature-one__title-box">
      <h3 class="feature-one__title">
        <a href="link.html">Feature Title</a>
      </h3>
    </div>
    <div class="feature-one__text-box">
      <p class="feature-one__text">Description text here.</p>
      <div class="feature-one__read-more">
        <a href="link.html">Read More</a>
      </div>
    </div>
    <div class="feature-one__icon">
      <span class="icon-your-icon"></span>
    </div>
  </div>
</div>
```

### Add Counter
```html
<div class="counter-one__count-box">
  <h3 class="odometer" data-count="1234">00</h3>
  <span class="counter-one__plus">+</span>
</div>
```

### Add Team Member
```html
<div class="col-xl-3 col-lg-6 col-md-6 wow fadeInUp">
  <div class="team-one__single">
    <div class="team-one__img">
      <img src="assets/images/team/member.jpg" alt="">
      <ul class="list-unstyled team-one__social">
        <li><a href="#"><i class="fab fa-twitter"></i></a></li>
        <li><a href="#"><i class="fab fa-facebook"></i></a></li>
      </ul>
    </div>
    <div class="team-one__content">
      <h4 class="team-one__name">
        <a href="team-details.html">Name</a>
      </h4>
      <p class="team-one__sub-title">Job Title</p>
    </div>
  </div>
</div>
```

### Add Service Card
```html
<div class="col-xl-4 col-lg-4 wow fadeInUp">
  <div class="services-one__single">
    <div class="services-one__content">
      <h3 class="services-one__title">
        <a href="service.html">Service Name</a>
      </h3>
      <p class="services-one__text">Description.</p>
    </div>
    <div class="services-one__img-box">
      <div class="services-one__img">
        <img src="assets/images/services/service.jpg" alt="">
      </div>
      <div class="services-one__icon">
        <span class="icon-your-icon"></span>
      </div>
    </div>
  </div>
</div>
```

### Add Portfolio Item
```html
<div class="item">
  <div class="portfolio-one__single">
    <div class="portfolio-one__img-box">
      <div class="portfolio-one__img">
        <img src="assets/images/project/portfolio.jpg" alt="">
      </div>
      <div class="portfolio-one__content">
        <div class="portfolio-one__content-inner">
          <p class="portfolio-one__sub-title">Category</p>
          <h3 class="portfolio-one__title">
            <a href="portfolio-details.html">Project Name</a>
          </h3>
        </div>
        <div class="portfolio-one__arrow">
          <a href="portfolio-details.html">
            <i class="fas fa-angle-double-right"></i>
          </a>
        </div>
      </div>
    </div>
  </div>
</div>
```

### Add FAQ Item
```html
<div class="accrodion">
  <div class="accrodion-title">
    <h4>Question Text?</h4>
  </div>
  <div class="accrodion-content">
    <p>Answer text here.</p>
  </div>
</div>
```

### Add Blog Post
```html
<div class="col-xl-4 col-lg-4 wow fadeInUp">
  <div class="blog-one__single">
    <div class="blog-one__img">
      <img src="assets/images/blog/post.jpg" alt="">
      <div class="blog-one__date">
        <span>15</span>
        <p>Jan</p>
      </div>
    </div>
    <div class="blog-one__content">
      <ul class="list-unstyled blog-one__meta">
        <li>By Admin</li>
        <li>15 Comments</li>
      </ul>
      <h3 class="blog-one__title">
        <a href="blog-details.html">Post Title</a>
      </h3>
      <p class="blog-one__text">Excerpt text...</p>
      <a href="blog-details.html" class="blog-one__btn">Read More</a>
    </div>
  </div>
</div>
```

## CSS Classes Reference

### Layout Classes
- `.container` - Bootstrap container
- `.row` - Bootstrap row
- `.col-xl-*` - Extra large columns
- `.col-lg-*` - Large columns
- `.col-md-*` - Medium columns
- `.col-sm-*` - Small columns
- `.col-*` - Extra small columns

### Animation Classes
- `.wow` - WOW.js trigger
- `.fadeInUp` - Fade + slide up
- `.fadeInDown` - Fade + slide down
- `.slideInLeft` - Slide from left
- `.slideInRight` - Slide from right
- `.zoomIn` - Zoom in effect
- `.float-bob-x` - Horizontal float
- `.float-bob-y` - Vertical float
- `.img-bounce` - Bounce animation

### Component Classes
- `.thm-btn` - Theme button
- `.section-title` - Section heading
- `.section-title__tagline` - Tagline text
- `.section-title__title` - Main title
- `.list-unstyled` - Remove list styling
- `.text-center` - Center align text
- `.text-left` - Left align text

### Utility Classes
- `.hidden-lg` - Hide on large screens
- `.wow` - Animation trigger
- `data-wow-delay` - Animation delay
- `data-wow-duration` - Animation duration

## JavaScript Functions Reference

### Swiper Slider
```javascript
// HTML Configuration
<div class="thm-swiper__slider" data-swiper-options='{
  "slidesPerView": 1,
  "loop": true,
  "autoplay": { "delay": 5000 }
}'>
```

### Owl Carousel
```javascript
// HTML Configuration
<div class="thm-owl__carousel" data-owl-options='{
  "items": 3,
  "margin": 30,
  "autoplay": 6000
}'>
```

### Odometer Counter
```html
<h3 class="odometer" data-count="1234">00</h3>
```

### Form Validation
```html
<form class="contact-form-validated">
  <!-- Form fields -->
</form>
```

### MailChimp Form
```html
<form class="mc-form" data-url="YOUR_MAILCHIMP_URL">
  <input type="email" name="EMAIL">
  <button type="submit">Subscribe</button>
</form>
<div class="mc-form__response"></div>
```

### Video Popup
```html
<a href="https://youtube.com/watch?v=VIDEO_ID" class="video-popup">
  <span class="fa fa-play"></span>
</a>
```

### Image Gallery
```html
<a href="image.jpg" class="img-popup" data-group="1">
  <img src="thumb.jpg" alt="">
</a>
```

## Data Attributes Reference

### Animation
- `data-wow-delay` - Animation delay (e.g., "100ms")
- `data-wow-duration` - Animation duration (e.g., "2500ms")
- `data-count` - Counter target number
- `data-percent` - Progress bar percentage

### Sliders
- `data-swiper-options` - Swiper configuration (JSON)
- `data-owl-options` - Owl Carousel configuration (JSON)
- `data-owl-nav-prev` - Custom prev button selector
- `data-owl-nav-next` - Custom next button selector

### Forms
- `data-url` - MailChimp form URL
- `data-group` - Image gallery group ID

### Navigation
- `data-target` - Scroll target element
- `data-text-preloader` - Preloader letter text

## Icon Reference

### Meciy Custom Icons
```html
<span class="icon-consulting"></span>
<span class="icon-meditation"></span>
<span class="icon-brain"></span>
<span class="icon-counseling"></span>
<span class="icon-doctor"></span>
<span class="icon-phone-call"></span>
<span class="icon-message"></span>
<span class="icon-location"></span>
<span class="icon-right-arrow"></span>
<span class="icon-magnifying-glass"></span>
```

### Font Awesome
```html
<!-- Social Media -->
<i class="fab fa-facebook-f"></i>
<i class="fab fa-twitter"></i>
<i class="fab fa-instagram"></i>
<i class="fab fa-linkedin-in"></i>
<i class="fab fa-youtube"></i>

<!-- UI Icons -->
<i class="fas fa-envelope"></i>
<i class="fas fa-phone-alt"></i>
<i class="fas fa-map-marker-alt"></i>
<i class="fa fa-bars"></i>
<i class="fa fa-times"></i>
<i class="fa fa-angle-up"></i>
<i class="fa fa-play"></i>
```

## Color Customization

### Primary Colors (Find in meciy.css)
- Search for: `#hex` values or `rgb()` values
- Common locations:
  - Button backgrounds
  - Link colors
  - Heading colors
  - Border colors

### Quick Color Replace
1. Open `assets/css/meciy.css`
2. Search for color values
3. Replace with your brand colors
4. Save and refresh

## Responsive Breakpoints

- **Mobile**: < 576px - Single column, mobile menu
- **Small**: ≥ 576px - 2 columns possible
- **Medium**: ≥ 768px - 2-3 columns, tablet menu
- **Large**: ≥ 992px - 3-4 columns, desktop menu
- **XL**: ≥ 1200px - 4+ columns, full features
- **XXL**: ≥ 1400px - Maximum columns

## File Paths Reference

### Images
- Logo: `assets/images/resources/logo-1.png`
- Backgrounds: `assets/images/backgrounds/`
- Services: `assets/images/services/`
- Team: `assets/images/team/`
- Portfolio: `assets/images/project/`
- Blog: `assets/images/blog/`

### CSS
- Main: `assets/css/meciy.css`
- Responsive: `assets/css/meciy-responsive.css`

### JavaScript
- Main: `assets/js/meciy.js`
- Vendors: `assets/vendors/[library-name]/`

### PHP
- Form Handler: `assets/inc/sendemail.php`

## Common Issues & Solutions

### Slider Not Working
- Check Swiper.js is loaded
- Verify `data-swiper-options` JSON is valid
- Check console for errors

### Animations Not Triggering
- Ensure WOW.js is loaded
- Check `wow` class is present
- Verify element is in viewport

### Form Not Submitting
- Check PHP handler path is correct
- Verify form has `contact-form-validated` class
- Check jQuery Validate is loaded
- Verify all required fields are present

### Mobile Menu Not Working
- Check jQuery is loaded
- Verify mobile nav HTML structure
- Check for JavaScript errors in console

### Icons Not Showing
- Verify icon font files are loaded
- Check icon class name is correct
- Verify Font Awesome CSS is loaded (for FA icons)

## Performance Tips

1. **Optimize Images**: Compress before uploading
2. **Minify CSS/JS**: Use minified versions in production
3. **Lazy Load**: Implement lazy loading for images
4. **CDN**: Use CDN for jQuery and Bootstrap
5. **Cache**: Enable browser caching for static assets

## Browser Testing Checklist

- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)
- [ ] Tablet views (iPad, Android tablets)

## SEO Checklist

- [ ] Update page titles
- [ ] Add meta descriptions
- [ ] Add alt text to images
- [ ] Use semantic HTML5 tags
- [ ] Add structured data (if needed)
- [ ] Create XML sitemap
- [ ] Add robots.txt
- [ ] Optimize page load speed
