/**
 * Authentication API functions
 */

import { apiClient, ApiError } from './config';

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    email: string;
    role: string;
    doctorId?: string | null;
  };
}

export interface SignupResponse {
  message: string;
  userId: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupCredentials {
  email: string;
  password: string;
  fullName: string;
}

/**
 * Login user and get JWT token
 */
export async function login(
  email: string,
  password: string
): Promise<LoginResponse> {
  try {
    const response = await apiClient.post<LoginResponse>(
      '/api/auth/login',
      { email, password }
    );
    return response;
  } catch (error) {
    const apiError = error as ApiError;
    throw new Error(apiError.error || 'Login failed');
  }
}

/**
 * Sign up new user
 */
export async function signup(
  email: string,
  password: string,
  fullName: string
): Promise<SignupResponse> {
  try {
    const response = await apiClient.post<SignupResponse>(
      '/api/auth/signup',
      { email, password, fullName }
    );
    return response;
  } catch (error) {
    const apiError = error as ApiError;
    throw new Error(apiError.error || 'Signup failed');
  }
}
