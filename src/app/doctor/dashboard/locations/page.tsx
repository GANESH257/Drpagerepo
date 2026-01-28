'use client';

import { useCallback } from 'react';
import { Doctor } from '@/types';
import { LocationsSection } from '@/components/dashboard/LocationsSection';
import { useDoctorContext } from '@/components/dashboard/DoctorContext';

export default function LocationsPage() {
  const { doctor, updateDoctor } = useDoctorContext();

  const handleProfileUpdate = useCallback((updatedDoctor: Doctor) => {
    updateDoctor(updatedDoctor);
  }, [updateDoctor]);

  return <LocationsSection doctor={doctor} onProfileUpdate={handleProfileUpdate} />;
}
