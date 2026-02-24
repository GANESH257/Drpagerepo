import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface SectionHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
  /** Use teal accent (left border) for Practice Management sections */
  variant?: 'default' | 'practice';
}

export function SectionHeader({ title, description, actions, className, variant = 'default' }: SectionHeaderProps) {
  return (
    <div className={cn('flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4', className)}>
      <div>
        <h2
          className={cn(
            'text-2xl font-bold text-foreground',
            variant === 'practice' && 'border-l-4 border-[var(--aip-teal)] pl-4'
          )}
        >
          {title}
        </h2>
        {description && (
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        )}
      </div>
      {actions && (
        <div className="flex items-center gap-2">{actions}</div>
      )}
    </div>
  );
}
