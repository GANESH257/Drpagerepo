'use client';

import { TrusteeBoardHero } from '@/components/trustee-board/TrusteeBoardHero';
import { TrusteeBoardHelperNav } from '@/components/trustee-board/TrusteeBoardHelperNav';
import { BoardMemberGrid } from '@/components/trustee-board/BoardMemberGrid';
import { NextMeetingCard } from '@/components/trustee-board/NextMeetingCard';
import { AnnouncementsSection } from '@/components/trustee-board/AnnouncementsSection';
import { PoliciesSection } from '@/components/trustee-board/PoliciesSection';
import { GovernanceMetrics } from '@/components/trustee-board/GovernanceMetrics';
import { GenericCTASection } from '@/components/GenericCTASection';

export default function TrusteeBoardPage() {
  return (
    <div className="min-h-screen">
      <div className="pt-24">
        <TrusteeBoardHero />
        <TrusteeBoardHelperNav />
        <GovernanceMetrics />
        <BoardMemberGrid />
        <GenericCTASection />
        <NextMeetingCard />
        <AnnouncementsSection />
        <PoliciesSection />
      </div>
    </div>
  );
}
