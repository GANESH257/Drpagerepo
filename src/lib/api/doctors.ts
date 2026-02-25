/**
 * Doctors API functions
 */

import { apiClient, ApiError } from './config';
import { Doctor, ConditionServiceRow } from '@/types';

/** Normalize conditions_and_services from API to conditionServices (and legacy conditionsAndServices) */
function normalizeConditionServices(raw: any): { conditionServices: ConditionServiceRow[]; conditionsAndServices: string[] } {
  const cs = raw.conditions_and_services ?? raw.conditionServices ?? raw.conditionsAndServices;
  if (Array.isArray(cs) && cs.length > 0) {
    const first = cs[0];
    if (typeof first === 'object' && first !== null && 'condition' in first && Array.isArray(first.services)) {
      const conditionServices = cs as ConditionServiceRow[];
      const conditionsAndServices = conditionServices.flatMap((r) => [r.condition, ...r.services].filter(Boolean));
      return { conditionServices, conditionsAndServices };
    }
    const legacy = cs as string[];
    const conditionServices: ConditionServiceRow[] = legacy.map((s) => ({ condition: s, services: [] }));
    return { conditionServices, conditionsAndServices: legacy };
  }
  return { conditionServices: [], conditionsAndServices: [] };
}

/** Normalize API doctor (snake_case) to frontend Doctor (camelCase) */
function normalizeDoctorFromAPI(raw: any): Doctor {
  const firstName = raw.first_name ?? raw.firstName ?? '';
  const middleName = raw.middle_name ?? raw.middleName ?? undefined;
  const lastName = raw.last_name ?? raw.lastName ?? '';
  const fullNameRaw = raw.full_name ?? raw.fullName;
  const fullName = fullNameRaw && String(fullNameRaw).trim()
    ? String(fullNameRaw).trim()
    : [firstName, middleName, lastName].filter(Boolean).join(' ').trim() || '';
  const { conditionServices, conditionsAndServices } = normalizeConditionServices(raw);
  return {
    ...raw,
    firstName,
    middleName: middleName || undefined,
    lastName,
    fullName,
    practiceId: raw.practice_id ?? raw.practiceId,
    practiceName: raw.practice_name ?? raw.practiceName,
    roleInPractice: raw.role_in_practice ?? raw.roleInPractice,
    locations: Array.isArray(raw.locations) ? raw.locations : (raw.locations ?? []),
    insurance: Array.isArray(raw.insurance) ? raw.insurance : (raw.insurance ?? []),
    conditionServices,
    conditionsAndServices,
    specialties: Array.isArray(raw.specialties) ? raw.specialties : (raw.specialty ? [raw.specialty] : raw.specialties ?? []),
    rating: typeof raw.rating === 'number' ? raw.rating : 0,
    reviewCount: typeof raw.reviewCount === 'number' ? raw.reviewCount : (raw.review_count ?? 0),
    reviews: Array.isArray(raw.reviews) ? raw.reviews : (raw.reviews ?? []),
    bio: raw.bio ?? '',
    credentials: raw.credentials ?? '',
    specialty: raw.specialty ?? raw.specialties?.[0] ?? '',
    featured: Boolean(raw.featured),
    verified: Boolean(raw.verified),
    availability: Array.isArray(raw.availability) ? raw.availability : (raw.availability ?? []),
    acceptsNewPatients: raw.accepts_new_patients ?? raw.acceptsNewPatients ?? true,
    npi: raw.npi ?? undefined,
    profileStatus: raw.profile_status ?? raw.profileStatus ?? 'active',
    boardCertifications: raw.board_certifications ?? raw.boardCertifications ?? [],
    badgesAwards: raw.badges_awards ?? raw.badgesAwards ?? [],
    image: raw.profile_image_url ?? raw.image ?? undefined,
    medicalSchool: raw.medical_school ?? raw.medicalSchool ?? undefined,
    residency: raw.residency ?? undefined,
    internship: raw.internship ?? undefined,
    about: raw.about ?? undefined,
    phone: raw.phone ?? undefined,
    website: raw.website ?? raw.personal_website ?? raw.website_url ?? undefined,
    bookingUrl: raw.booking_url ?? raw.bookingUrl ?? undefined,
  };
}

export interface DoctorsResponse {
  doctors: Doctor[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface DoctorFilters {
  specialty?: string;
  city?: string;
  state?: string;
  search?: string;
  page?: number;
  limit?: number;
}

/**
 * Get all doctors (public endpoint) with optional filters
 */
export async function getDoctors(
  filters?: DoctorFilters,
  token?: string
): Promise<DoctorsResponse> {
  try {
    const queryParams = new URLSearchParams();
    if (filters?.specialty) queryParams.append('specialty', filters.specialty);
    if (filters?.city) queryParams.append('city', filters.city);
    if (filters?.state) queryParams.append('state', filters.state);
    if (filters?.search) queryParams.append('search', filters.search);
    if (filters?.page) queryParams.append('page', filters.page.toString());
    if (filters?.limit) queryParams.append('limit', filters.limit.toString());

    const queryString = queryParams.toString();
    const endpoint = `/api/doctors${queryString ? `?${queryString}` : ''}`;

    const response = await apiClient.get<any>(endpoint, token);
    const rawDoctors = Array.isArray(response.doctors) ? response.doctors : [];
    const doctors = rawDoctors.map((raw: any) => normalizeDoctorFromAPI(raw));
    return {
      doctors,
      pagination: response.pagination ?? { page: 1, limit: rawDoctors.length, total: doctors.length, totalPages: 1 },
    };
  } catch (error) {
    const apiError = error as ApiError;
    throw new Error(apiError.error || 'Failed to fetch doctors');
  }
}

/**
 * Get all doctors - legacy function for backward compatibility
 * Returns just the doctors array.
 * @param token - Optional auth token
 * @param options.limit - Optional limit (e.g. 2000 for directory/counts); default uses API default (100)
 */
export async function getAllDoctorsArray(token?: string, options?: { limit?: number }): Promise<Doctor[]> {
  const response = await getDoctors({ limit: options?.limit }, token);
  return response.doctors;
}

/**
 * Get single doctor by ID
 */
export async function getDoctor(id: string, token?: string): Promise<Doctor> {
  try {
    const response = await apiClient.get<any>(`/api/doctors/${id}`, token);
    return normalizeDoctorFromAPI(response);
  } catch (error) {
    const apiError = error as ApiError;
    if (apiError.status === 404) {
      throw new Error('Doctor not found');
    }
    throw new Error(apiError.error || 'Failed to fetch doctor');
  }
}

/**
 * Get single doctor by slug (public profile; no auth required)
 */
export async function getDoctorBySlug(slug: string, token?: string): Promise<Doctor> {
  try {
    const response = await apiClient.get<any>(`/api/doctors/slug/${encodeURIComponent(slug)}`, token);
    return normalizeDoctorFromAPI(response);
  } catch (error) {
    const apiError = error as ApiError;
    if (apiError.status === 404) {
      throw new Error('Doctor not found');
    }
    throw new Error(apiError.error || 'Failed to fetch doctor');
  }
}

/**
 * Update doctor profile (requires authentication).
 * Converts camelCase payload to snake_case for the backend and normalizes the response.
 */
function doctorPayloadToSnakeCase(data: Partial<Doctor>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  if (data.firstName !== undefined) out.first_name = data.firstName;
  if (data.middleName !== undefined) out.middle_name = data.middleName;
  if (data.lastName !== undefined) out.last_name = data.lastName;
  if (data.fullName !== undefined) {
    out.full_name = data.fullName;
    // Some backends require first_name/last_name; derive if we only have fullName
    if (data.firstName === undefined && data.lastName === undefined && data.fullName.trim()) {
      const parts = data.fullName.trim().split(/\s+/);
      if (parts.length >= 2) {
        out.last_name = parts.pop() ?? '';
        out.first_name = parts.join(' ');
      } else {
        out.first_name = data.fullName.trim();
        out.last_name = '';
      }
    }
  }
  if (data.bio !== undefined) out.bio = data.bio;
  if (data.credentials !== undefined) out.credentials = data.credentials;
  if (data.specialty !== undefined) out.specialty = data.specialty;
  if (data.specialties !== undefined) out.specialties = data.specialties;
  if (data.phone !== undefined) out.phone = data.phone;
  if (data.website !== undefined) out.website = data.website;
  if (data.bookingUrl !== undefined) out.booking_url = data.bookingUrl;
  if (data.npi !== undefined) out.npi = data.npi;
  if (data.medicalSchool !== undefined) out.medical_school = data.medicalSchool;
  if (data.residency !== undefined) out.residency = data.residency;
  if (data.internship !== undefined) out.internship = data.internship;
  if (data.about !== undefined) out.about = data.about;
  if (data.acceptsNewPatients !== undefined) out.accepts_new_patients = data.acceptsNewPatients;
  if (data.locations !== undefined) out.locations = data.locations;
  if (data.insurance !== undefined) out.insurance = data.insurance;
  if (data.conditionServices !== undefined) {
    out.conditions_and_services = data.conditionServices;
  }
  if (data.conditionsAndServices !== undefined && !(data.conditionServices !== undefined)) {
    out.conditions_and_services = data.conditionsAndServices;
  }
  if (data.boardCertifications !== undefined) out.board_certifications = data.boardCertifications;
  if (data.badgesAwards !== undefined) out.badges_awards = data.badgesAwards;
  if (data.image !== undefined) out.profile_image_url = data.image;
  if (data.featured !== undefined) out.featured = data.featured;
  return out;
}

export async function updateDoctor(
  id: string,
  data: Partial<Doctor>,
  token: string
): Promise<Doctor> {
  try {
    const payload = Object.keys(data).length > 0 ? doctorPayloadToSnakeCase(data) : (data as Record<string, unknown>);
    const response = await apiClient.put<any>(
      `/api/doctors/${id}`,
      payload,
      token
    );
    return normalizeDoctorFromAPI(response);
  } catch (error) {
    const apiError = error as ApiError;
    if (apiError.status === 403) {
      throw new Error('Unauthorized to update this doctor');
    }
    const message = apiError.detail
      ? `${apiError.error}: ${apiError.detail}`
      : (apiError.error || 'Failed to update doctor');
    throw new Error(message);
  }
}

/**
 * Delete a doctor (backend DELETE /api/doctors/:id).
 * Requires authentication; pass token from getToken().
 */
export async function deleteDoctor(id: string, token: string): Promise<void> {
  try {
    await apiClient.delete(`/api/doctors/${id}`, token);
  } catch (error) {
    const apiError = error as ApiError;
    if (apiError.status === 404) throw new Error('Doctor not found');
    throw new Error(apiError.error || 'Failed to delete doctor');
  }
}
