'use client';

import { useEffect, useRef, useState } from 'react';
import { Playfair_Display } from 'next/font/google';
import { ContactInfoCards } from '@/components/contact/ContactInfoCards';
import { ContactForm } from '@/components/contact/ContactForm';
import { cn } from '@/lib/utils';

const playfairDisplay = Playfair_Display({
  subsets: ['latin'],
  weight: ['700', '900'],
  display: 'swap',
});

export default function ContactUsPage() {
  const [isVisible, setIsVisible] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const heroRef = useRef<HTMLElement>(null);

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
      { threshold: 0.1 }
    );

    if (heroRef.current) {
      observer.observe(heroRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section
        ref={heroRef}
        className="relative w-full pt-24 md:pt-28 pb-8 md:pb-12 overflow-hidden bg-gradient-to-b from-slate-50 via-white to-brand-teal/5"
      >
        {/* Soft gradient orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
          <div className="absolute -top-40 -right-40 w-[480px] h-[480px] rounded-full bg-brand-teal/10 blur-3xl" />
          <div className="absolute top-1/2 -left-32 w-80 h-80 rounded-full bg-brand-dark-blue/8 blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-64 rounded-full bg-brand-teal/5 blur-3xl" />
        </div>
        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.4] pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(rgba(15, 95, 168, 0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(15, 95, 168, 0.06) 1px, transparent 1px)`,
            backgroundSize: '48px 48px',
          }}
          aria-hidden
        />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center mt-12 md:mt-20 mb-8 md:mb-10">
            <div
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
                Contact
              </span>
              <h1 className="text-4xl md:text-5xl font-bold mb-4 text-brand-dark-blue leading-[1.1] tracking-tight">
                Contact{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-teal to-emerald-600">
                  Us
                </span>
              </h1>
              <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                We'll respond as soon as possible.
              </p>
            </div>
          </div>
          <ContactInfoCards embedded />
        </div>
      </section>

      {/* Contact Form */}
      <ContactForm />
    </main>
  );
}
