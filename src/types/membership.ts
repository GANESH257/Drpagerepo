/**
 * Membership types for V2
 */

/**
 * Membership tier types
 */
export type MembershipTier =
  | 'basic'
  | 'professional'
  | 'premier'
  | 'practice_basic'
  | 'practice_plus';

/**
 * Membership entity
 */
export interface Membership {
  id: string; // "mem-..."
  scope: 'doctor' | 'practice';
  doctorId?: string;
  practiceId?: string;
  tier: MembershipTier;
  status: 'active' | 'expired' | 'canceled';
  startedAt: string;
  expiresAt: string;
  renewedAt?: string;
  meta?: Record<string, any>;
}
