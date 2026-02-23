'use client';

import { DashboardZones } from '@/components/dashboard/DashboardZones';
import { useDoctorContext } from '@/components/dashboard/DoctorContext';

export default function DoctorDashboardPage() {
  const { doctor } = useDoctorContext();

  return <DashboardZones doctor={doctor} />;
}
