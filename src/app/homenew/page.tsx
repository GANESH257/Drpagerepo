'use client';

import { useState } from 'react';
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

export default function HomePage() {
  const [audience, setAudience] = useState<'patients' | 'doctors'>('doctors');

  return (
    <>
      <NewHomeHero />
      <CertificateMarquee />
      <MissionStatement audience={audience} onAudienceChange={setAudience} />
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
