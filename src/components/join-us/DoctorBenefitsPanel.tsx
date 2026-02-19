'use client';

import { useEffect, useRef, useState } from 'react';
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
  Bell,
  Building,
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
    text: 'Manage your profile, locations, and accepted insurance',
  },
  {
    icon: Calendar,
    text: 'Receive appointment requests online',
  },
  {
    icon: Star,
    text: 'Build credibility with verified reviews',
  },
  {
    icon: Users,
    text: 'Track referrals sent and received with enhanced status management',
  },
  {
    icon: Bell,
    text: 'Stay updated with notifications for referrals, approvals, and announcements',
  },
  {
    icon: Building,
    text: 'Practice Admins: Manage your practice, locations, and team members',
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
    text: 'Start receiving referrals, notifications & patient requests',
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
    <div ref={panelRef} className="w-full flex flex-col justify-center px-4 md:px-6 lg:px-8 py-8 lg:py-12">
      {/* Headline */}
      <h1 
        className="text-2xl lg:text-3xl font-bold text-[#0F5FA8] mb-3 leading-tight"
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
        className="text-base text-gray-700 mb-6 leading-relaxed"
        style={{
          opacity: isVisible ? 1 : 0,
          transform: isVisible && !prefersReducedMotion ? 'translateY(0)' : 'translateY(15px)',
          transition: prefersReducedMotion ? 'opacity 0.3s ease' : 'opacity 1.8s ease-out 0.8s, transform 1.8s ease-out 0.8s',
        }}
      >
        Connect with a trusted network of independent physicians.
      </p>

      {/* Benefits List */}
      <div className="space-y-3 mb-8">
        {benefits.map((benefit, index) => {
          const Icon = benefit.icon;
          const delay = prefersReducedMotion ? 0 : index * 300;
          return (
            <div 
              key={index} 
              className="flex items-start gap-3 transition-all duration-300 hover:translate-x-1"
              style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible && !prefersReducedMotion ? 'translateX(0)' : 'translateX(-30px)',
                transition: prefersReducedMotion
                  ? `opacity 0.3s ease ${delay}ms`
                  : `opacity 1.5s ease-out ${800 + delay}ms, transform 1.5s ease-out ${800 + delay}ms`,
              }}
            >
              <div className="flex-shrink-0 mt-1 transition-all duration-300">
                <Icon className="h-5 w-5 text-[#0F5FA8]" />
              </div>
              <p className="text-sm text-gray-700 leading-relaxed">{benefit.text}</p>
            </div>
          );
        })}
      </div>

      {/* How It Works */}
      <div 
        className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm transition-all duration-300 hover:shadow-md"
        style={{
          opacity: isVisible ? 1 : 0,
          transform: isVisible && !prefersReducedMotion ? 'translateY(0) scale(1)' : 'translateY(30px) scale(0.95)',
          transition: prefersReducedMotion ? 'opacity 0.3s ease' : 'opacity 1.8s ease-out 1.4s, transform 1.8s cubic-bezier(0.34, 1.56, 0.64, 1) 1.4s',
        }}
      >
        <h2 className="text-lg font-semibold text-[#0F5FA8] mb-3">
          How it works for Doctors
        </h2>
        <div className="space-y-3">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const delay = prefersReducedMotion ? 0 : index * 100;
            return (
              <div 
                key={index} 
                className="flex items-center gap-3 transition-all duration-300 hover:translate-x-1"
                style={{
                  opacity: isVisible ? 1 : 0,
                  transform: isVisible && !prefersReducedMotion ? 'translateX(0)' : 'translateX(-20px)',
                  transition: prefersReducedMotion
                    ? `opacity 0.3s ease ${delay}ms`
                    : `opacity 1.5s ease-out ${1400 + delay}ms, transform 1.5s ease-out ${1400 + delay}ms`,
                }}
              >
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#0F5FA8]/10 flex items-center justify-center transition-all duration-300 hover:bg-[#0F5FA8]/20">
                  <Icon className="h-4 w-4 text-[#0F5FA8]" />
                </div>
                <p className="text-sm text-gray-700 font-medium">{step.text}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
