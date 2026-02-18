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
  params: Promise<{
    slug: string;
  }>;
}

export default async function DoctorProfilePage({ params }: PageProps) {
  const { slug } = await params;
  const doctor = doctors.find((d) => d.slug === slug);

  if (!doctor) {
    notFound();
  }

  return <DoctorProfile doctor={doctor} />;
}
