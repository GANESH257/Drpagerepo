'use client';

import { useCallback } from 'react';
import { Doctor } from '@/types';
import { InsuranceSection } from '@/components/dashboard/InsuranceSection';
import { useDoctorContext } from '@/components/dashboard/DoctorContext';

export default function InsurancePage() {
  const { doctor, updateDoctor } = useDoctorContext();

  const handleProfileUpdate = useCallback((updatedDoctor: Doctor) => {
    updateDoctor(updatedDoctor);
  }, [updateDoctor]);

  return <InsuranceSection doctor={doctor} onProfileUpdate={handleProfileUpdate} />;
}
