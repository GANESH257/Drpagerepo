/**
 * Practices API functions
 */

import { apiClient, ApiError, getToken } from './config';

export interface Practice {
  id: string;
  name: string;
  status: string;
  locations?: any[];
  doctors?: any[];
  specialties?: string[];
  services?: string[];
  insurance?: any[];
  [key: string]: any;
}

export interface PracticesResponse {
  practices: Practice[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface PracticeFilters {
  city?: string;
  state?: string;
  specialty?: string;
  search?: string;
  page?: number;
  limit?: number;
  /** When true and request is authenticated as admin, includes practices with status pending_profile */
  includePending?: boolean;
}

/**
 * Get all practices with optional filters.
 * Pass token and includePending: true when loading as admin to include pending_profile practices.
 */
export async function getPractices(
  filters?: PracticeFilters,
  token?: string | null
): Promise<PracticesResponse> {
  try {
    const queryParams = new URLSearchParams();
    if (filters?.city) queryParams.append('city', filters.city);
    if (filters?.state) queryParams.append('state', filters.state);
    if (filters?.specialty) queryParams.append('specialty', filters.specialty);
    if (filters?.search) queryParams.append('search', filters.search);
    if (filters?.page) queryParams.append('page', (filters.page ?? 1).toString());
    if (filters?.limit) queryParams.append('limit', (filters.limit ?? 100).toString());
    if (filters?.includePending === true) queryParams.append('includePending', 'true');

    const queryString = queryParams.toString();
    const endpoint = `/api/practices${queryString ? `?${queryString}` : ''}`;

    const authToken = token ?? getToken();
    const response = await apiClient.get<PracticesResponse>(endpoint, authToken ?? undefined);
    return response;
  } catch (error) {
    const apiError = error as ApiError;
    throw new Error(apiError.error || 'Failed to fetch practices');
  }
}

/**
 * Get all practices - legacy function for backward compatibility
 * Returns just the practices array.
 * Pass { includePending: true } and token when loading for admin to include pending_profile practices.
 */
export async function getAllPracticesArray(
  filters?: PracticeFilters,
  token?: string | null
): Promise<Practice[]> {
  const response = await getPractices(filters ?? {}, token);
  return response.practices;
}

/**
 * Get single practice by ID with related data.
 * Returns practice with normalized address/specialties (works for any status).
 * Pass token for auth-required access (e.g. pending_profile practice).
 */
export async function getPractice(id: string, token?: string | null): Promise<Practice> {
  try {
    const authToken = token ?? getToken();
    const raw = await apiClient.get<Practice & Record<string, unknown>>(`/api/practices/${id}`, authToken ?? undefined);
    // Normalize flat API shape to Practice shape (address object, arrays)
    const address = (raw.address && typeof raw.address === 'object' && (raw.address.city != null || raw.address.line1 != null))
      ? raw.address
      : {
          line1: (raw.address_line1 ?? '') as string,
          line2: raw.address_line2 as string | undefined,
          city: (raw.city ?? '') as string,
          state: (raw.state ?? '') as string,
          zip: (raw.zip ?? '') as string,
          country: (raw.country ?? 'USA') as string,
        };
    return {
      ...raw,
      address,
      specialties: Array.isArray(raw.specialties) ? raw.specialties : (raw.specialty ? [raw.specialty] : []),
      locations: raw.locations ?? [],
      doctors: raw.doctors ?? [],
      insurance: raw.insurance ?? [],
      services: raw.services ?? [],
    } as Practice;
  } catch (error) {
    const apiError = error as ApiError;
    if (apiError.status === 404) {
      throw new Error('Practice not found');
    }
    throw new Error(apiError.error || 'Failed to fetch practice');
  }
}

/** Update practice (admin only). Backend expects snake_case (name, description, phone, email, website, address_line1, address_line2, city, state, zip, country, status). */
export async function updatePractice(
  id: string,
  data: Partial<Record<string, string | number | null>>,
  token?: string | null
): Promise<Practice> {
  try {
    const authToken = token ?? getToken();
    if (!authToken) throw new Error('Authentication required');
    const response = await apiClient.put<Practice>(`/api/practices/${id}`, data, authToken);
    return response;
  } catch (error) {
    const apiError = error as ApiError;
    if (apiError.status === 404) throw new Error('Practice not found');
    throw new Error(apiError.error || 'Failed to update practice');
  }
}

export interface PracticeInvitation {
  id: string;
  practice_id: string;
  invited_by: string;
  email: string;
  doctor_name?: string;
  message?: string;
  token: string;
  invitation_link?: string;
  status: string;
  created_at: string;
  expires_at: string;
  accepted_at?: string;
}

/**
 * Get practice invitations (Practice Admin only).
 */
export async function getPracticeInvitations(practiceId: string): Promise<PracticeInvitation[]> {
  const token = getToken();
  if (!token) throw new Error('Authentication required');
  const response = await apiClient.get<PracticeInvitation[]>(
    `/api/practices/${practiceId}/invitations`,
    token
  );
  return response;
}

/**
 * Create practice invitation (Practice Admin only).
 */
export async function createPracticeInvitation(
  practiceId: string,
  data: { email: string; doctor_name?: string; message?: string }
): Promise<PracticeInvitation> {
  const token = getToken();
  if (!token) throw new Error('Authentication required');
  const response = await apiClient.post<PracticeInvitation>(
    `/api/practices/${practiceId}/invitations`,
    data,
    token
  );
  return response;
}
