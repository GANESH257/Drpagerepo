'use client';

import { useEffect, useRef, useState } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { patientFAQ } from '@/data/patientsPage';

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
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="max-w-3xl mx-auto">
          <div
            className="text-center mb-4 md:mb-6"
            style={{
              opacity: isVisible ? 1 : 0,
              transform: isVisible && !prefersReducedMotion ? 'translateY(0)' : 'translateY(20px)',
              transition: prefersReducedMotion ? 'opacity 0.3s ease' : 'opacity 1.5s ease-out 0.4s, transform 1.5s ease-out 0.4s',
            }}
          >
            <h2 className="text-xl md:text-2xl lg:text-3xl font-bold mb-2 text-brand-dark-blue">
              Frequently Asked Questions
            </h2>
            <p className="text-xs md:text-sm text-gray-700 leading-relaxed">
              Find answers to common questions about finding and connecting with independent physicians.
            </p>
          </div>

          <Accordion type="single" collapsible className="w-full">
            {patientFAQ.map((faq, index) => {
              const itemDelay = prefersReducedMotion ? 0 : index * 50;
              return (
                <AccordionItem
                  key={index}
                  value={`item-${index}`}
                  className="card-vibrant mb-1.5 rounded-lg px-2 md:px-3 py-1 focus-ring"
                  style={{
                    opacity: isVisible ? 1 : 0,
                    transform: isVisible && !prefersReducedMotion ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.95)',
                    transition: prefersReducedMotion
                      ? `opacity 0.3s ease ${200 + itemDelay}ms`
                      : `opacity 1.2s ease-out ${400 + itemDelay}ms, transform 1.2s cubic-bezier(0.34, 1.56, 0.64, 1) ${400 + itemDelay}ms`,
                    boxShadow: '0 2px 10px rgba(29, 212, 196, 0.08), 0 1px 4px rgba(15, 95, 168, 0.05)',
                  }}
                >
                  <AccordionTrigger className="text-left text-xs md:text-sm hover:no-underline text-brand-dark-blue font-semibold py-1.5 [&>svg]:transition-transform [&>svg]:duration-300 [&[data-state=open]>svg]:rotate-90">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-600 text-xs pb-1.5 leading-relaxed data-[state=open]:animate-fade-in-scale">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
