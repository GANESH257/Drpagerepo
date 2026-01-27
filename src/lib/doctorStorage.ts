import { Doctor, AppointmentRequest, Referral } from '@/types';
import { doctors } from '@/data/doctors';

/**
 * Find a doctor by email address
 */
export function findDoctorByEmail(email: string): Doctor | null {
  return doctors.find((doctor) => doctor.email?.toLowerCase() === email.toLowerCase()) || null;
}

/**
 * Get localStorage key for doctor profile
 */
function getProfileKey(doctorId: string): string {
  return `aip_doctor_profile_${doctorId}`;
}

/**
 * Get localStorage key for appointment requests
 */
function getRequestsKey(doctorId: string): string {
  return `aip_doctor_requests_${doctorId}`;
}

/**
 * Get localStorage key for referrals
 */
function getReferralsKey(doctorId: string): string {
  return `aip_doctor_referrals_${doctorId}`;
}

/**
 * Load doctor profile from localStorage or return seed data
 */
export function loadDoctorProfile(doctorId: string): Doctor | null {
  if (typeof window === 'undefined') return null;

  try {
    // First check localStorage
    const stored = localStorage.getItem(getProfileKey(doctorId));
    if (stored) {
      return JSON.parse(stored) as Doctor;
    }

    // Fallback to seed data
    const seedDoctor = doctors.find((d) => d.id === doctorId);
    return seedDoctor || null;
  } catch (error) {
    console.error('Error loading doctor profile:', error);
    // Fallback to seed data on error
    return doctors.find((d) => d.id === doctorId) || null;
  }
}

/**
 * Save doctor profile to localStorage
 */
export function saveDoctorProfile(doctorId: string, profile: Partial<Doctor>): void {
  if (typeof window === 'undefined') return;

  try {
    // Load existing profile (from localStorage or seed)
    const existing = loadDoctorProfile(doctorId);
    if (!existing) {
      console.error('Cannot save profile: doctor not found');
      return;
    }

    // Merge changes
    const updated: Doctor = {
      ...existing,
      ...profile,
    };

    // Save to localStorage
    localStorage.setItem(getProfileKey(doctorId), JSON.stringify(updated));
  } catch (error) {
    console.error('Error saving doctor profile:', error);
  }
}

/**
 * Load appointment requests from localStorage
 */
export function loadAppointmentRequests(doctorId: string): AppointmentRequest[] {
  if (typeof window === 'undefined') return [];

  try {
    const stored = localStorage.getItem(getRequestsKey(doctorId));
    if (stored) {
      return JSON.parse(stored) as AppointmentRequest[];
    }
    return [];
  } catch (error) {
    console.error('Error loading appointment requests:', error);
    return [];
  }
}

/**
 * Save appointment requests to localStorage
 */
export function saveAppointmentRequests(doctorId: string, requests: AppointmentRequest[]): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(getRequestsKey(doctorId), JSON.stringify(requests));
  } catch (error) {
    console.error('Error saving appointment requests:', error);
  }
}

/**
 * Load referrals from localStorage
 */
export function loadReferrals(doctorId: string): Referral[] {
  if (typeof window === 'undefined') return [];

  try {
    const stored = localStorage.getItem(getReferralsKey(doctorId));
    if (stored) {
      return JSON.parse(stored) as Referral[];
    }
    return [];
  } catch (error) {
    console.error('Error loading referrals:', error);
    return [];
  }
}

/**
 * Save referrals to localStorage
 */
export function saveReferrals(doctorId: string, referrals: Referral[]): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(getReferralsKey(doctorId), JSON.stringify(referrals));
  } catch (error) {
    console.error('Error saving referrals:', error);
  }
}
