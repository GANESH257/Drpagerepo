/**
 * Transformation utilities for Approval Requests
 * Converts between backend API format (snake_case, flat) and frontend format (camelCase, nested)
 */

import { ApprovalRequest as ApiApprovalRequest } from './approval-requests';
import { ApprovalRequest as FrontendApprovalRequest } from '@/types/approvals';

/**
 * Transform API approval request to frontend format
 */
export function transformApprovalRequestFromAPI(
  apiRequest: ApiApprovalRequest
): FrontendApprovalRequest {
  // Parse payload if it's a string
  const payload = typeof apiRequest.payload === 'string' 
    ? JSON.parse(apiRequest.payload) 
    : apiRequest.payload;

  // Map admin_status to nested approvals.admin.status
  let adminStatus: 'pending' | 'approved' | 'rejected' = 'pending';
  if (apiRequest.admin_status === 'approved') {
    adminStatus = 'approved';
  } else if (apiRequest.admin_status === 'rejected') {
    adminStatus = 'rejected';
  }

  // Map practice_admin_status if present
  let practiceAdminStatus: 'pending' | 'approved' | 'rejected' | undefined = undefined;
  if (apiRequest.practice_admin_status) {
    if (apiRequest.practice_admin_status === 'approved') {
      practiceAdminStatus = 'approved';
    } else if (apiRequest.practice_admin_status === 'rejected') {
      practiceAdminStatus = 'rejected';
    } else {
      practiceAdminStatus = 'pending';
    }
  }

  // Determine overall status
  let overallStatus: 'submitted' | 'under_review' | 'approved' | 'rejected' = 'submitted';
  
  // Check if rejected first (highest priority)
  if (adminStatus === 'rejected' || practiceAdminStatus === 'rejected') {
    overallStatus = 'rejected';
  }
  // Check if fully approved (both admin and practice admin if needed)
  else if (adminStatus === 'approved' && (!practiceAdminStatus || practiceAdminStatus === 'approved')) {
    overallStatus = 'approved';
  }
  // Check if admin approved but practice admin still pending (under review)
  else if (adminStatus === 'approved' && practiceAdminStatus === 'pending') {
    overallStatus = 'under_review';
  }
  // Check if practice admin approved but admin still pending (under review)
  else if (practiceAdminStatus === 'approved' && adminStatus === 'pending') {
    overallStatus = 'under_review';
  }
  // Check if either admin has reviewed but not decided (under review)
  else if ((adminStatus === 'pending' && (apiRequest.admin_notes || apiRequest.practice_admin_notes)) ||
           (practiceAdminStatus === 'pending' && apiRequest.practice_admin_notes)) {
    overallStatus = 'under_review';
  }
  // Otherwise still submitted
  else {
    overallStatus = 'submitted';
  }

  // Build submittedBy object
  const submittedBy: FrontendApprovalRequest['submittedBy'] = {
    role: apiRequest.requested_by_type as 'public' | 'doctor' | 'practice_admin' | 'admin',
  };
  if (apiRequest.requested_by_type === 'doctor') {
    submittedBy.doctorId = apiRequest.requested_by;
  } else if (apiRequest.requested_by_type === 'practice_admin') {
    submittedBy.practiceId = apiRequest.practice_id;
  } else {
    // For public users, email might be in payload
    submittedBy.email = payload.email || apiRequest.requested_by;
  }

  // Build target object
  const target: FrontendApprovalRequest['target'] = {};
  if (apiRequest.practice_id) {
    target.practiceId = apiRequest.practice_id;
  }
  if (apiRequest.target_doctor_id) {
    target.doctorId = apiRequest.target_doctor_id;
  }
  if (payload.invitedDoctorEmail) {
    target.invitedDoctorEmail = payload.invitedDoctorEmail;
  }

  // Build decision object if rejected
  const decision: FrontendApprovalRequest['decision'] | undefined = 
    (adminStatus === 'rejected' || practiceAdminStatus === 'rejected')
      ? {
          decidedAt: apiRequest.admin_reviewed_at || apiRequest.practice_admin_reviewed_at,
          decidedBy: apiRequest.rejected_by || 'admin',
          reason: apiRequest.rejection_reason,
          notes: apiRequest.admin_notes || apiRequest.practice_admin_notes,
        }
      : undefined;

  return {
    id: apiRequest.id,
    type: apiRequest.type as FrontendApprovalRequest['type'],
    status: overallStatus,
    submittedAt: apiRequest.created_at,
    updatedAt: apiRequest.updated_at,
    submittedBy,
    approvals: {
      admin: {
        status: adminStatus,
        decidedAt: apiRequest.admin_reviewed_at || undefined,
        notes: apiRequest.admin_notes || undefined,
      },
      ...(practiceAdminStatus !== undefined && apiRequest.practice_id && {
        practiceAdmin: {
          practiceId: apiRequest.practice_id,
          status: practiceAdminStatus,
          decidedAt: apiRequest.practice_admin_reviewed_at || undefined,
          notes: apiRequest.practice_admin_notes || undefined,
        },
      }),
    },
    target,
    payload,
    decision,
  };
}

/**
 * Transform frontend approval request to API format (for updates)
 */
export function transformApprovalRequestToAPI(
  frontendRequest: Partial<FrontendApprovalRequest>
): Partial<ApiApprovalRequest> {
  const apiRequest: Partial<ApiApprovalRequest> = {};

  if (frontendRequest.approvals?.admin) {
    const adminApproval = frontendRequest.approvals.admin;
    
    // Map nested admin status to flat admin_status
    if (adminApproval.status === 'approved') {
      apiRequest.admin_status = 'approved';
    } else if (adminApproval.status === 'rejected') {
      apiRequest.admin_status = 'rejected';
    } else {
      apiRequest.admin_status = 'pending';
    }

    // Map admin notes
    if (adminApproval.notes !== undefined) {
      apiRequest.admin_notes = adminApproval.notes;
    }

    // Map admin reviewed at
    if (adminApproval.decidedAt !== undefined) {
      apiRequest.admin_reviewed_at = adminApproval.decidedAt;
    }
  }

  if (frontendRequest.approvals?.practiceAdmin) {
    const practiceAdminApproval = frontendRequest.approvals.practiceAdmin;
    
    if (practiceAdminApproval.status === 'approved') {
      apiRequest.practice_admin_status = 'approved';
    } else if (practiceAdminApproval.status === 'rejected') {
      apiRequest.practice_admin_status = 'rejected';
    } else {
      apiRequest.practice_admin_status = 'pending';
    }

    if (practiceAdminApproval.notes !== undefined) {
      apiRequest.practice_admin_notes = practiceAdminApproval.notes;
    }

    if (practiceAdminApproval.decidedAt !== undefined) {
      apiRequest.practice_admin_reviewed_at = practiceAdminApproval.decidedAt;
    }
  }

  if (frontendRequest.decision?.reason !== undefined) {
    apiRequest.rejection_reason = frontendRequest.decision.reason;
  }

  if (frontendRequest.decision?.decidedBy !== undefined) {
    apiRequest.rejected_by = frontendRequest.decision.decidedBy;
  }

  if (frontendRequest.payload !== undefined) {
    apiRequest.payload = frontendRequest.payload;
  }

  return apiRequest;
}

/**
 * Transform array of API approval requests to frontend format
 */
export function transformApprovalRequestsFromAPI(
  apiRequests: ApiApprovalRequest[]
): FrontendApprovalRequest[] {
  return apiRequests.map(transformApprovalRequestFromAPI);
}
