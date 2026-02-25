'use client';


export interface DoctorSession {
  email: string;
  role: string;
  doctorId?: string;
  loginAt: string;
}

export interface UserInfo {
  id: string;
  email: string;
  role: string;
  doctorId?: string | null;
  practiceId?: string | null;
  roleInPractice?: 'doctor' | 'practice_admin' | null;
  /** From backend login; 'pending_profile' = needs to complete onboard, 'active' = full access */
  profileStatus?: string | null;
}

const TOKEN_KEY = 'aip_doctor_token';
const USER_KEY = 'aip_doctor_user';
const SESSION_KEY = 'aip_doctor_session'; // Legacy key for backward compatibility

export function useDoctorSession() {
  // Get JWT token from localStorage
  const getToken = (): string | null => {
    if (typeof window === 'undefined') return null;
    
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch (error) {
      console.error('Error reading token:', error);
      return null;
    }
  };

  // Get user info from localStorage
  const getUser = (): UserInfo | null => {
    if (typeof window === 'undefined') return null;
    
    try {
      const userData = localStorage.getItem(USER_KEY);
      if (!userData) return null;
      return JSON.parse(userData) as UserInfo;
    } catch (error) {
      console.error('Error reading user info:', error);
      return null;
    }
  };

  // Get session (legacy compatibility - returns session object from user info)
  const getSession = (): DoctorSession | null => {
    if (typeof window === 'undefined') return null;
    
    try {
      // Try new format first
      const user = getUser();
      if (user) {
        return {
          email: user.email,
          role: user.role,
          doctorId: user.doctorId || undefined,
          loginAt: new Date().toISOString(), // Approximate
        };
      }

      // Fallback to legacy format
      const sessionData = localStorage.getItem(SESSION_KEY);
      if (sessionData) {
        return JSON.parse(sessionData) as DoctorSession;
      }
      
      return null;
    } catch (error) {
      console.error('Error reading session:', error);
      return null;
    }
  };

  // Set token and user info (new API-based authentication)
  const setToken = (token: string, user: UserInfo | (UserInfo & { profile_status?: string })): void => {
    if (typeof window === 'undefined') return;
    
    try {
      // When logging in as doctor, clear admin session so admin UI doesn't show with doctor token
      if (user.role === 'doctor') {
        localStorage.removeItem('aip_admin_session');
      }

      const normalizedUser: UserInfo = {
        ...user,
        profileStatus: user.profileStatus ?? (user as { profile_status?: string }).profile_status ?? null,
      };
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(USER_KEY, JSON.stringify(normalizedUser));
      
      // Also set legacy session for backward compatibility
      const session: DoctorSession = {
        email: normalizedUser.email,
        role: normalizedUser.role,
        doctorId: normalizedUser.doctorId || undefined,
        loginAt: new Date().toISOString(),
      };
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    } catch (error) {
      console.error('Error setting token:', error);
    }
  };

  // Set session (legacy compatibility - converts to token format if possible)
  const setSession = (email: string, doctorId?: string): void => {
    if (typeof window === 'undefined') return;
    
    try {
      // Legacy method - create a session object
      const session: DoctorSession = {
        email,
        role: 'doctor',
        doctorId,
        loginAt: new Date().toISOString(),
      };
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
      
      // Also store as user info for compatibility
      const user: UserInfo = {
        id: '', // Not available in legacy flow
        email,
        role: 'doctor',
        doctorId: doctorId || null,
      };
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } catch (error) {
      console.error('Error setting session:', error);
    }
  };

  // Update session with doctorId
  const updateSessionDoctorId = (doctorId: string): void => {
    if (typeof window === 'undefined') return;
    
    try {
      // Update user info
      const user = getUser();
      if (user) {
        const updatedUser: UserInfo = {
          ...user,
          doctorId,
        };
        localStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
      }

      // Update legacy session
      const currentSession = getSession();
      if (currentSession) {
        const updatedSession: DoctorSession = {
          ...currentSession,
          doctorId,
        };
        localStorage.setItem(SESSION_KEY, JSON.stringify(updatedSession));
      }
    } catch (error) {
      console.error('Error updating session:', error);
    }
  };

  /** Update session with doctor info from API (practiceId, roleInPractice). Call when doctor is loaded. */
  const updateSessionWithDoctorInfo = (doctor: { practiceId?: string; roleInPractice?: 'doctor' | 'practice_admin' }): void => {
    if (typeof window === 'undefined') return;
    
    try {
      const user = getUser();
      if (user && user.role === 'doctor') {
        const updatedUser: UserInfo = {
          ...user,
          practiceId: doctor.practiceId ?? user.practiceId ?? null,
          roleInPractice: doctor.roleInPractice ?? user.roleInPractice ?? null,
        };
        localStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
      }
    } catch (error) {
      console.error('Error updating session with doctor info:', error);
    }
  };

  // Clear session and token from localStorage
  const clearSession = (): void => {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      localStorage.removeItem(SESSION_KEY);
    } catch (error) {
      console.error('Error clearing session:', error);
    }
  };

  // Check if user is authenticated
  const isAuthenticated = (): boolean => {
    const token = getToken();
    return token !== null && token.length > 0;
  };

  return {
    getToken,
    getUser,
    getSession, // Legacy compatibility
    setToken, // New API-based method
    setSession, // Legacy compatibility
    updateSessionDoctorId,
    updateSessionWithDoctorInfo,
    clearSession,
    isAuthenticated,
  };
}
