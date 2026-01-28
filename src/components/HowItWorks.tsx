'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import {
  Search,
  Filter,
  MapPin,
  FileText,
  Calendar,
  ClipboardList,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

// Color pattern: alternate teal and dark-blue
const getCardColor = (index: number) => {
  return index % 2 === 0 ? 'bg-brand-teal' : 'bg-brand-dark-blue';
};

// Staggered positioning pattern for 3-column grid
const staggerPattern = [
  { translateY: '0', row: 1 },      // Card 0: Neutral
  { translateY: '-1.5rem', row: 1 }, // Card 1: Up
  { translateY: '-3rem', row: 1 },   // Card 2: Up (Enter Your Location - higher)
  { translateY: '1rem', row: 2 },   // Card 3: Down
  { translateY: '0', row: 2 },      // Card 4: Neutral
  { translateY: '-1rem', row: 2 },  // Card 5: Up
];

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
    title: 'Filter by Your Insurance Plan',
    description:
      'Select your insurance provider to see only doctors who accept your plan.',
  },
  {
    icon: MapPin,
    step: '3',
    title: 'Enter Your Location',
    description:
      'Enter your ZIP code or city to find doctors near you with convenient locations.',
  },
  {
    icon: FileText,
    step: '4',
    title: 'Compare Profiles',
    description:
      'Review doctor credentials, locations, patient reviews, and availability.',
  },
  {
    icon: Calendar,
    step: '5',
    title: 'Request an Appointment Time',
    description:
      'Select your preferred date and time to request an appointment (placeholder flow).',
  },
  {
    icon: ClipboardList,
    step: '6',
    title: 'Prepare for Your Visit',
    description:
      'Bring your insurance card, list of medications, and any questions you have.',
  },
];

const tips = [
  {
    title: 'New Patient vs Returning Patient',
    description:
      'New patients should arrive 15 minutes early to complete paperwork. Returning patients can check in online.',
  },
  {
    title: 'Telehealth Availability',
    description:
      'Many doctors offer telehealth appointments. Check individual profiles for availability (placeholder).',
  },
  {
    title: 'When to Call 911 vs Schedule Visit',
    description:
      'For life-threatening emergencies, call 911 immediately. For non-urgent concerns, schedule a visit through our portal.',
  },
];

export function HowItWorks() {
  const [isVisible, setIsVisible] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
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
    <section ref={sectionRef} id="how-it-works" className="pt-8 pb-16 md:pb-24 relative bg-gradient-to-br from-teal-50 via-white to-blue-50 overflow-visible">
      <div className="container mx-auto px-4 relative z-10">
        {/* Title Image - Left Aligned */}
        <div 
          className="flex justify-start mb-12 md:mb-16"
          style={{
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? 'translateX(0) scale(1) rotate(0deg)' : 'translateX(-80px) scale(0.8) rotate(-5deg)',
            transition: 'opacity 0.8s cubic-bezier(0.34, 1.56, 0.64, 1), transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)',
          }}
        >
          <div className="relative w-full max-w-2xl">
            <Image
              src="/title2.png"
              alt="How to Use This Portal"
              width={800}
              height={200}
              className="w-full h-auto"
              unoptimized
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5 mb-12">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const bgColor = getCardColor(index);
            const isTeal = bgColor === 'bg-brand-teal';
            const stepDelay = index * 200;
            const stagger = staggerPattern[index];
            
            // Base transform includes stagger (desktop only)
            const baseTransform = isDesktop ? `translateY(${stagger.translateY})` : '';
            const finalTransform = isVisible 
              ? (baseTransform ? `${baseTransform} translateZ(0)` : 'translateZ(0)')
              : (baseTransform ? `${baseTransform} translateY(60px) scale(0.6) rotate(-8deg) translateZ(0)` : 'translateY(60px) scale(0.6) rotate(-8deg) translateZ(0)');
            
            // Hover transform preserves stagger
            const hoverTransform = baseTransform 
              ? `${baseTransform} translateY(-8px) scale(1.05) rotate(2deg) translateZ(0)`
              : 'translateY(-8px) scale(1.05) rotate(2deg) translateZ(0)';
            
            return (
              <div
                key={step.step}
                className={`${bgColor} p-4 md:p-5 lg:p-6 text-white relative hover:z-10 flex flex-col min-h-[160px] md:min-h-[180px] group`}
                style={{
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1), 0 2px 6px rgba(0, 0, 0, 0.08)',
                  opacity: isVisible ? 1 : 0,
                  transform: finalTransform,
                  transition: `opacity 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) ${stepDelay}ms, transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) ${stepDelay}ms, box-shadow 0.3s ease`,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = hoverTransform;
                  e.currentTarget.style.boxShadow = '0 16px 32px rgba(0, 0, 0, 0.2), 0 8px 16px rgba(46, 196, 182, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = finalTransform;
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1), 0 2px 6px rgba(0, 0, 0, 0.08)';
                }}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className={`w-10 h-10 rounded-full ${isTeal ? 'bg-white/20' : 'bg-brand-teal/30'} text-white flex items-center justify-center font-bold text-base transition-all duration-500 group-hover:scale-125 group-hover:rotate-12`}>
                    {step.step}
                  </div>
                  <div className={`w-10 h-10 rounded-lg ${isTeal ? 'bg-white/20' : 'bg-brand-teal/30'} flex items-center justify-center transition-all duration-500 group-hover:scale-125 group-hover:-rotate-12`}>
                    <Icon className={`h-5 w-5 transition-all duration-500 group-hover:scale-125 ${isTeal ? 'text-white' : 'text-brand-teal'}`} />
                  </div>
                </div>
                <h3 className="text-lg md:text-xl font-bold mb-2 leading-tight break-words flex-shrink-0">
                  {step.title}
                </h3>
                <p className="text-xs md:text-sm text-gray-200 leading-relaxed flex-grow break-words">
                  {step.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Helpful Tips Panel */}
        <div
          className="bg-white rounded-3xl p-6 md:p-8 lg:p-10 relative"
          style={{
            boxShadow: '0 0 40px rgba(46, 196, 182, 0.1), 0 20px 40px rgba(0, 0, 0, 0.08)',
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? 'translateY(0) scale(1) rotate(0deg) translateZ(0)' : 'translateY(50px) scale(0.9) rotate(-2deg) translateZ(0)',
            transition: 'opacity 1s cubic-bezier(0.34, 1.56, 0.64, 1) 1.2s, transform 1s cubic-bezier(0.34, 1.56, 0.64, 1) 1.2s',
          }}
        >
          <h3 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8 text-brand-dark-blue">
            Helpful Tips
          </h3>
          <div className="space-y-5 md:space-y-6">
            {tips.map((tip, index) => (
              <div 
                key={index} 
                className="border-l-4 border-brand-teal pl-5 md:pl-6 py-2"
                style={{
                  opacity: isVisible ? 1 : 0,
                  transform: isVisible ? 'translateX(0) scale(1)' : 'translateX(-40px) scale(0.95)',
                  transition: `opacity 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) ${1400 + index * 150}ms, transform 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) ${1400 + index * 150}ms`,
                }}
              >
                <h4 className="font-semibold mb-2 text-lg md:text-xl text-brand-dark-blue">
                  {tip.title}
                </h4>
                <p className="text-gray-600 text-base md:text-lg leading-relaxed">{tip.description}</p>
              </div>
            ))}
            <div 
              className="mt-6 md:mt-8 p-4 md:p-5 bg-teal-50 border border-brand-teal/20 rounded-lg"
              style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? 'scale(1) rotate(0deg)' : 'scale(0.7) rotate(-5deg)',
                transition: 'opacity 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55) 1.8s, transform 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55) 1.8s',
              }}
            >
              <p className="text-sm md:text-base text-gray-700 leading-relaxed">
                <strong className="font-semibold text-brand-dark-blue">Disclaimer:</strong> This portal is for non-urgent
                appointment requests only. For medical emergencies, call 911
                immediately.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
