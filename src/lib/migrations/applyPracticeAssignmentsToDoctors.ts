import { Doctor } from '@/types';
import { Practice } from '@/types/practice';

/**
 * Apply practice assignments to doctors
 * 
 * Safely adds practiceId and roleInPractice to doctors without modifying other fields.
 * Creates a reverse map from practices and assigns practice admin role to the doctor
 * with the lowest lexical ID in each practice.
 * 
 * @param doctors Array of doctors (will not be mutated)
 * @param practices Array of practices with doctorIds
 * @returns New array of doctors with practiceId and roleInPractice assigned
 */
export function applyPracticeAssignmentsToDoctors(
  doctors: Doctor[],
  practices: Practice[]
): Doctor[] {
  // Create reverse map: doctorId -> practiceId
  const doctorToPracticeMap = new Map<string, string>();
  
  practices.forEach((practice) => {
    practice.doctorIds.forEach((doctorId) => {
      doctorToPracticeMap.set(doctorId, practice.id);
    });
  });

  // Identify practice admins (lowest lexical doctor ID in each practice)
  const practiceAdmins = new Set<string>();
  
  practices.forEach((practice) => {
    if (practice.doctorIds.length > 0) {
      // Sort doctor IDs lexically and take the first one
      const sortedIds = [...practice.doctorIds].sort((a, b) => a.localeCompare(b));
      practiceAdmins.add(sortedIds[0]);
    }
  });

  // Map each doctor with practice assignment
  return doctors.map((doctor) => {
    const practiceId = doctorToPracticeMap.get(doctor.id);
    const isPracticeAdmin = practiceAdmins.has(doctor.id);
    
    return {
      ...doctor, // Preserve all existing fields including institutionId
      practiceId,
      roleInPractice: practiceId 
        ? (isPracticeAdmin ? 'practice_admin' : 'doctor')
        : undefined,
    };
  });
}
