'use client';

import { MapPin, Phone, ExternalLink, Edit, Trash2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Location } from '@/types';

interface LocationCardProps {
  location: Location;
  isPrimary?: boolean;
  onEdit: () => void;
  onDelete: () => void;
  disabled?: boolean;
}

export function LocationCard({
  location,
  isPrimary = false,
  onEdit,
  onDelete,
  disabled = false,
}: LocationCardProps) {
  return (
    <Card className="card-vibrant">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold text-lg">{location.name}</h3>
              {isPrimary && (
                <Badge variant="vibrant">
                  Primary
                </Badge>
              )}
            </div>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
                <div>
                  <div>{location.address}</div>
                  <div>
                    {location.city}, {location.state} {location.zip}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0" />
                <span>{location.phone}</span>
              </div>
              {location.directionsUrl && (
                <a
                  href={location.directionsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-brand-teal hover:underline"
                >
                  <ExternalLink className="h-4 w-4" />
                  <span>Get directions</span>
                </a>
              )}
            </div>
          </div>
          {!disabled && (
            <div className="flex flex-col gap-2 ml-4">
              <Button
                variant="outline"
                size="sm"
                onClick={onEdit}
                aria-label={`Edit ${location.name}`}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onDelete}
                className="text-destructive hover:text-destructive"
                aria-label={`Delete ${location.name}`}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
