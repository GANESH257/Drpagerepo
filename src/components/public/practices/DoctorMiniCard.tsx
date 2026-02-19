import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { Doctor } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { GraduationCap, Shield } from 'lucide-react';

interface DoctorMiniCardProps {
  doctor: Doctor;
}

export function DoctorMiniCard({ doctor }: DoctorMiniCardProps) {
  const [imageError, setImageError] = useState(false);

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

  return (
    <Card className="h-full hover:shadow-md transition-shadow group">
      <CardContent className="p-4">
        <Link href={`/doctors/${doctor.slug}`} className="flex gap-4 items-start">
          {/* Doctor Image - Compact */}
          <div className="relative w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0 rounded-full overflow-hidden bg-gray-100">
            <Image
              src={imageError ? fallbackImageUrl : imageUrl}
              alt={doctor.fullName}
              fill
              className="object-cover object-center"
              unoptimized
              onError={() => setImageError(true)}
            />
          </div>

          {/* Doctor Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 group-hover:text-brand-teal transition-colors break-words">
                  {doctor.fullName}
                </h3>
                {doctor.credentials && (
                  <p className="text-sm text-gray-600 mt-0.5">{doctor.credentials}</p>
                )}
              </div>
              {doctor.roleInPractice === 'practice_admin' && (
                <Badge variant="secondary" className="flex-shrink-0 text-xs">
                  <Shield className="h-3 w-3 mr-1" />
                  Admin
                </Badge>
              )}
            </div>

            {/* Specialty */}
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="outline" className="text-xs">
                <GraduationCap className="h-3 w-3 mr-1" />
                {doctor.specialty}
              </Badge>
            </div>

            {/* Contact Note for Public */}
            <p className="text-xs text-gray-500 mt-2 italic">
              Contact via practice
            </p>
          </div>
        </Link>
      </CardContent>
    </Card>
  );
}
