import { CertificateMarquee } from '@/components/CertificateMarquee';
import { SearchSection } from '@/components/newhome/SearchSection';
import { MissionStatementNewHome } from '@/components/newhome/MissionStatementNewHome';
import { WhatWeDoSection } from '@/components/WhatWeDoSection';
import { GenericCTASection } from '@/components/GenericCTASection';
import { TopSearchedSpecialties } from '@/components/newhome/TopSearchedSpecialties';
import { CommunityCommentsSection } from '@/components/CommunityCommentsSection';
import { ResourcesSection } from '@/components/shared/ResourcesSection';
import { FAQSection } from '@/components/FAQSection';

export function HomeSections() {
  return (
    <>
      <SearchSection />
      <MissionStatementNewHome />
      <CertificateMarquee />
      <WhatWeDoSection />
      <GenericCTASection />
      <TopSearchedSpecialties />
      <CommunityCommentsSection />
      <ResourcesSection />
      <FAQSection />
    </>
  );
}
