import { ApprovalType } from '@/types/approvals';
import { Badge } from '@/components/ui/badge';

interface ApprovalTypeBadgeProps {
  type: ApprovalType;
  className?: string;
}

const typeLabels: Record<ApprovalType, string> = {
  new_practice_with_admin_doctor: 'New Practice + Admin Doctor',
  doctor_join_practice: 'Doctor Joining Practice',
  practice_edit_request: 'Practice Edit Request',
  practice_doctor_add_request: 'Add Doctor to Practice',
  practice_doctor_remove_request: 'Remove Doctor from Practice',
  practice_location_change_request: 'Location Change',
  practice_insurance_services_change_request: 'Insurance/Services Change',
  practice_location_add_request: 'Location Add',
  practice_location_edit_request: 'Location Edit',
  practice_location_remove_request: 'Location Remove',
};

export function ApprovalTypeBadge({ type, className }: ApprovalTypeBadgeProps) {
  return (
    <Badge variant="outline" className={className}>
      {typeLabels[type] || type}
    </Badge>
  );
}
