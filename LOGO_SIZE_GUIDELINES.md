# Logo Size Guidelines

## Current Logo Files

Based on your project, you have:
- `newlogodrp.png`: **2500 x 422 pixels** (original, high resolution)
- `newlogodrps.png`: **1800 x 304 pixels** (smaller version)

## Current Usage in Code

### Header (Navigation Bar)
```tsx
<Image
  src="/newlogodrps.png"
  width={200}
  height={60}
  className="h-10 md:h-12 w-auto"
/>
```
**Display Size**: 
- Mobile: ~40px height (h-10)
- Desktop: ~48px height (h-12)
- Width: Auto (maintains aspect ratio)

### Footer
```tsx
<Image
  src="/newlogodrps.png"
  width={200}
  height={60}
  className="h-10 md:h-12 w-auto"
/>
```
**Display Size**: Same as header

### Mission Statement Section
```tsx
<Image
  src="/newlogodrps.png"
  width={120}
  height={60}
  className="h-12 md:h-16 w-auto"
/>
```
**Display Size**:
- Mobile: ~48px height (h-12)
- Desktop: ~64px height (h-16)

---

## Ideal Logo Image Sizes

### For Web Use (Recommended)

#### 1. **Source File (High Resolution)**
- **Dimensions**: 2000-3000px width × 400-600px height
- **Format**: PNG with transparency (RGBA)
- **Aspect Ratio**: ~5:1 to 6:1 (wide horizontal logo)
- **File Size**: Under 500KB (optimized)
- **Purpose**: Master file for all uses

#### 2. **Header/Footer Logo**
- **Dimensions**: 400-600px width × 80-120px height
- **Format**: PNG with transparency
- **Display Size**: 200px × 60px (scaled down)
- **File Size**: Under 100KB
- **Purpose**: Navigation bar, footer

#### 3. **Mission Statement Logo**
- **Dimensions**: 300-400px width × 60-80px height
- **Format**: PNG with transparency
- **Display Size**: 120px × 60px
- **File Size**: Under 50KB
- **Purpose**: Mission statement section

#### 4. **Favicon**
- **Dimensions**: 32px × 32px, 64px × 64px, 192px × 192px
- **Format**: PNG or ICO
- **Purpose**: Browser tab icon

---

## Best Practices

### 1. **Aspect Ratio**
Your logo appears to have a **~5.9:1 aspect ratio** (wide horizontal format).
- Maintain this ratio in all sizes
- Use `w-auto` with fixed height to maintain proportions

### 2. **File Formats**

**PNG** (Recommended):
- ✅ Supports transparency
- ✅ Lossless quality
- ✅ Best for logos with text/graphics
- ⚠️ Larger file size

**SVG** (Ideal if possible):
- ✅ Scalable without quality loss
- ✅ Small file size
- ✅ Perfect for simple logos
- ⚠️ Complex logos may not convert well

**WebP** (Modern alternative):
- ✅ Better compression than PNG
- ✅ Supports transparency
- ⚠️ Browser compatibility (good now)

### 3. **Optimization**

**For PNG:**
- Use tools like TinyPNG, ImageOptim, or Squoosh
- Remove metadata
- Optimize color palette if possible
- Target file size: < 100KB for web use

**For SVG:**
- Clean up paths
- Remove unnecessary elements
- Optimize with SVGO

### 4. **Responsive Sizes**

Create multiple sizes for different breakpoints:

```tsx
// Mobile (default)
className="h-8 w-auto"  // ~32px height

// Tablet (md:)
className="md:h-10 w-auto"  // ~40px height

// Desktop (lg:)
className="lg:h-12 w-auto"  // ~48px height

// Large Desktop (xl:)
className="xl:h-14 w-auto"  // ~56px height
```

---

## Recommended Logo Specifications

### Primary Logo (Header/Footer)
- **Source**: 2000px × 400px (5:1 ratio)
- **Optimized**: 600px × 120px
- **Display**: 200px × 60px (scaled)
- **Format**: PNG with transparency
- **File Size**: < 100KB

### Secondary Logo (Mission Statement)
- **Source**: 1200px × 240px (5:1 ratio)
- **Optimized**: 400px × 80px
- **Display**: 120px × 60px (scaled)
- **Format**: PNG with transparency
- **File Size**: < 50KB

### Favicon
- **Sizes**: 32×32, 64×64, 192×192, 512×512
- **Format**: PNG or ICO
- **File Size**: < 20KB each

---

## Current Implementation Analysis

### What's Working Well ✅
- Using `w-auto` maintains aspect ratio
- Responsive sizing with Tailwind classes
- Using Next.js Image component (optimization)
- Separate file for smaller use (`newlogodrps.png`)

### Recommendations 📝

1. **Optimize Current Files**:
   - Compress `newlogodrp.png` (2500×422) - likely too large
   - Optimize `newlogodrps.png` (1800×304) - good size but can be compressed

2. **Consider SVG Version**:
   - If logo is simple enough, create SVG version
   - Much smaller file size
   - Perfect scaling at any size

3. **Add Retina/HiDPI Support**:
   ```tsx
   <Image
     src="/newlogodrps.png"
     srcSet="/newlogodrps.png 1x, /newlogodrp.png 2x"
     width={200}
     height={60}
     className="h-10 md:h-12 w-auto"
   />
   ```

4. **File Size Targets**:
   - Header logo: < 80KB
   - Mission logo: < 40KB
   - Original: < 300KB

---

## Quick Reference

| Use Case | Source Size | Display Size | File Size Target |
|----------|-------------|--------------|------------------|
| Header/Footer | 600×120px | 200×60px | < 100KB |
| Mission Statement | 400×80px | 120×60px | < 50KB |
| Favicon | 192×192px | 32×32px | < 20KB |
| Original/Master | 2000×400px | N/A | < 500KB |

---

## Tools for Optimization

1. **TinyPNG** (https://tinypng.com/) - PNG compression
2. **Squoosh** (https://squoosh.app/) - Image optimization
3. **ImageOptim** (Mac app) - Batch optimization
4. **SVGO** - SVG optimization
5. **Next.js Image** - Built-in optimization (already using)

---

**Last Updated**: January 29, 2026
