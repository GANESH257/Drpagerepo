import { Institution, Doctor } from '@/types';
import { getAllInstitutions } from './institutionStorage';
import { getAllDoctors } from './memberStorage';
import { haversineDistance, getZIPLatLng, getLocationCoordinates } from './distanceUtils';

export interface InstitutionSearchFilters {
  specialty?: string;
  zip?: string;
  insurance?: string;
  availability?: string;
  name?: string; // Search query for institution or doctor names
  radiusMiles?: number; // Radius search in miles
  userLat?: number; // User's latitude (for radius search without ZIP)
  userLng?: number; // User's longitude (for radius search without ZIP)
  sort?: 'distance' | 'name' | 'rating'; // Sort order
}

export interface InstitutionSearchResult {
  institution: Institution;
  distance?: number; // Distance in miles (when radius search is active)
  doctorCount: number;
}

export interface SearchResults {
  institutions: InstitutionSearchResult[];
  doctorMatches?: Doctor[]; // Only included when name search (q param) is present
  totalCount: number;
}

/**
 * Search institutions by filters
 */
export async function searchInstitutions(filters: InstitutionSearchFilters): Promise<SearchResults> {
  const allInstitutions = getAllInstitutions();
  const allDoctors = await getAllDoctors();

  let results: InstitutionSearchResult[] = [];

  // Start with all institutions
  for (const institution of allInstitutions) {
    const institutionDoctors = allDoctors.filter((d) => institution.doctorIds.includes(d.id));

    // Filter by specialty
    if (filters.specialty && filters.specialty !== 'all') {
      const normalizedFilter = filters.specialty.toLowerCase().replace(/-/g, ' ');
      const hasSpecialty = institution.specialties.some((spec) => {
        const specLower = spec.toLowerCase();
        return specLower === normalizedFilter || specLower.includes(normalizedFilter);
      });
      if (!hasSpecialty) continue;
    }

    // Filter by ZIP (exact match) - only when radius is NOT active
    if (filters.zip && !filters.radiusMiles) {
      // Extract ZIP from location string
      const zipMatch = filters.zip.match(/\b\d{5}(-\d{4})?\b/);
      const zipCode = zipMatch ? zipMatch[0].substring(0, 5) : filters.zip.trim().substring(0, 5);
      
      if (zipCode && zipCode.length === 5 && /^\d+$/.test(zipCode)) {
        // Check institution ZIP
        const instZip = institution.address.zip?.trim().substring(0, 5);
        if (instZip !== zipCode) {
          // Also check if any doctor in institution has this ZIP
          const hasZip = institutionDoctors.some((d) => {
            return d.locations.some((loc) => {
              const docZip = loc.zip?.trim().substring(0, 5);
              return docZip === zipCode;
            });
          });
          if (!hasZip) continue;
        }
      }
    }

    // Filter by insurance
    if (filters.insurance && filters.insurance !== 'all') {
      const hasInsurance = institutionDoctors.some((d) =>
        d.insurance.some((ins) => ins.name === filters.insurance)
      );
      if (!hasInsurance) continue;
    }

    // Filter by availability
    if (filters.availability === 'available') {
      const hasAvailability = institutionDoctors.some((d) => {
        if (!d.availability || d.availability.length === 0) return false;
        return d.availability.some((slot) => slot.available);
      });
      if (!hasAvailability) continue;
    }

    // Filter by name (institution name or doctor names)
    if (filters.name) {
      const searchLower = filters.name.toLowerCase();
      const matchesInstitutionName = institution.name.toLowerCase().includes(searchLower);
      const matchesDoctorName = institutionDoctors.some((d) => {
        const fullName = d.fullName.toLowerCase();
        const firstName = d.firstName.toLowerCase();
        const lastName = d.lastName.toLowerCase();
        return (
          fullName.includes(searchLower) ||
          firstName.includes(searchLower) ||
          lastName.includes(searchLower)
        );
      });
      if (!matchesInstitutionName && !matchesDoctorName) continue;
    }

    // Calculate distance if radius search is active
    let distance: number | undefined;
    if (filters.radiusMiles) {
      let originLat: number | null = null;
      let originLng: number | null = null;

      // Get origin coordinates - try ZIP first, then user location
      if (filters.zip) {
        // Extract ZIP code from location string (might be "city, state zip" or just "zip")
        const zipMatch = filters.zip.match(/\b\d{5}(-\d{4})?\b/);
        const zipCode = zipMatch ? zipMatch[0].substring(0, 5) : filters.zip.trim().substring(0, 5);
        
        if (zipCode && zipCode.length === 5 && /^\d+$/.test(zipCode)) {
          const zipCoords = getZIPLatLng(zipCode);
          if (zipCoords && zipCoords.lat !== 0 && zipCoords.lng !== 0) {
            originLat = zipCoords.lat;
            originLng = zipCoords.lng;
          }
        }
      }
      
      // Fallback to user geolocation if ZIP not available or not found
      if (originLat === null && filters.userLat !== undefined && filters.userLng !== undefined) {
        originLat = filters.userLat;
        originLng = filters.userLng;
      }

      // Calculate distance if we have origin
      if (originLat !== null && originLng !== null) {
        // Get institution coordinates - try multiple sources
        let instLat: number | null = null;
        let instLng: number | null = null;
        
        // First, try institution's stored coordinates
        if (institution.location.lat !== 0 || institution.location.lng !== 0) {
          instLat = institution.location.lat;
          instLng = institution.location.lng;
        }
        
        // If no valid coordinates, try institution ZIP
        if ((instLat === null || instLat === 0) && institution.address.zip) {
          const instZip = institution.address.zip.trim().substring(0, 5);
          if (instZip && instZip.length === 5) {
            const instZipCoords = getZIPLatLng(instZip);
            if (instZipCoords && instZipCoords.lat !== 0 && instZipCoords.lng !== 0) {
              instLat = instZipCoords.lat;
              instLng = instZipCoords.lng;
            }
          }
        }
        
        // If still no coordinates, try first doctor's ZIP
        if ((instLat === null || instLat === 0) && institutionDoctors.length > 0) {
          for (const doctor of institutionDoctors) {
            for (const loc of doctor.locations) {
              if (loc.zip) {
                const docZip = loc.zip.trim().substring(0, 5);
                if (docZip && docZip.length === 5) {
                  const docZipCoords = getZIPLatLng(docZip);
                  if (docZipCoords && docZipCoords.lat !== 0 && docZipCoords.lng !== 0) {
                    instLat = docZipCoords.lat;
                    instLng = docZipCoords.lng;
                    break;
                  }
                }
              }
            }
            if (instLat !== null && instLat !== 0) break;
          }
        }
        
        // Calculate distance if we have both origin and institution coordinates
        if (instLat !== null && instLng !== null && instLat !== 0 && instLng !== 0) {
          distance = haversineDistance(
            originLat,
            originLng,
            instLat,
            instLng
          );

          // Filter by radius
          if (distance > filters.radiusMiles) continue;
        } else {
          // No valid coordinates for institution - skip for radius search
          continue;
        }
      } else {
        // No origin available - skip this institution
        // This happens when ZIP is provided but not in our mapping, or no geolocation
        continue;
      }
    }

    results.push({
      institution,
      distance,
      doctorCount: institutionDoctors.length,
    });
  }

  // Sort results
  if (filters.sort === 'distance' && filters.radiusMiles) {
    results.sort((a, b) => {
      const distA = a.distance ?? Infinity;
      const distB = b.distance ?? Infinity;
      return distA - distB;
    });
  } else if (filters.sort === 'name') {
    results.sort((a, b) => a.institution.name.localeCompare(b.institution.name));
  } else if (filters.sort === 'rating') {
    // Sort by average rating of doctors in institution
    results.sort((a, b) => {
      const doctorsA = allDoctors.filter((d) => a.institution.doctorIds.includes(d.id));
      const doctorsB = allDoctors.filter((d) => b.institution.doctorIds.includes(d.id));
      const avgRatingA =
        doctorsA.reduce((sum, d) => sum + d.rating, 0) / doctorsA.length || 0;
      const avgRatingB =
        doctorsB.reduce((sum, d) => sum + d.rating, 0) / doctorsB.length || 0;
      return avgRatingB - avgRatingA;
    });
  }

  // Get doctor matches if name search is active
  let doctorMatches: Doctor[] | undefined;
  if (filters.name) {
    const searchLower = filters.name.toLowerCase();
    doctorMatches = allDoctors.filter((d) => {
      const fullName = d.fullName.toLowerCase();
      const firstName = d.firstName.toLowerCase();
      const lastName = d.lastName.toLowerCase();
      return (
        fullName.includes(searchLower) ||
        firstName.includes(searchLower) ||
        lastName.includes(searchLower)
      );
    });
  }

  return {
    institutions: results,
    doctorMatches,
    totalCount: results.length,
  };
}

/**
 * Search institutions by radius
 */
export async function searchInstitutionsByRadius(
  zip: string | undefined,
  radiusMiles: number,
  userLat?: number,
  userLng?: number
): Promise<InstitutionSearchResult[]> {
  const results = await searchInstitutions({
    radiusMiles,
    zip,
    userLat,
    userLng,
    sort: 'distance',
  });
  return results.institutions;
}

/**
 * Search institutions by name (also searches doctor names)
 */
export async function searchInstitutionsByName(query: string): Promise<SearchResults> {
  return await searchInstitutions({
    name: query,
    sort: 'name',
  });
}

/**
 * Get institutions within radius of a ZIP code
 */
export async function getInstitutionsWithinRadius(
  zip: string,
  radiusMiles: number
): Promise<InstitutionSearchResult[]> {
  return await searchInstitutionsByRadius(zip, radiusMiles);
}

/**
 * Get institutions within radius of user location
 */
export async function getInstitutionsNearUser(
  userLat: number,
  userLng: number,
  radiusMiles: number
): Promise<InstitutionSearchResult[]> {
  return await searchInstitutionsByRadius(undefined, radiusMiles, userLat, userLng);
}
