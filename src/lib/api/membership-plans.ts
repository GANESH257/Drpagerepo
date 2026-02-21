/**
 * Membership Plans API functions
 */

import { apiClient, ApiError, getToken } from './config';

export interface MembershipPlan {
  id: string;
  name: string;
  badge?: string;
  monthly_price: number;
  annual_price: number;
  description?: string;
  features?: any;
  cta_label?: string;
  cta_href?: string;
  active: boolean;
}

/**
 * Get all active membership plans
 */
export async function getMembershipPlans(): Promise<MembershipPlan[]> {
  try {
    const response = await apiClient.get<MembershipPlan[]>('/api/membership-plans');
    return response;
  } catch (error) {
    const apiError = error as ApiError;
    throw new Error(apiError.error || 'Failed to fetch membership plans');
  }
}

/**
 * Get single membership plan
 */
export async function getMembershipPlan(id: string): Promise<MembershipPlan> {
  try {
    const response = await apiClient.get<MembershipPlan>(`/api/membership-plans/${id}`);
    return response;
  } catch (error) {
    const apiError = error as ApiError;
    if (apiError.status === 404) {
      throw new Error('Membership plan not found');
    }
    throw new Error(apiError.error || 'Failed to fetch membership plan');
  }
}

/**
 * Create new membership plan (admin only)
 */
export async function createMembershipPlan(
  data: Omit<MembershipPlan, 'active'>
): Promise<MembershipPlan> {
  try {
    const token = getToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    // Ensure features is an array
    const requestData = {
      ...data,
      features: Array.isArray(data.features) ? data.features : (data.features ? [data.features] : []),
    };

    const response = await apiClient.post<MembershipPlan>(
      '/api/membership-plans',
      requestData,
      token
    );
    return response;
  } catch (error) {
    console.error('Error creating membership plan:', error);
    const apiError = error as ApiError;
    const errorMessage = apiError.error || (error instanceof Error ? error.message : 'Failed to create membership plan');
    throw new Error(errorMessage);
  }
}

/**
 * Update membership plan (admin only)
 */
export async function updateMembershipPlan(
  id: string,
  data: Partial<MembershipPlan>
): Promise<MembershipPlan> {
  try {
    const token = getToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await apiClient.put<MembershipPlan>(
      `/api/membership-plans/${id}`,
      data,
      token
    );
    return response;
  } catch (error) {
    const apiError = error as ApiError;
    throw new Error(apiError.error || 'Failed to update membership plan');
  }
}

/**
 * Delete membership plan (admin only) - soft delete
 */
export async function deleteMembershipPlan(id: string): Promise<void> {
  try {
    const token = getToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    await apiClient.delete(`/api/membership-plans/${id}`, token);
  } catch (error) {
    const apiError = error as ApiError;
    throw new Error(apiError.error || 'Failed to delete membership plan');
  }
}
