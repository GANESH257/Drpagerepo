import { MembershipData, MembershipTransaction } from '@/types';
import { membershipPlans } from '@/data/membershipPlans';

/**
 * Get localStorage key for doctor membership
 */
function getMembershipKey(doctorId: string): string {
  return `aip_doctor_membership_${doctorId}`;
}

/**
 * Load membership data from localStorage
 */
export function loadMembership(doctorId: string): MembershipData | null {
  if (typeof window === 'undefined') return null;

  try {
    const stored = localStorage.getItem(getMembershipKey(doctorId));
    if (stored) {
      return JSON.parse(stored) as MembershipData;
    }
    return null;
  } catch (error) {
    console.error('Error loading membership:', error);
    return null;
  }
}

/**
 * Save membership data to localStorage
 */
export function saveMembership(doctorId: string, data: MembershipData): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(getMembershipKey(doctorId), JSON.stringify(data));
  } catch (error) {
    console.error('Error saving membership:', error);
  }
}

/**
 * Upgrade membership plan
 */
export function upgradeMembership(
  doctorId: string,
  planId: string,
  billingCycle: 'monthly' | 'annual'
): void {
  if (typeof window === 'undefined') return;

  try {
    const existing = loadMembership(doctorId);
    const now = new Date().toISOString();

    const updated: MembershipData = {
      planId,
      billingCycle,
      status: 'pending_payment',
      memberSince: existing?.memberSince || now,
      renewalDate: existing?.renewalDate || now,
      lastPaymentMethod: existing?.lastPaymentMethod || null,
      history: existing?.history || [],
    };

    saveMembership(doctorId, updated);
  } catch (error) {
    console.error('Error upgrading membership:', error);
  }
}

/**
 * Complete payment and activate membership
 */
export function completeMembershipPayment(
  doctorId: string,
  paymentMethod: 'paypal' | 'card'
): void {
  if (typeof window === 'undefined') return;

  try {
    const existing = loadMembership(doctorId);
    if (!existing) return;

    const now = new Date();
    const renewalDate =
      existing.billingCycle === 'annual'
        ? new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000)
        : new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    // Get plan pricing for transaction
    const plan = membershipPlans.find((p) => p.id === existing.planId);
    const priceValue = plan?.pricing[existing.billingCycle];
    const amount: number =
      typeof priceValue === 'number'
        ? priceValue
        : typeof priceValue === 'string'
        ? parseFloat(priceValue) || 0
        : 0;

    const transaction: MembershipTransaction = {
      id: `txn-${Date.now()}`,
      date: now.toISOString(),
      amount,
      plan: existing.planId,
      status: 'completed',
    };

    const updated: MembershipData = {
      ...existing,
      status: 'active',
      renewalDate: renewalDate.toISOString(),
      lastPaymentMethod: paymentMethod,
      history: [transaction, ...(existing.history || [])].slice(0, 10), // Keep last 10 transactions
    };

    saveMembership(doctorId, updated);
  } catch (error) {
    console.error('Error completing payment:', error);
  }
}

/**
 * Check if membership is active
 */
export function isMembershipActive(doctorId: string): boolean {
  const membership = loadMembership(doctorId);
  if (!membership) return false;

  if (membership.status === 'active') {
    const renewalDate = new Date(membership.renewalDate);
    const now = new Date();
    return renewalDate > now;
  }

  return false;
}

/**
 * Initialize default membership for a doctor
 */
export function initializeMembership(
  doctorId: string,
  planId: string = 'basic',
  billingCycle: 'monthly' | 'annual' = 'annual'
): void {
  if (typeof window === 'undefined') return;

  try {
    const existing = loadMembership(doctorId);
    if (existing) return; // Don't overwrite existing membership

    const now = new Date().toISOString();
    const renewalDate =
      billingCycle === 'annual'
        ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
        : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

    const newMembership: MembershipData = {
      planId,
      billingCycle,
      status: 'active',
      memberSince: now,
      renewalDate,
      lastPaymentMethod: null,
      history: [],
    };

    saveMembership(doctorId, newMembership);
  } catch (error) {
    console.error('Error initializing membership:', error);
  }
}

/**
 * Update billing cycle only (without changing plan)
 */
export function updateBillingCycle(
  doctorId: string,
  billingCycle: 'monthly' | 'annual'
): void {
  if (typeof window === 'undefined') return;

  try {
    const existing = loadMembership(doctorId);
    if (!existing) return;

    const now = new Date();
    const renewalDate =
      billingCycle === 'annual'
        ? new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000)
        : new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const updated: MembershipData = {
      ...existing,
      billingCycle,
      renewalDate: renewalDate.toISOString(),
    };

    saveMembership(doctorId, updated);
  } catch (error) {
    console.error('Error updating billing cycle:', error);
  }
}

/**
 * Update payment method
 */
export function updatePaymentMethod(
  doctorId: string,
  method: 'paypal' | 'card' | null
): void {
  if (typeof window === 'undefined') return;

  try {
    const existing = loadMembership(doctorId);
    if (!existing) return;

    const updated: MembershipData = {
      ...existing,
      lastPaymentMethod: method,
    };

    saveMembership(doctorId, updated);
  } catch (error) {
    console.error('Error updating payment method:', error);
  }
}