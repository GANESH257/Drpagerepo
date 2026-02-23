/**
 * Committees API (Leadership & Committees)
 */

import { apiClient, ApiError, getToken } from './config';

export interface CommitteeMember {
  id: string;
  role?: string;
  sort_order: number;
  doctor_id: string;
  full_name: string;
  doctor_slug: string;
  specialty?: string;
  profile_image_url?: string;
}

export interface Committee {
  id: string;
  name: string;
  slug: string;
  description?: string;
  sort_order: number;
  members: CommitteeMember[];
}

export async function getCommittees(): Promise<Committee[]> {
  const token = getToken();
  if (!token) throw new Error('Authentication required');
  const response = await apiClient.get<Committee[]>('/api/committees', token);
  return Array.isArray(response) ? response : [];
}

export async function getCommittee(id: string): Promise<Committee> {
  const token = getToken();
  if (!token) throw new Error('Authentication required');
  const response = await apiClient.get<Committee>(`/api/committees/${id}`, token);
  return response;
}

export interface CreateCommitteeInput {
  name: string;
  slug: string;
  description?: string;
  sort_order?: number;
}

export async function createCommittee(data: CreateCommitteeInput): Promise<Committee> {
  const token = getToken();
  if (!token) throw new Error('Authentication required');
  const response = await apiClient.post<Committee>('/api/committees', data, token);
  return response;
}

export async function updateCommittee(
  id: string,
  data: Partial<CreateCommitteeInput>
): Promise<Committee> {
  const token = getToken();
  if (!token) throw new Error('Authentication required');
  const response = await apiClient.put<Committee>(`/api/committees/${id}`, data, token);
  return response;
}

export async function deleteCommittee(id: string): Promise<void> {
  const token = getToken();
  if (!token) throw new Error('Authentication required');
  await apiClient.delete(`/api/committees/${id}`, token);
}

export async function addCommitteeMember(
  committeeId: string,
  data: { doctor_id: string; role?: string; sort_order?: number }
): Promise<CommitteeMember> {
  const token = getToken();
  if (!token) throw new Error('Authentication required');
  const response = await apiClient.post<CommitteeMember>(
    `/api/committees/${committeeId}/members`,
    data,
    token
  );
  return response;
}

export async function updateCommitteeMember(
  committeeId: string,
  memberId: string,
  data: { role?: string; sort_order?: number }
): Promise<CommitteeMember> {
  const token = getToken();
  if (!token) throw new Error('Authentication required');
  const response = await apiClient.put<CommitteeMember>(
    `/api/committees/${committeeId}/members/${memberId}`,
    data,
    token
  );
  return response;
}

export async function removeCommitteeMember(committeeId: string, memberId: string): Promise<void> {
  const token = getToken();
  if (!token) throw new Error('Authentication required');
  await apiClient.delete(`/api/committees/${committeeId}/members/${memberId}`, token);
}
