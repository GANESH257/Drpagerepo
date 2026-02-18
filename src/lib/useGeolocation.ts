'use client';

import { useState, useEffect, useCallback } from 'react';

export interface GeolocationState {
  lat: number | null;
  lng: number | null;
  loading: boolean;
  error: string | null;
  permissionDenied: boolean;
}

/**
 * Hook for getting user's geolocation
 * Handles permission requests and errors gracefully
 */
export function useGeolocation(autoRequest: boolean = false): GeolocationState & {
  requestLocation: () => void;
  clearError: () => void;
} {
  const [state, setState] = useState<GeolocationState>({
    lat: null,
    lng: null,
    loading: false,
    error: null,
    permissionDenied: false,
  });

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: 'Geolocation is not supported by your browser',
        permissionDenied: false,
      }));
      return;
    }

    setState((prev) => ({
      ...prev,
      loading: true,
      error: null,
      permissionDenied: false,
    }));

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          loading: false,
          error: null,
          permissionDenied: false,
        });
      },
      (error) => {
        let errorMessage = 'Unable to retrieve your location';
        let permissionDenied = false;

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied. Please enable location permissions or enter a ZIP code.';
            permissionDenied = true;
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information is unavailable.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out.';
            break;
          default:
            errorMessage = 'An unknown error occurred while retrieving location.';
            break;
        }

        setState({
          lat: null,
          lng: null,
          loading: false,
          error: errorMessage,
          permissionDenied,
        });
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 300000, // Cache for 5 minutes
      }
    );
  }, []);

  const clearError = useCallback(() => {
    setState((prev) => ({
      ...prev,
      error: null,
      permissionDenied: false,
    }));
  }, []);

  useEffect(() => {
    if (autoRequest) {
      requestLocation();
    }
  }, [autoRequest, requestLocation]);

  return {
    ...state,
    requestLocation,
    clearError,
  };
}

/**
 * Hook for getting user's geolocation with IP-based fallback
 * Note: IP-based geolocation would require an external service
 * For now, this just provides the browser geolocation
 */
export function useGeolocationWithFallback(autoRequest: boolean = false) {
  const geolocation = useGeolocation(autoRequest);

  // In a real implementation, you might call an IP geolocation service here
  // For now, we'll just return the browser geolocation result
  return geolocation;
}
