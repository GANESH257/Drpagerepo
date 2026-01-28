'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { Target, Heart, Award } from 'lucide-react';

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
    <section ref={sectionRef} className="py-20 md:py-32 relative overflow-hidden skin-slate">
      {/* Decorative Blobs */}
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[600px] h-[600px] bg-brand-teal/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-brand-dark-blue/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="max-w-7xl mx-auto">
          {/* Title - Full Width */}
          <div className="text-center mb-12 md:mb-16" style={animationStyle(0)}>
            <span className="inline-block px-4 py-1.5 bg-brand-teal/10 text-brand-teal font-black text-xs uppercase tracking-[0.2em] rounded-full mb-4">
              Our Mission
            </span>
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-slate-900 leading-[1.1] tracking-tight">
              Driving the <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-teal to-brand-dark-blue">Future of Medicine</span>
            </h2>
          </div>

          {/* Content Grid - Two Columns */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
            {/* Left Side - Two Paragraphs in Cards */}
            <div className="space-y-6">
              <div
                className="p-6 md:p-8 bg-white/60 backdrop-blur-md rounded-[2rem] border border-white/50 shadow-[0_20px_40px_rgba(0,0,0,0.03)] hover:shadow-[0_30px_60px_rgba(0,0,0,0.06)] transition-all duration-500"
                style={animationStyle(200)}
              >
                <p className="text-lg md:text-xl text-slate-700 leading-relaxed font-medium">
                  At Alliance of Independent Physicians, our team brings together hundreds of years of combined experience across a wide range of medical specialties.
                </p>
              </div>

              <div
                className="p-6 md:p-8 bg-white/60 backdrop-blur-md rounded-[2rem] border border-white/50 shadow-[0_20px_40px_rgba(0,0,0,0.03)] hover:shadow-[0_30px_60px_rgba(0,0,0,0.06)] transition-all duration-500"
                style={animationStyle(400)}
              >
                <p className="text-lg md:text-xl text-slate-700 leading-relaxed font-medium">
                  Our doctors are leaders in their fields—respected for their expertise, compassion, and dedication to providing exceptional, patient-focused care.
                </p>
              </div>
            </div>

            {/* Right Side - Image + Quote */}
            <div className="flex flex-col space-y-6">
              {/* Image - Smaller size */}
              <div
                className="relative w-full"
                style={animationStyle(300)}
              >
                <div className="relative rounded-[2rem] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.1)] group h-full">
                  <Image
                    src="/mission.png"
                    alt="Our Mission"
                    width={500}
                    height={600}
                    className="w-full h-[140px] md:h-[160px] lg:h-[180px] object-cover transition-transform duration-1000 group-hover:scale-105"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-tr from-brand-dark-blue/40 via-transparent to-transparent opacity-60 pointer-events-none" />
                </div>
              </div>

              {/* Quote - No card styling */}
              <div
                style={animationStyle(500)}
              >
                <p className="text-base md:text-lg text-slate-600 font-medium italic leading-relaxed">
                  "We are committed to helping patients achieve better health outcomes through advanced diagnostics and evidence-based medicine."
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
