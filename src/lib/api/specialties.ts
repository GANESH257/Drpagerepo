import { apiClient, ApiError, getToken } from './config';

export interface Specialty {
  id: string;
  name: string;
  slug: string;
  description?: string;
  sort_order: number;
  created_at?: string;
  updated_at?: string;
}

export async function getSpecialties(): Promise<Specialty[]> {
  const token = getToken();
  if (!token) throw new Error('Authentication required');
  const data = await apiClient.get<Specialty[]>('/api/specialties', token);
  return Array.isArray(data) ? data : [];
}

export async function createSpecialty(body: {
  name: string;
  slug?: string;
  description?: string;
  sort_order?: number;
}): Promise<Specialty> {
  const token = getToken();
  if (!token) throw new Error('Authentication required');
  return apiClient.post<Specialty>('/api/specialties', body, token);
}

export async function updateSpecialty(
  id: string,
  body: Partial<{ name: string; slug: string; description: string; sort_order: number }>
): Promise<Specialty> {
  const token = getToken();
  if (!token) throw new Error('Authentication required');
  return apiClient.put<Specialty>(`/api/specialties/${id}`, body, token);
}

export async function deleteSpecialty(id: string): Promise<void> {
  const token = getToken();
  if (!token) throw new Error('Authentication required');
  await apiClient.delete(`/api/specialties/${id}`, token);
}
