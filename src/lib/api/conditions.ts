import { apiClient, ApiError, getToken } from './config';

export interface Condition {
  id: string;
  name: string;
  slug: string;
  sort_order: number;
  created_at?: string;
  updated_at?: string;
}

export async function getConditions(): Promise<Condition[]> {
  const token = getToken();
  if (!token) throw new Error('Authentication required');
  const data = await apiClient.get<Condition[]>('/api/conditions', token);
  return Array.isArray(data) ? data : [];
}

export async function createCondition(body: {
  name: string;
  slug?: string;
  sort_order?: number;
}): Promise<Condition> {
  const token = getToken();
  if (!token) throw new Error('Authentication required');
  return apiClient.post<Condition>('/api/conditions', body, token);
}

export async function updateCondition(
  id: string,
  body: Partial<{ name: string; slug: string; sort_order: number }>
): Promise<Condition> {
  const token = getToken();
  if (!token) throw new Error('Authentication required');
  return apiClient.put<Condition>(`/api/conditions/${id}`, body, token);
}

export async function deleteCondition(id: string): Promise<void> {
  const token = getToken();
  if (!token) throw new Error('Authentication required');
  await apiClient.delete(`/api/conditions/${id}`, token);
}
