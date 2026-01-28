'use client';

import { useEffect, useRef, useState } from 'react';
import { Phone, Mail, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';

const contactInfo = {
  phone: '(555) 123-4567',
  email: 'info@alliancephysicians.com',
  hours: 'Mon-Fri: 9:00 AM - 5:00 PM EST',
};

const contactItems = [
  {
    icon: Phone,
    label: 'Phone',
    value: contactInfo.phone,
    href: `tel:${contactInfo.phone.replace(/\D/g, '')}`,
    description: 'Call us during business hours',
  },
  {
    icon: Mail,
    label: 'Email',
    value: contactInfo.email,
    href: `mailto:${contactInfo.email}`,
    description: 'Send us an email anytime',
  },
  {
    icon: Clock,
    label: 'Business Hours',
    value: contactInfo.hours,
    href: undefined,
    description: "We're here to help",
  },
];

export function ContactInfoCards() {
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
    <section ref={sectionRef} className="py-16 md:py-24 bg-gradient-to-br from-brand-dark-blue via-brand-dark-blue/90 to-brand-teal/20">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {contactItems.map((item, index) => {
            const Icon = item.icon;
            const delay = prefersReducedMotion ? 0 : index * 100;
            
            const cardContent = (
              <Card className="bg-white h-full transition-all duration-300 hover:shadow-[0_16px_48px_0_rgba(46,196,182,0.25)] hover:-translate-y-2 border-2 border-white/20 hover:border-brand-teal/40 group overflow-hidden relative">
                <CardContent className="p-8 flex flex-col relative z-10">
                  <div className="flex items-start gap-4 mb-4">
                    <div
                      className="w-16 h-16 rounded-2xl bg-brand-teal/10 flex items-center justify-center flex-shrink-0 shadow-lg group-hover:bg-brand-teal/20 group-hover:scale-110 transition-all duration-300"
                      style={{
                        opacity: isVisible ? 1 : 0,
                        transform: isVisible && !prefersReducedMotion ? 'scale(1)' : 'scale(0.8)',
                        transition: prefersReducedMotion
                          ? `opacity 0.3s ease ${delay}ms`
                          : `opacity 1.5s ease-out ${400 + delay}ms, transform 1.5s cubic-bezier(0.34, 1.56, 0.64, 1) ${400 + delay}ms`,
                      }}
                    >
                      <Icon className="h-8 w-8 text-brand-teal" aria-hidden="true" />
                    </div>
                    <div className="flex-1 pt-1">
                      <h3
                        className="text-xl font-bold text-brand-dark-blue mb-1 group-hover:text-brand-teal transition-colors"
                        style={{
                          opacity: isVisible ? 1 : 0,
                          transform: isVisible && !prefersReducedMotion ? 'translateY(0)' : 'translateY(10px)',
                          transition: prefersReducedMotion
                            ? `opacity 0.3s ease ${delay}ms`
                            : `opacity 1.5s ease-out ${600 + delay}ms, transform 1.5s ease-out ${600 + delay}ms`,
                        }}
                      >
                        {item.label}
                      </h3>
                      <div
                        className="text-sm text-gray-600 font-medium"
                        style={{
                          opacity: isVisible ? 1 : 0,
                          transform: isVisible && !prefersReducedMotion ? 'translateY(0)' : 'translateY(10px)',
                          transition: prefersReducedMotion
                            ? `opacity 0.3s ease ${delay}ms`
                            : `opacity 1.5s ease-out ${800 + delay}ms, transform 1.5s ease-out ${800 + delay}ms`,
                        }}
                      >
                        {item.description}
                      </div>
                    </div>
                  </div>
                  {item.href ? (
                    <Link
                      href={item.href}
                      className="text-lg font-semibold text-brand-teal hover:text-brand-dark-blue transition-colors group-hover:underline inline-flex items-center gap-2 mt-2"
                      style={{
                        opacity: isVisible ? 1 : 0,
                        transform: isVisible && !prefersReducedMotion ? 'translateY(0)' : 'translateY(10px)',
                        transition: prefersReducedMotion
                          ? `opacity 0.3s ease ${delay}ms`
                          : `opacity 1.5s ease-out ${1000 + delay}ms, transform 1.5s ease-out ${1000 + delay}ms`,
                      }}
                    >
                      {item.value}
                      <span className="text-brand-teal group-hover:translate-x-1 transition-transform inline-block">→</span>
                    </Link>
                  ) : (
                    <div
                      className="text-lg font-semibold text-brand-dark-blue mt-2"
                      style={{
                        opacity: isVisible ? 1 : 0,
                        transform: isVisible && !prefersReducedMotion ? 'translateY(0)' : 'translateY(10px)',
                        transition: prefersReducedMotion
                          ? `opacity 0.3s ease ${delay}ms`
                          : `opacity 1.5s ease-out ${1000 + delay}ms, transform 1.5s ease-out ${1000 + delay}ms`,
                      }}
                    >
                      {item.value}
                    </div>
                  )}
                </CardContent>
              </Card>
            );

            return <div key={item.label}>{cardContent}</div>;
          })}
        </div>
      </div>
    </section>
  );
}
