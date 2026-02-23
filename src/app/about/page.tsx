import type { Metadata } from 'next';
import Link from 'next/link';
import { MissionStatementNewHome } from '@/components/newhome/MissionStatementNewHome';
import { LeadershipSection } from '@/components/about/LeadershipSection';
import { BoardMemberGrid } from '@/components/trustee-board/BoardMemberGrid';
import { DepartmentsMarquee } from '@/components/DepartmentsMarquee';
import { GenericCTASection } from '@/components/GenericCTASection';
import { FAQSection } from '@/components/FAQSection';
import { FileText } from 'lucide-react';

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
      
      {/* ByLaw Link Section */}
      <section className="py-12 md:py-16 bg-gray-50">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-4xl mx-auto text-center">
            <Link
              href="/policies/governance-bylaws.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 px-6 py-3 bg-brand-dark-blue text-white rounded-lg hover:bg-brand-dark-blue/90 transition-colors duration-300 shadow-md hover:shadow-lg"
            >
              <FileText className="h-5 w-5" aria-hidden="true" />
              <span className="font-semibold">View Governance Bylaws</span>
            </Link>
          </div>
        </div>
      </section>

      <LeadershipSection />
      <BoardMemberGrid />
      <DepartmentsMarquee />
      <GenericCTASection />
      <FAQSection />
    </>
  );
}
