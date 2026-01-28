'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { membershipFAQ } from '@/data/membershipFAQ';

export function FAQSection() {
  return (
    <section id="faq" className="py-16 md:py-24 relative overflow-hidden bg-gradient-to-br from-teal-50 via-white to-blue-50">
      {/* Enhanced layered gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-brand-teal/10 via-background via-60% to-brand-dark-blue/10" />
      <div className="absolute inset-0 bg-gradient-to-t from-brand-dark-blue/8 via-transparent to-brand-teal/8" />
      {/* Subtle geometric pattern overlay */}
      <div className="absolute inset-0 opacity-[0.03]">
        <div className="absolute top-0 right-0 w-[450px] h-[450px] bg-brand-teal rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[450px] h-[450px] bg-brand-dark-blue rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-brand-teal/40 rounded-full blur-3xl" />
      </div>
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-brand-dark-blue">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-muted-foreground">
              Find answers to common questions about Alliance membership.
            </p>
          </div>

          <Accordion type="single" collapsible className="w-full">
            {membershipFAQ.map((faq, index) => (
              <AccordionItem 
                key={index} 
                value={`item-${index}`}
                className="bg-white/80 backdrop-blur-sm mb-2 rounded-lg px-4 border-2 border-transparent hover:border-brand-teal/20 transition-colors"
              >
                <AccordionTrigger className="text-left text-lg hover:no-underline text-brand-dark-blue">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-base pb-4">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
