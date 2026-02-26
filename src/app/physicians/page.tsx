import type { Metadata } from 'next';
import { PhysiciansHero } from '@/components/physicians/PhysiciansHero';
import { BenefitsJumbledGrid } from '@/components/physicians/BenefitsJumbledGrid';
import { MissionStatementNewHome } from '@/components/newhome/MissionStatementNewHome';
import { JoinSteps } from '@/components/physicians/JoinSteps';
import { GenericCTASection } from '@/components/GenericCTASection';
import { MemberBenefitsSection } from '@/components/shared/MemberBenefitsSection';
import { WhoShouldJoin } from '@/components/physicians/WhoShouldJoin';
import { QuickAccessCTA } from '@/components/physicians/QuickAccessCTA';
import { DepartmentsMarquee } from '@/components/DepartmentsMarquee';
import { ImpactStats } from '@/components/physicians/ImpactStats';
// MemberStories and PracticeResources hidden for now – content not ready yet
// import { MemberStories } from '@/components/physicians/MemberStories';
// import { PracticeResources } from '@/components/physicians/PracticeResources';
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
      <ImpactStats />
      <JoinSteps />
      <GenericCTASection hideRightPanel />
      <MemberBenefitsSection />
      <WhoShouldJoin />
      <DepartmentsMarquee />
      <QuickAccessCTA />
      {/* MemberStories and PracticeResources hidden until content is ready */}
      <FAQSection
        faqData={membershipFAQ}
        title="Frequently Asked Questions"
        description="Find answers about eligibility, governance, the application process, and what joining AIP means for your practice."
        pillLabel="For Physicians"
      />
    </>
  );
}
