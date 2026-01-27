'use client';

import { useEffect, useRef, useState } from 'react';

export function MissionStatement() {
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
      transition: `opacity 1.8s ease-out ${delay}ms, transform 1.8s ease-out ${delay}ms`,
    };
  };

  return (
    <section ref={sectionRef} className="py-16 md:py-24 relative overflow-hidden skin-mission-enhanced">
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="max-w-4xl mx-auto">
          <h2 
            className="text-3xl md:text-4xl lg:text-3xl font-bold mb-10 md:mb-12 text-center text-brand-dark-blue tracking-tight"
            style={{
              ...animationStyle(0),
              transform: isVisible && !prefersReducedMotion ? 'translateY(0) scale(1)' : 'translateY(30px) scale(0.95)',
              transition: prefersReducedMotion ? 'opacity 0.3s ease' : 'opacity 1.8s ease-out 0.5s, transform 1.8s ease-out 0.5s',
            }}
          >
            Our Mission
          </h2>
          <div className="prose prose-lg max-w-none">
            <p 
              className="text-base md:text-lg lg:text-xl leading-relaxed mb-6 md:mb-8 text-gray-700 max-w-3xl mx-auto"
              style={{
                ...animationStyle(300),
                transform: isVisible && !prefersReducedMotion ? 'translateY(0)' : 'translateY(20px)',
                transition: prefersReducedMotion ? 'opacity 0.3s ease' : 'opacity 1.8s ease-out 0.8s, transform 1.8s ease-out 0.8s',
              }}
            >
              At Alliance of Indpendent Physicians, our team of highly skilled
              physicians brings together hundreds of years of combined experience
              across a wide range of medical specialties. Our doctors are
              leaders in their fields—respected for their expertise, compassion,
              and dedication to providing exceptional, patient-focused care.
            </p>
            <p 
              className="text-base md:text-lg lg:text-xl leading-relaxed mb-6 md:mb-8 text-gray-700 max-w-3xl mx-auto"
              style={{
                ...animationStyle(600),
                transform: isVisible && !prefersReducedMotion ? 'translateY(0)' : 'translateY(20px)',
                transition: prefersReducedMotion ? 'opacity 0.3s ease' : 'opacity 1.8s ease-out 1.1s, transform 1.8s ease-out 1.1s',
              }}
            >
              Each member of our medical team is committed to helping patients
              achieve better health outcomes through advanced diagnostics,
              personalized treatment plans, and evidence-based medicine.
            </p>
            <p 
              className="text-base md:text-lg lg:text-xl leading-relaxed text-gray-700 max-w-3xl mx-auto"
              style={{
                ...animationStyle(900),
                transform: isVisible && !prefersReducedMotion ? 'translateY(0)' : 'translateY(20px)',
                transition: prefersReducedMotion ? 'opacity 0.3s ease' : 'opacity 1.8s ease-out 1.4s, transform 1.8s ease-out 1.4s',
              }}
            >
              Learn more about our physicians and the specialties they represent
              below.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
