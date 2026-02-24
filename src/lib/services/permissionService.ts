/**
 * Permission and identity service
 * 
 * Handles actor resolution from sessions and permission checks
 */

import { Doctor } from '@/types';
import { getAdminSession } from '@/lib/adminSession';
import { doctors } from '@/data/doctors';
import { normalizeEmail } from './id';
import { AuthRequiredError, PermissionDeniedError } from './errors';

/**
 * Actor type representing the current user
 */
export type Actor =
  | { kind: 'public'; email?: string }
  | { kind: 'admin'; email?: string }
  | {
    kind: 'doctor';
    doctorId: string;
    email?: string;
    practiceId?: string;
    roleInPractice?: 'doctor' | 'practice_admin';
  };

/**
 * Get actor from current session (SSR-safe)
 * 
 * Checks admin session first, then doctor session, then returns public
 */
export function getActorFromSession(): Actor {
  if (typeof window === 'undefined') {
    return { kind: 'public' };
  }

  // Check admin session first
  const adminSession = getAdminSession();
  if (adminSession) {
    return {
      kind: 'admin',
      email: adminSession.email,
    };
  }

  // Check doctor session
  try {
    // Prefer aip_doctor_user (has practiceId, roleInPractice from API when layout loads doctor)
    const userData = localStorage.getItem('aip_doctor_user');
    const sessionData = localStorage.getItem('aip_doctor_session');
    const session = sessionData ? (JSON.parse(sessionData) as { email: string; role: string; doctorId?: string; loginAt: string }) : null;
    const user = userData ? (JSON.parse(userData) as { email: string; role: string; doctorId?: string; practiceId?: string; roleInPractice?: 'doctor' | 'practice_admin' }) : null;

    const effectiveSession = user ?? session;
    if (effectiveSession) {
      // Require role doctor so we don't treat applicants as doctors
      if (effectiveSession.role !== 'doctor') {
        return { kind: 'public' };
      }

      // If doctorId in session/user, use it (session is source of truth for API-created doctors)
      const doctorId = effectiveSession.doctorId ?? (session?.doctorId);
      if (doctorId) {
        // Prefer practiceId/roleInPractice from user (set when layout loads doctor from API)
        const practiceId = user?.practiceId ?? doctors.find((d) => d.id === doctorId)?.practiceId;
        const roleInPractice = user?.roleInPractice ?? doctors.find((d) => d.id === doctorId)?.roleInPractice;
        return {
          kind: 'doctor',
          doctorId,
          email: effectiveSession.email,
          practiceId,
          roleInPractice,
        };
      }

      // Otherwise, resolve doctorId from email (for legacy/static doctors)
      const normalizedEmail = normalizeEmail(effectiveSession.email);
      if (normalizedEmail) {
        const doctor = doctors.find(
          (d) => d.email && normalizeEmail(d.email) === normalizedEmail
        );
        if (doctor) {
          return {
            kind: 'doctor',
            doctorId: doctor.id,
            email: effectiveSession.email,
            practiceId: doctor.practiceId,
            roleInPractice: doctor.roleInPractice,
          };
        }
      }
    }
  } catch (error) {
    console.error('Error reading doctor session:', error);
  }

  return { kind: 'public' };
}

/**
 * Assert that actor is authenticated
 * Throws AuthRequiredError if public
 */
export function assertAuthenticated(actor: Actor): void {
  if (actor.kind === 'public') {
    throw new AuthRequiredError('Authentication required');
  }
}

/**
 * Assert that actor is admin
 * Throws PermissionDeniedError if not admin
 */
export function assertAdmin(actor: Actor): void {
  if (actor.kind !== 'admin') {
    throw new PermissionDeniedError('Admin access required');
  }
}

/**
 * Assert that actor is a doctor
 * Throws PermissionDeniedError if not doctor
 */
export function assertDoctor(actor: Actor): void {
  if (actor.kind !== 'doctor') {
    throw new PermissionDeniedError('Doctor access required');
  }
}

/**
 * Assert that actor is a practice admin
 * Throws PermissionDeniedError if not practice admin
 * 
 * @param actor Actor to check
 * @param practiceId Optional practice ID to verify match
 */
export function assertPracticeAdmin(
  actor: Actor,
  practiceId?: string
): void {
  if (actor.kind !== 'doctor') {
    throw new PermissionDeniedError('Practice admin access required');
  }

  if (actor.roleInPractice !== 'practice_admin') {
    throw new PermissionDeniedError('Practice admin role required');
  }

  if (practiceId && actor.practiceId !== practiceId) {
    throw new PermissionDeniedError(
      'Practice admin access denied for this practice'
    );
  }
}

/**
 * Check if actor can view doctor's private contact information
 * 
 * @param actor Current actor
 * @param targetDoctor Target doctor
 */
export function canViewDoctorPrivateContact(
  actor: Actor,
  targetDoctor: Doctor
): boolean {
  // Admin can always view
  if (actor.kind === 'admin') {
    return true;
  }

  // Any logged-in doctor can view
  if (actor.kind === 'doctor') {
    return true;
  }

  return false;
}

/**
 * Check if actor can send referrals
 * 
 * @param actor Current actor
 */
export function canSendReferral(actor: Actor): boolean {
  return actor.kind === 'doctor' || actor.kind === 'admin';
}

/**
 * Check if actor can approve as practice admin for a specific request
 * 
 * @param actor Current actor
 * @param request Approval request
 */
export function canApproveAsPracticeAdmin(
  actor: Actor,
  request: { approvals?: { practiceAdmin?: { practiceId?: string } } }
): boolean {
  if (actor.kind !== 'doctor') {
    return false;
  }

  if (actor.roleInPractice !== 'practice_admin') {
    return false;
  }

  const requestPracticeId = request.approvals?.practiceAdmin?.practiceId;
  if (!requestPracticeId) {
    return false;
  }

  return actor.practiceId === requestPracticeId;
}
