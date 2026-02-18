import { NewHomeHeroDocumented } from '@/components/newhome/NewHomeHeroDocumented';
import { AudienceSwitchFloating } from '@/components/newhome/AudienceSwitchFloating';
import { SearchSection } from '@/components/newhome/SearchSection';
import { MissionStatementDark } from '@/components/newhome/MissionStatementDark';
import { CertificateMarquee } from '@/components/CertificateMarquee';
import { WhatWeDoSection } from '@/components/WhatWeDoSection';
import { GenericCTASection } from '@/components/GenericCTASection';
import { TopSearchedSpecialties } from '@/components/newhome/TopSearchedSpecialties';
import { ResourcesSection } from '@/components/shared/ResourcesSection';
import { FAQSection } from '@/components/FAQSection';

export default function HomeDarkPage() {
  return (
    <>
      <NewHomeHeroDocumented 
        subheadline="A trusted network connecting independent physicians and the communities they serve."
        videoSource="/Backgroundnewvid.mp4"
        darkOverlay={true}
      />
      <AudienceSwitchFloating />
      <SearchSection />
      <MissionStatementDark />
      <CertificateMarquee />
      <WhatWeDoSection />
      <GenericCTASection />
      <TopSearchedSpecialties />
      <ResourcesSection />
      <FAQSection />
    </>
  );
}
