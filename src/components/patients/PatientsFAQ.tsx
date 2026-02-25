'use client';

import { useEffect, useRef, useState } from 'react';
import { Playfair_Display } from 'next/font/google';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { patientFAQ } from '@/data/patientsPage';
import { cn } from '@/lib/utils';

const playfairDisplay = Playfair_Display({
  subsets: ['latin'],
  weight: ['700', '900'],
  display: 'swap',
});

export function PatientsFAQ() {
  const [isVisible, setIsVisible] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      setPrefersReducedMotion(mediaQuery.matches);

      const handleChange = (e: MediaQueryListEvent) => {
        setPrefersReducedMotion(e.matches);
      };

      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="faq"
      className="py-6 md:py-8 relative overflow-hidden skin-paper"
    >
      {/* NOTE (client feedback): 3D animated question-mark shapes background commented out – animation was "too much".
          To restore or change: uncomment the block below. CSS for .faq-3d-bg and .faq-3d-q
          lives in globals.css (search "faq-3d-bg"); shapes/opacity/speed can be adjusted there. */}
      {/* <div className="faq-3d-bg" aria-hidden>
        <div className="faq-3d-bg-inner">
          <span className="faq-3d-q faq-3d-q-1">?</span>
          <span className="faq-3d-q faq-3d-q-2">?</span>
          <span className="faq-3d-q faq-3d-q-3">?</span>
          <span className="faq-3d-q faq-3d-q-4">?</span>
          <span className="faq-3d-q faq-3d-q-5">?</span>
          <span className="faq-3d-q faq-3d-q-6">?</span>
          <span className="faq-3d-q faq-3d-q-7">?</span>
          <span className="faq-3d-q faq-3d-q-8">?</span>
          <span className="faq-3d-q faq-3d-q-9">?</span>
          <span className="faq-3d-q faq-3d-q-10">?</span>
          <span className="faq-3d-q faq-3d-q-11">?</span>
          <span className="faq-3d-q faq-3d-q-12">?</span>
        </div>
      </div> */}
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="max-w-3xl mx-auto">
          {/* Header – same text design as MissionStatementNewHome */}
          <div
            className="text-center mb-8 md:mb-10"
            style={{
              opacity: isVisible ? 1 : 0,
              transform: isVisible && !prefersReducedMotion ? 'translateY(0)' : 'translateY(20px)',
              transition: prefersReducedMotion
                ? 'opacity 0.3s ease'
                : 'opacity 1.5s cubic-bezier(0.16, 1, 0.3, 1), transform 1.5s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            <span
              className={cn(
                'inline-block px-4 py-1.5 bg-brand-dark-blue/10 text-brand-dark-blue font-black text-base md:text-lg uppercase tracking-[0.2em] rounded-full mb-4 border border-brand-dark-blue/20',
                playfairDisplay.className
              )}
            >
              FAQ
            </span>
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-brand-dark-blue leading-[1.1] tracking-tight">
              Frequently Asked <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-teal to-emerald-600">Questions</span>
            </h2>
            <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Find answers to common questions about finding and connecting with independent physicians.
            </p>
          </div>

          <Accordion type="single" collapsible className="w-full">
            {patientFAQ.map((faq, index) => (
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
