import { notFound } from 'next/navigation';
import { doctors } from '@/data/doctors';
import { DoctorProfile } from '@/components/DoctorProfile';
import { getDoctorBySlug } from '@/lib/api/doctors';

export function generateStaticParams() {
  return doctors.map((doctor) => ({
    slug: doctor.slug,
  }));
}

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function DoctorProfilePage({ params }: PageProps) {
  const { slug } = await params;
  let doctor = doctors.find((d) => d.slug === slug);

  if (!doctor) {
    try {
      doctor = await getDoctorBySlug(slug);
    } catch {
      notFound();
    }
  }

  return <DoctorProfile doctor={doctor} />;
}
