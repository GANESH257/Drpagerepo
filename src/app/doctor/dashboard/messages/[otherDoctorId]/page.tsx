import { MessagesSectionWrapper } from '@/components/dashboard/MessagesSectionWrapper';
import { doctors } from '@/data/doctors';

export function generateStaticParams() {
  const params = doctors.map((doctor) => ({
    otherDoctorId: doctor.id,
  }));

  // Add admin to static params to support messaging the admin
  params.push({ otherDoctorId: 'admin' });

  return params;
}

export default async function MessagesWithDoctorPage({
  params,
}: {
  params: Promise<{ otherDoctorId: string }>;
}) {
  const { otherDoctorId } = await params;
  return <MessagesSectionWrapper otherDoctorId={otherDoctorId} />;
}
