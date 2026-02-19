import { Practice, PracticeOverride } from '@/types/practice';
import { LS_KEYS } from './keys';
import { readJSON, writeJSON } from './localStorage';

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
 * Get practice overrides from localStorage
 */
export function getPracticeOverrides(): Record<string, PracticeOverride> {
  return readJSON<Record<string, PracticeOverride>>(LS_KEYS.PRACTICE_OVERRIDES, {});
}

/**
 * Save practice override to localStorage
 * 
 * @param practiceId Practice ID
 * @param patch Partial practice data to override
 */
export function savePracticeOverride(practiceId: string, patch: PracticeOverride): void {
  const overrides = getPracticeOverrides();
  overrides[practiceId] = { ...overrides[practiceId], ...patch };
  writeJSON(LS_KEYS.PRACTICE_OVERRIDES, overrides);
}

/**
 * Get deleted practice IDs from localStorage
 */
export function getDeletedPracticeIds(): string[] {
  return readJSON<string[]>(LS_KEYS.DELETED_PRACTICES, []);
}

/**
 * Mark practice as deleted
 * 
 * @param practiceId Practice ID to delete
 */
export function deletePractice(practiceId: string): void {
  const deletedIds = getDeletedPracticeIds();
  if (!deletedIds.includes(practiceId)) {
    deletedIds.push(practiceId);
    writeJSON(LS_KEYS.DELETED_PRACTICES, deletedIds);
  }
}

/**
 * Restore deleted practice
 * 
 * @param practiceId Practice ID to restore
 */
export function restorePractice(practiceId: string): void {
  const deletedIds = getDeletedPracticeIds();
  const filtered = deletedIds.filter((id) => id !== practiceId);
  if (filtered.length !== deletedIds.length) {
    writeJSON(LS_KEYS.DELETED_PRACTICES, filtered);
  }
}

/**
 * Merge seed practices with overrides and filter deleted
 * 
 * This is the read pipeline: seed → overrides → deleted filter
 * 
 * @param seedPractices Array of practices from seed data
 * @returns Merged and filtered practices
 */
export function mergePractices(seedPractices: Practice[]): Practice[] {
  const deletedIds = getDeletedPracticeIds();
  const overrides = getPracticeOverrides();

  // Filter out deleted practices
  let practices = seedPractices.filter((p) => !deletedIds.includes(p.id));

  // Apply overrides
  practices = practices.map((practice) => {
    const override = overrides[practice.id];
    if (override) {
      return { ...practice, ...override };
    }
    return practice;
  });

  // Apply migration helper to ensure locations array
  return practices.map(ensureLocationsArray);
}

/**
 * Get created practices (practices created via approval workflow)
 */
export function getCreatedPractices(): Practice[] {
  return readJSON<Practice[]>(LS_KEYS.CREATED_PRACTICES, []);
}

/**
 * Save created practices array
 */
export function saveCreatedPractices(practices: Practice[]): void {
  writeJSON(LS_KEYS.CREATED_PRACTICES, practices);
}

/**
 * Add a newly created practice
 */
export function addCreatedPractice(practice: Practice): void {
  const existing = getCreatedPractices();
  saveCreatedPractices([...existing, practice]);
}
