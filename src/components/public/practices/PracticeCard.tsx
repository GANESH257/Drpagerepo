import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { Practice } from '@/types/practice';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Users, Building2, Navigation } from 'lucide-react';

/** Build view URL for a practice (static page; no dynamic [slug] route) */
function getPracticeViewUrl(practice: Practice): string {
  const slug = practice.slug || practice.id;
  return `/practices/view?slug=${encodeURIComponent(slug)}`;
}

interface PracticeCardProps {
  practice: Practice;
  doctorCount?: number; // Optional doctor count (will be computed if not provided)
  distanceMiles?: number; // Distance from origin in miles
  originLabel?: string; // Label for origin (e.g., "63101" or "your location")
  derivedSpecialties?: string[]; // Optional derived specialties from doctor roster
}

export function PracticeCard({ practice, doctorCount, distanceMiles, originLabel, derivedSpecialties }: PracticeCardProps) {
  const [imageError, setImageError] = useState(false);

  const hasImage = !!(practice.logo || (practice.images && practice.images.length > 0));
  const imageUrl = practice.logo || (practice.images && practice.images[0]) || '';
  const viewUrl = getPracticeViewUrl(practice);

  const specialtiesToDisplay = derivedSpecialties || practice.specialties || [];
  const displaySpecialties = specialtiesToDisplay.slice(0, 3);
  const remainingSpecialtyCount = specialtiesToDisplay.length - 3;
  const count = doctorCount ?? (practice.doctorIds?.length ?? 0);

  return (
    <Card className="h-full card-vibrant focus-ring group flex flex-col hover:shadow-lg transition-shadow">
      <CardHeader className="p-0 flex flex-col flex-1 min-h-0">
        {/* Practice image only when from DB/API; otherwise simple placeholder */}
        <div className="relative w-full h-56 sm:h-64 md:h-60 bg-gray-100 overflow-hidden rounded-t-xl flex-shrink-0 flex items-center justify-center">
          {hasImage && !imageError ? (
            <Image
              src={imageUrl}
              alt={practice.name}
              fill
              className="object-cover object-center group-hover:scale-110 transition-transform duration-500"
              unoptimized
              onError={() => setImageError(true)}
            />
          ) : (
            <Building2 className="h-20 w-20 text-gray-300" aria-hidden />
          )}
        </div>
        <div className="p-6 pb-4 flex flex-col min-h-[100px]">
          <div className="flex items-start justify-between gap-3 flex-shrink-0">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-xl group-hover:text-brand-teal transition-colors break-words">
                <Link href={viewUrl} className="focus-ring rounded-md px-1 -ml-1">
                  {practice.name}
                </Link>
              </CardTitle>
              <CardDescription className="mt-1 text-base break-words">
                {practice.locations && practice.locations.length > 1 ? (
                  <span>{practice.locations.length} Locations</span>
                ) : (
                  <span>{[practice.address?.city ?? (practice as any).city, practice.address?.state ?? (practice as any).state, practice.address?.zip ?? (practice as any).zip].filter(Boolean).join(', ')}</span>
                )}
              </CardDescription>
              {distanceMiles !== undefined && originLabel && (
                <div className="mt-1 flex items-center text-sm text-brand-teal font-medium">
                  <Navigation className="h-3 w-3 mr-1" />
                  {distanceMiles.toFixed(1)} mi from {originLabel}
                </div>
              )}
            </div>
            <Badge 
              variant="vibrant" 
              className="ml-2 flex-shrink-0"
            >
              <Users className="h-3 w-3 mr-1" />
              {count} {count === 1 ? 'doctor' : 'doctors'}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6 pt-0 flex-shrink-0 flex flex-col">
        <div className="space-y-2 mb-4 flex-shrink-0">
          <div className="flex items-center text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 mr-2" />
            {practice.address?.line1 ?? (practice as any).address_line1 ?? ''}
            {(practice.address?.line2 ?? (practice as any).address_line2) && `, ${practice.address?.line2 ?? (practice as any).address_line2}`}
          </div>
          {practice.phone && (
            <div className="flex items-center text-sm text-muted-foreground">
              <span className="mr-2">📞</span>
              {practice.phone}
            </div>
          )}
        </div>

        {specialtiesToDisplay.length > 0 && (
          <div className="mb-4 flex-shrink-0">
            <p className="text-xs text-muted-foreground mb-1">Specialties:</p>
            <div className="flex flex-wrap gap-1">
              {displaySpecialties.map((specialty) => (
                <Badge key={specialty} variant="outline" className="text-xs">
                  {specialty}
                </Badge>
              ))}
              {remainingSpecialtyCount > 0 && (
                <Badge variant="outline" className="text-xs">
                  +{remainingSpecialtyCount} more
                </Badge>
              )}
            </div>
          </div>
        )}

        {practice.insurance && practice.insurance.length > 0 && (
          <div className="mb-4 flex-shrink-0">
            <p className="text-xs text-muted-foreground mb-1">
              Accepts {practice.insurance.length} {practice.insurance.length === 1 ? 'insurance' : 'insurances'}
            </p>
          </div>
        )}

        <div className="mt-auto">
          <Button 
            asChild 
            variant="gradient"
            className="w-full"
          >
            <Link href={viewUrl}>View Practice</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
