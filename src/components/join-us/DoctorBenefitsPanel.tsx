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
  Bell,
  Building,
  Stethoscope,
} from 'lucide-react';

const benefits = [
  { icon: Network, text: 'Get referrals from a trusted network of Board Certified Specialists' },
  { icon: Search, text: 'Increase visibility to patients searching by specialty and location' },
  { icon: Settings, text: 'Manage your profile, locations, and accepted insurance' },
  { icon: Calendar, text: 'Receive appointment requests online' },
  { icon: Star, text: 'Build credibility with verified reviews' },
  { icon: Users, text: 'Track referrals sent and received with enhanced status management' },
  { icon: Bell, text: 'Stay updated with notifications for referrals, approvals, and announcements' },
  { icon: Building, text: 'Practice Admins: Manage your practice, locations, and team members' },
];

const steps = [
  { icon: UserPlus, text: 'Create account' },
  { icon: FileCheck, text: 'Complete profile & verification' },
  { icon: TrendingUp, text: 'Start receiving referrals, notifications & patient requests' },
];

export function DoctorBenefitsPanel() {
  const [isVisible, setIsVisible] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      setPrefersReducedMotion(mediaQuery.matches);
      const handleChange = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
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
    if (panelRef.current) observer.observe(panelRef.current);
    return () => observer.disconnect();
  }, []);

  const transition = (delay = 0) =>
    prefersReducedMotion
      ? 'opacity 0.3s ease'
      : `opacity 1.2s cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms, transform 1.2s cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms`;

  return (
    <div
      ref={panelRef}
      className="relative min-h-full flex items-center justify-center p-6 md:p-8 lg:p-10 overflow-hidden rounded-2xl lg:rounded-3xl"
    >
      {/* Animated gradient background - same as admin login */}
      <div
        className="absolute inset-0 bg-gradient-to-br from-brand-dark-blue via-brand-teal to-brand-dark-blue animate-gradient-shift"
        style={{ backgroundSize: '200% 200%' }}
      />
      <div
        className="absolute inset-0 bg-gradient-to-tr from-brand-teal/40 via-brand-dark-blue/50 to-brand-teal/30 animate-gradient-shift-reverse"
        style={{ backgroundSize: '200% 200%', animationDelay: '1s' }}
      />
      {/* Floating dots pattern */}
      <div className="absolute inset-0 opacity-30 floating">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(255, 255, 255, 0.3) 1px, transparent 1px)',
            backgroundSize: '50px 50px',
          }}
        />
      </div>
      {/* Abstract blurred shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-gradient-to-br from-brand-teal/40 to-brand-dark-blue/40 blur-2xl floating pulsate-bck-normal"
          style={{ animationDelay: '0s', transform: 'translate(-50%, -50%)' }}
        />
        <div
          className="absolute top-1/3 right-1/4 w-48 h-72 rounded-full bg-gradient-to-br from-brand-dark-blue/50 to-brand-teal/50 blur-3xl floating"
          style={{ animationDelay: '1.5s', borderRadius: '50% 40%', transform: 'translate(30%, -20%)' }}
        />
        <div
          className="absolute bottom-1/4 left-1/3 w-80 h-80 rounded-full bg-gradient-to-br from-brand-teal/30 to-brand-dark-blue/30 blur-3xl floating"
          style={{ animationDelay: '2.5s' }}
        />
      </div>

      {/* Content */}
      <div
        className="relative z-10 w-full max-w-lg text-white"
        style={{
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
          transition: 'opacity 1s ease-out, transform 1s ease-out',
        }}
      >
        {/* Logo */}
        <div
          className="mb-6 flex justify-center lg:justify-start"
          style={{
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? 'scale(1)' : 'scale(0.9)',
            transition: 'opacity 0.8s ease-out 0.2s, transform 0.8s ease-out 0.2s',
          }}
        >
          <Image
            src="/logodrnew.png"
            alt="Alliance of Independent Physicians"
            width={280}
            height={80}
            className="h-14 md:h-16 lg:h-20 w-auto object-contain drop-shadow-2xl"
          />
        </div>

        {/* Pill badge */}
        <div
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/20 backdrop-blur-md rounded-full mb-5 border border-white/30 shadow-lg"
          style={{ opacity: isVisible ? 1 : 0, transition: 'opacity 0.8s ease-out 0.25s' }}
        >
          <Stethoscope className="h-5 w-5 text-white pulsate-bck-normal" />
          <span className="text-sm font-semibold text-white">Physician Network</span>
        </div>

        {/* Headline */}
        <h1
          className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 leading-tight"
          style={{ opacity: isVisible ? 1 : 0, transition: 'opacity 1s ease-out 0.3s' }}
        >
          <span className="block text-white drop-shadow-lg">Join the Alliance of</span>
          <span className="block bg-gradient-to-r from-white via-brand-teal to-white bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient-shift text-shimmer">
            Independent Physicians
          </span>
        </h1>

        <p
          className="text-base md:text-lg text-white/90 leading-relaxed mb-6 drop-shadow-md"
          style={{ opacity: isVisible ? 1 : 0, transition: 'opacity 1s ease-out 0.35s' }}
        >
          Connect with a trusted network of independent physicians.
        </p>

        {/* Benefits list - admin login style icon boxes */}
        <div className="space-y-3 mb-6">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <div
                key={index}
                className="flex items-center gap-3 text-white/90"
                style={{
                  opacity: isVisible ? 1 : 0,
                  transform: isVisible ? 'translateX(0)' : 'translateX(-30px)',
                  transition: `opacity 0.8s ease-out ${0.35 + index * 0.06}s, transform 0.8s ease-out ${0.35 + index * 0.06}s`,
                }}
              >
                <div className="w-10 h-10 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30 flex-shrink-0">
                  <Icon className="h-5 w-5" />
                </div>
                <span className="text-sm md:text-base font-medium">{benefit.text}</span>
              </div>
            );
          })}
        </div>

        {/* How it works - same tint */}
        <div
          className="rounded-2xl p-5 bg-white/10 backdrop-blur-sm border border-white/20"
          style={{
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
            transition: 'opacity 1s ease-out 0.6s, transform 1s ease-out 0.6s',
          }}
        >
          <h2 className="text-lg font-semibold text-white mb-3 drop-shadow-md">
            How it works for Doctors
          </h2>
          <div className="space-y-3">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={index} className="flex items-center gap-3 text-white/90">
                  <div className="w-10 h-10 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30 flex-shrink-0">
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="text-sm font-medium">{step.text}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
