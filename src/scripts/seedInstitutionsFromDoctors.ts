/**
 * Seed script to generate institutions from doctors
 * 
 * This script:
 * 1. Loads all doctors from doctors.ts
 * 2. Groups doctors by ZIP -> city+state -> state -> random
 * 3. Creates ~30 institutions
 * 4. Assigns 3-6 doctors per institution (some 2, some up to 8)
 * 5. Generates institution names, addresses, specialties
 * 6. Outputs institutions.ts and updates doctors with institutionId
 * 
 * Run with: npx tsx src/scripts/seedInstitutionsFromDoctors.ts
 */

import { Doctor, Institution } from '@/types';
import { doctors } from '@/data/doctors';
import { getZIPCoordinates, getCityStateCoordinates } from '@/data/zipCoordinates';
import * as fs from 'fs';
import * as path from 'path';

// Institution name templates
const institutionNameTemplates = [
  '{city} {specialty} Center',
  '{city} {specialty} Institute',
  '{city} {specialty} Group',
  '{city} Medical {specialty}',
  '{city} {specialty} Associates',
  '{region} {specialty} Center',
  '{region} {specialty} Institute',
  '{region} Medical {specialty}',
  '{city} Health {specialty}',
  '{city} {specialty} Clinic',
];

const regionNames: Record<string, string> = {
  'IL': 'Midwest',
  'MO': 'Missouri',
  'TN': 'Tennessee',
  'CA': 'California',
  'NY': 'New York',
  'TX': 'Texas',
};

// Specialty keywords for institution naming
const specialtyKeywords: Record<string, string> = {
  'Internal Medicine': 'Internal Medicine',
  'Family Practice': 'Family Medicine',
  'Orthopedic Spine': 'Spine & Pain',
  'Vascular Surgery': 'Vascular',
  'Cardiology': 'Cardiology',
  'Dermatology': 'Dermatology',
  'Gastroenterology': 'Gastroenterology',
  'Endocrinology': 'Endocrinology',
  'Rheumatology': 'Rheumatology',
  'Podiatry': 'Podiatry',
  'Sports Medicine': 'Sports Medicine',
  'Psychiatry': 'Psychiatry',
  'Plastic / Reconstructive Surgery': 'Plastic Surgery',
  'Nephrology': 'Nephrology',
  'Nurse Practitioners': 'Primary Care',
  'Bariatric & General Surgery': 'Surgery',
  'Otolaryngology (ENT)': 'ENT',
};

interface DoctorGroup {
  key: string;
  doctors: Doctor[];
  zip?: string;
  city?: string;
  state?: string;
}

/**
 * Generate institution name from template and location/specialty
 */
function generateInstitutionName(
  city: string,
  state: string,
  specialties: string[]
): string {
  // Get primary specialty keyword
  const primarySpecialty = specialties[0] || 'Medical';
  const specialtyKeyword = specialtyKeywords[primarySpecialty] || primarySpecialty.split(' ')[0];
  const region = regionNames[state] || state;

  // Pick a template
  const template = institutionNameTemplates[Math.floor(Math.random() * institutionNameTemplates.length)];
  
  let name = template
    .replace('{city}', city)
    .replace('{region}', region)
    .replace('{specialty}', specialtyKeyword);

  // Clean up any remaining placeholders
  name = name.replace(/\{[^}]+\}/g, specialtyKeyword);

  return name;
}

/**
 * Generate slug from institution name
 */
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Get location coordinates for a doctor
 */
function getDoctorLocation(doctor: Doctor): { lat: number; lng: number; zip?: string; city?: string; state?: string } | null {
  // Try to get from first location with ZIP
  for (const location of doctor.locations) {
    if (location.zip) {
      const coords = getZIPCoordinates(location.zip);
      if (coords) {
        return { ...coords, zip: location.zip, city: location.city, state: location.state };
      }
    }
  }

  // Try city/state fallback
  if (doctor.locations.length > 0) {
    const location = doctor.locations[0];
    if (location.city && location.state) {
      const coords = getCityStateCoordinates(location.city, location.state);
      if (coords) {
        return { ...coords, city: location.city, state: location.state };
      }
    }
  }

  return null;
}

/**
 * Group doctors by location priority: ZIP -> city+state -> state -> random
 */
function groupDoctors(doctors: Doctor[]): DoctorGroup[] {
  const groups: Map<string, DoctorGroup> = new Map();

  // First pass: Group by ZIP
  for (const doctor of doctors) {
    const location = getDoctorLocation(doctor);
    if (location?.zip) {
      const key = `zip:${location.zip}`;
      if (!groups.has(key)) {
        groups.set(key, { key, doctors: [], zip: location.zip, city: location.city, state: location.state });
      }
      groups.get(key)!.doctors.push(doctor);
    }
  }

  // Second pass: Group remaining by city+state
  const remainingDoctors = doctors.filter(d => {
    const location = getDoctorLocation(d);
    return !location?.zip || !groups.has(`zip:${location.zip}`);
  });

  for (const doctor of remainingDoctors) {
    const location = getDoctorLocation(doctor);
    if (location?.city && location?.state) {
      const key = `city:${location.city}:${location.state}`;
      if (!groups.has(key)) {
        groups.set(key, { key, doctors: [], city: location.city, state: location.state });
      }
      groups.get(key)!.doctors.push(doctor);
    }
  }

  // Third pass: Group remaining by state
  const stillRemaining = remainingDoctors.filter(d => {
    const location = getDoctorLocation(d);
    return !location?.city || !location?.state || !groups.has(`city:${location.city}:${location.state}`);
  });

  for (const doctor of stillRemaining) {
    const location = getDoctorLocation(doctor);
    if (location?.state) {
      const key = `state:${location.state}`;
      if (!groups.has(key)) {
        groups.set(key, { key, doctors: [], state: location.state });
      }
      groups.get(key)!.doctors.push(doctor);
    }
  }

  // Final pass: Random assignment for any remaining
  const finalRemaining = stillRemaining.filter(d => {
    const location = getDoctorLocation(d);
    return !location?.state || !groups.has(`state:${location.state}`);
  });

  if (finalRemaining.length > 0) {
    const key = 'random';
    if (!groups.has(key)) {
      groups.set(key, { key, doctors: [] });
    }
    groups.get(key)!.doctors.push(...finalRemaining);
  }

  return Array.from(groups.values());
}

/**
 * Distribute doctors into ~30 institutions
 * Target: 3-6 doctors per institution (some 2, some up to 8)
 * Prioritize ZIP code grouping - keep doctors from same ZIP together
 */
function distributeDoctorsIntoInstitutions(groups: DoctorGroup[]): Doctor[][] {
  const targetInstitutionCount = 30;
  const institutions: Doctor[][] = [];
  
  // Sort groups by priority: ZIP groups first, then city+state, then state, then random
  const zipGroups: DoctorGroup[] = [];
  const cityGroups: DoctorGroup[] = [];
  const stateGroups: DoctorGroup[] = [];
  const randomGroups: DoctorGroup[] = [];
  
  for (const group of groups) {
    if (group.zip) {
      zipGroups.push(group);
    } else if (group.city && group.state) {
      cityGroups.push(group);
    } else if (group.state) {
      stateGroups.push(group);
    } else {
      randomGroups.push(group);
    }
  }
  
  // Process ZIP groups first - these should form institutions directly
  for (const zipGroup of zipGroups) {
    if (zipGroup.doctors.length >= 2) {
      // If ZIP group has 2+ doctors, try to keep them together
      if (zipGroup.doctors.length <= 8) {
        // Small enough to be one institution
        institutions.push([...zipGroup.doctors]);
      } else {
        // Split large ZIP groups into multiple institutions
        let start = 0;
        while (start < zipGroup.doctors.length) {
          const size = Math.min(6, zipGroup.doctors.length - start);
          institutions.push(zipGroup.doctors.slice(start, start + size));
          start += size;
        }
      }
    } else if (zipGroup.doctors.length === 1) {
      // Single doctor ZIP - will be merged later
      cityGroups.push(zipGroup);
    }
  }
  
  // Process remaining groups (city, state, random)
  const remainingGroups = [...cityGroups, ...stateGroups, ...randomGroups];
  const remainingDoctors: Doctor[] = [];
  for (const group of remainingGroups) {
    remainingDoctors.push(...group.doctors);
  }
  
  // Group remaining doctors by ZIP if possible, otherwise by city+state
  const remainingByZip = new Map<string, Doctor[]>();
  const remainingByCityState = new Map<string, Doctor[]>();
  
  for (const doctor of remainingDoctors) {
    const location = getDoctorLocation(doctor);
    if (location?.zip) {
      if (!remainingByZip.has(location.zip)) {
        remainingByZip.set(location.zip, []);
      }
      remainingByZip.get(location.zip)!.push(doctor);
    } else if (location?.city && location?.state) {
      const key = `${location.city}:${location.state}`;
      if (!remainingByCityState.has(key)) {
        remainingByCityState.set(key, []);
      }
      remainingByCityState.get(key)!.push(doctor);
    } else {
      // No location info - add to a catch-all group
      if (!remainingByCityState.has('unknown')) {
        remainingByCityState.set('unknown', []);
      }
      remainingByCityState.get('unknown')!.push(doctor);
    }
  }
  
  // Create institutions from ZIP groups first
  for (const [zip, doctors] of remainingByZip.entries()) {
    if (doctors.length >= 2 && doctors.length <= 8) {
      institutions.push([...doctors]);
    } else if (doctors.length > 8) {
      // Split large groups
      let start = 0;
      while (start < doctors.length) {
        const size = Math.min(6, doctors.length - start);
        institutions.push(doctors.slice(start, start + size));
        start += size;
      }
    } else {
      // Single doctor - merge with nearest ZIP or city group
      const singleDoctor = doctors[0];
      const singleLocation = getDoctorLocation(singleDoctor);
      
      // Try to find nearest ZIP group
      let merged = false;
      if (singleLocation?.state) {
        for (const [otherZip, otherDoctors] of remainingByZip.entries()) {
          const otherLocation = getDoctorLocation(otherDoctors[0]);
          if (otherLocation?.state === singleLocation.state && otherDoctors.length < 6) {
            otherDoctors.push(singleDoctor);
            merged = true;
            break;
          }
        }
      }
      
      if (!merged) {
        // Add to city+state group
        const key = singleLocation?.city && singleLocation?.state 
          ? `${singleLocation.city}:${singleLocation.state}`
          : 'unknown';
        if (!remainingByCityState.has(key)) {
          remainingByCityState.set(key, []);
        }
        remainingByCityState.get(key)!.push(singleDoctor);
      }
    }
  }
  
  // Process city+state groups
  for (const [key, doctors] of remainingByCityState.entries()) {
    if (doctors.length >= 2 && doctors.length <= 8) {
      institutions.push([...doctors]);
    } else if (doctors.length > 8) {
      // Split large groups
      let start = 0;
      while (start < doctors.length) {
        const size = Math.min(6, doctors.length - start);
        institutions.push(doctors.slice(start, start + size));
        start += size;
      }
    } else if (doctors.length === 1) {
      // Single doctor - try to merge with existing institution in same state
      const singleDoctor = doctors[0];
      const singleLocation = getDoctorLocation(singleDoctor);
      let merged = false;
      
      if (singleLocation?.state) {
        for (let i = 0; i < institutions.length; i++) {
          const instDoctors = institutions[i];
          const instLocation = getDoctorLocation(instDoctors[0]);
          if (instLocation?.state === singleLocation.state && instDoctors.length < 8) {
            institutions[i].push(singleDoctor);
            merged = true;
            break;
          }
        }
      }
      
      if (!merged) {
        // Create new institution for single doctor
        institutions.push([singleDoctor]);
      }
    }
  }
  
  // Ensure we don't exceed target count - merge small institutions if needed
  while (institutions.length > targetInstitutionCount) {
    // Find two smallest institutions and merge them
    institutions.sort((a, b) => a.length - b.length);
    if (institutions.length >= 2) {
      const smallest = institutions[0];
      const secondSmallest = institutions[1];
      const merged = [...smallest, ...secondSmallest];
      institutions.splice(0, 2);
      institutions.push(merged);
    } else {
      break;
    }
  }

  return institutions;
}

/**
 * Create institution from doctor group
 */
function createInstitution(
  institutionDoctors: Doctor[],
  index: number
): Institution {
  // Get primary location from first doctor
  const primaryDoctor = institutionDoctors[0];
  const location = getDoctorLocation(primaryDoctor);
  
  // Prioritize ZIP code - find ZIP from any doctor in institution
  let zip = location?.zip || primaryDoctor.locations[0]?.zip || '';
  if (!zip || zip.trim() === '') {
    // Try to find ZIP from any doctor in the institution
    for (const doctor of institutionDoctors) {
      for (const loc of doctor.locations) {
        if (loc.zip && loc.zip.trim() !== '') {
          zip = loc.zip.trim();
          break;
        }
      }
      if (zip) break;
    }
  }
  
  // If still no ZIP, try to get from city/state using coordinates
  const city = location?.city || primaryDoctor.locations[0]?.city || 'Unknown';
  const state = location?.state || primaryDoctor.locations[0]?.state || 'Unknown';
  
  // If no ZIP found, try to infer from city/state or use a default based on state
  if (!zip || zip.trim() === '') {
    // Try to find a ZIP from any doctor's location in same city/state
    for (const doctor of institutionDoctors) {
      for (const loc of doctor.locations) {
        if (loc.zip && loc.zip.trim() !== '' && loc.city === city && loc.state === state) {
          zip = loc.zip.trim();
          break;
        }
      }
      if (zip) break;
    }
  }
  
  const addressLine1 = primaryDoctor.locations[0]?.address || `${index + 1} Medical Center Drive`;
  const phone = primaryDoctor.locations[0]?.phone || '(555) 000-0000';

  // Collect all specialties
  const specialtySet = new Set<string>();
  for (const doctor of institutionDoctors) {
    if (doctor.specialty) specialtySet.add(doctor.specialty);
    if (doctor.specialties) {
      for (const spec of doctor.specialties) {
        specialtySet.add(spec);
      }
    }
  }
  const specialties = Array.from(specialtySet);

  // Generate name
  const name = generateInstitutionName(city, state, specialties);
  const slug = generateSlug(name);

  // Get coordinates - prioritize ZIP-based coordinates
  let coords = { lat: 0, lng: 0 };
  if (zip && zip.trim() !== '') {
    const zipCoords = getZIPCoordinates(zip.trim());
    if (zipCoords) {
      coords = zipCoords;
    } else {
      // ZIP not in mapping, try city/state fallback
      coords = getCityStateCoordinates(city, state) || { lat: 0, lng: 0 };
    }
  } else {
    // No ZIP, use city/state
    coords = getCityStateCoordinates(city, state) || { lat: 0, lng: 0 };
  }

  // Generate description
  const doctorCount = institutionDoctors.length;
  const description = `${name} is a ${specialties[0] || 'medical'} practice located in ${city}, ${state}. Our team of ${doctorCount} ${doctorCount === 1 ? 'physician' : 'physicians'} provides comprehensive ${specialties[0] || 'medical'} care to patients throughout the region.`;

  const now = new Date().toISOString();
  const id = `institution-${index + 1}`;

  return {
    id,
    slug: `${slug}-${index + 1}`, // Ensure uniqueness
    name,
    description,
    phone,
    email: `contact@${slug.replace(/-/g, '')}.com`,
    website: `https://${slug.replace(/-/g, '')}.com`,
    address: {
      line1: addressLine1,
      city,
      state,
      zip,
      country: 'USA',
    },
    location: {
      lat: coords.lat,
      lng: coords.lng,
    },
    specialties,
    doctorIds: institutionDoctors.map(d => d.id),
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Main seed function
 */
function seedInstitutions() {
  console.log('Starting institution seed...');
  console.log(`Total doctors: ${doctors.length}`);

  // Group doctors
  const groups = groupDoctors(doctors);
  console.log(`Created ${groups.length} location groups`);

  // Distribute into institutions
  const institutionDoctorGroups = distributeDoctorsIntoInstitutions(groups);
  console.log(`Created ${institutionDoctorGroups.length} institution groups`);

  // Create institutions
  const institutions: Institution[] = [];
  const doctorInstitutionMap = new Map<string, string>(); // doctorId -> institutionId

  for (let i = 0; i < institutionDoctorGroups.length; i++) {
    const institution = createInstitution(institutionDoctorGroups[i], i);
    institutions.push(institution);
    
    // Map doctors to institution
    for (const doctor of institutionDoctorGroups[i]) {
      doctorInstitutionMap.set(doctor.id, institution.id);
    }
  }

  console.log(`Created ${institutions.length} institutions`);

  // Write institutions.ts
  const institutionsPath = path.join(process.cwd(), 'src/data/institutions.ts');
  const institutionsContent = `import { Institution } from '@/types';

export const institutions: Institution[] = ${JSON.stringify(institutions, null, 2)};
`;
  
  fs.writeFileSync(institutionsPath, institutionsContent, 'utf-8');
  console.log(`✓ Written ${institutionsPath}`);

  // Generate doctors update (showing what needs to be added)
  console.log('\n=== Doctor Institution Assignments ===');
  console.log('Add institutionId to each doctor in doctors.ts:');
  console.log('\n');
  
  for (const [doctorId, institutionId] of doctorInstitutionMap.entries()) {
    const doctor = doctors.find(d => d.id === doctorId);
    if (doctor) {
      console.log(`// ${doctor.fullName}`);
      console.log(`institutionId: '${institutionId}',`);
    }
  }

  console.log('\n✓ Seed completed successfully!');
  console.log(`\nNext steps:`);
  console.log(`1. Review institutions.ts`);
  console.log(`2. Add institutionId to each doctor in doctors.ts (see assignments above)`);
  console.log(`3. Verify institution slugs are unique`);
}

// Run if executed directly
if (require.main === module) {
  seedInstitutions();
}

export { seedInstitutions };
