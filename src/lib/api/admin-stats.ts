/**
 * Admin dashboard stats (API-only, no localStorage)
 */

import { getPractices } from './practices';
import { getDoctors } from './doctors';
import { getApprovalRequests } from './approval-requests';
import { getToken } from './config';

export interface AdminStats {
  totalPractices: number;
  totalDoctors: number;
  pendingApprovals: number;
}

export async function getAdminStats(): Promise<AdminStats> {
  const token = getToken();
  if (!token) throw new Error('Authentication required');

  const [practicesRes, doctorsRes, approvalList] = await Promise.all([
    getPractices({ limit: 1, includePending: true }, token).catch(() => ({ practices: [], pagination: { total: 0 } })),
    getDoctors({ limit: 1 }, token).catch(() => ({ doctors: [], pagination: { total: 0 } })),
    getApprovalRequests().catch(() => []),
  ]);

  const pending = Array.isArray(approvalList)
    ? approvalList.filter(
        (r: { status?: string; admin_status?: string }) =>
          r.status === 'submitted' || r.admin_status === 'pending' || r.status === 'pending'
      ).length
    : 0;

  return {
    totalPractices: practicesRes.pagination?.total ?? practicesRes.practices?.length ?? 0,
    totalDoctors: doctorsRes.pagination?.total ?? doctorsRes.doctors?.length ?? 0,
    pendingApprovals: pending,
  };
}
