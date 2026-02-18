import { NewHomeHeroDocumented } from '@/components/newhome/NewHomeHeroDocumented';
import { AudienceSwitchFloating } from '@/components/newhome/AudienceSwitchFloating';

export default function HomePage() {
  return (
    <>
      <NewHomeHeroDocumented 
        subheadline="A trusted network connecting independent physicians and the communities they serve."
      />
      <AudienceSwitchFloating />
    </>
  );
}
