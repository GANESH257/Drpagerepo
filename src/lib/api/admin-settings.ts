import { apiClient, ApiError, getToken } from './config';

export async function getAdminSettings(): Promise<Record<string, string>> {
  const token = getToken();
  if (!token) throw new Error('Authentication required');
  try {
    const data = await apiClient.get<Record<string, string>>('/api/admin/settings', token);
    return data && typeof data === 'object' ? data : {};
  } catch (error) {
    const apiError = error as ApiError;
    throw new Error(apiError.error || 'Failed to fetch settings');
  }
}

export async function updateAdminSettings(settings: Record<string, string>): Promise<Record<string, string>> {
  const token = getToken();
  if (!token) throw new Error('Authentication required');
  try {
    const data = await apiClient.put<Record<string, string>>('/api/admin/settings', settings, token);
    return data && typeof data === 'object' ? data : {};
  } catch (error) {
    const apiError = error as ApiError;
    throw new Error(apiError.error || 'Failed to update settings');
  }
}
