import { ApprovalRequest, ApprovalHistoryRecord } from '@/types/approvals';
import { LS_KEYS } from './keys';
import { readJSON, writeJSON, appendToArray, updateArrayItemById } from './localStorage';

/**
 * Get all approval requests from localStorage
 * Returns sorted by submittedAt desc (newest first)
 */
export function getApprovalRequests(): ApprovalRequest[] {
  const requests = readJSON<ApprovalRequest[]>(LS_KEYS.APPROVAL_REQUESTS, []);
  // Sort by submittedAt desc (newest first)
  return requests.sort((a, b) => 
    new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
  );
}

/**
 * Save all approval requests to localStorage
 * 
 * @param requests Array of approval requests
 */
export function saveApprovalRequests(requests: ApprovalRequest[]): void {
  // Sort by submittedAt desc before saving
  const sorted = requests.sort((a, b) => 
    new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
  );
  writeJSON(LS_KEYS.APPROVAL_REQUESTS, sorted);
}

/**
 * Add new approval request
 * Prepends to array (newest first)
 * 
 * @param req Approval request to add
 */
export function addApprovalRequest(req: ApprovalRequest): void {
  const existing = getApprovalRequests();
  const updated = [req, ...existing];
  saveApprovalRequests(updated);
}

/**
 * Update approval request by ID
 * 
 * @param id Approval request ID
 * @param patch Partial update to apply
 */
export function updateApprovalRequest(id: string, patch: Partial<ApprovalRequest>): void {
  updateArrayItemById<ApprovalRequest>(LS_KEYS.APPROVAL_REQUESTS, id, {
    ...patch,
    updatedAt: new Date().toISOString(),
  });
}

/**
 * Get approval history records
 * Returns append-only log of all approval actions
 */
export function getApprovalHistory(): ApprovalHistoryRecord[] {
  return readJSON<ApprovalHistoryRecord[]>(LS_KEYS.APPROVAL_HISTORY, []);
}

/**
 * Append approval history record
 * Append-only log, capped at 2000 items (keeps latest)
 * 
 * @param record History record to append
 */
export function appendApprovalHistory(record: ApprovalHistoryRecord): void {
  appendToArray<ApprovalHistoryRecord>(
    LS_KEYS.APPROVAL_HISTORY,
    record,
    2000 // Cap at 2000 items
  );
}
