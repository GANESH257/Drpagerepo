'use client';

import { useCallback } from 'react';
import { EditProfileSection } from '@/components/dashboard/EditProfileSection';
import { InsuranceSection } from '@/components/dashboard/InsuranceSection';
import { useDoctorContext } from '@/components/dashboard/DoctorContext';
import { Doctor } from '@/types';
import { Separator } from '@/components/ui/separator';

export default function ProfilePage() {
  const { doctor, updateDoctor } = useDoctorContext();
  const isPending = doctor.profileStatus === 'pending_profile' || doctor.verified !== true;

  const handleProfileUpdate = useCallback((updatedDoctor: Doctor) => {
    updateDoctor(updatedDoctor);
  }, [updateDoctor]);

  if (isPending) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Edit your profile</h1>
          <p className="text-muted-foreground mt-1 text-sm">Add your details, services, and insurance. Save your changes, then submit for approval from the dashboard.</p>
        </div>
        <EditProfileSection doctor={doctor} onProfileUpdate={handleProfileUpdate} />
        <Separator className="my-6" />
        <div>
          <h2 className="text-lg font-semibold text-foreground">Services & insurance</h2>
          <p className="text-muted-foreground mt-0.5 text-sm">Conditions treated, procedures, and accepted insurance.</p>
        </div>
        <InsuranceSection doctor={doctor} onProfileUpdate={handleProfileUpdate} />
      </div>
    );
  }

  return <EditProfileSection doctor={doctor} onProfileUpdate={handleProfileUpdate} />;
}
