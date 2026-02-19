import { Practice } from '@/types/practice';
import { Doctor } from '@/types';
import { practices as seedPractices } from '@/data/practices';
import { getAllDoctors } from '@/lib/memberStorage';
import { getCreatedPractices, mergePractices } from '@/lib/storage/practiceStorage';
import { haversineDistance } from '@/lib/distanceUtils';

/**
 * Practice search filters for directory search
 */
export type PracticeSearchFilters = {
  query?: string;
  city?: string;
  state?: string;
  zip?: string;
  specialty?: string;
  insurance?: string;
  service?: string;
  page?: number;
  pageSize?: number;
  sort?: 'relevance' | 'name' | 'distance';
  origin?: { lat: number; lng: number; label?: string };
  radiusMiles?: number | null;
};

/**
 * Practice search result with distance information
 */
export type PracticeSearchResult = {
  practices: Array<Practice & { distanceMiles?: number }>;
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
  origin?: { label: string; lat: number; lng: number };
};

/**
 * Normalize ZIP code (strip non-digits, keep 5)
 */
function normalizeZip(zip: string): string {
  const digits = zip.replace(/\D/g, '');
  return digits.substring(0, 5);
}

/**
 * Ensure practice has locations array (backward compatibility migration)
 * Migrates old practice.location to practice.locations[0]
 * 
 * @param practice Practice object (may have old or new structure)
 * @returns Practice with guaranteed locations array
 */
function ensureLocationsArray(practice: any): Practice {
  // Already has locations array with at least one location → return as-is
  if (practice.locations && Array.isArray(practice.locations) && practice.locations.length > 0) {
    return practice;
  }

  // Has old location field → migrate to locations array
  if (practice.location && practice.location.lat && practice.location.lng) {
    return {
      ...practice,
      locations: [
        {
          id: `loc_${practice.id}`,
          name: 'Main Office',
          address: practice.address?.line1 || '',
          city: practice.address?.city || '',
          state: practice.address?.state || '',
          zip: practice.address?.zip || '',
          lat: practice.location.lat,
          lng: practice.location.lng,
        },
      ],
    };
  }

  // No location data → return with empty array (will be excluded from distance-based features)
  return {
    ...practice,
    locations: [],
  };
}

/**
 * Check if practice has coordinates
 */
function hasCoords(practice: Practice): boolean {
  // Check if practice has at least one location with coordinates
  return !!(practice.locations && practice.locations.length > 0 && 
            practice.locations[0].lat && practice.locations[0].lng);
}

/**
 * Get primary practice coordinates
 * Uses first location in locations array
 */
function getPrimaryPracticeCoords(practice: Practice): { lat: number; lng: number } | null {
  // Use first location if available
  if (practice.locations && practice.locations.length > 0) {
    const firstLoc = practice.locations[0];
    if (firstLoc.lat && firstLoc.lng) {
      return { lat: firstLoc.lat, lng: firstLoc.lng };
    }
  }
  return null;
}

/**
 * Get all practices combining seed + created + overrides, filtering deleted
 * SSR-safe: returns seed-only if window is undefined
 */
export function getAllPractices(): Practice[] {
  // SSR: return seed-only (acceptable for SSR)
  // Apply migration helper to seed practices as well
  if (typeof window === 'undefined') {
    return seedPractices.map(ensureLocationsArray);
  }

  try {
    // Get seed practices
    const seed = seedPractices;

    // Get created practices (from approval workflow)
    const created = getCreatedPractices();

    // Combine seed + created (deduplicate by id, prefer created if duplicate)
    const practiceMap = new Map<string, Practice>();
    
    // Add seed practices first
    seed.forEach((p) => practiceMap.set(p.id, p));
    
    // Add created practices (will overwrite seed if duplicate)
    created.forEach((p) => practiceMap.set(p.id, p));

    // Convert to array and apply overrides + filter deleted
    const combined = Array.from(practiceMap.values());
    const merged = mergePractices(combined);

    // Apply migration helper to ensure locations array
    const migrated = merged.map(ensureLocationsArray);

    // Sort by name ascending
    return migrated.sort((a, b) => a.name.localeCompare(b.name));
  } catch (error) {
    console.error('Error loading practices:', error);
    // Fallback to seed on error
    return seedPractices;
  }
}

/**
 * Get practice by slug
 */
export function getPracticeBySlug(slug: string): Practice | null {
  const allPractices = getAllPractices();
  const practice = allPractices.find((p) => p.slug === slug);
  return practice ? ensureLocationsArray(practice) : null;
}

/**
 * Get practice by ID
 */
export function getPracticeById(id: string): Practice | null {
  const allPractices = getAllPractices();
  const practice = allPractices.find((p) => p.id === id);
  return practice ? ensureLocationsArray(practice) : null;
}

/**
 * Get doctors for a practice
 * Filters by practiceId and sorts: practice_admin first, then by lastName, firstName
 */
export function getDoctorsForPractice(practiceId: string): Doctor[] {
  const allDoctors = getAllDoctors();
  
  // Filter by practiceId
  const practiceDoctors = allDoctors.filter((d) => d.practiceId === practiceId);
  
  // Sort: practice_admin first, then by lastName, firstName
  return practiceDoctors.sort((a, b) => {
    // Practice admins first
    if (a.roleInPractice === 'practice_admin' && b.roleInPractice !== 'practice_admin') {
      return -1;
    }
    if (b.roleInPractice === 'practice_admin' && a.roleInPractice !== 'practice_admin') {
      return 1;
    }
    
    // Then by lastName
    const lastNameCompare = a.lastName.localeCompare(b.lastName);
    if (lastNameCompare !== 0) return lastNameCompare;
    
    // Then by firstName
    return a.firstName.localeCompare(b.firstName);
  });
}

/**
 * Search practices with filters
 * Returns paginated results with total count and distance information
 */
export function searchPractices(
  filters: PracticeSearchFilters
): PracticeSearchResult {
  const allPractices = getAllPractices();
  const page = filters.page || 1;
  const pageSize = filters.pageSize || 12;
  const sort = filters.sort || 'relevance';

  let results: Array<Practice & { distanceMiles?: number }> = [];

  // Apply filters
  for (const practiceRaw of allPractices) {
    // Ensure locations array (migration helper)
    const practice = ensureLocationsArray(practiceRaw);
    // Query filter (keyword search)
    if (filters.query) {
      const queryLower = filters.query.toLowerCase();
      const matchesName = practice.name.toLowerCase().includes(queryLower);
      const matchesDescription = practice.description.toLowerCase().includes(queryLower);
      const matchesSpecialties = practice.specialties.some((s) =>
        s.toLowerCase().includes(queryLower)
      );
      const matchesServices =
        practice.services?.some((s) => s.toLowerCase().includes(queryLower)) || false;
      const matchesInsurance =
        practice.insurance?.some((i) => i.name.toLowerCase().includes(queryLower)) || false;
      const matchesCity = practice.address.city.toLowerCase().includes(queryLower);
      const matchesState = practice.address.state.toLowerCase().includes(queryLower);
      const matchesZip = practice.address.zip.includes(queryLower);

      if (
        !matchesName &&
        !matchesDescription &&
        !matchesSpecialties &&
        !matchesServices &&
        !matchesInsurance &&
        !matchesCity &&
        !matchesState &&
        !matchesZip
      ) {
        // Also check locations
        const matchesLocation =
          practice.locations?.some(
            (loc) =>
              loc.city.toLowerCase().includes(queryLower) ||
              loc.state.toLowerCase().includes(queryLower) ||
              loc.zip.includes(queryLower)
          ) || false;

        if (!matchesLocation) {
          continue;
        }
      }
    }

    // Location filters
    if (filters.zip) {
      const zipMatch = filters.zip.match(/\b\d{5}(-\d{4})?\b/);
      const zipCode = zipMatch ? zipMatch[0].substring(0, 5) : filters.zip.trim().substring(0, 5);
      if (zipCode && zipCode.length === 5 && /^\d+$/.test(zipCode)) {
        const practiceZip = practice.address.zip?.trim().substring(0, 5);
        const locationZipMatch =
          practice.locations?.some((loc) => loc.zip.trim().substring(0, 5) === zipCode) || false;
        if (practiceZip !== zipCode && !locationZipMatch) {
          continue;
        }
      }
    }

    if (filters.city) {
      const cityLower = filters.city.toLowerCase();
      const matchesCity =
        practice.address.city.toLowerCase().includes(cityLower) ||
        practice.locations?.some((loc) => loc.city.toLowerCase().includes(cityLower)) ||
        false;
      if (!matchesCity) {
        continue;
      }
    }

    if (filters.state) {
      const stateUpper = filters.state.toUpperCase();
      const matchesState =
        practice.address.state.toUpperCase() === stateUpper ||
        practice.locations?.some((loc) => loc.state.toUpperCase() === stateUpper) ||
        false;
      if (!matchesState) {
        continue;
      }
    }

    // Specialty filter
    if (filters.specialty && filters.specialty !== 'all') {
      const normalizedFilter = filters.specialty.toLowerCase().replace(/-/g, ' ');
      const hasSpecialty = practice.specialties.some((spec) => {
        const specLower = spec.toLowerCase();
        return specLower === normalizedFilter || specLower.includes(normalizedFilter);
      });
      if (!hasSpecialty) {
        continue;
      }
    }

    // Insurance filter (case-insensitive)
    if (filters.insurance && filters.insurance !== 'all') {
      const targetInsurance = filters.insurance.toLowerCase();
      const hasInsurance =
        practice.insurance?.some((ins) => ins.name.toLowerCase() === targetInsurance) || false;
      if (!hasInsurance) {
        continue;
      }
    }

    // Service filter (case-insensitive)
    if (filters.service && filters.service !== 'all') {
      const targetService = filters.service.toLowerCase();
      const hasService = practice.services?.some((s) => s.toLowerCase() === targetService) || false;
      if (!hasService) {
        continue;
      }
    }

    // Calculate distance if origin is provided and practice has coords
    let distanceMiles: number | undefined;
    if (filters.origin && hasCoords(practice)) {
      // Calculate distance to closest location
      const locationsWithCoords = practice.locations.filter(
        (loc) => loc.lat && loc.lng
      );
      
      if (locationsWithCoords.length > 0) {
        const origin = filters.origin!; // Already checked above
        const distances = locationsWithCoords.map((loc) =>
          haversineDistance(
            origin.lat,
            origin.lng,
            loc.lat,
            loc.lng
          )
        );
        
        distanceMiles = Math.min(...distances);
        
        // Apply radius filter if provided
        if (filters.radiusMiles != null && filters.radiusMiles > 0) {
          if (distanceMiles > filters.radiusMiles) {
            continue; // Skip practices outside radius
          }
        }
      }
    } else if (filters.radiusMiles != null && filters.radiusMiles > 0) {
      // Radius filter active but practice has no coords → exclude
      continue;
    }

    results.push({ ...practice, distanceMiles });
  }

  // Sort results
  if (sort === 'distance' && filters.origin) {
    // Sort by distance ASC (practices without distance go to bottom)
    results.sort((a, b) => {
      const aDist = a.distanceMiles ?? Infinity;
      const bDist = b.distanceMiles ?? Infinity;
      if (aDist !== bDist) {
        return aDist - bDist;
      }
      // If same distance, sort by name
      return a.name.localeCompare(b.name);
    });
  } else if (sort === 'relevance' && filters.query) {
    const queryLower = filters.query.toLowerCase();
    const scored = results.map((practice) => {
      let score = 0;

      // Name match: +3
      if (practice.name.toLowerCase().includes(queryLower)) {
        score += 3;
      }

      // Specialty match: +2
      if (practice.specialties.some((s) => s.toLowerCase().includes(queryLower))) {
        score += 2;
      }

      // Service/insurance match: +1
      if (practice.services?.some((s) => s.toLowerCase().includes(queryLower))) {
        score += 1;
      }
      if (practice.insurance?.some((i) => i.name.toLowerCase().includes(queryLower))) {
        score += 1;
      }

      // Description match: +1
      if (practice.description.toLowerCase().includes(queryLower)) {
        score += 1;
      }

      return { practice, score };
    });

    // Sort by score desc, then name asc
    scored.sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      return a.practice.name.localeCompare(b.practice.name);
    });

    // Extract practices back
    results = scored.map((item) => item.practice);
  } else if (sort === 'name') {
    // Sort by name ascending
    results.sort((a, b) => a.name.localeCompare(b.name));
  }

  // Pagination
  const total = results.length;
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedResults = results.slice(startIndex, endIndex);

  return {
    practices: paginatedResults,
    total,
    page,
    pageSize,
    hasMore: endIndex < total,
    origin: filters.origin ? {
      label: filters.origin.label || 'origin',
      lat: filters.origin.lat,
      lng: filters.origin.lng,
    } : undefined,
  };
}

/**
 * Get filter options for practice directory
 * Computes unique values from all practices + their doctors
 */
export function getPracticeFilterOptions(): {
  specialties: string[];
  states: string[];
  insurances: string[];
  services: string[];
} {
  const allPractices = getAllPractices();
  const allDoctors = getAllDoctors();

  const specialtiesSet = new Set<string>();
  const statesSet = new Set<string>();
  const insurancesSet = new Set<string>();
  const servicesSet = new Set<string>();

  // Collect from practices
  allPractices.forEach((practice) => {
    practice.specialties.forEach((spec) => specialtiesSet.add(spec));
    statesSet.add(practice.address.state);
    practice.insurance?.forEach((ins) => insurancesSet.add(ins.name));
    practice.services?.forEach((service) => servicesSet.add(service));

    // Also check locations
    practice.locations?.forEach((loc) => {
      statesSet.add(loc.state);
    });
  });

  // Also collect from doctors (for specialties and insurance)
  allDoctors.forEach((doctor) => {
    if (doctor.specialty) {
      specialtiesSet.add(doctor.specialty);
    }
    doctor.specialties?.forEach((spec) => specialtiesSet.add(spec));
    doctor.insurance.forEach((ins) => insurancesSet.add(ins.name));
  });

  return {
    specialties: Array.from(specialtiesSet).sort(),
    states: Array.from(statesSet).sort(),
    insurances: Array.from(insurancesSet).sort(),
    services: Array.from(servicesSet).sort(),
  };
}
