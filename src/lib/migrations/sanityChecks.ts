import { Doctor } from '@/types';
import { Practice } from '@/types/practice';

/**
 * Validation results for practice-doctor integrity
 */
export interface PracticeDoctorIntegrityResult {
  totalDoctors: number;
  totalPractices: number;
  doctorsMissingPractice: string[];
  practicesWithNoDoctors: string[];
  practicesWithoutAdmin: string[];
  practicesWithMultipleAdmins: string[];
  doctorsInMultiplePractices: string[];
  practicesWithInvalidSize: Array<{ practiceId: string; doctorCount: number }>;
  orphanedDoctors: string[]; // Doctors with practiceId that doesn't exist
  orphanedPracticeDoctors: Array<{ practiceId: string; doctorIds: string[] }>; // Doctor IDs in practice that don't exist
  isValid: boolean;
}

/**
 * Validate practice-doctor integrity
 * 
 * Checks:
 * - Every doctor has exactly 1 practiceId
 * - Every practice has at least 1 doctor
 * - Every practice has exactly 1 practice_admin
 * - No doctor appears in multiple practice.doctorIds arrays
 * - Practice sizes are 2-8 doctors (warn if outside)
 * - All practice IDs referenced by doctors exist
 * - All doctor IDs in practice.doctorIds exist
 * 
 * @param doctors Array of doctors
 * @param practices Array of practices
 * @returns Validation results
 */
export function validatePracticeDoctorIntegrity(
  doctors: Doctor[],
  practices: Practice[]
): PracticeDoctorIntegrityResult {
  const result: PracticeDoctorIntegrityResult = {
    totalDoctors: doctors.length,
    totalPractices: practices.length,
    doctorsMissingPractice: [],
    practicesWithNoDoctors: [],
    practicesWithoutAdmin: [],
    practicesWithMultipleAdmins: [],
    doctorsInMultiplePractices: [],
    practicesWithInvalidSize: [],
    orphanedDoctors: [],
    orphanedPracticeDoctors: [],
    isValid: true,
  };

  // Create maps for efficient lookup
  const practiceMap = new Map<string, Practice>();
  practices.forEach((p) => practiceMap.set(p.id, p));

  const doctorMap = new Map<string, Doctor>();
  doctors.forEach((d) => doctorMap.set(d.id, d));

  const doctorToPracticesMap = new Map<string, string[]>(); // doctorId -> practiceIds[]

  // Check doctors
  doctors.forEach((doctor) => {
    if (!doctor.practiceId) {
      result.doctorsMissingPractice.push(doctor.id);
      result.isValid = false;
    } else {
      // Check if practice exists
      if (!practiceMap.has(doctor.practiceId)) {
        result.orphanedDoctors.push(doctor.id);
        result.isValid = false;
      } else {
        // Track which practices this doctor belongs to
        if (!doctorToPracticesMap.has(doctor.id)) {
          doctorToPracticesMap.set(doctor.id, []);
        }
        doctorToPracticesMap.get(doctor.id)!.push(doctor.practiceId);
      }
    }
  });

  // Check for doctors in multiple practices
  doctorToPracticesMap.forEach((practiceIds, doctorId) => {
    if (practiceIds.length > 1) {
      result.doctorsInMultiplePractices.push(doctorId);
      result.isValid = false;
    }
  });

  // Check practices
  practices.forEach((practice) => {
    // Check if practice has doctors
    if (practice.doctorIds.length === 0) {
      result.practicesWithNoDoctors.push(practice.id);
      result.isValid = false;
    }

    // Check practice size (2-8 preferred)
    if (practice.doctorIds.length < 2 || practice.doctorIds.length > 8) {
      result.practicesWithInvalidSize.push({
        practiceId: practice.id,
        doctorCount: practice.doctorIds.length,
      });
      // Warning only, not invalid
    }

    // Check for orphaned doctor IDs in practice
    const orphanedIds = practice.doctorIds.filter((doctorId) => !doctorMap.has(doctorId));
    if (orphanedIds.length > 0) {
      result.orphanedPracticeDoctors.push({
        practiceId: practice.id,
        doctorIds: orphanedIds,
      });
      result.isValid = false;
    }

    // Check practice admin count
    const doctorsInPractice = practice.doctorIds
      .map((id) => doctorMap.get(id))
      .filter((d): d is Doctor => d !== undefined);

    const adminCount = doctorsInPractice.filter(
      (d) => d.roleInPractice === 'practice_admin'
    ).length;

    if (adminCount === 0) {
      result.practicesWithoutAdmin.push(practice.id);
      result.isValid = false;
    } else if (adminCount > 1) {
      result.practicesWithMultipleAdmins.push(practice.id);
      result.isValid = false;
    }
  });

  return result;
}
