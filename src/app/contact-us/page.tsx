'use client';

import { useEffect, useRef, useState } from 'react';
import { ContactInfoCards } from '@/components/contact/ContactInfoCards';
import { ContactForm } from '@/components/contact/ContactForm';

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
        className="relative w-full pt-24 md:pt-28 pb-16 md:pb-24 overflow-hidden bg-white"
      >
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1
              className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight text-brand-dark-blue"
              style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible && !prefersReducedMotion ? 'translateY(0)' : 'translateY(30px)',
                transition: prefersReducedMotion
                  ? 'opacity 0.3s ease'
                  : 'opacity 1.8s ease-out 0.4s, transform 1.8s ease-out 0.4s',
              }}
            >
              Contact Us
            </h1>
            <p
              className="text-lg md:text-xl text-gray-600 leading-relaxed"
              style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible && !prefersReducedMotion ? 'translateY(0)' : 'translateY(20px)',
                transition: prefersReducedMotion
                  ? 'opacity 0.3s ease'
                  : 'opacity 1.8s ease-out 0.8s, transform 1.8s ease-out 0.8s',
              }}
            >
              We'll respond as soon as possible.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Info Cards */}
      <ContactInfoCards />

      {/* Contact Form */}
      <ContactForm />
    </main>
  );
}
