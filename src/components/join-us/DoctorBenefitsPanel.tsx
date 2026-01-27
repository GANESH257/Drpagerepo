'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import {
  Network,
  Search,
  Settings,
  Calendar,
  Star,
  Users,
  UserPlus,
  FileCheck,
  TrendingUp,
} from 'lucide-react';

const benefits = [
  {
    icon: Network,
    text: 'Get referrals from a trusted network of Board Certified Specialists',
  },
  {
    icon: Search,
    text: 'Increase visibility to patients searching by specialty and location',
  },
  {
    icon: Settings,
    text: 'Manage your profile, locations, and accepted insurance (Phase 2)',
  },
  {
    icon: Calendar,
    text: 'Receive appointment requests online (Phase 2)',
  },
  {
    icon: Star,
    text: 'Build credibility with verified reviews (Phase 3)',
  },
  {
    icon: Users,
    text: 'Connect with the Board Certified Specialists community',
  },
];

const steps = [
  {
    icon: UserPlus,
    text: 'Create account',
  },
  {
    icon: FileCheck,
    text: 'Complete profile & verification',
  },
  {
    icon: TrendingUp,
    text: 'Start receiving referrals & patient requests',
  },
];

export function DoctorBenefitsPanel() {
  const [isVisible, setIsVisible] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

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

    if (panelRef.current) {
      observer.observe(panelRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={panelRef} className="w-full flex flex-col justify-center px-4 md:px-6 lg:px-8 py-12 lg:py-16">
      {/* Logo */}
      <div 
        className="mb-8"
        style={{
          opacity: isVisible ? 1 : 0,
          transform: isVisible && !prefersReducedMotion ? 'scale(1)' : 'scale(0.8)',
          transition: prefersReducedMotion ? 'opacity 0.3s ease' : 'opacity 1.5s ease-out 0.4s, transform 1.5s cubic-bezier(0.34, 1.56, 0.64, 1) 0.4s',
        }}
      >
        <Image
          src="/logodrp.png"
          alt="Alliance of Independent Physicians"
          width={200}
          height={60}
          className="h-12 w-auto transition-transform duration-300 hover:scale-105"
          priority
        />
      </div>

      {/* Headline */}
      <h1 
        className="text-4xl lg:text-5xl font-bold text-brand-dark-blue mb-4 leading-tight"
        style={{
          opacity: isVisible ? 1 : 0,
          transform: isVisible && !prefersReducedMotion ? 'translateY(0)' : 'translateY(20px)',
          transition: prefersReducedMotion ? 'opacity 0.3s ease' : 'opacity 0.7s ease-out 0.3s, transform 0.7s ease-out 0.3s',
        }}
      >
        Join the Alliance of Independent Physicians
      </h1>

      {/* Supporting Copy */}
      <p 
        className="text-lg text-gray-700 mb-8 leading-relaxed"
        style={{
          opacity: isVisible ? 1 : 0,
          transform: isVisible && !prefersReducedMotion ? 'translateY(0)' : 'translateY(15px)',
          transition: prefersReducedMotion ? 'opacity 0.3s ease' : 'opacity 1.8s ease-out 0.8s, transform 1.8s ease-out 0.8s',
        }}
      >
        Connect with a trusted network of independent physicians. Increase your visibility,
        receive quality referrals, and grow your practice through our comprehensive platform.
      </p>

      {/* Benefits List */}
      <div className="space-y-4 mb-10">
        {benefits.map((benefit, index) => {
          const Icon = benefit.icon;
          const delay = prefersReducedMotion ? 0 : index * 300;
          return (
            <div 
              key={index} 
              className="flex items-start gap-3 transition-all duration-300 hover:translate-x-2"
              style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible && !prefersReducedMotion ? 'translateX(0)' : 'translateX(-30px)',
                transition: prefersReducedMotion
                  ? `opacity 0.3s ease ${delay}ms`
                  : `opacity 1.5s ease-out ${800 + delay}ms, transform 1.5s ease-out ${800 + delay}ms`,
              }}
            >
              <div className="flex-shrink-0 mt-1 transition-all duration-300 hover-rotate">
                <Icon className="h-5 w-5 text-brand-teal" />
              </div>
              <p className="text-base text-gray-700 leading-relaxed">{benefit.text}</p>
            </div>
          );
        })}
      </div>

      {/* How It Works */}
      <div 
        className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border-2 border-brand-teal/20 shadow-lg transition-all duration-300 hover:border-brand-teal/40 hover:shadow-xl"
        style={{
          opacity: isVisible ? 1 : 0,
          transform: isVisible && !prefersReducedMotion ? 'translateY(0) scale(1)' : 'translateY(30px) scale(0.95)',
          transition: prefersReducedMotion ? 'opacity 0.3s ease' : 'opacity 1.8s ease-out 1.4s, transform 1.8s cubic-bezier(0.34, 1.56, 0.64, 1) 1.4s',
        }}
      >
        <h2 className="text-xl font-semibold text-brand-dark-blue mb-4">
          How it works for Doctors
        </h2>
        <div className="space-y-4">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const delay = prefersReducedMotion ? 0 : index * 100;
            return (
              <div 
                key={index} 
                className="flex items-center gap-3 transition-all duration-300 hover:translate-x-2"
                style={{
                  opacity: isVisible ? 1 : 0,
                  transform: isVisible && !prefersReducedMotion ? 'translateX(0)' : 'translateX(-20px)',
                  transition: prefersReducedMotion
                    ? `opacity 0.3s ease ${delay}ms`
                    : `opacity 1.5s ease-out ${1400 + delay}ms, transform 1.5s ease-out ${1400 + delay}ms`,
                }}
              >
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-brand-teal/10 flex items-center justify-center transition-all duration-300 hover:bg-brand-teal/20 hover-scale">
                  <Icon className="h-4 w-4 text-brand-teal" />
                </div>
                <p className="text-base text-gray-700 font-medium">{step.text}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
