/**
 * Practices API functions
 */

import { apiClient, ApiError } from './config';

export interface Practice {
  id: string;
  name: string;
  status: string;
  locations?: any[];
  doctors?: any[];
  specialties?: string[];
  services?: string[];
  insurance?: any[];
  [key: string]: any;
}

export interface PracticesResponse {
  practices: Practice[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface PracticeFilters {
  city?: string;
  state?: string;
  specialty?: string;
  search?: string;
  page?: number;
  limit?: number;
}

/**
 * Get all practices with optional filters
 */
export async function getPractices(
  filters?: PracticeFilters
): Promise<PracticesResponse> {
  try {
    const queryParams = new URLSearchParams();
    if (filters?.city) queryParams.append('city', filters.city);
    if (filters?.state) queryParams.append('state', filters.state);
    if (filters?.specialty) queryParams.append('specialty', filters.specialty);
    if (filters?.search) queryParams.append('search', filters.search);
    if (filters?.page) queryParams.append('page', filters.page.toString());
    if (filters?.limit) queryParams.append('limit', filters.limit.toString());

    const queryString = queryParams.toString();
    const endpoint = `/api/practices${queryString ? `?${queryString}` : ''}`;

    const response = await apiClient.get<PracticesResponse>(endpoint);
    return response;
  } catch (error) {
    const apiError = error as ApiError;
    throw new Error(apiError.error || 'Failed to fetch practices');
  }
}

/**
 * Get all practices - legacy function for backward compatibility
 * Returns just the practices array
 */
export async function getAllPracticesArray(): Promise<Practice[]> {
  const response = await getPractices();
  return response.practices;
}

/**
 * Get single practice by ID with related data
 */
export async function getPractice(id: string): Promise<Practice> {
  try {
    const response = await apiClient.get<Practice>(`/api/practices/${id}`);
    return response;
  } catch (error) {
    const apiError = error as ApiError;
    if (apiError.status === 404) {
      throw new Error('Practice not found');
    }
    throw new Error(apiError.error || 'Failed to fetch practice');
  }
}
