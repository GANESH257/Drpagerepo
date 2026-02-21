/**
 * Referrals API functions
 */

import { apiClient, ApiError, getToken } from './config';

export interface Referral {
  id: string;
  from_doctor_id: string;
  to_doctor_id: string;
  patient_name_or_initials: string;
  patient_age?: number;
  patient_sex?: string;
  patient_phone?: string;
  condition_summary: string;
  notes?: string;
  status: string;
  created_at: string;
  updated_at: string;
  attended_at?: string;
  from_doctor_name?: string;
  to_doctor_name?: string;
}

/**
 * Get referrals (optionally filtered by doctorId)
 */
export async function getReferrals(doctorId?: string): Promise<Referral[]> {
  try {
    const token = getToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const endpoint = doctorId
      ? `/api/referrals?doctorId=${doctorId}`
      : '/api/referrals';

    const response = await apiClient.get<Referral[]>(endpoint, token);
    return response;
  } catch (error) {
    const apiError = error as ApiError;
    throw new Error(apiError.error || 'Failed to fetch referrals');
  }
}

/**
 * Get single referral
 */
export async function getReferral(id: string): Promise<Referral> {
  try {
    const token = getToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await apiClient.get<Referral>(`/api/referrals/${id}`, token);
    return response;
  } catch (error) {
    const apiError = error as ApiError;
    if (apiError.status === 404) {
      throw new Error('Referral not found');
    }
    throw new Error(apiError.error || 'Failed to fetch referral');
  }
}

/**
 * Create new referral
 */
export async function createReferral(data: {
  to_doctor_id: string;
  patient_name_or_initials: string;
  patient_age?: number;
  patient_sex?: string;
  patient_phone?: string;
  condition_summary: string;
  notes?: string;
}): Promise<Referral> {
  try {
    const token = getToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await apiClient.post<Referral>('/api/referrals', data, token);
    return response;
  } catch (error) {
    const apiError = error as ApiError;
    throw new Error(apiError.error || 'Failed to create referral');
  }
}

/**
 * Update referral
 */
export async function updateReferral(
  id: string,
  data: Partial<Referral>
): Promise<Referral> {
  try {
    const token = getToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await apiClient.put<Referral>(
      `/api/referrals/${id}`,
      data,
      token
    );
    return response;
  } catch (error) {
    const apiError = error as ApiError;
    throw new Error(apiError.error || 'Failed to update referral');
  }
}

/**
 * Get all referrals (admin only) - returns all referrals system-wide
 */
export async function getAllReferrals(): Promise<Referral[]> {
  try {
    const token = getToken();
    if (!token) {
      throw new Error('Authentication required. Please log in.');
    }

    // For admin, get all referrals by not passing doctorId
    const response = await apiClient.get<Referral[]>('/api/referrals', token);
    return response || [];
  } catch (error) {
    // Better error handling
    if (error instanceof Error) {
      // If it's already an Error object, check if it's an ApiError
      const apiError = error as unknown as ApiError;
      if (apiError.error) {
        throw new Error(apiError.error);
      }
      // If it's a regular Error, use its message
      throw error;
    }
    // Fallback for unknown error types
    console.error('Unexpected error fetching referrals:', error);
    throw new Error('Failed to fetch all referrals. Please check your connection and try again.');
  }
}
