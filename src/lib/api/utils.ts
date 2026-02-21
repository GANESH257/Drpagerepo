/**
 * Utility functions for API calls
 * Provides direct access to token/user without requiring React hooks
 */

const TOKEN_KEY = 'aip_doctor_token';
const USER_KEY = 'aip_doctor_user';

/**
 * Get token directly from localStorage (for use outside React components)
 */
export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch (error) {
    console.error('Error reading token:', error);
    return null;
  }
}

/**
 * Get user info directly from localStorage (for use outside React components)
 */
export function getUser(): { id: string; email: string; role: string; doctorId?: string | null } | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const userData = localStorage.getItem(USER_KEY);
    if (!userData) return null;
    return JSON.parse(userData);
  } catch (error) {
    console.error('Error reading user info:', error);
    return null;
  }
}
