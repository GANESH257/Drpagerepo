/**
 * Admin community moderation API (reports, user moderation)
 */

import { apiClient, ApiError, getToken } from './config';

export interface CommunityReport {
  id: string;
  post_id: string;
  reported_by_doctor_id: string;
  reason: string | null;
  status: string;
  created_at: string;
  post_title?: string;
  post_body?: string;
  section?: string;
  post_author?: string;
  reporter_name?: string;
}

export interface ModeratedUser {
  id: string;
  doctor_id: string;
  status: string;
  reason: string | null;
  until: string | null;
  created_at: string;
  updated_at: string;
  full_name?: string;
  email?: string;
}

export async function getCommunityReports(): Promise<CommunityReport[]> {
  const token = getToken();
  if (!token) throw new Error('Authentication required');
  try {
    const data = await apiClient.get<CommunityReport[]>('/api/admin/community/reports', token);
    return Array.isArray(data) ? data : [];
  } catch (error) {
    const apiError = error as ApiError;
    throw new Error(apiError.error || 'Failed to fetch reports');
  }
}

export async function patchCommunityReport(
  reportId: string,
  body: { status: 'dismissed' | 'action_taken' }
): Promise<CommunityReport> {
  const token = getToken();
  if (!token) throw new Error('Authentication required');
  try {
    const data = await apiClient.patch<CommunityReport>(
      `/api/admin/community/reports/${reportId}`,
      body,
      token
    );
    return data;
  } catch (error) {
    const apiError = error as ApiError;
    throw new Error(apiError.error || 'Failed to update report');
  }
}

export async function getCommunityModerationList(): Promise<ModeratedUser[]> {
  const token = getToken();
  if (!token) throw new Error('Authentication required');
  try {
    const data = await apiClient.get<ModeratedUser[]>('/api/admin/community/moderation', token);
    return Array.isArray(data) ? data : [];
  } catch (error) {
    const apiError = error as ApiError;
    throw new Error(apiError.error || 'Failed to fetch moderation list');
  }
}

export async function setUserModeration(
  doctorId: string,
  body: { status: 'active' | 'suspended' | 'banned'; reason?: string; until?: string }
): Promise<ModeratedUser> {
  const token = getToken();
  if (!token) throw new Error('Authentication required');
  try {
    const data = await apiClient.put<ModeratedUser>(
      `/api/admin/community/users/${doctorId}/moderation`,
      body,
      token
    );
    return data;
  } catch (error) {
    const apiError = error as ApiError;
    throw new Error(apiError.error || 'Failed to set moderation');
  }
}
