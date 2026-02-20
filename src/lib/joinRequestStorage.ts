import { ApplicationDraft, JoinRequest } from '@/types';
import { submitApprovalRequest } from '@/lib/services/approvalEngine';
import { Actor } from '@/lib/services/permissionService';
import { saveDoctorOverride } from '@/lib/memberStorage';
import { makeId } from '@/lib/services/id';

/**
 * Save signup email to localStorage
 */
export function saveJoinEmail(email: string): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem('aip_join_email', email);
  } catch (error) {
    console.error('Error saving join email:', error);
  }
}

/**
 * Get signup email from localStorage
 */
export function getJoinEmail(): string | null {
  if (typeof window === 'undefined') return null;

  try {
    return localStorage.getItem('aip_join_email');
  } catch (error) {
    console.error('Error getting join email:', error);
    return null;
  }
}

/**
 * Clear signup email from localStorage
 */
export function clearJoinEmail(): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem('aip_join_email');
  } catch (error) {
    console.error('Error clearing join email:', error);
  }
}

/**
 * Save application draft to localStorage
 */
export function saveApplicationDraft(draft: ApplicationDraft): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem('aip_join_request_draft', JSON.stringify(draft));
  } catch (error) {
    console.error('Error saving application draft:', error);
  }
}

/**
 * Load application draft from localStorage
 */
export function loadApplicationDraft(): ApplicationDraft | null {
  if (typeof window === 'undefined') return null;

  try {
    const stored = localStorage.getItem('aip_join_request_draft');
    if (stored) {
      return JSON.parse(stored) as ApplicationDraft;
    }
    return null;
  } catch (error) {
    console.error('Error loading application draft:', error);
    return null;
  }
}

/**
 * Clear application draft from localStorage
 */
export function clearApplicationDraft(): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem('aip_join_request_draft');
  } catch (error) {
    console.error('Error clearing application draft:', error);
  }
}

/**
 * Generate UUID for join request
 */
function generateRequestId(): string {
  return `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Submit join request - add to requests queue
 */
export function submitJoinRequest(request: Omit<JoinRequest, 'id' | 'submittedAt' | 'status'>): JoinRequest {
  if (typeof window === 'undefined') {
    throw new Error('Cannot submit request on server');
  }

  try {
    const fullRequest: JoinRequest = {
      ...request,
      id: generateRequestId(),
      submittedAt: new Date().toISOString(),
      status: 'submitted',
    };

    // Get existing requests
    const existing = getJoinRequests();
    const updated = [fullRequest, ...existing];

    // Save back to localStorage
    localStorage.setItem('aip_join_requests', JSON.stringify(updated));

    // Also submit as an approval request to the V2 system
    const actor: Actor = {
      kind: 'public',
      email: request.applicant.email,
    };

    // Determine request type based on practice selection
    const practiceSelection = request.applicant.practiceSelection;
    
    if (practiceSelection?.type === 'existing') {
      // Doctor joining existing practice - requires Practice Admin + Admin approval
      // Create temporary doctor profile first (unverified, will be verified on approval)
      const doctorId = makeId('doctor');
      saveDoctorOverride(doctorId, {
        email: request.applicant.email,
        fullName: request.applicant.fullName,
        credentials: request.applicant.credentials,
        specialty: request.applicant.specialty,
        locations: [{
          name: 'Main Office',
          address: '',
          city: request.applicant.city,
          state: request.applicant.state,
          zip: '',
          phone: request.applicant.phone,
        }],
        verified: false, // Will be verified when approved
        practiceId: practiceSelection.practiceId, // Set practiceId, but doctor not yet added to practice.doctorIds
        roleInPractice: 'doctor',
      });

      submitApprovalRequest(actor, {
        type: 'doctor_join_practice',
        payload: {
          practiceId: practiceSelection.practiceId,
          doctorId: doctorId,
        },
        target: {
          practiceId: practiceSelection.practiceId,
          doctorId: doctorId,
        },
      });
    } else {
      // Creating new practice - requires Admin approval only
      submitApprovalRequest(actor, {
        type: 'new_practice_with_admin_doctor',
        payload: {
          practice: {
            name: practiceSelection?.type === 'new' 
              ? practiceSelection.practiceName 
              : request.applicant.practiceName || 'New Practice',
            website: practiceSelection?.type === 'new'
              ? practiceSelection.website
              : request.applicant.website,
            address: {
              city: request.applicant.city,
              state: request.applicant.state,
              country: 'USA',
            },
          },
          doctor: {
            email: request.applicant.email,
            fullName: request.applicant.fullName,
            credentials: request.applicant.credentials,
            specialty: request.applicant.specialty,
            phone: request.applicant.phone,
          },
          plan: request.plan,
          paymentMethod: request.paymentMethod,
        },
        target: {
          practiceId: `new-${Date.now()}`, // Temporary indicator
        },
      });
    }

    return fullRequest;
  } catch (error) {
    console.error('Error submitting join request:', error);
    throw error;
  }
}

/**
 * Get all join requests (for future admin panel)
 */
export function getJoinRequests(): JoinRequest[] {
  if (typeof window === 'undefined') return [];

  try {
    const stored = localStorage.getItem('aip_join_requests');
    if (stored) {
      return JSON.parse(stored) as JoinRequest[];
    }
    return [];
  } catch (error) {
    console.error('Error loading join requests:', error);
    return [];
  }
}

/**
 * Get join request by ID
 */
export function getJoinRequestById(id: string): JoinRequest | null {
  const requests = getJoinRequests();
  return requests.find((req) => req.id === id) || null;
}

/**
 * Update join request status (for future admin panel)
 */
export function updateJoinRequestStatus(id: string, status: JoinRequest['status']): void {
  if (typeof window === 'undefined') return;

  try {
    const requests = getJoinRequests();
    const updated = requests.map((req) =>
      req.id === id ? { ...req, status } : req
    );
    localStorage.setItem('aip_join_requests', JSON.stringify(updated));
  } catch (error) {
    console.error('Error updating join request status:', error);
  }
}
