'use client';

import { useEffect, useRef, useState } from 'react';
import {
  Search,
  Filter,
  MapPin,
  FileText,
  Users,
  CheckCircle2,
  UserCheck,
  Video,
  AlertCircle,
  Network,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Alert, AlertDescription } from '@/components/ui/alert';

const steps = [
  {
    icon: Search,
    step: '1',
    title: 'Choose a Medical Specialty',
    description:
      'Browse our medical specialties or use the search to find doctors in your needed specialty.',
  },
  {
    icon: Filter,
    step: '2',
    title: 'Filter by Insurance',
    description:
      'Select your insurance provider to see only doctors who accept your plan (if applicable).',
  },
  {
    icon: MapPin,
    step: '3',
    title: 'Enter Location',
    description:
      'Enter your ZIP code or city to find doctors near you with convenient locations.',
  },
  {
    icon: FileText,
    step: '4',
    title: 'Compare Profiles',
    description:
      'Review doctor credentials, locations, availability, and focus areas.',
  },
  {
    icon: Users,
    step: '5',
    title: 'Connect & Coordinate',
    description:
      'Request an appointment, send a referral, or connect with a practice - depending on your needs (placeholder flow).',
  },
  {
    icon: CheckCircle2,
    step: '6',
    title: 'Follow Through Confidently',
    description:
      'Prepare for your visit or coordinate next steps with the right medical team.',
  },
];

const tips = [
  {
    icon: UserCheck,
    title: 'New Patient vs Returning Patient',
    description:
      'New patients should arrive 15 minutes early to complete paperwork. Returning patients can check in online.',
  },
  {
    icon: Video,
    title: 'Telehealth Availability',
    description:
      'Many doctors offer telehealth appointments. Check individual profiles for availability (placeholder).',
  },
  {
    icon: AlertCircle,
    title: 'When to Call 911 vs Schedule Visit',
    description:
      'For life-threatening emergencies, call 911 immediately. For non-urgent concerns, schedule a visit through our portal.',
  },
  {
    icon: Network,
    title: 'For Physicians: Network Coordination',
    description:
      'Use the network to coordinate referrals and connect with specialists. Streamline patient care coordination through the platform.',
  },
];

export function HowItWorksSection() {
  const [isVisible, setIsVisible] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [mounted, setMounted] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    setMounted(true);
    // Check for reduced motion preference
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
      id="how-it-works" 
      className="py-16 md:py-24 relative skin-paper overflow-hidden"
    >

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        {/* Section Header */}
        <div 
          className="text-center mb-12 md:mb-16"
          style={{
            opacity: isVisible ? 1 : 0,
            transform: isVisible && !prefersReducedMotion ? 'translateY(0)' : 'translateY(20px)',
              transition: prefersReducedMotion 
              ? 'opacity 0.3s ease' 
              : 'opacity 1.5s ease-out 0.4s, transform 1.5s ease-out 0.4s',
          }}
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6 text-brand-dark-blue">
            How It Works
          </h2>
          <p className="text-base md:text-lg lg:text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
            Follow these simple steps to find and connect with the right healthcare provider for your needs.
          </p>
        </div>

        {/* Desktop: 2-column layout (Stepper + Tips) */}
        {/* Mobile: Single column (Stacked steps + Accordion tips) */}
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 lg:items-start">
          {/* Left: Steps (Stepper on desktop, stacked on mobile) */}
          <div className="flex-1 lg:w-[60%]">
            {/* Desktop: Stepper layout with connector line */}
            <div className="hidden lg:block relative">
              {/* Connector line with animation */}
              <div 
                className="absolute left-6 top-0 w-0.5 bg-gray-200"
                style={{
                  height: isVisible ? '100%' : '0%',
                  opacity: isVisible ? 1 : 0,
                  transition: prefersReducedMotion 
                    ? 'opacity 0.3s ease' 
                    : 'height 1.2s ease-out 0.4s, opacity 0.6s ease-out 0.4s',
                  background: isVisible 
                    ? 'linear-gradient(to bottom, rgba(46, 196, 182, 0.3) 0%, rgba(46, 196, 182, 0.2) 50%, rgba(46, 196, 182, 0.1) 100%)'
                    : 'rgba(229, 231, 235, 1)',
                }}
              />
              
              {/* Spacer to match "Helpful Tips" heading height */}
              <div className="h-[32px] mb-4"></div>
              
              <div className="space-y-6">
                {steps.map((step, index) => {
                  const Icon = step.icon;
                  const stepDelay = prefersReducedMotion ? 0 : index * 300;

                  return (
                    <div
                      key={step.step}
                      className="relative flex gap-4"
                      style={{
                        opacity: isVisible ? 1 : 0,
                        transform: isVisible 
                          ? 'translateY(0) translateX(0)' 
                          : index % 2 === 0 
                            ? 'translateY(20px) translateX(-30px)' 
                            : 'translateY(20px) translateX(30px)',
                        transition: prefersReducedMotion
                          ? `opacity 0.3s ease ${stepDelay}ms`
                          : `opacity 1.8s ease-out ${stepDelay}ms, transform 1.8s cubic-bezier(0.34, 1.56, 0.64, 1) ${stepDelay}ms`,
                      }}
                    >
                      {/* Step number badge with connector dot */}
                      <div className="flex flex-col items-center flex-shrink-0">
                        <div 
                          className="w-12 h-12 rounded-full border-2 border-brand-teal bg-white flex items-center justify-center font-bold text-lg text-brand-teal z-10 group-hover:bg-brand-teal/10 transition-all duration-300 shadow-sm"
                          style={{
                            transform: isVisible ? 'scale(1)' : 'scale(0)',
                            transition: prefersReducedMotion
                              ? 'none'
                              : `transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) ${stepDelay + 200}ms`,
                          }}
                        >
                          {step.step}
                        </div>
                        {index < steps.length - 1 && (
                          <div 
                            className="w-1.5 h-1.5 rounded-full bg-brand-teal/40 mt-2 mb-2 animate-pulse-subtle"
                            style={{
                              opacity: isVisible ? 1 : 0,
                              transition: prefersReducedMotion
                                ? 'opacity 0.3s ease'
                                : `opacity 0.5s ease-out ${stepDelay + 400}ms`,
                            }}
                          />
                        )}
                      </div>

                      {/* Step card */}
                      <Card className="flex-1 card-vibrant group focus-ring">
                        <CardContent className="p-6">
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-full bg-brand-teal/10 text-brand-teal flex items-center justify-center flex-shrink-0 group-hover:bg-brand-teal/20 transition-all duration-300 hover-rotate">
                              <Icon className="h-6 w-6" aria-hidden="true" />
                            </div>
                            <div className="flex-1">
                              <h3 className="text-lg md:text-xl font-semibold text-brand-dark-blue mb-2 group-hover:text-brand-teal transition-colors">
                                {step.title}
                              </h3>
                              <p className="text-sm md:text-base text-gray-600 leading-relaxed">
                                {step.description}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Mobile: Stacked cards */}
            <div className="lg:hidden space-y-4">
              {steps.map((step, index) => {
                const Icon = step.icon;
                const stepDelay = prefersReducedMotion ? 0 : index * 100;

                return (
                  <Card
                    key={step.step}
                    className="border-2 border-transparent bg-white hover:border-brand-teal/30 hover:shadow-lg transition-all duration-300 focus-ring"
                    style={{
                      opacity: isVisible ? 1 : 0,
                      transform: isVisible && !prefersReducedMotion ? 'translateY(0)' : 'translateY(15px)',
                      transition: prefersReducedMotion
                        ? `opacity 0.3s ease ${stepDelay}ms`
                        : `opacity 0.6s ease-out ${stepDelay}ms, transform 0.6s ease-out ${stepDelay}ms`,
                    }}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-full border-2 border-brand-teal bg-white flex items-center justify-center font-bold text-lg text-brand-teal flex-shrink-0 shadow-sm">
                          {step.step}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-full bg-brand-teal/10 text-brand-teal flex items-center justify-center">
                              <Icon className="h-5 w-5" aria-hidden="true" />
                            </div>
                            <h3 className="text-lg font-semibold text-brand-dark-blue">
                              {step.title}
                            </h3>
                          </div>
                          <p className="text-sm text-gray-600 leading-relaxed">
                            {step.description}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Right: Helpful Tips - Positioned Lower */}
          <div className="flex-1 lg:w-[40%] lg:mt-24">
            {/* Desktop: Gradient Card Container */}
            <div className="hidden lg:block">
              <Card
                className="border-0 bg-gradient-to-br from-brand-dark-blue/10 via-brand-dark-blue-alt/5 to-brand-dark-blue/15 transition-all duration-500 relative overflow-hidden"
                style={{
                  opacity: isVisible ? 1 : 0,
                  transform: isVisible && !prefersReducedMotion 
                    ? 'translateY(0) scale(1)' 
                    : 'translateY(40px) scale(0.95)',
                  transition: prefersReducedMotion
                    ? 'opacity 0.3s ease 0.8s'
                    : 'opacity 1s cubic-bezier(0.34, 1.56, 0.64, 1) 0.8s, transform 1s cubic-bezier(0.34, 1.56, 0.64, 1) 0.8s',
                  boxShadow: '0 20px 60px -15px rgba(15, 95, 168, 0.4), 0 10px 30px -10px rgba(15, 95, 168, 0.3), 0 0 0 1px rgba(15, 95, 168, 0.1)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 25px 80px -15px rgba(15, 95, 168, 0.5), 0 15px 40px -10px rgba(15, 95, 168, 0.4), 0 0 0 1px rgba(15, 95, 168, 0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = '0 20px 60px -15px rgba(15, 95, 168, 0.4), 0 10px 30px -10px rgba(15, 95, 168, 0.3), 0 0 0 1px rgba(15, 95, 168, 0.1)';
                }}
              >
                {/* Animated gradient overlay */}
                <div 
                  className="absolute inset-0 bg-gradient-to-br from-brand-dark-blue/15 via-transparent to-brand-dark-blue-alt/10 opacity-0 transition-opacity duration-1000"
                  style={{
                    opacity: isVisible ? 1 : 0,
                    transition: prefersReducedMotion
                      ? 'opacity 0.3s ease 1s'
                      : 'opacity 1.2s ease-out 1s',
                  }}
                />
                
                <CardContent className="p-5 md:p-6 relative z-10">
                  {/* Heading with animation */}
                  <h3 
                    className="text-lg md:text-xl font-semibold mb-4 text-brand-dark-blue"
                    style={{
                      opacity: isVisible ? 1 : 0,
                      transform: isVisible && !prefersReducedMotion 
                        ? 'translateX(0)' 
                        : 'translateX(-30px)',
                      transition: prefersReducedMotion
                        ? 'opacity 0.3s ease 0.9s'
                        : 'opacity 0.8s ease-out 0.9s, transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) 0.9s',
                    }}
                  >
                    Helpful Tips
                  </h3>
                  
                  <div className="space-y-3">
                    {tips.map((tip, index) => {
                      const TipIcon = tip.icon;
                      const tipDelay = prefersReducedMotion ? 0 : 1000 + index * 200;

                      return (
                        <div
                          key={index}
                          className="group relative"
                          style={{
                            opacity: isVisible ? 1 : 0,
                            transform: isVisible && !prefersReducedMotion 
                              ? 'translateX(0) translateY(0)' 
                              : 'translateX(-20px) translateY(10px)',
                            transition: prefersReducedMotion
                              ? `opacity 0.3s ease ${tipDelay}ms`
                              : `opacity 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) ${tipDelay}ms, transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) ${tipDelay}ms`,
                          }}
                        >
                          <div className="bg-white/80 backdrop-blur-sm rounded-lg p-3 md:p-4 border border-brand-teal/10 hover:border-brand-teal/30 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                            <div className="flex items-start gap-3">
                              {TipIcon && (
                                <div 
                                  className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-teal/20 to-brand-dark-blue/20 text-brand-teal flex items-center justify-center flex-shrink-0 transition-all duration-300 group-hover:scale-110 group-hover:rotate-6 group-hover:bg-gradient-to-br group-hover:from-brand-teal/30 group-hover:to-brand-dark-blue/30"
                                  style={{
                                    transform: isVisible && !prefersReducedMotion
                                      ? 'rotate(0deg) scale(1)'
                                      : 'rotate(-15deg) scale(0.8)',
                                    transition: prefersReducedMotion
                                      ? 'none'
                                      : `transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) ${tipDelay + 100}ms`,
                                  }}
                                >
                                  <TipIcon className="h-4 w-4" aria-hidden="true" />
                                </div>
                              )}
                              <div className="flex-1">
                                <h4 className="font-medium mb-1 text-brand-dark-blue text-sm md:text-base group-hover:text-brand-teal transition-colors duration-300">
                                  {tip.title}
                                </h4>
                                <p className="text-xs md:text-sm text-gray-600 leading-relaxed">
                                  {tip.description}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  {/* Emergency Disclaimer Alert - Inside gradient card */}
                  <Alert 
                    className="bg-gradient-to-r from-red-50 to-red-100/50 border-red-300/50 mt-6 shadow-sm"
                    style={{
                      opacity: isVisible ? 1 : 0,
                      transform: isVisible && !prefersReducedMotion 
                        ? 'translateY(0) scale(1)' 
                        : 'translateY(15px) scale(0.95)',
                      transition: prefersReducedMotion
                        ? 'opacity 0.3s ease 1.6s'
                        : 'opacity 0.7s ease-out 1.6s, transform 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) 1.6s',
                    }}
                  >
                    <AlertCircle className="h-4 w-4 text-red-600 animate-pulse" />
                    <AlertDescription className="text-sm text-red-800">
                      <strong className="font-semibold">Disclaimer:</strong> This portal is for non-urgent
                      appointment requests only. For medical emergencies, call 911
                      immediately.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </div>

            {/* Mobile: Gradient Card with Accordion */}
            <div className="lg:hidden mt-8">
              <Card
                className="border-0 bg-gradient-to-br from-brand-dark-blue/10 via-brand-dark-blue-alt/5 to-brand-dark-blue/15 relative overflow-hidden"
                style={{
                  opacity: isVisible ? 1 : 0,
                  transform: isVisible && !prefersReducedMotion 
                    ? 'translateY(0) scale(1)' 
                    : 'translateY(30px) scale(0.95)',
                  transition: prefersReducedMotion
                    ? 'opacity 0.3s ease 0.6s'
                    : 'opacity 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) 0.6s, transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) 0.6s',
                  boxShadow: '0 20px 60px -15px rgba(15, 95, 168, 0.4), 0 10px 30px -10px rgba(15, 95, 168, 0.3), 0 0 0 1px rgba(15, 95, 168, 0.1)',
                }}
              >
                {/* Animated gradient overlay */}
                <div 
                  className="absolute inset-0 bg-gradient-to-br from-brand-dark-blue/15 via-transparent to-brand-dark-blue-alt/10 opacity-0 transition-opacity duration-1000"
                  style={{
                    opacity: isVisible ? 1 : 0,
                    transition: prefersReducedMotion
                      ? 'opacity 0.3s ease 0.8s'
                      : 'opacity 1s ease-out 0.8s',
                  }}
                />
                
                <CardContent className="p-6 relative z-10">
                  <h3 
                    className="text-lg font-semibold mb-4 text-brand-dark-blue"
                    style={{
                      opacity: isVisible ? 1 : 0,
                      transform: isVisible && !prefersReducedMotion 
                        ? 'translateX(0)' 
                        : 'translateX(-20px)',
                      transition: prefersReducedMotion
                        ? 'opacity 0.3s ease 0.7s'
                        : 'opacity 0.7s ease-out 0.7s, transform 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) 0.7s',
                    }}
                  >
                    Helpful Tips
                  </h3>
                  
                  <Accordion type="single" collapsible className="w-full">
                    {tips.map((tip, index) => {
                      const TipIcon = tip.icon;
                      const tipDelay = prefersReducedMotion ? 0 : 800 + index * 150;
                      
                      return (
                        <AccordionItem 
                          key={index}
                          value={`tip-${index}`}
                          className="bg-white/80 backdrop-blur-sm border-2 border-transparent hover:border-brand-teal/30 rounded-lg px-4 mb-3 transition-all duration-300 focus-ring"
                          style={{
                            opacity: isVisible ? 1 : 0,
                            transform: isVisible && !prefersReducedMotion 
                              ? 'translateX(0)' 
                              : 'translateX(-15px)',
                            transition: prefersReducedMotion
                              ? `opacity 0.3s ease ${tipDelay}ms`
                              : `opacity 0.6s ease-out ${tipDelay}ms, transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) ${tipDelay}ms`,
                          }}
                        >
                          <AccordionTrigger className="text-left hover:no-underline py-4">
                            <div className="flex items-center gap-3">
                              {TipIcon && (
                                <div 
                                  className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-teal/20 to-brand-dark-blue/20 text-brand-teal flex items-center justify-center flex-shrink-0 transition-transform duration-300"
                                  style={{
                                    transform: isVisible && !prefersReducedMotion
                                      ? 'rotate(0deg) scale(1)'
                                      : 'rotate(-10deg) scale(0.9)',
                                    transition: prefersReducedMotion
                                      ? 'none'
                                      : `transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) ${tipDelay + 50}ms`,
                                  }}
                                >
                                  <TipIcon className="h-5 w-5" aria-hidden="true" />
                                </div>
                              )}
                              <span className="font-medium text-brand-dark-blue text-sm">
                                {tip.title}
                              </span>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="text-xs md:text-sm text-gray-600 leading-relaxed pt-2 pb-4">
                            {tip.description}
                          </AccordionContent>
                        </AccordionItem>
                      );
                    })}
                  </Accordion>
                  
                  {/* Emergency Disclaimer Alert - Inside gradient card */}
                  <Alert 
                    className="bg-gradient-to-r from-red-50 to-red-100/50 border-red-300/50 mt-6 shadow-sm"
                    style={{
                      opacity: isVisible ? 1 : 0,
                      transform: isVisible && !prefersReducedMotion 
                        ? 'translateY(0) scale(1)' 
                        : 'translateY(10px) scale(0.95)',
                      transition: prefersReducedMotion
                        ? 'opacity 0.3s ease 1.3s'
                        : 'opacity 0.6s ease-out 1.3s, transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 1.3s',
                    }}
                  >
                    <AlertCircle className="h-4 w-4 text-red-600 animate-pulse" />
                    <AlertDescription className="text-sm text-red-800">
                      <strong className="font-semibold">Disclaimer:</strong> This portal is for non-urgent
                      appointment requests only. For medical emergencies, call 911
                      immediately.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
