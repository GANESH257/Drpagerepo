'use client';

import { getZIPCoordinates } from '@/data/zipCoordinates';

/**
 * Geocode a ZIP code to lat/lng coordinates
 * Tries static lookup first, then falls back to Google Geocoding API if available
 */
export async function geocodeZip(zip: string): Promise<{ lat: number; lng: number; label: string }> {
  const normalizedZip = zip.trim().replace(/\D/g, '').substring(0, 5);
  
  if (!normalizedZip || normalizedZip.length !== 5) {
    throw new Error('Invalid ZIP code. Please enter a 5-digit ZIP code.');
  }

  // Try static lookup first (fast, no API call)
  const staticCoords = getZIPCoordinates(normalizedZip);
  if (staticCoords) {
    return {
      lat: staticCoords.lat,
      lng: staticCoords.lng,
      label: normalizedZip,
    };
  }

  // Fallback to Google Geocoding API if API key is available
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (apiKey) {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${normalizedZip}&key=${apiKey}`
      );
      
      if (!response.ok) {
        throw new Error('Geocoding API request failed');
      }

      const data = await response.json();
      
      if (data.status === 'OK' && data.results && data.results.length > 0) {
        const location = data.results[0].geometry.location;
        return {
          lat: location.lat,
          lng: location.lng,
          label: normalizedZip,
        };
      } else if (data.status === 'ZERO_RESULTS') {
        throw new Error(`Couldn't locate ZIP code ${normalizedZip}. Try another ZIP code.`);
      } else if (data.status === 'REQUEST_DENIED') {
        // API key issue - provide helpful error message
        console.warn('Google Geocoding API request denied. Check API key permissions and enable Geocoding API.');
        throw new Error(`Geocoding service unavailable. Please check your API key configuration or try another ZIP code.`);
      } else if (data.status === 'OVER_QUERY_LIMIT') {
        throw new Error(`Geocoding service temporarily unavailable. Please try again later.`);
      } else {
        // For other errors, log the status but provide user-friendly message
        console.warn(`Google Geocoding API error: ${data.status}`);
        throw new Error(`Couldn't locate ZIP code ${normalizedZip}. Try another ZIP code.`);
      }
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to geocode ZIP code. Please try another ZIP code.');
    }
  }

  // No API key and not in static lookup
  throw new Error(`Couldn't locate ZIP code ${normalizedZip}. Try another ZIP code.`);
}
