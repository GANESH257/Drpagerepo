/**
 * Policies API functions
 */

import { apiClient, ApiError, getToken } from './config';

export interface Policy {
  id: string;
  category: string;
  title: string;
  body: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Get all policies
 */
export async function getPolicies(): Promise<Policy[]> {
  try {
    const response = await apiClient.get<Policy[]>('/api/policies');
    return response;
  } catch (error) {
    const apiError = error as ApiError;
    throw new Error(apiError.error || 'Failed to fetch policies');
  }
}

/**
 * Get single policy
 */
export async function getPolicy(id: string): Promise<Policy> {
  try {
    const response = await apiClient.get<Policy>(`/api/policies/${id}`);
    return response;
  } catch (error) {
    const apiError = error as ApiError;
    if (apiError.status === 404) {
      throw new Error('Policy not found');
    }
    throw new Error(apiError.error || 'Failed to fetch policy');
  }
}

/**
 * Create new policy (admin only)
 */
export async function createPolicy(data: Omit<Policy, 'created_at' | 'updated_at'>): Promise<Policy> {
  try {
    const token = getToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await apiClient.post<Policy>(
      '/api/policies',
      data,
      token
    );
    return response;
  } catch (error) {
    const apiError = error as ApiError;
    throw new Error(apiError.error || 'Failed to create policy');
  }
}

/**
 * Update policy (admin only)
 */
export async function updatePolicy(
  id: string,
  data: Partial<Policy>
): Promise<Policy> {
  try {
    const token = getToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await apiClient.put<Policy>(
      `/api/policies/${id}`,
      data,
      token
    );
    return response;
  } catch (error) {
    const apiError = error as ApiError;
    throw new Error(apiError.error || 'Failed to update policy');
  }
}

/**
 * Delete policy (admin only)
 */
export async function deletePolicy(id: string): Promise<void> {
  try {
    const token = getToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    await apiClient.delete(`/api/policies/${id}`, token);
  } catch (error) {
    const apiError = error as ApiError;
    throw new Error(apiError.error || 'Failed to delete policy');
  }
}
