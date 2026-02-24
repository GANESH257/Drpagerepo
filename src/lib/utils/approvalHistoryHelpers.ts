/**
 * Approval History Helpers
 * 
 * Normalization and utility functions for approval history records
 */

import { ApprovalHistoryRecord, ApprovalRequest } from '@/types/approvals';
import { getPracticeById } from '@/lib/services/practiceDirectoryService';
import { getAllDoctorsArray } from '@/lib/api/doctors';
import { getToken } from '@/lib/api/config';
import { Doctor } from '@/types';
import { deriveStatusFromAction } from './approvalStatusHelpers';

/**
 * Normalized approval history record for consistent filtering and display
 */
export interface NormalizedApprovalHistoryRecord {
  id: string;
  requestId: string;
  type: ApprovalHistoryRecord['type'];
  status: 'pending' | 'approved' | 'rejected';
  timestamp: string; // Normalized from 'at'
  practiceId?: string;
  doctorId?: string;
  practiceName?: string; // Looked up
  doctorName?: string; // Looked up
  actor: {
    actorId: string;
    actorRole: 'admin' | 'practice_admin' | 'doctor' | 'public';
    actorName?: string;
  };
  reason?: string;
  payloadSnapshot?: Record<string, any>; // From snapshot or request payload
  action: ApprovalHistoryRecord['action'];
}

/**
 * Normalize approval history record for filtering and display
 *
 * @param record History record to normalize
 * @param request Optional approval request for additional context (payload snapshot)
 * @param doctors Optional list of doctors for name lookup (avoids extra API calls when provided)
 */
export async function normalizeApprovalHistoryRecord(
  record: ApprovalHistoryRecord,
  request?: ApprovalRequest,
  doctors?: Doctor[]
): Promise<NormalizedApprovalHistoryRecord> {
  // Derive status from action
  const status = deriveStatusFromAction(record.action);

  // Lookup practice name
  const practice = record.practiceId ? await getPracticeById(record.practiceId) : null;
  const practiceName = practice?.name;

  // Lookup doctor name (use provided list or fetch from API once)
  const token = getToken();
  const allDoctors = doctors ?? (token ? await getAllDoctorsArray(token) : []);
  const doctorName = record.doctorId
    ? allDoctors.find((d) => d.id === record.doctorId)?.fullName
    : undefined;

  // Get actor info
  const actorId =
    record.by.doctorId ||
    record.by.email ||
    (record.by.role === 'admin' ? 'admin' : 'unknown');
  const actorName =
    record.by.doctorId && doctorName
      ? doctorName
      : record.by.email || undefined;

  // Extract payload snapshot (prefer record.snapshot, fallback to request.payload)
  const payloadSnapshot = record.snapshot || request?.payload;

  return {
    id: record.id,
    requestId: record.requestId,
    type: record.type,
    status,
    timestamp: record.at, // Normalize field name
    practiceId: record.practiceId,
    doctorId: record.doctorId,
    practiceName,
    doctorName,
    actor: {
      actorId,
      actorRole: record.by.role,
      actorName,
    },
    reason: record.reason,
    payloadSnapshot,
    action: record.action,
  };
}

/**
 * Normalize multiple approval history records.
 * Pass `doctors` when already loaded (e.g. from API) to avoid N+1 lookups.
 */
export async function normalizeApprovalHistoryRecords(
  records: ApprovalHistoryRecord[],
  requests?: ApprovalRequest[],
  doctors?: Doctor[]
): Promise<NormalizedApprovalHistoryRecord[]> {
  const requestMap = requests
    ? new Map(requests.map((r) => [r.id, r]))
    : undefined;

  const normalized = await Promise.all(
    records.map(async (record) => {
      const request = requestMap?.get(record.requestId);
      return await normalizeApprovalHistoryRecord(record, request, doctors);
    })
  );
  return normalized;
}
