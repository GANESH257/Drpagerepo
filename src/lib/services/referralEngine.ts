/**
 * Referral Engine - Business logic for referral management
 * 
 * Handles referral creation, status changes, history, and notifications
 */

import { Referral, ReferralStatus, ReferralHistoryRecord, ReferralHistoryAction } from '@/types/referrals';
import { Actor } from './permissionService';
import {
  assertAuthenticated,
  canSendReferral,
} from './permissionService';
import { makeId, nowISO } from './id';
import {
  AuthRequiredError,
  PermissionDeniedError,
  NotFoundError,
  ValidationError,
} from './errors';
import {
  getReferrals,
  addReferral,
  updateReferral,
} from '@/lib/storage/referralStorage';
import { addReferralHistory, getHistoryForReferral } from '@/lib/storage/referralHistoryStorage';
import { addNotification } from '@/lib/storage/notificationStorage';
import { doctors } from '@/data/doctors';

/**
 * Input type for creating referrals
 */
export type CreateReferralInput = {
  toDoctorId: string;
  patient: {
    initials?: string;
    age?: number;
    sex?: 'male' | 'female' | 'other';
  };
  condition: string;
  notes?: string;
  fromDoctorId?: string; // Required if actor is admin
};

/**
 * Internal helper to append referral history record
 * Resolves actor info and creates history record with new structure
 */
function appendReferralHistoryRecord(
  referralId: string,
  action: ReferralHistoryAction,
  actor: Actor,
  metadata?: ReferralHistoryRecord['metadata']
): void {
  // Resolve actor info
  const actorId = actor.kind === 'doctor' ? actor.doctorId : 'admin';
  const actorRole = actor.kind === 'admin' 
    ? 'admin' 
    : (actor.kind === 'doctor' && actor.roleInPractice === 'practice_admin' ? 'practice_admin' : 'doctor');
  
  // Get actor name (optional, from doctor lookup)
  const actorName = actor.kind === 'doctor' 
    ? doctors.find(d => d.id === actor.doctorId)?.fullName 
    : undefined;
  
  addReferralHistory({
    id: makeId('rhr'),
    referralId,
    action,
    actor: {
      actorId,
      actorRole,
      actorName,
      practiceId: actor.kind === 'doctor' ? actor.practiceId : undefined,
    },
    timestamp: nowISO(),
    metadata,
  });
}

/**
 * Create a new referral
 */
export function createReferral(
  actor: Actor,
  input: CreateReferralInput
): Referral {
  assertAuthenticated(actor);

  if (!canSendReferral(actor)) {
    throw new PermissionDeniedError('Only doctors and admins can send referrals');
  }

  // Determine fromDoctorId
  let fromDoctorId: string;
  if (actor.kind === 'admin') {
    if (!input.fromDoctorId) {
      throw new ValidationError('fromDoctorId is required when admin creates referral', 'fromDoctorId');
    }
    fromDoctorId = input.fromDoctorId;
  } else if (actor.kind === 'doctor') {
    fromDoctorId = actor.doctorId;
  } else {
    throw new PermissionDeniedError('Only doctors and admins can send referrals');
  }

  // Validate: cannot refer to self
  if (fromDoctorId === input.toDoctorId) {
    throw new ValidationError('Cannot send referral to yourself');
  }

  // Get doctor records to extract practice IDs
  const fromDoctor = doctors.find((d) => d.id === fromDoctorId);
  const toDoctor = doctors.find((d) => d.id === input.toDoctorId);

  if (!fromDoctor) {
    throw new NotFoundError('Doctor', fromDoctorId);
  }

  if (!toDoctor) {
    throw new NotFoundError('Doctor', input.toDoctorId);
  }

  const now = nowISO();
  const referralId = makeId('ref');

  // Create referral
  const referral: Referral = {
    id: referralId,
    createdAt: now,
    updatedAt: now,
    fromDoctorId,
    toDoctorId: input.toDoctorId,
    fromPracticeId: fromDoctor.practiceId,
    toPracticeId: toDoctor.practiceId,
    patient: input.patient,
    condition: input.condition,
    notes: input.notes,
    status: 'new',
  };

  // Append history (new structure)
  appendReferralHistoryRecord(referralId, 'created', actor);

  // Notify recipient with deep link
  const conditionMessage = input.condition.length > 120 
    ? `${input.condition.substring(0, 120)}...` 
    : input.condition;
  
  addNotification(input.toDoctorId, {
    id: makeId('ntf'),
    doctorId: input.toDoctorId,
    createdAt: now,
    type: 'referral_received',
    title: 'New Referral Received',
    message: `You received a referral from ${fromDoctor.fullName} for ${conditionMessage}`,
    href: `/doctor/dashboard/referrals?tab=received&referralId=${referralId}`,
    meta: { referralId },
  });

  // Save referral
  addReferral(referral);

  return referral;
}

/**
 * Set referral status
 */
export function setReferralStatus(
  actor: Actor,
  referralId: string,
  status: ReferralStatus
): void {
  assertAuthenticated(actor);

  const referrals = getReferrals();
  const referral = referrals.find((r) => r.id === referralId);
  if (!referral) {
    throw new NotFoundError('Referral', referralId);
  }

  // Check permissions: only participants or admin can change status
  const isParticipant =
    actor.kind === 'doctor' &&
    (actor.doctorId === referral.fromDoctorId ||
      actor.doctorId === referral.toDoctorId);
  const isAdmin = actor.kind === 'admin';

  if (!isParticipant && !isAdmin) {
    throw new PermissionDeniedError(
      'Only referral participants or admin can change status'
    );
  }

  // Guard: no-op if status hasn't changed
  if (referral.status === status) {
    return;
  }

  const now = nowISO();
  const oldStatus = referral.status;

  // Update referral
  updateReferral(referralId, {
    status,
    updatedAt: now,
    ...(status === 'attended' ? { attendedAt: now } : {}),
  });

  // Append history (new structure)
  appendReferralHistoryRecord(referralId, 'status_changed', actor, {
    fromStatus: oldStatus,
    toStatus: status,
  });

  // Notify sender (fromDoctorId) about status change
  const statusLabel = status.charAt(0).toUpperCase() + status.slice(1);
  addNotification(referral.fromDoctorId, {
    id: makeId('ntf'),
    doctorId: referral.fromDoctorId,
    createdAt: now,
    type: 'referral_status_changed',
    title: 'Referral Status Updated',
    message: `Referral status changed to ${statusLabel}`,
    href: `/doctor/dashboard/referrals?tab=sent&referralId=${referralId}`,
    meta: { referralId, status },
  });
}

/**
 * Get referrals for a doctor
 */
export function getReferralsForDoctor(
  actor: Actor,
  doctorId: string
): {
  referralsSent: Referral[];
  referralsReceived: Referral[];
} {
  assertAuthenticated(actor);

  // Doctor can only request their own unless admin
  if (actor.kind === 'doctor' && actor.doctorId !== doctorId) {
    throw new PermissionDeniedError('Doctors can only view their own referrals');
  }

  const allReferrals = getReferrals();

  return {
    referralsSent: allReferrals.filter((r) => r.fromDoctorId === doctorId),
    referralsReceived: allReferrals.filter((r) => r.toDoctorId === doctorId),
  };
}

/**
 * Get referral timeline (history) for a referral
 */
export function getReferralTimeline(
  actor: Actor,
  referralId: string
): ReferralHistoryRecord[] {
  assertAuthenticated(actor);

  const referrals = getReferrals();
  const referral = referrals.find((r) => r.id === referralId);
  if (!referral) {
    throw new NotFoundError('Referral', referralId);
  }

  // Check permissions: only participants or admin can view
  const isParticipant =
    actor.kind === 'doctor' &&
    (actor.doctorId === referral.fromDoctorId ||
      actor.doctorId === referral.toDoctorId);
  const isAdmin = actor.kind === 'admin';

  if (!isParticipant && !isAdmin) {
    throw new PermissionDeniedError(
      'Only referral participants or admin can view timeline'
    );
  }

  // Get history from new storage
  const history = getHistoryForReferral(referralId);
  
  // If no history exists (legacy referral), synthesize a created record
  if (history.length === 0) {
    const fromDoctor = doctors.find(d => d.id === referral.fromDoctorId);
    const synthesizedRecord: ReferralHistoryRecord = {
      id: `synthetic-${referralId}`,
      referralId,
      action: 'created',
      actor: {
        actorId: referral.fromDoctorId,
        actorRole: 'doctor',
        actorName: fromDoctor?.fullName,
        practiceId: referral.fromPracticeId,
      },
      timestamp: referral.createdAt,
    };
    return [synthesizedRecord];
  }
  
  return history;
}
