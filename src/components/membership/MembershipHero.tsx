'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ArrowRight, Users, Eye, Users2, HelpCircle } from 'lucide-react';
import Link from 'next/link';

export function MembershipHero() {
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
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleScroll = (targetId: string) => {
    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const trustItems = [
    { icon: Users, label: 'Referral Network' },
    { icon: Eye, label: 'Visibility' },
    { icon: Users2, label: 'Community' },
    { icon: HelpCircle, label: 'Support' },
  ];

  return (
    <section ref={sectionRef} className="relative w-full pt-32 md:pt-36 min-h-[600px] md:h-[600px] overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/bg4.jpg"
          alt=""
          fill
          className="object-cover"
          priority
          unoptimized
          aria-hidden="true"
        />
        {/* Overlay for text readability */}
        <div className="absolute inset-0 bg-white/70" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 h-full flex items-center py-8 md:py-0">
        <div className="max-w-3xl">
          <h1 
            className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight text-brand-dark-blue"
            style={{
              opacity: isVisible ? 1 : 0,
              transform: isVisible && !prefersReducedMotion ? 'translateY(0)' : 'translateY(30px)',
              transition: prefersReducedMotion ? 'opacity 0.3s ease' : 'opacity 1.8s ease-out 0.4s, transform 1.8s ease-out 0.4s',
            }}
          >
            Membership
          </h1>
          <p 
            className="text-xl md:text-2xl mb-8 text-gray-700 leading-relaxed"
            style={{
              opacity: isVisible ? 1 : 0,
              transform: isVisible && !prefersReducedMotion ? 'translateY(0)' : 'translateY(20px)',
              transition: prefersReducedMotion ? 'opacity 0.3s ease' : 'opacity 0.8s ease-out 0.3s, transform 0.8s ease-out 0.3s',
            }}
          >
            Join the Alliance network to access resources, referrals, visibility, and community. Connect with independent physicians and grow your practice.
          </p>

          {/* Primary CTAs */}
          <div 
            className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 mb-8"
            style={{
              opacity: isVisible ? 1 : 0,
              transform: isVisible && !prefersReducedMotion ? 'translateY(0)' : 'translateY(20px)',
              transition: prefersReducedMotion ? 'opacity 0.3s ease' : 'opacity 1.8s ease-out 0.8s, transform 1.8s ease-out 0.8s',
            }}
          >
            <Button
              size="lg"
              variant="gradient"
              className="w-full sm:w-auto"
              onClick={() => handleScroll('plans')}
            >
              View Plans
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="w-full sm:w-auto"
              onClick={() => handleScroll('policies')}
            >
              View Policies
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="w-full sm:w-auto"
              asChild
            >
              <Link href="/join-us">
                Join as a Physician
              </Link>
            </Button>
          </div>

          {/* Trust Strip */}
          <div className="flex flex-wrap gap-6 md:gap-8 mt-8">
            {trustItems.map((item, index) => {
              const Icon = item.icon;
              const delay = prefersReducedMotion ? 0 : index * 100;
              return (
                <div
                  key={index}
                  className="flex flex-col items-center gap-2 text-gray-700 transition-all duration-300 hover:translate-y-[-4px]"
                  style={{
                    opacity: isVisible ? 1 : 0,
                    transform: isVisible && !prefersReducedMotion ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.8)',
                    transition: prefersReducedMotion
                      ? `opacity 0.3s ease ${delay}ms`
                      : `opacity 1.5s ease-out ${800 + delay}ms, transform 1.5s cubic-bezier(0.34, 1.56, 0.64, 1) ${800 + delay}ms`,
                  }}
                >
                  <div className="p-3 rounded-full bg-white shadow-md border-2 border-brand-teal/20 transition-all duration-300 hover:border-brand-teal hover:bg-brand-teal/10 hover-scale">
                    <Icon className="h-5 w-5 text-brand-teal transition-transform duration-300 hover-rotate" aria-hidden="true" />
                  </div>
                  <span className="text-sm font-medium">{item.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
