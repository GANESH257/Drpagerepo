'use client';

import { CertificationItem } from '@/types';
import { getUploadFullUrl } from '@/lib/api/upload';
import { Award } from 'lucide-react';

interface CredentialGridProps {
  items: CertificationItem[];
  title?: string;
  emptyMessage?: string;
}

export function CredentialGrid({ items, title, emptyMessage = 'None added' }: CredentialGridProps) {
  if (!items?.length) {
    return (
      <div className="text-sm text-muted-foreground">
        {title && <p className="font-medium text-foreground mb-1">{title}</p>}
        {emptyMessage}
      </div>
    );
  }

  return (
    <div>
      {title && <p className="font-medium text-foreground mb-2">{title}</p>}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {items.map((item, index) => (
          <div
            key={index}
            className="flex flex-col items-center p-3 rounded-lg border bg-card text-card-foreground shadow-sm"
          >
            {item.imageUrl ? (
              <img
                src={getUploadFullUrl(item.imageUrl)}
                alt={item.name}
                className="w-12 h-12 object-contain rounded mb-2"
              />
            ) : (
              <div className="w-12 h-12 rounded bg-muted flex items-center justify-center mb-2">
                <Award className="h-6 w-6 text-muted-foreground" />
              </div>
            )}
            <span className="text-sm font-medium text-center line-clamp-2">{item.name}</span>
            {item.year && (
              <span className="text-xs text-muted-foreground mt-0.5">{item.year}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
