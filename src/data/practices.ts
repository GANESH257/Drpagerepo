import { Practice } from '@/types/practice';
import { generatePracticesFromDoctors } from '@/lib/migrations/generatePracticesFromDoctors';
import { zipCoordinates } from './zipCoordinates';

/**
 * Import base doctors array
 * We import from _baseDoctors.ts which contains the raw doctors array
 */
import { baseDoctors } from './_baseDoctors';

/**
 * Generate practices from base doctors
 * This uses the same generator that doctors.ts uses to ensure consistency
 */
export const practices: Practice[] = generatePracticesFromDoctors(baseDoctors, zipCoordinates);

/**
 * Type-safe helper to get seed practices
 */
export function getSeedPractices(): Practice[] {
  return practices;
}
