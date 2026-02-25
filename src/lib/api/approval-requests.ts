/**
 * Approval Requests API functions
 */

import { apiClient, ApiError, getToken } from './config';

export interface ApprovalRequest {
  id: string;
  type: string;
  requested_by: string;
  requested_by_type: string;
  /** Present when backend JOINs users table (GET list / GET single) */
  requested_by_email?: string | null;
  practice_id?: string;
  target_doctor_id?: string;
  payload: any;
  admin_status: string;
  practice_admin_status?: string;
  admin_notes?: string;
  practice_admin_notes?: string;
  admin_reviewed_at?: string;
  practice_admin_reviewed_at?: string;
  rejection_reason?: string;
  rejected_by?: string;
  created_at: string;
  updated_at: string;
  history?: any[];
}

export interface ApprovalRequestFilters {
  type?: string;
  status?: string;
  practiceId?: string;
  requestedBy?: string;
}

/**
 * Get approval requests with optional filters
 */
export async function getApprovalRequests(
  filters?: ApprovalRequestFilters
): Promise<ApprovalRequest[]> {
  try {
    const token = getToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const queryParams = new URLSearchParams();
    if (filters?.type) queryParams.append('type', filters.type);
    if (filters?.status) queryParams.append('status', filters.status);
    if (filters?.practiceId) queryParams.append('practiceId', filters.practiceId);
    if (filters?.requestedBy) queryParams.append('requestedBy', filters.requestedBy);

    queryParams.set('_', String(Date.now())); // cache-bust so list always reflects latest approval state
    const queryString = queryParams.toString();
    const endpoint = `/api/approval-requests?${queryString}`;

    const response = await apiClient.get<ApprovalRequest[]>(endpoint, token);
    return response;
  } catch (error) {
    const apiError = error as ApiError;
    const msg = apiError.detail ? `${apiError.error}: ${apiError.detail}` : (apiError.error || 'Failed to fetch approval requests');
    throw new Error(msg);
  }
}

/**
 * Get single approval request
 */
export async function getApprovalRequest(id: string): Promise<ApprovalRequest> {
  try {
    const token = getToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await apiClient.get<ApprovalRequest>(
      `/api/approval-requests/${id}?_=${Date.now()}`,
      token
    );
    return response;
  } catch (error) {
    const apiError = error as ApiError;
    if (apiError.status === 404) {
      throw new Error('Approval request not found');
    }
    const msg = apiError.detail ? `${apiError.error}: ${apiError.detail}` : (apiError.error || 'Failed to fetch approval request');
    throw new Error(msg);
  }
}

/**
 * Create new approval request
 */
export async function createApprovalRequest(data: {
  type: string;
  practice_id?: string;
  target_doctor_id?: string;
  payload: any;
}): Promise<ApprovalRequest> {
  try {
    const token = getToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await apiClient.post<ApprovalRequest>(
      '/api/approval-requests',
      data,
      token
    );
    return response;
  } catch (error) {
    const apiError = error as ApiError;
    const msg = apiError.detail ? `${apiError.error}: ${apiError.detail}` : (apiError.error || 'Failed to create approval request');
    throw new Error(msg);
  }
}

/**
 * Update approval request (full payload – do not use for "Mark Under Review")
 */
export async function updateApprovalRequest(
  id: string,
  payload: any
): Promise<ApprovalRequest> {
  try {
    const token = getToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await apiClient.put<ApprovalRequest>(
      `/api/approval-requests/${id}`,
      { payload },
      token
    );
    return response;
  } catch (error) {
    const apiError = error as ApiError;
    throw new Error(apiError.error || 'Failed to update approval request');
  }
}

/**
 * Update only admin notes (e.g. "Mark Under Review"). Does not touch payload.
 * Use this so request data is not overwritten.
 */
export async function updateApprovalRequestNotes(
  id: string,
  admin_notes: string | null
): Promise<ApprovalRequest> {
  try {
    const token = getToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await apiClient.patch<ApprovalRequest>(
      `/api/approval-requests/${id}`,
      { admin_notes },
      token
    );
    return response;
  } catch (error) {
    const apiError = error as ApiError;
    throw new Error(apiError.error || 'Failed to update notes');
  }
}

/**
 * Approve request
 */
export async function approveRequest(
  id: string,
  notes?: string
): Promise<ApprovalRequest> {
  try {
    const token = getToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await apiClient.post<ApprovalRequest>(
      `/api/approval-requests/${id}/approve`,
      { notes },
      token
    );
    return response;
  } catch (error) {
    const apiError = error as ApiError;
    throw new Error(apiError.error || 'Failed to approve request');
  }
}

/**
 * Reject request
 */
export async function rejectRequest(
  id: string,
  reason: string
): Promise<ApprovalRequest> {
  try {
    const token = getToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await apiClient.post<ApprovalRequest>(
      `/api/approval-requests/${id}/reject`,
      { reason },
      token
    );
    return response;
  } catch (error) {
    const apiError = error as ApiError;
    throw new Error(apiError.error || 'Failed to reject request');
  }
}

/**
 * Re-run side effects for an already-approved request (admin only).
 * Use when approval was saved but practice/doctor/user update failed.
 */
export async function applySideEffects(id: string): Promise<{ ok: boolean; message: string }> {
  try {
    const token = getToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await apiClient.post<{ ok: boolean; message: string }>(
      `/api/approval-requests/${id}/apply-side-effects`,
      {},
      token
    );
    return response;
  } catch (error) {
    const apiError = error as ApiError;
    throw new Error(apiError.error || apiError.detail || 'Failed to apply side effects');
  }
}

/**
 * Get all approval history records (admin only)
 */
export async function getApprovalHistory(): Promise<any[]> {
  try {
    const token = getToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await apiClient.get<any[]>(
      '/api/approval-requests/admin/history',
      token
    );
    return response;
  } catch (error) {
    const apiError = error as ApiError;
    throw new Error(apiError.error || 'Failed to fetch approval history');
  }
}
