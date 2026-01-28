'use client';

import { useCallback } from 'react';
import { EditProfileSection } from '@/components/dashboard/EditProfileSection';
import { useDoctorContext } from '@/components/dashboard/DoctorContext';
import { Doctor } from '@/types';

export default function ProfilePage() {
  const { doctor, updateDoctor } = useDoctorContext();

  const handleProfileUpdate = useCallback((updatedDoctor: Doctor) => {
    updateDoctor(updatedDoctor);
  }, [updateDoctor]);

  return <EditProfileSection doctor={doctor} onProfileUpdate={handleProfileUpdate} />;
}
