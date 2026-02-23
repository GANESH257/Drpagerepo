/**
 * Doctor profile stats API (dashboard metrics)
 */

import { apiClient, ApiError, getToken } from './config';

export interface ProfileStats {
  profile_views_this_month: number;
}

export async function getProfileStats(): Promise<ProfileStats> {
  const token = getToken();
  if (!token) throw new Error('Authentication required');
  const response = await apiClient.get<ProfileStats>('/api/doctors/me/profile-stats', token);
  return response;
}

export async function recordProfileView(doctorId: string): Promise<void> {
  await apiClient.post(`/api/doctors/${doctorId}/view`, {});
}
