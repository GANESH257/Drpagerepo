import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { Practice } from '@/types/practice';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Users, Building2, Navigation } from 'lucide-react';

interface PracticeCardProps {
  practice: Practice;
  doctorCount?: number; // Optional doctor count (will be computed if not provided)
  distanceMiles?: number; // Distance from origin in miles
  originLabel?: string; // Label for origin (e.g., "63101" or "your location")
  derivedSpecialties?: string[]; // Optional derived specialties from doctor roster
}

export function PracticeCard({ practice, doctorCount, distanceMiles, originLabel, derivedSpecialties }: PracticeCardProps) {
  const [imageError, setImageError] = useState(false);
  
  // Use derivedSpecialties if provided, otherwise fallback to practice.specialties
  const specialtiesToDisplay = derivedSpecialties || practice.specialties || [];
  
  // Get top 3 specialties to display
  const displaySpecialties = specialtiesToDisplay.slice(0, 3);
  const remainingSpecialtyCount = specialtiesToDisplay.length - 3;
  
  // Use provided doctorCount or compute from doctorIds
  const count = doctorCount ?? (practice.doctorIds?.length ?? 0);

  // Generate practice image URL
  const generatePracticeImage = (practice: Practice): string => {
    if (practice.logo) return practice.logo;
    if (practice.images && practice.images.length > 0) return practice.images[0];
    
    // Generate consistent image based on practice ID hash
    let hash = 0;
    const id = practice.id.toLowerCase();
    for (let i = 0; i < id.length; i++) {
      hash = ((hash << 5) - hash) + id.charCodeAt(i);
      hash = hash & hash;
    }
    
    // Use medical/healthcare themed images
    const imageOptions = [
      '/bg_art.png',
      '/bgnews.png',
      '/network-bg.jpg',
      '/network-bg2.jpeg',
      '/bg2.jpg',
      '/bg3.jpg',
      '/bg4.jpg',
      '/for_dr.png',
      '/for_dr2.png',
    ];
    
    // Use hash to select consistent image for each practice
    const imageIndex = Math.abs(hash) % imageOptions.length;
    return imageOptions[imageIndex];
  };
  
  const imageUrl = generatePracticeImage(practice);
  const fallbackImageUrl = '/bg_art.png';

  return (
    <Card className="h-full card-vibrant focus-ring group flex flex-col hover:shadow-lg transition-shadow">
      <CardHeader className="p-0 flex flex-col flex-1 min-h-0">
        {/* Practice Image/Logo */}
        <div className="relative w-full h-56 sm:h-64 md:h-60 bg-gray-100 overflow-hidden rounded-t-xl flex-shrink-0">
          <Image
            src={imageError ? fallbackImageUrl : imageUrl}
            alt={practice.name}
            fill
            className="object-cover object-center group-hover:scale-110 transition-transform duration-500"
            unoptimized
            onError={() => setImageError(true)}
          />
        </div>
        <div className="p-6 pb-4 flex flex-col min-h-[100px]">
          <div className="flex items-start justify-between gap-3 flex-shrink-0">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-xl group-hover:text-brand-teal transition-colors break-words">
                <Link href={`/practices/${practice.slug}`} className="focus-ring rounded-md px-1 -ml-1">
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
            className="w-full bg-gradient-to-r from-brand-dark-blue to-brand-teal text-white hover:from-brand-dark-blue/90 hover:to-brand-teal/90 shadow-md hover:shadow-lg transition-all duration-300 focus-ring hover:scale-105 [&_a]:text-white"
          >
            <Link href={`/practices/${practice.slug}`}>View Practice</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
