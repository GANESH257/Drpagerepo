'use client';

export interface AdminSession {
  email: string;
  role: 'admin';
  loginAt: string;
}

const SESSION_KEY = 'aip_admin_session';

/**
 * Get admin session from localStorage
 */
export function getAdminSession(): AdminSession | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const sessionData = localStorage.getItem(SESSION_KEY);
    if (!sessionData) return null;
    
    const session = JSON.parse(sessionData) as AdminSession;
    return session;
  } catch (error) {
    console.error('Error reading admin session:', error);
    return null;
  }
}

/**
 * Set admin session in localStorage
 */
export function setAdminSession(email: string): void {
  if (typeof window === 'undefined') return;
  
  try {
    const session: AdminSession = {
      email,
      role: 'admin',
      loginAt: new Date().toISOString(),
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } catch (error) {
    console.error('Error setting admin session:', error);
  }
}

/**
 * Clear admin session from localStorage
 */
export function clearAdminSession(): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.removeItem(SESSION_KEY);
    // Also clear JWT token and user info used by API calls
    localStorage.removeItem('aip_doctor_token');
    localStorage.removeItem('aip_doctor_user');
    // Also clear dummy join requests on logout
    localStorage.removeItem('aip_join_requests');
    // Clear events overrides
    localStorage.removeItem('aip_global_medical_events_override');
    localStorage.removeItem('aip_board_meetings_override');
    // Clear member management overrides
    localStorage.removeItem('aip_doctor_overrides');
    localStorage.removeItem('aip_doctor_passwords');
    localStorage.removeItem('aip_deleted_doctors');
  } catch (error) {
    console.error('Error clearing admin session:', error);
  }
}

/**
 * Check if admin is authenticated
 */
export function isAdminAuthenticated(): boolean {
  return getAdminSession() !== null;
}
