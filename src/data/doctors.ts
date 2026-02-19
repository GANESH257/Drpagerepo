import { Doctor } from '@/types';
import { generatePracticesFromDoctors } from '@/lib/migrations/generatePracticesFromDoctors';
import { applyPracticeAssignmentsToDoctors } from '@/lib/migrations/applyPracticeAssignmentsToDoctors';
import { zipCoordinates } from './zipCoordinates';
import { baseDoctors } from './_baseDoctors';

// Generate practices from base doctors
const generatedPractices = generatePracticesFromDoctors(baseDoctors, zipCoordinates);

// Apply practice assignments to doctors
const doctorsWithPractices = applyPracticeAssignmentsToDoctors(baseDoctors, generatedPractices);

// Export final doctors with practice assignments
export const doctors: Doctor[] = doctorsWithPractices;

// Re-export baseDoctors for backward compatibility (if anything imports it from here)
export { baseDoctors };
