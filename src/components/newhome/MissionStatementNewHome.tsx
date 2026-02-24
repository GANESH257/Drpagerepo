'use client';

import { useEffect, useRef, useState } from 'react';
import { Playfair_Display } from 'next/font/google';

const playfairDisplay = Playfair_Display({ 
  subsets: ['latin'],
  weight: ['700', '900'],
  display: 'swap',
});

export function MissionStatementNewHome() {
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

  const animationStyle = (delay: number) => {
    if (prefersReducedMotion) {
      return {
        opacity: isVisible ? 1 : 0,
        transition: 'opacity 0.3s ease',
      };
    }
    return {
      opacity: isVisible ? 1 : 0,
      transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
      transition: `opacity 1.5s cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms, transform 1.5s cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms`,
    };
  };

  return (
    <section ref={sectionRef} className="pt-32 md:pt-40 pb-12 md:pb-16 relative overflow-hidden">
      {/* Background: white */}
      <div className="absolute inset-0 z-0 bg-white" aria-hidden />

      <div className="container mx-auto px-4 md:px-6 relative z-20">
        <div className="max-w-7xl mx-auto">
          {/* Title - Full Width */}
          <div className="text-center mb-8 md:mb-10" style={animationStyle(0)}>
            <span className={`inline-block px-4 py-1.5 bg-brand-dark-blue/10 text-brand-dark-blue font-black text-base md:text-lg uppercase tracking-[0.2em] rounded-full mb-4 border border-brand-dark-blue/20 ${playfairDisplay.className}`}>
              Our Mission
            </span>
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-brand-dark-blue leading-[1.1] tracking-tight">
              Driving the <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-teal to-emerald-600">Future of Medicine</span>
            </h2>
          </div>

          {/* Mission Statement */}
          <div className="max-w-5xl mx-auto">
            <div
              className="p-8 md:p-10 lg:p-12 bg-gray-50 rounded-2xl border border-gray-200 shadow-lg shadow-gray-200/50"
              style={animationStyle(200)}
            >
              <p className="text-lg md:text-xl lg:text-2xl text-gray-800 font-normal leading-relaxed text-center tracking-normal relative">
                <span className="absolute -left-4 md:-left-6 -top-2 md:-top-4 text-6xl md:text-7xl lg:text-8xl text-brand-teal/30 font-serif leading-none" aria-hidden="true">&ldquo;</span>
                <span className="relative z-10">Our mission is to empower the community by connecting patients with Independent Physicians who provide <span className="text-brand-teal font-medium">accessible, affordable, and high-quality healthcare</span> through patient empowerment and education.</span>
                <span className="absolute -right-4 md:-right-6 -bottom-2 md:-bottom-4 text-6xl md:text-7xl lg:text-8xl text-brand-teal/30 font-serif leading-none" aria-hidden="true">&rdquo;</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
