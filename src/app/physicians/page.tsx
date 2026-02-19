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
      <JoinSteps />
      <MemberBenefitsSection />
      <DepartmentsMarquee />
      <QuickAccessCTA />
      <ImpactStats />
      <MemberStories />
      <PracticeResources />
    </>
  );
}
