/**
 * Approval Engine - Main business logic for approval workflows
 * 
 * Handles approval request submission, decisions, side effects, and notifications
 */

import {
  ApprovalRequest,
  ApprovalType,
  ApprovalHistoryRecord,
  PracticeLocationAddPayload,
  PracticeLocationEditPayload,
  PracticeLocationRemovePayload,
  PracticeEditPayload,
  DoctorJoinPracticePayload,
  PracticeAddDoctorPayload,
  PracticeRemoveDoctorPayload,
} from '@/types/approvals';
import { Practice, PracticeOverride } from '@/types/practice';
import { Doctor } from '@/types';
import { Actor } from './permissionService';
import {
  assertAdmin,
  assertPracticeAdmin,
  assertAuthenticated,
} from './permissionService';
import { makeId, nowISO } from './id';
import {
  AuthRequiredError,
  PermissionDeniedError,
  NotFoundError,
  ValidationError,
  ConflictError,
} from './errors';
import {
  getApprovalRequests,
  addApprovalRequest,
  updateApprovalRequest,
  appendApprovalHistory,
  getApprovalHistory,
} from '@/lib/storage/approvalStorage';
import {
  savePracticeOverride,
  addCreatedPractice,
} from '@/lib/storage/practiceStorage';
import { saveDoctorOverride } from '@/lib/memberStorage';
import { addNotification } from '@/lib/storage/notificationStorage';
import { doctors } from '@/data/doctors';
import { practices } from '@/data/practices';
import { getCreatedPractices } from '@/lib/storage/practiceStorage';
import { slugify } from '@/lib/slugify';
import { getPracticeById } from '@/lib/services/practiceDirectoryService';

/**
 * Input type for submitting approval requests
 */
export type SubmitApprovalInput = {
  type: ApprovalType;
  payload: Record<string, any>;
  target?: {
    practiceId?: string;
    doctorId?: string;
    invitedDoctorEmail?: string;
  };
};

/**
 * Check if approval type requires practice admin approval
 */
function requiresPracticeAdminApproval(type: ApprovalType): boolean {
  return [
    'doctor_join_practice',
    'practice_doctor_add_request',
    'practice_doctor_remove_request',
    'practice_edit_request',
    'practice_location_change_request',
    'practice_insurance_services_change_request',
    'practice_location_add_request',
    'practice_location_edit_request',
    'practice_location_remove_request',
  ].includes(type);
}

/**
 * Find practice admin doctor for a practice
 * 
 * Deterministic: Returns the practice admin with the lowest lexical doctor ID
 * (matches Step 3 assignment logic). If multiple practice admins exist (edge case),
 * consistently returns the same one.
 */
function findPracticeAdminDoctor(practiceId: string): Doctor | null {
  const practiceAdmins = doctors.filter(
    (d) =>
      d.practiceId === practiceId &&
      d.roleInPractice === 'practice_admin'
  );

  if (practiceAdmins.length === 0) {
    return null;
  }

  // Deterministic: Sort by ID and return first (lowest lexical ID)
  // This matches Step 3's practice admin assignment logic
  practiceAdmins.sort((a, b) => a.id.localeCompare(b.id));
  return practiceAdmins[0];
}

/**
 * Notify admin about new approval request (stub)
 * 
 * NOTE: This is a stub for Step 4. In Step 5, admin UI can directly
 * read pending approvals via getPendingApprovalsForAdmin(), so admin
 * notifications may not be needed.
 */
function notifyAdmins(request: ApprovalRequest): string[] {
  // Stub: Returns list of admin emails/IDs
  // In Step 5: Admin UI will use getPendingApprovalsForAdmin() directly
  return ['admin@aip.com'];
}

/**
 * Notify practice admin about approval request
 */
function notifyPracticeAdmin(
  practiceId: string,
  request: ApprovalRequest
): void {
  const practiceAdmin = findPracticeAdminDoctor(practiceId);
  if (!practiceAdmin || !practiceAdmin.id) {
    throw new NotFoundError(
      `No practice admin configured for practiceId=${practiceId}. Cannot route approval request.`
    );
  }

  addNotification(practiceAdmin.id, {
    id: makeId('ntf'),
    doctorId: practiceAdmin.id,
    createdAt: nowISO(),
    type: 'approval_update',
    title: 'New Approval Request',
    message: `New ${request.type} request requires your approval`,
    href: `/doctor/dashboard/practice/approvals`,
    meta: { requestId: request.id },
  });
}

/**
 * Notify submitter about approval status change
 */
function notifySubmitter(
  request: ApprovalRequest,
  message: string,
  href?: string
): void {
  if (!request.submittedBy.doctorId) return;

  addNotification(request.submittedBy.doctorId, {
    id: makeId('ntf'),
    doctorId: request.submittedBy.doctorId,
    createdAt: nowISO(),
    type: 'approval_update',
    title: 'Approval Request Update',
    message,
    href,
    meta: { requestId: request.id },
  });
}

/**
 * Validate roster approval request payload (strict normalization)
 */
function validateRosterPayload(
  type: ApprovalType,
  payload: Record<string, any>,
  target?: Record<string, any>
): void {
  const practiceId = payload.practiceId || target?.practiceId;
  const doctorId = payload.doctorId || target?.doctorId;

  switch (type) {
    case 'doctor_join_practice': {
      if (!practiceId || typeof practiceId !== 'string') {
        throw new ValidationError('practiceId is required');
      }
      if (!doctorId || typeof doctorId !== 'string') {
        throw new ValidationError('doctorId is required');
      }
      break;
    }
    case 'practice_doctor_add_request': {
      if (!practiceId || typeof practiceId !== 'string') {
        throw new ValidationError('practiceId is required');
      }
      const email = payload.email || payload.doctorEmail || target?.invitedDoctorEmail;
      if (!email || typeof email !== 'string') {
        throw new ValidationError('Doctor email is required');
      }
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new ValidationError('Valid email is required');
      }
      break;
    }
    case 'practice_doctor_remove_request': {
      if (!practiceId || typeof practiceId !== 'string') {
        throw new ValidationError('practiceId is required');
      }
      if (!doctorId || typeof doctorId !== 'string') {
        throw new ValidationError('doctorId is required');
      }
      break;
    }
  }
}

/**
 * Validate location approval request payload
 */
function validateLocationApprovalRequest(
  type: ApprovalType,
  payload: Record<string, any>,
  target?: { practiceId?: string }
): void {
  const practiceId = target?.practiceId || payload.practiceId;

  if (!practiceId) {
    throw new ValidationError('practiceId is required for location approval requests');
  }

  const practice = getPracticeById(practiceId);
  if (!practice) {
    throw new ValidationError(`Practice with ID ${practiceId} not found`);
  }

  switch (type) {
    case 'practice_location_add_request': {
      const addPayload = payload as PracticeLocationAddPayload;

      if (!addPayload.location || !addPayload.location.id) {
        throw new ValidationError('location and location.id are required for location add request');
      }

      // Check if location.id already exists
      if (practice.locations.some(loc => loc.id === addPayload.location.id)) {
        throw new ValidationError(
          `Location with ID "${addPayload.location.id}" already exists in this practice`
        );
      }

      break;
    }

    case 'practice_location_edit_request': {
      const editPayload = payload as PracticeLocationEditPayload;

      if (!editPayload.locationId) {
        throw new ValidationError('locationId is required for location edit request');
      }

      if (!editPayload.updatedLocation) {
        throw new ValidationError('updatedLocation is required for location edit request');
      }

      // Check if locationId exists
      if (!practice.locations.some(loc => loc.id === editPayload.locationId)) {
        throw new ValidationError(
          `Location with ID "${editPayload.locationId}" not found in this practice`
        );
      }

      break;
    }

    case 'practice_location_remove_request': {
      const removePayload = payload as PracticeLocationRemovePayload;

      if (!removePayload.locationId) {
        throw new ValidationError('locationId is required for location remove request');
      }

      // Check if locationId exists
      if (!practice.locations.some(loc => loc.id === removePayload.locationId)) {
        throw new ValidationError(
          `Location with ID "${removePayload.locationId}" not found in this practice`
        );
      }

      // Check if it's the last location
      if (practice.locations.length <= 1) {
        throw new ValidationError(
          'Cannot remove the last remaining location. Practice must retain at least one location.'
        );
      }

      break;
    }
  }
}

/**
 * Submit approval request
 */
export function submitApprovalRequest(
  actor: Actor,
  input: SubmitApprovalInput
): ApprovalRequest {
  if (input.type !== 'new_practice_with_admin_doctor' && input.type !== 'doctor_join_practice') {
    assertAuthenticated(actor);
  }

  // Validate location approval requests before creating
  if (
    input.type === 'practice_location_add_request' ||
    input.type === 'practice_location_edit_request' ||
    input.type === 'practice_location_remove_request'
  ) {
    validateLocationApprovalRequest(input.type, input.payload, input.target);
  }

  // Validate roster approval requests before creating (strict normalization)
  if (
    input.type === 'doctor_join_practice' ||
    input.type === 'practice_doctor_add_request' ||
    input.type === 'practice_doctor_remove_request'
  ) {
    validateRosterPayload(input.type, input.payload, input.target);
  }

  const now = nowISO();
  const requestId = makeId('apr');

  // Build submittedBy from actor
  const submittedBy: ApprovalRequest['submittedBy'] = {
    role:
      actor.kind === 'admin'
        ? 'admin'
        : actor.kind === 'doctor'
          ? actor.roleInPractice === 'practice_admin'
            ? 'practice_admin'
            : 'doctor'
          : 'public',
    email:
      actor.kind === 'admin'
        ? actor.email
        : actor.kind === 'doctor'
          ? actor.email
          : actor.email, // Capture email for public actor if available
    doctorId: actor.kind === 'doctor' ? actor.doctorId : undefined,
    practiceId: actor.kind === 'doctor' ? actor.practiceId : undefined,
  };

  // Determine if practice admin approval is required
  const needsPracticeAdmin = requiresPracticeAdminApproval(input.type);

  // Build approvals object
  // Extract practiceId from target or payload (for location requests)
  const practiceIdForApproval = input.target?.practiceId || (input.payload as any)?.practiceId;
  const approvals: ApprovalRequest['approvals'] = {
    admin: {
      status: 'pending',
    },
    ...(needsPracticeAdmin && practiceIdForApproval
      ? {
        practiceAdmin: {
          practiceId: practiceIdForApproval,
          status:
            submittedBy.role === 'practice_admin' &&
              submittedBy.practiceId === practiceIdForApproval
              ? 'approved'
              : 'pending',
          ...(submittedBy.role === 'practice_admin' &&
            submittedBy.practiceId === practiceIdForApproval
            ? { decidedAt: now }
            : {}),
        },
      }
      : {}),
  };

  // Create request
  const request: ApprovalRequest = {
    id: requestId,
    type: input.type,
    status: 'submitted',
    submittedAt: now,
    updatedAt: now,
    submittedBy,
    approvals,
    target: input.target || {},
    payload: input.payload,
  };

  // Append history record
  const historyBy: ApprovalHistoryRecord['by'] = {
    role: submittedBy.role,
    email: submittedBy.email,
    doctorId: submittedBy.doctorId,
    practiceId: submittedBy.practiceId,
  };

  // Extract practiceId from target or payload (for location requests)
  const practiceId = input.target?.practiceId || (input.payload as any)?.practiceId;

  // Deep clone snapshot for immutable audit integrity (Engine Guard Requirement 3)
  const snapshotClone = (() => {
    try {
      // Use structuredClone if available (modern browsers)
      if (typeof structuredClone !== 'undefined') {
        return structuredClone(request);
      } else {
        // Fallback to JSON parse/stringify
        return JSON.parse(JSON.stringify(request));
      }
    } catch (e) {
      // Final fallback (should not happen, but ensures no crash)
      return { ...request };
    }
  })();

  appendApprovalHistory({
    id: makeId('ahr'),
    requestId,
    type: input.type,
    practiceId,
    doctorId: input.target?.doctorId,
    action: 'submitted',
    at: now,
    by: historyBy,
    snapshot: snapshotClone,
  });

  // If auto-approved by practice admin, append history
  if (
    approvals.practiceAdmin?.status === 'approved' &&
    submittedBy.role === 'practice_admin' &&
    submittedBy.practiceId === practiceIdForApproval
  ) {
    appendApprovalHistory({
      id: makeId('ahr'),
      requestId,
      type: input.type,
      practiceId: practiceIdForApproval,
      doctorId: submittedBy.doctorId,
      action: 'practice_admin_approved',
      at: now,
      by: historyBy,
      notes: 'Auto-approved by submitting practice admin',
    });
  }

  // Notify admin (stub - returns recipients for UI)
  notifyAdmins(request);

  // Notify practice admin if required
  // Use practiceId from target or payload (for location requests)
  const practiceIdForNotification = input.target?.practiceId || (input.payload as any)?.practiceId;
  if (needsPracticeAdmin && practiceIdForNotification) {
    notifyPracticeAdmin(practiceIdForNotification, request);
  }

  // Save request
  addApprovalRequest(request);

  return request;
}

/**
 * Mark request as under review (admin only)
 */
export function markUnderReview(
  actor: Actor,
  requestId: string,
  notes?: string
): void {
  assertAdmin(actor);

  const requests = getApprovalRequests();
  const request = requests.find((r) => r.id === requestId);
  if (!request) {
    throw new NotFoundError('ApprovalRequest', requestId);
  }

  if (request.status !== 'submitted') {
    throw new ValidationError('Request must be in submitted status');
  }

  const now = nowISO();

  // Update request
  updateApprovalRequest(requestId, {
    status: 'under_review',
    updatedAt: now,
    approvals: {
      ...request.approvals,
      admin: {
        ...request.approvals.admin,
        notes: notes || request.approvals.admin.notes,
      },
    },
  });

  // Append history
  appendApprovalHistory({
    id: makeId('ahr'),
    requestId,
    type: request.type,
    practiceId: request.target?.practiceId,
    doctorId: request.target?.doctorId,
    action: 'under_review',
    at: now,
    by: {
      role: 'admin',
      email: actor.kind === 'admin' ? actor.email : undefined,
    },
    notes,
  });

  // Notify practice admin if exists
  if (request.approvals.practiceAdmin?.practiceId) {
    notifyPracticeAdmin(request.approvals.practiceAdmin.practiceId, {
      ...request,
      status: 'under_review',
    });
  }

  // Notify submitter
  notifySubmitter(
    { ...request, status: 'under_review' },
    'Your approval request is now under review',
    `/join-us/submitted`
  );
}

/**
 * Admin decision on approval request
 */
export function decideAsAdmin(
  actor: Actor,
  requestId: string,
  decision: 'approve' | 'reject',
  opts?: { reason?: string; notes?: string }
): void {
  assertAdmin(actor);

  const requests = getApprovalRequests();
  const request = requests.find((r) => r.id === requestId);
  if (!request) {
    throw new NotFoundError('ApprovalRequest', requestId);
  }

  const now = nowISO();
  const needsPracticeAdmin = requiresPracticeAdminApproval(request.type);

  // Authority checks for roster requests (before approval)
  if (
    decision === 'approve' &&
    (request.type === 'doctor_join_practice' ||
      request.type === 'practice_doctor_add_request' ||
      request.type === 'practice_doctor_remove_request')
  ) {
    const practiceId = request.target?.practiceId || (request.payload as any)?.practiceId;
    if (!practiceId) {
      throw new ValidationError('Missing practiceId in roster request');
    }

    const practice = getPracticeById(practiceId);
    if (!practice) {
      throw new NotFoundError('Practice', practiceId);
    }

    if (request.type === 'doctor_join_practice') {
      const payload = request.payload as DoctorJoinPracticePayload;
      const doctorId = payload.doctorId || request.target?.doctorId;
      if (!doctorId) {
        throw new ValidationError('Missing doctorId in doctor_join_practice');
      }
      const doctor = doctors.find(d => d.id === doctorId);
      if (!doctor) {
        throw new NotFoundError('Doctor', doctorId);
      }
      if (doctor.practiceId && doctor.practiceId !== practiceId) {
        throw new ConflictError(`Doctor ${doctorId} already belongs to practice ${doctor.practiceId}`);
      }
    }

    if (request.type === 'practice_doctor_add_request') {
      const payload = request.payload as PracticeAddDoctorPayload;
      const doctor = doctors.find(d => d.email === payload.doctorEmail);
      if (!doctor) {
        throw new NotFoundError('Doctor', `email: ${payload.doctorEmail}`);
      }
      if (doctor.practiceId) {
        throw new ConflictError(`Doctor ${doctor.id} already belongs to practice ${doctor.practiceId}`);
      }
    }

    if (request.type === 'practice_doctor_remove_request') {
      const payload = request.payload as PracticeRemoveDoctorPayload;
      const doctor = doctors.find(d => d.id === payload.doctorId);
      if (!doctor) {
        throw new NotFoundError('Doctor', payload.doctorId);
      }
      if (doctor.practiceId !== practiceId) {
        throw new ConflictError(`Doctor ${payload.doctorId} does not belong to practice ${practiceId}`);
      }
      if (!practice.doctorIds.includes(payload.doctorId)) {
        throw new ConflictError(`Doctor ${payload.doctorId} not found in practice roster`);
      }
    }
  }

  if (decision === 'reject') {
    // Reject: finalize immediately
    updateApprovalRequest(requestId, {
      status: 'rejected',
      updatedAt: now,
      approvals: {
        ...request.approvals,
        admin: {
          status: 'rejected',
          decidedAt: now,
          notes: opts?.notes,
        },
      },
      decision: {
        decidedAt: now,
        decidedBy: 'admin',
        reason: opts?.reason,
        notes: opts?.notes,
      },
    });

    // Append history
    appendApprovalHistory({
      id: makeId('ahr'),
      requestId,
      type: request.type,
      practiceId: request.target?.practiceId,
      doctorId: request.target?.doctorId,
      action: 'admin_rejected',
      at: now,
      by: {
        role: 'admin',
        email: actor.kind === 'admin' ? actor.email : undefined,
      },
      reason: opts?.reason,
      notes: opts?.notes,
    });

    appendApprovalHistory({
      id: makeId('ahr'),
      requestId,
      type: request.type,
      practiceId: request.target?.practiceId,
      doctorId: request.target?.doctorId,
      action: 'final_rejected',
      at: now,
      by: {
        role: 'admin',
        email: actor.kind === 'admin' ? actor.email : undefined,
      },
      reason: opts?.reason,
    });

    // Notify submitter and practice admin
    notifySubmitter(
      { ...request, status: 'rejected' },
      `Your approval request was rejected: ${opts?.reason || 'No reason provided'}`,
      `/join-us/submitted`
    );

    if (request.approvals.practiceAdmin?.practiceId) {
      notifyPracticeAdmin(request.approvals.practiceAdmin.practiceId, {
        ...request,
        status: 'rejected',
      });
    }
  } else {
    // Approve
    updateApprovalRequest(requestId, {
      updatedAt: now,
      approvals: {
        ...request.approvals,
        admin: {
          status: 'approved',
          decidedAt: now,
          notes: opts?.notes,
        },
      },
    });

    // Append history
    appendApprovalHistory({
      id: makeId('ahr'),
      requestId,
      type: request.type,
      practiceId: request.target?.practiceId,
      doctorId: request.target?.doctorId,
      action: 'admin_approved',
      at: now,
      by: {
        role: 'admin',
        email: actor.kind === 'admin' ? actor.email : undefined,
      },
      notes: opts?.notes,
    });

    // Check if practice admin approval is still needed
    if (
      needsPracticeAdmin &&
      request.approvals.practiceAdmin?.status === 'pending'
    ) {
      // Keep status as under_review, wait for practice admin
      updateApprovalRequest(requestId, {
        status: 'under_review',
      });

      // Notify practice admin again
      if (request.approvals.practiceAdmin?.practiceId) {
        notifyPracticeAdmin(
          request.approvals.practiceAdmin.practiceId,
          { ...request, approvals: { ...request.approvals, admin: { status: 'approved', decidedAt: now } } }
        );
      }
    } else {
      // No practice admin needed or already approved: finalize
      updateApprovalRequest(requestId, {
        status: 'approved',
        decision: {
          decidedAt: now,
          decidedBy: 'admin',
          notes: opts?.notes,
        },
      });

      // Append final approved history
      appendApprovalHistory({
        id: makeId('ahr'),
        requestId,
        type: request.type,
        practiceId: request.target?.practiceId,
        doctorId: request.target?.doctorId,
        action: 'final_approved',
        at: now,
        by: {
          role: 'admin',
          email: actor.kind === 'admin' ? actor.email : undefined,
        },
        notes: opts?.notes,
      });

      // Apply side effects
      const updatedRequest = getApprovalRequests().find((r) => r.id === requestId);
      if (updatedRequest) {
        applyApprovedRequestSideEffects(updatedRequest);
      }

      // Notify submitter
      notifySubmitter(
        { ...request, status: 'approved' },
        'Your approval request was approved',
        `/join-us/submitted`
      );
    }
  }
}

/**
 * Practice admin decision on approval request
 */
export function decideAsPracticeAdmin(
  actor: Actor,
  requestId: string,
  decision: 'approve' | 'reject',
  opts?: { reason?: string; notes?: string }
): void {
  assertPracticeAdmin(actor);

  const requests = getApprovalRequests();
  const request = requests.find((r) => r.id === requestId);
  if (!request) {
    throw new NotFoundError('ApprovalRequest', requestId);
  }

  // Verify practice admin can approve this request
  if (actor.kind !== 'doctor') {
    throw new PermissionDeniedError('Expected doctor actor');
  }

  const requestPracticeId = request.approvals.practiceAdmin?.practiceId;
  if (!requestPracticeId || requestPracticeId !== actor.practiceId) {
    throw new PermissionDeniedError(
      'Practice admin can only approve requests for their own practice'
    );
  }

  // Block doctor self-approval
  if (request.type === 'doctor_join_practice' && request.target?.doctorId === actor.doctorId) {
    throw new PermissionDeniedError('Doctor cannot self-approve join request');
  }

  const now = nowISO();

  if (decision === 'reject') {
    // Reject: finalize immediately
    updateApprovalRequest(requestId, {
      status: 'rejected',
      updatedAt: now,
      approvals: {
        ...request.approvals,
        practiceAdmin: {
          ...request.approvals.practiceAdmin!,
          status: 'rejected',
          decidedAt: now,
          notes: opts?.notes,
        },
      },
      decision: {
        decidedAt: now,
        decidedBy: 'practice_admin',
        reason: opts?.reason,
        notes: opts?.notes,
      },
    });

    // Append history
    if (actor.kind !== 'doctor') {
      throw new PermissionDeniedError('Expected doctor actor');
    }

    appendApprovalHistory({
      id: makeId('ahr'),
      requestId,
      type: request.type,
      practiceId: requestPracticeId,
      doctorId: request.target?.doctorId,
      action: 'practice_admin_rejected',
      at: now,
      by: {
        role: 'practice_admin',
        doctorId: actor.doctorId,
        practiceId: actor.practiceId,
        email: actor.email,
      },
      reason: opts?.reason,
      notes: opts?.notes,
    });

    appendApprovalHistory({
      id: makeId('ahr'),
      requestId,
      type: request.type,
      practiceId: requestPracticeId,
      doctorId: request.target?.doctorId,
      action: 'final_rejected',
      at: now,
      by: {
        role: 'practice_admin',
        doctorId: actor.doctorId,
        practiceId: actor.practiceId,
        email: actor.email,
      },
      reason: opts?.reason,
    });

    // Notify admin and submitter
    notifySubmitter(
      { ...request, status: 'rejected' },
      `Your approval request was rejected by practice admin: ${opts?.reason || 'No reason provided'}`,
      `/join-us/submitted`
    );
  } else {
    // Approve
    updateApprovalRequest(requestId, {
      updatedAt: now,
      approvals: {
        ...request.approvals,
        practiceAdmin: {
          ...request.approvals.practiceAdmin!,
          status: 'approved',
          decidedAt: now,
          notes: opts?.notes,
        },
      },
    });

    // Append history
    if (actor.kind !== 'doctor') {
      throw new PermissionDeniedError('Expected doctor actor');
    }

    appendApprovalHistory({
      id: makeId('ahr'),
      requestId,
      type: request.type,
      practiceId: requestPracticeId,
      doctorId: request.target?.doctorId,
      action: 'practice_admin_approved',
      at: now,
      by: {
        role: 'practice_admin',
        doctorId: actor.doctorId,
        practiceId: actor.practiceId,
        email: actor.email,
      },
      notes: opts?.notes,
    });

    // Check if admin already approved
    if (request.approvals.admin.status === 'approved') {
      // Both approved: finalize
      updateApprovalRequest(requestId, {
        status: 'approved',
        decision: {
          decidedAt: now,
          decidedBy: 'practice_admin',
          notes: opts?.notes,
        },
      });

      // Append final approved history
      if (actor.kind !== 'doctor') {
        throw new PermissionDeniedError('Expected doctor actor');
      }

      appendApprovalHistory({
        id: makeId('ahr'),
        requestId,
        type: request.type,
        practiceId: requestPracticeId,
        doctorId: request.target?.doctorId,
        action: 'final_approved',
        at: now,
        by: {
          role: 'practice_admin',
          doctorId: actor.doctorId,
          practiceId: actor.practiceId,
          email: actor.email,
        },
        notes: opts?.notes,
      });

      // Apply side effects
      const updatedRequest = getApprovalRequests().find((r) => r.id === requestId);
      if (updatedRequest) {
        applyApprovedRequestSideEffects(updatedRequest);
      }

      // Notify admin and submitter
      notifySubmitter(
        { ...request, status: 'approved' },
        'Your approval request was approved',
        `/join-us/submitted`
      );
    } else {
      // Keep pending admin, notify admin
      // Admin will be notified via their pending queue
    }
  }
}

/**
 * Apply side effects when request is approved
 */
export function applyApprovedRequestSideEffects(
  request: ApprovalRequest
): void {
  const now = nowISO();

  switch (request.type) {
    case 'new_practice_with_admin_doctor': {
      // Create new practice
      const practiceData = request.payload.practice as Partial<Practice>;
      const doctorData = request.payload.doctor as Partial<Doctor>;

      if (!practiceData || !doctorData) {
        console.error('Missing practice or doctor data in payload');
        return;
      }

      const practiceId = makeId('practice');
      const practiceSlug = practiceData.name
        ? slugify(practiceData.name)
        : `practice-${Date.now()}`;

      // Migrate old location field to locations array if needed
      let locations = practiceData.locations;
      if (!locations || locations.length === 0) {
        // If old location field exists (backward compatibility), migrate it
        const practiceDataAny = practiceData as any;
        if (practiceDataAny.location && practiceDataAny.location.lat && practiceDataAny.location.lng) {
          locations = [
            {
              id: `loc_${practiceId}`,
              name: 'Main Office',
              address: practiceData.address?.line1 || '',
              city: practiceData.address?.city || '',
              state: practiceData.address?.state || '',
              zip: practiceData.address?.zip || '',
              lat: practiceDataAny.location.lat,
              lng: practiceDataAny.location.lng,
            },
          ];
        } else {
          // Default empty location (will be excluded from distance features)
          locations = [];
        }
      }

      const newPractice: Practice = {
        id: practiceId,
        slug: practiceSlug,
        name: practiceData.name || 'New Practice',
        description: practiceData.description || '',
        phone: practiceData.phone || '',
        email: practiceData.email,
        website: practiceData.website,
        address: practiceData.address || {
          line1: '',
          city: '',
          state: '',
          zip: '',
          country: 'USA',
        },
        locations: locations,
        specialties: practiceData.specialties || [],
        doctorIds: [],
        services: practiceData.services,
        insurance: practiceData.insurance,
        createdAt: now,
        updatedAt: now,
      };

      // Save created practice
      addCreatedPractice(newPractice);

      // Create doctor override
      const doctorId = doctorData.id || makeId('doctor');
      saveDoctorOverride(doctorId, {
        ...doctorData,
        practiceId,
        roleInPractice: 'practice_admin',
        verified: true,
      });

      // Add doctor to practice
      newPractice.doctorIds.push(doctorId);
      savePracticeOverride(practiceId, {
        doctorIds: newPractice.doctorIds,
      });

      break;
    }

    case 'doctor_join_practice': {
      const payload = request.payload as DoctorJoinPracticePayload;
      const practiceId = payload.practiceId || request.target?.practiceId;
      const doctorId = payload.doctorId || request.target?.doctorId;

      if (!practiceId || !doctorId) {
        throw new ValidationError('Missing practiceId or doctorId');
      }

      // Get entities
      const practice = getPracticeById(practiceId);
      const doctor = doctors.find(d => d.id === doctorId);

      if (!practice) {
        throw new NotFoundError('Practice', practiceId);
      }
      if (!doctor) {
        throw new NotFoundError('Doctor', doctorId);
      }

      // Idempotency check
      if (practice.doctorIds.includes(doctorId)) {
        // Already added, skip mutation
        return;
      }

      // Deep clone before snapshots
      const beforePractice = (() => {
        try {
          if (typeof structuredClone !== 'undefined') {
            return structuredClone(practice);
          } else {
            return JSON.parse(JSON.stringify(practice));
          }
        } catch {
          return { ...practice };
        }
      })();

      const beforeDoctor = (() => {
        try {
          if (typeof structuredClone !== 'undefined') {
            return structuredClone(doctor);
          } else {
            return JSON.parse(JSON.stringify(doctor));
          }
        } catch {
          return { ...doctor };
        }
      })();

      // Two-sided mutation
      const updatedDoctorIds = [...practice.doctorIds, doctorId];
      savePracticeOverride(practiceId, {
        doctorIds: updatedDoctorIds,
        specialties: [
          ...new Set([
            ...(practice.specialties || []),
            ...(doctor.specialties || [doctor.specialty || '']),
          ]),
        ],
        updatedAt: now,
      });

      // Handle old practice removal
      const oldPracticeId = doctor.practiceId;
      if (oldPracticeId && oldPracticeId !== practiceId) {
        const oldPractice = getPracticeById(oldPracticeId);
        if (oldPractice) {
          const updatedOldDoctorIds = oldPractice.doctorIds.filter(id => id !== doctorId);
          savePracticeOverride(oldPracticeId, {
            doctorIds: updatedOldDoctorIds,
            updatedAt: now,
          });
        }
      }

      saveDoctorOverride(doctorId, {
        practiceId: practiceId,
        roleInPractice: 'doctor',
      });

      // Store snapshot in history
      const afterPractice = getPracticeById(practiceId);
      const afterDoctor = doctors.find(d => d.id === doctorId);

      if (afterPractice && afterDoctor) {
        appendApprovalHistory({
          id: makeId('ahr'),
          requestId: request.id,
          type: request.type,
          practiceId: practiceId,
          doctorId: doctorId,
          action: 'final_approved',
          at: now,
          by: {
            role: 'admin', // System action logged as admin
          },
          snapshot: {
            before: {
              practice: beforePractice,
              doctor: beforeDoctor,
            },
            after: {
              practice: afterPractice,
              doctor: afterDoctor,
            },
          },
        });
      }

      break;
    }

    case 'practice_edit_request': {
      const payload = request.payload as PracticeEditPayload;
      const practiceId = payload.practiceId || request.target?.practiceId;

      if (!practiceId) {
        console.error('Missing practiceId in practice_edit_request');
        return;
      }

      // Apply payload.after deterministically (full authoritative snapshot)
      // Create new object from payload.after - not a merge, not a patch, not a diff
      const updatedPractice: PracticeOverride = {
        name: payload.after.name,
        description: payload.after.description,
        phone: payload.after.phone,
        website: payload.after.website,
        services: payload.after.services,
        // Convert insurances array to insurance objects if needed
        insurance: payload.after.insurances?.map(name => ({
          name,
          slug: slugify(name)
        })) || [],
        updatedAt: now,
      };

      savePracticeOverride(practiceId, updatedPractice);
      break;
    }

    case 'practice_location_change_request': {
      const practiceId = request.target?.practiceId;
      if (!practiceId) {
        console.error('Missing practiceId in target');
        return;
      }

      const locations = request.payload.locations;
      if (!locations) {
        console.error('Missing locations in payload');
        return;
      }

      savePracticeOverride(practiceId, {
        locations,
        updatedAt: now,
      });

      break;
    }

    case 'practice_insurance_services_change_request': {
      const practiceId = request.target?.practiceId;
      if (!practiceId) {
        console.error('Missing practiceId in target');
        return;
      }

      const patch: Partial<Practice> = {
        updatedAt: now,
      };

      if (request.payload.insurance !== undefined) {
        patch.insurance = request.payload.insurance;
      }

      if (request.payload.services !== undefined) {
        patch.services = request.payload.services;
      }

      savePracticeOverride(practiceId, patch);

      break;
    }

    case 'practice_location_add_request': {
      const payload = request.payload as PracticeLocationAddPayload;
      const practiceId = payload.practiceId || request.target?.practiceId;

      if (!practiceId) {
        console.error('Missing practiceId');
        return;
      }

      if (!payload.location || !payload.location.id) {
        console.error('Missing location or location.id');
        return;
      }

      // Get current practice
      const allPractices = [...practices, ...getCreatedPractices()];
      const practice = allPractices.find(p => p.id === practiceId);
      if (!practice) {
        console.error('Practice not found');
        return;
      }

      // Guard: Reject if location.id already exists
      if (practice.locations.some(loc => loc.id === payload.location.id)) {
        console.error(`Location ${payload.location.id} already exists`);
        return;
      }

      // Append location
      const updatedLocations = [...practice.locations, payload.location];
      savePracticeOverride(practiceId, {
        locations: updatedLocations,
        updatedAt: now,
      });

      break;
    }

    case 'practice_location_edit_request': {
      const payload = request.payload as PracticeLocationEditPayload;
      const practiceId = payload.practiceId || request.target?.practiceId;

      if (!practiceId) {
        console.error('Missing practiceId');
        return;
      }

      if (!payload.locationId || !payload.updatedLocation) {
        console.error('Missing locationId or updatedLocation');
        return;
      }

      // Get current practice
      const allPractices = [...practices, ...getCreatedPractices()];
      const practice = allPractices.find(p => p.id === practiceId);
      if (!practice) {
        console.error('Practice not found');
        return;
      }

      // Guard: Reject if locationId not found
      const locationIndex = practice.locations.findIndex(loc => loc.id === payload.locationId);
      if (locationIndex === -1) {
        console.error(`Location ${payload.locationId} not found`);
        return;
      }

      // Replace location (preserve array order)
      const updatedLocations = [...practice.locations];
      updatedLocations[locationIndex] = payload.updatedLocation;

      savePracticeOverride(practiceId, {
        locations: updatedLocations,
        updatedAt: now,
      });

      break;
    }

    case 'practice_location_remove_request': {
      const payload = request.payload as PracticeLocationRemovePayload;
      const practiceId = payload.practiceId || request.target?.practiceId;

      if (!practiceId) {
        console.error('Missing practiceId');
        return;
      }

      if (!payload.locationId) {
        console.error('Missing locationId');
        return;
      }

      // Get current practice
      const allPractices = [...practices, ...getCreatedPractices()];
      const practice = allPractices.find(p => p.id === practiceId);
      if (!practice) {
        console.error('Practice not found');
        return;
      }

      // Guard: Cannot remove last remaining location
      if (practice.locations.length <= 1) {
        console.error('Cannot remove last remaining location');
        return;
      }

      // Guard: Location must exist
      if (!practice.locations.some(loc => loc.id === payload.locationId)) {
        console.error(`Location ${payload.locationId} not found`);
        return;
      }

      // Remove location
      const updatedLocations = practice.locations.filter(loc => loc.id !== payload.locationId);
      savePracticeOverride(practiceId, {
        locations: updatedLocations,
        updatedAt: now,
      });

      break;
    }

    case 'practice_doctor_add_request': {
      const payload = request.payload as PracticeAddDoctorPayload;
      const practiceId = payload.practiceId;

      if (!practiceId) {
        throw new ValidationError('Missing practiceId');
      }

      const p = request.payload as any;
      const doctorEmail = p.email || p.doctorEmail || request.target?.invitedDoctorEmail;
      if (!doctorEmail) {
        throw new ValidationError('Missing doctor email in payload or target');
      }

      // Find doctor by email
      const doctor = doctors.find(d => d.email === doctorEmail);
      if (!doctor) {
        throw new NotFoundError('Doctor', `email: ${doctorEmail}`);
      }

      const doctorId = doctor.id;

      // Get practice
      const practice = getPracticeById(practiceId);
      if (!practice) {
        throw new NotFoundError('Practice', practiceId);
      }

      // Idempotency check
      if (practice.doctorIds.includes(doctorId)) {
        return; // Already added
      }

      if (doctor.practiceId) {
        throw new ConflictError(`Doctor ${doctorId} already belongs to practice ${doctor.practiceId}`);
      }

      // Deep clone before snapshots
      const beforePractice = (() => {
        try {
          if (typeof structuredClone !== 'undefined') {
            return structuredClone(practice);
          } else {
            return JSON.parse(JSON.stringify(practice));
          }
        } catch {
          return { ...practice };
        }
      })();

      const beforeDoctor = (() => {
        try {
          if (typeof structuredClone !== 'undefined') {
            return structuredClone(doctor);
          } else {
            return JSON.parse(JSON.stringify(doctor));
          }
        } catch {
          return { ...doctor };
        }
      })();

      // Two-sided mutation
      const updatedDoctorIds = [...practice.doctorIds, doctorId];
      savePracticeOverride(practiceId, {
        doctorIds: updatedDoctorIds,
        specialties: [
          ...new Set([
            ...(practice.specialties || []),
            ...(doctor.specialties || [doctor.specialty || '']),
          ]),
        ],
        updatedAt: now,
      });

      saveDoctorOverride(doctorId, {
        practiceId: practiceId,
        roleInPractice: 'doctor',
      });

      // Store snapshot in history
      const afterPractice = getPracticeById(practiceId);
      const afterDoctor = doctors.find(d => d.id === doctorId);

      if (afterPractice && afterDoctor) {
        appendApprovalHistory({
          id: makeId('ahr'),
          requestId: request.id,
          type: request.type,
          practiceId: practiceId,
          doctorId: doctorId,
          action: 'final_approved',
          at: now,
          by: {
            role: 'admin', // System action logged as admin
          },
          snapshot: {
            before: {
              practice: beforePractice,
              doctor: beforeDoctor,
            },
            after: {
              practice: afterPractice,
              doctor: afterDoctor,
            },
          },
        });
      }

      break;
    }

    case 'practice_doctor_remove_request': {
      const p = request.payload as any;
      const practiceId = p.practiceId || request.target?.practiceId;
      const doctorId = p.doctorId || request.target?.doctorId;

      if (!practiceId || !doctorId) {
        throw new ValidationError('Missing practiceId or doctorId');
      }

      // Get entities
      const practice = getPracticeById(practiceId);
      const doctor = doctors.find(d => d.id === doctorId);

      if (!practice) {
        throw new NotFoundError('Practice', practiceId);
      }
      if (!doctor) {
        throw new NotFoundError('Doctor', doctorId);
      }

      // Idempotency check
      if (!practice.doctorIds.includes(doctorId)) {
        return; // Already removed
      }

      if (doctor.practiceId !== practiceId) {
        throw new ConflictError(`Doctor ${doctorId} does not belong to practice ${practiceId}`);
      }

      // Last practice_admin guard (MANDATORY)
      const allDoctors = [...doctors];
      const practiceAdmins = practice.doctorIds
        .map(id => allDoctors.find(d => d.id === id))
        .filter((d): d is Doctor => d !== undefined && d.roleInPractice === 'practice_admin');

      if (practiceAdmins.length === 1 && practiceAdmins[0]?.id === doctorId) {
        throw new Error('Cannot remove the last practice_admin from a practice.');
      }

      // Deep clone before snapshots
      const beforePractice = (() => {
        try {
          if (typeof structuredClone !== 'undefined') {
            return structuredClone(practice);
          } else {
            return JSON.parse(JSON.stringify(practice));
          }
        } catch {
          return { ...practice };
        }
      })();

      const beforeDoctor = (() => {
        try {
          if (typeof structuredClone !== 'undefined') {
            return structuredClone(doctor);
          } else {
            return JSON.parse(JSON.stringify(doctor));
          }
        } catch {
          return { ...doctor };
        }
      })();

      // Two-sided mutation
      const updatedDoctorIds = practice.doctorIds.filter(id => id !== doctorId);
      savePracticeOverride(practiceId, {
        doctorIds: updatedDoctorIds,
        updatedAt: now,
      });

      saveDoctorOverride(doctorId, {
        practiceId: undefined, // Remove practice association
        roleInPractice: undefined,
      });

      // Store snapshot in history
      const afterPractice = getPracticeById(practiceId);
      const afterDoctor = doctors.find(d => d.id === doctorId);

      if (afterPractice && afterDoctor) {
        appendApprovalHistory({
          id: makeId('ahr'),
          requestId: request.id,
          type: request.type,
          practiceId: practiceId,
          doctorId: doctorId,
          action: 'final_approved',
          at: now,
          by: {
            role: 'admin', // System action logged as admin
          },
          snapshot: {
            before: {
              practice: beforePractice,
              doctor: beforeDoctor,
            },
            after: {
              practice: afterPractice,
              doctor: afterDoctor,
            },
          },
        });
      }

      break;
    }

    default:
      console.warn(`Unknown approval type: ${request.type}`);
  }
}

/**
 * Get pending approvals for admin
 */
export function getPendingApprovalsForAdmin(): ApprovalRequest[] {
  const requests = getApprovalRequests();
  return requests.filter((r) => r.approvals.admin.status === 'pending');
}

/**
 * Get pending approvals for practice admin
 */
export function getPendingApprovalsForPracticeAdmin(
  practiceId: string
): ApprovalRequest[] {
  const requests = getApprovalRequests();
  return requests.filter(
    (r) =>
      r.approvals.practiceAdmin?.status === 'pending' &&
      r.approvals.practiceAdmin?.practiceId === practiceId
  );
}

/**
 * Get approval timeline (history) for a request
 */
export function getApprovalTimeline(
  requestId: string
): ApprovalHistoryRecord[] {
  const history = getApprovalHistory();
  return history
    .filter((h) => h.requestId === requestId)
    .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());
}
