'use client';

import { useSearchParams } from 'next/navigation';
import { MessagesSectionWrapper } from '@/components/dashboard/MessagesSectionWrapper';

export default function MessagesPage() {
  const searchParams = useSearchParams();
  const threadId = searchParams.get('threadId') ?? undefined;
  const otherDoctorId = searchParams.get('otherDoctorId') ?? undefined;
  return <MessagesSectionWrapper threadId={threadId} otherDoctorId={otherDoctorId} />;
}
