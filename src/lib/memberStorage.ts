import { Doctor } from '@/types';
import { doctors } from '@/data/doctors';

/**
 * Get all doctors, merging seed data with localStorage overrides
 */
export function getAllDoctors(): Doctor[] {
  if (typeof window === 'undefined') {
    return doctors;
  }

  try {
    const deletedIds = getDeletedDoctorIds();
    const overrides = getDoctorOverrides();
    
    // Start with seed data, filter out deleted doctors
    let allDoctors = doctors.filter((d) => !deletedIds.includes(d.id));
    
    // Apply overrides
    allDoctors = allDoctors.map((doctor) => {
      const override = overrides[doctor.id];
      if (override) {
        return { ...doctor, ...override };
      }
      return doctor;
    });
    
    return allDoctors;
  } catch (error) {
    console.error('Error loading doctors:', error);
    return doctors;
  }
}

/**
 * Get doctor overrides from localStorage
 */
export function getDoctorOverrides(): Record<string, Partial<Doctor>> {
  if (typeof window === 'undefined') return {};

  try {
    const stored = localStorage.getItem('aip_doctor_overrides');
    if (stored) {
      return JSON.parse(stored) as Record<string, Partial<Doctor>>;
    }
    return {};
  } catch (error) {
    console.error('Error loading doctor overrides:', error);
    return {};
  }
}

/**
 * Save doctor override to localStorage
 */
export function saveDoctorOverride(doctorId: string, override: Partial<Doctor>): void {
  if (typeof window === 'undefined') return;

  try {
    const overrides = getDoctorOverrides();
    overrides[doctorId] = { ...overrides[doctorId], ...override };
    localStorage.setItem('aip_doctor_overrides', JSON.stringify(overrides));
  } catch (error) {
    console.error('Error saving doctor override:', error);
  }
}

/**
 * Get deleted doctor IDs from localStorage
 */
export function getDeletedDoctorIds(): string[] {
  if (typeof window === 'undefined') return [];

  try {
    const stored = localStorage.getItem('aip_deleted_doctors');
    if (stored) {
      return JSON.parse(stored) as string[];
    }
    return [];
  } catch (error) {
    console.error('Error loading deleted doctors:', error);
    return [];
  }
}

/**
 * Delete a doctor (soft delete - adds to deleted list)
 */
export function deleteDoctor(doctorId: string): void {
  if (typeof window === 'undefined') return;

  try {
    const deletedIds = getDeletedDoctorIds();
    if (!deletedIds.includes(doctorId)) {
      deletedIds.push(doctorId);
      localStorage.setItem('aip_deleted_doctors', JSON.stringify(deletedIds));
    }
  } catch (error) {
    console.error('Error deleting doctor:', error);
  }
}

/**
 * Restore a deleted doctor
 */
export function restoreDoctor(doctorId: string): void {
  if (typeof window === 'undefined') return;

  try {
    const deletedIds = getDeletedDoctorIds();
    const updated = deletedIds.filter((id) => id !== doctorId);
    localStorage.setItem('aip_deleted_doctors', JSON.stringify(updated));
  } catch (error) {
    console.error('Error restoring doctor:', error);
  }
}

/**
 * Get a doctor by ID (with overrides applied)
 */
export function getDoctorById(doctorId: string): Doctor | null {
  const allDoctors = getAllDoctors();
  return allDoctors.find((d) => d.id === doctorId) || null;
}

/**
 * Get a doctor by email (with overrides applied)
 */
export function getDoctorByEmail(email: string): Doctor | null {
  const allDoctors = getAllDoctors();
  return allDoctors.find((d) => d.email?.toLowerCase() === email.toLowerCase()) || null;
}
