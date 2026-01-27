'use client';

import { ReferralsSection } from '@/components/dashboard/ReferralsSection';
import { useDoctorContext } from '@/components/dashboard/DoctorContext';

export default function ReferralsPage() {
  const { doctor } = useDoctorContext();

  return <ReferralsSection doctorId={doctor.id} />;
}
