import { Practice } from '@/types/practice';
import { Doctor } from '@/types';
import { getAllPracticesArray } from '@/lib/api/practices';
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
 * Ensure practice has API-safe shape (specialties, address, doctorIds as arrays/object)
 * Backend may return flat address (address_line1, city, state, zip) and missing arrays
 */
function ensurePracticeShape(practice: any): Practice {
  const addr = practice.address ?? {};
  const flat = practice;
  const address = (addr && typeof addr === 'object' && (addr.city != null || addr.line1 != null))
    ? addr
    : {
        line1: flat.address_line1 ?? '',
        line2: flat.address_line2,
        city: flat.city ?? '',
        state: flat.state ?? '',
        zip: flat.zip ?? '',
        country: flat.country ?? 'USA',
      };
  return {
    ...practice,
    address,
    specialties: Array.isArray(practice.specialties) ? practice.specialties : (practice.specialty ? [practice.specialty] : []),
    doctorIds: Array.isArray(practice.doctorIds) ? practice.doctorIds : (Array.isArray(practice.doctors) ? practice.doctors.map((d: any) => d.id ?? d) : []),
    insurance: Array.isArray(practice.insurance) ? practice.insurance : [],
    services: Array.isArray(practice.services) ? practice.services : [],
  } as Practice;
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
 * Get all practices from API
 * @deprecated Use getAllPracticesArray from @/lib/api/practices directly
 */
export async function getAllPractices(): Promise<Practice[]> {
  try {
    const practices = await getAllPracticesArray();
    // Apply migration helpers: locations array + API-safe shape (address, specialties, doctorIds)
    return practices.map((p) => ensurePracticeShape(ensureLocationsArray(p)));
  } catch (error) {
    console.error('Error loading practices:', error);
    // Fallback to empty array on error
    return [];
  }
}

/**
 * Get practice by slug
 */
export async function getPracticeBySlug(slug: string): Promise<Practice | null> {
  const allPractices = await getAllPractices();
  const practice = allPractices.find((p) => p.slug === slug);
  return practice ? ensureLocationsArray(practice) : null;
}

/**
 * Get practice by ID
 */
export async function getPracticeById(id: string): Promise<Practice | null> {
  const allPractices = await getAllPractices();
  const practice = allPractices.find((p) => p.id === id);
  return practice ? ensureLocationsArray(practice) : null;
}

/**
 * Get doctors for a practice
 * Filters by practiceId and sorts: practice_admin first, then by lastName, firstName
 */
export async function getDoctorsForPractice(practiceId: string): Promise<Doctor[]> {
  const allDoctors = await getAllDoctors();
  
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
export async function searchPractices(
  filters: PracticeSearchFilters
): Promise<PracticeSearchResult> {
  const allPractices = await getAllPractices();
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
      const matchesName = (practice.name ?? '').toLowerCase().includes(queryLower);
      const matchesDescription = (practice.description ?? '').toLowerCase().includes(queryLower);
      const specs = Array.isArray(practice.specialties) ? practice.specialties : [];
      const matchesSpecialties = specs.some((s) => String(s).toLowerCase().includes(queryLower));
      const matchesServices =
        practice.services?.some((s) => String(s).toLowerCase().includes(queryLower)) || false;
      const matchesInsurance =
        practice.insurance?.some((i) => (i?.name ?? i).toLowerCase().includes(queryLower)) || false;
      const addr = practice.address ?? {};
      const matchesCity = (addr.city ?? '').toLowerCase().includes(queryLower);
      const matchesState = (addr.state ?? '').toLowerCase().includes(queryLower);
      const matchesZip = (addr.zip ?? '').includes(queryLower);

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
        const practiceZip = (practice.address?.zip ?? (practice as any).zip ?? '').toString().trim().substring(0, 5);
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
        (practice.address?.city ?? (practice as any).city ?? '').toLowerCase().includes(cityLower) ||
        practice.locations?.some((loc: any) => (loc.city ?? '').toLowerCase().includes(cityLower)) ||
        false;
      if (!matchesCity) {
        continue;
      }
    }

    if (filters.state) {
      const stateUpper = filters.state.toUpperCase();
      const matchesState =
        (practice.address?.state ?? (practice as any).state ?? '').toUpperCase() === stateUpper ||
        practice.locations?.some((loc: any) => (loc.state ?? '').toUpperCase() === stateUpper) ||
        false;
      if (!matchesState) {
        continue;
      }
    }

    // Specialty filter
    if (filters.specialty && filters.specialty !== 'all') {
      const normalizedFilter = filters.specialty.toLowerCase().replace(/-/g, ' ');
      const specs = Array.isArray(practice.specialties) ? practice.specialties : [];
      const hasSpecialty = specs.some((spec: string) => {
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
        practice.insurance?.some((ins: any) => (ins.name ?? ins).toLowerCase() === targetInsurance) || false;
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
      const specs = Array.isArray(practice.specialties) ? practice.specialties : [];
      if (specs.some((s: string) => String(s).toLowerCase().includes(queryLower))) {
        score += 2;
      }

      // Service/insurance match: +1
      if (practice.services?.some((s: string) => String(s).toLowerCase().includes(queryLower))) {
        score += 1;
      }
      if (practice.insurance?.some((i: any) => (i?.name ?? i).toLowerCase().includes(queryLower))) {
        score += 1;
      }

      // Description match: +1
      if ((practice.description ?? '').toLowerCase().includes(queryLower)) {
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
export async function getPracticeFilterOptions(): Promise<{
  specialties: string[];
  states: string[];
  insurances: string[];
  services: string[];
}> {
  const allPractices = await getAllPractices();
  const allDoctors = await getAllDoctors();

  const specialtiesSet = new Set<string>();
  const statesSet = new Set<string>();
  const insurancesSet = new Set<string>();
  const servicesSet = new Set<string>();

  // Collect from practices (guard API shape: specialties/address may be missing or flat)
  allPractices.forEach((practice: any) => {
    const specs = Array.isArray(practice.specialties) ? practice.specialties : [];
    specs.forEach((spec: string) => specialtiesSet.add(spec));
    const state = practice.address?.state ?? practice.state;
    if (state) statesSet.add(state);
    practice.insurance?.forEach((ins: any) => insurancesSet.add(ins.name ?? ins));
    practice.services?.forEach((service: string) => servicesSet.add(service));

    // Also check locations
    practice.locations?.forEach((loc: any) => {
      if (loc.state) statesSet.add(loc.state);
    });
  });

  // Also collect from doctors (for specialties and insurance)
  allDoctors.forEach((doctor: any) => {
    if (doctor.specialty) {
      specialtiesSet.add(doctor.specialty);
    }
    doctor.specialties?.forEach((spec: string) => specialtiesSet.add(spec));
    doctor.insurance?.forEach((ins: any) => insurancesSet.add(ins.name ?? ins));
  });

  return {
    specialties: Array.from(specialtiesSet).sort(),
    states: Array.from(statesSet).sort(),
    insurances: Array.from(insurancesSet).sort(),
    services: Array.from(servicesSet).sort(),
  };
}
