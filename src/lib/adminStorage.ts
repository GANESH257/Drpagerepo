import { JoinRequest, MembershipPlan, BoardMeeting } from '@/types';
import { membershipPlans } from '@/data/membershipPlans';
import { orgPolicies } from '@/data/orgPolicies';
import { globalMedicalEvents, GlobalMedicalEvent } from '@/data/globalMedicalEvents';
import { nextMeeting, upcomingMeetings } from '@/data/boardMeetings';

/**
 * Extended JoinRequest with admin metadata
 */
export interface AdminJoinRequest extends JoinRequest {
  decidedAt?: string;
  decidedBy?: string;
  notes?: string;
  rejectionReason?: string;
}

/**
 * Join Requests Storage
 */

/**
 * Get all join requests from localStorage
 */
export function getJoinRequests(): AdminJoinRequest[] {
  if (typeof window === 'undefined') return [];

  try {
    const stored = localStorage.getItem('aip_join_requests');
    if (stored) {
      return JSON.parse(stored) as AdminJoinRequest[];
    }
    return [];
  } catch (error) {
    console.error('Error loading join requests:', error);
    return [];
  }
}

/**
 * Save join requests to localStorage
 */
export function saveJoinRequests(requests: AdminJoinRequest[]): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem('aip_join_requests', JSON.stringify(requests));
  } catch (error) {
    console.error('Error saving join requests:', error);
  }
}

/**
 * Update a join request
 */
export function updateJoinRequest(requestId: string, updates: Partial<AdminJoinRequest>): void {
  if (typeof window === 'undefined') return;

  try {
    const requests = getJoinRequests();
    const updated = requests.map((req) =>
      req.id === requestId ? { ...req, ...updates } : req
    );
    saveJoinRequests(updated);
  } catch (error) {
    console.error('Error updating join request:', error);
  }
}

/**
 * Accept a join request
 */
export function acceptJoinRequest(requestId: string, notes?: string): void {
  if (typeof window === 'undefined') return;

  try {
    const requests = getJoinRequests();
    const updated = requests.map((req) => {
      if (req.id === requestId) {
        return {
          ...req,
          status: 'approved' as JoinRequest['status'],
          decidedAt: new Date().toISOString(),
          decidedBy: 'admin@aip.com',
          notes,
        } as AdminJoinRequest;
      }
      return req;
    });
    saveJoinRequests(updated);
  } catch (error) {
    console.error('Error accepting join request:', error);
  }
}

/**
 * Reject a join request
 */
export function rejectJoinRequest(requestId: string, reason?: string): void {
  if (typeof window === 'undefined') return;

  try {
    const requests = getJoinRequests();
    const updated = requests.map((req) => {
      if (req.id === requestId) {
        return {
          ...req,
          status: 'rejected' as JoinRequest['status'],
          decidedAt: new Date().toISOString(),
          decidedBy: 'admin@aip.com',
          rejectionReason: reason,
        } as AdminJoinRequest;
      }
      return req;
    });
    saveJoinRequests(updated);
  } catch (error) {
    console.error('Error rejecting join request:', error);
  }
}

/**
 * Membership Plans Storage
 */

/**
 * Get membership plans (check override first, then fallback to seed data)
 */
export function getMembershipPlans(): MembershipPlan[] {
  if (typeof window === 'undefined') return membershipPlans;

  try {
    const override = localStorage.getItem('aip_membership_plans_override');
    if (override) {
      return JSON.parse(override) as MembershipPlan[];
    }
    return membershipPlans;
  } catch (error) {
    console.error('Error loading membership plans:', error);
    return membershipPlans;
  }
}

/**
 * Save membership plans override to localStorage
 */
export function saveMembershipPlans(plans: MembershipPlan[]): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem('aip_membership_plans_override', JSON.stringify(plans));
  } catch (error) {
    console.error('Error saving membership plans:', error);
  }
}

/**
 * Reset membership plans to defaults
 */
export function resetMembershipPlans(): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem('aip_membership_plans_override');
  } catch (error) {
    console.error('Error resetting membership plans:', error);
  }
}

/**
 * Policies Storage
 */

export interface OrgPolicy {
  id: string;
  category: string;
  title: string;
  body: string;
}

/**
 * Get organization policies (check override first, then fallback to seed data)
 */
export function getOrgPolicies(): OrgPolicy[] {
  if (typeof window === 'undefined') {
    // Return seed data on server
    return orgPolicies;
  }

  try {
    const override = localStorage.getItem('aip_policies_override');
    if (override) {
      return JSON.parse(override) as OrgPolicy[];
    }
    return orgPolicies;
  } catch (error) {
    console.error('Error loading org policies:', error);
    return orgPolicies;
  }
}

/**
 * Save organization policies override to localStorage
 */
export function saveOrgPolicies(policies: OrgPolicy[]): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem('aip_policies_override', JSON.stringify(policies));
  } catch (error) {
    console.error('Error saving org policies:', error);
  }
}

/**
 * Reset organization policies to defaults
 */
export function resetOrgPolicies(): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem('aip_policies_override');
  } catch (error) {
    console.error('Error resetting org policies:', error);
  }
}

/**
 * Events Storage
 */

/**
 * Get global medical events (check override first, then fallback to seed data)
 */
export function getGlobalMedicalEvents(): GlobalMedicalEvent[] {
  if (typeof window === 'undefined') return globalMedicalEvents;

  try {
    const override = localStorage.getItem('aip_global_medical_events_override');
    if (override) {
      return JSON.parse(override) as GlobalMedicalEvent[];
    }
    return globalMedicalEvents;
  } catch (error) {
    console.error('Error loading global medical events:', error);
    return globalMedicalEvents;
  }
}

/**
 * Save global medical events override to localStorage
 */
export function saveGlobalMedicalEvents(events: GlobalMedicalEvent[]): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem('aip_global_medical_events_override', JSON.stringify(events));
  } catch (error) {
    console.error('Error saving global medical events:', error);
  }
}

/**
 * Reset global medical events to defaults
 */
export function resetGlobalMedicalEvents(): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem('aip_global_medical_events_override');
  } catch (error) {
    console.error('Error resetting global medical events:', error);
  }
}

/**
 * Board Meetings Storage
 */

export interface BoardMeetingsData {
  nextMeeting: BoardMeeting;
  upcomingMeetings: BoardMeeting[];
}

/**
 * Get board meetings (check override first, then fallback to seed data)
 */
export function getBoardMeetings(): BoardMeetingsData {
  if (typeof window === 'undefined') {
    return {
      nextMeeting,
      upcomingMeetings,
    };
  }

  try {
    const override = localStorage.getItem('aip_board_meetings_override');
    if (override) {
      return JSON.parse(override) as BoardMeetingsData;
    }
    return {
      nextMeeting,
      upcomingMeetings,
    };
  } catch (error) {
    console.error('Error loading board meetings:', error);
    return {
      nextMeeting,
      upcomingMeetings,
    };
  }
}

/**
 * Save board meetings override to localStorage
 */
export function saveBoardMeetings(meetings: BoardMeetingsData): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem('aip_board_meetings_override', JSON.stringify(meetings));
  } catch (error) {
    console.error('Error saving board meetings:', error);
  }
}

/**
 * Reset board meetings to defaults
 */
export function resetBoardMeetings(): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem('aip_board_meetings_override');
  } catch (error) {
    console.error('Error resetting board meetings:', error);
  }
}
