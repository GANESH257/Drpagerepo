import { ApprovalType } from '@/types/approvals';
import { Badge } from '@/components/ui/badge';
import { 
  Building2, 
  UserPlus, 
  UserMinus, 
  Edit, 
  MapPin, 
  Plus, 
  FileEdit, 
  X,
  Shield,
  Users
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ApprovalTypeBadgeProps {
  type: ApprovalType;
  className?: string;
}

const typeConfig: Record<ApprovalType, { 
  label: string; 
  icon: typeof Building2;
  variant: 'default' | 'secondary' | 'destructive' | 'outline';
  colorClass?: string;
}> = {
  new_practice_with_admin_doctor: {
    label: 'New Practice + Admin Doctor',
    icon: Building2,
    variant: 'default',
    colorClass: 'bg-blue-100 text-blue-800 border-blue-300',
  },
  doctor_join_practice: {
    label: 'Doctor Joining Practice',
    icon: UserPlus,
    variant: 'secondary',
    colorClass: 'bg-green-100 text-green-800 border-green-300',
  },
  practice_admin_profile_practice_completion: {
    label: 'PA Profile & Practice Completion',
    icon: Building2,
    variant: 'default',
    colorClass: 'bg-sky-100 text-sky-800 border-sky-300',
  },
  doctor_profile_completion: {
    label: 'Doctor Profile Completion',
    icon: UserPlus,
    variant: 'secondary',
    colorClass: 'bg-teal-100 text-teal-800 border-teal-300',
  },
  practice_edit_request: {
    label: 'Practice Edit Request',
    icon: Edit,
    variant: 'outline',
    colorClass: 'bg-purple-100 text-purple-800 border-purple-300',
  },
  practice_doctor_add_request: {
    label: 'Add Doctor to Practice',
    icon: Users,
    variant: 'secondary',
    colorClass: 'bg-teal-100 text-teal-800 border-teal-300',
  },
  practice_doctor_remove_request: {
    label: 'Remove Doctor from Practice',
    icon: UserMinus,
    variant: 'destructive',
    colorClass: 'bg-red-100 text-red-800 border-red-300',
  },
  practice_location_change_request: {
    label: 'Location Change',
    icon: MapPin,
    variant: 'outline',
    colorClass: 'bg-orange-100 text-orange-800 border-orange-300',
  },
  practice_insurance_services_change_request: {
    label: 'Insurance/Services Change',
    icon: Shield,
    variant: 'outline',
    colorClass: 'bg-indigo-100 text-indigo-800 border-indigo-300',
  },
  practice_location_add_request: {
    label: 'Location Add',
    icon: Plus,
    variant: 'secondary',
    colorClass: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  },
  practice_location_edit_request: {
    label: 'Location Edit',
    icon: FileEdit,
    variant: 'outline',
    colorClass: 'bg-amber-100 text-amber-800 border-amber-300',
  },
  practice_location_remove_request: {
    label: 'Location Remove',
    icon: X,
    variant: 'destructive',
    colorClass: 'bg-rose-100 text-rose-800 border-rose-300',
  },
};

export function ApprovalTypeBadge({ type, className }: ApprovalTypeBadgeProps) {
  const config = typeConfig[type];
  if (!config) {
    return (
      <Badge variant="outline" className={className}>
        {type}
      </Badge>
    );
  }

  const Icon = config.icon;

  return (
    <Badge 
      variant={config.variant} 
      className={cn(
        'flex items-center gap-1.5 px-2.5 py-1',
        config.colorClass,
        className
      )}
    >
      <Icon className="h-3.5 w-3.5" />
      <span>{config.label}</span>
    </Badge>
  );
}
