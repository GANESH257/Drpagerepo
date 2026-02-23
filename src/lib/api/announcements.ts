/**
 * Announcements API (replaces Firestore for doctor portal)
 */

import { apiClient, ApiError, getToken } from './config';

export interface Announcement {
  id: string;
  audience_type: string;
  audience_practice_id?: string;
  audience_specialty?: string;
  title: string;
  body: string;
  created_by?: string;
  created_at: string;
  read?: boolean;
}

export async function getAnnouncements(): Promise<Announcement[]> {
  const token = getToken();
  if (!token) throw new Error('Authentication required');
  const response = await apiClient.get<Announcement[]>('/api/announcements', token);
  return response;
}

export async function markAnnouncementRead(id: string): Promise<void> {
  const token = getToken();
  if (!token) throw new Error('Authentication required');
  await apiClient.patch(`/api/announcements/${id}/read`, {}, token);
}
