'use client';

import { useEffect, useRef, useState } from 'react';
import { Practice } from '@/types/practice';
import { Loader2 } from 'lucide-react';
import { MarkerClusterer } from '@googlemaps/markerclusterer';

interface PracticeMapProps {
  practices: Array<Practice & { distanceMiles?: number }>;
  origin?: { lat: number; lng: number; label: string };
  selectedPracticeId?: string;
  onSelectPractice: (practiceId: string) => void;
}

/**
 * Calculate offset for overlapping markers
 * Returns offset in degrees (lat/lng) to prevent exact overlap
 */
function calculateOffset(index: number, total: number): { latOffset: number; lngOffset: number } {
  // Simple 2x2 grid pattern: alternate positions
  const row = Math.floor(index / 2);
  const col = index % 2;
  const offset = 0.0001; // ~11 meters - subtle but visible
  return {
    latOffset: row * offset,
    lngOffset: col * offset,
  };
}

/**
 * Find all locations that share the exact same coordinates
 */
function findOverlappingLocations(
  location: { lat: number; lng: number },
  allLocations: Array<{ lat: number; lng: number; id: string; practiceId: string }>
): Array<{ lat: number; lng: number; id: string; practiceId: string; index: number }> {
  const overlapping: Array<{ lat: number; lng: number; id: string; practiceId: string; index: number }> = [];
  allLocations.forEach((loc, index) => {
    if (loc.lat === location.lat && loc.lng === location.lng) {
      overlapping.push({ ...loc, index });
    }
  });
  return overlapping;
}

/**
 * Load Google Maps script globally (only once)
 * Caches promise on window.__googleMapsPromise to prevent duplicate script tags
 */
function loadGoogleMaps(apiKey: string): Promise<void> {
  // Return cached promise if already loading/loaded
  if (window.__googleMapsPromise) {
    return window.__googleMapsPromise;
  }

  // If already loaded, return resolved promise
  if (window.google?.maps) {
    return Promise.resolve();
  }

  // Create and cache promise
  const promise = new Promise<void>((resolve, reject) => {
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      resolve();
    };
    script.onerror = () => {
      window.__googleMapsPromise = undefined; // Clear cache on error
      reject(new Error('Failed to load Google Maps'));
    };
    document.head.appendChild(script);
  });

  window.__googleMapsPromise = promise;
  return promise;
}

/**
 * PracticeMap component - displays practices on a map
 * Uses Google Maps if API key is available, otherwise shows placeholder
 * Loaded dynamically with SSR disabled
 */
export function PracticeMap({ practices, origin, selectedPracticeId, onSelectPractice }: PracticeMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Refs for map and markers
  const googleMapRef = useRef<any>(null);
  const markersByIdRef = useRef<Map<string, any>>(new Map()); // Keyed by practiceId__locationId
  const practiceMarkerKeysRef = useRef<Map<string, string[]>>(new Map()); // practiceId → [markerKeys]
  const originMarkerRef = useRef<any>(null);
  const markerClustererRef = useRef<MarkerClusterer | null>(null);
  
  // Ref for callback to prevent re-initialization when callback changes
  const onSelectPracticeRef = useRef(onSelectPractice);

  const apiKey = typeof window !== 'undefined' ? process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY : null;

  // Update callback ref when it changes (doesn't trigger effects)
  useEffect(() => {
    onSelectPracticeRef.current = onSelectPractice;
  }, [onSelectPractice]);

  // Effect A: Script Loading & Map Initialization (once per mount)
  useEffect(() => {
    if (!mapRef.current || !apiKey) {
      setIsLoading(false);
      setMapError(apiKey ? null : 'Google Maps API key not configured');
      return;
    }

    let isMounted = true;

    loadGoogleMaps(apiKey)
      .then(() => {
        if (!isMounted || !mapRef.current || !window.google?.maps) return;

        try {
          const google = window.google;
          // Initialize map once
          const map = new google.maps.Map(mapRef.current, {
            zoom: 8,
            center: { lat: 39.8283, lng: -98.5795 }, // Center of US
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: true,
          });

          googleMapRef.current = map;
          setMapLoaded(true);
          setIsLoading(false);
        } catch (error) {
          console.error('Error initializing map:', error);
          if (isMounted) {
            setMapError('Failed to initialize map');
            setIsLoading(false);
          }
        }
      })
      .catch((error) => {
        console.error('Error loading Google Maps:', error);
        if (isMounted) {
          setMapError('Failed to load Google Maps');
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [apiKey]);

  // Effect B: Origin Marker Management
  useEffect(() => {
    if (!googleMapRef.current || !mapLoaded || !window.google?.maps) return;

    const google = window.google;
    const map = googleMapRef.current;

    // Remove old origin marker if exists
    if (originMarkerRef.current) {
      originMarkerRef.current.setMap(null);
      originMarkerRef.current = null;
    }

    // Create new origin marker if origin provided
    if (origin) {
      const originMarker = new google.maps.Marker({
        position: { lat: origin.lat, lng: origin.lng },
        map,
        title: `Origin: ${origin.label}`,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: '#0F5FA8',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 2,
        },
        zIndex: 1000,
      });
      originMarkerRef.current = originMarker;

      // Refit bounds to include origin + practice markers
      const bounds = new google.maps.LatLngBounds();
      bounds.extend({ lat: origin.lat, lng: origin.lng });

      // Add practice markers to bounds
      markersByIdRef.current.forEach((marker) => {
        const position = marker.getPosition();
        if (position) {
          bounds.extend(position);
        }
      });

      if (markersByIdRef.current.size > 0 || bounds.getNorthEast().lat() !== bounds.getSouthWest().lat()) {
        map.fitBounds(bounds);
        // Cap max zoom to 15
        const listener = google.maps.event.addListener(map, 'bounds_changed', () => {
          if (map.getZoom() && map.getZoom()! > 15) {
            map.setZoom(15);
          }
          google.maps.event.removeListener(listener);
        });
      } else {
        // Only origin, center on it
        map.setCenter({ lat: origin.lat, lng: origin.lng });
        map.setZoom(10);
      }
    } else {
      // No origin, refit bounds to practice markers only
      const bounds = new google.maps.LatLngBounds();
      markersByIdRef.current.forEach((marker) => {
        const position = marker.getPosition();
        if (position) {
          bounds.extend(position);
        }
      });

      if (markersByIdRef.current.size > 0) {
        map.fitBounds(bounds);
        // Cap max zoom to 15
        const listener = google.maps.event.addListener(map, 'bounds_changed', () => {
          if (map.getZoom() && map.getZoom()! > 15) {
            map.setZoom(15);
          }
          google.maps.event.removeListener(listener);
        });
      }
    }
  }, [origin, mapLoaded]);

  // Effect C: Practice Markers Management
  useEffect(() => {
    if (!googleMapRef.current || !mapLoaded || !window.google?.maps) return;

    const google = window.google;
    const map = googleMapRef.current;

    // Clear all existing practice markers
    markersByIdRef.current.forEach((marker) => {
      marker.setMap(null);
    });
    markersByIdRef.current.clear();
    practiceMarkerKeysRef.current.clear();

    // Clear existing clusterer if it exists
    if (markerClustererRef.current) {
      markerClustererRef.current.clearMarkers();
      markerClustererRef.current = null;
    }

    // Collect all locations with coordinates for overlap detection
    const allLocationsWithCoords: Array<{ lat: number; lng: number; id: string; practiceId: string }> = [];
    practices.forEach((practice) => {
      if (!practice.locations || practice.locations.length === 0) return;
      practice.locations.forEach((location) => {
        if (location.lat && location.lng) {
          allLocationsWithCoords.push({
            lat: location.lat,
            lng: location.lng,
            id: location.id,
            practiceId: practice.id,
          });
        }
      });
    });

    // Create markers for ALL locations (one marker per location)
    practices.forEach((practice) => {
      if (!practice.locations || practice.locations.length === 0) return;

      const markerKeys: string[] = [];

      practice.locations.forEach((location) => {
        if (!location.lat || !location.lng) return;

        // Check for overlapping coordinates and calculate offset if needed
        const overlapping = findOverlappingLocations(
          { lat: location.lat, lng: location.lng },
          allLocationsWithCoords
        );
        
        let position = { lat: location.lat, lng: location.lng };
        if (overlapping.length > 1) {
          // Find this location's index in overlapping group
          const locationIndex = overlapping.findIndex(
            (loc) => loc.id === location.id && loc.practiceId === practice.id
          );
          if (locationIndex >= 0) {
            const offset = calculateOffset(locationIndex, overlapping.length);
            position = {
              lat: location.lat + offset.latOffset,
              lng: location.lng + offset.lngOffset,
            };
          }
        }

        const markerKey = `${practice.id}__${location.id}`;
        const marker = new google.maps.Marker({
          position,
          map,
          title: `${practice.name}${location.name ? ` - ${location.name}` : ''}\nClick to view practice`,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 7,
            fillColor: '#10B981',
            fillOpacity: 1,
            strokeColor: '#ffffff',
            strokeWeight: 2,
          },
          zIndex: 100,
        });

        // Click handler selects practice (not location-specific)
        marker.addListener('click', () => {
          onSelectPracticeRef.current(practice.id);
        });

        // Store marker by practiceId__locationId
        markersByIdRef.current.set(markerKey, marker);
        markerKeys.push(markerKey);
      });

      // Store marker keys for this practice
      if (markerKeys.length > 0) {
        practiceMarkerKeysRef.current.set(practice.id, markerKeys);
      }
    });

    // Apply clustering if marker count exceeds threshold
    const totalMarkers = markersByIdRef.current.size;
    if (totalMarkers > 200) {
      const markers = Array.from(markersByIdRef.current.values());
      markerClustererRef.current = new MarkerClusterer({
        map,
        markers,
      });
    }

    // Refit bounds to include origin (if exists) + new markers
    const bounds = new google.maps.LatLngBounds();

    // Add origin to bounds if exists
    if (origin) {
      bounds.extend({ lat: origin.lat, lng: origin.lng });
    }

    // Add practice markers to bounds
    markersByIdRef.current.forEach((marker) => {
      const position = marker.getPosition();
      if (position) {
        bounds.extend(position);
      }
    });

    if (markersByIdRef.current.size > 0 || origin) {
      if (markersByIdRef.current.size > 0 || (origin && bounds.getNorthEast().lat() !== bounds.getSouthWest().lat())) {
        map.fitBounds(bounds);
        // Cap max zoom to 15
        const listener = google.maps.event.addListener(map, 'bounds_changed', () => {
          if (map.getZoom() && map.getZoom()! > 15) {
            map.setZoom(15);
          }
          google.maps.event.removeListener(listener);
        });
      } else if (origin) {
        // Only origin, center on it
        map.setCenter({ lat: origin.lat, lng: origin.lng });
        map.setZoom(10);
      }
    }
  }, [practices, mapLoaded, origin]);

  // Effect D: Selection Styling
  useEffect(() => {
    if (!googleMapRef.current || !window.google?.maps) return;

    const google = window.google;

    // Update marker styles based on selection
    // Highlight ALL markers for selected practice
    practiceMarkerKeysRef.current.forEach((markerKeys, practiceId) => {
      const isSelected = practiceId === selectedPracticeId;

      markerKeys.forEach((markerKey) => {
        const marker = markersByIdRef.current.get(markerKey);
        if (!marker) return;

        marker.setIcon({
          path: google.maps.SymbolPath.CIRCLE,
          scale: isSelected ? 10 : 7,
          fillColor: isSelected ? '#0F5FA8' : '#10B981',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: isSelected ? 3 : 2,
        });
        marker.setZIndex(isSelected ? 1000 : 100);
      });
    });
  }, [selectedPracticeId]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Clear clusterer
      if (markerClustererRef.current) {
        markerClustererRef.current.clearMarkers();
        markerClustererRef.current = null;
      }

      // Clear all practice markers
      markersByIdRef.current.forEach((marker) => {
        marker.setMap(null);
      });
      markersByIdRef.current.clear();
      practiceMarkerKeysRef.current.clear();

      // Clear origin marker
      if (originMarkerRef.current) {
        originMarkerRef.current.setMap(null);
        originMarkerRef.current = null;
      }
    };
  }, []);

  if (!apiKey) {
    return (
      <div className="w-full h-full bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
        <div className="text-center p-8">
          <p className="text-gray-500 text-sm mb-2">Map view requires Google Maps API key</p>
          <p className="text-gray-400 text-xs">Configure NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to enable maps</p>
        </div>
      </div>
    );
  }

  if (mapError) {
    return (
      <div className="w-full h-full bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
        <div className="text-center p-8">
          <p className="text-red-500 text-sm">{mapError}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative rounded-lg overflow-hidden border border-gray-200 shadow-sm">
      {isLoading && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center z-10">
          <Loader2 className="h-8 w-8 animate-spin text-brand-teal" />
        </div>
      )}
      <div ref={mapRef} className="w-full h-full" style={{ minHeight: '400px' }} />
    </div>
  );
}

// Declare Google Maps types for TypeScript
declare global {
  interface Window {
    google: any;
    __googleMapsPromise?: Promise<void>;
  }
}
