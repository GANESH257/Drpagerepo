'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Building2 } from 'lucide-react';

interface InsuranceProvider {
  name: string;
  imagePath: string;
}

const insuranceProviders: InsuranceProvider[] = [
  {
    name: 'Aetna',
    imagePath: '/Insurance_Images/1.svg',
  },
  {
    name: 'Cigna',
    imagePath: '/Insurance_Images/2.svg',
  },
  {
    name: 'UnitedHealthcare',
    imagePath: '/Insurance_Images/3.svg',
  },
  {
    name: 'Medicare',
    imagePath: '/Insurance_Images/4.svg',
  },
  {
    name: 'Blue Cross Blue Shield',
    imagePath: '/Insurance_Images/5.svg',
  },
];

export function InsuranceProvidersSection() {
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
      id="insurance-providers"
      className="py-10 md:py-14 relative bg-gradient-to-br from-gray-50 via-white to-blue-50/30 overflow-hidden"
    >
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        {/* Section Header */}
        <div
          className="text-center mb-6 md:mb-8"
          style={{
            opacity: isVisible ? 1 : 0,
            transform: isVisible && !prefersReducedMotion ? 'translateY(0)' : 'translateY(20px)',
            transition: prefersReducedMotion
              ? 'opacity 0.3s ease'
              : 'opacity 1s ease-out 0.2s, transform 1s ease-out 0.2s',
          }}
        >
          <div className="flex items-center justify-center gap-2 mb-3">
            <Building2 className="h-6 w-6 md:h-7 md:w-7 text-brand-dark-blue" />
            <h2 className="text-2xl md:text-3xl font-bold text-brand-dark-blue">
              Find Practices Who Accept Your Insurance
            </h2>
          </div>
          <p className="text-sm md:text-base text-gray-700 max-w-3xl mx-auto leading-relaxed">
            Browse our network of providers by selecting your insurance plan below
          </p>
        </div>

        {/* Insurance Provider Tiles */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6 max-w-6xl mx-auto">
          {insuranceProviders.map((provider, index) => {
            const delay = prefersReducedMotion ? 0 : index * 100;

            return (
              <Link
                key={provider.name}
                href={`/practices?insurance=${encodeURIComponent(provider.name)}`}
                className="group"
                style={{
                  opacity: isVisible ? 1 : 0,
                  transform: isVisible && !prefersReducedMotion
                    ? 'translateY(0) scale(1)'
                    : 'translateY(20px) scale(0.9)',
                  transition: prefersReducedMotion
                    ? `opacity 0.3s ease ${delay}ms`
                    : `opacity 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) ${delay}ms, transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) ${delay}ms`,
                }}
              >
                <Card className="h-full border-2 border-gray-200 bg-white hover:border-brand-teal hover:shadow-xl transition-all duration-300 group-hover:-translate-y-2 cursor-pointer overflow-hidden relative">
                  <div className="p-4 md:p-5 flex flex-col items-center justify-center min-h-[100px] md:min-h-[120px] relative z-10">
                    {/* Insurance Logo */}
                    <div className="relative w-full h-12 md:h-14 mb-3 flex items-center justify-center">
                      <div className="relative w-full h-full flex items-center justify-center">
                        <img
                          src={provider.imagePath}
                          alt={provider.name}
                          className="max-w-full max-h-full object-contain group-hover:scale-110 transition-transform duration-300"
                          style={{ width: 'auto', height: 'auto', maxWidth: '100%', maxHeight: '100%' }}
                          onError={(e) => {
                            console.error(`Failed to load image: ${provider.imagePath}`);
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      </div>
                    </div>
                    
                    {/* Provider Name */}
                    <h3 className="text-xs md:text-sm font-semibold text-brand-dark-blue text-center group-hover:text-brand-teal transition-colors duration-300">
                      {provider.name}
                    </h3>
                    
                    {/* Hover Indicator */}
                    <div className="mt-2 text-xs text-gray-500 group-hover:text-brand-teal transition-colors duration-300 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                      Find Practices →
                    </div>
                  </div>
                  
                  {/* Gradient overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-brand-teal/5 via-transparent to-brand-dark-blue/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </Card>
              </Link>
            );
          })}
        </div>

        {/* View All Link */}
        <div
          className="text-center mt-6 md:mt-7"
          style={{
            opacity: isVisible ? 1 : 0,
            transform: isVisible && !prefersReducedMotion ? 'translateY(0)' : 'translateY(10px)',
            transition: prefersReducedMotion
              ? 'opacity 0.3s ease'
              : 'opacity 0.6s ease-out 0.7s, transform 0.6s ease-out 0.7s',
          }}
        >
          <Link
            href="/practices"
            className="inline-flex items-center gap-2 text-brand-dark-blue hover:text-brand-teal font-semibold transition-colors duration-300 hover:gap-3"
          >
            View All Practices
            <span className="text-xl">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
