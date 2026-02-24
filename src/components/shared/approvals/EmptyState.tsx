import { ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: ReactNode;
  icon?: ReactNode;
  className?: string;
}

export function EmptyState({ title, description, action, icon, className }: EmptyStateProps) {
  return (
    <Card className={cn(className)}>
      <CardContent className="flex flex-col items-center justify-center py-12">
        {icon && <div className="mb-4 text-gray-400">{icon}</div>}
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
        {description && (
          <p className="text-sm text-gray-600 text-center mb-4 max-w-md">
            {description}
          </p>
        )}
        {action && <div>{action}</div>}
      </CardContent>
    </Card>
  );
}
