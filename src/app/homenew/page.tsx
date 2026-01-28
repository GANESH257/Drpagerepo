import { Suspense } from 'react';
import { NewHomeHero } from '@/components/newhome/NewHomeHero';
import { MissionStatement } from '@/components/MissionStatement';
import { WhatWeDoSection } from '@/components/WhatWeDoSection';
import { DepartmentsSection } from '@/components/DepartmentsSection';
import { MemberBenefitsSection } from '@/components/MemberBenefitsSection';
import { HowItWorksSection } from '@/components/HowItWorksSection';
import { CertificateMarquee } from '@/components/CertificateMarquee';
import { GenericCTASection } from '@/components/GenericCTASection';
import { LatestNewsPreviewSection } from '@/components/LatestNewsPreviewSection';
import { LatestArticlesPreviewSection } from '@/components/LatestArticlesPreviewSection';
import { InsuranceProvidersSection } from '@/components/InsuranceProvidersSection';
import { FeaturedDoctorsSection } from '@/components/FeaturedDoctorsSection';
import { CommunityCommentsSection } from '@/components/CommunityCommentsSection';
import { GlobalMedicalEventsSection } from '@/components/GlobalMedicalEventsSection';
import { FAQSection } from '@/components/FAQSection';

function HomePageContent() {
  return (
    <>
      <NewHomeHero />
      <CertificateMarquee />
      <MissionStatement />
      <WhatWeDoSection />
      <MemberBenefitsSection />
      <HowItWorksSection />
      <GenericCTASection />
      <DepartmentsSection />
      <InsuranceProvidersSection />
      <LatestNewsPreviewSection />
      <LatestArticlesPreviewSection />
      <FeaturedDoctorsSection />
      <CommunityCommentsSection />
      <GlobalMedicalEventsSection />
      <FAQSection />
    </>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-teal mx-auto mb-4"></div>
          <p className="text-brand-dark-blue text-lg">Loading...</p>
        </div>
      </div>
    }>
      <HomePageContent />
    </Suspense>
  );
}
