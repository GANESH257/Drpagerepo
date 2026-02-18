import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { Institution } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Users, Navigation } from 'lucide-react';

interface InstitutionCardProps {
  institution: Institution;
  distance?: number; // Distance in miles (optional, for radius search)
  showDistance?: boolean;
}

export function InstitutionCard({ institution, distance, showDistance = false }: InstitutionCardProps) {
  const [imageError, setImageError] = useState(false);
  
  // Get top 3 specialties to display
  const displaySpecialties = institution.specialties.slice(0, 3);
  const remainingSpecialtyCount = institution.specialties.length - 3;

  // Generate institution image URL - use better medical/healthcare themed images
  const generateInstitutionImage = (institution: Institution): string => {
    if (institution.logo) return institution.logo;
    if (institution.images && institution.images.length > 0) return institution.images[0];
    
    // Generate consistent image based on institution ID hash
    let hash = 0;
    const id = institution.id.toLowerCase();
    for (let i = 0; i < id.length; i++) {
      hash = ((hash << 5) - hash) + id.charCodeAt(i);
      hash = hash & hash;
    }
    
    // Use medical/healthcare themed images - better quality options
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
    
    // Use hash to select consistent image for each institution
    const imageIndex = Math.abs(hash) % imageOptions.length;
    return imageOptions[imageIndex];
  };
  
  const imageUrl = generateInstitutionImage(institution);
  const fallbackImageUrl = '/bg_art.png';

  return (
    <Card className="h-full card-vibrant focus-ring group flex flex-col">
      <CardHeader className="p-0 flex flex-col flex-1 min-h-0">
        {/* Institution Image/Logo */}
        <div className="relative w-full h-56 sm:h-64 md:h-60 bg-gray-100 overflow-hidden rounded-t-xl flex-shrink-0">
          <Image
            src={imageError ? fallbackImageUrl : imageUrl}
            alt={institution.name}
            fill
            className="object-cover object-center group-hover:scale-110 transition-transform duration-500"
            unoptimized
            onError={() => setImageError(true)}
          />
          {showDistance && distance !== undefined && (
            <Badge 
              variant="pulse" 
              className="absolute top-3 right-3 px-2 py-1 text-xs font-semibold bg-white/90 text-gray-900"
            >
              <Navigation className="h-3 w-3 mr-1" />
              {distance.toFixed(1)} mi
            </Badge>
          )}
        </div>
        <div className="p-6 pb-4 flex flex-col min-h-[100px]">
          <div className="flex items-start justify-between gap-3 flex-shrink-0">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-xl group-hover:text-brand-teal transition-colors break-words">
                <Link href={`/institutions/${institution.slug}`} className="focus-ring rounded-md px-1 -ml-1">
                  {institution.name}
                </Link>
              </CardTitle>
              <CardDescription className="mt-1 text-base break-words">
                {institution.address.city}, {institution.address.state} {institution.address.zip}
              </CardDescription>
            </div>
            <Badge 
              variant="vibrant" 
              className="ml-2 flex-shrink-0"
            >
              <Users className="h-3 w-3 mr-1" />
              {institution.doctorIds.length} {institution.doctorIds.length === 1 ? 'doctor' : 'doctors'}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6 pt-0 flex-shrink-0 flex flex-col">
        <div className="space-y-2 mb-4 flex-shrink-0">
          <div className="flex items-center text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 mr-2" />
            {institution.address.line1}
            {institution.address.line2 && `, ${institution.address.line2}`}
          </div>
          {institution.phone && (
            <div className="flex items-center text-sm text-muted-foreground">
              <span className="mr-2">📞</span>
              {institution.phone}
            </div>
          )}
        </div>

        {institution.specialties.length > 0 && (
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

        <div className="mt-auto">
          <Button 
            asChild 
            variant="gradient"
            className="w-full"
          >
            <Link href={`/institutions/${institution.slug}`}>View Practice</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
