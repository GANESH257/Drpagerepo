import { MessagesSectionWrapper } from '@/components/dashboard/MessagesSectionWrapper';
import { doctors } from '@/data/doctors';

export function generateStaticParams() {
  return doctors.map((doctor) => ({
    otherDoctorId: doctor.id,
  }));
}

export default async function MessagesWithDoctorPage({
  params,
}: {
  params: Promise<{ otherDoctorId: string }>;
}) {
  const { otherDoctorId } = await params;
  return <MessagesSectionWrapper otherDoctorId={otherDoctorId} />;
}
