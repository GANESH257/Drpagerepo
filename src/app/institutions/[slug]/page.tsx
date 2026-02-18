import { notFound } from 'next/navigation';
import { institutions } from '@/data/institutions';
import { InstitutionDetailClient } from '@/components/InstitutionDetailClient';

export function generateStaticParams() {
  return institutions.map((institution) => ({
    slug: institution.slug,
  }));
}

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function InstitutionDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const institution = institutions.find((i) => i.slug === slug);

  if (!institution) {
    notFound();
  }

  return <InstitutionDetailClient slug={slug} />;
}
