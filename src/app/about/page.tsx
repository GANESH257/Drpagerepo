import type { Metadata } from 'next';
import { MissionStatementNewHome } from '@/components/newhome/MissionStatementNewHome';
import { DepartmentsMarquee } from '@/components/DepartmentsMarquee';
import { WhatWeDoSection } from '@/components/WhatWeDoSection';
import { GenericCTASection } from '@/components/GenericCTASection';
import { FAQSection } from '@/components/FAQSection';

export const metadata: Metadata = {
  title: 'About Us - Alliance of Independent Physicians',
  description:
    'Learn about our mission to empower the community by connecting patients with Independent Physicians who provide accessible, affordable, and high-quality healthcare.',
  openGraph: {
    title: 'About Us - Alliance of Independent Physicians',
    description:
      'Learn about our mission to empower the community by connecting patients with Independent Physicians.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About Us - Alliance of Independent Physicians',
    description:
      'Learn about our mission to empower the community by connecting patients with Independent Physicians.',
  },
};

export default function AboutPage() {
  return (
    <>
      {/* Mission section MUST be first */}
      <MissionStatementNewHome />
      <DepartmentsMarquee />
      <WhatWeDoSection />
      <GenericCTASection />
      <FAQSection />
    </>
  );
}
