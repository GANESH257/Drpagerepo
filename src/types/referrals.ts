/**
 * Referral status
 */
export type ReferralStatus = 'new' | 'attended' | 'removed';

/**
 * Referral - Doctor-to-doctor referral (V2)
 */
export interface Referral {
  id: string; // "ref-..."
  createdAt: string;
  updatedAt: string;

  fromDoctorId: string;
  toDoctorId: string;

  fromPracticeId?: string;
  toPracticeId?: string;

  patient: {
    initials?: string;
    age?: number;
    sex?: 'male' | 'female' | 'other';
  };

  condition: string;
  notes?: string;

  status: ReferralStatus;
}

/**
 * Referral history action types
 */
export type ReferralHistoryAction =
  | 'created'
  | 'status_changed'
  | 'note_added'
  | 'viewed'; // optional, future-proof

/**
 * Referral history record - Append-only log of referral changes (V2 Step 8)
 */
export interface ReferralHistoryRecord {
  id: string;                    // uuid
  referralId: string;
  action: ReferralHistoryAction;
  actor: {
    actorId: string;             // doctorId or adminId (for future-proof)
    actorRole: 'doctor' | 'admin' | 'practice_admin';
    actorName?: string;
    practiceId?: string;         // from actor
  };
  timestamp: string;             // ISO string
  metadata?: {
    fromStatus?: 'new'|'attended'|'removed';
    toStatus?: 'new'|'attended'|'removed';
    note?: string;               // for note_added
  };
}
