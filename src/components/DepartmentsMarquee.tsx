'use client';

import { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { departments } from '@/data/departments';
import { getDepartmentIcon } from '@/lib/departmentIcons';
import * as LucideIcons from 'lucide-react';

// Map departments to icon paths, fallback to Lucide icons
const departmentIconMap: Record<string, string> = {
  'family-practice': '/Icons/icon_primary_care.png',
  'cardiology': '/Icons/icon_cardiology.png',
  'dermatology': '/Icons/icon_dermatology.png',
  'gastroenterology': '/Icons/icon_gastroenterology.png',
  'neurology': '/Icons/icon_neurology.png',
  'ophthalmology': '/Icons/icon_ophthalmology.png',
  'orthopedic-spine': '/Icons/icon_orthopedics.png',
  'pediatrics': '/Icons/icon_pediatrics.png',
  'psychiatry': '/Icons/icon_psychiatry.png',
  'pulmonology': '/Icons/icon_pulmonology.png',
};

// Extended icon mapping for departments without custom icons
const departmentLucideIconMap: Record<string, keyof typeof LucideIcons> = {
  'bariatric-general-surgery': 'Scissors',
  'endocrinology': 'Beaker',
  'internal-medicine': 'Heart',
  'nephrology': 'Droplet',
  'nurse-practitioners': 'UserCircle',
  'otolaryngology-ent': 'Headphones',
  'plastic-reconstructive-surgery': 'Scissors',
  'podiatry': 'Footprints',
  'rheumatology': 'Activity',
  'sports-medicine': 'Dumbbell',
  'vascular-surgery': 'HeartPulse',
};

interface DepartmentItem {
  name: string;
  slug: string;
  iconPath?: string;
  IconComponent?: React.ComponentType<{ className?: string }>;
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

  // Create department items with icons
  const departmentItems: DepartmentItem[] = departments.map((dept) => {
    const iconPath = departmentIconMap[dept.slug];
    let IconComponent: React.ComponentType<{ className?: string }> | undefined;
    
    if (!iconPath) {
      // Try Lucide icon mapping first
      const lucideIconName = departmentLucideIconMap[dept.slug];
      if (lucideIconName && LucideIcons[lucideIconName]) {
        IconComponent = LucideIcons[lucideIconName] as React.ComponentType<{ className?: string }>;
      } else {
        // Fallback to getDepartmentIcon or Stethoscope
        IconComponent = getDepartmentIcon(dept.slug);
      }
    }
    
    return {
      name: dept.name,
      slug: dept.slug,
      iconPath,
      IconComponent,
    };
  });

  return (
    <section
      ref={sectionRef}
      className="py-6 md:py-8 skin-paper relative overflow-hidden"
      aria-label="Medical departments and specialties"
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible && !prefersReducedMotion ? 'translateY(0)' : 'translateY(30px)',
        transition: prefersReducedMotion
          ? 'opacity 0.3s ease'
          : 'opacity 1.5s ease-out 0.4s, transform 1.5s ease-out 0.4s',
      }}
    >
      <div className="container mx-auto px-4">
        {/* Marquee Container */}
        <div className="overflow-hidden relative w-full">
          <div
            className={`flex gap-8 md:gap-12 items-center w-max ${prefersReducedMotion ? '' : 'animate-marquee'}`}
          >
            {/* First set of department icons */}
            {departmentItems.map((dept, index) => (
              <Link
                key={`dept-1-${index}`}
                href={`/practices?specialty=${dept.slug}`}
                className="flex-shrink-0 flex flex-col items-center justify-center group transition-all duration-300 hover:scale-110"
                aria-label={`Browse ${dept.name} specialists`}
              >
                <div className="relative w-20 h-20 md:w-24 md:h-24 lg:w-28 lg:h-28 flex items-center justify-center bg-white rounded-full shadow-md group-hover:shadow-lg transition-all duration-300 mb-2">
                  {dept.iconPath ? (
                    <Image
                      src={dept.iconPath}
                      alt={`${dept.name} icon`}
                      fill
                      className="object-contain p-3"
                      sizes="(max-width: 768px) 80px, (max-width: 1024px) 96px, 112px"
                    />
                  ) : dept.IconComponent ? (
                    <dept.IconComponent className="w-10 h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 text-brand-teal" />
                  ) : (
                    <LucideIcons.Stethoscope className="w-10 h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 text-brand-teal" />
                  )}
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
                className="flex-shrink-0 flex flex-col items-center justify-center group transition-all duration-300 hover:scale-110"
                aria-label={`Browse ${dept.name} specialists`}
              >
                <div className="relative w-20 h-20 md:w-24 md:h-24 lg:w-28 lg:h-28 flex items-center justify-center bg-white rounded-full shadow-md group-hover:shadow-lg transition-all duration-300 mb-2">
                  {dept.iconPath ? (
                    <Image
                      src={dept.iconPath}
                      alt={`${dept.name} icon`}
                      fill
                      className="object-contain p-3"
                      sizes="(max-width: 768px) 80px, (max-width: 1024px) 96px, 112px"
                    />
                  ) : dept.IconComponent ? (
                    <dept.IconComponent className="w-10 h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 text-brand-teal" />
                  ) : (
                    <LucideIcons.Stethoscope className="w-10 h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 text-brand-teal" />
                  )}
                </div>
                <span className="text-xs md:text-sm font-medium text-brand-dark-blue group-hover:text-brand-teal transition-colors duration-300 text-center max-w-[100px] md:max-w-[120px]">
                  {dept.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
