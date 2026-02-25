/**
 * API Client Configuration
 * Handles all HTTP requests to the backend API
 */

const API_BASE_URL = 
  process.env.NEXT_PUBLIC_API_URL || 
  'https://aip-backend-682175235100.us-central1.run.app';

/**
 * Get token from localStorage (for use outside React components)
 */
export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem('aip_doctor_token');
  } catch (error) {
    console.error('Error reading token:', error);
    return null;
  }
}

export interface ApiError {
  error: string;
  status?: number;
  detail?: string;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  /**
   * Get authorization header if token is provided
   */
  private getHeaders(token?: string): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  /**
   * Handle API errors
   */
  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      let errorMessage = 'An error occurred';
      let detail: string | undefined;
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorMessage;
        detail = errorData.detail;
      } catch {
        errorMessage = response.statusText || errorMessage;
      }

      const error: ApiError = {
        error: errorMessage,
        status: response.status,
        ...(detail && { detail }),
      };
      throw error;
    }

    return response.json();
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string, token?: string): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'GET',
      headers: this.getHeaders(token),
      credentials: 'include',
      cache: 'no-store', // avoid serving stale list data (e.g. admin practices)
    });

    return this.handleResponse<T>(response);
  }

  /**
   * POST request
   */
  async post<T>(endpoint: string, data: any, token?: string): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers: this.getHeaders(token),
      credentials: 'include',
      body: JSON.stringify(data),
    });

    return this.handleResponse<T>(response);
  }

  /**
   * PATCH request
   */
  async patch<T>(endpoint: string, data: any, token?: string): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'PATCH',
      headers: this.getHeaders(token),
      credentials: 'include',
      body: JSON.stringify(data || {}),
    });
    return this.handleResponse<T>(response);
  }

  /**
   * PUT request
   */
  async put<T>(endpoint: string, data: any, token?: string): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'PUT',
      headers: this.getHeaders(token),
      credentials: 'include',
      body: JSON.stringify(data),
    });

    return this.handleResponse<T>(response);
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string, token?: string): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'DELETE',
      headers: this.getHeaders(token),
      credentials: 'include',
    });

    return this.handleResponse<T>(response);
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
export { API_BASE_URL };
