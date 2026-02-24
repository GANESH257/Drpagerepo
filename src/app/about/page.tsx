import type { Metadata } from 'next';
import { AboutHeroSection } from '@/components/about/AboutHeroSection';
import { MissionStatementNewHome } from '@/components/newhome/MissionStatementNewHome';
import { BoardMemberGrid } from '@/components/trustee-board/BoardMemberGrid';
import { DepartmentsMarquee } from '@/components/DepartmentsMarquee';
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
      {/* About Us hero – founding story */}
      <AboutHeroSection />
      {/* Our Mission section */}
      <MissionStatementNewHome />
      
      <BoardMemberGrid />
      <DepartmentsMarquee />
      <GenericCTASection />
      <FAQSection />
    </>
  );
}
