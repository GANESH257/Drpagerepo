import { notFound } from 'next/navigation';
import { practices as seedPractices } from '@/data/practices';
import { PracticeProfileClient } from '@/components/public/practices/PracticeProfileClient';

/**
 * Generate static params for all practice slugs
 * Required for static export with dynamic routes
 */
export function generateStaticParams() {
  // Use seed practices for static generation (build-time)
  // Created practices will be handled at runtime
  return seedPractices.map((practice) => ({
    slug: practice.slug,
  }));
}

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function PracticeProfilePage({ params }: PageProps) {
  const { slug } = await params;
  
  // Verify practice exists (for build-time validation)
  const practice = seedPractices.find((p) => p.slug === slug);
  
  if (!practice) {
    // For runtime-created practices, let client component handle it
    // This allows created practices to work even if not in seed data
    return <PracticeProfileClient slug={slug} />;
  }

  return <PracticeProfileClient slug={slug} />;
}
