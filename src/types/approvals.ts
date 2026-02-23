import { PracticeLocation } from './practice';

/**
 * Approval request status
 */
export type ApprovalStatus = 'submitted' | 'under_review' | 'approved' | 'rejected';

export interface PracticeLocationAddPayload {
  practiceId: string;
  location: PracticeLocation;
}

export interface PracticeLocationEditPayload {
  practiceId: string;
  locationId: string;
  updatedLocation: PracticeLocation;
}

export interface PracticeLocationRemovePayload {
  practiceId: string;
  locationId: string;
}

export interface PracticeEditPayload {
  practiceId: string;
  before: {
    name: string;
    description?: string;
    phone?: string;
    website?: string;
    insurances?: string[];
    services?: string[];
  };
  after: {
    name: string;
    description?: string;
    phone?: string;
    website?: string;
    insurances?: string[];
    services?: string[];
  };
}

export interface DoctorJoinPracticePayload {
  practiceId: string;
  doctorId: string;
}

export interface PracticeAddDoctorPayload {
  practiceId: string;
  doctorEmail: string;
}

export interface PracticeRemoveDoctorPayload {
  practiceId: string;
  doctorId: string;
}

/**
 * Types of approval requests
 */
export type ApprovalType =
  | 'doctor_join_practice'
  | 'new_practice_with_admin_doctor'
  | 'practice_admin_profile_practice_completion'
  | 'doctor_profile_completion'
  | 'practice_edit_request'
  | 'practice_doctor_add_request'
  | 'practice_doctor_remove_request'
  | 'practice_location_change_request'
  | 'practice_insurance_services_change_request'
  | 'practice_location_add_request'
  | 'practice_location_edit_request'
  | 'practice_location_remove_request';

/**
 * Approval request - Unified entity for all approval workflows
 */
export interface ApprovalRequest {
  id: string; // "apr-..."
  type: ApprovalType;
  status: ApprovalStatus;

  submittedAt: string;
  updatedAt: string;

  submittedBy: {
    role: 'public' | 'doctor' | 'practice_admin' | 'admin';
    email?: string;
    doctorId?: string;
    practiceId?: string;
  };

  approvals: {
    admin: {
      status: 'pending' | 'approved' | 'rejected';
      decidedAt?: string;
      notes?: string;
    };
    practiceAdmin?: {
      practiceId: string;
      status: 'pending' | 'approved' | 'rejected';
      decidedAt?: string;
      notes?: string;
    };
  };

  target: {
    practiceId?: string;
    doctorId?: string;
    invitedDoctorEmail?: string;
  };

  payload: Record<string, any>;

  decision?: {
    decidedAt?: string;
    decidedBy?: string;
    reason?: string;
    notes?: string;
  };
}

/**
 * Approval history record - Append-only log of approval actions
 */
export interface ApprovalHistoryRecord {
  id: string; // "ahr-..."
  requestId: string;
  type: ApprovalType;

  practiceId?: string;
  doctorId?: string;

  action:
    | 'submitted'
    | 'under_review'
    | 'admin_approved'
    | 'admin_rejected'
    | 'practice_admin_approved'
    | 'practice_admin_rejected'
    | 'final_approved'
    | 'final_rejected';

  at: string;
  by: {
    role: 'admin' | 'practice_admin' | 'doctor' | 'public';
    email?: string;
    doctorId?: string;
    practiceId?: string;
  };

  reason?: string;
  notes?: string;
  snapshot?: Record<string, any>;
}
