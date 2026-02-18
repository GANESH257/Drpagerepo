# ZIP Code Lookup Alternatives

## Current Approach
Currently using a static mapping file (`zipCoordinates.ts`) with manually added ZIP codes.

## Alternative Options

### 1. **npm Package: `us-zips` or `zipcode-lookup`**
```bash
npm install us-zips
```
- Pros: Comprehensive database, easy to use
- Cons: Adds to bundle size, may include unnecessary data
- Usage: `import { lookup } from 'us-zips'; const coords = lookup('60601');`

### 2. **Geocoding API (Google Maps, Mapbox, etc.)**
```typescript
// Example with Google Maps Geocoding API
const response = await fetch(
  `https://maps.googleapis.com/maps/api/geocode/json?address=${zipCode}&key=${API_KEY}`
);
const data = await response.json();
const { lat, lng } = data.results[0].geometry.location;
```
- Pros: Always up-to-date, comprehensive coverage
- Cons: Requires API key, network calls, costs money at scale, not suitable for static export

### 3. **CSV/JSON File Import**
- Download free ZIP code database (e.g., from GeoNames, USPS)
- Convert to JSON and import
- Pros: Free, comprehensive
- Cons: Large file size, needs periodic updates

### 4. **Expand Current Mapping (Recommended for Static Export)**
- Add more ZIP codes to `zipCoordinates.ts` as needed
- Extract ZIPs from doctor/institution data automatically
- Pros: No external dependencies, works with static export
- Cons: Manual maintenance, limited coverage

### 5. **Hybrid Approach**
- Use static mapping for common ZIPs
- Fallback to geocoding API for missing ZIPs (client-side)
- Pros: Best of both worlds
- Cons: Requires API key, network calls for fallback

## Recommendation for This Project

Since this is a **static export** Next.js app, the best approach is:

1. **Expand `zipCoordinates.ts`** with ZIP codes from:
   - All doctor locations
   - All institution locations
   - Common ZIP codes in the service area

2. **Create a script** to automatically extract and add ZIP codes from existing data

3. **For missing ZIPs**, use city/state fallback coordinates (already implemented)

This ensures:
- ✅ No external dependencies
- ✅ Works with static export
- ✅ Fast, no network calls
- ✅ No API costs
