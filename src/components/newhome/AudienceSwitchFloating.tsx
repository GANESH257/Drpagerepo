'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export function AudienceSwitchFloating() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const [hoveredSide, setHoveredSide] = useState<'left' | 'right' | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLElement>(null);

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
      { threshold: 0.2 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const animationStyle = (delay: number) => ({
    opacity: isVisible ? 1 : 0,
    transform: isVisible && !prefersReducedMotion ? 'translateY(0)' : 'translateY(30px)',
    transition: prefersReducedMotion
      ? 'opacity 0.3s ease'
      : `opacity 0.8s ease-out ${delay}s, transform 0.8s ease-out ${delay}s`,
  });

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      e.preventDefault();
      const nextIndex = e.key === 'ArrowLeft' ? (index === 0 ? 1 : 0) : (index === 0 ? 1 : 0);
      setFocusedIndex(nextIndex);
      const buttons = containerRef.current?.querySelectorAll('a');
      if (buttons && buttons[nextIndex]) {
        (buttons[nextIndex] as HTMLElement).focus();
      }
    }
  };

  return (
    <section
      ref={containerRef}
      className="relative z-20 overflow-hidden"
      role="group"
      aria-label="Choose your portal"
    >
      <div className="flex flex-col md:flex-row min-h-[400px] md:min-h-[500px]">
        {/* Left: For Patients - Background covers whole half */}
        <div
          className={cn(
            'relative overflow-hidden group cursor-pointer transition-all duration-500 ease-in-out',
            hoveredSide === 'left' ? 'md:flex-[1.5]' : hoveredSide === 'right' ? 'md:flex-[0.5]' : 'md:flex-1'
          )}
          onMouseEnter={() => setHoveredSide('left')}
          onMouseLeave={() => setHoveredSide(null)}
          onKeyDown={(e) => handleKeyDown(e, 0)}
          role="button"
          tabIndex={0}
          aria-label="For Patients - Find independent physicians"
        >
          {/* Background Image - covers entire left half */}
          <div className="absolute inset-0 z-0">
            <Image
              src="/for_pt.png"
              alt="Patients"
              fill
              className={cn(
                "object-cover transition-transform duration-500 blur-sm",
                hoveredSide === 'left' ? 'scale-110 blur-0' : 'scale-100'
              )}
              priority
            />
          </div>
          
          {/* Green Overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#10B981]/80 via-[#10B981]/70 to-[#059669]/85 z-10 group-hover:from-[#10B981]/75 group-hover:via-[#10B981]/65 group-hover:to-[#059669]/80 transition-all duration-300" />
          
          {/* Content */}
          <div className="relative z-20 flex flex-col items-center justify-center text-center h-full p-6 md:p-8 lg:p-10">
            <h3
              className="text-sm md:text-base font-medium text-white mb-2 uppercase tracking-wide"
              style={animationStyle(0.2)}
            >
              For Patients
            </h3>
            <h4
              className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-3 md:mb-4 leading-tight max-w-md"
              style={animationStyle(0.3)}
            >
              Find your provider
            </h4>
            <p
              className="text-base md:text-lg text-white/90 mb-6 md:mb-8 leading-relaxed max-w-md"
              style={animationStyle(0.4)}
            >
              Experience excellence. Personal Care
            </p>
            <div style={animationStyle(0.5)}>
              <Button
                asChild
                className={cn(
                  'w-full sm:w-auto bg-white text-[#059669] border-2 border-white hover:bg-white/90 hover:border-white/80',
                  'focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2',
                  'transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 font-semibold'
                )}
                size="lg"
              >
                <Link href="/patients">
                  Access Care
                  <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Right: For Physicians - Background covers whole half */}
        <div
          className={cn(
            'relative overflow-hidden group cursor-pointer transition-all duration-500 ease-in-out',
            hoveredSide === 'right' ? 'md:flex-[1.5]' : hoveredSide === 'left' ? 'md:flex-[0.5]' : 'md:flex-1'
          )}
          onMouseEnter={() => setHoveredSide('right')}
          onMouseLeave={() => setHoveredSide(null)}
          onKeyDown={(e) => handleKeyDown(e, 1)}
          role="button"
          tabIndex={0}
          aria-label="For Physicians - Join a trusted alliance"
        >
          {/* Background Image - covers entire right half */}
          <div className="absolute inset-0 z-0">
            <Image
              src="/for_dr.png"
              alt="Physicians"
              fill
              className={cn(
                "object-cover transition-transform duration-500 blur-sm",
                hoveredSide === 'right' ? 'scale-110 blur-0' : 'scale-100'
              )}
              priority
            />
          </div>
          
          {/* Blue Overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-brand-dark-blue/80 via-brand-dark-blue/70 to-brand-dark-blue/85 z-10 group-hover:from-brand-dark-blue/75 group-hover:via-brand-dark-blue/65 group-hover:to-brand-dark-blue/80 transition-all duration-300" />
          
          {/* Content */}
          <div className="relative z-20 flex flex-col items-center justify-center text-center h-full p-6 md:p-8 lg:p-10">
            <h3
              className="text-sm md:text-base font-medium text-white mb-2 uppercase tracking-wide"
              style={animationStyle(0.2)}
            >
              For Physicians
            </h3>
            <h4
              className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-3 md:mb-4 leading-tight max-w-md"
              style={animationStyle(0.3)}
            >
              Empower your practice
            </h4>
            <p
              className="text-base md:text-lg text-white/90 mb-6 md:mb-8 leading-relaxed max-w-md"
              style={animationStyle(0.4)}
            >
              Connect with peers. Lead with autonomy
            </p>
            <div style={animationStyle(0.5)}>
              <Button
                asChild
                className={cn(
                  'w-full sm:w-auto bg-white text-brand-dark-blue border-2 border-white hover:bg-white/90 hover:border-white/80',
                  'focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2',
                  'transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105'
                )}
                size="lg"
              >
                <Link href="/physicians">
                  Join Us
                  <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
