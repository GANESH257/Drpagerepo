'use client';

import { useSearchParams } from 'next/navigation';
import { MessagesSectionWrapper } from '@/components/dashboard/MessagesSectionWrapper';

export default function MessagesPage() {
  const searchParams = useSearchParams();
  const otherDoctorId = searchParams.get('otherDoctorId') ?? undefined;
  return <MessagesSectionWrapper otherDoctorId={otherDoctorId} />;
}
