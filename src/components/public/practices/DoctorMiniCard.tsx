'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { Doctor } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { GraduationCap, Shield, MapPin, CheckCircle2, Calendar, MessageCircle } from 'lucide-react';
import { useDoctorSession } from '@/lib/useDoctorSession';

interface DoctorMiniCardProps {
  doctor: Doctor;
}

export function DoctorMiniCard({ doctor }: DoctorMiniCardProps) {
  const [imageError, setImageError] = useState(false);
  const { isAuthenticated } = useDoctorSession();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setIsLoggedIn(isAuthenticated());
  }, [isAuthenticated]);

  // Generate doctor image URL
  const generateDoctorImage = (doctor: Doctor): string => {
    if (doctor.image) return doctor.image;
    
    // Create a hash from doctor's name for consistent image
    let hash = 0;
    const name = doctor.fullName.toLowerCase();
    for (let i = 0; i < name.length; i++) {
      hash = ((hash << 5) - hash) + name.charCodeAt(i);
      hash = hash & hash;
    }
    
    const photoId = Math.abs(hash % 100);
    const gender = Math.abs(hash) % 2 === 0 ? 'men' : 'women';
    return `https://randomuser.me/api/portraits/${gender}/${photoId}.jpg`;
  };
  
  const imageUrl = generateDoctorImage(doctor);
  const fallbackImageUrl = `https://i.pravatar.cc/300?img=${Math.abs(doctor.id.charCodeAt(0) % 70)}`;

  // Get earliest available slot
  const earliestSlot = doctor.availability
    ?.filter((slot) => slot.available)
    .sort((a, b) => {
      const dateCompare = a.date.localeCompare(b.date);
      if (dateCompare !== 0) return dateCompare;
      return a.time.localeCompare(b.time);
    })[0];

  // Get specialties array
  const specialties = doctor.specialties || [doctor.specialty];
  const displaySpecialties = specialties.slice(0, 2);
  const remainingSpecialtyCount = specialties.length - 2;

  return (
    <Card className="h-full card-vibrant focus-ring group flex flex-col hover:shadow-lg transition-shadow">
      <CardHeader className="p-0 flex flex-col flex-1 min-h-0">
        {/* Doctor Image */}
        <div className="relative w-full h-48 sm:h-52 bg-gray-100 overflow-hidden rounded-t-xl flex-shrink-0">
          <Image
            src={imageError ? fallbackImageUrl : imageUrl}
            alt={doctor.fullName}
            fill
            className="object-cover object-center group-hover:scale-110 transition-transform duration-500"
            unoptimized
            onError={() => setImageError(true)}
          />
          {doctor.roleInPractice === 'practice_admin' && (
            <Badge variant="vibrant" className="absolute top-3 right-3 px-2 py-1 text-xs font-semibold">
              <Shield className="h-3 w-3 mr-1" />
              Admin
            </Badge>
          )}
          {doctor.verified && (
            <Badge variant="vibrant" className="absolute top-3 left-3 px-2 py-1 text-xs font-semibold">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Verified
            </Badge>
          )}
        </div>
        
        <div className="p-5 pb-3 flex flex-col min-h-[100px]">
          <div className="flex items-start justify-between gap-3 flex-shrink-0">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg font-semibold group-hover:text-brand-teal transition-colors break-words line-clamp-2">
                <Link href={`/doctors/${doctor.slug}`} className="focus-ring rounded-md px-1 -ml-1">
                  {doctor.fullName}
                </Link>
              </CardTitle>
              {doctor.credentials && (
                <CardDescription className="mt-1 text-sm text-muted-foreground">
                  {doctor.credentials}
                </CardDescription>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-5 pt-0 flex-shrink-0 flex flex-col">
        {/* Specialty */}
        {displaySpecialties.length > 0 && (
          <div className="mb-3 flex-shrink-0">
            <div className="flex flex-wrap gap-1.5">
              {displaySpecialties.map((specialty, idx) => (
                <Badge key={idx} variant="outline" className="text-xs">
                  <GraduationCap className="h-3 w-3 mr-1" />
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

        {/* Location */}
        {doctor.locations && doctor.locations.length > 0 && (
          <div className="mb-3 flex-shrink-0">
            <div className="flex items-center text-sm text-muted-foreground">
              <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
              <span className="truncate">
                {doctor.locations[0].city}, {doctor.locations[0].state}
              </span>
            </div>
          </div>
        )}

        {/* Availability */}
        {earliestSlot && (
          <div className="mb-3 flex-shrink-0">
            <div className="flex items-center text-sm text-muted-foreground">
              <Calendar className="h-4 w-4 mr-2 flex-shrink-0" />
              <span>Available: {new Date(earliestSlot.date).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
              })}</span>
            </div>
          </div>
        )}

        {/* Insurance */}
        {doctor.insurance && doctor.insurance.length > 0 && (
          <div className="mb-3 flex-shrink-0">
            <p className="text-xs text-muted-foreground mb-1">Accepts insurance</p>
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

        {/* Action Buttons */}
        <div className="mt-auto pt-2 flex flex-col gap-2">
          {isLoggedIn && (
            <Button 
              asChild 
              variant="outline"
              className="w-full text-sm border-brand-teal text-brand-teal hover:bg-brand-teal hover:text-white"
              size="sm"
            >
              <Link href={`/doctor/dashboard/messages/${doctor.id}`}>
                <MessageCircle className="h-4 w-4 mr-2" />
                Message
              </Link>
            </Button>
          )}
          <Button 
            asChild 
            variant="gradient"
            className="w-full text-sm"
            size="sm"
          >
            <Link href={`/doctors/${doctor.slug}`}>View Profile</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
