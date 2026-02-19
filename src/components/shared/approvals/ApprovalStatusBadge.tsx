import { ApprovalStatus } from '@/types/approvals';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface ApprovalStatusBadgeProps {
  status: ApprovalStatus;
  className?: string;
}

const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  pending: {
    label: 'Pending',
    variant: 'secondary',
  },
  submitted: {
    label: 'Submitted',
    variant: 'outline',
  },
  under_review: {
    label: 'Under Review',
    variant: 'outline',
  },
  approved: {
    label: 'Approved',
    variant: 'default',
  },
  final_approved: {
    label: 'Approved',
    variant: 'default',
  },
  rejected: {
    label: 'Rejected',
    variant: 'destructive',
  },
  final_rejected: {
    label: 'Rejected',
    variant: 'destructive',
  },
};

export function ApprovalStatusBadge({ status, className }: ApprovalStatusBadgeProps) {
  const config = statusConfig[status] || {
    label: status,
    variant: 'outline',
  };

  return (
    <Badge variant={config.variant} className={cn(className)}>
      {config.label}
    </Badge>
  );
}
