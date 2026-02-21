import { Doctor, AppointmentRequest, Referral, LegacyReferral } from '@/types';
import { getDoctor as apiGetDoctor, updateDoctor as apiUpdateDoctor } from '@/lib/api/doctors';
import { getAppointments, createAppointment, updateAppointment, AppointmentRequest as ApiAppointmentRequest } from '@/lib/api/appointments';
import { getReferrals, createReferral, updateReferral, Referral as ApiReferral } from '@/lib/api/referrals';
import { getToken } from '@/lib/api/config';

/**
 * Find a doctor by email address
 * @deprecated Use API to search doctors instead
 */
export function findDoctorByEmail(email: string): Doctor | null {
  // This function is deprecated - use API search instead
  // Keeping for backward compatibility during migration
  return null;
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
 * Load doctor profile from API
 * @deprecated Use getDoctor from @/lib/api/doctors directly
 */
export async function loadDoctorProfile(doctorId: string): Promise<Doctor | null> {
  try {
    const token = getToken();
    const doctor = await apiGetDoctor(doctorId, token || undefined);
    return doctor;
  } catch (error) {
    console.error('Error loading doctor profile:', error);
    return null;
  }
}

/**
 * Save doctor profile to API
 * @deprecated Use updateDoctor from @/lib/api/doctors directly
 */
export async function saveDoctorProfile(
  doctorId: string,
  profile: Partial<Doctor>
): Promise<Doctor | null> {
  try {
    const token = getToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const updated = await apiUpdateDoctor(doctorId, profile, token);
    
    // Cache in localStorage for offline access
    if (typeof window !== 'undefined') {
      localStorage.setItem(getProfileKey(doctorId), JSON.stringify(updated));
    }
    
    return updated;
  } catch (error) {
    console.error('Error saving doctor profile:', error);
    throw error;
  }
}

/**
 * Save doctor profile to API (new method)
 */
export async function saveDoctorProfileToAPI(
  doctorId: string,
  profile: Partial<Doctor>
): Promise<Doctor | null> {
  return saveDoctorProfile(doctorId, profile);
}

/**
 * Load doctor profile from API (new method)
 */
export async function loadDoctorProfileFromAPI(doctorId: string): Promise<Doctor | null> {
  return loadDoctorProfile(doctorId);
}

/**
 * Transform API appointment request to frontend format
 */
function transformAppointmentRequest(apiAppointment: ApiAppointmentRequest): AppointmentRequest {
  return {
    id: apiAppointment.id,
    patientName: apiAppointment.patient_name,
    requestedDate: apiAppointment.requested_date,
    requestedTime: apiAppointment.requested_time,
    reason: apiAppointment.reason || '',
    insurance: apiAppointment.insurance || '',
    status: apiAppointment.status as 'New' | 'Confirmed' | 'Completed' | 'Declined',
    declinedNote: apiAppointment.declined_note,
    createdAt: apiAppointment.created_at,
  };
}

/**
 * Load appointment requests from API
 */
export async function loadAppointmentRequests(doctorId: string): Promise<AppointmentRequest[]> {
  try {
    const apiAppointments = await getAppointments(doctorId);
    return apiAppointments.map(transformAppointmentRequest);
  } catch (error) {
    console.error('Error loading appointment requests:', error);
    return [];
  }
}

/**
 * Save appointment requests to API
 * Note: This creates a new appointment. For updates, use updateAppointment directly.
 */
export async function saveAppointmentRequests(
  doctorId: string,
  requests: AppointmentRequest[]
): Promise<void> {
  // This function signature doesn't match API well - appointments are created individually
  // Keeping for backward compatibility but implementation may need adjustment
  try {
    // Create new appointments that don't have IDs
    for (const request of requests) {
      if (!request.id) {
        await createAppointment({
          doctor_id: doctorId,
          patient_name: request.patientName,
          requested_date: request.requestedDate,
          requested_time: request.requestedTime,
          reason: request.reason,
          insurance: request.insurance,
        });
      }
    }
  } catch (error) {
    console.error('Error saving appointment requests:', error);
    throw error;
  }
}

/**
 * Transform API referral to LegacyReferral format
 */
function transformReferral(apiReferral: ApiReferral): LegacyReferral {
  // Map API status to LegacyReferral status
  let status: 'New' | 'In Progress' | 'Closed' = 'New';
  if (apiReferral.status === 'In Progress' || apiReferral.status === 'in_progress') {
    status = 'In Progress';
  } else if (apiReferral.status === 'Closed' || apiReferral.status === 'closed') {
    status = 'Closed';
  }

  return {
    id: apiReferral.id,
    referringPhysicianName: apiReferral.from_doctor_name || 'Unknown',
    referringPhysicianSpecialty: '', // Not available in API response
    date: apiReferral.created_at,
    patientInitials: apiReferral.patient_name_or_initials,
    referralReason: apiReferral.condition_summary,
    status,
    createdAt: apiReferral.created_at,
  };
}

/**
 * Load referrals from API
 */
export async function loadReferrals(doctorId: string): Promise<Referral[]> {
  try {
    const apiReferrals = await getReferrals(doctorId);
    return apiReferrals.map(transformReferral);
  } catch (error) {
    console.error('Error loading referrals:', error);
    return [];
  }
}

/**
 * Save referrals to API
 * Note: This creates a new referral. For updates, use updateReferral directly.
 * Note: LegacyReferral format doesn't have all fields needed for API, so this may need adjustment
 */
export async function saveReferrals(doctorId: string, referrals: Referral[]): Promise<void> {
  // This function signature doesn't match API well - referrals are created individually
  // Keeping for backward compatibility but implementation may need adjustment
  try {
    // Create new referrals that don't have IDs
    // Note: LegacyReferral format is limited, so we use available fields
    for (const referral of referrals) {
      if (!referral.id) {
        // LegacyReferral doesn't have to_doctor_id, so we can't create referrals this way
        // This function may need to be updated to accept additional parameters
        console.warn('Cannot create referral from LegacyReferral format - missing required fields');
      }
    }
  } catch (error) {
    console.error('Error saving referrals:', error);
    throw error;
  }
}
