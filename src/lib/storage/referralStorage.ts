import { Referral, ReferralHistoryRecord } from '@/types/referrals';
import { LS_KEYS } from './keys';
import { readJSON, writeJSON, appendToArray, updateArrayItemById } from './localStorage';

/**
 * Get all referrals from localStorage
 */
export function getReferrals(): Referral[] {
  return readJSON<Referral[]>(LS_KEYS.REFERRALS, []);
}

/**
 * Save all referrals to localStorage
 * 
 * @param refs Array of referrals
 */
export function saveReferrals(refs: Referral[]): void {
  writeJSON(LS_KEYS.REFERRALS, refs);
}

/**
 * Add new referral
 * Prepends to array (newest first)
 * 
 * @param ref Referral to add
 */
export function addReferral(ref: Referral): void {
  const existing = getReferrals();
  const updated = [ref, ...existing];
  saveReferrals(updated);
}

/**
 * Update referral by ID
 * 
 * @param id Referral ID
 * @param patch Partial update to apply
 */
export function updateReferral(id: string, patch: Partial<Referral>): void {
  updateArrayItemById<Referral>(LS_KEYS.REFERRALS, id, {
    ...patch,
    updatedAt: new Date().toISOString(),
  });
}

/**
 * Get referral history records
 * Returns append-only log of all referral changes
 */
export function getReferralHistory(): ReferralHistoryRecord[] {
  return readJSON<ReferralHistoryRecord[]>(LS_KEYS.REFERRAL_HISTORY, []);
}

/**
 * Append referral history record
 * Append-only log, capped at 1000 items (keeps latest)
 * 
 * @param record History record to append
 */
export function appendReferralHistory(record: ReferralHistoryRecord): void {
  appendToArray<ReferralHistoryRecord>(
    LS_KEYS.REFERRAL_HISTORY,
    record,
    1000 // Cap at 1000 items
  );
}
