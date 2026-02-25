import { NewHomeHeroDocumented } from '@/components/newhome/NewHomeHeroDocumented';
import { MissionStatementDark } from '@/components/newhome/MissionStatementDark';
import { AudienceSwitchFloating } from '@/components/newhome/AudienceSwitchFloating';

export default function HomeDarkPage() {
  return (
    <>
      <NewHomeHeroDocumented 
        subheadline="A trusted network connecting independent physicians and the communities they serve."
        darkOverlay={true}
      />
      <MissionStatementDark />
      {/* <AudienceSwitchFloating /> */}
    </>
  );
}
