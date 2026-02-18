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
    <section ref={sectionRef} className="py-16 md:py-24 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {contactItems.map((item, index) => {
            const Icon = item.icon;
            const delay = prefersReducedMotion ? 0 : index * 100;
            
            const cardContent = (
              <Card className="bg-white h-full transition-all duration-300 hover:shadow-xl hover:-translate-y-2 border-2 border-gray-200 hover:border-brand-dark-blue group overflow-hidden relative">
                <CardContent className="p-8 md:p-10 flex flex-col items-center text-center relative z-10">
                  <div
                    className="w-20 h-20 rounded-2xl bg-brand-dark-blue/10 flex items-center justify-center mb-6 shadow-md group-hover:bg-brand-dark-blue group-hover:scale-110 transition-all duration-300"
                    style={{
                      opacity: isVisible ? 1 : 0,
                      transform: isVisible && !prefersReducedMotion ? 'scale(1)' : 'scale(0.8)',
                      transition: prefersReducedMotion
                        ? `opacity 0.3s ease ${delay}ms`
                        : `opacity 1.5s ease-out ${400 + delay}ms, transform 1.5s cubic-bezier(0.34, 1.56, 0.64, 1) ${400 + delay}ms`,
                    }}
                  >
                    <Icon className="h-10 w-10 text-brand-dark-blue group-hover:text-white transition-colors" aria-hidden="true" />
                  </div>
                  <h3
                    className="text-xl font-bold text-brand-dark-blue mb-2"
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
                  <p
                    className="text-sm text-gray-600 mb-4"
                    style={{
                      opacity: isVisible ? 1 : 0,
                      transform: isVisible && !prefersReducedMotion ? 'translateY(0)' : 'translateY(10px)',
                      transition: prefersReducedMotion
                        ? `opacity 0.3s ease ${delay}ms`
                        : `opacity 1.5s ease-out ${800 + delay}ms, transform 1.5s ease-out ${800 + delay}ms`,
                    }}
                  >
                    {item.description}
                  </p>
                  {item.href ? (
                    <Link
                      href={item.href}
                      className="text-lg font-semibold text-brand-dark-blue hover:text-brand-dark-blue/80 transition-colors inline-flex items-center gap-2 group/link"
                      style={{
                        opacity: isVisible ? 1 : 0,
                        transform: isVisible && !prefersReducedMotion ? 'translateY(0)' : 'translateY(10px)',
                        transition: prefersReducedMotion
                          ? `opacity 0.3s ease ${delay}ms`
                          : `opacity 1.5s ease-out ${1000 + delay}ms, transform 1.5s ease-out ${1000 + delay}ms`,
                      }}
                    >
                      {item.value}
                      <span className="text-brand-dark-blue group-hover/link:translate-x-1 transition-transform inline-block">→</span>
                    </Link>
                  ) : (
                    <div
                      className="text-lg font-semibold text-brand-dark-blue"
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
