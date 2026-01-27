'use client';

import { useEffect, useRef, useState } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { homeFAQ } from '@/data/homeFAQ';

export function FAQSection() {
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
      className="py-16 md:py-24 relative overflow-hidden skin-paper"
    >
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="max-w-3xl mx-auto">
          <div 
            className="text-center mb-12 md:mb-16"
            style={{
              opacity: isVisible ? 1 : 0,
              transform: isVisible && !prefersReducedMotion ? 'translateY(0)' : 'translateY(20px)',
              transition: prefersReducedMotion ? 'opacity 0.3s ease' : 'opacity 1.5s ease-out 0.4s, transform 1.5s ease-out 0.4s',
            }}
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6 text-brand-dark-blue">
              Frequently Asked Questions
            </h2>
            <p className="text-base md:text-lg lg:text-xl text-gray-700 leading-relaxed">
              Find answers to common questions about using our network and directory.
            </p>
          </div>

          <Accordion type="single" collapsible className="w-full">
            {homeFAQ.map((faq, index) => {
              const itemDelay = prefersReducedMotion ? 0 : index * 100;
              return (
                <AccordionItem 
                  key={index} 
                  value={`item-${index}`}
                  className="card-vibrant mb-3 rounded-lg px-5 md:px-6 py-2 focus-ring"
                  style={{
                    opacity: isVisible ? 1 : 0,
                    transform: isVisible && !prefersReducedMotion ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.95)',
                    transition: prefersReducedMotion
                      ? `opacity 0.3s ease ${300 + itemDelay}ms`
                      : `opacity 1.8s ease-out ${600 + itemDelay}ms, transform 1.8s cubic-bezier(0.34, 1.56, 0.64, 1) ${600 + itemDelay}ms`,
                  }}
                >
                  <AccordionTrigger className="text-left text-base md:text-lg hover:no-underline text-brand-dark-blue font-semibold py-4 [&>svg]:transition-transform [&>svg]:duration-300 [&[data-state=open]>svg]:rotate-90">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-600 text-sm md:text-base pb-4 leading-relaxed data-[state=open]:animate-fade-in-scale">
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
