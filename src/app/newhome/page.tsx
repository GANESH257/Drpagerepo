import { NewHomeHeroDocumented } from '@/components/newhome/NewHomeHeroDocumented';
import { SearchSection } from '@/components/newhome/SearchSection';
import { MissionStatementNewHome } from '@/components/newhome/MissionStatementNewHome';
import { WhatWeDoSection } from '@/components/WhatWeDoSection';
import { DepartmentsSection } from '@/components/DepartmentsSection';
import { MemberBenefitsSection } from '@/components/MemberBenefitsSection';
import { HowItWorksSection } from '@/components/HowItWorksSection';
import { CertificateMarquee } from '@/components/CertificateMarquee';
import { GenericCTASection } from '@/components/GenericCTASection';
import { InsuranceProvidersSection } from '@/components/InsuranceProvidersSection';
import { LatestNewsPreviewSection } from '@/components/LatestNewsPreviewSection';
import { LatestArticlesPreviewSection } from '@/components/LatestArticlesPreviewSection';
import { FeaturedDoctorsSection } from '@/components/FeaturedDoctorsSection';
import { CommunityCommentsSection } from '@/components/CommunityCommentsSection';
import { GlobalMedicalEventsSection } from '@/components/GlobalMedicalEventsSection';
import { FAQSection } from '@/components/FAQSection';

export default function NewHomePage() {
  return (
    <>
      <NewHomeHeroDocumented />
      <CertificateMarquee />
      <SearchSection />
      <MissionStatementNewHome />
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
