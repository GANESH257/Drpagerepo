'use client';

import { MembershipSection } from '@/components/dashboard/MembershipSection';
import { useDoctorContext } from '@/components/dashboard/DoctorContext';

export default function MembershipPage() {
  const { doctor } = useDoctorContext();

  return <MembershipSection doctorId={doctor.id} />;
}
