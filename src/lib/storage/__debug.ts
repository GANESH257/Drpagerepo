import { ApprovalRequest, ApprovalHistoryRecord } from '@/types/approvals';
import { Referral, ReferralHistoryRecord } from '@/types/referrals';

/**
 * Debug helpers for testing storage modules
 * These functions create dummy data for testing without UI wiring
 */

/**
 * Create a dummy approval request for testing
 */
export function createDummyApprovalRequest(): ApprovalRequest {
  const now = new Date().toISOString();
  return {
    id: `apr-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type: 'doctor_join_practice',
    status: 'submitted',
    submittedAt: now,
    updatedAt: now,
    submittedBy: {
      role: 'doctor',
      email: 'test@example.com',
      doctorId: 'doctor-test-1',
    },
    approvals: {
      admin: {
        status: 'pending',
      },
      practiceAdmin: {
        practiceId: 'practice-test-1',
        status: 'pending',
      },
    },
    target: {
      practiceId: 'practice-test-1',
      doctorId: 'doctor-test-1',
    },
    payload: {
      doctor: {
        firstName: 'Test',
        lastName: 'Doctor',
        email: 'test@example.com',
        specialty: 'Cardiology',
      },
    },
  };
}

/**
 * Create a dummy approval history record for testing
 * 
 * @param requestId Approval request ID
 */
export function createDummyApprovalHistoryRecord(requestId: string): ApprovalHistoryRecord {
  return {
    id: `ahr-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    requestId,
    type: 'doctor_join_practice',
    practiceId: 'practice-test-1',
    doctorId: 'doctor-test-1',
    action: 'submitted',
    at: new Date().toISOString(),
    by: {
      role: 'doctor',
      email: 'test@example.com',
      doctorId: 'doctor-test-1',
    },
  };
}

/**
 * Create a dummy referral for testing
 */
export function createDummyReferral(): Referral {
  const now = new Date().toISOString();
  return {
    id: `ref-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    createdAt: now,
    updatedAt: now,
    fromDoctorId: 'doctor-test-1',
    toDoctorId: 'doctor-test-2',
    fromPracticeId: 'practice-test-1',
    toPracticeId: 'practice-test-2',
    patient: {
      name: 'J. Doe',
      dob: '1979-01-15',
      sex: 'male',
    },
    condition: 'Cardiac evaluation needed',
    notes: 'Patient requires specialist consultation',
    status: 'considering',
  };
}

/**
 * Create a dummy referral history record for testing
 * 
 * @param referralId Referral ID
 */
export function createDummyReferralHistoryRecord(referralId: string): ReferralHistoryRecord {
  return {
    id: `rhr-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    referralId,
    action: 'created',
    actor: {
      actorId: 'doctor-test-1',
      actorRole: 'doctor',
      actorName: 'Test Doctor',
    },
    timestamp: new Date().toISOString(),
  };
}
