/**
 * Doctors API functions
 */

import { apiClient, ApiError } from './config';
import { Doctor } from '@/types';

/** Normalize API doctor (snake_case) to frontend Doctor (camelCase) */
function normalizeDoctorFromAPI(raw: any): Doctor {
  return {
    ...raw,
    firstName: raw.first_name ?? raw.firstName ?? '',
    lastName: raw.last_name ?? raw.lastName ?? '',
    fullName: (raw.full_name ?? raw.fullName ?? [raw.first_name ?? raw.firstName, raw.last_name ?? raw.lastName].filter(Boolean).join(' ').trim()) || '',
    practiceId: raw.practice_id ?? raw.practiceId,
    roleInPractice: raw.role_in_practice ?? raw.roleInPractice,
    locations: Array.isArray(raw.locations) ? raw.locations : (raw.locations ?? []),
    insurance: Array.isArray(raw.insurance) ? raw.insurance : (raw.insurance ?? []),
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

    const response = await apiClient.get<DoctorsResponse>(endpoint, token);
    return response;
  } catch (error) {
    const apiError = error as ApiError;
    throw new Error(apiError.error || 'Failed to fetch doctors');
  }
}

/**
 * Get all doctors - legacy function for backward compatibility
 * Returns just the doctors array
 */
export async function getAllDoctorsArray(token?: string): Promise<Doctor[]> {
  const response = await getDoctors({}, token);
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
 * Update doctor profile (requires authentication)
 */
export async function updateDoctor(
  id: string,
  data: Partial<Doctor>,
  token: string
): Promise<Doctor> {
  try {
    const response = await apiClient.put<Doctor>(
      `/api/doctors/${id}`,
      data,
      token
    );
    return response;
  } catch (error) {
    const apiError = error as ApiError;
    if (apiError.status === 403) {
      throw new Error('Unauthorized to update this doctor');
    }
    throw new Error(apiError.error || 'Failed to update doctor');
  }
}
