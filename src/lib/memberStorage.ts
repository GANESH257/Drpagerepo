import { Doctor } from '@/types';
import { getAllDoctorsArray } from '@/lib/api/doctors';

/**
 * Get all doctors from API
 * @deprecated Use getAllDoctorsArray from @/lib/api/doctors directly
 */
export async function getAllDoctors(): Promise<Doctor[]> {
  try {
    const doctors = await getAllDoctorsArray();
    return doctors;
  } catch (error) {
    console.error('Error loading doctors:', error);
    return [];
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
 * Get a doctor by ID from API
 * @deprecated Use getDoctor from @/lib/api/doctors directly
 */
export async function getDoctorById(doctorId: string): Promise<Doctor | null> {
  try {
    const { getDoctor } = await import('@/lib/api/doctors');
    return await getDoctor(doctorId);
  } catch (error) {
    console.error('Error loading doctor:', error);
    return null;
  }
}

/**
 * Get a doctor by email from API
 * @deprecated Use getDoctors with search filter from @/lib/api/doctors directly
 */
export async function getDoctorByEmail(email: string): Promise<Doctor | null> {
  try {
    const doctors = await getAllDoctorsArray();
    return doctors.find((d) => d.email?.toLowerCase() === email.toLowerCase()) || null;
  } catch (error) {
    console.error('Error loading doctor by email:', error);
    return null;
  }
}
