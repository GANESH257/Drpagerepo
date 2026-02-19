import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { Doctor } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle2, MapPin, Calendar, Building } from 'lucide-react';
import { getInstitutionById } from '@/lib/institutionStorage';
import { getPracticeById } from '@/lib/services/practiceDirectoryService';

interface DoctorCardProps {
  doctor: Doctor;
  showInstitution?: boolean; // Show institution info when true
}

export function DoctorCard({ doctor, showInstitution = false }: DoctorCardProps) {
  const [imageError, setImageError] = useState(false);
  
  const earliestSlot = doctor.availability
    .filter((slot) => slot.available)
    .sort((a, b) => {
      const dateCompare = a.date.localeCompare(b.date);
      if (dateCompare !== 0) return dateCompare;
      return a.time.localeCompare(b.time);
    })[0];

  // Generate realistic doctor image URL - use consistent seed based on name
  const generateDoctorImage = (doctor: Doctor): string => {
    if (doctor.image) return doctor.image;
    
    // Create a hash from doctor's name for consistent image
    let hash = 0;
    const name = doctor.fullName.toLowerCase();
    for (let i = 0; i < name.length; i++) {
      hash = ((hash << 5) - hash) + name.charCodeAt(i);
      hash = hash & hash; // Convert to 32bit integer
    }
    
    // Use hash to select from professional photo range (0-99)
    const photoId = Math.abs(hash % 100);
    
    // Use a professional medical photo service
    // Using randomuser.me portraits which look more professional and realistic
    const gender = Math.abs(hash) % 2 === 0 ? 'men' : 'women';
    return `https://randomuser.me/api/portraits/${gender}/${photoId}.jpg`;
  };
  
  const imageUrl = generateDoctorImage(doctor);
  const fallbackImageUrl = `https://i.pravatar.cc/300?img=${Math.abs(doctor.id.charCodeAt(0) % 70)}`;

  return (
    <Card className="h-full card-vibrant focus-ring group flex flex-col">
      <CardHeader className="p-0 flex flex-col flex-1 min-h-0">
        {/* Doctor Image */}
        <div className="relative w-full h-56 sm:h-64 md:h-60 bg-gray-100 overflow-hidden rounded-t-xl flex-shrink-0">
          <Image
            src={imageError ? fallbackImageUrl : imageUrl}
            alt={doctor.fullName}
            fill
            className="object-contain object-center group-hover:scale-110 transition-transform duration-500"
            unoptimized
            onError={() => setImageError(true)}
          />
          {doctor.featured && (
            <Badge variant="pulse" className="absolute top-3 right-3 px-2 py-1 text-xs font-semibold">
              Featured
            </Badge>
          )}
        </div>
        <div className="p-6 pb-4 flex flex-col min-h-[100px]">
          <div className="flex items-start justify-between gap-3 flex-shrink-0">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-xl group-hover:text-brand-teal transition-colors break-words">
                <Link href={`/doctors/${doctor.slug}`} className="focus-ring rounded-md px-1 -ml-1">
                  {doctor.fullName}
                </Link>
              </CardTitle>
              <CardDescription className="mt-1 text-base break-words">{doctor.specialty}</CardDescription>
            </div>
            {doctor.verified && (
              <Badge 
                variant="vibrant" 
                className="ml-2 flex-shrink-0"
              >
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Verified
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6 pt-0 flex-shrink-0 flex flex-col">
        <div className="space-y-2 mb-4 flex-shrink-0">
          <div className="flex items-center text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 mr-2" />
            {doctor.locations[0]?.city}, {doctor.locations[0]?.state} {doctor.locations[0]?.zip}
          </div>
          {showInstitution && (() => {
            // Prefer practice link if practiceId exists
            if (doctor.practiceId) {
              const practice = getPracticeById(doctor.practiceId);
              if (practice) {
                return (
                  <div className="flex items-center text-sm text-brand-teal">
                    <Building className="h-4 w-4 mr-2 flex-shrink-0" />
                    <Link 
                      href={`/practices/${practice.slug}`}
                      className="hover:underline font-medium"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {practice.name}
                    </Link>
                  </div>
                );
              }
            }
            // Fallback to institution if no practice
            if (doctor.institutionId) {
              const institution = getInstitutionById(doctor.institutionId);
              if (institution) {
                return (
                  <div className="flex items-center text-sm text-brand-teal">
                    <Building className="h-4 w-4 mr-2 flex-shrink-0" />
                    <Link 
                      href={`/institutions/${institution.slug}`}
                      className="hover:underline font-medium"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {institution.name}
                    </Link>
                  </div>
                );
              }
            }
            return null;
          })()}
          {earliestSlot && (
            <div className="flex items-center text-sm text-muted-foreground">
              <Calendar className="h-4 w-4 mr-2" />
              Earliest: {new Date(earliestSlot.date).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
              })}
            </div>
          )}
        </div>

        {doctor.insurance.length > 0 && (
          <div className="mb-4 flex-shrink-0">
            <p className="text-xs text-muted-foreground mb-1">Accepts:</p>
            <div className="flex flex-wrap gap-1">
              {doctor.insurance.slice(0, 2).map((ins) => (
                <Badge key={ins.slug} variant="outline" className="text-xs">
                  {ins.name}
                </Badge>
              ))}
              {doctor.insurance.length > 2 && (
                <Badge variant="outline" className="text-xs">
                  +{doctor.insurance.length - 2} more
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
            <Link href={`/doctors/${doctor.slug}`}>View Profile</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
