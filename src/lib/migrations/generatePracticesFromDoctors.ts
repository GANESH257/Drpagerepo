import { Doctor } from '@/types';
import { Practice } from '@/types/practice';
import { slugify } from '@/lib/slugify';
import { zipCoordinates, getCityStateCoordinates } from '@/data/zipCoordinates';

/**
 * Deterministic hash function for generating consistent values
 */
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

/**
 * Get primary location for a doctor
 */
function getPrimaryLocation(doctor: Doctor): { city: string; state: string; zip: string } | null {
  if (doctor.locations && doctor.locations.length > 0) {
    const primary = doctor.locations[0];
    return {
      city: primary.city || '',
      state: primary.state || '',
      zip: primary.zip || '',
    };
  }
  // Fallback: try to extract from any location data
  // Note: Doctor type doesn't have direct city/state, only in locations array
  return null;
}

/**
 * Get coordinates for a location
 */
function getCoordinatesForLocation(
  zip: string,
  city: string,
  state: string,
  zipCoords?: Record<string, { lat: number; lng: number }>
): { lat: number; lng: number } {
  // Priority 1: ZIP coordinates
  if (zip && zipCoords && zipCoords[zip]) {
    return zipCoords[zip];
  }

  // Priority 2: City/State coordinates
  const cityStateCoords = getCityStateCoordinates(city, state);
  if (cityStateCoords) {
    return cityStateCoords;
  }

  // Priority 3: State-based fallback
  const stateFallback: Record<string, { lat: number; lng: number }> = {
    'IL': { lat: 40.3495, lng: -88.9861 }, // Central Illinois
    'MO': { lat: 38.4622, lng: -92.3020 }, // Central Missouri
    'TN': { lat: 35.7478, lng: -86.6923 }, // Central Tennessee
  };

  return stateFallback[state] || { lat: 39.8283, lng: -98.5795 }; // US center as last resort
}

/**
 * Get most common specialty from a group of doctors
 */
function getMostCommonSpecialty(doctors: Doctor[]): string {
  const specialtyCounts: Record<string, number> = {};
  
  doctors.forEach((doctor) => {
    const specialties = doctor.specialties || [doctor.specialty];
    specialties.forEach((spec) => {
      specialtyCounts[spec] = (specialtyCounts[spec] || 0) + 1;
    });
  });

  let maxCount = 0;
  let mostCommon = '';
  
  Object.entries(specialtyCounts).forEach(([spec, count]) => {
    if (count > maxCount || (count === maxCount && spec < mostCommon)) {
      maxCount = count;
      mostCommon = spec;
    }
  });

  return mostCommon || 'Medical';
}

/**
 * Generate practices from doctors using deterministic grouping algorithm
 * 
 * @param doctors Array of doctors to group
 * @param zipCoords Optional ZIP code to coordinates mapping
 * @returns Array of exactly 30 practices (or max(10, ceil(doctors/4)) if doctors < 60)
 */
export function generatePracticesFromDoctors(
  doctors: Doctor[],
  zipCoords?: Record<string, { lat: number; lng: number }>
): Practice[] {
  const targetPracticeCount = doctors.length < 60 
    ? Math.max(10, Math.ceil(doctors.length / 4))
    : 30;

  // Step 1: Extract primary location for each doctor
  const doctorsWithLocation = doctors.map((doctor) => {
    const location = getPrimaryLocation(doctor);
    return { doctor, location };
  }).filter((item) => item.location !== null) as Array<{ doctor: Doctor; location: { city: string; state: string; zip: string } }>;

  // Step 2: Group by (state, city)
  const cityGroups = new Map<string, Doctor[]>();
  
  doctorsWithLocation.forEach(({ doctor, location }) => {
    const key = `${location.state}-${location.city}`;
    if (!cityGroups.has(key)) {
      cityGroups.set(key, []);
    }
    cityGroups.get(key)!.push(doctor);
  });

  // Sort doctors within each group by id for determinism
  cityGroups.forEach((doctorsInGroup) => {
    doctorsInGroup.sort((a, b) => a.id.localeCompare(b.id));
  });

  // Step 3: Adjust group count to target
  let groups = Array.from(cityGroups.entries()).map(([key, doctors]) => ({
    key,
    doctors,
    state: key.split('-')[0],
    city: key.split('-').slice(1).join('-'),
  }));

  // If too many groups, merge smallest within same state
  while (groups.length > targetPracticeCount) {
    groups.sort((a, b) => a.doctors.length - b.doctors.length); // Sort by size
    
    // Find smallest group and merge with nearest same-state group
    const smallest = groups[0];
    const sameStateGroups = groups.filter((g) => g.state === smallest.state && g.key !== smallest.key);
    
    if (sameStateGroups.length > 0) {
      const toMerge = sameStateGroups[0];
      const merged = {
        key: `${smallest.state}-${smallest.city}`,
        doctors: [...smallest.doctors, ...toMerge.doctors].sort((a, b) => a.id.localeCompare(b.id)),
        state: smallest.state,
        city: smallest.city,
      };
      groups = groups.filter((g) => g.key !== smallest.key && g.key !== toMerge.key);
      groups.push(merged);
    } else {
      // No same-state group, merge with nearest
      const toMerge = groups[1];
      const merged = {
        key: `${smallest.state}-${smallest.city}`,
        doctors: [...smallest.doctors, ...toMerge.doctors].sort((a, b) => a.id.localeCompare(b.id)),
        state: smallest.state,
        city: smallest.city,
      };
      groups = groups.filter((g) => g.key !== smallest.key && g.key !== toMerge.key);
      groups.push(merged);
    }
  }

  // If too few groups, split largest by ZIP
  while (groups.length < targetPracticeCount) {
    groups.sort((a, b) => b.doctors.length - a.doctors.length); // Sort by size desc
    
    const largest = groups[0];
    if (largest.doctors.length <= 2) break; // Can't split further
    
    // Calculate how many groups we need
    const needed = targetPracticeCount - groups.length;
    
    // Group by ZIP within this city group
    const zipGroups = new Map<string, Doctor[]>();
    largest.doctors.forEach((doctor) => {
      const location = getPrimaryLocation(doctor);
      if (location) {
        const zip = location.zip || 'unknown';
        if (!zipGroups.has(zip)) {
          zipGroups.set(zip, []);
        }
        zipGroups.get(zip)!.push(doctor);
      }
    });

    if (zipGroups.size > 1 && zipGroups.size <= needed + 1) {
      // Split by ZIP (only if it won't exceed target)
      const newGroups = Array.from(zipGroups.entries()).map(([zip, doctors]) => ({
        key: `${largest.state}-${largest.city}-${zip}`,
        doctors: doctors.sort((a, b) => a.id.localeCompare(b.id)),
        state: largest.state,
        city: largest.city,
      }));
      
      groups = groups.filter((g) => g.key !== largest.key);
      groups.push(...newGroups);
    } else {
      // Can't split by ZIP effectively, chunk by size (max 8 per practice)
      // But limit chunks to what we need
      if (largest.doctors.length > 8) {
        const chunks: Doctor[][] = [];
        const chunkSize = Math.ceil(largest.doctors.length / (needed + 1));
        for (let i = 0; i < largest.doctors.length && chunks.length < needed + 1; i += chunkSize) {
          chunks.push(largest.doctors.slice(i, i + chunkSize));
        }
        
        groups = groups.filter((g) => g.key !== largest.key);
        chunks.forEach((chunk, idx) => {
          groups.push({
            key: `${largest.state}-${largest.city}-chunk${idx}`,
            doctors: chunk,
            state: largest.state,
            city: largest.city,
          });
        });
      } else {
        break; // Can't split further
      }
    }
  }
  
  // Final check: if we exceeded target, merge smallest groups
  while (groups.length > targetPracticeCount) {
    groups.sort((a, b) => a.doctors.length - b.doctors.length);
    const smallest = groups[0];
    const toMerge = groups.find((g) => g.key !== smallest.key && g.state === smallest.state) || groups[1];
    const merged = {
      key: `${smallest.state}-${smallest.city}`,
      doctors: [...smallest.doctors, ...toMerge.doctors].sort((a, b) => a.id.localeCompare(b.id)),
      state: smallest.state,
      city: smallest.city,
    };
    groups = groups.filter((g) => g.key !== smallest.key && g.key !== toMerge.key);
    groups.push(merged);
  }

  // Step 4: Validate and adjust group sizes (2-8 doctors preferred)
  // Merge singletons
  const singletons = groups.filter((g) => g.doctors.length === 1);
  const multiDoctorGroups = groups.filter((g) => g.doctors.length > 1);
  
  singletons.forEach((singleton) => {
    // Find nearest group (same city, then same state)
    const sameCity = multiDoctorGroups.find((g) => g.city === singleton.city && g.doctors.length < 8);
    if (sameCity) {
      sameCity.doctors.push(...singleton.doctors);
      sameCity.doctors.sort((a, b) => a.id.localeCompare(b.id));
    } else {
      const sameState = multiDoctorGroups.find((g) => g.state === singleton.state && g.doctors.length < 8);
      if (sameState) {
        sameState.doctors.push(...singleton.doctors);
        sameState.doctors.sort((a, b) => a.id.localeCompare(b.id));
      } else {
        // Add to first available group
        if (multiDoctorGroups.length > 0 && multiDoctorGroups[0].doctors.length < 8) {
          multiDoctorGroups[0].doctors.push(...singleton.doctors);
          multiDoctorGroups[0].doctors.sort((a, b) => a.id.localeCompare(b.id));
        }
      }
    }
  });

  // Split groups with >8 doctors
  const finalGroups: Array<{ key: string; doctors: Doctor[]; state: string; city: string }> = [];
  multiDoctorGroups.forEach((group) => {
    if (group.doctors.length > 8) {
      const chunks: Doctor[][] = [];
      for (let i = 0; i < group.doctors.length; i += 8) {
        chunks.push(group.doctors.slice(i, i + 8));
      }
      chunks.forEach((chunk, idx) => {
        finalGroups.push({
          key: `${group.state}-${group.city}-split${idx}`,
          doctors: chunk,
          state: group.state,
          city: group.city,
        });
      });
    } else {
      finalGroups.push(group);
    }
  });

  // Step 5: Generate practice data
  const practices: Practice[] = finalGroups.map((group, index) => {
    const practiceId = `practice-${index + 1}`;
    const hash = hashString(practiceId);
    
    // Get primary location from first doctor
    const firstDoctor = group.doctors[0];
    const primaryLocation = getPrimaryLocation(firstDoctor)!;
    
    // Get coordinates
    const coords = getCoordinatesForLocation(
      primaryLocation.zip,
      primaryLocation.city,
      primaryLocation.state,
      zipCoords
    );

    // Get most common specialty
    const specialtyAnchor = getMostCommonSpecialty(group.doctors);

    // Generate practice name
    const practiceName = `${primaryLocation.city} ${specialtyAnchor} Clinic`;

    // Generate slug
    const practiceSlug = slugify(practiceName);

    // Generate phone (deterministic)
    const phoneArea = (hash % 900) + 100; // 100-999
    const phonePrefix = ((hash * 7) % 9000) + 1000; // 1000-9999
    const phone = `(555) ${phoneArea}-${phonePrefix}`;

    // Generate address line1
    const addressNum = (hash % 9999) + 1;
    const addressLine1 = `${addressNum} Medical Center Dr`;

    // Get all specialties (union)
    const allSpecialties = new Set<string>();
    group.doctors.forEach((doctor) => {
      (doctor.specialties || [doctor.specialty]).forEach((spec) => allSpecialties.add(spec));
    });

    // Get common insurance (union of first 3 doctors' insurance)
    const commonInsurance = new Set<string>();
    group.doctors.slice(0, 3).forEach((doctor) => {
      doctor.insurance?.forEach((ins) => commonInsurance.add(ins.name));
    });

    return {
      id: practiceId,
      slug: practiceSlug,
      name: practiceName,
      description: `${practiceName} is a ${specialtyAnchor} practice located in ${primaryLocation.city}, ${primaryLocation.state}. Our team of ${group.doctors.length} physician${group.doctors.length > 1 ? 's' : ''} provides comprehensive ${specialtyAnchor} care to patients throughout the region.`,
      phone,
      email: `contact@${practiceSlug}.com`,
      website: `https://${practiceSlug}.com`,
      address: {
        line1: addressLine1,
        city: primaryLocation.city,
        state: primaryLocation.state,
        zip: primaryLocation.zip || '00000',
        country: 'USA',
      },
      locations: [
        {
          id: `loc_${practiceId}`,
          name: 'Main Office',
          address: addressLine1,
          city: primaryLocation.city,
          state: primaryLocation.state,
          zip: primaryLocation.zip || '00000',
          lat: coords.lat,
          lng: coords.lng,
        },
      ],
      specialties: Array.from(allSpecialties).sort(),
      doctorIds: group.doctors.map((d) => d.id).sort(),
      insurance: Array.from(commonInsurance).slice(0, 6).map((name) => ({
        name,
        slug: slugify(name),
      })),
      createdAt: '2026-01-29T00:00:00.000Z',
      updatedAt: '2026-01-29T00:00:00.000Z',
    };
  });

  return practices;
}
