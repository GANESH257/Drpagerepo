import type { Metadata } from 'next';
import { PhysiciansHero } from '@/components/physicians/PhysiciansHero';
import { BenefitsJumbledGrid } from '@/components/physicians/BenefitsJumbledGrid';
import { MissionStatementNewHome } from '@/components/newhome/MissionStatementNewHome';
import { JoinSteps } from '@/components/physicians/JoinSteps';
import { MemberBenefitsSection } from '@/components/shared/MemberBenefitsSection';
import { QuickAccessCTA } from '@/components/physicians/QuickAccessCTA';
import { DepartmentsMarquee } from '@/components/DepartmentsMarquee';
import { ImpactStats } from '@/components/physicians/ImpactStats';
import { MemberStories } from '@/components/physicians/MemberStories';
import { PracticeResources } from '@/components/physicians/PracticeResources';
import { FAQSection } from '@/components/FAQSection';
import { membershipFAQ } from '@/data/membershipFAQ';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'For Physicians - Alliance of Independent Physicians',
  description:
    'Join a powerful alliance that gives independent physicians the strength of a health system. Access resources, referrals, visibility, and community.',
  openGraph: {
    title: 'For Physicians - Alliance of Independent Physicians',
    description:
      'Join a powerful alliance that gives independent physicians the strength of a health system.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'For Physicians - Alliance of Independent Physicians',
    description:
      'Join a powerful alliance that gives independent physicians the strength of a health system.',
  },
};

export default function PhysiciansPage() {
  return (
    <>
      <PhysiciansHero />
      <BenefitsJumbledGrid />
      <MissionStatementNewHome />
      <div className="py-8 md:py-12 bg-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center">
            <Link
              href="/policies/governance-bylaws.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-brand-dark-blue hover:text-brand-teal font-semibold text-lg transition-colors duration-200 underline underline-offset-4"
            >
              View Governance Bylaws
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
      <JoinSteps />
      <MemberBenefitsSection />
      <DepartmentsMarquee />
      <QuickAccessCTA />
      <ImpactStats />
      <MemberStories />
      <PracticeResources />
      <FAQSection 
        faqData={membershipFAQ}
        title="Membership Questions"
        description="Find answers to common questions about membership, plans, and benefits."
      />
    </>
  );
}
