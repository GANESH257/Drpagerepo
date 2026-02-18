import { Institution, Doctor } from '@/types';

// Import institutions data
import { institutions as institutionsData } from '@/data/institutions';

/**
 * Get all institutions, merging seed data with localStorage overrides
 */
export function getAllInstitutions(): Institution[] {
  if (typeof window === 'undefined') {
    return institutionsData;
  }

  try {
    const deletedIds = getDeletedInstitutionIds();
    const overrides = getInstitutionOverrides();
    
    // Start with seed data, filter out deleted institutions
    let allInstitutions = institutionsData.filter((i) => !deletedIds.includes(i.id));
    
    // Apply overrides
    allInstitutions = allInstitutions.map((institution) => {
      const override = overrides[institution.id];
      if (override) {
        return { ...institution, ...override };
      }
      return institution;
    });
    
    return allInstitutions;
  } catch (error) {
    console.error('Error loading institutions:', error);
    return institutionsData;
  }
}

/**
 * Get institution overrides from localStorage
 */
export function getInstitutionOverrides(): Record<string, Partial<Institution>> {
  if (typeof window === 'undefined') return {};

  try {
    const stored = localStorage.getItem('aip_institution_overrides');
    if (stored) {
      return JSON.parse(stored) as Record<string, Partial<Institution>>;
    }
    return {};
  } catch (error) {
    console.error('Error loading institution overrides:', error);
    return {};
  }
}

/**
 * Save institution override to localStorage
 */
export function saveInstitutionOverride(institutionId: string, override: Partial<Institution>): void {
  if (typeof window === 'undefined') return;

  try {
    const overrides = getInstitutionOverrides();
    overrides[institutionId] = { ...overrides[institutionId], ...override };
    localStorage.setItem('aip_institution_overrides', JSON.stringify(overrides));
  } catch (error) {
    console.error('Error saving institution override:', error);
  }
}

/**
 * Get deleted institution IDs from localStorage
 */
export function getDeletedInstitutionIds(): string[] {
  if (typeof window === 'undefined') return [];

  try {
    const stored = localStorage.getItem('aip_deleted_institutions');
    if (stored) {
      return JSON.parse(stored) as string[];
    }
    return [];
  } catch (error) {
    console.error('Error loading deleted institutions:', error);
    return [];
  }
}

/**
 * Get an institution by ID (with overrides applied)
 */
export function getInstitutionById(institutionId: string): Institution | null {
  const allInstitutions = getAllInstitutions();
  return allInstitutions.find((i) => i.id === institutionId) || null;
}

/**
 * Get an institution by slug (with overrides applied)
 */
export function getInstitutionBySlug(slug: string): Institution | null {
  const allInstitutions = getAllInstitutions();
  return allInstitutions.find((i) => i.slug === slug) || null;
}

/**
 * Get all doctors for an institution
 */
export function getInstitutionDoctors(institutionId: string, allDoctors: Doctor[]): Doctor[] {
  const institution = getInstitutionById(institutionId);
  if (!institution) return [];

  return allDoctors.filter((doctor) => institution.doctorIds.includes(doctor.id));
}

/**
 * Get doctors by institution ID
 * Similar to getInstitutionDoctors but uses memberStorage pattern
 */
export function getDoctorsByInstitution(institutionId: string, allDoctors: Doctor[]): Doctor[] {
  return allDoctors.filter((doctor) => doctor.institutionId === institutionId);
}
