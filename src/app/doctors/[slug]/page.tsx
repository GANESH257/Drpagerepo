import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { doctors } from '@/data/doctors';
import { DoctorProfile } from '@/components/DoctorProfile';
import { Doctor } from '@/types';

export function generateStaticParams() {
  return doctors.map((doctor) => ({
    slug: doctor.slug,
  }));
}

interface PageProps {
  params: {
    slug: string;
  };
}

export default function DoctorProfilePage({ params }: PageProps) {
  const doctor = doctors.find((d) => d.slug === params.slug);

  if (!doctor) {
    notFound();
  }

  return <DoctorProfile doctor={doctor} />;
}
