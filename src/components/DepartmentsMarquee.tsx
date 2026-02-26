'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { departments } from '@/data/departments';
import { getDepartmentIcon } from '@/lib/departmentIcons';
import * as LucideIcons from 'lucide-react';

// Complete icon mapping for all departments using Lucide icons
const departmentLucideIconMap: Record<string, keyof typeof LucideIcons> = {
  'bariatric-general-surgery': 'Scissors',
  'cardiology': 'HeartPulse',
  'dermatology': 'Sparkles',
  'endocrinology': 'Beaker',
  'family-practice': 'Users',
  'gastroenterology': 'Activity',
  'internal-medicine': 'Heart',
  'nephrology': 'Droplet',
  'neurology': 'Brain',
  'nurse-practitioners': 'UserCircle',
  'ophthalmology': 'Eye',
  'orthopedic-spine': 'Activity',
  'otolaryngology-ent': 'Headphones',
  'pediatrics': 'Users',
  'plastic-reconstructive-surgery': 'Scissors',
  'podiatry': 'Footprints',
  'psychiatry': 'Brain',
  'pulmonology': 'Wind',
  'rheumatology': 'Activity',
  'sports-medicine': 'Dumbbell',
  'vascular-surgery': 'HeartPulse',
};

interface DepartmentItem {
  name: string;
  slug: string;
  IconComponent: React.ComponentType<{ className?: string }>;
}

export function DepartmentsMarquee() {
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

  // Create department items with Lucide icons
  const departmentItems: DepartmentItem[] = departments.map((dept) => {
    // Try Lucide icon mapping first
    const lucideIconName = departmentLucideIconMap[dept.slug];
    let IconComponent: React.ComponentType<{ className?: string }>;
    
    if (lucideIconName && LucideIcons[lucideIconName]) {
      IconComponent = LucideIcons[lucideIconName] as React.ComponentType<{ className?: string }>;
    } else {
      // Fallback to getDepartmentIcon or Stethoscope
      IconComponent = getDepartmentIcon(dept.slug);
    }
    
    return {
      name: dept.name,
      slug: dept.slug,
      IconComponent,
    };
  });

  return (
    <section
      ref={sectionRef}
      className="py-4 md:py-5 bg-white relative overflow-hidden"
      aria-label="Medical departments and specialties"
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible && !prefersReducedMotion ? 'translateY(0)' : 'translateY(30px)',
        transition: prefersReducedMotion
          ? 'opacity 0.3s ease'
          : 'opacity 1.5s ease-out 0.4s, transform 1.5s ease-out 0.4s',
      }}
    >
      {/* Marquee edge-to-edge */}
      <div className="overflow-hidden relative w-full">
          <div
            className={`flex gap-8 md:gap-12 items-center w-max ${prefersReducedMotion ? '' : 'animate-marquee'}`}
          >
            {/* First set of department icons – standard card icon style */}
            {departmentItems.map((dept, index) => (
              <Link
                key={`dept-1-${index}`}
                href={`/practices?specialty=${dept.slug}`}
                className="flex-shrink-0 flex flex-col items-center justify-center group transition-all duration-500 ease-out hover:scale-110 data-scroll-exclude"
                aria-label={`Browse ${dept.name} specialists`}
              >
                <div className="relative w-14 h-14 md:w-16 md:h-16 lg:w-20 lg:h-20 flex items-center justify-center rounded-full shadow-2xl overflow-hidden bg-gradient-to-br from-brand-dark-blue to-brand-teal text-white transition-all duration-500 ease-out group-hover:scale-125 group-hover:shadow-[0_0_30px_rgba(15,95,168,0.4)] mb-2">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out" aria-hidden />
                  <dept.IconComponent className="w-7 h-7 md:w-8 md:h-8 lg:w-9 lg:h-9 relative z-10" aria-label={`${dept.name} icon`} />
                </div>
                <span className="text-xs md:text-sm font-medium text-brand-dark-blue group-hover:text-brand-teal transition-colors duration-300 text-center max-w-[100px] md:max-w-[120px]">
                  {dept.name}
                </span>
              </Link>
            ))}

            {/* Duplicate set for seamless loop */}
            {departmentItems.map((dept, index) => (
              <Link
                key={`dept-2-${index}`}
                href={`/practices?specialty=${dept.slug}`}
                className="flex-shrink-0 flex flex-col items-center justify-center group transition-all duration-500 ease-out hover:scale-110 data-scroll-exclude"
                aria-label={`Browse ${dept.name} specialists`}
              >
                <div className="relative w-14 h-14 md:w-16 md:h-16 lg:w-20 lg:h-20 flex items-center justify-center rounded-full shadow-2xl overflow-hidden bg-gradient-to-br from-brand-dark-blue to-brand-teal text-white transition-all duration-500 ease-out group-hover:scale-125 group-hover:shadow-[0_0_30px_rgba(15,95,168,0.4)] mb-2">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out" aria-hidden />
                  <dept.IconComponent className="w-7 h-7 md:w-8 md:h-8 lg:w-9 lg:h-9 relative z-10" aria-label={`${dept.name} icon`} />
                </div>
                <span className="text-xs md:text-sm font-medium text-brand-dark-blue group-hover:text-brand-teal transition-colors duration-300 text-center max-w-[100px] md:max-w-[120px]">
                  {dept.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
    </section>
  );
}
