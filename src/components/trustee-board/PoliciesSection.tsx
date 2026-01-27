'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { PolicyCard } from './PolicyCard';
import { trusteePolicies } from '@/data/trusteePolicies';
import { Shield } from 'lucide-react';

export function PoliciesSection() {
  // Group policies by category
  const policiesByCategory = {
    Governance: trusteePolicies.filter((p) => p.category === 'Governance'),
    Compliance: trusteePolicies.filter((p) => p.category === 'Compliance'),
    Operations: trusteePolicies.filter((p) => p.category === 'Operations'),
  };

  return (
    <section id="policies" className="py-16 md:py-24 relative bg-gradient-to-b from-white to-teal-50">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-brand-teal/10 mb-4">
            <Shield className="h-8 w-8 text-brand-teal" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-brand-dark-blue">
            Policies & Governance
          </h2>
          <p className="text-lg text-gray-700 max-w-2xl mx-auto">
            Our governance policies ensure transparency, accountability, and the highest standards of professional conduct.
          </p>
        </div>

        {/* Intro Paragraph */}
        <div className="max-w-3xl mx-auto mb-12">
          <p className="text-base text-gray-700 leading-relaxed text-center">
            The Board of Trustees maintains comprehensive policies and procedures to guide the organization's operations, ensure compliance with regulations, and uphold our commitment to excellence in healthcare delivery.
          </p>
        </div>

        {/* Policies Accordion */}
        <div className="max-w-6xl mx-auto">
          <Accordion type="single" collapsible className="w-full space-y-4">
            {Object.entries(policiesByCategory).map(([category, policies]) => (
              <AccordionItem
                key={category}
                value={category}
                className="border border-gray-200 rounded-lg px-6 bg-white"
              >
                <AccordionTrigger className="text-xl font-semibold text-brand-dark-blue hover:no-underline">
                  {category} ({policies.length})
                </AccordionTrigger>
                <AccordionContent className="pt-4 pb-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {policies.map((policy) => (
                      <PolicyCard key={policy.id} policy={policy} />
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        {/* Note */}
        <div className="max-w-3xl mx-auto mt-12">
          <p className="text-sm text-gray-600 text-center">
            <strong>Note:</strong> All policies are reviewed and updated regularly. For questions about specific policies, please contact the board secretary.
          </p>
        </div>
      </div>
    </section>
  );
}
