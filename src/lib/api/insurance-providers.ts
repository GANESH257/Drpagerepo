import { apiClient, ApiError, getToken } from './config';

export interface InsuranceProvider {
  id: string;
  name: string;
  slug: string;
  sort_order: number;
  created_at?: string;
  updated_at?: string;
}

export async function getInsuranceProviders(): Promise<InsuranceProvider[]> {
  const token = getToken();
  if (!token) throw new Error('Authentication required');
  const data = await apiClient.get<InsuranceProvider[]>('/api/insurance-providers', token);
  return Array.isArray(data) ? data : [];
}

export async function createInsuranceProvider(body: {
  name: string;
  slug?: string;
  sort_order?: number;
}): Promise<InsuranceProvider> {
  const token = getToken();
  if (!token) throw new Error('Authentication required');
  return apiClient.post<InsuranceProvider>('/api/insurance-providers', body, token);
}

export async function updateInsuranceProvider(
  id: string,
  body: Partial<{ name: string; slug: string; sort_order: number }>
): Promise<InsuranceProvider> {
  const token = getToken();
  if (!token) throw new Error('Authentication required');
  return apiClient.put<InsuranceProvider>(`/api/insurance-providers/${id}`, body, token);
}

export async function deleteInsuranceProvider(id: string): Promise<void> {
  const token = getToken();
  if (!token) throw new Error('Authentication required');
  await apiClient.delete(`/api/insurance-providers/${id}`, token);
}
