'use client';

import { OverviewSection } from '@/components/dashboard/OverviewSection';
import { useDoctorContext } from '@/components/dashboard/DoctorContext';

export default function DoctorDashboardPage() {
  const { doctor } = useDoctorContext();

  return <OverviewSection doctor={doctor} />;
}
