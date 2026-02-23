'use client';

import { useEffect, useRef, useState } from 'react';
import { Phone, Mail, Clock, MapPin } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';

const contactInfo = {
  phone: '(555) 123-4567',
  email: 'info@alliancephysicians.com',
  hours: 'Mon-Fri: 9:00 AM - 5:00 PM EST',
  mailingAddress: '123 Medical Center Drive, Suite 100\nSt. Louis, MO 63101',
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
  {
    icon: MapPin,
    label: 'Mailing Address',
    value: contactInfo.mailingAddress,
    href: undefined,
    description: 'For official correspondence',
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {contactItems.map((item, index) => {
            const Icon = item.icon;
            const delay = prefersReducedMotion ? 0 : index * 100;
            
            const cardContent = (
              <Card className="bg-white h-full transition-all duration-500 hover:shadow-2xl hover:-translate-y-3 border-2 border-gray-200 hover:border-brand-dark-blue group overflow-hidden relative data-scroll-exclude">
                {/* Animated gradient background */}
                <div className="absolute inset-0 bg-gradient-to-br from-brand-dark-blue/5 via-transparent to-brand-teal/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                {/* Animated mesh gradient background */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                  <div className="absolute inset-0 bg-gradient-to-br from-brand-dark-blue/10 via-brand-teal/5 to-transparent animate-gradient-shift" />
                  <div className="absolute inset-0 bg-gradient-to-tl from-transparent via-brand-teal/5 to-brand-dark-blue/10 animate-gradient-shift-reverse" />
                </div>
                
                {/* Animated dots pattern */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-30 transition-opacity duration-700">
                  <div className="absolute inset-0 floating" style={{
                    backgroundImage: `radial-gradient(circle, rgba(15, 95, 168, 0.1) 1px, transparent 1px)`,
                    backgroundSize: '20px 20px',
                  }} />
                </div>
                
                {/* Glowing orb effect */}
                <div className="absolute -top-20 -right-20 w-40 h-40 bg-brand-teal/20 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-all duration-700 group-hover:scale-150" />
                <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-brand-dark-blue/20 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-all duration-700 group-hover:scale-150" />
                
                {/* Shimmer effect on hover */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
                </div>
                
                <CardContent className="p-8 md:p-10 flex flex-col items-center text-center relative z-10">
                  {/* Enhanced icon container with gradient */}
                  <div
                    className={`w-24 h-24 rounded-3xl bg-gradient-to-br from-brand-dark-blue/10 to-brand-teal/10 flex items-center justify-center mb-6 shadow-lg group-hover:shadow-2xl group-hover:bg-gradient-to-br group-hover:from-brand-dark-blue group-hover:to-brand-teal group-hover:scale-110 transition-all duration-500 relative overflow-hidden ${isVisible && !prefersReducedMotion ? 'pulsate-bck-normal' : ''}`}
                    style={{
                      opacity: isVisible ? 1 : 0,
                      transform: isVisible && !prefersReducedMotion ? undefined : 'scale(0.8)',
                      transition: prefersReducedMotion
                        ? `opacity 0.3s ease ${delay}ms`
                        : `opacity 1.5s ease-out ${400 + delay}ms${isVisible ? '' : ', transform 1.5s cubic-bezier(0.34, 1.56, 0.64, 1) ' + (400 + delay) + 'ms'}`,
                    }}
                  >
                    {/* Shine effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                    <Icon className="h-12 w-12 text-brand-dark-blue group-hover:text-white transition-all duration-500 relative z-10" aria-hidden="true" />
                  </div>
                  
                  {/* Title */}
                  <h3
                    className="text-2xl font-bold text-brand-dark-blue mb-3 group-hover:text-brand-dark-blue transition-colors"
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
                  
                  {/* Description */}
                  <p
                    className="text-sm text-gray-600 mb-6 min-h-[2.5rem] group-hover:text-gray-700 transition-colors"
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
                  
                  {/* Value/Link */}
                  {item.href ? (
                    <Link
                      href={item.href}
                      className="text-lg font-semibold text-brand-dark-blue hover:text-brand-teal transition-all duration-300 inline-flex items-center gap-2 group/link px-4 py-2 rounded-lg hover:bg-brand-dark-blue/5"
                      style={{
                        opacity: isVisible ? 1 : 0,
                        transform: isVisible && !prefersReducedMotion ? 'translateY(0)' : 'translateY(10px)',
                        transition: prefersReducedMotion
                          ? `opacity 0.3s ease ${delay}ms`
                          : `opacity 1.5s ease-out ${1000 + delay}ms, transform 1.5s ease-out ${1000 + delay}ms`,
                      }}
                    >
                      <span className="break-all">{item.value}</span>
                      <span className="text-brand-dark-blue group-hover/link:text-brand-teal group-hover/link:translate-x-1 transition-all duration-300 inline-block flex-shrink-0">→</span>
                    </Link>
                  ) : (
                    <div
                      className="text-base md:text-lg font-semibold text-brand-dark-blue whitespace-pre-line leading-relaxed group-hover:text-brand-dark-blue transition-colors"
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
