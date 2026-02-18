'use client';

import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface AudienceToggleProps {
  audience: 'patients' | 'doctors';
  onAudienceChange: (audience: 'patients' | 'doctors') => void;
  className?: string;
}

export function AudienceToggle({ audience, onAudienceChange, className }: AudienceToggleProps) {
  const isDoctors = audience === 'doctors';

  return (
    <div className={cn('flex items-center justify-center gap-4 mb-8', className)}>
      <Label
        htmlFor="audience-toggle"
        className={cn(
          'text-sm md:text-base font-medium cursor-pointer transition-colors',
          !isDoctors ? 'text-brand-dark-blue' : 'text-gray-500'
        )}
      >
        For Patients
      </Label>
      <Switch
        id="audience-toggle"
        checked={isDoctors}
        onCheckedChange={(checked) => onAudienceChange(checked ? 'doctors' : 'patients')}
        className="data-[state=checked]:bg-brand-teal data-[state=unchecked]:bg-gray-300"
        aria-label="Toggle between patient and doctor view"
      />
      <Label
        htmlFor="audience-toggle"
        className={cn(
          'text-sm md:text-base font-medium cursor-pointer transition-colors',
          isDoctors ? 'text-brand-dark-blue' : 'text-gray-500'
        )}
      >
        For Doctors
      </Label>
    </div>
  );
}
