'use client';

import { AppointmentsSection } from '@/components/dashboard/AppointmentsSection';
import { useDoctorContext } from '@/components/dashboard/DoctorContext';

export default function AppointmentsPage() {
  const { doctor } = useDoctorContext();

  if (!doctor?.id) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="animate-spin rounded-full h-10 w-10 border-[var(--aip-teal)]" />
      </div>
    );
  }

  return <AppointmentsSection doctorId={doctor.id} />;
}
