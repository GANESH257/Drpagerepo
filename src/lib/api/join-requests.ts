/**
 * Join Requests API functions
 * Join requests are stored as approval_requests with types: new_practice_with_admin_doctor, doctor_join_practice
 */

import { apiClient, ApiError, getToken } from './config';
import { AdminJoinRequest } from '@/lib/adminStorage';

/**
 * Get all join requests
 * Backend transforms approval_requests to AdminJoinRequest format
 */
export async function getJoinRequests(): Promise<AdminJoinRequest[]> {
  try {
    const token = getToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await apiClient.get<AdminJoinRequest[]>(
      '/api/join-requests',
      token
    );
    return response;
  } catch (error) {
    const apiError = error as ApiError;
    throw new Error(apiError.error || 'Failed to fetch join requests');
  }
}

/**
 * Get single join request
 */
export async function getJoinRequest(id: string): Promise<AdminJoinRequest> {
  try {
    const token = getToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await apiClient.get<AdminJoinRequest>(
      `/api/join-requests/${id}`,
      token
    );
    return response;
  } catch (error) {
    const apiError = error as ApiError;
    if (apiError.status === 404) {
      throw new Error('Join request not found');
    }
    throw new Error(apiError.error || 'Failed to fetch join request');
  }
}

/**
 * Update join request status
 */
export async function updateJoinRequest(
  id: string,
  updates: {
    status?: 'submitted' | 'under_review' | 'approved' | 'rejected';
    notes?: string;
  }
): Promise<AdminJoinRequest> {
  try {
    const token = getToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await apiClient.put<AdminJoinRequest>(
      `/api/join-requests/${id}`,
      updates,
      token
    );
    return response;
  } catch (error) {
    const apiError = error as ApiError;
    throw new Error(apiError.error || 'Failed to update join request');
  }
}

/**
 * Approve join request
 * Uses the approval-requests approve endpoint internally
 */
export async function approveJoinRequest(
  id: string,
  notes?: string
): Promise<AdminJoinRequest> {
  try {
    const token = getToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await apiClient.post<AdminJoinRequest>(
      `/api/join-requests/${id}/approve`,
      { notes },
      token
    );
    return response;
  } catch (error) {
    const apiError = error as ApiError;
    throw new Error(apiError.error || 'Failed to approve join request');
  }
}

/**
 * Reject join request
 * Uses the approval-requests reject endpoint internally
 */
export async function rejectJoinRequest(
  id: string,
  reason: string
): Promise<AdminJoinRequest> {
  try {
    const token = getToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await apiClient.post<AdminJoinRequest>(
      `/api/join-requests/${id}/reject`,
      { reason },
      token
    );
    return response;
  } catch (error) {
    const apiError = error as ApiError;
    throw new Error(apiError.error || 'Failed to reject join request');
  }
}
