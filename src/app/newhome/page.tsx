import { NewHomeHeroDocumented } from '@/components/newhome/NewHomeHeroDocumented';
import { AudienceSwitchFloating } from '@/components/newhome/AudienceSwitchFloating';
import { HomeSections } from '@/components/home/HomeSections';

export default function NewHomePage() {
  return (
    <>
      <NewHomeHeroDocumented 
        subheadline="A trusted network connecting independent physicians and the communities they serve."
      />
      <AudienceSwitchFloating />
      <HomeSections />
    </>
  );
}
