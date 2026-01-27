'use client';

import { useEffect, useState } from 'react';
import { AppointmentsSection } from '@/components/dashboard/AppointmentsSection';
import { useDoctorContext } from '@/components/dashboard/DoctorContext';
import { Doctor } from '@/types';

export default function AppointmentsPage() {
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  
  try {
    const context = useDoctorContext();
    useEffect(() => {
      setDoctor(context.doctor);
    }, [context.doctor]);
  } catch {
    // Context not available during static export
  }

  if (!doctor) {
    return null; // Will be handled by layout
  }

  return <AppointmentsSection doctorId={doctor.id} />;
}
