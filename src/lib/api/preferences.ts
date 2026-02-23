/**
 * Doctor preferences API (Account Settings)
 */

import { apiClient, ApiError, getToken } from './config';

export interface DoctorPreferences {
  doctor_id: string;
  email_digest: boolean;
  notify_referrals: boolean;
  notify_messages: boolean;
  notify_announcements: boolean;
  updated_at?: string;
}

export async function getPreferences(): Promise<DoctorPreferences> {
  const token = getToken();
  if (!token) throw new Error('Authentication required');
  const response = await apiClient.get<DoctorPreferences>('/api/doctors/me/preferences', token);
  return response;
}

export async function updatePreferences(
  prefs: Partial<Pick<DoctorPreferences, 'email_digest' | 'notify_referrals' | 'notify_messages' | 'notify_announcements'>>
): Promise<DoctorPreferences> {
  const token = getToken();
  if (!token) throw new Error('Authentication required');
  const response = await apiClient.put<DoctorPreferences>('/api/doctors/me/preferences', prefs, token);
  return response;
}
