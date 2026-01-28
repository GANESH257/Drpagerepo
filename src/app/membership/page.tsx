'use client';

import { MembershipHero } from '@/components/membership/MembershipHero';
import { BenefitsGrid } from '@/components/membership/BenefitsGrid';
import { PlansSection } from '@/components/membership/PlansSection';
import { GenericCTASection } from '@/components/GenericCTASection';
import { PoliciesSection } from '@/components/membership/PoliciesSection';
import { FAQSection } from '@/components/membership/FAQSection';
import { CTASection } from '@/components/membership/CTASection';

export default function MembershipPage() {
  return (
    <main className="min-h-screen">
      <MembershipHero />
      <BenefitsGrid />
      <PlansSection />
      <GenericCTASection />
      <PoliciesSection />
      <FAQSection />
      <CTASection />
    </main>
  );
}
