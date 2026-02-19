import { ApprovalStatus } from '@/types/approvals';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface ApprovalStatusBadgeProps {
  status: ApprovalStatus;
  className?: string;
}

const statusConfig: Record<ApprovalStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  submitted: {
    label: 'Submitted',
    variant: 'outline',
  },
  under_review: {
    label: 'Under Review',
    variant: 'secondary',
  },
  approved: {
    label: 'Approved',
    variant: 'default',
  },
  rejected: {
    label: 'Rejected',
    variant: 'destructive',
  },
};

export function ApprovalStatusBadge({ status, className }: ApprovalStatusBadgeProps) {
  const config = statusConfig[status];
  
  return (
    <Badge variant={config.variant} className={cn(className)}>
      {config.label}
    </Badge>
  );
}
