import { ApprovalHistoryRecord } from '@/types/approvals';
import { ReferralHistoryRecord } from '@/types/referrals';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDateTime } from '@/lib/dateUtils';

type TimelineRecord = ApprovalHistoryRecord | ReferralHistoryRecord;

interface TimelineProps {
  records: TimelineRecord[];
  className?: string;
}

function isApprovalRecord(record: TimelineRecord): record is ApprovalHistoryRecord {
  return 'requestId' in record;
}

function formatActionLabel(record: TimelineRecord): string {
  if (isApprovalRecord(record)) {
    const actionLabels: Record<ApprovalHistoryRecord['action'], string> = {
      submitted: 'Submitted',
      under_review: 'Marked Under Review',
      admin_approved: 'Admin Approved',
      admin_rejected: 'Admin Rejected',
      practice_admin_approved: 'Practice Admin Approved',
      practice_admin_rejected: 'Practice Admin Rejected',
      final_approved: 'Final Approved',
      final_rejected: 'Final Rejected',
    };
    return actionLabels[record.action];
  } else {
    const actionLabels: Record<ReferralHistoryRecord['action'], string> = {
      created: 'Created',
      status_changed: 'Status Changed',
      note_added: 'Note Added',
      viewed: 'Viewed',
    };
    return actionLabels[record.action];
  }
}

function getActionVariant(action: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  if (action.includes('approved')) return 'default';
  if (action.includes('rejected')) return 'destructive';
  if (action.includes('submitted') || action.includes('created')) return 'outline';
  return 'secondary';
}

function formatActor(record: TimelineRecord): string {
  if (isApprovalRecord(record)) {
    const { by } = record;
    if (by.role === 'admin') return 'Admin';
    if (by.role === 'practice_admin') return 'Practice Admin';
    if (by.role === 'doctor' && by.email) return by.email;
    if (by.email) return by.email;
    return by.role;
  } else {
    // New ReferralHistoryRecord structure with actor object
    if ('actor' in record && record.actor) {
      if (record.actor.actorName) return record.actor.actorName;
      if (record.actor.actorRole === 'admin') return 'Admin';
      if (record.actor.actorRole === 'practice_admin') return 'Practice Admin';
      return 'Doctor';
    }
    // Legacy structure fallback (backward compatibility)
    if ('byDoctorId' in record) {
      return 'Doctor';
    }
    return 'Unknown';
  }
}

export function Timeline({ records, className }: TimelineProps) {
  if (records.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">
        No history records available
      </div>
    );
  }

  // Sort by date descending (newest first)
  // Handle both old (at) and new (timestamp) field names for backward compatibility
  const sortedRecords = [...records].sort((a, b) => {
    const aDate = isApprovalRecord(a) 
      ? new Date(a.at).getTime()
      : ('timestamp' in a ? new Date(a.timestamp).getTime() : new Date((a as any).at || 0).getTime());
    const bDate = isApprovalRecord(b)
      ? new Date(b.at).getTime()
      : ('timestamp' in b ? new Date(b.timestamp).getTime() : new Date((b as any).at || 0).getTime());
    return bDate - aDate;
  });

  return (
    <div className={className}>
      <div className="space-y-4">
        {sortedRecords.map((record, index) => {
          const actionLabel = formatActionLabel(record);
          const actor = formatActor(record);
          // Handle both old (at) and new (timestamp) field names
          const dateStr = isApprovalRecord(record)
            ? record.at
            : ('timestamp' in record ? record.timestamp : (record as any).at);
          const date = new Date(dateStr);
          
          return (
            <Card key={isApprovalRecord(record) ? record.id : `ref-${index}`} className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant={getActionVariant(record.action)}>
                      {actionLabel}
                    </Badge>
                    <span className="text-sm text-gray-600">by {actor}</span>
                  </div>
                  {isApprovalRecord(record) && record.reason && (
                    <p className="text-sm text-gray-700 mb-1">
                      <strong>Reason:</strong> {record.reason}
                    </p>
                  )}
                  {isApprovalRecord(record) && record.notes && (
                    <p className="text-sm text-gray-600">{record.notes}</p>
                  )}
                  {!isApprovalRecord(record) && record.metadata && (
                    <div className="text-sm text-gray-600 space-y-1">
                      {record.metadata.fromStatus && record.metadata.toStatus && (
                        <p>
                          Status changed from <strong>{record.metadata.fromStatus}</strong> to <strong>{record.metadata.toStatus}</strong>
                        </p>
                      )}
                      {record.metadata.note && (
                        <p className="mt-1">
                          <strong>Note:</strong> {record.metadata.note}
                        </p>
                      )}
                    </div>
                  )}
                  {/* Legacy fallback for old snapshot structure */}
                  {!isApprovalRecord(record) && !record.metadata && 'snapshot' in record && (record as any).snapshot && (
                    <p className="text-sm text-gray-600">Status changed</p>
                  )}
                </div>
                <div className="text-xs text-gray-500 ml-4">
                  {formatDateTime(date)}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
