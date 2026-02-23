import { apiClient, ApiError, getToken } from './config';

export interface Treatment {
  id: string;
  name: string;
  slug: string;
  sort_order: number;
  created_at?: string;
  updated_at?: string;
}

export async function getTreatments(): Promise<Treatment[]> {
  const token = getToken();
  if (!token) throw new Error('Authentication required');
  const data = await apiClient.get<Treatment[]>('/api/treatments', token);
  return Array.isArray(data) ? data : [];
}

export async function createTreatment(body: {
  name: string;
  slug?: string;
  sort_order?: number;
}): Promise<Treatment> {
  const token = getToken();
  if (!token) throw new Error('Authentication required');
  return apiClient.post<Treatment>('/api/treatments', body, token);
}

export async function updateTreatment(
  id: string,
  body: Partial<{ name: string; slug: string; sort_order: number }>
): Promise<Treatment> {
  const token = getToken();
  if (!token) throw new Error('Authentication required');
  return apiClient.put<Treatment>(`/api/treatments/${id}`, body, token);
}

export async function deleteTreatment(id: string): Promise<void> {
  const token = getToken();
  if (!token) throw new Error('Authentication required');
  await apiClient.delete(`/api/treatments/${id}`, token);
}
