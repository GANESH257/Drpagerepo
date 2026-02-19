import { doctors } from '@/data/doctors';
import { practices } from '@/data/practices';
import { validatePracticeDoctorIntegrity } from './sanityChecks';

/**
 * Run Step 3 sanity checks and log results
 * 
 * Call this manually in dev console: runStep3Sanity()
 */
export function runStep3Sanity() {
  const results = validatePracticeDoctorIntegrity(doctors, practices);
  
  console.log('=== Step 3 Sanity Check ===');
  console.log(`Total Doctors: ${results.totalDoctors}`);
  console.log(`Total Practices: ${results.totalPractices}`);
  console.log(`Valid: ${results.isValid ? '✅' : '❌'}`);
  
  if (results.doctorsMissingPractice.length > 0) {
    console.warn('⚠️ Doctors missing practice:', results.doctorsMissingPractice);
  }
  
  if (results.practicesWithNoDoctors.length > 0) {
    console.warn('⚠️ Practices with no doctors:', results.practicesWithNoDoctors);
  }
  
  if (results.practicesWithoutAdmin.length > 0) {
    console.warn('⚠️ Practices without admin:', results.practicesWithoutAdmin);
  }
  
  if (results.practicesWithMultipleAdmins.length > 0) {
    console.warn('⚠️ Practices with multiple admins:', results.practicesWithMultipleAdmins);
  }
  
  if (results.doctorsInMultiplePractices.length > 0) {
    console.warn('⚠️ Doctors in multiple practices:', results.doctorsInMultiplePractices);
  }
  
  if (results.practicesWithInvalidSize.length > 0) {
    console.warn('⚠️ Practices with invalid size (should be 2-8):', results.practicesWithInvalidSize);
  }
  
  if (results.orphanedDoctors.length > 0) {
    console.warn('⚠️ Doctors with non-existent practiceId:', results.orphanedDoctors);
  }
  
  if (results.orphanedPracticeDoctors.length > 0) {
    console.warn('⚠️ Practices with non-existent doctor IDs:', results.orphanedPracticeDoctors);
  }
  
  if (results.isValid) {
    console.log('✅ All checks passed!');
  }
  
  return results;
}
