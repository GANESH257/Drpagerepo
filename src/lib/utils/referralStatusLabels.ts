import type { ReferralStatus } from '@/types/referrals';

/** Display labels for referral statuses */
export const REFERRAL_STATUS_LABELS: Record<ReferralStatus, string> = {
  considering: 'Considering',
  accepted: 'Accepted',
  no_show: 'No Show',
  cancelled: 'Cancelled',
};

/** Map API/legacy status value to ReferralStatus */
export function normalizeReferralStatus(raw: string | undefined): ReferralStatus {
  const s = (raw ?? '').toLowerCase().replace(/\s+/g, '_');
  if (s === 'accepted' || s === 'no_show' || s === 'cancelled') return s as ReferralStatus;
  if (s === 'attended') return 'accepted';
  if (s === 'removed') return 'cancelled';
  return 'considering'; // 'new' or unknown → considering
}

export function getReferralStatusLabel(status: ReferralStatus): string {
  return REFERRAL_STATUS_LABELS[status] ?? status;
}
