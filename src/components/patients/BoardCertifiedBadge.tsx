'use client';

import { useEffect, useState, useRef } from 'react';
import { Award, ShieldCheck } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export function BoardCertifiedBadge() {
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
      className="py-16 md:py-24 relative overflow-hidden bg-white"
    >
      {/* 3D animated medallion/badge shapes background */}
      <div className="board-badge-3d-bg" aria-hidden>
        <div className="board-badge-3d-inner">
          <Award className="board-badge-medal board-badge-medal-1" strokeWidth={2} fill="currentColor" />
          <Award className="board-badge-medal board-badge-medal-2" strokeWidth={2} fill="currentColor" />
          <Award className="board-badge-medal board-badge-medal-3" strokeWidth={2} fill="currentColor" />
          <Award className="board-badge-medal board-badge-medal-4" strokeWidth={2} fill="currentColor" />
        </div>
      </div>
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="max-w-4xl mx-auto">
          <div
            style={{
              opacity: isVisible ? 1 : 0,
              transform: isVisible && !prefersReducedMotion ? 'translateY(0) scale(1)' : 'translateY(30px) scale(0.95)',
              transition: prefersReducedMotion
                ? 'opacity 0.3s ease'
                : 'opacity 0.8s ease-out 0.2s, transform 0.8s ease-out 0.2s',
            }}
          >
            <Card
              className="group relative overflow-hidden rounded-lg transition-all duration-500 ease-out data-scroll-exclude bg-white/50 backdrop-blur-xl border border-gray-200/80 -translate-y-3 shadow-2xl shadow-black/15 hover:-translate-y-5 hover:shadow-[0_28px_60px_-12px_rgba(15,95,168,0.25),0_0_0_1px_rgba(15,95,168,0.08)] hover:border-brand-dark-blue/60 hover:scale-[1.02] hover:bg-white/75"
            >
              {/* Standard card layers (same as Contact/Benefits) */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-brand-teal/10 pointer-events-none group-hover:opacity-80 transition-opacity duration-500 z-0" aria-hidden />
              <div className="absolute inset-0 bg-gradient-to-br from-brand-dark-blue/5 via-transparent to-brand-teal/5 pointer-events-none z-0" aria-hidden />
              <div className="absolute inset-0 bg-gradient-to-br from-brand-dark-blue/15 via-brand-teal/10 to-brand-dark-blue/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-0" aria-hidden />
              <div className="absolute inset-0 pointer-events-none z-0" aria-hidden>
                <div className="absolute inset-0 bg-gradient-to-br from-brand-dark-blue/10 via-brand-teal/5 to-transparent animate-gradient-shift" />
                <div className="absolute inset-0 bg-gradient-to-tl from-transparent via-brand-teal/5 to-brand-dark-blue/10 animate-gradient-shift-reverse" />
              </div>
              <div className="absolute inset-0 pointer-events-none opacity-20 group-hover:opacity-40 transition-opacity duration-500 z-0" aria-hidden>
                <div className="absolute inset-0 floating" style={{ backgroundImage: 'radial-gradient(circle, rgba(15, 95, 168, 0.15) 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
              </div>
              <div className="absolute -top-20 -right-20 w-40 h-40 bg-brand-teal/15 group-hover:bg-brand-teal/30 group-hover:scale-150 rounded-full blur-3xl pointer-events-none transition-all duration-500 z-0" aria-hidden />
              <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-brand-dark-blue/15 group-hover:bg-brand-dark-blue/30 group-hover:scale-150 rounded-full blur-3xl pointer-events-none transition-all duration-500 z-0" aria-hidden />

              <CardContent className="relative z-10 p-8 md:p-10 flex flex-col md:flex-row items-center gap-6 md:gap-8">
                {/* Icon – standard gradient box */}
                <div className="flex-shrink-0">
                  <div className={`w-24 h-24 rounded-3xl flex items-center justify-center shadow-2xl text-white relative overflow-hidden transition-all duration-500 ease-out group-hover:scale-125 group-hover:shadow-[0_0_30px_rgba(15,95,168,0.4)] bg-gradient-to-br from-brand-dark-blue to-brand-teal ${isVisible && !prefersReducedMotion ? 'pulsate-bck-normal' : ''}`}>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out" aria-hidden />
                    <ShieldCheck className="h-12 w-12 relative z-10" aria-hidden="true" />
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 text-center md:text-left">
                  <h3 className="text-2xl md:text-3xl font-bold mb-3 text-brand-dark-blue">
                    Board-Certified Guarantee
                  </h3>
                  <p className="text-base md:text-lg text-gray-700 leading-relaxed group-hover:text-gray-800 transition-colors duration-300">
                    Every physician in our network is board-certified and has been vetted by our membership committee.
                  </p>
                </div>

                {/* Badge Icon – same standard style */}
                <div className="flex-shrink-0">
                  <div className="w-20 h-20 md:w-24 md:h-24 rounded-3xl flex items-center justify-center shadow-2xl text-white relative overflow-hidden transition-all duration-500 ease-out group-hover:scale-125 group-hover:shadow-[0_0_24px_rgba(15,95,168,0.4)] bg-gradient-to-br from-brand-dark-blue to-brand-teal">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out" aria-hidden />
                    <Award className="h-10 w-10 md:h-12 md:w-12 relative z-10" aria-hidden="true" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
