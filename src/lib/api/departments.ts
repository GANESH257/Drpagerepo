/**
 * Departments API functions
 */

import { apiClient, ApiError } from './config';

export interface Department {
  name: string;
  slug: string;
  description: string;
}

/**
 * Get all departments/specialties
 */
export async function getDepartments(): Promise<Department[]> {
  try {
    const response = await apiClient.get<Department[]>('/api/departments');
    return response;
  } catch (error) {
    const apiError = error as ApiError;
    throw new Error(apiError.error || 'Failed to fetch departments');
  }
}
