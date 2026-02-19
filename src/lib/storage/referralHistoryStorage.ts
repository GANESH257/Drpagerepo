/**
 * Referral History Storage - Append-only history log for referrals
 * 
 * SSR-safe storage for referral history records.
 * All history records are append-only and never modified or deleted.
 */

import { ReferralHistoryRecord } from '@/types/referrals';
import { LS_KEYS } from './keys';
import { readJSON, appendToArray } from './localStorage';
import { getReferrals } from './referralStorage';

/**
 * Get all referral history records
 * Returns empty array on SSR or if no history exists
 * 
 * @returns Array of all history records
 */
export function getReferralHistory(): ReferralHistoryRecord[] {
  return readJSON<ReferralHistoryRecord[]>(LS_KEYS.REFERRAL_HISTORY, []);
}

/**
 * Add a referral history record (append-only)
 * Prepends to array (newest first), capped at 1000 total records (global across all referrals)
 * 
 * @param record History record to append
 */
export function addReferralHistory(record: ReferralHistoryRecord): void {
  appendToArray<ReferralHistoryRecord>(
    LS_KEYS.REFERRAL_HISTORY,
    record,
    1000 // Cap at 1000 total records globally (keeps latest across all referrals)
  );
}

/**
 * Get history records for a specific referral
 * Returns sorted newest first
 * 
 * @param referralId Referral ID to filter by
 * @returns Array of history records for the referral, sorted newest first
 */
export function getHistoryForReferral(referralId: string): ReferralHistoryRecord[] {
  const allHistory = getReferralHistory();
  return allHistory
    .filter((h) => h.referralId === referralId)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

/**
 * Get history records for a doctor (sent or received referrals)
 * Uses referral lookup to determine sent vs received
 * Returns sorted newest first
 * 
 * @param doctorId Doctor ID to filter by
 * @param mode 'sent' for referrals sent by doctor, 'received' for referrals received
 * @returns Array of history records for the doctor's referrals
 */
export function getHistoryForDoctor(
  doctorId: string,
  mode: 'sent' | 'received'
): ReferralHistoryRecord[] {
  const allReferrals = getReferrals();
  const relevantReferralIds = new Set<string>();

  if (mode === 'sent') {
    allReferrals
      .filter((r) => r.fromDoctorId === doctorId)
      .forEach((r) => relevantReferralIds.add(r.id));
  } else {
    allReferrals
      .filter((r) => r.toDoctorId === doctorId)
      .forEach((r) => relevantReferralIds.add(r.id));
  }

  const allHistory = getReferralHistory();
  return allHistory
    .filter((h) => relevantReferralIds.has(h.referralId))
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}
