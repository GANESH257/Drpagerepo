import { getZIPCoordinates, getCityStateCoordinates } from '@/data/zipCoordinates';

/**
 * Calculate the distance between two points on Earth using the Haversine formula
 * Returns distance in miles
 */
export function haversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 3959; // Earth's radius in miles
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return Math.round(distance * 10) / 10; // Round to 1 decimal place
}

/**
 * Convert degrees to radians
 */
function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Convert miles to meters
 */
export function milesToMeters(miles: number): number {
  return miles * 1609.34;
}

/**
 * Convert meters to miles
 */
export function metersToMiles(meters: number): number {
  return meters / 1609.34;
}

/**
 * Get coordinates for a ZIP code
 * Uses the zipCoordinates mapping or returns null
 */
export function getZIPLatLng(zip: string): { lat: number; lng: number } | null {
  return getZIPCoordinates(zip);
}

/**
 * Get coordinates from a location object (city, state, zip)
 * Tries ZIP first, then falls back to city/state
 */
export function getLocationCoordinates(
  zip?: string,
  city?: string,
  state?: string
): { lat: number; lng: number } | null {
  // Try ZIP first
  if (zip) {
    const zipCoords = getZIPLatLng(zip);
    if (zipCoords) return zipCoords;
  }
  
  // Fallback to city/state
  if (city && state) {
    return getCityStateCoordinates(city, state);
  }
  
  return null;
}

/**
 * Calculate distance from a ZIP code to coordinates
 */
export function distanceFromZIP(
  zip: string,
  targetLat: number,
  targetLng: number
): number | null {
  const zipCoords = getZIPLatLng(zip);
  if (!zipCoords) return null;
  
  return haversineDistance(zipCoords.lat, zipCoords.lng, targetLat, targetLng);
}

/**
 * Calculate distance between two ZIP codes
 */
export function distanceBetweenZIPs(zip1: string, zip2: string): number | null {
  const coords1 = getZIPLatLng(zip1);
  const coords2 = getZIPLatLng(zip2);
  
  if (!coords1 || !coords2) return null;
  
  return haversineDistance(coords1.lat, coords1.lng, coords2.lat, coords2.lng);
}
