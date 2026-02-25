'use client';

import { useSearchParams } from 'next/navigation';
import { MessagesSection } from '@/components/dashboard/MessagesSection';
import { Doctor } from '@/types';

interface AdminMessagesWrapperProps {
  otherDoctorId?: string;
}

// Virtual admin Doctor object — id must be 'admin' so Firebase messages
// match the 'admin' senderId that MessagesSection uses for all contacts.
const ADMIN_DOCTOR: Doctor = {
  id: 'admin',
  slug: 'admin',
  firstName: 'Alliance',
  lastName: 'Admin',
  fullName: 'Alliance Admin',
  specialty: 'System Administrator',
  credentials: '',
  bio: '',
  locations: [],
  insurance: [],
  rating: 0,
  reviewCount: 0,
  reviews: [],
  featured: false,
  verified: true,
  availability: [],
  acceptsNewPatients: false,
  conditionServices: [],
};

export function AdminMessagesWrapper({ otherDoctorId: otherDoctorIdProp }: AdminMessagesWrapperProps) {
  const searchParams = useSearchParams();
  // Resolve otherDoctorId from prop or from URL query param
  const otherDoctorId = otherDoctorIdProp ?? searchParams.get('otherDoctorId') ?? undefined;

  return (
    <div className="space-y-6">
      <MessagesSection
        doctor={ADMIN_DOCTOR}
        otherDoctorId={otherDoctorId}
        basePath="/admin/messages"
      />
    </div>
  );
}
