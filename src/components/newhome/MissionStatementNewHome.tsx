'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Playfair_Display } from 'next/font/google';
import { FileText } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

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
    <section ref={sectionRef} className="pt-24 md:pt-28 pb-12 md:pb-16 relative overflow-hidden">
      {/* Background: white */}
      <div className="absolute inset-0 z-0 bg-white" aria-hidden />
      {/* NOTE (client feedback): Animated 3D shapes background was commented out – animation was "too much".
          To restore or change the background: uncomment the block below. CSS for .mission-3d-bg and .mission-cube
          lives in globals.css (search "mission-3d-bg"); shapes/opacity/speed can be adjusted there. */}
      {/* <div className="mission-3d-bg" aria-hidden>
        <div className="mission-3d-bg-inner">
          <div className="mission-cube mission-cube-1">
            <div className="mission-cube-inner">
              <div className="mission-cube-face mission-cube-face-front" />
              <div className="mission-cube-face mission-cube-face-back" />
              <div className="mission-cube-face mission-cube-face-right" />
              <div className="mission-cube-face mission-cube-face-left" />
              <div className="mission-cube-face mission-cube-face-top" />
              <div className="mission-cube-face mission-cube-face-bottom" />
            </div>
          </div>
          <div className="mission-cube mission-cube-2">
            <div className="mission-cube-inner">
              <div className="mission-cube-face mission-cube-face-front" />
              <div className="mission-cube-face mission-cube-face-back" />
              <div className="mission-cube-face mission-cube-face-right" />
              <div className="mission-cube-face mission-cube-face-left" />
              <div className="mission-cube-face mission-cube-face-top" />
              <div className="mission-cube-face mission-cube-face-bottom" />
            </div>
          </div>
          <div className="mission-cube mission-cube-3">
            <div className="mission-cube-inner">
              <div className="mission-cube-face mission-cube-face-front" />
              <div className="mission-cube-face mission-cube-face-back" />
              <div className="mission-cube-face mission-cube-face-right" />
              <div className="mission-cube-face mission-cube-face-left" />
              <div className="mission-cube-face mission-cube-face-top" />
              <div className="mission-cube-face mission-cube-face-bottom" />
            </div>
          </div>
          <div className="mission-cube mission-cube-4">
            <div className="mission-cube-inner">
              <div className="mission-cube-face mission-cube-face-front" />
              <div className="mission-cube-face mission-cube-face-back" />
              <div className="mission-cube-face mission-cube-face-right" />
              <div className="mission-cube-face mission-cube-face-left" />
              <div className="mission-cube-face mission-cube-face-top" />
              <div className="mission-cube-face mission-cube-face-bottom" />
            </div>
          </div>
        </div>
      </div> */}

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

          {/* Mission Statement – same card style as Board-Certified Guarantee */}
          <div className="max-w-5xl mx-auto" style={animationStyle(200)}>
            <Card
              className="group relative overflow-hidden rounded-lg transition-all duration-500 ease-out data-scroll-exclude bg-white/50 backdrop-blur-xl border border-gray-200/80 -translate-y-3 shadow-2xl shadow-black/15 hover:-translate-y-5 hover:shadow-[0_28px_60px_-12px_rgba(15,95,168,0.25),0_0_0_1px_rgba(15,95,168,0.08)] hover:border-brand-dark-blue/60 hover:scale-[1.02] hover:bg-white/75"
            >
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
              {/* Button-style shine sweep on hover (same as Board-Certified Guarantee card) */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out pointer-events-none z-0" aria-hidden />
              <CardContent className="relative z-10 p-8 md:p-10 lg:p-12">
                <p className="text-lg md:text-xl lg:text-2xl text-gray-800 font-normal leading-relaxed text-center tracking-normal relative">
                  <span className="absolute -left-4 md:-left-6 -top-2 md:-top-4 text-6xl md:text-7xl lg:text-8xl text-brand-teal/30 font-serif leading-none" aria-hidden="true">&ldquo;</span>
                  <span className="relative z-10">Our mission is to empower the community by connecting patients with Independent Physicians who provide <span className="text-brand-teal font-medium">accessible, affordable, and high-quality healthcare</span> through patient empowerment and education.</span>
                  <span className="absolute -right-4 md:-right-6 -bottom-2 md:-bottom-4 text-6xl md:text-7xl lg:text-8xl text-brand-teal/30 font-serif leading-none" aria-hidden="true">&rdquo;</span>
                </p>
              </CardContent>
            </Card>
          </div>

          {/* View Governance Bylaws */}
          <div className="mt-10 md:mt-12 text-center" style={animationStyle(400)}>
            <Link
              href="/policies/governance-bylaws.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 px-6 py-3 bg-brand-dark-blue text-white rounded-lg hover:bg-brand-dark-blue/90 transition-colors duration-300 shadow-md hover:shadow-lg"
            >
              <FileText className="h-5 w-5" aria-hidden="true" />
              <span className="font-semibold">View Governance Bylaws</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
