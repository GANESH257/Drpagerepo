'use client';

export interface DoctorSession {
  email: string;
  role: string;
  doctorId?: string;
  loginAt: string;
}

const SESSION_KEY = 'aip_doctor_session';

export function useDoctorSession() {
  // Get session from localStorage
  const getSession = (): DoctorSession | null => {
    if (typeof window === 'undefined') return null;
    
    try {
      const sessionData = localStorage.getItem(SESSION_KEY);
      if (!sessionData) return null;
      
      const session = JSON.parse(sessionData) as DoctorSession;
      return session;
    } catch (error) {
      console.error('Error reading session:', error);
      return null;
    }
  };

  // Set session in localStorage
  const setSession = (email: string, doctorId?: string): void => {
    if (typeof window === 'undefined') return;
    
    try {
      const session: DoctorSession = {
        email,
        role: 'doctor',
        doctorId,
        loginAt: new Date().toISOString(),
      };
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    } catch (error) {
      console.error('Error setting session:', error);
    }
  };

  // Update session with doctorId
  const updateSessionDoctorId = (doctorId: string): void => {
    if (typeof window === 'undefined') return;
    
    try {
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

  // Clear session from localStorage
  const clearSession = (): void => {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.removeItem(SESSION_KEY);
    } catch (error) {
      console.error('Error clearing session:', error);
    }
  };

  // Check if user is authenticated
  const isAuthenticated = (): boolean => {
    return getSession() !== null;
  };

  return {
    getSession,
    setSession,
    updateSessionDoctorId,
    clearSession,
    isAuthenticated,
  };
}
